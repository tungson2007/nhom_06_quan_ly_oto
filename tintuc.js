/* NHOM06 - tintuc.js : danh sách tin (lọc danh mục, phân trang) và chi tiết bài (?id=) */
const root = document.getElementById("newsRoot");
const params = new URLSearchParams(location.search);
const PER_PAGE = 6;
let category = NEWS_CATEGORIES.includes(params.get("cat")) ? params.get("cat") : "";
let page = 1;

function metaHTML(n) { return `<div class="news-meta"><span class="badge">${esc(n.category)}</span><span>${formatDate(n.date)}</span></div>`; }
function newsCard(n) {
  return `<article class="news-card">
    <div class="news-card__media">${imageBlock(n.image, n.title)}</div>
    <div class="news-card__body">${metaHTML(n)}<h3>${esc(n.title)}</h3><p>${esc(n.excerpt)}</p>
      <a class="news-more" href="?id=${n.id}">Đọc tiếp <i class="fa-solid fa-arrow-right"></i></a></div>
  </article>`;
}

// ================= DANH SÁCH =================
function renderList() {
  document.title = "Tin tức & đánh giá xe | NHOM06";
  const list = NEWS.filter(n => !category || n.category === category).sort((a, b) => new Date(b.date) - new Date(a.date));
  const [feature, ...rest] = list;
  const totalPages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  if (page > totalPages) page = totalPages;
  const items = rest.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const chips = ["", ...NEWS_CATEGORIES].map(c =>
    `<button class="cat-chip ${c === category ? "active" : ""}" type="button" data-cat="${esc(c)}">${c || "Tất cả"}</button>`).join("");
  let pager = "";
  if (totalPages > 1) for (let i = 1; i <= totalPages; i++) pager += `<button class="page-btn ${i === page ? "active" : ""}" data-page="${i}">${i}</button>`;

  root.innerHTML = `
    <h1 class="news-title">Tin tức &amp; đánh giá xe</h1>
    <div class="cat-chips">${chips}</div>
    <div class="news-layout">
      <div>
        ${!list.length ? '<div class="empty"><i class="fa-regular fa-newspaper"></i><h3>Chưa có bài viết trong danh mục này</h3></div>' : ""}
        ${feature && page === 1 ? `<article class="feature">
            <div class="feature__media">${imageBlock(feature.image, feature.title)}</div>
            <div class="feature__body">${metaHTML(feature)}<h2>${esc(feature.title)}</h2><p>${esc(feature.excerpt)}</p>
              <a class="btn btn--primary btn--sm" style="align-self:flex-start" href="?id=${feature.id}">Đọc tiếp</a></div></article>` : ""}
        <div class="news-grid">${items.map(newsCard).join("")}</div>
        <nav class="pagination" aria-label="Phân trang">${pager}</nav>
      </div>
      <aside class="sidebar">
        <div class="form-card"><h3>Danh mục</h3><ul class="side-links">
          ${NEWS_CATEGORIES.map(c => `<li><button type="button" data-cat="${esc(c)}"><span>${esc(c)}</span><span class="note">${NEWS.filter(n => n.category === c).length}</span></button></li>`).join("")}
        </ul></div>
        <div class="form-card"><h3>Bài được đề xuất</h3><ul class="side-links">
          ${NEWS.slice(0, 4).map(n => `<li><a href="?id=${n.id}">${esc(n.title)}</a></li>`).join("")}
        </ul></div>
      </aside>
    </div>`;
}

// ================= CHI TIẾT BÀI =================
function renderArticle(n) {
  document.title = n.title + " | NHOM06";
  document.getElementById("breadcrumb").innerHTML =
    `<li><a href="../trangchu.html">Trang chủ</a></li><li><a href="tintuc.html">Tin tức</a></li><li>${esc(n.category)}</li>`;
    const sections = n.sections.map((s, i) => `
    <h2>${esc(s.h)}</h2><p>${esc(s.p)}</p>
    ${i === 0 && n.category !== "Thư viện ảnh" ? `<div class="article__img">${imageBlock("", "Ảnh minh họa " + n.title)}</div>` : ""}`).join("");
  // Bài thuộc "Thư viện ảnh": hiện lưới ảnh (khung giữ chỗ, nhóm thay bằng ảnh thật)
  const gallery = n.category === "Thư viện ảnh"
    ? `<div class="gallery-grid">${Array.from({ length: 6 }, (_, i) => `<div>${imageBlock("", "Ảnh " + (i + 1))}</div>`).join("")}</div>` : "";
  const related = NEWS.filter(x => x.id !== n.id).sort((a, b) => (b.category === n.category) - (a.category === n.category)).slice(0, 3);

  root.innerHTML = `
    <article class="article">
      ${metaHTML(n)}
      <h1>${esc(n.title)}</h1>
      <div class="article__cover">${imageBlock(n.image, n.title)}</div>
      <p><em>${esc(n.excerpt)}</em></p>
      ${sections}${gallery}
      <div class="article__actions">
        <a class="btn btn--outline" href="tintuc.html"><i class="fa-solid fa-arrow-left"></i> Quay lại danh sách</a>
        
      </div>
    </article>
    <h2 class="section__title" style="margin:48px 0 20px;font-size:26px">Bài viết liên quan</h2>
    <div class="news-grid" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">${related.map(newsCard).join("")}</div>`;

  document.getElementById("shareBtn").addEventListener("click", () => {
    if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(() => showToast("Đã sao chép liên kết", "success"), () => showToast("Không sao chép được", "error"));
    else showToast("Trình duyệt không hỗ trợ sao chép", "error");
  });
}

// ================= ĐIỀU HƯỚNG =================
const idParam = params.get("id");
if (idParam) {
  const n = NEWS.find(x => x.id === Number(idParam));
  if (n) renderArticle(n);
  else root.innerHTML = '<div class="empty" style="padding:72px 12px"><i class="fa-regular fa-circle-question"></i><h2>Không tìm thấy bài viết</h2><a class="btn btn--primary" href="tintuc.html" style="margin-top:14px">Về danh sách tin</a></div>';
} else {
  renderList();
  root.addEventListener("click", e => {
    const c = e.target.closest("[data-cat]");
    if (c) { category = c.dataset.cat; page = 1; renderList(); }
    const p = e.target.closest("[data-page]");
    if (p) { page = Number(p.dataset.page); renderList(); window.scrollTo({ top: 0, behavior: "smooth" }); }
  });
}
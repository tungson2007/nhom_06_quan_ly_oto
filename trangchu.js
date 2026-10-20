/* ==========================================================
   NHOM06 - trangchu.js : logic riêng của trang chủ
   Cần nạp sau data.js và common.js
   ========================================================== */

// ----- Thống kê mẫu ở hero -----
document.getElementById("statCars").textContent = CARS.length;
document.getElementById("statBrands").textContent = BRANDS.length;

// ----- Đổ dữ liệu vào các ô chọn của thanh tìm kiếm nhanh -----
const qsBrand = document.getElementById("qsBrand");
const qsType = document.getElementById("qsType");
BRANDS.forEach(b => qsBrand.add(new Option(b, b)));
CAR_TYPES.forEach(t => qsType.add(new Option(t.name, t.name)));

// ----- Tìm kiếm nhanh: chuyển sang trang danh sách kèm điều kiện trên URL -----
document.getElementById("quickSearch").addEventListener("submit", e => {
  e.preventDefault();
  const params = new URLSearchParams();
  // Xóa khoảng trắng thừa ở từ khóa
  const q = document.getElementById("qsKeyword").value.trim().replace(/\s+/g, " ");
  if (q) params.set("q", q);
  if (qsBrand.value) params.set("brand", qsBrand.value);
  if (qsType.value) params.set("type", qsType.value);
  const price = document.getElementById("qsPrice").value; // dạng "min-max"
  if (price) {
    const [min, max] = price.split("-");
    if (min) params.set("min", min);
    if (max) params.set("max", max);
  }
  const query = params.toString();
  location.href = URLS.cars + (query ? "?" + query : "");
});

// ----- Danh mục xe -----
document.getElementById("categories").innerHTML = CAR_TYPES.map(t =>
  `<a class="cat" href="${URLS.cars}?type=${encodeURIComponent(t.name)}"><i class="fa-solid ${t.icon}"></i>${esc(t.name)}</a>`
).join("");

// ----- Xe nổi bật (tối đa 8 xe có featured = true) -----
document.getElementById("featuredCars").innerHTML =
  CARS.filter(c => c.featured).slice(0, 8).map(carCardHTML).join("");
refreshCompareUI(); // cập nhật trạng thái nút So sánh cho các card vừa tạo

// ----- Thương hiệu: chỉ dùng tên chữ -----
document.getElementById("brandList").innerHTML = BRANDS.map(b =>
  `<a class="brand" href="${URLS.cars}?brand=${encodeURIComponent(b)}">${esc(b)}</a>`
).join("");

// ----- Khuyến mãi: trạng thái tính theo ngày hiện tại -----
document.getElementById("promoList").innerHTML = PROMOTIONS.slice(0, 3).map(p => {
  const st = getPromoStatus(p);
  return `
  <article class="promo">
    <div class="promo__media">${imageBlock(p.image, p.title)}</div>
    <div class="promo__body">
      <span class="badge ${st.cls}" style="align-self:flex-start">${st.text}</span>
      <h3>${esc(p.title)}</h3>
      <p class="promo__discount">${esc(p.discount)}</p>
      <p>${esc(p.desc)}</p>
      <p class="promo__time"><i class="fa-regular fa-calendar"></i> ${formatDate(p.start)} – ${formatDate(p.end)}</p>
      <a class="btn btn--outline btn--sm" href="${URLS.promo}">Xem chi tiết</a>
    </div>
  </article>`;
}).join("");

// ----- Tin tức: 1 bài nổi bật + 3 bài phụ -----
const [mainNews, ...otherNews] = NEWS;
document.getElementById("newsList").innerHTML = `
  <article class="news-main">
    <div class="news-main__media">${imageBlock(mainNews.image, mainNews.title)}</div>
    <div class="news-main__body">
      <div class="news-meta"><span class="badge">${esc(mainNews.category)}</span><span>${formatDate(mainNews.date)}</span></div>
      <h3>${esc(mainNews.title)}</h3>
      <p>${esc(mainNews.excerpt)}</p>
      <a class="news-more" href="${URLS.news}?id=${mainNews.id}">Đọc tiếp <i class="fa-solid fa-arrow-right"></i></a>
    </div>
  </article>
  <div class="news-side">
    ${otherNews.slice(0, 3).map(n => `
      <article class="news-item">
        <div class="news-item__media">${imageBlock(n.image, n.title)}</div>
        <div>
          <div class="news-meta"><span class="badge">${esc(n.category)}</span><span>${formatDate(n.date)}</span></div>
          <h3>${esc(n.title)}</h3>
          <a class="news-more" href="${URLS.news}?id=${n.id}">Đọc tiếp</a>
        </div>
      </article>`).join("")}
  </div>`;
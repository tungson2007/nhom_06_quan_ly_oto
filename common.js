/* ==========================================================
   NHOM06 - common.js : CODE DÙNG CHUNG CHO MỌI TRANG
   Gồm: đường dẫn, localStorage an toàn, header/footer,
   so sánh xe, toast, card xe, nút lên đầu trang.
   Mỗi trang HTML cần có: <div id="site-header"></div> và <div id="site-footer"></div>
   Thứ tự nạp script: data.js -> common.js -> file js của trang
   ========================================================== */

// ----- 1. ĐƯỜNG DẪN: trangchu.html ở gốc, các trang khác nằm trong /trang/ -----
const ROOT = location.pathname.includes("/trang/") ? "../" : "";
const PAGE = ROOT ? "" : "trang/";
const URLS = {
  home: ROOT + "trangchu.html",
  cars: PAGE + "danhsachxe.html",
  promo: PAGE + "khuyenmai.html",
  news: PAGE + "tintuc.html",
  contact: PAGE + "lienhe.html",
  order: PAGE + "datxe.html",
  post: PAGE + "dangtin.html",
  login: PAGE + "dangnhap.html",
  detail: PAGE + "chitietxe.html",
  advice: PAGE + "tuvan.html",
  history: PAGE + "lichsudon.html",
  about: PAGE + "gioithieu.html",
  review: PAGE + "danhgiaxe.html"
};

// ----- 2. TIỆN ÍCH -----
// Chống chèn HTML khi in dữ liệu ra giao diện
function esc(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}
function formatPrice(value) {
  return Number(value).toLocaleString("vi-VN") + " đ";
}
function formatDate(iso) {
  const d = new Date(iso);
  return isNaN(d) ? "" : d.toLocaleDateString("vi-VN");
}
// Đọc/ghi localStorage an toàn (không làm hỏng trang nếu dữ liệu lỗi)
const store = {
  get(key, fallback = []) {
    try {
      const data = JSON.parse(localStorage.getItem(key));
      return Array.isArray(fallback) && !Array.isArray(data) ? fallback : (data ?? fallback);
    } catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { console.warn("Không ghi được localStorage"); }
  }
};
// Ảnh xe: nếu chưa có đường dẫn thì hiện khung giữ chỗ
function imageBlock(src, alt) {
  return src
    ? `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`
    : `<div class="img-ph" role="img" aria-label="${esc(alt)}"><i class="fa-solid fa-car-side"></i><span>Thêm ảnh trong data.js</span></div>`;
}
function getCarById(id) { return CARS.find(c => c.id === Number(id)); }

// ----- 2b. KIỂM TRA FORM DÙNG CHUNG -----
// Số điện thoại Việt Nam cơ bản: 0xxxxxxxxx hoặc +84xxxxxxxxx (10 số)
const isPhone = v => /^(0|\+84)\d{9}$/.test(v.replace(/[\s.-]/g, ""));
const isEmail = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
// Hiện / xóa lỗi ngay cạnh ô nhập (có icon + chữ, không chỉ dùng màu)
function setFieldError(id, message) {
  const input = document.getElementById(id);
  if (!input) return;
  const field = input.closest(".field");
  let err = field.querySelector(".field__error");
  if (!err) {
    err = document.createElement("span");
    err.className = "field__error";
    err.setAttribute("role", "alert");
    field.appendChild(err);
  }
  field.classList.toggle("field--error", !!message);
  err.textContent = message ? "⚠ " + message : "";
  input.setAttribute("aria-invalid", message ? "true" : "false");
}
// rules: [{ id, check: value => "" nếu hợp lệ, hoặc câu báo lỗi }]
// Trả về true nếu tất cả hợp lệ; nếu sai thì đưa con trỏ tới ô lỗi đầu tiên
function validateFields(rules) {
  let first = null;
  rules.forEach(r => {
    const el = document.getElementById(r.id);
    const msg = r.check(el.value.trim());
    setFieldError(r.id, msg);
    if (msg && !first) first = el;
  });
  if (first) first.focus();
  return !first;
}
// Sinh mã duy nhất, ví dụ DH-2026-0001. Bộ đếm lưu riêng nên xóa đơn cũng không trùng mã.
function nextCode(prefix) {
  const key = "nhom06_counter_" + prefix;
  const n = (Number(store.get(key, 0)) || 0) + 1;
  store.set(key, n);
  return `${prefix}-${new Date().getFullYear()}-${String(n).padStart(4, "0")}`;
}
// Ẩn bớt số điện thoại khi hiển thị lại (tránh lộ dữ liệu không cần thiết)
function maskPhone(p) { return String(p).slice(0, -3).replace(/\d/g, "•") + String(p).slice(-3); }
// Xóa lỗi của ô ngay khi người dùng gõ lại
document.addEventListener("input", e => {
  if (e.target.id && e.target.closest(".field--error")) setFieldError(e.target.id, "");
});

// Trạng thái khuyến mãi tính theo NGÀY HIỆN TẠI của trình duyệt (dùng ở trang chủ + khuyến mãi)
function getPromoStatus(promo) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (today < new Date(promo.start)) return { key: "upcoming", text: "Sắp diễn ra", cls: "badge--warning" };
  if (today > new Date(promo.end)) return { key: "ended", text: "Đã kết thúc", cls: "badge--muted" };
  return { key: "ongoing", text: "Đang diễn ra", cls: "badge--success" };
}

// ----- 3. TOAST -----
function showToast(message, type = "info") {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
  const toast = document.createElement("div");
  toast.className = "toast toast--" + type;
  toast.setAttribute("role", "status");
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ----- 4. SO SÁNH XE (tối đa 3, lưu localStorage) -----
const COMPARE_KEY = "nhom06_compare";
const COMPARE_MAX = 3;
function getCompare() { return store.get(COMPARE_KEY, []).filter(id => getCarById(id)); }
function toggleCompare(id) {
  id = Number(id);
  let list = getCompare();
  if (list.includes(id)) {
    list = list.filter(x => x !== id);
    showToast("Đã xóa khỏi danh sách so sánh");
  } else {
    if (list.length >= COMPARE_MAX) { showToast("Chỉ so sánh tối đa " + COMPARE_MAX + " xe", "error"); return; }
    list.push(id);
    showToast("Đã thêm vào so sánh", "success");
  }
  store.set(COMPARE_KEY, list);
  refreshCompareUI();
}
// Cập nhật số đếm trên header + trạng thái nút So sánh trên các card
function refreshCompareUI() {
  const list = getCompare();
  const badge = document.getElementById("compareCount");
  if (badge) badge.textContent = list.length;
  document.querySelectorAll("[data-compare]").forEach(btn => {
    const on = list.includes(Number(btn.dataset.compare));
    btn.classList.toggle("is-compared", on);
    btn.innerHTML = on ? '<i class="fa-solid fa-check"></i> Đã chọn' : '<i class="fa-solid fa-scale-balanced"></i> So sánh';
  });
  renderCompareModal();
}
function renderCompareModal() {
  const body = document.getElementById("compareBody");
  if (!body) return;
  const list = getCompare();
  if (!list.length) {
    body.innerHTML = '<div class="empty"><i class="fa-solid fa-scale-balanced"></i><p>Chưa chọn xe nào để so sánh.</p></div>';
    return;
  }
  // Bảng so sánh các thông số cơ bản
  const cars = list.map(getCarById);
  const rows = [["Hãng", "brand"], ["Năm", "year"], ["Loại xe", "type"], ["Số chỗ", "seats"], ["Nhiên liệu", "fuel"], ["Hộp số", "transmission"]];
  body.innerHTML =
    `<div style="overflow-x:auto"><table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><th></th>${cars.map(c => `<th style="padding:8px;text-align:left">${esc(c.name)}<br><button class="btn btn--sm btn--outline" data-remove="${c.id}">Xóa</button></th>`).join("")}</tr>
      <tr><td style="padding:8px"><b>Giá</b></td>${cars.map(c => `<td style="padding:8px">${formatPrice(c.price)}</td>`).join("")}</tr>
      ${rows.map(r => `<tr><td style="padding:8px;border-top:1px solid var(--border)"><b>${r[0]}</b></td>${cars.map(c => `<td style="padding:8px;border-top:1px solid var(--border)">${esc(c[r[1]])}</td>`).join("")}</tr>`).join("")}
    </table></div><p class="note" style="margin-top:10px">Dữ liệu minh họa.</p>`;
}

// ----- 5. CARD XE (dùng lại ở trang chủ, danh sách, xe liên quan...) -----
function carCardHTML(car) {
  const badges = car.badges.map(b => `<span class="badge">${esc(b)}</span>`).join("");
  return `
  <article class="car-card">
    <div class="car-card__media">
      ${imageBlock(car.image, car.brand + " " + car.name)}
      <div class="car-card__badges">${badges}</div>
    </div>
    <div class="car-card__body">
      <span class="car-card__brand">${esc(car.brand)}</span>
      <h3 class="car-card__name">${esc(car.name)}</h3>
      <p class="car-card__meta">${esc(car.version)} · ${car.year}</p>
      <div class="car-card__specs">
        <span><i class="fa-solid fa-car-side"></i>${esc(car.type)}</span>
        <span><i class="fa-solid fa-gas-pump"></i>${esc(car.fuel)}</span>
        <span><i class="fa-solid fa-gears"></i>${esc(car.transmission)}</span>
      </div>
      <p class="car-card__price">${formatPrice(car.price)}</p>
      <div class="car-card__actions">
        <a class="btn btn--primary btn--sm" href="${URLS.detail}?id=${car.id}">Xem chi tiết</a>
        <button class="btn btn--outline btn--sm" type="button" data-compare="${car.id}"><i class="fa-solid fa-scale-balanced"></i> So sánh</button>
        <a class="btn btn--outline btn--sm" href="${URLS.order}?id=${car.id}">Đặt mua</a>
      </div>
    </div>
  </article>`;
}

// ----- 6. HEADER + FOOTER -----
const LOGO_SVG = `<svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="#2563EB"/><path d="M8 11l12 20L32 11" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 27h10" stroke="#93C5FD" stroke-width="3" stroke-linecap="round"/></svg>`;

function renderHeader() {
  const host = document.getElementById("site-header");
  if (!host) return;
  const file = location.pathname.split("/").pop() || "trangchu.html";
  const menu = [["Trang chủ", URLS.home], ["Danh sách xe", URLS.cars], ["Khuyến mãi", URLS.promo], ["Tin tức", URLS.news]];
  host.innerHTML = `
  <header class="site-header">
    <div class="container site-header__inner">
      <nav class="nav" id="mainNav" aria-label="Menu chính">
        ${menu.map(m => `<a href="${m[1]}" class="${m[1].split("/").pop() === file ? "active" : ""}">${m[0]}</a>`).join("")}
        <a class="nav-extra" href="${URLS.post}">Đăng tin</a><a class="nav-extra" href="${URLS.login}">Đăng nhập</a>
      </nav>
      <div class="header-actions">
        <a class="btn btn--primary btn--sm header-post" href="${URLS.post}"><i class="fa-solid fa-plus"></i><span class="btn-post-text">Đăng tin</span></a>
        <a class="icon-btn header-login" href="${URLS.login}" aria-label="Đăng nhập"><i class="fa-regular fa-user"></i></a>
        <button class="icon-btn menu-toggle" id="menuToggle" type="button" aria-label="Mở menu"><i class="fa-solid fa-bars"></i></button>
      </div>
    </div>
    <div class="search-bar" id="searchBar">
      <div class="container">
        <form id="headerSearch" role="search">
         <button class="icon-btn" id="searchToggle" type="button" aria-label="Tìm kiếm"><i class="fa-solid fa-magnifying-glass"></i></button>
         <button class="icon-btn" id="compareBtn" type="button" aria-label="So sánh xe"><i class="fa-solid fa-scale-balanced"></i><span class="compare-count" id="compareCount">0</span></button>
          <input class="input" id="headerSearchInput" type="search" placeholder="Nhập tên xe hoặc thương hiệu..." aria-label="Từ khóa tìm kiếm">
          <button class="btn btn--primary" type="submit">Tìm</button>
        </form>
      </div>
    </div>
  </header>
  <div class="modal" id="compareModal" role="dialog" aria-modal="true" aria-label="So sánh xe">
    <div class="modal__box">
      <div class="modal__head"><h3>So sánh xe (tối đa ${COMPARE_MAX})</h3><button class="icon-btn" style="background:#E5E7EB;color:#111" id="compareClose" type="button" aria-label="Đóng"><i class="fa-solid fa-xmark"></i></button></div>
      <div id="compareBody"></div>
    </div>
  </div>`;
  document.getElementById("menuToggle").addEventListener("click", () => document.getElementById("mainNav").classList.toggle("open"));
  document.getElementById("searchToggle").addEventListener("click", () => {
    document.getElementById("searchBar").classList.toggle("open");
    document.getElementById("headerSearchInput").focus();
  });
  document.getElementById("headerSearch").addEventListener("submit", e => {
    e.preventDefault();
    const q = document.getElementById("headerSearchInput").value.trim().replace(/\s+/g, " ");
    location.href = URLS.cars + (q ? "?q=" + encodeURIComponent(q) : "");
  });
  document.getElementById("compareBtn").addEventListener("click", () => document.getElementById("compareModal").classList.add("open"));
  document.getElementById("compareClose").addEventListener("click", () => document.getElementById("compareModal").classList.remove("open"));
  document.getElementById("compareModal").addEventListener("click", e => { if (e.target.id === "compareModal") e.target.classList.remove("open"); });
}

function renderFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;
  host.innerHTML = `
  <footer class="site-footer">
    <div class="container footer-grid">
      <div>
        <p class="footer-slogan">DRIVE YOUR FUTURE</p>
        <p style="font-size:14px">Website mô phỏng kinh doanh ô tô do nhóm sinh viên NHOM06 thực hiện cho bài tập lớn. Mọi dữ liệu đều là dữ liệu mẫu.</p>
      </div>
      <div><h4>Khám phá</h4><ul>
        <li><a href="${URLS.home}">Trang chủ</a></li><li><a href="${URLS.cars}">Danh sách xe</a></li><li><a href="${URLS.promo}">Khuyến mãi</a></li></ul></div>
      <div><h4>Dịch vụ</h4><ul>
        <li><a href="${URLS.cars}">Đặt mua xe</a></li><li><a href="${URLS.advice}">Tư vấn mua xe</a></li></ul></div>
      <div><h4>Thông tin</h4><ul>
        <li><a href="${URLS.about}">Giới thiệu</a></li>
        <li><i class="fa-solid fa-location-dot"></i> Showroom mẫu: </li>
        <li><i class="fa-solid fa-envelope"></i> nhom06@example.com</li>
        <li><i class="fa-solid fa-phone"></i> 000 000 000 (số mẫu)</li></ul></div>
    </div>
  </footer>
  <button class="to-top" id="toTop" type="button" aria-label="Lên đầu trang"><i class="fa-solid fa-arrow-up"></i></button>`;
  const topBtn = document.getElementById("toTop");
  window.addEventListener("scroll", () => topBtn.classList.toggle("show", window.scrollY > 400));
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

// ----- 7. KHỞI TẠO + sự kiện chung (event delegation) -----
document.addEventListener("DOMContentLoaded", () => {
  renderHeader();
  renderFooter();
  refreshCompareUI();
});
document.addEventListener("click", e => {
  const cmp = e.target.closest("[data-compare]");
  if (cmp) toggleCompare(cmp.dataset.compare);
  const rm = e.target.closest("[data-remove]");
  if (rm) toggleCompare(rm.dataset.remove);
});
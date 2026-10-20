/* ==========================================================
   NHOM06 - chitietxe.js : trang chi tiết xe động theo ?id=
   Thêm ảnh phụ cho xe: trong data.js, thêm vào xe đó
       gallery: ["images/xe-01-a.jpg", "images/xe-01-b.jpg", ...]
   Thêm mô tả / tiện nghi: thêm description: "..." và features: ["...", "..."]
   Trường nào chưa có dữ liệu thì trang không hiển thị (không bịa thông số).
   ========================================================== */
const root = document.getElementById("detailRoot");
const carId = new URLSearchParams(location.search).get("id");
const car = getCarById(carId);

if (!car) {
  // Không có id hoặc id sai -> trạng thái rỗng
  root.innerHTML = `
    <div class="container"><div class="empty" style="padding:72px 12px">
      <i class="fa-regular fa-circle-question"></i>
      <h2>Không tìm thấy xe</h2>
      <p>Mẫu xe bạn chọn không tồn tại hoặc đường dẫn chưa đúng.</p>
      <a class="btn btn--primary" href="danhsachxe.html" style="margin-top:14px">Về danh sách xe</a>
    </div></div>`;
} else {
  renderDetail();
}

function renderDetail() {
  document.title = `${car.brand} ${car.name} ${car.version} | NHOM06`;
  document.getElementById("breadcrumb").lastElementChild.textContent = `${car.brand} ${car.name}`;

  // Danh sách ảnh: ảnh chính + gallery, đủ tối thiểu 4 ô (ô thiếu ảnh dùng khung giữ chỗ)
  const images = [car.image, ...(car.gallery || [])];
  while (images.length < 0) images.push("");
  let current = 0;

  const badges = car.badges.map(b => `<span class="badge">${esc(b)}</span>`).join(" ");
  const description = car.description ||
    `${car.brand} ${car.name} phiên bản ${car.version} đời ${car.year} thuộc dòng ${car.type}, ${car.seats} chỗ ngồi, dùng nhiên liệu ${car.fuel.toLowerCase()} và hộp số ${car.transmission.toLowerCase()}.`;
  const specs = [
    ["Hãng xe", car.brand], ["Mẫu xe", car.name], ["Phiên bản", car.version], ["Năm sản xuất", car.year],
    ["Giá tham khảo", formatPrice(car.price)], ["Loại thân xe", car.type], ["Số chỗ ngồi", car.seats],
    ["Nhiên liệu", car.fuel], ["Hộp số", car.transmission], ["Động cơ", car.engine], ["Công suất", car.power]
  ].filter(row => row[1] !== undefined && row[1] !== "");

  const featuresHTML = (car.features && car.features.length)
    ? `<ul class="feature-list">${car.features.map(f => `<li>${esc(f)}</li>`).join("")}</ul>`
    : `<p class="note">Chưa có dữ liệu tiện nghi cho mẫu xe này. Thêm trường <code>features: ["..."]</code> vào data.js để hiển thị.</p>`;

  root.innerHTML = `
  <div class="container">
    <div class="detail">
      <div class="gallery">
        <button class="gallery__main" id="mainImg" type="button" aria-label="Phóng to ảnh"></button>
        <div class="gallery__thumbs" id="thumbs"></div>
      </div>
      <div class="info">
        <span class="info__brand">${esc(car.brand)}</span>
        <h1>${esc(car.name)} <small style="font-weight:500;color:var(--text-2);font-size:.55em">${esc(car.version)}</small></h1>
        <div>${badges} <span class="note">Năm ${car.year}</span></div>
        <p class="info__price">${formatPrice(car.price)}</p>
        <div class="info__quick">
          <div><i class="fa-solid fa-car-side"></i>${esc(car.type)}</div>
          <div><i class="fa-solid fa-users"></i>${car.seats} chỗ</div>
          <div><i class="fa-solid fa-gas-pump"></i>${esc(car.fuel)}</div>
          <div><i class="fa-solid fa-gears"></i>${esc(car.transmission)}</div>
        </div>
        <div class="info__actions">
          <a class="btn btn--primary" href="${URLS.order}?id=${car.id}">Đặt mua xe</a>
          <a class="btn btn--outline" href="${URLS.advice}?car=${car.id}">Nhận tư vấn</a>
          <a class="btn btn--outline" href="${URLS.post}?car=${car.id}">Đăng tin</a>
        </div>
      </div>
    </div>
    </div>
  </div>`;
  const mainBtn = document.getElementById("mainImg");
  const thumbsBox = document.getElementById("thumbs");
  function showImage(i) {
    current = (i + images.length) % images.length;
    mainBtn.innerHTML = imageBlock(images[current], `${car.brand} ${car.name} - ảnh ${current + 1}`) +
      '<span class="gallery__zoom"><i class="fa-solid fa-expand"></i> Phóng to</span>';
    thumbsBox.querySelectorAll(".thumb").forEach((t, idx) => t.classList.toggle("active", idx === current));
  }
  thumbsBox.innerHTML = images.map((src, i) =>
    `<button class="thumb" type="button" data-i="${i}" aria-label="Xem ảnh ${i + 1}">${imageBlock(src, `Ảnh ${i + 1}`)}</button>`).join("");
  thumbsBox.addEventListener("click", e => {
    const t = e.target.closest(".thumb");
    if (t) showImage(Number(t.dataset.i));
  });
  root.addEventListener("error", e => {
    if (e.target.tagName === "IMG") e.target.replaceWith(Object.assign(document.createElement("div"), { className: "img-ph", innerHTML: '<i class="fa-solid fa-car-side"></i><span>Không tải được ảnh</span>' }));
  }, true);
  showImage(0);

  // ----- Lightbox -----
  const lb = document.getElementById("lightbox");
  function lbShow(i) {
    showImage(i);
    document.getElementById("lbStage").innerHTML = imageBlock(images[current], `${car.name} - ảnh ${current + 1}`);
  }
  mainBtn.addEventListener("click", () => { lb.classList.add("open"); lbShow(current); });
  document.getElementById("lbPrev").addEventListener("click", () => lbShow(current - 1));
  document.getElementById("lbNext").addEventListener("click", () => lbShow(current + 1));
  document.getElementById("lbClose").addEventListener("click", () => lb.classList.remove("open"));
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
  document.addEventListener("keydown", e => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") lb.classList.remove("open");
    if (e.key === "ArrowLeft") lbShow(current - 1);
    if (e.key === "ArrowRight") lbShow(current + 1);
  });

  // ----- Tab -----
  document.querySelector(".tabs").addEventListener("click", e => {
    const tab = e.target.closest(".tab");
    if (!tab) return;
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === tab.dataset.tab));
  });
}
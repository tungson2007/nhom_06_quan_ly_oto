/* ==========================================================
   NHOM06 - danhsachxe.js : tìm kiếm + lọc + sắp xếp + phân trang
   Đọc điều kiện ban đầu từ URL: ?q=&brand=&type=&min=&max= (min/max tính bằng VNĐ)
   ========================================================== */
const PER_PAGE = 8;
let currentPage = 1;
const $ = id => document.getElementById(id);

// Các ô nhập và nhãn hiển thị trên chip (key -> id của input)
const FIELD_IDS = { q: "fKeyword", brand: "fBrand", type: "fType", min: "fMin", max: "fMax", year: "fYear", fuel: "fFuel", trans: "fTrans" };

// ----- 1. Đổ dữ liệu vào các ô chọn (lấy từ data.js, không viết tay) -----
function fillSelect(id, values) {
  const select = $(id);
  values.forEach(v => select.add(new Option(v, v)));
}
fillSelect("fBrand", BRANDS);
fillSelect("fType", CAR_TYPES.map(t => t.name));
fillSelect("fYear", [...new Set(CARS.map(c => c.year))].sort((a, b) => b - a));
fillSelect("fFuel", [...new Set(CARS.map(c => c.fuel))]);
fillSelect("fTrans", [...new Set(CARS.map(c => c.transmission))]);

// ----- 2. Đọc điều kiện từ URL (khi đi từ trang chủ sang) -----
(function applyUrlParams() {
  const p = new URLSearchParams(location.search);
  $("fKeyword").value = (p.get("q") || "").trim();
  if (p.get("brand")) $("fBrand").value = p.get("brand");
  if (p.get("type")) $("fType").value = p.get("type");
  // URL dùng VNĐ, ô nhập dùng triệu đồng
  if (p.get("min")) $("fMin").value = Math.round(Number(p.get("min")) / 1e6) || "";
  if (p.get("max")) $("fMax").value = Math.round(Number(p.get("max")) / 1e6) || "";
})();

// ----- 3. Lấy giá trị bộ lọc hiện tại -----
function readFilters() {
  const minM = parseFloat($("fMin").value);
  const maxM = parseFloat($("fMax").value);
  return {
    q: $("fKeyword").value.trim().replace(/\s+/g, " ").toLowerCase(), // bỏ khoảng trắng thừa, không phân biệt hoa/thường
    brand: $("fBrand").value,
    type: $("fType").value,
    min: isNaN(minM) ? 0 : Math.max(0, minM) * 1e6,
    max: isNaN(maxM) ? Infinity : Math.max(0, maxM) * 1e6,
    year: Number($("fYear").value) || 0,
    fuel: $("fFuel").value,
    trans: $("fTrans").value,
    sort: $("fSort").value
  };
}

// ----- 4. Lọc: các điều kiện kết hợp với nhau (AND) -----
function filterCars(f) {
  const words = f.q ? f.q.split(" ") : [];
  return CARS.filter(car => {
    const text = [car.brand, car.name, car.version, car.type, car.fuel, car.transmission, car.year].join(" ").toLowerCase();
    return words.every(w => text.includes(w))
      && (!f.brand || car.brand === f.brand)
      && (!f.type || car.type === f.type)
      && car.price >= f.min && car.price <= f.max
      && (!f.year || car.year >= f.year)
      && (!f.fuel || car.fuel === f.fuel)
      && (!f.trans || car.transmission === f.trans);
  });
}

// ----- 5. Sắp xếp (làm trên bản sao để không đổi mảng gốc) -----
function sortCars(list, sort) {
  const arr = [...list];
  if (sort === "price-asc") arr.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") arr.sort((a, b) => b.price - a.price);
  if (sort === "name") arr.sort((a, b) => a.name.localeCompare(b.name, "vi"));
  if (sort === "year-desc") arr.sort((a, b) => b.year - a.year || a.price - b.price);
  return arr;
}

// ----- 6. Chip điều kiện đang áp dụng (có nút xóa từng điều kiện) -----
function renderChips(f) {
  const labels = [];
  if (f.q) labels.push(["q", "Từ khóa: " + $("fKeyword").value.trim().replace(/\s+/g, " ")]);
  if (f.brand) labels.push(["brand", f.brand]);
  if (f.type) labels.push(["type", f.type]);
  if (f.min > 0) labels.push(["min", "Từ " + f.min / 1e6 + " triệu"]);
  if (f.max !== Infinity) labels.push(["max", "Đến " + f.max / 1e6 + " triệu"]);
  if (f.year) labels.push(["year", "Từ năm " + f.year]);
  if (f.fuel) labels.push(["fuel", f.fuel]);
  if (f.trans) labels.push(["trans", f.trans]);
  $("activeChips").innerHTML = labels.map(l =>
    `<button class="chip" type="button" data-clear="${l[0]}">${esc(l[1])} <i class="fa-solid fa-xmark"></i></button>`
  ).join("") + (labels.length > 1 ? '<button class="chip" type="button" data-clear="all">Xóa tất cả</button>' : "");
}

// ----- 7. Phân trang -----
function renderPagination(totalPages) {
  const box = $("pagination");
  if (totalPages <= 1) { box.innerHTML = ""; return; }
  let html = `<button class="page-btn" data-page="${currentPage - 1}" ${currentPage === 1 ? "disabled" : ""} aria-label="Trang trước"><i class="fa-solid fa-chevron-left"></i></button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}" ${i === currentPage ? 'aria-current="page"' : ""}>${i}</button>`;
  }
  html += `<button class="page-btn" data-page="${currentPage + 1}" ${currentPage === totalPages ? "disabled" : ""} aria-label="Trang sau"><i class="fa-solid fa-chevron-right"></i></button>`;
  box.innerHTML = html;
}

// ----- 8. Hàm vẽ chính: lọc -> sắp xếp -> cắt trang -> hiển thị -----
function render() {
  const f = readFilters();

  // Kiểm tra khoảng giá hợp lệ
  const invalidPrice = f.min > f.max;
  $("priceError").textContent = invalidPrice ? "Giá thấp nhất không được lớn hơn giá cao nhất." : "";

  const result = invalidPrice ? [] : sortCars(filterCars(f), f.sort);
  const totalPages = Math.max(1, Math.ceil(result.length / PER_PAGE));
  if (currentPage > totalPages) currentPage = totalPages; // tránh trang trống khi kết quả giảm

  const pageItems = result.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  $("resultCount").textContent = result.length + " xe phù hợp";
  renderChips(f);

  if (!pageItems.length) {
    $("carGrid").innerHTML = `
      <div class="empty" style="grid-column:1/-1">
        <i class="fa-regular fa-face-frown"></i>
        <h3>Không tìm thấy xe phù hợp</h3>
        <p>Hãy thử thay đổi từ khóa hoặc nới rộng các điều kiện lọc.</p>
        <button class="btn btn--primary" type="button" data-clear="all" style="margin-top:14px">Xóa bộ lọc</button>
      </div>`;
  } else {
    $("carGrid").innerHTML = pageItems.map(carCardHTML).join("");
  }
  renderPagination(totalPages);
  refreshCompareUI();
}

// Mỗi lần đổi bộ lọc: về trang 1 rồi vẽ lại
function onFilterChange() { currentPage = 1; render(); }

// ----- 9. Sự kiện -----
// Ô gõ chữ/số lọc theo sự kiện "input"; ô chọn (select) lọc theo "change".
// Không dùng "change" cho ô gõ: nó chạy khi ô mất focus, làm danh sách vẽ lại đúng lúc người dùng bấm nút
// (nút cũ bị thay mới nên cú bấm đầu tiên bị mất).
$("filterForm").addEventListener("input", e => { if (e.target.tagName !== "SELECT") onFilterChange(); });
$("filterForm").addEventListener("change", e => { if (e.target.tagName === "SELECT") onFilterChange(); });
$("filterForm").addEventListener("submit", e => e.preventDefault());
$("fSort").addEventListener("change", onFilterChange);

function clearFilters(key) {
  const keys = key === "all" ? Object.keys(FIELD_IDS) : [key];
  keys.forEach(k => { $(FIELD_IDS[k]).value = ""; });
  onFilterChange();
}
$("filterReset").addEventListener("click", () => clearFilters("all"));
// Nút xóa chip + nút "Xóa bộ lọc" ở trạng thái rỗng (event delegation)
document.addEventListener("click", e => {
  const clear = e.target.closest("[data-clear]");
  if (clear) clearFilters(clear.dataset.clear);
  const pg = e.target.closest("[data-page]");
  if (pg && !pg.disabled) {
    currentPage = Number(pg.dataset.page);
    render();
    $("carGrid").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

// Drawer bộ lọc trên mobile
function toggleDrawer(open) {
  $("filterPanel").classList.toggle("open", open);
  $("filterOverlay").classList.toggle("open", open);
}
$("filterOpen").addEventListener("click", () => toggleDrawer(true));
$("filterClose").addEventListener("click", () => toggleDrawer(false));
$("filterApply").addEventListener("click", () => toggleDrawer(false));
$("filterOverlay").addEventListener("click", () => toggleDrawer(false));

document.addEventListener("DOMContentLoaded", render);
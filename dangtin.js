/* NHOM06 - dangtin.js : đăng tin bán xe (mô phỏng, lưu localStorage) */
const LISTINGS_KEY = "nhom06_listings";
const $ = id => document.getElementById(id);
const thisYear = new Date().getFullYear();

BRANDS.forEach(b => $("pBrand").add(new Option(b, b)));
$("pBrand").add(new Option("Hãng khác", "Hãng khác"));
const preset = getCarById(new URLSearchParams(location.search).get("car"));
if (preset) {
  $("pBrand").value = preset.brand; $("pModel").value = preset.name;
  $("pVersion").value = preset.version; $("pYear").value = preset.year;
}

const RULES = [
  { id: "pBrand", check: v => v ? "" : "Vui lòng chọn hãng xe." },
  { id: "pModel", check: v => v.length < 2 ? "Vui lòng nhập dòng xe." : "" },
  { id: "pYear", check: v => { const n = Number(v); return Number.isInteger(n) && n >= 1990 && n <= thisYear + 1 ? "" : `Năm sản xuất phải từ 1990 đến ${thisYear + 1}.`; } },
  { id: "pCondition", check: v => v ? "" : "Vui lòng chọn tình trạng xe." },
  { id: "pKm", check: v => /^\d+$/.test(v) ? "" : "Số km phải là số nguyên không âm." },
  { id: "pPrice", check: v => Number(v) > 0 ? "" : "Vui lòng nhập giá lớn hơn 0 (triệu đồng)." }
];

function renderList() {
  const list = store.get(LISTINGS_KEY, []).filter(l => l && l.code).slice().reverse();
  $("postList").innerHTML = list.length
    ? list.map(l => `<div class="post-item">
        <div><strong>${esc(l.code)}</strong> · ${esc(l.brand)} ${esc(l.model)} ${esc(l.version)} (${l.year})<br>
          <span class="note">${esc(l.condition)} · ${Number(l.km).toLocaleString("vi-VN")} km · ${formatPrice(l.price)}</span></div>
        <button class="btn btn--outline btn--sm" data-del="${esc(l.code)}">Xóa</button></div>`).join("")
    : '<div class="empty"><i class="fa-regular fa-folder-open"></i><p>Chưa có tin nào được đăng.</p></div>';
}

$("postForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!validateFields(RULES)) return;
  const item = {
    code: nextCode("TIN"), createdAt: new Date().toISOString(),
    brand: $("pBrand").value, model: $("pModel").value.trim(), version: $("pVersion").value.trim(),
    year: Number($("pYear").value), condition: $("pCondition").value, km: Number($("pKm").value),
    price: Number($("pPrice").value) * 1e6, note: $("pNote").value.trim()
  };
  const all = store.get(LISTINGS_KEY, []);
  all.push(item);
  store.set(LISTINGS_KEY, all);
  showToast("Đã ghi nhận tin " + item.code + " (lưu trên trình duyệt)", "success");
  $("postForm").reset();
  renderList();
});
$("postList").addEventListener("click", e => {
  const del = e.target.closest("[data-del]");
  if (!del) return;
  store.set(LISTINGS_KEY, store.get(LISTINGS_KEY, []).filter(l => l.code !== del.dataset.del));
  showToast("Đã xóa tin");
  renderList();
});
renderList();
/* NHOM06 - tuvan.js : gửi và xem yêu cầu tư vấn (localStorage) */
const ADVICE_KEY = "nhom06_advice";
const $ = id => document.getElementById(id);

CARS.forEach(c => $("aCar").add(new Option(`${c.brand} ${c.name} ${c.version}`, c.id)));
const preset = getCarById(new URLSearchParams(location.search).get("car")); // xe truyền từ trang chi tiết
if (preset) $("aCar").value = preset.id;

const RULES = [
  { id: "aName", check: v => v.length < 2 ? "Vui lòng nhập họ và tên." : "" },
  { id: "aPhone", check: v => !v ? "Vui lòng nhập số điện thoại." : isPhone(v) ? "" : "Số điện thoại chưa hợp lệ." },
  { id: "aEmail", check: v => !v ? "Vui lòng nhập email." : isEmail(v) ? "" : "Email chưa hợp lệ." },
  { id: "aBudget", check: v => v ? "" : "Vui lòng chọn khoảng ngân sách." },
  { id: "aContent", check: v => v.length < 10 ? "Vui lòng mô tả nhu cầu (ít nhất 10 ký tự)." : "" }
];

function renderList() {
  const list = store.get(ADVICE_KEY, []).filter(a => a && a.code).slice().reverse();
  $("adviceList").innerHTML = list.length
    ? list.slice(0, 5).map(a => `<div class="advice-item"><strong>${esc(a.code)}</strong> · ${esc(a.carName)}<br>
        <span class="note">${new Date(a.createdAt).toLocaleString("vi-VN")} · ${esc(a.budget)}</span></div>`).join("")
    : '<p class="note">Chưa có yêu cầu nào.</p>';
}

$("adviceForm").addEventListener("submit", e => {
  e.preventDefault();
  if (!validateFields(RULES)) return;
  const car = getCarById($("aCar").value);
  const item = {
    code: nextCode("TV"), createdAt: new Date().toISOString(),
    name: $("aName").value.trim(), phone: $("aPhone").value.trim(), email: $("aEmail").value.trim(),
    carName: car ? `${car.brand} ${car.name}` : "Chưa xác định", budget: $("aBudget").value, content: $("aContent").value.trim()
  };
  const all = store.get(ADVICE_KEY, []);
  all.push(item);
  store.set(ADVICE_KEY, all);
  showToast("Đã ghi nhận yêu cầu " + item.code + " (mô phỏng)", "success");
  $("adviceForm").reset();
  if (preset) $("aCar").value = preset.id;
  renderList();
});
renderList();
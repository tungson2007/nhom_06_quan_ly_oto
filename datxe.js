/* ==========================================================
   NHOM06 - datxe.js : luồng đặt mua xe (mô phỏng, lưu localStorage)
   Luồng: chọn xe -> điền form -> kiểm tra -> modal xác nhận -> tạo đơn -> hiển thị mã đơn
   ========================================================== */
const $ = id => document.getElementById(id);
const ORDERS_KEY = "nhom06_orders";
const PROVINCES = ["Hà Nội", "TP. Hồ Chí Minh", "Đà Nẵng", "Hải Phòng", "Cần Thơ", "Huế", "Khánh Hòa", "Quảng Ninh", "Nghệ An", "Lâm Đồng", "Tỉnh/thành khác"];
const PAYMENTS = { cod: "Thanh toán khi nhận xe tại showroom", bank: "Chuyển khoản theo hướng dẫn mẫu", loan: "Đăng ký tư vấn trả góp" };

// ----- 1. Khởi tạo form: danh sách xe + tỉnh/thành -----
CARS.forEach(c => $("oCar").add(new Option(`${c.brand} ${c.name} ${c.version} (${c.year})`, c.id)));
PROVINCES.forEach(p => $("oProvince").add(new Option(p, p)));
const presetCar = getCarById(new URLSearchParams(location.search).get("id")); // id truyền từ trang chi tiết/danh sách
if (presetCar) $("oCar").value = presetCar.id;

// ----- 2. Tính tiền -----
// Chiết khấu chỉ áp dụng khi xe có promotionId, chương trình có discountAmount (VNĐ/xe) và đang trong thời hạn.
// Dữ liệu mẫu hiện chưa khai báo discountAmount nên chưa có chiết khấu.
function getDiscountPerCar(car) {
  const promo = PROMOTIONS.find(p => p.id === car.promotionId);
  if (!promo || !promo.discountAmount) return 0;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return today >= new Date(promo.start) && today <= new Date(promo.end) ? promo.discountAmount : 0;
}
function parseQty() {
  const raw = $("oQty").value.trim();
  return /^\d+$/.test(raw) ? parseInt(raw, 10) : 0; // chỉ nhận số nguyên dương
}
function calcOrder() {
  const car = getCarById($("oCar").value);
  const qty = parseQty();
  const subtotal = car.price * qty;                        // Tạm tính = Giá xe × Số lượng
  const discount = Math.min(getDiscountPerCar(car) * qty, subtotal);
  return { car, qty, subtotal, discount, total: subtotal - discount };
}
function renderSummary() {
  const o = calcOrder();
  $("summaryBody").innerHTML = `
    <div class="summary__media">${imageBlock(o.car.image, o.car.brand + " " + o.car.name)}</div>
    <h3>${esc(o.car.brand)} ${esc(o.car.name)}</h3>
    <p class="note" style="margin-bottom:10px">Phiên bản ${esc(o.car.version)} · ${o.car.year}</p>
    <div class="sum-row"><span>Giá tham khảo</span><span>${formatPrice(o.car.price)}</span></div>
    <div class="sum-row"><span>Số lượng</span><span>${o.qty || "—"}</span></div>
    <div class="sum-row"><span>Tạm tính (${formatPrice(o.car.price)} × ${o.qty})</span><span>${formatPrice(o.subtotal)}</span></div>
    ${o.discount > 0 ? `<div class="sum-row"><span>Ưu đãi (${formatPrice(getDiscountPerCar(o.car))} × ${o.qty})</span><span>− ${formatPrice(o.discount)}</span></div>` : ""}
    <div class="sum-row sum-row--total"><span>Tổng tiền dự kiến</span><span>${formatPrice(o.total)}</span></div>
    <p class="note">Giá là dữ liệu minh họa, chưa gồm bất kỳ khoản phí thực tế nào.</p>`;
}
$("oCar").addEventListener("change", renderSummary);
$("oQty").addEventListener("input", renderSummary);
renderSummary();

// ----- 3. Kiểm tra dữ liệu -----
const RULES = [
  { id: "oName", check: v => v.length < 2 ? "Vui lòng nhập họ và tên." : "" },
  { id: "oPhone", check: v => !v ? "Vui lòng nhập số điện thoại." : isPhone(v) ? "" : "Số điện thoại chưa hợp lệ (ví dụ 0901234567)." },
  { id: "oEmail", check: v => !v ? "Vui lòng nhập email." : isEmail(v) ? "" : "Email chưa hợp lệ." },
  { id: "oProvince", check: v => v ? "" : "Vui lòng chọn tỉnh/thành phố." },
  { id: "oAddress", check: v => v.length < 5 ? "Vui lòng nhập địa chỉ." : "" },
  { id: "oQty", check: () => { const q = parseQty(); return q >= 1 && q <= 10 ? "" : "Số lượng phải là số nguyên từ 1 đến 10."; } }
];
function getPayment() { const r = document.querySelector('input[name="payment"]:checked'); return r ? r.value : ""; }
document.querySelectorAll('input[name="payment"]').forEach(r => r.addEventListener("change", () => { $("payError").textContent = ""; }));

// ----- 4. Gửi form -> mở modal xác nhận (chưa tạo đơn) -----
$("orderForm").addEventListener("submit", e => {
  e.preventDefault();
  const fieldsOk = validateFields(RULES);
  const payment = getPayment();
  $("payError").textContent = payment ? "" : "⚠ Vui lòng chọn phương thức thanh toán.";
  if (!fieldsOk) return;
  if (!payment) { $("payError").scrollIntoView({ behavior: "smooth", block: "center" }); return; }
  openConfirm(payment);
});

function openConfirm(payment) {
  const o = calcOrder();
  $("orderModalBody").innerHTML = `
    <div class="modal__head"><h3 id="orderModalTitle">Xác nhận đơn đặt mua</h3></div>
    <dl class="kv">
      <dt>Xe</dt><dd>${esc(o.car.brand)} ${esc(o.car.name)} ${esc(o.car.version)}</dd>
      <dt>Số lượng</dt><dd>${o.qty}</dd>
      <dt>Tổng dự kiến</dt><dd><strong>${formatPrice(o.total)}</strong></dd>
      <dt>Khách hàng</dt><dd>${esc($("oName").value.trim())}</dd>
      <dt>Điện thoại</dt><dd>${esc($("oPhone").value.trim())}</dd>
      <dt>Email</dt><dd>${esc($("oEmail").value.trim())}</dd>
      <dt>Địa chỉ</dt><dd>${esc($("oAddress").value.trim())}, ${esc($("oProvince").value)}</dd>
      <dt>Thanh toán</dt><dd>${esc(PAYMENTS[payment])}</dd>
    </dl>
      <button class="btn btn--outline" type="button" id="btnBack">Quay lại chỉnh sửa</button>
      <button class="btn btn--primary" type="button" id="btnConfirm">Xác nhận đặt mua</button>
    </div>`;
  $("orderModal").classList.add("open");
  $("btnBack").addEventListener("click", () => $("orderModal").classList.remove("open"));
  $("btnConfirm").addEventListener("click", () => createOrder(payment));
}

// ----- 5. Tạo đơn (chỉ chạy sau khi người dùng bấm xác nhận) -----
function createOrder(payment) {
  const o = calcOrder();
  const order = {
    code: nextCode("DH"),
    createdAt: new Date().toISOString(),
    carId: o.car.id,
    carName: `${o.car.brand} ${o.car.name} ${o.car.version}`,
    unitPrice: o.car.price, qty: o.qty, subtotal: o.subtotal, discount: o.discount, total: o.total,
    customer: { name: $("oName").value.trim(), phone: $("oPhone").value.trim(), email: $("oEmail").value.trim(),
                province: $("oProvince").value, address: $("oAddress").value.trim() },
    payment, note: $("oNote").value.trim(),
    status: "Đã ghi nhận đơn"
  };
  const orders = store.get(ORDERS_KEY, []);
  orders.push(order);
  store.set(ORDERS_KEY, orders);

  $("orderModalBody").innerHTML = `
    <div class="success-icon"><i class="fa-solid fa-check"></i></div>
    <h3 id="orderModalTitle" style="text-align:center">Đã ghi nhận đơn </h3>
    <p class="order-code">${esc(order.code)}</p>
    <dl class="kv">
      <dt>Khách hàng</dt><dd>${esc(order.customer.name)}</dd>
      <dt>Xe đã chọn</dt><dd>${esc(order.carName)}</dd>
      <dt>Số lượng</dt><dd>${order.qty}</dd>
      <dt>Tổng dự kiến</dt><dd><strong>${formatPrice(order.total)}</strong></dd>
      <dt>Thanh toán</dt><dd>${esc(PAYMENTS[order.payment])}</dd>
      <dt>Trạng thái</dt><dd><span class="badge badge--success">${esc(order.status)}</span></dd>
    </dl>
      <a class="btn btn--outline" href="${URLS.cars}">Xem thêm xe</a>
    </div>`;
}
/* NHOM06 - khuyenmai.js : lọc khuyến mãi theo trạng thái / thương hiệu / loại ưu đãi
   Trạng thái được tính bằng getPromoStatus() (common.js) theo ngày hiện tại. */
const $ = id => document.getElementById(id);
[...new Set(PROMOTIONS.map(p => p.brand))].forEach(b => $("fBrand").add(new Option(b, b)));
PROMO_KINDS.forEach(k => $("fKind").add(new Option(k, k)));
const ORDER = { ongoing: 0, upcoming: 1, ended: 2 }; // đang diễn ra lên trước

function render() {
  const status = $("fStatus").value, brand = $("fBrand").value, kind = $("fKind").value;
  const list = PROMOTIONS
    .map(p => ({ p, st: getPromoStatus(p) }))
    .filter(x => (!status || x.st.key === status) && (!brand || x.p.brand === brand) && (!kind || x.p.kind === kind))
    .sort((a, b) => ORDER[a.st.key] - ORDER[b.st.key] || new Date(a.p.start) - new Date(b.p.start));

  $("promoCount").textContent = list.length + " chương trình (minh họa)";
  if (!list.length) {
    $("promoGrid").innerHTML = `<div class="empty" style="grid-column:1/-1"><i class="fa-regular fa-face-frown"></i><h3>Không có chương trình phù hợp</h3>
      <p>Hãy thử đổi bộ lọc.</p><button class="btn btn--primary" type="button" data-reset style="margin-top:12px">Xóa bộ lọc</button></div>`;
    return;
  }
  $("promoGrid").innerHTML = list.map(({ p, st }) => `
    <article class="promo ${st.key === "ended" ? "is-ended" : ""}">
      <div class="promo__media">${imageBlock(p.image, p.title)}</div>
      <div class="promo__body">
        <div><span class="badge ${st.cls}">${st.text}</span> <span class="badge badge--muted">${esc(p.kind)}</span></div>
        <h3>${esc(p.title)}</h3>
        <p class="promo__discount">${esc(p.discount)} · ${esc(p.brand)}</p>
        <p>${esc(p.desc)}</p>
        <p class="promo__time"><i class="fa-regular fa-calendar"></i> ${formatDate(p.start)} – ${formatDate(p.end)}</p>
        <div class="promo__actions">
          <button class="btn btn--primary btn--sm" type="button" data-detail="${p.id}">Xem chi tiết</button>
          <a class="btn btn--outline btn--sm" href="${URLS.cars}?brand=${encodeURIComponent(p.brand)}">Xem xe liên quan</a>
        </div>
      </div>
    </article>`).join("");
}

function showDetail(id) {
  const p = PROMOTIONS.find(x => x.id === Number(id));
  if (!p) return;
  const st = getPromoStatus(p);
  $("promoModalBody").innerHTML = `
    <div class="modal__head"><h3>${esc(p.title)}</h3></div>
    <p><span class="badge ${st.cls}">${st.text}</span> · ${formatDate(p.start)} – ${formatDate(p.end)}</p>
    <p style="margin:12px 0"><strong>${esc(p.discount)}</strong> — ${esc(p.desc)}</p>
    <h4>Điều kiện áp dụng</h4>
    <ul class="cond-list" style="margin-top:8px">${p.conditions.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
    <p class="note" style="margin-top:12px">Chương trình minh họa của dự án demo.</p>
    <div class="modal__actions">
      <button class="btn btn--outline" type="button" id="closePromo">Đóng</button>
      <a class="btn btn--primary" href="${URLS.cars}?brand=${encodeURIComponent(p.brand)}">Xem xe liên quan</a>
    </div>`;
  $("promoModal").classList.add("open");
  $("closePromo").addEventListener("click", () => $("promoModal").classList.remove("open"));
}

function resetFilters() { ["fStatus", "fBrand", "fKind"].forEach(id => { $(id).value = ""; }); render(); }
["fStatus", "fBrand", "fKind"].forEach(id => $(id).addEventListener("change", render));
$("resetFilters").addEventListener("click", resetFilters);
document.addEventListener("click", e => {
  const d = e.target.closest("[data-detail]");
  if (d) showDetail(d.dataset.detail);
  if (e.target.closest("[data-reset]")) resetFilters();
});
$("promoModal").addEventListener("click", e => { if (e.target === $("promoModal")) $("promoModal").classList.remove("open"); });
render();
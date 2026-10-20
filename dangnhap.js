
const USERS_KEY = "nhom06_users";
const SESSION_KEY = "nhom06_session";
const $ = id => document.getElementById(id);

function showState() {
  const session = store.get(SESSION_KEY, null);
  $("authGuest").hidden = !!session;
  $("authUser").hidden = !session;
  if (session) $("welcome").textContent = "Xin chào, " + session.name;
}

// Chuyển tab đăng nhập / đăng ký
document.querySelector(".tabs").addEventListener("click", e => {
  const tab = e.target.closest(".tab");
  if (!tab) return;
  document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
  document.querySelectorAll(".tab-panel").forEach(p => p.classList.toggle("active", p.id === tab.dataset.tab));
});

$("tabRegister").addEventListener("submit", e => {
  e.preventDefault();
  const ok = validateFields([
    { id: "rName", check: v => v.length < 2 ? "Vui lòng nhập họ và tên." : "" },
    { id: "rEmail", check: v => isEmail(v) ? "" : "Email chưa hợp lệ." },
    { id: "rPass", check: v => v.length < 6 ? "Mật khẩu tối thiểu 6 ký tự." : "" },
    { id: "rPass2", check: v => v === $("rPass").value ? "" : "Mật khẩu nhập lại chưa khớp." }
  ]);
  if (!ok) return;
  const email = $("rEmail").value.trim().toLowerCase();
  const users = store.get(USERS_KEY, []);
  if (users.some(u => u.email === email)) { setFieldError("rEmail", "Email này đã được đăng ký."); $("rEmail").focus(); return; }
  const user = { name: $("rName").value.trim(), email };
  users.push(user);
  store.set(USERS_KEY, users);
  store.set(SESSION_KEY, user);
  showToast("Đăng ký thành công", "success");
  showState();
});

$("tabLogin").addEventListener("submit", e => {
  e.preventDefault();
  if (!validateFields([
    { id: "lEmail", check: v => isEmail(v) ? "" : "Email chưa hợp lệ." },
    { id: "lPass", check: v => v.length < 6 ? "Mật khẩu tối thiểu 6 ký tự." : "" }
  ])) return;
  const email = $("lEmail").value.trim().toLowerCase();
  const user = store.get(USERS_KEY, []).find(u => u.email === email);
  if (!user) { setFieldError("lEmail", "Chưa có tài khoản với email này. Hãy đăng ký trước."); $("lEmail").focus(); return; }
  store.set(SESSION_KEY, user);
  showToast("Đăng nhậpthành công", "success");
  showState();
});

$("logoutBtn").addEventListener("click", () => {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { /* bỏ qua */ }
  showToast("Đã đăng xuất");
  showState();
});
showState();
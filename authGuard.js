// ==============================
// AUTH GUARD UNTUK SEMUA HALAMAN
// ==============================

// Ambil user dari localStorage
const user = JSON.parse(localStorage.getItem("user"));

// Kalau user tidak login sama sekali
if (!user) {
  window.location.href = "../login.html";
}

// Tentukan halaman mana yang sedang dibuka
const path = window.location.pathname;

// ==============================
// GUARD ADMIN
// ==============================
if (path.includes("/admin/")) {
  if (user.role_id !== 1) {
    // Bukan admin, tendang
    localStorage.removeItem("user");
    window.location.href = "../login.html";
  }
}

// ==============================
// GUARD SANTRI
// ==============================
if (path.includes("/santri/")) {
  if (user.role_id !== 2) {
    // Bukan santri, tendang
    localStorage.removeItem("user");
    window.location.href = "../login.html";
  }
}

// ==============================
// GUARD PENGAJAR
// ==============================
if (path.includes("/pengajar/")) {
  if (user.role_id !== 3) {
    // Bukan pengajar, tendang
    localStorage.removeItem("user");
    window.location.href = "../login.html";
  }
}

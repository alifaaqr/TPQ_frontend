//handler untuk  register.html

const form = document.getElementById("signupForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  // Validasi sederhana
  if (password !== confirmPassword) {
    alert("Password dan konfirmasi tidak sama!");
    return;
  }

  if (!fullname || !username || !email || !password) {
    alert("Semua kolom harus diisi.");
    return;
  }

  const response = await fetch("http://localhost:3000/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullname, username, email, password }),
  });

  const result = await response.json();

  if (response.ok) {
    alert("Registrasi sukses! Anda akan diarahkan ke halaman login.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000); // jeda 1 detik sebelum pindah
  } else {
    alert(result.message || "Terjadi kesalahan!");
  }
});
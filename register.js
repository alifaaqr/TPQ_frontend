// handler untuk register.html

const form = document.getElementById("signupForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullname = document.getElementById("fullname").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  
  // role diambil dari dropdown
  const role_id = Number(document.getElementById("role").value);

  // Validasi sederhana
  if (password !== confirmPassword) {
    alert("Password dan konfirmasi tidak sama!");
    return;
  }

  if (!fullname || !username || !email || !password) {
    alert("Semua kolom harus diisi.");
    return;
  }

  if (![2, 3].includes(role_id)) {
    alert("Role tidak valid.");
    return;
}


  try {
    const response = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullname,
        username,
        email,
        password,
        role_id, // ← kirim role_id
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      alert(result.message || "Terjadi kesalahan server!");
      return;
    }

    alert("Registrasi sukses! Anda akan diarahkan ke halaman login.");
    setTimeout(() => {
      window.location.href = "login.html";
    }, 1000);

  } catch (err) {
    alert("Gagal terhubung ke server.");
    console.error(err);
  }
});

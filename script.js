document.getElementById("loginForm").addEventListener("submit", function(e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const role = document.getElementById("role").value;

  if (role === "admin") {
    if (email === "admin@tpq.com" && password === "admin123") {
      alert("Login berhasil sebagai Admin!");
      window.location.href = "admin-dashboard.html";
    } else {
      alert("Email atau password admin salah!");
    }
  } 
  else if (role === "guru") {
    if (email === "guru@tpq.com" && password === "guru123") {
      alert("Login berhasil sebagai Guru!");
      window.location.href = "guru-dashboard.html";
    } else {
      alert("Email atau password guru salah!");
    }
  } 
  else if (role === "santri") {
    if (email === "santri@tpq.com" && password === "santri123") {
      alert("Login berhasil sebagai Santri!");
      window.location.href = "santri-dashboard.html";
    } else {
      alert("Email atau password santri salah!");
    }
  } 
  else {
    alert("Silakan pilih peran terlebih dahulu!");
  }
});

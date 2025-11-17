/*window.addEventListener("load", () => {
  document.body.classList.add("loaded");
});

// Upload gambar orang ngaji
const imageUpload = document.getElementById("imageUpload");
const previewBox = document.getElementById("previewBox");

imageUpload.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      previewBox.innerHTML = `<img src="${reader.result}" alt="Gambar Ngaji" />`;
    };
    reader.readAsDataURL(file);
  }
});

// Hamburger menu untuk tampilan mobile
const hamburger = document.getElementById("hamburger");
const navLinks = document.querySelector(".nav-links");

hamburger.addEventListener("click", () => {
  navLinks.classList.toggle("active");
}); */

const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Email dan password harus diisi.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Login gagal.");
        return;
      }

      const user = result.user;

      // Simpan sesi
      localStorage.setItem("user", JSON.stringify(user));

      // Cek role untuk redirect
      if (user.role_id === 2) {
        window.location.href = "santri/santri.html";
      } 
      else if (user.role_id === 3) {
        window.location.href = "pengajar/pengajar.html";
      } 
      else if (user.role_id === 1) {
        alert("Admin tidak login dari halaman ini.");
        localStorage.removeItem("user");
        return;
      } 
      else {
        alert("Role tidak dikenali.");
        localStorage.removeItem("user");
      }

    } catch (err) {
      console.error(err);
      alert("Gagal menghubungi server.");
    }
  });
}
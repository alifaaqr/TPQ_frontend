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

//handler untuk  register.html
/*
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
c*/
// handler untuk login (email dan password)
const loginForm = document.getElementById("loginForm")
if (loginForm) { 
  loginForm.addEventListener("submit", async (e)=> { 
    e.preventDefault(); 

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      alert("Isi semua kolom login!");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

    const result  = await response.json(); 
    

    if (!response.ok) { 
      alert(result.message || "Login Gagal. Periksa kembali email dan password.")
      return; 
    }


    alert(`Selamat datang, ${result.user.fullname}!`)
     localStorage.setItem("user", JSON.stringify(result.user));

     const role = document.getElementById("role").value; 

     if (role === "admin") { 
      window.location.href = "admin/admin.html"; 
     }
     else if (role === "pengajar") { 
      window.location.href = "pengajar/pengajar.html";
     }
     else if (role === "santri") { 
      window.location.href = "santri/santri.html"
     }else { 
      window.location.href = "index.html"; 
     }
    } catch (err) {
      console.error("Error:", err);
      alert("Gagal menghubungi server.");
    }
  });
}

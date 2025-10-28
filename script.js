window.addEventListener("load", () => {
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
});
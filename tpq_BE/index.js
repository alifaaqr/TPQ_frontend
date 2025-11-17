import express from "express";
import cors from 'cors'; 
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
// koneksi ke supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// contoh route GET
app.get("/", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// jalankan server
app.listen(process.env.PORT, () => {
  console.log(`Server jalan di http://localhost:${process.env.PORT}`);
});

//route post /signup
app.post("/signup", async (req, res) => {
  const { fullname, username, email, password } = req.body;

  if (!fullname || !username || !email || !password) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([{ username, email, password_hash, fullname }])
    .select();

  if (error) return res.status(500).json({ message: error.message });
  res.status(201).json({ message: "User berhasil dibuat", user: data[0] });
});

//route post /login 
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }  

  // cek user berdasarkan email
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .limit(1);

  if (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil data pengguna" });
  }

  const user = users[0];
  if (!user) { 
    return res.status(401).json({ message: "Email tidak ditemukan"})
  }

  //Verifikasi Password
  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: "Password salah" });
  }

 // sukses
 res.status(200).json({
  message: "Login berhasil",
  user: {
    id: user.id,
    fullname: user.fullname,
    email: user.email
      }
  });

});
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
  const { fullname, username, email, password, role_id} = req.body;

  console.log("REQ BODY SERVER:", req.body);  // debug

  // validasi input
  if (!fullname || !username || !email || !password) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // Paksa konversi role_id ke integer
  const parsedRole = Number(role_id);

  // Validasi role_id
  // Hanya role 2 (santri) dan role 3 (pengajar) yang boleh dibuat melalui endpoint signup umum.
  if (![2, 3].includes(parsedRole)) {  
    return res.status(403).json({ 
      message: "Tidak diperbolehkan membuat role ini." 
    });
  }


try{
  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
        { 
        fullname, 
        username, 
        email,
        password_hash, 
        role_id: parsedRole
       }
    ])
    .select();

  if (error) {
    return res.status(500).json({ message: error.message }); 
  }
  
  res.status(201).json({
     message: "User berhasil dibuat", 
     user: data[0] });

} catch (err) { 
  return res.status(500).json({ message: "Server Error"});
}
}); 



// route post /login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email dan password wajib diisi." });
  }

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
    return res.status(401).json({ message: "Email tidak ditemukan" });
  }

  const validPassword = await bcrypt.compare(password, user.password_hash);
  if (!validPassword) {
    return res.status(401).json({ message: "Password salah" });
  }

  // sukses, kirim role_id juga
  return res.status(200).json({
    message: "Login berhasil",
    user: {
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      role_id: user.role_id,          // <<< BAGIAN TERPENTING
      is_active: user.is_active       // opsional tapi berguna
    }
  });
});

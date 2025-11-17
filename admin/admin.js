import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Konfigurasi Supabase
const SUPABASE_URL = "https://sqvhzvhakivoeqajxowh.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxdmh6dmhha2l2b2VxYWp4b3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5NTMzNTIsImV4cCI6MjA3NjUyOTM1Mn0.QiDgEH7djJO1-AKQeoeLKw4W8FjeudS77NPZJCHIlfs";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Element Referensi
const santriTable = document.getElementById("santriTable");
const userTable = document.getElementById("userTable");

const totalSantri = document.getElementById("totalSantri");
const hadirCount = document.getElementById("hadirCount");
const izinCount = document.getElementById("izinCount");
const alfaCount = document.getElementById("alfaCount");
const persentase = document.getElementById("persentase");
const refreshBtn = document.getElementById("refreshBtn");

// Modal RFID
const modalRFID = document.getElementById("modalRFID");
const modalUserName = document.getElementById("modalUserName");
const inputUID = document.getElementById("inputUID");
const btnSimpanUID = document.getElementById("btnSimpanUID");
const btnBatalUID = document.getElementById("btnBatalUID");

let selectedUserId = null;


/* ================================
      MEMUAT DAFTAR USER (SANTRI)
================================ */
async function loadUsers() {
    userTable.innerHTML = `<tr><td colspan="4">Memuat...</td></tr>`;
  
    // Ambil semua user santri
    const { data: usersData, error: usersErr } = await supabase
      .from("users")
      .select("id, fullname, username")
      .eq("role_id", 2);
  
    if (usersErr) {
      userTable.innerHTML = `<tr><td colspan="4">Gagal memuat data santri.</td></tr>`;
      return;
    }
  
    // Ambil semua kartu RFID
    const { data: cardsData } = await supabase
      .from("rfid_cards")
      .select("uid, user_id");
  
    const cardMap = {};
    cardsData?.forEach(c => {
      cardMap[c.user_id] = c.uid; // mapping user_id → UID
    });
  
    userTable.innerHTML = "";
  
    usersData.forEach((user, i) => {
      const uid = cardMap[user.id] || null;
  
      const row = document.createElement("tr");
  
      row.innerHTML = `
        <td>${i + 1}</td>
        <td>${user.fullname}</td>
        <td>${user.username}</td>
        <td>
          ${
            uid
              ? `<span style="color:lightgreen;">UID: ${uid}</span>`
              : `<button onclick="openRFIDModal(${user.id}, '${user.fullname}')">Pasang Kartu</button>`
          }
        </td>
      `;
  
      userTable.appendChild(row);
    });
  }
  


/* ================================
        MODAL PASANG KARTU
================================ */
window.openRFIDModal = function (userId, fullname) {
  selectedUserId = userId;
  modalUserName.textContent = "Untuk: " + fullname;
  modalRFID.style.display = "block";
};

btnBatalUID.addEventListener("click", () => {
  modalRFID.style.display = "none";
  inputUID.value = "";
});

btnSimpanUID.addEventListener("click", async () => {
  const uid = inputUID.value.trim();

  if (!uid) {
    alert("UID tidak boleh kosong.");
    return;
  }

  // === 1. CEK APAKAH UID SUDAH ADA ===
  const { data: existingCard, error: checkErr } = await supabase
    .from("rfid_cards")
    .select("*")
    .eq("uid", uid)
    .single();

  // Error selain "not found"
  if (checkErr && checkErr.code !== "PGRST116") {
    alert("Terjadi kesalahan: " + checkErr.message);
    return;
  }

  let result;

  // === 2A. UID BELUM ADA → INSERT BARU ===
  if (!existingCard) {
    result = await supabase
      .from("rfid_cards")
      .insert([
        {
          uid: uid,
          user_id: selectedUserId,
          is_active: true
        }
      ]);
  }

  // === 2B. UID SUDAH ADA → VALIDASI ===
  else {
    // Jika UID sudah dipakai user lain → TOLAK
    if (existingCard.user_id && existingCard.user_id !== selectedUserId) {
      alert(
        "UID ini sudah terdaftar untuk santri ID: " +
          existingCard.user_id +
          ". Tidak dapat dipakai ulang."
      );
      return;
    }

    // Jika UID ada tapi user_id NULL → UPDATE user_id
    result = await supabase
      .from("rfid_cards")
      .update({ user_id: selectedUserId })
      .eq("uid", uid);
  }

  // === 3. PERIKSA ERROR INSERT/UPDATE ===
  if (result.error) {
    alert("Gagal menyimpan UID: " + result.error.message);
    console.error(result.error);
    return;
  }

  alert("RFID berhasil dipasangkan.");
  modalRFID.style.display = "none";
  inputUID.value = "";
  loadUsers(); // refresh
});



/* ================================
      MEMUAT LOG PRESENSI
================================ */
async function loadData() {
  santriTable.innerHTML = `<tr><td colspan="5">Memuat...</td></tr>`;

  // -------------------------------------------------------
  // 1. Hitung total santri
  // -------------------------------------------------------
  const { data: santriList } = await supabase
    .from("users")
    .select("id")
    .eq("role_id", 2);  

  const total = santriList?.length ?? 0;

  // -------------------------------------------------------
  // 2. Tentukan tanggal WIB yang benar
  // -------------------------------------------------------
  const nowUtc = new Date();
  const nowWib = new Date(nowUtc.getTime() + (7 * 3600 * 1000));
  // Ambil tanggal WIB
  const y = nowWib.getUTCFullYear();
  const m = nowWib.getUTCMonth();
  const d = nowWib.getUTCDate();

  // Range WIB:
  const startWib = new Date(Date.UTC(y, m, d, 0, 0, 0));  // 00:00 WIB
  const endWib   = new Date(Date.UTC(y, m, d, 23, 59, 59)); // 23:59 WIB

  // Convert ke UTC (string ISO)
  const startUTC = new Date(startWib.getTime() - (7 * 3600 * 1000)).toISOString();
  const endUTC   = new Date(endWib.getTime()   - (7 * 3600 * 1000)).toISOString();

  console.log("Final Query Range (UTC):", startUTC, "→", endUTC);

  // -------------------------------------------------------
  // 3. Ambil log presensi hari ini
  // -------------------------------------------------------
  const { data: logs, error } = await supabase
    .from("vw_activity_with_user")
    .select("*")
    .eq("role_id", 2)
    .gte("created_at", startUTC)
    .lte("created_at", endUTC)
    .order("created_at", { ascending: true });

  if (error) {
    santriTable.innerHTML = `<tr><td colspan="5">Gagal memuat log.</td></tr>`;
    return;
  }

  // -------------------------------------------------------
  // 4. Deduping (kunci utama masalahmu)
  //    Satu user → satu log terbaru per hari.
  // -------------------------------------------------------
  const latestByUser = new Map();

  for (const log of logs) {
    const uid = log.user_id || log.card_uid;  
    if (!uid) continue;

    if (!latestByUser.has(uid)) {
      latestByUser.set(uid, log); // EARLIEST karena ascending
    }
  }

  const dailyLogs = Array.from(latestByUser.values());

  // -------------------------------------------------------
  // 5. Render tabel presensi
  // -------------------------------------------------------
  if (dailyLogs.length === 0) {
    santriTable.innerHTML = `<tr><td colspan="5">Belum ada presensi hari ini.</td></tr>`;
  } else {
    santriTable.innerHTML = "";
  }

  let hadir = 0;
  let izin = 0;

  dailyLogs.forEach((log, i) => {
    const nama = log.fullname ?? "-";
    const statusRaw = (log.status ?? "-").toLowerCase();

    // Normalisasi status
    let status = "alfa";
    if (["success", "sukses", "hadir"].includes(statusRaw)) status = "hadir";
    else if (statusRaw === "izin") status = "izin";

    // Hitung
    if (status === "hadir") hadir++;
    if (status === "izin") izin++;

    // Waktu WIB
    const utcDate = new Date(log.created_at);
    const wibDate = new Date(utcDate.getTime() + 7 * 3600 * 1000);
    const waktu = wibDate.toLocaleString("id-ID", { hour12: false });

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${i + 1}</td>
      <td>${nama}</td>
      <td>${log.card_uid || '-'}</td>
      <td>${log.status}</td>
      <td>${waktu}</td>
    `;
    santriTable.appendChild(row);
  });

  // -------------------------------------------------------
  // 6. Rekap Kehadiran
  // -------------------------------------------------------
  const alfa = total - (hadir + izin);

  totalSantri.textContent = total;
  hadirCount.textContent = hadir;
  izinCount.textContent = izin;
  alfaCount.textContent = Math.max(alfa, 0);

  persentase.textContent =
    total === 0 ? "0%" : ((hadir / total) * 100).toFixed(1) + "%";
}


// Tombol refresh manual
refreshBtn.addEventListener("click", loadData);

// Load pertama
loadData();
loadUsers();

// Auto-refresh setiap 10 detik
setInterval(loadData, 10000);

// ================================
//  SESSION CHECK FOR ADMIN PAGE
// ================================
const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  // Belum login
  window.location.href = "login.html";
}

// Kalau ingin pastikan hanya admin boleh masuk:
if (user.role_id !== 1) {
  alert("Akses ditolak. Halaman ini hanya untuk Admin.");
  window.location.href = "index.html";
}


// ================================
//  LOGOUT HANDLER
// ================================
const logoutBtn = document.getElementById("logoutBtn");

if(logoutBtn) {
logoutBtn.addEventListener("click", () => {
  // Hapus token login yg kamu simpan
  localStorage.removeItem("user");
  // Redirect ke login page
  window.location.href = "../admin/admin-login.html";
})};

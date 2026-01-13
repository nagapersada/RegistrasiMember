const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

const IMGBB_API_KEY = '5a68759600115086058e17409247657f'; 
let tempUser = {};

// Preview Upload
document.getElementById('fileInput').addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('uploadText').style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    const fileFile = document.getElementById('fileInput').files[0];
    
    tempUser = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    if (!tempUser.uid || !tempUser.nama || !fileFile) {
        alert("UID, Nama, dan Screenshot Saldo wajib diisi!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "SEDANG MEMVALIDASI...";

    try {
        // 1. Cek UID (Wajib Kapital)
        const { data: existing } = await db.from('members').select('UID').eq('UID', tempUser.uid).maybeSingle();
        if (existing) {
            alert("UID sudah terdaftar!");
            btn.disabled = false;
            btn.textContent = "SIMPAN & VALIDASI DATA";
            return;
        }

        // 2. Upload Bukti ke ImgBB
        let formData = new FormData();
        formData.append("image", fileFile);
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, { method: "POST", body: formData });
        const resData = await res.json();
        if (!resData.success) throw new Error("Gagal mengunggah gambar bukti.");
        tempUser.buktiUrl = resData.data.url;

        // 3. Simpan ke Supabase (Kolom Kapital: Nama, UID, Upline)
        const { error } = await db.from('members').insert([{
            Nama: tempUser.nama,
            UID: tempUser.uid,
            Upline: tempUser.upline || null,
            TanggalBergabung: tempUser.tgl ? new Date(tempUser.tgl).toISOString() : new Date().toISOString()
        }]);

        if (error) throw error;

        // Transisi ke Tombol Telegram
        document.getElementById('registrationFormSection').style.display = 'none';
        document.getElementById('postRegActions').style.display = 'block';

    } catch (err) {
        alert("Terjadi Kesalahan: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SIMPAN & VALIDASI DATA";
    }
});

// LINK AKTIVASI SINYAL (@DvTeam102)
document.getElementById('btnTeleAktivasi').addEventListener('click', () => {
    const jam = new Date().getHours();
    const salam = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
    const pesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${tempUser.nama}
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${tempUser.uid}
UID Referal: ${tempUser.upline || '-'}
Nama Lengkap: ${tempUser.nama}
Usia: ${tempUser.usia || '-'}
Tempat Tinggal : ${tempUser.alamat || '-'}
Pekerjaan: ${tempUser.kerja || '-'}

Screenshot Saldo: ${tempUser.buktiUrl}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;
    window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;
});

// LINK GABUNG GROUP (@DvTeamNP)
document.getElementById('btnTeleGroup').addEventListener('click', () => {
    const pesan = `Halo @DvTeamNP. Saya anggota baru (UID: ${tempUser.uid}).
Nama: ${tempUser.nama}.
Izin bergabung ke Group Edukasi Anggota NP. Terima kasih.`;
    window.location.href = `https://t.me/DvTeamNP?text=${encodeURIComponent(pesan)}`;
});

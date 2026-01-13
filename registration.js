const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

// API KEY BARU YANG AKTIF
const IMGBB_API_KEY = '5a68759600115086058e17409247657f'; 

let tempUser = {};

// Preview Gambar
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
        alert("Harap isi UID, Nama, dan Upload Screenshot Saldo!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "MEMPROSES...";

    try {
        // 1. Cek UID di Supabase (Gunakan 'UID' Kapital)
        const { data: existing } = await db.from('members').select('UID').eq('UID', tempUser.uid).maybeSingle();
        if (existing) {
            alert("UID " + tempUser.uid + " sudah terdaftar!");
            btn.disabled = false;
            btn.textContent = "SIMPAN & VALIDASI";
            return;
        }

        // 2. Upload ke ImgBB
        let formData = new FormData();
        formData.append("image", fileFile);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData
        });
        
        const resData = await res.json();
        if (!resData.success) throw new Error(resData.error.message);
        
        tempUser.buktiUrl = resData.data.url;

        // 3. Simpan ke Supabase (WAJIB KAPITAL: Nama, UID, Upline)
        const { error } = await db.from('members').insert([{
            Nama: tempUser.nama,
            UID: tempUser.uid,
            Upline: tempUser.upline || null,
            TanggalBergabung: tempUser.tgl ? new Date(tempUser.tgl).toISOString() : new Date().toISOString()
        }]);

        if (error) throw error;

        // Berhasil: Ganti tampilan ke tombol Telegram
        document.getElementById('formSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'block';

    } catch (err) {
        alert("Gagal: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "SIMPAN & VALIDASI";
    }
});

// Fungsi Tombol Telegram Sesuai Request Anda
document.getElementById('btnAktivasiSinyal').addEventListener('click', () => {
    const jam = new Date().getHours();
    const salam = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
    const pesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${tempUser.nama}
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${tempUser.uid}
UID Referal: ${tempUser.upline || '-'}
Nama Lengkap: ${tempUser.nama}
Usia: ${tempUser.usia || '-'}
Tempat Tinggal: ${tempUser.alamat || '-'}
Pekerjaan: ${tempUser.kerja || '-'}

Screenshot Saldo: ${tempUser.buktiUrl}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;
    window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;
});

document.getElementById('btnGabungGroup').addEventListener('click', () => {
    const pesan = `Halo @DvTeamNP. Saya anggota baru (UID: ${tempUser.uid}). Izin bergabung ke Group Edukasi.`;
    window.location.href = `https://t.me/DvTeamNP?text=${encodeURIComponent(pesan)}`;
});

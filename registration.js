const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let tempUser = {};

// Proses Simpan Data
document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    tempUser = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    if (!tempUser.uid || !tempUser.nama) {
        alert("UID dan Nama Lengkap wajib diisi!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "MEMPROSES...";

    try {
        // Cek Duplikasi (Wajib pakai UID Kapital)
        const { data: existing } = await db.from('members').select('UID').eq('UID', tempUser.uid).maybeSingle();
        if (existing) {
            alert("UID " + tempUser.uid + " sudah terdaftar!");
            btn.disabled = false;
            btn.textContent = "Simpan & Verifikasi Data";
            return;
        }

        // Simpan ke Supabase (Kolom Kapital: Nama, UID, Upline, TanggalBergabung)
        const { error } = await db.from('members').insert([{
            Nama: tempUser.nama,
            UID: tempUser.uid,
            Upline: tempUser.upline || null,
            TanggalBergabung: tempUser.tgl ? new Date(tempUser.tgl).toISOString() : new Date().toISOString()
        }]);

        if (error) throw error;

        // Pindah ke bagian sukses
        document.getElementById('formSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'block';

    } catch (err) {
        alert("Gagal menyimpan: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Simpan & Verifikasi Data";
    }
});

// Checklist grup untuk mengaktifkan tombol aktivasi
document.getElementById('checkGroup').addEventListener('change', function() {
    const btnAktivasi = document.getElementById('btnTeleAktivasi');
    if (this.checked) {
        btnAktivasi.disabled = false;
        btnAktivasi.style.opacity = "1";
        btnAktivasi.style.cursor = "pointer";
    } else {
        btnAktivasi.disabled = true;
        btnAktivasi.style.opacity = "0.5";
        btnAktivasi.style.cursor = "not-allowed";
    }
});

// Aksi Kirim ke Telegram Admin (@DvTeam102)
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

(SAYA AKAN MELAMPIRKAN SCREENSHOT SALDO SETELAH PESAN INI)

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

    window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;
});

const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let userData = {};

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    userData = {
        uid: document.getElementById('reg-uid').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        tele: document.getElementById('reg-tele').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    if (!userData.uid || !userData.nama) { alert("UID & Nama Wajib Diisi!"); return; }

    btn.disabled = true;
    btn.textContent = "MEMVALIDASI...";

    try {
        // 1. Simpan ke Supabase (HURUF BESAR sesuai tabel Anda)
        const { error } = await db.from('members').insert([{
            Nama: userData.nama,
            UID: userData.uid,
            TanggalBergabung: userData.tgl ? new Date(userData.tgl).toISOString() : new Date().toISOString()
        }]);

        if (error) throw error;

        // 2. Sembunyikan form, tampilkan tombol aksi
        document.getElementById('registrationFormSection').style.display = 'none';
        document.getElementById('postRegActions').style.display = 'block';

    } catch (err) {
        alert("Gagal: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Simpan & Lanjutkan";
    }
});

// AKSI 1: AKTIVASI SINYAL
document.getElementById('btnTeleAktivasi').addEventListener('click', () => {
    const pesan = `Halo Admin @DvTeam102. Saya ingin mengajukan AKTIVASI SINYAL.
Data Diri:
Nama: ${userData.nama}
UID: ${userData.uid}
Telegram: ${userData.tele}

Saya sudah melakukan deposit awal, mohon bantuannya untuk proses aktivasi.`;
    window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;
});

// AKSI 2: GABUNG GROUP
document.getElementById('btnTeleGroup').addEventListener('click', () => {
    const pesan = `Halo @DvTeamNP. Saya anggota baru dengan UID ${userData.uid}.
Nama: ${userData.nama}
Username Telegram: ${userData.tele}

Mohon izin bergabung ke dalam Group Edukasi. Terima kasih.`;
    window.location.href = `https://t.me/DvTeamNP?text=${encodeURIComponent(pesan)}`;
});

// KONEKSI DATABASE SUPABASE
const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    
    // Ambil input dari form
    const inputData = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    if (!inputData.uid || !inputData.nama) {
        alert("Nama & UID wajib diisi!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Sedang Menyimpan...";

    try {
        // 1. Cek duplikasi UID (Pakai UID Huruf Besar sesuai DB Anda)
        const { data: existing } = await db.from('members').select('UID').eq('UID', inputData.uid).maybeSingle();
        if (existing) {
            alert("UID sudah terdaftar!");
            btn.disabled = false;
            btn.textContent = "Kirim & Aktivasi via Telegram";
            return;
        }

        // 2. Insert ke Supabase (PAKAI HURUF BESAR SESUAI TABEL ANDA)
        const joinDate = inputData.tgl ? new Date(inputData.tgl).toISOString() : new Date().toISOString();
        
        const { error } = await db.from('members').insert([{ 
            Nama: inputData.nama, 
            UID: inputData.uid, 
            Upline: inputData.upline || null, 
            TanggalBergabung: joinDate 
        }]);

        if (error) throw error;

        // 3. Jika berhasil, buat format pesan Telegram
        const jam = new Date().getHours();
        const salam = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
        
        const pesanTelegram = `Halo, selamat ${salam}. Perkenalkan, nama saya ${inputData.nama}.
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${inputData.uid}
UID Referal: ${inputData.upline || '-'}
Nama Lengkap: ${inputData.nama}
Usia: ${inputData.usia || '-'}
Tempat Tinggal : ${inputData.alamat || '-'}
Pekerjaan: ${inputData.kerja || '-'}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

        // Kirim ke Telegram Admin @DvTeam102
        const telegramUrl = `https://t.me/DvTeam102?text=${encodeURIComponent(pesanTelegram)}`;
        window.location.href = telegramUrl;

    } catch (err) {
        alert("Gagal menyimpan ke database: " + err.message);
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = "Kirim & Aktivasi via Telegram";
    }
});

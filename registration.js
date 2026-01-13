// Konfigurasi Supabase
const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    const data = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    // Validasi input
    if (!data.uid || !data.nama) {
        alert("Mohon isi UID dan Nama Lengkap!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Memproses...";

    try {
        // 1. Cek duplikasi di Supabase
        const { data: existing } = await db.from('members').select('uid').eq('uid', data.uid).maybeSingle();
        if (existing) {
            alert("UID " + data.uid + " sudah terdaftar!");
            btn.disabled = false;
            btn.textContent = "Kirim & Aktivasi via Telegram";
            return;
        }

        // 2. Simpan ke Supabase (Menyesuaikan kolom database Anda)
        const { error: insertError } = await db.from('members').insert([{
            nama: data.nama,
            uid: data.uid,
            upline: data.upline || null,
            tanggalbergabung: data.tgl ? new Date(data.tgl).toISOString() : new Date().toISOString()
        }]);

        if (insertError) throw insertError;

        // 3. Kirim ke Telegram Admin @DvTeam102
        const jam = new Date().getHours();
        const salam = jam < 11 ? "Pagi" : jam < 15 ? "Siang" : jam < 18 ? "Sore" : "Malam";
        
        const formatPesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${data.nama}.
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${data.uid}
UID Referal: ${data.upline || '-'}
Nama Lengkap: ${data.nama}
Usia: ${data.usia || '-'}
Tempat Tinggal : ${data.alamat || '-'}
Pekerjaan: ${data.kerja || '-'}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

        // Redirect ke Telegram
        const telegramLink = `https://t.me/DvTeam102?text=${encodeURIComponent(formatPesan)}`;
        window.location.href = telegramLink;

    } catch (err) {
        alert("Gagal: " + err.message);
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.textContent = "Kirim & Aktivasi via Telegram";
    }
});

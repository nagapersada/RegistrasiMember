const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const data = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    // Validasi input wajib
    if (!data.uid || !data.nama) {
        return showNotification("UID dan Nama Lengkap wajib diisi!");
    }

    const btn = document.getElementById('btnSubmitReg');
    btn.disabled = true;
    btn.textContent = "Mengecek UID...";

    try {
        // --- 1. VALIDASI: Cek apakah UID sudah ada di database ---
        const { data: existingMember, error: checkError } = await db
            .from('members')
            .select('uid')
            .eq('uid', data.uid)
            .maybeSingle();

        if (checkError) throw checkError;

        if (existingMember) {
            btn.disabled = false;
            btn.textContent = "Kirim & Aktivasi via Telegram";
            return alert("UID ini sudah terdaftar! Silakan hubungi admin jika ada kesalahan.");
        }

        // --- 2. SIMPAN: Masukkan ke Supabase ---
        btn.textContent = "Menyimpan Data...";
        const { error: insertError } = await db.from('members').insert([{
            nama: data.nama,
            uid: data.uid,
            upline: data.upline || null,
            tanggalbergabung: data.tgl ? new Date(data.tgl).toISOString() : new Date().toISOString()
        }]);

        if (insertError) throw insertError;

        // --- 3. TELEGRAM: Siapkan format pesan ---
        const salam = getWaktuSalam();
        const pesanTelegram = `Halo, selamat ${salam}. Perkenalkan, nama saya ${data.nama}.
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${data.uid}
UID Referal: ${data.upline || '-'}
Nama Lengkap: ${data.nama}
Usia: ${data.usia || '-'}
Tempat Tinggal: ${data.alamat || '-'}
Pekerjaan: ${data.kerja || '-'}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

        const encodedPesan = encodeURIComponent(pesanTelegram);
        const telegramUrl = `https://t.me/DvTeam102?text=${encodedPesan}`;
        
        alert("Data berhasil tersimpan! Klik OK untuk melanjutkan ke Telegram Admin.");
        window.location.href = telegramUrl;

    } catch (err) {
        console.error(err);
        alert("Terjadi kesalahan: " + err.message);
    } finally {
        btn.disabled = false;
        btn.textContent = "Kirim & Aktivasi via Telegram";
    }
});

function getWaktuSalam() {
    const jam = new Date().getHours();
    if (jam < 11) return "pagi";
    if (jam < 15) return "siang";
    if (jam < 18) return "sore";
    return "malam";
}

function showNotification(msg) {
    alert(msg); // Bisa diganti dengan toast notification jika diinginkan
}

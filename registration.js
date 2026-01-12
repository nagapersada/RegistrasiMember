/* Gunakan Koneksi Supabase yang sama dengan script.js Anda */
const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    const fields = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    // Validasi Dasar
    if (!fields.uid || !fields.nama) {
        showNotification("Mohon isi UID dan Nama Lengkap!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "Sedang Memverifikasi...";

    try {
        // 1. Cek Duplikasi UID
        const { data: existing, error: checkError } = await db
            .from('members')
            .select('uid')
            .eq('uid', fields.uid)
            .maybeSingle();

        if (checkError) throw checkError;
        if (existing) {
            alert("⚠️ UID " + fields.uid + " sudah terdaftar di sistem kami.");
            btn.disabled = false;
            btn.textContent = "Kirim & Aktivasi via Telegram";
            return;
        }

        // 2. Simpan ke Supabase
        btn.textContent = "Mengamankan Data...";
        const { error: insertError } = await db.from('members').insert([{
            nama: fields.nama,
            uid: fields.uid,
            upline: fields.upline || null,
            tanggalbergabung: fields.tgl ? new Date(fields.tgl).toISOString() : new Date().toISOString()
        }]);

        if (insertError) throw insertError;

        // 3. Arahkan ke Telegram
        const jam = new Date().getHours();
        const salam = jam < 11 ? "Pagi" : jam < 15 ? "Siang" : jam < 18 ? "Sore" : "Malam";
        
        const pesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${fields.nama}.
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${fields.uid}
UID Referal: ${fields.upline || '-'}
Nama Lengkap: ${fields.nama}
Usia: ${fields.usia || '-'}
Tempat Tinggal: ${fields.alamat || '-'}
Pekerjaan: ${fields.kerja || '-'}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

        window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;

    } catch (err) {
        console.error(err);
        showNotification("Terjadi kendala teknis. Coba lagi.");
    } finally {
        btn.disabled = false;
        btn.textContent = "Kirim & Aktivasi via Telegram";
    }
});

function showNotification(msg) {
    const note = document.getElementById('notification');
    note.textContent = msg;
    note.classList.add('show');
    setTimeout(() => note.classList.remove('show'), 3000);
}

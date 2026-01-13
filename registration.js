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

    if (!fields.uid || !fields.nama) {
        alert("Nama & UID tidak boleh kosong!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "MEMPROSES...";

    try {
        // 1. CEK DATA (Pakai UID Huruf Besar)
        const { data: existing } = await db.from('members').select('UID').eq('UID', fields.uid).maybeSingle();
        
        if (existing) {
            alert("UID " + fields.uid + " sudah terdaftar di sistem!");
            btn.disabled = false;
            btn.textContent = "KIRIM & AKTIVASI VIA TELEGRAM";
            return;
        }

        // 2. INPUT DATA (WAJIB HURUF BESAR SESUAI script.js ANDA)
        const { error } = await db.from('members').insert([{
            Nama: fields.nama,
            UID: fields.uid,
            Upline: fields.upline || null,
            TanggalBergabung: fields.tgl ? new Date(fields.tgl).toISOString() : new Date().toISOString()
        }]);

        if (error) {
            // Jika masih error 'column not found', kita tampilkan pesan teknisnya
            throw new Error(error.message);
        }

        // 3. KIRIM KE TELEGRAM (Jika Insert Berhasil)
        const jam = new Date().getHours();
        const salam = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
        
        const pesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${fields.nama}.
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${fields.uid}
UID Referal: ${fields.upline || '-'}
Nama Lengkap: ${fields.nama}
Usia: ${fields.usia || '-'}
Tempat Tinggal : ${fields.alamat || '-'}
Pekerjaan: ${fields.kerja || '-'}

Terima kasih, mohon bantuannya untuk proses aktivasi sinyal saya.`;

        window.location.href = `https://t.me/DvTeam102?text=${encodeURIComponent(pesan)}`;

    } catch (err) {
        alert("CRITICAL ERROR: " + err.message);
        console.error("Detail Error:", err);
    } finally {
        btn.disabled = false;
        btn.textContent = "KIRIM & AKTIVASI VIA TELEGRAM";
    }
});

const supabaseUrl = 'https://hysjbwysizpczgcsqvuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5c2pid3lzaXpwY3pnY3NxdnV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MjA2MTYsImV4cCI6MjA3OTQ5NjYxNn0.sLSfXMn9htsinETKUJ5IAsZ2l774rfeaNNmB7mVQcR4';
const db = window.supabase.createClient(supabaseUrl, supabaseKey);

let tempUser = {};
let groupsJoined = 0;
let tele1Sent = false;
let tele2Sent = false;

document.getElementById('btnSubmitReg').addEventListener('click', async () => {
    const btn = document.getElementById('btnSubmitReg');
    tempUser = {
        uid: document.getElementById('reg-uid').value.trim(),
        upline: document.getElementById('reg-upline').value.trim(),
        nama: document.getElementById('reg-nama').value.trim(),
        tele: document.getElementById('reg-tele').value.trim(),
        usia: document.getElementById('reg-usia').value.trim(),
        alamat: document.getElementById('reg-alamat').value.trim(),
        kerja: document.getElementById('reg-kerja').value.trim(),
        tgl: document.getElementById('reg-tgl').value
    };

    if (!tempUser.uid || !tempUser.upline || !tempUser.nama || !tempUser.tele) {
        alert("UID, UID Referral, Nama, dan Username Telegram wajib diisi!");
        return;
    }

    btn.disabled = true;
    btn.textContent = "MEMVALIDASI DATA...";

    try {
        const { data: refCheck, error: refError } = await db.from('members').select('UID').eq('UID', tempUser.upline).maybeSingle();
        if (refError) throw refError;
        if (!refCheck) {
            alert("UID REFERRAL ERROR, SILAHKAN CEK KEMBALI..");
            btn.disabled = false;
            btn.textContent = "Simpan & Verifikasi Data";
            return; 
        }

        const { error: insertError } = await db.from('members').insert([{
            Nama: tempUser.nama,
            UID: tempUser.uid,
            Upline: tempUser.upline,
            TanggalBergabung: tempUser.tgl ? new Date(tempUser.tgl).toISOString() : new Date().toISOString()
        }]);

        if (insertError) throw insertError;

        document.getElementById('formSection').style.display = 'none';
        document.getElementById('actionSection').style.display = 'block';

    } catch (err) {
        alert("Terjadi Kesalahan: " + err.message);
        btn.disabled = false;
        btn.textContent = "Simpan & Verifikasi Data";
    }
});

function handleGroupJoin(element, url) {
    window.open(url, '_blank');
    if (element.getAttribute('data-joined') !== 'true') {
        element.setAttribute('data-joined', 'true');
        element.style.backgroundColor = "white";
        element.style.color = "#000";
        element.style.borderColor = "white";
        element.innerHTML = "✅ " + element.innerText;
        
        groupsJoined++;
        if (groupsJoined >= 4) {
            document.getElementById('checkGroup').checked = true;
            document.getElementById('activationContainer').style.display = 'block';
        }
    }
}

// FUNGSI MEMBUKA JENDELA BARU (MODAL)
document.getElementById('btnOpenModal').addEventListener('click', () => {
    const jam = new Date().getHours();
    const salam = jam < 11 ? "pagi" : jam < 15 ? "siang" : jam < 18 ? "sore" : "malam";
    
    const formatPesan = `Halo, selamat ${salam}. Perkenalkan, nama saya ${tempUser.nama}
Saya telah melakukan deposit pertama dan ingin mengajukan aktivasi sinyal.
Berikut data diri saya untuk diproses:

UID saya: ${tempUser.uid}
UID Referral: ${tempUser.upline}
Nama Lengkap: ${tempUser.nama}
Username Telegram: ${tempUser.tele}
Usia: ${tempUser.usia || '-'}
Tempat Tinggal : ${tempUser.alamat || '-'}
Pekerjaan: ${tempUser.kerja || '-'}

(SAYA AKAN MELAMPIRKAN SCREENSHOT SALDO SETELAH PESAN INI)

Terima kasih.`;

    document.getElementById('textToCopy').innerText = formatPesan;
    document.getElementById('copyModal').style.display = 'flex';
});

// FUNGSI SALIN TEKS
document.getElementById('btnCopyOnly').addEventListener('click', () => {
    const text = document.getElementById('textToCopy').innerText;
    navigator.clipboard.writeText(text).then(() => {
        alert("Format pesan berhasil disalin!");
    });
});

// FUNGSI CEK STATUS PENGIRIMAN MODAL
function checkFinalStatus() {
    if (tele1Sent && tele2Sent) {
        document.getElementById('modalNormalContent').style.display = 'none';
        document.getElementById('modalFinishContent').style.display = 'block';
    }
}

// LOGIKA TOMBOL KE ADMIN TELEGRAM DI MODAL
document.getElementById('btnGoToTele1').addEventListener('click', function() { 
    window.open('https://t.me/DvTeam102', '_blank'); 
    this.style.backgroundColor = "white";
    this.style.color = "#000";
    this.style.borderColor = "white";
    this.innerHTML = "✅ DIKIRIM KE @DvTeam102";
    tele1Sent = true;
    checkFinalStatus();
});

document.getElementById('btnGoToTele2').addEventListener('click', function() { 
    window.open('https://t.me/DvTeamNP', '_blank'); 
    this.style.backgroundColor = "white";
    this.style.color = "#000";
    this.style.borderColor = "white";
    this.innerHTML = "✅ DIKIRIM KE @DvTeamNP";
    tele2Sent = true;
    checkFinalStatus();
});

/* ================================================================
   COMMON.JS - dipakai semua halaman: navigasi, progres & dialog
   ================================================================ */
const $ = s => document.querySelector(s);

// Peta nama halaman -> lokasi file (relatif dari folder halaman mana pun)
const PAGES = {
    menu: '../Main Menu/Main Menu.html',
    materi: '../Materi/Materi.html',
    panduan: '../Panduan/Panduan.html',
    lab: '../Praktikum/Praktikum.html',
    quiz: '../Evaluasi/Evaluasi.html',
    profile: '../Profil/Profil.html'
};

/* ================= TRANSISI HALAMAN =================
   Layar "tirai" berwarna menutup saat pindah halaman dan membuka saat halaman baru tampil.
   Berlaku di semua halaman yang memuat common.js. Ubah warna / kecepatan di sini. */
const WARNA_TRANSISI = '#546a9a';
const DURASI_TRANSISI = 350; // ms

const tirai = (() => {
    const st = document.createElement('style');
    st.textContent = `#vlTirai{position:fixed;inset:0;z-index:9999;background:${WARNA_TRANSISI};opacity:1;
        pointer-events:none;transition:opacity ${DURASI_TRANSISI}ms ease}#vlTirai.buka{opacity:0}`;
    document.head.appendChild(st);
    const t = document.createElement('div');
    t.id = 'vlTirai';
    document.body.appendChild(t);
    return t;
})();

let sedangPindah = false;
const bukaTirai = () => { sedangPindah = false; tirai.classList.add('buka'); };
requestAnimationFrame(() => requestAnimationFrame(bukaTirai)); // halaman baru: tirai membuka

// Pindah ke alamat mana pun dengan transisi (dipakai juga oleh tautan di audio.js)
function pindah(url) {
    if (sedangPindah) return;
    sedangPindah = true;
    if (typeof simpanWaktuMusik === 'function') simpanWaktuMusik(); // musik lanjut di halaman berikutnya
    tirai.classList.remove('buka');                                  // tirai menutup
    setTimeout(() => { location.href = url; }, DURASI_TRANSISI);
}

// Pindah halaman berdasarkan nama di PAGES
function go(id) {
    if (typeof SFX === 'function') SFX('transisi');
    pindah(PAGES[id]);
}

document.addEventListener('click', e => {
    const b = e.target.closest('[data-go]');
    if (b) go(b.dataset.go);
});

// Saat halaman tampil (juga saat kembali dengan tombol Back)
window.addEventListener('pageshow', () => {
    bukaTirai();
    requestAnimationFrame(() => {
        const page = document.querySelector('.page');
        if (page) page.classList.add('active');
    });
});

/* ================= PROGRES (disimpan di localStorage) ================= */
const PROGRESS = {
    kunciP: 'vl_praktikum_selesai',
    kunciE: 'vl_evaluasi_hasil',
    baca(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    tulis(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    praktikumDone() { return this.baca(this.kunciP) === '1'; },
    setPraktikumDone() { this.tulis(this.kunciP, '1'); },
    evaluasiHasil() { try { return JSON.parse(this.baca(this.kunciE)); } catch (e) { return null; } },
    simpanEvaluasi(jawaban) { this.tulis(this.kunciE, JSON.stringify(jawaban)); },
    semuaSelesai() { return this.praktikumDone() && !!this.evaluasiHasil(); },
    reset() {
        try {
            localStorage.removeItem(this.kunciP);
            localStorage.removeItem(this.kunciE);
        } catch (e) {}
    }
};

/* ================= DIALOG PERINGATAN ================= */
// buttons: [{ label, cls, action }]  (cls 'alt' = tombol putih) | jenis: 'popup' (default) atau 'peringatan'
function showDialog(title, text, buttons, jenis) {
    closeDialog();
    if (typeof SFX === 'function') SFX(jenis || 'popup'); // 'peringatan' untuk dialog peringatan
    const ov = document.createElement('div');
    ov.className = 'vl-dialog';
    ov.id = 'vlDialog';
    ov.innerHTML = `<div class="vl-box"><h3>${title}</h3><p>${text}</p><div class="vl-actions"></div></div>`;
    buttons.forEach(b => {
        const el = document.createElement('button');
        el.textContent = b.label;
        el.className = 'vl-btn ' + (b.cls || '');
        el.onclick = () => { closeDialog(); if (b.action) b.action(); };
        ov.querySelector('.vl-actions').appendChild(el);
    });
    document.body.appendChild(ov);
}

function closeDialog() {
    const d = $('#vlDialog');
    if (d) d.remove();
}

// Pindah halaman; jika belum selesai, tampilkan peringatan dulu
function keluar(id, selesai, pesan) {
    if (selesai) return go(id);
    showDialog('Progres akan hilang', pesan + ' Jika kembali sekarang, progresmu akan hilang. Yakin ingin melanjutkan?', [
        { label: 'Tidak, terima kasih', cls: 'alt' },
        { label: 'Iya, lanjutkan', action: () => go(id) }
    ], 'peringatan');
}
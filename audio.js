/* ===== DAFTAR AUDIO (ganti nama file / volume di sini) =====
   file : lokasi file dari folder utama proyek. Kosongkan ('') untuk mematikan suara itu.
   vol  : volume 0 - 1
   loop : true = diputar berulang                                                  */
const AUDIO = {
    // --- Latar & umum ---
    musik:      { file: 'audio/musik-latar.mp3',         vol: 0.30, loop: true }, // musik latar semua halaman
    klik:       { file: 'audio/klik.mp3',                vol: 0.70 },             // setiap tombol/kartu diklik
    transisi:   { file: 'audio/pindah-halaman.mp3',      vol: 0.50 },             // berpindah halaman
    popup:      { file: 'audio/popup.mp3',               vol: 0.70 },             // pop-up informasi
    peringatan: { file: 'audio/peringatan.mp3',          vol: 0.80 },             // pop-up peringatan / salah langkah
    geser:      { file: 'audio/geser-kartu.mp3',         vol: 0.30 },             // geser slider materi / evaluasi
    pilih:      { file: 'audio/pilih-jawaban.mp3',       vol: 0.60 },             // memilih jawaban soal
    skor:       { file: 'audio/skor-hasil.mp3',          vol: 0.80 },             // hasil skor ditampilkan

    // --- Praktikum: interaksi alat ---
    ambil:      { file: 'audio/ambil-alat.mp3',          vol: 0.60 },             // alat mulai diseret
    jatuh:      { file: 'audio/jatuh-di-meja.mp3',       vol: 0.60 },             // alat jatuh/kembali ke tempat
    snap:       { file: 'audio/menempel-di-meja.mp3',    vol: 0.70 },             // alat menempel di slot meja
    benar:      { file: 'audio/langkah-benar.mp3',       vol: 0.50 },             // satu quest selesai
    selesai:    { file: 'audio/praktikum-selesai.mp3',   vol: 0.90 },             // seluruh praktikum selesai

    // --- Praktikum: efek reaksi ---
    gerus:      { file: 'audio/gerus-hati.mp3',          vol: 0.80 },             // hati digerus di mortar
    tuang:      { file: 'audio/tuang-cairan.mp3',        vol: 0.80 },             // air / ekstrak dituang
    tetes:      { file: 'audio/tetes-cairan.mp3',        vol: 0.80 },             // tetesan HCl / NaOH
    nyala:      { file: 'audio/nyalakan-api.mp3',        vol: 0.80 },             // korek menyalakan spiritus
    api:        { file: 'audio/api-menyala-loop.mp3',    vol: 0.30, loop: true }, // api spiritus (berulang)
    beku:       { file: 'audio/es-membeku.mp3',          vol: 0.80 },             // tabung D membeku
    panas:      { file: 'audio/panas-mendesis.mp3',      vol: 0.80 },             // tabung E dipanaskan
    gelembung:  { file: 'audio/gelembung-reaksi.mp3',    vol: 0.85 },             // H2O2 bereaksi (gelembung O2)
    bara:       { file: 'audio/lidi-membara.mp3',        vol: 0.80 },             // lidi membara di api
    uji:        { file: 'audio/uji-bara-menyala.mp3',    vol: 0.80 }              // lidi berbara dimasukkan ke tabung
};

/* ================= MESIN AUDIO (tidak perlu diubah) ================= */
const AUDIO_ROOT = new URL('.', document.currentScript.src).href; // folder utama proyek
// Mode pembungkus: start.html menaruh semua halaman di dalam <iframe name="vl-frame"> dan
// memegang musik latar, sehingga musik TIDAK putus saat pindah halaman.
const MODE_SHELL = !!window.VL_SHELL;              // true di start.html
const DALAM_SHELL = window.name === 'vl-frame';    // true di halaman yang dimuat dalam start.html
const kirimKeShell = pesan => { try { parent.postMessage(pesan, '*'); } catch (e) {} };
const KUNCI_SUARA = 'vl_suara';
const KUNCI_MUSIK = 'vl_musik_waktu';
let suaraAktif = true;
try { suaraAktif = localStorage.getItem(KUNCI_SUARA) !== '0'; } catch (e) {}

function buatAudio(nama) {
    const a = AUDIO[nama];
    if (!a || !a.file) return null;
    const el = new Audio(new URL(a.file, AUDIO_ROOT).href);
    el.volume = a.vol ?? 1;
    el.loop = !!a.loop;
    return el;
}

// Efek suara sekali putar: SFX('klik')
function SFX(nama) {
    if (!suaraAktif) return;
    const el = buatAudio(nama);
    if (el) el.play().catch(() => {});
}

// Efek berulang: SFX_LOOP('api', true) untuk mulai, SFX_LOOP('api', false) untuk berhenti
const loopAktif = {};
function SFX_LOOP(nama, nyala) {
    if (!nyala) {
        if (loopAktif[nama]) { loopAktif[nama].pause(); delete loopAktif[nama]; }
        return;
    }
    if (loopAktif[nama]) return;
    const el = buatAudio(nama);
    if (!el) return;
    loopAktif[nama] = el;
    if (suaraAktif) el.play().catch(() => {});
}

/* ----- Musik latar: lanjut dari detik terakhir saat pindah halaman ----- */
const musik = DALAM_SHELL ? null : buatAudio('musik'); // di dalam shell, musik diputar oleh start.html

function simpanWaktuMusik() {
    if (!musik || musik.paused) return;
    try { localStorage.setItem(KUNCI_MUSIK, musik.currentTime); } catch (e) {}
}

function mulaiMusik() {
    if (musik && suaraAktif) musik.play().catch(() => {}); // jika diblokir peramban, dicoba lagi saat pengguna berinteraksi
}

if (musik) {
    musik.addEventListener('loadedmetadata', () => {
        let t = 0;
        try { t = parseFloat(localStorage.getItem(KUNCI_MUSIK)); } catch (e) {}
        if (t && t < musik.duration) musik.currentTime = t;
    }, { once: true });
    setInterval(simpanWaktuMusik, 1000);
    addEventListener('pagehide', simpanWaktuMusik);
    mulaiMusik();
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
        document.addEventListener(ev, () => { if (musik.paused) mulaiMusik(); }, { passive: true }));
}

/* ----- Shell menerima kabar dari halaman di dalam frame ----- */
if (MODE_SHELL) {
    addEventListener('message', e => {
        const d = e.data;
        if (!d || !d.vl) return;
        if (d.vl === 'suara') {
            suaraAktif = !!d.aktif;
            if (!musik) return;
            if (suaraAktif) mulaiMusik(); else musik.pause();
        } else if (d.vl === 'interaksi' && musik && musik.paused) {
            mulaiMusik(); // pengguna baru berinteraksi: coba lagi memutar musik
        }
    });
}
/* Halaman di dalam shell: beri tahu shell saat pengguna berinteraksi / mengubah suara */
if (DALAM_SHELL) {
    ['pointerdown', 'keydown', 'touchstart'].forEach(ev =>
        document.addEventListener(ev, () => kirimKeShell({ vl: 'interaksi' }), { passive: true }));
    kirimKeShell({ vl: 'suara', aktif: suaraAktif });
}

/* ----- Efek klik pada semua tombol / kartu / tautan ----- */
document.addEventListener('click', e => {
    const el = e.target.closest('button, a[href], .btn, .button, .vl-btn, .swiper-button-next, .swiper-button-prev, .swiper-pagination-bullet');
    if (!el || el.disabled) return;
    SFX('klik');
    // Tautan biasa: tunda pindah halaman sebentar agar bunyi klik terdengar
    const href = el.getAttribute('href');
    if (el.tagName === 'A' && href && !href.startsWith('#') && el.target !== '_blank' &&
        !e.defaultPrevented && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        if (typeof pindah === 'function') pindah(el.href); // pakai transisi dari common.js
        else setTimeout(() => { location.href = el.href; }, 180);
    }
});

/* ----- Tombol suara (mute / aktifkan) di pojok layar ----- */
function pasangTombolSuara() {
    const style = document.createElement('style');
    style.textContent = `
        .sound-toggle { position: fixed; top: 7px; right: 12px; z-index: 3000; width: 42px; height: 42px;
            border-radius: 50%; border: 2px solid #546a9a; background: #fff; color: #465573; font-size: 20px;
            cursor: pointer; box-shadow: 0 4px 10px rgba(0,0,0,.2); transition: transform .15s; }
        .sound-toggle:hover { transform: scale(1.08); }
        body:has(#lab) .sound-toggle { right: 105px; } /* geser agar tidak menimpa tombol Quest */`;
    document.head.appendChild(style);

    const btn = document.createElement('button');
    btn.className = 'sound-toggle';
    btn.title = 'Suara';
    const ikon = () => { btn.textContent = suaraAktif ? '🔊' : '🔇'; };
    ikon();
    btn.onclick = () => {
        suaraAktif = !suaraAktif;
        try { localStorage.setItem(KUNCI_SUARA, suaraAktif ? '1' : '0'); } catch (e) {}
        ikon();
        kirimKeShell({ vl: 'suara', aktif: suaraAktif });
        if (suaraAktif) {
            mulaiMusik();
            Object.values(loopAktif).forEach(el => el.play().catch(() => {}));
        } else {
            if (musik) musik.pause();
            Object.values(loopAktif).forEach(el => el.pause());
        }
    };
    document.body.appendChild(btn);
}
if (!MODE_SHELL) { // start.html tidak butuh tombol sendiri
    if (document.body) pasangTombolSuara();
    else document.addEventListener('DOMContentLoaded', pasangTombolSuara);
}
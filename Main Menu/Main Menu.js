/* MAIN_MENU.JS - kunci tombol Evaluasi & tombol Ulangi */
const btnUlangi = document.getElementById('btnUlangi');

// Tampilkan tombol Ulangi hanya jika praktikum & evaluasi sudah selesai
function perbaruiTombol() {
    btnUlangi.classList.toggle('show', PROGRESS.semuaSelesai());
}
perbaruiTombol();
window.addEventListener('pageshow', perbaruiTombol);

// Evaluasi hanya bisa dibuka setelah praktikum
document.querySelector('.button.Evaluasi').addEventListener('click', e => {
    if (!PROGRESS.praktikumDone()) {
        e.preventDefault();
        showDialog('Evaluasi belum bisa dibuka', 'Kamu harus melakukan praktikum dahulu sebelum evaluasi.', [
            { label: 'OK' }
        ], 'peringatan');
    }
});

// Ulangi: hapus semua progres praktikum & evaluasi
btnUlangi.addEventListener('click', e => {
    e.preventDefault();
    showDialog('Hapus progres?', 'Apakah kamu yakin ingin menghapus semua progresmu?', [
        { label: 'Tidak', cls: 'alt' },
        { label: 'Iya', action: () => { PROGRESS.reset(); perbaruiTombol(); } }
    ], 'peringatan');
});
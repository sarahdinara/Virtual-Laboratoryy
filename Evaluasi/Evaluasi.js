const Q=[
 ['Gas yang terbentuk saat katalase menguraikan H₂O₂ adalah …',
    ['Karbon dioksida','Oksigen','Hidrogen','Nitrogen'],1],
 ['Bara lidi menyala lebih terang pada tabung A menunjukkan terbentuknya …',
    ['Gas O₂','Gas CO₂','Uap air','Gas N₂'],0],
 ['Tabung E (dipanaskan) hampir tanpa gelembung karena …',
    ['Substrat habis','Enzim mengalami denaturasi','Enzim menjadi aktif','H₂O₂ menguap seluruhnya'],1],
 ['Tabung B (HCl) menghasilkan gelembung sedikit karena …',
    ['pH rendah mengubah struktur enzim','HCl menambah enzim','Suhu naik','H₂O₂ bertambah'],0],
 ['Tabung A pada percobaan ini berfungsi sebagai …',
    ['Inhibitor','Kontrol / pembanding','Substrat','Katalis tambahan'],1],
 ['Pada tabung D (dingin), aktivitas enzim menurun karena enzim …',
    ['Rusak permanen','Berubah menjadi substrat','Menjadi pasif (kurang aktif)','Bereaksi dengan es'],2],
 ['Fungsi katalase di dalam sel hati adalah …',
    ['Mencerna protein','Menguraikan H₂O₂ yang bersifat racun','Mengubah glukosa jadi glikogen','Mengangkut oksigen'],1],
 ['Zat yang menempel pada sisi aktif enzim sehingga reaksi terhambat disebut …',
    ['Inhibitor kompetitif','Inhibitor nonkompetitif','Koenzim','Substrat'],0]];

// Tampilkan soal
$('#qs').innerHTML=Q.map((q,i)=>`<div class="qz"><p><b>${i+1}.</b> ${q[0]}</p>${q[1].map((o,j)=>`<label><input type="radio" name="q${i}" value="${j}"> ${'ABCD'[j]}. ${o}</label>`).join('')}</div>`).join('');

// Slider 2 card: Kesimpulan -> Latihan soal (hanya pindah lewat tombol "Oke")
const swiper = new Swiper('.eval-swiper', { allowTouchMove: false, speed: 500 });
$('#btnOke').onclick = () => swiper.slideNext();
swiper.on('slideChange', () => SFX('geser'));
document.querySelectorAll('.qz input').forEach(inp => inp.addEventListener('change', () => SFX('pilih')));

function tampilkanHasil() {
    let s = 0;
    document.querySelectorAll('.qz').forEach((d, i) => {
        const c = document.querySelector(`input[name=q${i}]:checked`), ok = c && +c.value === Q[i][2];
        if (ok) s++;
        d.className = 'qz ' + (ok ? 'right' : 'wrong');
    });
    $('#score').innerHTML = `Skor: ${s} / ${Q.length} &nbsp;(Nilai ${Math.round(s / Q.length * 100)})<br><small>${s >= 7 ? 'Luar biasa! Pemahamanmu sangat baik.' : s >= 5 ? 'Bagus! Pelajari lagi bagian yang salah.' : 'Ayo ulangi praktikum dan baca materi kembali.'}</small>`;
    document.querySelectorAll('.qz input').forEach(inp => inp.disabled = true);
    $('#calc').style.display = 'none';
    document.querySelectorAll('.eval-card')[1].scrollTo(0, 0);
    SFX('skor');
}

$('#calc').onclick = () => {
    const jawaban = Q.map((_, i) => {
        const c = document.querySelector(`input[name=q${i}]:checked`);
        return c ? +c.value : null;
    });
    if (jawaban.includes(null)) {
        showDialog('Soal belum lengkap', 'Jawab semua soal terlebih dahulu sebelum menghitung skor.', [{ label: 'OK' }], 'peringatan');
        return;
    }
    PROGRESS.simpanEvaluasi(jawaban); // simpan: evaluasi selesai
    tampilkanHasil();
};

// Akses halaman & pemulihan progres
if (!PROGRESS.praktikumDone()) {
    showDialog('Evaluasi belum bisa dibuka', 'Kamu harus melakukan praktikum dahulu sebelum evaluasi.', [
        { label: 'OK', action: () => go('menu') }
    ], 'peringatan');
} else if (PROGRESS.evaluasiHasil()) {
    PROGRESS.evaluasiHasil().forEach((v, i) => {
        const r = document.querySelector(`input[name=q${i}][value="${v}"]`);
        if (r) r.checked = true;
    });
    tampilkanHasil();
    swiper.slideTo(1, 0);
}
/* ================================================================
   PRAKTIKUM.JS - logika laboratorium: drag & drop, fisika, quest, reaksi (praktikum.html)
   ================================================================ */

/* ================= KONFIGURASI GAMBAR & VIDEO (edit path di sini) ================= */
// ok:1 = alat/bahan benar. img = path gambar item (e = emoji sementara sebelum gambar ada)
const ITEMS = [
    { id: 'hati', n: 'Hati Ayam', e: ' ', ok: 1, img: '../img/hati.png' },
    { id: 'air', n: 'Air 100 ml', e: ' ', ok: 1, img: '../img/air.png' },
    { id: 'es', n: 'Mangkuk Es Batu', e: ' ', ok: 1, img: '../img/mangkuk-es.png' },
    { id: 'h2o2', n: 'H₂O₂', e: ' ', ok: 1, img: '../img/h2o2.png' },
    { id: 'hcl', n: 'HCl', e: ' ', ok: 1, img: '../img/hcl.png' },
    { id: 'naoh', n: 'NaOH', e: ' ', ok: 1, img: '../img/naoh.png' },
    { id: 'mortar', n: 'mortar & Alu', e: ' ', ok: 1, img: '../img/mortar.png', imgIsi: '../img/mortar-ekstrak.png' }, // imgIsi = gambar setelah diberi hati ayam
    { id: 'lidi', n: 'Lidi', e: ' ', ok: 1, img: '../img/lidi.png' },
    { id: 'korek', n: 'Korek Api', e: ' ', ok: 1, img: '../img/korek.png' },
    { id: 'spiritus', n: 'Pembakar Spiritus', e: ' ', ok: 1, img: '../img/spiritus.png' },
    { id: 'gula', n: 'Gula Pasir', e: ' ', img: '../img/gula.png' },
    { id: 'minyak', n: 'Minyak Goreng', e: ' ', img: '../img/minyak.png' },
    { id: 'iodin', n: 'Larutan Iodin', e: ' ', img: '../img/iodin.png' },
    { id: 'mikro', n: 'Mikroskop', e: ' ', img: '../img/mikroskop.png' }
];
// Gambar/video reaksi: muncul LANGSUNG di atas alatnya.
// Semua video dihapus, kecuali video uji bara lidi (A-D) yang diputar 4 detik.
const MEDIA = {
 
};
'ABCD'.split('').forEach(L => {
    MEDIA[L + '_test'] = { video: `assets/video/${L}-uji-bara.mp4` };
});
const DURASI_UJI = 4000; // ms: lamanya video uji bara berjalan (lidi menghilang selama ini)
// Hasil pengamatan tiap tabung (n = jumlah gelembung animasi cadangan)
const R = {
    A: {
        n: 14,
        react: 'Gelembung gas O₂ banyak dan cepat → katalase bekerja optimal.',
        test: 'Bara lidi menyala lebih terang → gas yang terbentuk adalah O₂.'
    },
    B: {
        n: 3,
        react: 'Gelembung sangat sedikit → suasana asam mengubah struktur enzim, aktivitas turun.',
        test: 'Bara lidi hanya menyala redup/padam → O₂ yang terbentuk sedikit.'
    },
    C: {
        n: 3,
        react: 'Gelembung sangat sedikit → suasana basa menurunkan aktivitas enzim.',
        test: 'Bara lidi hanya menyala redup/padam → O₂ yang terbentuk sedikit.'
    },
    D: {
        n: 4,
        react: 'Gelembung sedikit → suhu dingin membuat enzim pasif (tidak rusak permanen).',
        test: 'Bara lidi menyala sedikit lebih terang → O₂ terbentuk perlahan.'
    },
    E: { n: 0, react: 'Hampir tidak ada gelembung → suhu tinggi menyebabkan denaturasi enzim.' }
};

/* ================= POP-UP, TOAST & PANEL QUEST ================= */

function popup(t, p) {
    const o = $('#popup');
    if (!t) {
        o.classList.remove('show');
        return
    }
    $('#pt').textContent = t;
    $('#pp').innerHTML = p;
    o.classList.add('show');
    SFX(/selesai/i.test(t) ? 'selesai' : /⚠|belum/i.test(t) ? 'peringatan' : 'popup')
}

function toast(t) {
    const o = $('#toast');
    o.textContent = t;
    o.classList.add('show');
    clearTimeout(o.tm);
    o.tm = setTimeout(() => o.classList.remove('show'), 6500)
}
$('#qtoggle').onclick = () => $('#lab').classList.toggle('qopen');

/* ================= DAFTAR QUEST ================= */
const S = [
    { t: 'Ambil semua alat & bahan yang benar dari rak atas. Lepaskan, biarkan jatuh ke meja (menempel otomatis).' },
    {
        t: 'Seret <b>Hati Ayam</b> ke <b>mortar & Alu</b> untuk digerus.',
        item: 'hati',
        target: 'mortar',
        fx: 'grind'
    },
    {
        t: 'Seret <b>Air 100 ml</b> ke mortar, lalu pisahkan endapan.',
        item: 'air',
        target: 'mortar',
        fx: 'extract'
    }
];
'ABCDE'.split('').forEach(L => S.push({ t: `Seret <b>mortar & Alu</b> untuk memasukkan ekstrak hati ayam ke tabung <b>${L}</b>.`, item: 'mortar', target: 'tube' + L, fx: 'fill', L }));
S.push({ t: 'Nyalakan <b>Pembakar Spiritus</b> dengan <b>Korek Api</b>.', item: 'korek', target: 'spiritus', fx: 'ignite' });
'ABCDE'.split('').forEach(L => {
    const T = 'tube' + L;
    if (L === 'B') S.push({ t: 'Tabung B: seret <b>HCl</b> ke tabung B (5 tetes).', item: 'hcl', target: T, fx: 'hcl', L });
    if (L === 'C') S.push({ t: 'Tabung C: seret <b>NaOH</b> ke tabung C (5 tetes).', item: 'naoh', target: T, fx: 'naoh', L });
    if (L === 'D') S.push({ t: 'Tabung D: tahan <b>tabung D</b> di dalam <b>Mangkuk Es Batu</b> selama <b>10 detik</b> hingga ekstrak membeku, lalu lepaskan (kembali ke rak).', item: T, target: 'es', hold: 10000, fx: 'es', L });
    if (L === 'E') S.push({ t: 'Tabung E: tahan <b>tabung E</b> di atas api pembakar spiritus selama <b>5 detik</b>, lalu lepaskan (kembali ke rak).', item: T, target: 'spiritus', hold: 5000, fx: 'heat', L });
    S.push({ t: `Tabung ${L}: seret <b>H₂O₂</b> ke tabung ${L}, amati gelembung.`, item: 'h2o2', target: T, fx: 'h2o2', L });
    if (L !== 'E') {
        S.push({ t: 'Dekatkan <b>Lidi</b> ke api pembakar spiritus (tahan 2 detik) hingga membara.', item: 'lidi', target: 'spiritus', hold: 2000, fx: 'light', L });
        S.push({ t: `Tabung ${L}: masukkan lidi berbara ke tabung ${L}.`, item: 'lidi', target: T, fx: 'test', L })
    }
});
let cur = 0, p1 = false;

function renderQ() {
    $('#qlist').innerHTML = S.slice(0, cur + 1).map((s, i) => `<div class="q ${i < cur ? 'ok' : 'now'}">${i < cur ? '✔ ' : ''}${s.t}</div>`).join('');
    $('#quest').scrollTop = 1e5
}

function done() {
    cur++;
    renderQ();
    if (cur < S.length) SFX('benar');
    if (cur >= S.length) {
        PROGRESS.setPraktikumDone(); // simpan: praktikum selesai (membuka halaman Evaluasi)
        $('#next').style.display = 'block';
        popup('Praktikum selesai!', 'Semua langkah telah dilakukan. Tekan panah ➜ di pojok kanan bawah untuk ke Evaluasi.')
    }
}

/* ================= EFEK REAKSI ================= */

// Video/gambar reaksi tampil maksimal sekian milidetik (ubah di sini: 2000-3000)
const MEDIA_MAKS = 3000;

function fxm(host, key, ms) {
    const m = MEDIA[key];
    if (!m) return; // tidak ada media untuk langkah ini
    host.querySelectorAll('.fx').forEach(x => x.remove());
    const d = document.createElement('div');
    d.className = 'fx';
    d.innerHTML = `<span>${m.video ? '🎬' : '🖼️'} ${(m.video || m.img || key).split('/').pop()}</span>` + (m.video ? `<video src="${m.video}" autoplay loop muted playsinline onerror="this.remove()"></video>` : m.img ? `<img src="${m.img}" alt="" onerror="this.remove()">` : '');
    host.appendChild(d);
    setTimeout(() => d.remove(), ms || MEDIA_MAKS)
}

// Ganti gambar sebuah alat (mis. mortar kosong -> mortar berisi ekstrak)
function gantiGambar(it, src) {
    const a = it.el.querySelector('.asset');
    let im = a.querySelector('img');
    if (!im) {
        im = document.createElement('img');
        im.alt = '';
        im.onerror = () => im.remove();
        a.appendChild(im);
    }
    im.src = src;
}

function bubbles(t, n) {
    t.tb.querySelectorAll('.bub').forEach(b => b.remove());
    for (let i = 0; i < n; i++) t.tb.insertAdjacentHTML('beforeend', `<span class="bub" style="left:${10 + Math.random() * 65}%;animation-delay:${Math.random() * 1.4}s"></span>`)
}

function fx(s) {
    const L = s.L, t = items['tube' + L];
    switch (s.fx) {
        case 'grind':
            SFX('gerus');
            gantiGambar(items.mortar, items.mortar.imgIsi); // mortar kini berisi ekstrak
            toast('Hati digerus hingga halus di mortar.');
            break;
        case 'extract':
            SFX('tuang');
            fxm(items.mortar.el, 'extract');
            toast('Air 100 ml ditambahkan, endapan dipisahkan → ekstrak hati (sumber katalase).');
            break;
        case 'fill':
            SFX('tuang');
            t.liq.style.height = '30%';
            t.liq.style.background = '#d98a7a';
            fxm(t.tb, 'fill');
            break;
        case 'hcl':
            SFX('tetes');
            t.liq.style.background = '#e6a23c';
            fxm(t.tb, 'hcl');
            toast('5 tetes HCl → suasana asam.');
            break;
        case 'naoh':
            SFX('tetes');
            t.liq.style.background = '#8e7cc3';
            fxm(t.tb, 'naoh');
            toast('5 tetes NaOH → suasana basa.');
            break;
        case 'ignite':
            SFX('nyala');
            SFX_LOOP('api', true);
            items.spiritus.el.classList.add('fire');
            toast('Pembakar spiritus menyala');
            break;
        case 'es':
            SFX('beku');
            t.el.classList.add('cold');
            t.liq.style.background = '#cfe8ff'; // ekstrak membeku
            toast('Ekstrak di tabung D membeku karena suhu dingin. Lepaskan tabung agar kembali ke rak.');
            break;
        case 'heat':
            SFX('panas');
            t.el.classList.add('hot');
            toast('Ekstrak dipanaskan → suhu tinggi. Lepaskan tabung agar kembali ke rak.');
            break;
        case 'h2o2':
            SFX('gelembung');
            t.liq.style.height = '60%';
            bubbles(t, R[L].n);
            toast(`Pengamatan tabung ${L}: ${R[L].react}`);
            break;
        case 'light':
            SFX('bara');
            items.lidi.el.classList.add('lit');
            toast('Ujung lidi membara. Segera masukkan ke tabung uji.');
            break;
        case 'test': {
            SFX('uji');
            const lidi = items.lidi;
            lidi.el.classList.remove('lit'); // gambar api/bara lidi hilang
            lidi.el.classList.add('hide');   // lidi "masuk" ke tabung -> menghilang
            fxm(t.tb, L + '_test', DURASI_UJI);
            toast(`Uji bara tabung ${L}: ${R[L].test}`);
            // setelah video selesai, lidi muncul lagi di tempat awal (tanpa api)
            setTimeout(() => {
                falling.delete(lidi);
                lidi.el.classList.remove('lit');
                home(lidi);
                lidi.el.classList.remove('hide');
            }, DURASI_UJI);
            break;
        }
    }
}

function attempt(it, tg) {
    const s = S[cur];
    if (s && s.item === it.id && s.target === tg && !s.hold) {
        fx(s);
        done();
        return
    }
    popup('Langkah belum tepat ⚠️', 'Coba lagi. Langkah saat ini:<br><br>' + (s ? s.t : '-'))
}
const hit = (x, y, id) => {
    const e = document.elementsFromPoint(x, y).map(n => n.closest('[data-target]')).find(n => n && n.dataset.target !== id);
    return e && e.dataset.target
};

/* ================= ITEM, FISIKA & SNAP ================= */
const items = {};
let drag = null, falling = new Set(), raf = 0;
const mk = (c, p) => {
    const d = document.createElement('div');
    d.className = c;
    p.appendChild(d);
    return d
};
[...ITEMS].sort(() => Math.random() - .5).forEach(d => {
    const it = { ...d, at: 'shelf', x: 0, y: 0, vx: 0, vy: 0 };
    items[d.id] = it;
    it.sslot = mk('slot', $('#shelf'));
    it.el = document.createElement('div');
    it.el.className = 'item';
    it.el.dataset.target = d.id;
    it.el.innerHTML = (d.id === 'spiritus' ? '<img src="../img/api-spiritus.png" class="flame-img" alt="Api"><span class="hbar"><u></u></span>' : d.id === 'lidi' ? '<img src="../img/api-lidi.png" class="ember-img" alt="Bara" onerror="this.remove()">' : d.id === 'es' ? '<span class="hbar"><u></u></span>' : '') + `<div class="asset"><span>${d.e}</span><img src="${d.img}" alt="" onerror="this.remove()"></div><small>${d.n}</small>`;
    $('#lab').appendChild(it.el);
    it.el.addEventListener('pointerdown', e => down(e, it));
});
const tslots = ITEMS.filter(i => i.ok).map((_, i) => mk('tslot', $(i < 5 ? '#tl' : '#tr')));
// tabung reaksi A–E (digambar CSS) di rak tengah meja; muncul setelah persiapan selesai
'ABCDE'.split('').forEach(L => {
    const id = 'tube' + L, it = { id, n: 'Tabung ' + L, at: 'table', x: 0, y: 0, vx: 0, vy: 0 };
    items[id] = it;
    it.tslot = mk('rslot', $('#rack'));
    it.el = document.createElement('div');
    it.el.className = 'item titem hide';
    it.el.dataset.target = id;
    it.el.innerHTML = `<div class="tube"><div class="liq"></div></div><b>${L}</b>`;
    $('#lab').appendChild(it.el);
    it.liq = it.el.querySelector('.liq');
    it.tb = it.el.querySelector('.tube');
    it.el.addEventListener('pointerdown', e => down(e, it))
});
const place = it => {
    it.el.style.left = it.x + 'px';
    it.el.style.top = it.y + 'px'
};

function home(it, anim) {
    const s = it.at === 'shelf' ? it.sslot : it.tslot, r = s.getBoundingClientRect();
    it.x = r.left + (r.width - it.el.offsetWidth) / 2;
    it.y = r.top;
    if (anim) {
        it.el.classList.add('snap');
        setTimeout(() => it.el.classList.remove('snap'), 300)
    }
    place(it)
}

function layout() {
    Object.values(items).forEach(it => {
        if (it !== (drag && drag.it) && !falling.has(it) && it.at !== 'moving') home(it)
    })
}
addEventListener('resize', layout);
setTimeout(layout, 100);
const warn = it => {
    it.el.classList.add('shake');
    setTimeout(() => it.el.classList.remove('shake'), 400);
    popup('Peringatan ⚠️', `<b>${it.n}</b> tidak diperlukan dalam praktikum katalase ini. Pilih alat/bahan lain!`)
};

function down(e, it) {
    if ($('#popup').classList.contains('show')) return;
    if (it.at === 'shelf') {
        if (p1) return;
        if (!it.ok) return warn(it)
    }
    if (!p1 && it.tslot) {
        it.tslot.occ = null;
        it.tslot = null
    }
    if (!p1) it.at = 'moving';
    falling.delete(it);
    it.vx = it.vy = 0;
    e.preventDefault();
    drag = { it, dx: e.clientX - it.x, dy: e.clientY - it.y, t: performance.now(), px: e.clientX, py: e.clientY, hs: 0, cool: 0, lastTarget: null };
    drag.iv = setInterval(holdTick, 100);
    it.el.classList.add('drag');
    SFX('ambil')
}
// tahan alat di atas api (tabung E 5 detik, lidi 2 detik)

function hideBars() {
    document.querySelectorAll('.hbar').forEach(b => b.style.display = 'none');
}

function holdTick() {
    if (!drag) return;
    const it = drag.it, s = S[cur], now = performance.now();
    const tg = s && s.hold ? items[s.target] : null, bar = tg && tg.el.querySelector('.hbar');
    const apiOk = !tg || s.target !== 'spiritus' || tg.el.classList.contains('fire'); // spiritus harus sudah menyala
    if (tg && s.item === it.id && now >= drag.cool && apiOk && hit(drag.px, drag.py, it.id) === s.target) {
        if (!drag.hs) drag.hs = now;
        const p = (now - drag.hs) / s.hold;
        bar.style.display = 'block';
        bar.firstChild.style.width = Math.min(100, p * 100) + '%';
        if (p >= 1) {
            bar.style.display = 'none';
            drag.hs = 0;
            drag.cool = now + 1000;      // jeda 1 detik sebelum alat ini bisa mengerjakan langkah berikutnya
            drag.lastTarget = s.target;  // melepas di target yang sama tidak dianggap langkah salah
            fx(s);
            done();
        }
    } else {
        drag.hs = 0;
        hideBars();
    }
}
addEventListener('pointermove', e => {
    if (!drag) return;
    const it = drag.it, nx = e.clientX - drag.dx, ny = e.clientY - drag.dy, now = performance.now(), dt = Math.max(now - drag.t, 8);
    it.vx = (nx - it.x) / dt * 7 + it.vx * .5;
    it.vy = (ny - it.y) / dt * 7 + it.vy * .5;
    it.x = nx;
    it.y = ny;
    drag.t = now;
    drag.px = e.clientX;
    drag.py = e.clientY;
    place(it)
});
addEventListener('pointerup', e => {
    if (!drag) return;
    const d = drag, it = d.it;
    drag = null;
    clearInterval(d.iv);
    hideBars();
    it.el.classList.remove('drag');
    if (p1 && performance.now() >= d.cool) {
        const tg = hit(e.clientX, e.clientY, it.id), s = S[cur];
        if (tg && tg !== d.lastTarget) {
            if (s && s.hold && s.item === it.id && s.target === tg) toast(tg === 'es' ? 'Belum cukup lama di mangkuk es. Tahan sampai 10 detik.' : 'Belum cukup lama di atas api. Pastikan pembakar sudah menyala, lalu tahan lebih lama.');
            else attempt(it, tg)
        }
    }
    it.vx = Math.max(-25, Math.min(25, it.vx));
    it.vy = Math.max(-25, Math.min(25, it.vy));
    falling.add(it);
    if (!raf) raf = requestAnimationFrame(tick)
});

function tick() {
    const sr = $('#stage').getBoundingClientRect(), fl = sr.top + sr.height * .925; // lantai = permukaan meja pada gambar
    falling.forEach(it => {
        const W = it.el.offsetWidth, H = it.el.offsetHeight;
        it.vy += .9;
        it.x += it.vx;
        it.y += it.vy;
        if (it.x < 0) {
            it.x = 0;
            it.vx *= -.6
        }
        if (it.x > innerWidth - W) {
            it.x = innerWidth - W;
            it.vx *= -.6
        }
        if (it.y < 0) {
            it.y = 0;
            it.vy = 0
        }
        if (it.y > fl - H) {
            it.y = fl - H;
            it.vy *= -.35;
            it.vx *= .8;
            if (Math.abs(it.vy) < 2.5) {
                place(it);
                falling.delete(it);
                land(it);
                return
            }
        }
        place(it)
    });
    raf = falling.size ? requestAnimationFrame(tick) : 0
}

function land(it) {
    SFX(!p1 && it.ok ? 'snap' : 'jatuh');
    if (p1) {
        home(it, true);
        return
    } // fase 2: alat kembali ke tempat awalnya (tabung → rak)
    if (!it.ok) {
        it.at = 'shelf';
        home(it, true);
        return
    }
    const cx = it.x + it.el.offsetWidth / 2;
    let best = null, bd = 1e9; // magnetic snap ke slot meja terdekat
    tslots.forEach(s => {
        if (s.occ) return;
        const r = s.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - cx);
        if (d < bd) {
            bd = d;
            best = s
        }
    });
    best.occ = it.id;
    it.tslot = best;
    it.at = 'table';
    home(it, true);
    if (ITEMS.filter(i => i.ok).every(i => items[i.id].at === 'table')) {
        p1 = true;
        'ABCDE'.split('').forEach(L => items['tube' + L].el.classList.remove('hide'));
        layout();
        popup('Alat & bahan lengkap ✔', 'Semua benar! Tabung reaksi A–E kini ada di rak tengah meja. Lanjutkan sesuai quest.');
        done()
    }
}
renderQ();


/* ================= PULIHKAN KONDISI SELESAI (jika praktikum sudah pernah diselesaikan) ================= */
function pulihkanSelesai() {
    ITEMS.filter(i => i.ok).forEach((d, i) => {
        const it = items[d.id], s = tslots[i];
        s.occ = it.id;
        it.tslot = s;
        it.at = 'table';
        home(it);
    });
    p1 = true;
    cur = S.length;
    renderQ();
    const warna = { B: '#e6a23c', C: '#8e7cc3', D: '#cfe8ff' };
    'ABCDE'.split('').forEach(L => {
        const t = items['tube' + L];
        t.el.classList.remove('hide');
        t.liq.style.height = '60%';
        if (warna[L]) t.liq.style.background = warna[L];
        bubbles(t, R[L].n);
    });
    items.tubeD.el.classList.add('cold');
    items.tubeE.el.classList.add('hot');
    items.spiritus.el.classList.add('fire');
    gantiGambar(items.mortar, items.mortar.imgIsi);
    $('#next').style.display = 'block';
}
if (PROGRESS.praktikumDone()) pulihkanSelesai();
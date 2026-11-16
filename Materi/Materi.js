const swiper = new Swiper('.card-wrapper', {
  loop: false, // Ubah dari true ke false agar posisi ujung slide terdeteksi akurat
  spaceBetween: 30,

  // Pagination Bullet
  pagination: {
    el: '.swiper-pagination',
    clickable: true,
    dynamicBullets: true
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // Responsive breakpoints
  breakpoints: {
    0: {
      slidesPerView: 1
    },
    768: {
      slidesPerView: 2
    },
    1024: {
      slidesPerView: 3
    }
  },

  // Event untuk memunculkan tombol "Mulai Praktikum" saat mencapai card/slide terakhir
  on: {
    slideChange: function () {
      if (typeof SFX === 'function') SFX('geser');
      const btnMulai = document.getElementById('btnMulai');
      
      // swiper.isEnd bernilai true jika slide terakhir sudah berada di area tampilan aktif
      if (swiper.isEnd) {
        btnMulai.classList.add('show');
      } else {
        btnMulai.classList.remove('show');
      }
    }
  }
});
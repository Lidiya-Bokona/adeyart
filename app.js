/**
 * Adey Art — Modular Client Application
 */

'use strict';

(function () {
  const STATE = {
    currentArtwork: null,
    selectedAmount: 20,
    selectedMethod: 'Telebirr',
    carouselIndex: 0,
    favorites: JSON.parse(localStorage.getItem('adey_art_favs') || '[]'),
    catalog: [
      {
        id: 'flower-01',
        title: 'Adey Abeba #01',
        minPrice: 20,
        file: 'assets/flowers/flower1.jpg',
        desc: 'Hand-drawn on paper with colored markers, inscribed with warm New Year wishes.'
      },
      {
        id: 'flower-02',
        title: 'Adey Abeba #02 (Highland Daisy)',
        minPrice: 20,
        file: 'assets/flowers/flower2.jpg',
        desc: 'Vibrant yellow gouache and pencil drawing on paper with festive holiday blessings.'
      },
      {
        id: 'flower-03',
        title: 'Adey Abeba #03',
        minPrice: 20,
        file: 'assets/flowers/flower3.jpg',
        desc: 'Hand-painted ceremonial flower drawing decorated with traditional cross patterns.'
      },
      {
        id: 'flower-04',
        title: 'Adey Abeba #04 (Spring Sunburst)',
        minPrice: 20,
        file: 'assets/flowers/flower4.jpg',
        desc: 'Detailed pencil and watercolor bloom on paper celebrating the end of the winter rains.'
      },
      {
        id: 'flower-05',
        title: 'Adey Abeba #05 (Peace & Harmony)',
        minPrice: 20,
        file: 'assets/flowers/flower5.jpg',
        desc: 'Original paper sketch with bright yellow petals symbolizing peace and new beginnings.'
      },
      {
        id: 'flower-06',
        title: 'Adey Abeba #06 (Holiday Bouquet)',
        minPrice: 20,
        file: 'assets/flowers/flower6.jpg',
        desc: 'Full paper composition of clustered Adey Abeba blooms hand-drawn for neighborhood gift-giving.'
      }
    ],
    orders: []
  };

  const dom = {
    views: document.querySelectorAll('.view'),
    navLinks: document.querySelectorAll('.nav-link'),
    galleryGrid: document.getElementById('galleryGrid'),
    favoritesGrid: document.getElementById('favoritesGrid'),
    favBadge: document.getElementById('favBadge'),
    searchInput: document.getElementById('searchInput'),
    // Navigation chrome
    siteHeader: document.getElementById('siteHeader'),
    navToggle: document.getElementById('navToggle'),
    navScrim: document.getElementById('navScrim'),
    // Carousel
    carouselStage: document.getElementById('carouselStage'),
    carouselTrack: document.getElementById('carouselTrack'),
    carouselDots: document.getElementById('carouselDots'),
    carouselPrev: document.getElementById('carouselPrev'),
    carouselNext: document.getElementById('carouselNext'),
    // Modal
    modal: document.getElementById('purchaseModal'),
    modalStageDetails: document.getElementById('modalStageDetails'),
    modalStagePayment: document.getElementById('modalStagePayment'),
    modalStageProcessing: document.getElementById('modalStageProcessing'),
    modalImg: document.getElementById('modalImg'),
    modalTitle: document.getElementById('modalTitle'),
    modalDesc: document.getElementById('modalDesc'),
    modalMinPrice: document.getElementById('modalMinPrice'),
    inputCustomPrice: document.getElementById('inputCustomPrice'),
    recipientNumber: document.getElementById('recipientNumber'),
    proofFileInput: document.getElementById('proofFileInput'),
    btnSubmitVerification: document.getElementById('btnSubmitVerification'),
    verificationHeading: document.getElementById('verificationHeading'),
    verificationText: document.getElementById('verificationText'),
    downloadContainer: document.getElementById('downloadContainer'),
    // Music
    bgMusic: document.getElementById('bgMusic'),
    musicToggle: document.getElementById('musicToggle')
  };

  /* Holiday Background Music */
  const MUSIC_MUTED_KEY = 'adey_art_music_muted';
  let musicUnlocked = false;

  function userMutedMusic() {
    return localStorage.getItem(MUSIC_MUTED_KEY) === '1';
  }

  function setMusicUIState(playing) {
    if (!dom.musicToggle) return;
    dom.musicToggle.classList.toggle('is-playing', playing);
    dom.musicToggle.classList.toggle('is-muted', !playing);
    dom.musicToggle.textContent = playing ? '🎵' : '🔇';
    dom.musicToggle.setAttribute('aria-pressed', String(playing));
    dom.musicToggle.setAttribute('aria-label', playing ? 'Mute holiday music' : 'Play holiday music');
    dom.musicToggle.title = playing ? 'Mute holiday music' : 'Play holiday music';
  }

  function tryPlayMusic() {
    if (!dom.bgMusic || userMutedMusic()) {
      setMusicUIState(false);
      return;
    }
    const playPromise = dom.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setMusicUIState(true))
        .catch(() => {
          // Autoplay blocked by the browser until the visitor interacts.
          setMusicUIState(false);
        });
    }
  }

  function unlockMusicOnFirstInteraction() {
    if (musicUnlocked || userMutedMusic()) return;
    musicUnlocked = true;
    tryPlayMusic();
  }

  function toggleMusic() {
    if (!dom.bgMusic) return;
    if (dom.bgMusic.paused) {
      localStorage.setItem(MUSIC_MUTED_KEY, '0');
      musicUnlocked = true;
      tryPlayMusic();
    } else {
      dom.bgMusic.pause();
      localStorage.setItem(MUSIC_MUTED_KEY, '1');
      setMusicUIState(false);
    }
  }

  function initMusic() {
    if (!dom.bgMusic || !dom.musicToggle) return;
    dom.musicToggle.addEventListener('click', toggleMusic);
    setMusicUIState(false);

    if (!userMutedMusic()) {
      tryPlayMusic();
      ['click', 'touchstart', 'keydown'].forEach(evt => {
        document.addEventListener(evt, unlockMusicOnFirstInteraction, { once: true, passive: true });
      });
    }
  }

  /* Carousel */
  let startX = 0;
  let currentDelta = 0;
  let isDragging = false;
  let autoplayTimer = null;
  const AUTOPLAY_DELAY_MS = 4200;

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => setSlide(STATE.carouselIndex + 1), AUTOPLAY_DELAY_MS);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  function initCarousel() {
    dom.carouselTrack.innerHTML = STATE.catalog.map(item => `
      <div class="carousel-slide" data-id="${item.id}">
        <img src="${item.file}" alt="${item.title}" onerror="this.src='assets/logo/adey-logo.svg'">
        <div class="slide-title">${item.title}</div>
        <div class="slide-meta">Min ${item.minPrice} ETB</div>
        <button class="btn btn-outline" style="margin-top: 14px; padding: 6px 18px;" data-action="buy" data-id="${item.id}">Acquire Drawing</button>
      </div>
    `).join('');

    dom.carouselDots.innerHTML = STATE.catalog.map((_, i) => `
      <button class="carousel-dot ${i === 0 ? 'active' : ''}" data-slide="${i}" aria-label="Go to slide ${i + 1}"></button>
    `).join('');

    dom.carouselStage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; isDragging = true; stopAutoplay(); }, { passive: true });
    dom.carouselStage.addEventListener('touchmove', e => { if (isDragging) currentDelta = e.touches[0].clientX - startX; }, { passive: true });
    dom.carouselStage.addEventListener('touchend', () => {
      if (!isDragging) return;
      isDragging = false;
      if (currentDelta < -40) setSlide(STATE.carouselIndex + 1);
      else if (currentDelta > 40) setSlide(STATE.carouselIndex - 1);
      currentDelta = 0;
      restartAutoplay();
    });

    dom.carouselStage.addEventListener('mousedown', e => { startX = e.pageX; isDragging = true; stopAutoplay(); });
    dom.carouselStage.addEventListener('mousemove', e => { if (isDragging) currentDelta = e.pageX - startX; });
    dom.carouselStage.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      if (currentDelta < -40) setSlide(STATE.carouselIndex + 1);
      else if (currentDelta > 40) setSlide(STATE.carouselIndex - 1);
      currentDelta = 0;
      restartAutoplay();
    });
    dom.carouselStage.addEventListener('mouseleave', () => { isDragging = false; currentDelta = 0; startAutoplay(); });
    dom.carouselStage.addEventListener('mouseenter', stopAutoplay);

    dom.carouselPrev.addEventListener('click', () => { setSlide(STATE.carouselIndex - 1); restartAutoplay(); });
    dom.carouselNext.addEventListener('click', () => { setSlide(STATE.carouselIndex + 1); restartAutoplay(); });

    dom.carouselDots.addEventListener('click', e => {
      if (e.target.dataset.slide !== undefined) {
        setSlide(parseInt(e.target.dataset.slide, 10));
        restartAutoplay();
      }
    });

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopAutoplay();
      else startAutoplay();
    });

    startAutoplay();
  }

  function setSlide(index) {
    if (index < 0) index = STATE.catalog.length - 1;
    if (index >= STATE.catalog.length) index = 0;

    STATE.carouselIndex = index;
    dom.carouselTrack.style.transform = `translateX(-${index * 100}%)`;

    document.querySelectorAll('.carousel-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === index);
    });
  }

  /* Navigation */
  function navigateTo(route) {
    dom.views.forEach(v => v.classList.remove('active'));
    dom.navLinks.forEach(l => l.classList.remove('active'));

    const targetView = document.getElementById(`view-${route}`);
    const activeLinks = document.querySelectorAll(`.nav-link[data-route="${route}"]`);

    if (targetView) targetView.classList.add('active');
    activeLinks.forEach(l => l.classList.add('active'));

    closeMobileNav();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (route === 'gallery') renderCatalog();
    if (route === 'favorites') renderFavorites();
  }

  /* Mobile nav + header scroll state */
  function openMobileNav() {
    document.body.classList.add('nav-open');
    dom.navToggle.setAttribute('aria-expanded', 'true');
  }

  function closeMobileNav() {
    document.body.classList.remove('nav-open');
    dom.navToggle.setAttribute('aria-expanded', 'false');
  }

  function toggleMobileNav() {
    if (document.body.classList.contains('nav-open')) closeMobileNav();
    else openMobileNav();
  }

  function updateHeaderScrollState() {
    dom.siteHeader.classList.toggle('is-scrolled', window.scrollY > 4);
  }

  /* Catalog */
  function createCardHTML(item) {
    const isFav = STATE.favorites.includes(item.id);
    return `
      <article class="card">
        <div class="card-preview">
          <button class="card-favorite-btn ${isFav ? 'favorited' : ''}" data-fav="${item.id}" aria-label="Save flower">
            ${isFav ? '❤️' : '🤍'}
          </button>
          <img src="${item.file}" alt="${item.title}" loading="lazy" onerror="this.src='assets/logo/adey-logo.svg'">
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <div class="card-price">From ${item.minPrice} ETB</div>
          <div class="card-footer">
            <button class="btn btn-primary" style="width:100%;" data-action="buy" data-id="${item.id}">Acquire</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalog() {
    const query = (dom.searchInput.value || '').toLowerCase();
    const filtered = STATE.catalog.filter(i =>
      i.title.toLowerCase().includes(query)
    );

    dom.galleryGrid.innerHTML = filtered.length 
      ? filtered.map(createCardHTML).join('')
      : `<p style="color: var(--color-text-muted); grid-column: 1/-1; text-align: center; padding: 48px 0;">No matching artworks found.</p>`;
  }

  function renderFavorites() {
    const favItems = STATE.catalog.filter(i => STATE.favorites.includes(i.id));
    dom.favoritesGrid.innerHTML = favItems.length
      ? favItems.map(createCardHTML).join('')
      : `<p style="color: var(--color-text-muted); grid-column: 1/-1; text-align: center; padding: 48px 0;">No saved artworks in your shortlist.</p>`;
  }

  function updateFavBadge() {
    const count = STATE.favorites.length;
    dom.favBadge.textContent = count;
    dom.favBadge.hidden = count === 0;
  }

  function toggleFavorite(id) {
    const idx = STATE.favorites.indexOf(id);
    if (idx > -1) STATE.favorites.splice(idx, 1);
    else STATE.favorites.push(id);

    localStorage.setItem('adey_art_favs', JSON.stringify(STATE.favorites));
    updateFavBadge();
    renderCatalog();
    renderFavorites();
  }

  /* Checkout Flow */
  function openCheckout(id) {
    const item = STATE.catalog.find(i => i.id === id);
    if (!item) return;

    STATE.currentArtwork = item;
    STATE.selectedAmount = item.minPrice;

    dom.modalImg.src = item.file;
    dom.modalTitle.textContent = item.title;
    dom.modalDesc.textContent = item.desc;
    dom.modalMinPrice.textContent = item.minPrice;
    dom.inputCustomPrice.min = item.minPrice;
    dom.inputCustomPrice.value = item.minPrice;

    dom.modalStageDetails.style.display = 'block';
    dom.modalStagePayment.style.display = 'none';
    dom.modalStageProcessing.style.display = 'none';
    dom.downloadContainer.style.display = 'none';
    dom.btnSubmitVerification.disabled = true;
    dom.proofFileInput.value = '';

    dom.modal.classList.add('active');
  }

  function closeModal() {
    dom.modal.classList.remove('active');
  }

  function triggerVerification() {
    dom.modalStagePayment.style.display = 'none';
    dom.modalStageProcessing.style.display = 'block';
    dom.verificationHeading.textContent = 'Verifying Payment';
    dom.verificationText.textContent = 'Checking transaction receipt with mobile banking records...';

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    setTimeout(() => {
      STATE.orders.unshift({
        id: orderId,
        title: STATE.currentArtwork.title,
        amount: STATE.selectedAmount,
        channel: STATE.selectedMethod,
        status: 'Settled'
      });

      dom.verificationHeading.textContent = 'Payment Confirmed';
      dom.verificationText.textContent = `Thank you so much for your ${STATE.selectedAmount} ETB contribution and for supporting my coding and art journey! — Daniel`;
      dom.downloadContainer.style.display = 'block';
    }, 1800);
  }

  /* Delegated Listeners */
  document.addEventListener('click', e => {
    const targetRoute = e.target.closest('[data-route]');
    if (targetRoute) {
      e.preventDefault();
      navigateTo(targetRoute.getAttribute('data-route'));
      return;
    }

    if (e.target.closest('#navToggle')) {
      toggleMobileNav();
      return;
    }

    if (e.target === dom.navScrim) {
      closeMobileNav();
      return;
    }

    const targetFav = e.target.closest('[data-fav]');
    if (targetFav) {
      toggleFavorite(targetFav.getAttribute('data-fav'));
      return;
    }

    const targetAction = e.target.closest('[data-action]');
    if (targetAction) {
      openCheckout(targetAction.getAttribute('data-id'));
      return;
    }

    if (e.target.id === 'btnCloseModal' || e.target === dom.modal) {
      closeModal();
      return;
    }

    if (e.target.id === 'btnProceedCheckout') {
      const val = parseInt(dom.inputCustomPrice.value, 10);
      if (val < STATE.currentArtwork.minPrice) return;
      STATE.selectedAmount = val;
      dom.modalStageDetails.style.display = 'none';
      dom.modalStagePayment.style.display = 'block';
      return;
    }

    const tile = e.target.closest('.payment-tile');
    if (tile) {
      document.querySelectorAll('.payment-tile').forEach(t => t.classList.remove('selected'));
      tile.classList.add('selected');
      STATE.selectedMethod = tile.getAttribute('data-method');
      dom.recipientNumber.textContent = STATE.selectedMethod === 'Telebirr' 
        ? '0911 23 45 67 (Telebirr)' 
        : '1000 1234 5678 (CBE Birr)';
      return;
    }

    if (e.target.id === 'btnSubmitVerification') {
      triggerVerification();
      return;
    }

    if (e.target.id === 'btnDownloadArtifact') {
      const link = document.createElement('a');
      link.href = STATE.currentArtwork.file;
      link.download = `${STATE.currentArtwork.id}.jpg`;
      link.click();
      closeModal();
      return;
    }
  });

  dom.searchInput.addEventListener('input', renderCatalog);

  dom.proofFileInput.addEventListener('change', e => {
    if (e.target.files.length > 0) {
      dom.btnSubmitVerification.disabled = false;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeMobileNav();
      closeModal();
    }
  });

  window.addEventListener('scroll', updateHeaderScrollState, { passive: true });

  updateFavBadge();
  updateHeaderScrollState();
  initCarousel();
  renderCatalog();
  initMusic();
})();
/**
 * Adey Art — Modular Client Application
 */

'use strict';

(function () {
  const STATE = {
    currentArtwork: null,
    selectedAmount: null,
    selectedMethod: 'Telebirr',
    selectedNumber: '0911234567',
    carouselIndex: 0,
    favorites: JSON.parse(localStorage.getItem('adey_art_favs') || '[]'),
    likeCounts: JSON.parse(localStorage.getItem('adey_art_like_counts') || '{}'),
    catalog: [
      {
        id: 'flower-01',
        title: 'Adey Abeba #01',
        file: 'assets/flowers/flower1.jpg',
        desc: 'Hand-drawn on paper with colored markers, inscribed with warm New Year wishes.',
        baseLikes: 0
      },
      {
        id: 'flower-02',
        title: 'Adey Abeba #02 (Highland Daisy)',
        file: 'assets/flowers/flower2.jpg',
        desc: 'Vibrant yellow gouache and pencil drawing on paper with festive holiday blessings.',
        baseLikes: 0
      },
      {
        id: 'flower-03',
        title: 'Adey Abeba #03',
        file: 'assets/flowers/flower3.jpg',
        desc: 'Hand-painted ceremonial flower drawing decorated with traditional cross patterns.',
        baseLikes: 0
      },
      {
        id: 'flower-04',
        title: 'Adey Abeba #04 (Spring Sunburst)',
        file: 'assets/flowers/flower4.jpg',
        desc: 'Detailed pencil and watercolor bloom on paper celebrating the end of the winter rains.',
        baseLikes: 0
      },
      {
        id: 'flower-05',
        title: 'Adey Abeba #05 (Peace & Harmony)',
        file: 'assets/flowers/flower5.jpg',
        desc: 'Original paper sketch with bright yellow petals symbolizing peace and new beginnings.',
        baseLikes: 0
      },
      {
        id: 'flower-06',
        title: 'Adey Abeba #06 (Holiday Bouquet)',
        file: 'assets/flowers/flower6.jpg',
        desc: 'Full paper composition of clustered Adey Abeba blooms hand-drawn for neighborhood gift-giving.',
        baseLikes: 0
      },
      {
        id: 'flower-07',
        title: 'Adey Abeba #07 (Morning Bloom)',
        file: 'assets/flowers/flower7.jpg',
        desc: 'Soft pastel drawing on paper capturing the first Adey Abeba blooms of the season.',
        baseLikes: 0
      },
      {
        id: 'flower-08',
        title: 'Adey Abeba #08 (Golden Field)',
        file: 'assets/flowers/flower8.jpg',
        desc: 'Layered marker and pencil piece depicting a full field of golden highland daisies.',
        baseLikes: 0
      },
      {
        id: 'flower-09',
        title: 'Adey Abeba #09 (New Year Wish)',
        file: 'assets/flowers/flower9.jpg',
        desc: 'A closing piece for the collection, hand-inscribed with a personal Enkutatash wish.',
        baseLikes: 0
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
    btnGallerySupport: document.getElementById('btnGallerySupport'),
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
    inputCustomPrice: document.getElementById('inputCustomPrice'),
    quickPicks: document.getElementById('quickPicks'),
    btnProceedCheckout: document.getElementById('btnProceedCheckout'),
    recipientNumber: document.getElementById('recipientNumber'),
    btnCopyNumber: document.getElementById('btnCopyNumber'),
    inputReferenceNumber: document.getElementById('inputReferenceNumber'),
    proofFileInput: document.getElementById('proofFileInput'),
    btnSubmitVerification: document.getElementById('btnSubmitVerification'),
    verificationHeading: document.getElementById('verificationHeading'),
    verificationText: document.getElementById('verificationText'),
    downloadContainer: document.getElementById('downloadContainer'),
    // Music
    bgMusic: document.getElementById('bgMusic'),
    musicToggle: document.getElementById('musicToggle'),
    // Entry gate
    entryGate: document.getElementById('entryGate'),
    btnEnterGarden: document.getElementById('btnEnterGarden'),
    entryMusicCheck: document.getElementById('entryMusicCheck')
  };

  /* Holiday Background Music — entirely optional, and never downloaded
     until the person actually opts in. The <audio> tag ships with no
     src, only a data-src, and preload="none", so page load never waits
     on the music file. */
  const MUSIC_MUTED_KEY = 'adey_art_music_muted';
  let musicWasPlayingBeforeHide = false;

  function userMutedMusic() {
    return localStorage.getItem(MUSIC_MUTED_KEY) === '1';
  }

  function setMusicUIState(playing) {
    if (!dom.musicToggle) return;
    dom.musicToggle.classList.toggle('is-playing', playing);
    dom.musicToggle.classList.toggle('is-muted', !playing);
    dom.musicToggle.setAttribute('aria-pressed', String(playing));
    dom.musicToggle.setAttribute('aria-label', playing ? 'Mute holiday music' : 'Play holiday music');
    dom.musicToggle.title = playing ? 'Mute holiday music' : 'Play holiday music';
  }

  function ensureMusicSource() {
    if (dom.bgMusic && !dom.bgMusic.src && dom.bgMusic.dataset.src) {
      dom.bgMusic.src = dom.bgMusic.dataset.src;
    }
  }

  function tryPlayMusic() {
    if (!dom.bgMusic || userMutedMusic()) {
      setMusicUIState(false);
      return;
    }
    ensureMusicSource();
    const playPromise = dom.bgMusic.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setMusicUIState(true))
        .catch(() => {
          // Browser still declined to play (e.g. media not ready yet).
          setMusicUIState(false);
        });
    }
  }

  function pauseMusic() {
    if (!dom.bgMusic || dom.bgMusic.paused) return;
    dom.bgMusic.pause();
    setMusicUIState(false);
  }

  function toggleMusic() {
    if (!dom.bgMusic) return;
    if (dom.bgMusic.paused) {
      localStorage.setItem(MUSIC_MUTED_KEY, '0');
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

    // Stop the music the moment the person leaves — switches tabs,
    // minimizes, or closes/navigates away — and pick back up only if
    // it was actually playing (and not muted) when they return.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        musicWasPlayingBeforeHide = !dom.bgMusic.paused;
        pauseMusic();
      } else if (musicWasPlayingBeforeHide && !userMutedMusic()) {
        tryPlayMusic();
      }
    });

    window.addEventListener('pagehide', () => {
      if (dom.bgMusic) dom.bgMusic.pause();
    });
  }

  /* Entry Gate — a small ceremony before the site opens. Music is only
     ever started here, inside a real click, so browsers never block it,
     and only if the person left the "Play holiday music" box checked. */
  function enterGarden() {
    if (dom.entryGate) {
      dom.entryGate.classList.add('is-leaving');
      document.body.classList.remove('nav-open'); // safety, in case toggled pre-entry
      setTimeout(() => { dom.entryGate.hidden = true; }, 450);
    }
    if (dom.musicToggle) dom.musicToggle.hidden = false;
    const wantsMusic = dom.entryMusicCheck ? dom.entryMusicCheck.checked : true;
    localStorage.setItem(MUSIC_MUTED_KEY, wantsMusic ? '0' : '1');
    if (wantsMusic) tryPlayMusic();
    else setMusicUIState(false);
  }

  function initEntryGate() {
    if (!dom.entryGate || !dom.btnEnterGarden) return;
    document.body.classList.add('gate-open');
    dom.btnEnterGarden.addEventListener('click', () => {
      document.body.classList.remove('gate-open');
      enterGarden();
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !dom.entryGate.hidden && document.activeElement !== dom.btnEnterGarden) {
        document.body.classList.remove('gate-open');
        enterGarden();
      }
    });
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
        <div class="slide-meta">Pay what you feel</div>
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
  function getLikeCount(item) {
    const bump = STATE.likeCounts[item.id] || 0;
    return item.baseLikes + bump;
  }

  function createCardHTML(item) {
    const isFav = STATE.favorites.includes(item.id);
    const likeCount = getLikeCount(item);
    return `
      <article class="card">
        <div class="card-preview">
          <img src="${item.file}" alt="${item.title}" loading="lazy" onerror="this.src='assets/logo/adey-logo.svg'">
        </div>
        <div class="card-content">
          <h3 class="card-title">${item.title}</h3>
          <p class="card-desc">${item.desc}</p>
          <div class="card-footer">
            <button class="card-like-btn ${isFav ? 'liked' : ''}" data-fav="${item.id}" aria-label="${isFav ? 'Unlike' : 'Like'} this drawing" aria-pressed="${isFav}">
              <span class="card-like-icon" aria-hidden="true">${isFav ? '❤️' : '🤍'}</span>
              <span class="card-like-count">${likeCount}</span>
            </button>
            <button class="btn btn-primary" data-action="buy" data-id="${item.id}">Get This Flower 🌼</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderCatalog() {
    dom.galleryGrid.innerHTML = STATE.catalog.length
      ? STATE.catalog.map(createCardHTML).join('')
      : `<p style="color: var(--color-text-muted); grid-column: 1/-1; text-align: center; padding: 48px 0;">No artworks available yet.</p>`;
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
    const nowLiked = idx === -1;
    if (idx > -1) STATE.favorites.splice(idx, 1);
    else STATE.favorites.push(id);

    STATE.likeCounts[id] = (STATE.likeCounts[id] || 0) + (nowLiked ? 1 : -1);
    localStorage.setItem('adey_art_favs', JSON.stringify(STATE.favorites));
    localStorage.setItem('adey_art_like_counts', JSON.stringify(STATE.likeCounts));
    updateFavBadge();
    renderCatalog();
    renderFavorites();
  }

  function copyToClipboard(value, btn) {
    const done = () => {
      if (!btn) return;
      const label = btn.querySelector('.copy-btn-label');
      const original = label ? label.textContent : null;
      btn.classList.add('copied');
      if (label) label.textContent = 'Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        if (label && original) label.textContent = original;
      }, 1600);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done));
    } else {
      fallbackCopy(value, done);
    }
  }

  function fallbackCopy(value, done) {
    const temp = document.createElement('textarea');
    temp.value = value;
    temp.style.position = 'fixed';
    temp.style.opacity = '0';
    document.body.appendChild(temp);
    temp.select();
    try { document.execCommand('copy'); } catch (err) { /* no-op */ }
    document.body.removeChild(temp);
    done();
  }

  /* Checkout Flow */
  function openCheckout(id) {
    const item = STATE.catalog.find(i => i.id === id);
    if (!item) return;

    STATE.currentArtwork = item;
    STATE.selectedAmount = null;

    dom.modalImg.src = item.file;
    dom.modalTitle.textContent = item.title;
    dom.modalDesc.textContent = item.desc;
    dom.inputCustomPrice.value = '';
    document.querySelectorAll('.quick-pick-chip').forEach(c => c.classList.remove('selected'));
    dom.btnProceedCheckout.disabled = true;

    dom.modalStageDetails.style.display = 'block';
    dom.modalStagePayment.style.display = 'none';
    dom.modalStageProcessing.style.display = 'none';
    dom.downloadContainer.style.display = 'none';
    dom.btnSubmitVerification.disabled = true;
    dom.proofFileInput.value = '';
    if (dom.inputReferenceNumber) dom.inputReferenceNumber.value = '';

    // Reset payment step to its Telebirr default.
    document.querySelectorAll('.payment-tile').forEach(t => t.classList.remove('selected'));
    const telebirrTile = document.querySelector('.payment-tile[data-method="Telebirr"]');
    if (telebirrTile) {
      telebirrTile.classList.add('selected');
      STATE.selectedMethod = 'Telebirr';
      STATE.selectedNumber = telebirrTile.getAttribute('data-number');
      dom.recipientNumber.textContent = telebirrTile.getAttribute('data-display');
      if (dom.btnCopyNumber) dom.btnCopyNumber.setAttribute('data-copy', STATE.selectedNumber);
    }

    dom.modal.classList.add('active');
  }

  function closeModal() {
    dom.modal.classList.remove('active');
  }

  function updateProceedState() {
    const val = parseFloat(dom.inputCustomPrice.value);
    dom.btnProceedCheckout.disabled = !(val > 0);
  }

  function updateVerifyState() {
    const hasRef = dom.inputReferenceNumber && dom.inputReferenceNumber.value.trim().length > 0;
    dom.btnSubmitVerification.disabled = !hasRef;
  }

  function triggerDownload() {
    if (!STATE.currentArtwork) return;
    const link = document.createElement('a');
    link.href = STATE.currentArtwork.file;
    link.download = `${STATE.currentArtwork.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function triggerVerification() {
    dom.modalStagePayment.style.display = 'none';
    dom.modalStageProcessing.style.display = 'block';
    dom.verificationHeading.textContent = 'Verifying Payment';
    dom.verificationText.textContent = 'Checking your reference number against mobile banking records...';

    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    const referenceNumber = dom.inputReferenceNumber ? dom.inputReferenceNumber.value.trim() : '';

    setTimeout(() => {
      STATE.orders.unshift({
        id: orderId,
        title: STATE.currentArtwork.title,
        amount: STATE.selectedAmount,
        channel: STATE.selectedMethod,
        reference: referenceNumber,
        status: 'Settled'
      });

      dom.verificationHeading.textContent = '🌼 You helped a little flower bloom. Thank you for supporting Daniel\'s art. 🇪🇹';
      dom.verificationText.textContent = '';
      dom.downloadContainer.style.display = 'block';
      triggerDownload();
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

    const quickPick = e.target.closest('.quick-pick-chip');
    if (quickPick) {
      document.querySelectorAll('.quick-pick-chip').forEach(c => c.classList.remove('selected'));
      quickPick.classList.add('selected');
      dom.inputCustomPrice.value = quickPick.getAttribute('data-amount');
      updateProceedState();
      return;
    }

    if (e.target.id === 'btnProceedCheckout') {
      const val = parseFloat(dom.inputCustomPrice.value);
      if (!(val > 0)) return;
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
      STATE.selectedNumber = tile.getAttribute('data-number');
      dom.recipientNumber.textContent = tile.getAttribute('data-display');
      if (dom.btnCopyNumber) dom.btnCopyNumber.setAttribute('data-copy', STATE.selectedNumber);
      return;
    }

    const copyBtn = e.target.closest('.copy-btn');
    if (copyBtn) {
      const value = copyBtn.getAttribute('data-copy') || '';
      copyToClipboard(value, copyBtn);
      return;
    }

    if (e.target.id === 'btnSubmitVerification') {
      if (dom.btnSubmitVerification.disabled) return;
      triggerVerification();
      return;
    }

    if (e.target.id === 'btnDownloadArtifact') {
      triggerDownload();
      return;
    }

    if (e.target.closest('#btnGallerySupport')) {
      dom.galleryGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
  });

  dom.inputCustomPrice.addEventListener('input', () => {
    document.querySelectorAll('.quick-pick-chip').forEach(c => c.classList.remove('selected'));
    updateProceedState();
  });

  if (dom.inputReferenceNumber) {
    dom.inputReferenceNumber.addEventListener('input', updateVerifyState);
  }

  dom.proofFileInput.addEventListener('change', updateVerifyState);

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
  initEntryGate();
})();
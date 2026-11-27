/**
 * CyberLibris Application Master Controller (Relay & Steam Edition)
 * ------------------------------------------------------------------
 * 1. Steam Storefront Carousel with 6s Auto-Rotation and Thumbnails
 * 2. Book Relay Integration (streaming real texts, no static database bloating)
 * 3. Personalized Recommendation Engine & Taste Questionnaire
 * 4. Full Book Dossier Modal with Live Community Reviews
 * 5. Rebuilt Gamer & Scholar Profile (Genre-based titles, justification, shelves)
 * 6. Responsive Manga Scroll Reader Controls
 */

const TITLES_REGISTRY = {
  elder_thought: {
    id: 'elder_thought',
    title: '📜 Старейшина Мысли',
    rarity: 'legendary',
    rarityLabel: 'ЛЕГЕНДАРНЫЙ ТИТУЛ',
    category: 'Философия & Классика',
    lore: 'Присваивается за глубокое освоение фундаментальных философских трудов и классических романов человечества.',
    criteria: 'Освоение произведений Фридриха Ницше («Так говорил Заратустра»), Иоганна Гёте («Фауст») или трудов классической философии.'
  },
  strategy_warlord: {
    id: 'strategy_warlord',
    title: '⚔️ Воевода Стратегии',
    rarity: 'epic',
    rarityLabel: 'ЭПИЧЕСКИЙ ТИТУЛ',
    category: 'Военная Проза & Тактика',
    lore: 'Присваивается полководцам мысли, познавшим искусство тактики, масштабных баталий и железной дисциплины.',
    criteria: 'Прочтение военных шедевров: «Война и мир» Л.Н. Толстого, «Искусство войны» Сунь-Цзы.'
  },
  cyber_scholar: {
    id: 'cyber_scholar',
    title: '🔮 Схоласт Сети',
    rarity: 'rare',
    rarityLabel: 'РЕДКИЙ ТИТУЛ',
    category: 'Киберпанк & Научпоп',
    lore: 'Даруется исследователям цифровых горизонтов, нейросетей, кибернетики и антиутопических миров.',
    criteria: 'Изучение научной фантастики: «Нейромант», «1984», трактатов по системному мышлению.'
  },
  magister_mind: {
    id: 'magister_mind',
    title: '🧠 Магистр Мысли',
    rarity: 'epic',
    rarityLabel: 'ЭПИЧЕСКИЙ ТИТУЛ',
    category: 'Эрудиция & Интеллект',
    lore: 'Присваивается читателям с высочайшим коэффициентом литературной эрудиции и аналитического анализа.',
    criteria: 'Победы в интеллектуальных викторинах Литературного Квиза и скоростном анализе текстов.'
  },
  creator: {
    id: 'creator',
    title: '👑 Создатель Системы [CREATOR]',
    rarity: 'mythic',
    rarityLabel: 'МИФИЧЕСКИЙ РАНГ',
    category: 'Архитектура CyberLibris',
    lore: 'Абсолютный титул Архитектора платформы. Обладает правом трансформации матриц знаний и управления ядром.',
    criteria: 'Права Верховного Создателя или статус основателя платформы.'
  },
  archivist: {
    id: 'archivist',
    title: '⚜️ Верховный Архивариус',
    rarity: 'legendary',
    rarityLabel: 'ЛЕГЕНДАРНЫЙ ТИТУЛ',
    category: 'Хранение Знаний',
    lore: 'Хранитель сокровенных фолиантов и вечных рукописей, неустанно систематизирующий книжное наследие.',
    criteria: 'Формирование обширной персональной коллекции и каталогизация шедевров.'
  },
  speed_magister: {
    id: 'speed_magister',
    title: '⚡ Магистр Скорочтения',
    rarity: 'rare',
    rarityLabel: 'РЕДКИЙ ТИТУЛ',
    category: 'Мастерство Чтения',
    lore: 'Даруется мастерам, способным мгновенно поглощать огромные массивы информации без потери глубинного смысла.',
    criteria: 'Достижение скорости чтения свыше 400 слов в минуту в тренажере скорочтения.'
  },
  book_dragon: {
    id: 'book_dragon',
    title: '🐉 Дракон Фолиантов',
    rarity: 'legendary',
    rarityLabel: 'ЛЕГЕНДАРНЫЙ ТИТУЛ',
    category: 'Коллекционирование',
    lore: 'Дремлет на горах прочитанных томов и ревностно оберегает редчайшие литературные сокровища.',
    criteria: 'Собрание более 15 завершенных книг на полках библиотеки.'
  },
  novice: {
    id: 'novice',
    title: '🌱 Новичок Библиотеки',
    rarity: 'starter',
    rarityLabel: 'НАЧАЛЬНЫЙ РАНГ',
    category: 'Старт Пути',
    lore: 'Первые робкие шаги в безграничном океане мировой литературы. Главные открытия еще впереди.',
    criteria: 'Стартовый ранг каждого новоприбывшего читателя CyberLibris.'
  }
};

class AppController {
  constructor() {
    this.currentView = 'library';
    this.selectedCategory = 'all';
    this.selectedSort = 'popular';
    this.selectedStatus = 'all';
    this.selectedFormat = 'all';
    this.selectedDifficulty = 'all';
    this.searchQuery = '';
    this.activeSteamBookId = 'relay_war_and_peace';
    this.steamLibFilter = 'all';
    this.steamLibSearchQuery = '';
    this.steamLibSortMode = 'default';
    this.previousView = 'steam-library';

    // Command Palette State
    this.cmdPaletteOpen = false;
    this.cmdPaletteType = 'all';
    this.cmdPaletteQuery = '';
    this.cmdPaletteSelectedIndex = 0;

    // Catalog Chunk Loading (Performance Optimization for low memory)
    this.catalogDisplayLimit = 12;

    // Steam Carousel State (Slower, 10s intervals for smooth relaxed viewing)
    this.carouselIndex = 0;
    this.carouselTimer = null;
    this.carouselDuration = 10000;
    this.carouselProgress = 0;
    this.carouselInterval = null;
    this.isCarouselPaused = false;
  }

  async init() {
    // 1. Initialize Database & Auth
    await window.dbEngine.init();
    window.auth.init();

    // 2. Initialize Reader & Games
    window.readerEngine.init();
    window.miniGames.init();

    // 3. Setup Micro-interactions & UI Handlers
    this.bindNavigation();
    this.bindModals();
    window.auth.bindAuthModalTabs();
    this.bindRoadmapModal();
    this.bindTickerClicks();
    this.bindCatalogPagination();
    this.bindTiltEffect();
    this.bindMagneticButtons();
    this.bindAudioTriggers();
    this.bindHoverSFX();
    this.setupHeaderAmbientControl();
    this.bindThemePalette();
    this.bindSearchAndFilters();
    this.bindSteamCarouselControls();
    this.bindTasteOnboarding();
    this.bindBookDetailsModal();
    this.bindEditProfileModal();
    this.bindProfileStudio();
    this.bindLeaderboardSearch();
    this.bindAdminRecommendations();
    this.bindOpenLibraryExplorer();
    this.bindCommandPalette();
    this.bindGlobalShortcuts();
    this.bindScrollTopFAB();

    // 4. Initial Render
    this.initEcoMode();
    this.initSteamCarousel();
    this.renderLibrary();
    this.renderDailyQuests();
    this.updateAudioButtonState();
    this.updateHeaderResumePill();

    console.log('⚡ CyberLibris v4.5 (Multi-Chapter Books & ReManga Filter Hub) Ready.');
  }

  // --- NAVIGATION & VIEW ROUTING ---

  bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) this.switchView(view);
      });
    });

    document.querySelector('.logo-container')?.addEventListener('click', () => {
      this.switchView('library');
    });

    // Quick Theme Switcher Button in header
    document.getElementById('btn-quick-theme')?.addEventListener('click', () => {
      this.cycleNextTheme();
    });

    // Sound toggle button in header
    document.getElementById('btn-toggle-sfx')?.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.updateAudioButtonState();
      this.showToast(isMuted ? 'Звук выключен' : 'Звуковые эффекты включены', 'info');
    });

    // Turbo / Eco Mode toggle button in header
    document.getElementById('btn-toggle-eco')?.addEventListener('click', () => {
      this.toggleEcoMode();
    });
  }

  initEcoMode() {
    const isEco = localStorage.getItem('cyberlibris_eco_mode') === 'true';
    if (isEco) {
      document.body.classList.add('eco-mode');
    } else {
      document.body.classList.remove('eco-mode');
    }
    this.updateEcoButtonState();
    if (window.reactiveBg) {
      window.reactiveBg.setLowPowerMode(isEco);
    }
  }

  toggleEcoMode() {
    const currentlyEco = document.body.classList.contains('eco-mode');
    const newEco = !currentlyEco;
    if (newEco) {
      document.body.classList.add('eco-mode');
      localStorage.setItem('cyberlibris_eco_mode', 'true');
      this.showToast('Турбо-режим ВКЛЮЧЕН (максимальная скорость, эффекты отключены)', 'info');
    } else {
      document.body.classList.remove('eco-mode');
      localStorage.setItem('cyberlibris_eco_mode', 'false');
      this.showToast('Турбо-режим ВЫКЛЮЧЕН (полная графика и частицы)', 'info');
    }
    this.updateEcoButtonState();
    if (window.reactiveBg) {
      window.reactiveBg.setLowPowerMode(newEco);
    }
  }

  updateEcoButtonState() {
    const btn = document.getElementById('btn-toggle-eco');
    if (!btn) return;
    const isEco = document.body.classList.contains('eco-mode');
    btn.classList.toggle('active', isEco);
    btn.innerHTML = `<span>Турбо: ${isEco ? 'Вкл' : 'Выкл'}</span>`;
  }

  switchView(viewName) {
    if (viewName === 'admin' && !window.auth.isAdmin()) {
      this.showToast('Доступ запрещен. Требуются права Администратора или Создателя.', 'error');
      return;
    }

    if (this.currentView && this.currentView !== 'reader') {
      this.previousView = this.currentView;
    }

    this.currentView = viewName;

    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) targetSection.classList.add('active');

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (viewName !== 'reader') {
      window.readerEngine?.stopTTS?.();
      window.reactiveBg?.resume?.();
    } else {
      window.reactiveBg?.pause?.();
    }

    if (viewName === 'library') {
      this.renderLibrary();
      this.startCarouselTimer();
    } else {
      this.pauseCarouselTimer();
    }

    if (viewName === 'steam-library') this.renderSteamLibrary(this.activeSteamBookId || 'war_and_peace');
    else if (viewName === 'community') this.renderCommunityFeed();
    else if (viewName === 'games') window.miniGames.switchGame(window.miniGames.currentGame);
    else if (viewName === 'shop') window.miniGames.renderShopCategory('frames');
    else if (viewName === 'leaderboard') this.renderLeaderboard();
    else if (viewName === 'profile') this.renderProfile();
    else if (viewName === 'profile-edit') this.renderProfileEditor();
    else if (viewName === 'admin') window.adminEngine.renderAdminView();

    this.updateHeaderResumePill();
    this.updateProfilePresence();
    if (window.soundEngine) window.soundEngine.playClick();
  }

  returnFromReader() {
    window.reactiveBg?.resume?.();
    const dest = (this.previousView && this.previousView !== 'reader') ? this.previousView : 'steam-library';
    this.switchView(dest);
  }

  updateHeaderResumePill() {
    const pill = document.getElementById('header-resume-pill');
    const titleEl = document.getElementById('header-resume-title');
    const metaEl = document.getElementById('header-resume-meta');
    if (!pill) return;

    let lastBookId = localStorage.getItem('cyberlibris_last_read_book');
    const user = window.auth?.currentUser;
    if (!lastBookId && user?.readingProgress) {
      const keys = Object.keys(user.readingProgress);
      if (keys.length > 0) lastBookId = keys[keys.length - 1];
    }

    if (!lastBookId) lastBookId = 'war_and_peace';

    const prog = window.readerEngine?.getSavedProgress?.(lastBookId);
    const book = window.bookRelay?.getBookById?.(lastBookId);

    if (book) {
      pill.classList.remove('hidden');
      const bookTitle = book.title || 'Книга';
      if (titleEl) titleEl.textContent = bookTitle;
      const chNum = (prog && typeof prog.currentChapter === 'number') ? prog.currentChapter + 1 : 1;
      const pct = (prog && typeof prog.progressPercent === 'number') ? prog.progressPercent : 0;
      if (metaEl) metaEl.textContent = `Гл. ${chNum} (${pct}%)`;

      pill.onclick = () => {
        window.readerEngine.openBook(lastBookId, (prog && prog.currentChapter) || 0);
        this.switchView('reader');
      };
    } else {
      pill.classList.add('hidden');
    }
  }

  // --- STEAM STOREFRONT CAROUSEL ---

  initSteamCarousel() {
    this.renderCarouselSlide();
    this.startCarouselTimer();
  }

  startCarouselTimer() {
    this.pauseCarouselTimer();
    this.carouselProgress = 0;
    const bar = document.getElementById('carousel-timer-bar');

    this.carouselInterval = setInterval(() => {
      if (this.isCarouselPaused) return;
      this.carouselProgress += 100 / (this.carouselDuration / 100);
      if (bar) bar.style.width = `${Math.min(100, this.carouselProgress)}%`;

      if (this.carouselProgress >= 100) {
        this.nextCarouselSlide();
      }
    }, 100);
  }

  pauseCarouselTimer() {
    if (this.carouselInterval) clearInterval(this.carouselInterval);
    const bar = document.getElementById('carousel-timer-bar');
    if (bar) bar.style.width = '0%';
  }

  bindSteamCarouselControls() {
    const wrap = document.getElementById('steam-hero-carousel');
    if (wrap) {
      wrap.addEventListener('mouseenter', () => { this.isCarouselPaused = true; });
      wrap.addEventListener('mouseleave', () => { this.isCarouselPaused = false; });
    }

    document.getElementById('btn-carousel-prev')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevCarouselSlide();
    });

    document.getElementById('btn-carousel-next')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextCarouselSlide();
    });
  }

  nextCarouselSlide() {
    const books = window.bookRelay.getAllBooks();
    this.carouselIndex = (this.carouselIndex + 1) % books.length;
    this.renderCarouselSlide();
    this.carouselProgress = 0;
  }

  prevCarouselSlide() {
    const books = window.bookRelay.getAllBooks();
    this.carouselIndex = (this.carouselIndex - 1 + books.length) % books.length;
    this.renderCarouselSlide();
    this.carouselProgress = 0;
  }

  renderCarouselSlide() {
    const books = window.bookRelay.getAllBooks();
    if (!books.length) return;

    const mainEl = document.getElementById('carousel-main-slide');
    const thumbsEl = document.getElementById('carousel-thumbs-list');

    if (mainEl) {
      mainEl.classList.add('carousel-fade-out');
      setTimeout(() => {
        const book = books[this.carouselIndex];
        let rarityPillClass = 'rarity-pill-classic';
        if (book.rarity === 'legendary') rarityPillClass = 'rarity-pill-legendary';
        else if (book.rarity === 'masterpiece') rarityPillClass = 'rarity-pill-masterpiece';
        else if (book.rarity === 'epic') rarityPillClass = 'rarity-pill-epic';

        mainEl.innerHTML = `
          <div class="carousel-cover-wrap" style="background: ${book.coverStyle};">
            <img src="${book.coverImage}" class="carousel-cover-img" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
          </div>
          <div class="carousel-details">
            <div class="carousel-badges-row">
              <span class="rarity-pill ${rarityPillClass}">${book.rarityLabel || 'ШЕДЕВР'}</span>
              <span class="book-genre-pill">${book.genre}</span>
              <span style="color:#ffd700; font-weight:800; font-size:1.05rem;">⭐ ${book.rating}</span>
              <span style="color:var(--text-dim); font-size:0.92rem; font-weight:600;">(~${book.lengthPages} стр.)</span>
            </div>
            <h2 class="carousel-title">${book.title}</h2>
            <div class="carousel-author">✍ ${book.author} (${book.year})</div>
            <div class="carousel-quote">${book.quote || 'Великое произведение мировой литературы.'}</div>
            <div class="carousel-synopsis">${book.synopsis || ''}</div>
            <div class="carousel-actions">
              <button class="btn btn-primary magnetic-btn" id="btn-carousel-read-now" data-book-id="${book.id}">
                📖 Читать сейчас (Лента)
              </button>
              <button class="btn btn-secondary magnetic-btn" id="btn-carousel-details" data-book-id="${book.id}">
                ℹ️ Карточка & Рецензии
              </button>
              <button class="btn btn-secondary magnetic-btn" id="btn-carousel-fav" data-book-id="${book.id}">
                ❤️ В избранное
              </button>
            </div>
          </div>
        `;

        mainEl.querySelector('#btn-carousel-read-now')?.addEventListener('click', () => {
          window.readerEngine.openBook(book.id);
        });

        mainEl.querySelector('#btn-carousel-details')?.addEventListener('click', () => {
          this.openBookDetails(book.id);
        });

        mainEl.querySelector('#btn-carousel-fav')?.addEventListener('click', () => {
          const user = window.auth.currentUser;
          if (!user) { this.openModal('modal-auth'); return; }
          const isFav = window.bookRelay.toggleFavorite(user.username, book.id);
          this.showToast(isFav ? `«${book.title}» добавлена в избранное` : `Удалено из избранного`, 'info');
        });

        mainEl.classList.remove('carousel-fade-out');
        mainEl.classList.add('carousel-fade-in');
        setTimeout(() => mainEl.classList.remove('carousel-fade-in'), 500);
      }, 180);
    }

    if (thumbsEl) {
      thumbsEl.innerHTML = '';
      const previewCount = 4;
      for (let i = 0; i < previewCount; i++) {
        const idx = (this.carouselIndex + i) % books.length;
        const b = books[idx];
        const isActive = idx === this.carouselIndex;

        const thumb = document.createElement('div');
        thumb.className = `carousel-thumb-item ${isActive ? 'active' : ''}`;
        thumb.innerHTML = `
          <img src="${b.coverImage}" class="thumb-mini-img" alt="${b.title}">
          <div class="thumb-mini-info">
            <div class="thumb-mini-title">${b.title}</div>
            <div class="thumb-mini-author">${b.author}</div>
          </div>
        `;
        thumb.addEventListener('click', () => {
          this.carouselIndex = idx;
          this.renderCarouselSlide();
          this.carouselProgress = 0;
        });
        thumbsEl.appendChild(thumb);
      }
    }
  }

  // --- REMANGA-STYLE FACETED FILTERS & RELAYED CATALOG ---

  updateMegaFilterActiveCount() {
    let count = 0;
    if (this.selectedEra && this.selectedEra !== 'all') count++;
    if (typeof this.filterYearMin === 'number' && !isNaN(this.filterYearMin)) count++;
    if (typeof this.filterYearMax === 'number' && !isNaN(this.filterYearMax)) count++;
    if (this.selectedAge && this.selectedAge !== 'all') count++;
    if (this.selectedVolume && this.selectedVolume !== 'all') count++;
    if (this.selectedFormat && this.selectedFormat !== 'all') count++;
    if (this.selectedDifficulty && this.selectedDifficulty !== 'all') count++;
    if (this.selectedStatus && this.selectedStatus !== 'all') count++;
    if (this.selectedCategory && this.selectedCategory !== 'all') count++;

    const badge = document.getElementById('mega-filter-badge');
    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
    return count;
  }

  bindSearchAndFilters() {
    const searchInput = document.getElementById('remanga-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    const sortSelect = document.getElementById('remanga-sort-select');
    const btnToggleMega = document.getElementById('btn-toggle-mega-filter');
    const panel = document.getElementById('remanga-filter-panel');
    const minInput = document.getElementById('filter-year-min');
    const maxInput = document.getElementById('filter-year-max');

    // Default Filter State
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.selectedSort = 'popular';
    this.selectedEra = 'all';
    this.filterYearMin = null;
    this.filterYearMax = null;
    this.selectedAge = 'all';
    this.selectedVolume = 'all';
    this.selectedFormat = 'all';
    this.selectedDifficulty = 'all';
    this.selectedStatus = 'all';

    // 1. Search with debounce
    let searchDebounceTimer = null;
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        clearTimeout(searchDebounceTimer);
        searchDebounceTimer = setTimeout(() => {
          this.renderLibrary(true);
        }, 120);
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.renderLibrary(true);
      });
    }

    // 2. Sorting
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.selectedSort = e.target.value;
        this.renderLibrary(true);
      });
    }

    // 3. Toggle Grand Mega-Filter Drawer
    if (btnToggleMega && panel) {
      btnToggleMega.addEventListener('click', (e) => {
        e.stopPropagation();
        panel.classList.toggle('drawer-open');
        if (window.soundEngine) window.soundEngine.playCardFlip();
      });
    }

    // 4. Quick Genre / Theme Chips
    document.querySelectorAll('#remanga-genre-chips .remanga-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#remanga-genre-chips .remanga-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedCategory = chip.dataset.genre || 'all';

        const olExplorer = document.getElementById('openlibrary-explorer');
        const localWrapper = document.getElementById('local-catalog-wrapper');

        if (this.selectedCategory === 'openlibrary') {
          if (olExplorer) olExplorer.style.display = 'block';
          if (localWrapper) localWrapper.style.display = 'none';
        } else {
          if (olExplorer) olExplorer.style.display = 'none';
          if (localWrapper) localWrapper.style.display = 'block';
          this.updateMegaFilterActiveCount();
          this.renderLibrary(true);
        }

        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 5. Mega Filter: Year Era Chips
    document.querySelectorAll('#mega-filter-era-chips .mega-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#mega-filter-era-chips .mega-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedEra = chip.dataset.era || 'all';

        if (this.selectedEra !== 'all') {
          if (minInput) minInput.value = '';
          if (maxInput) maxInput.value = '';
          this.filterYearMin = null;
          this.filterYearMax = null;
        }

        this.updateMegaFilterActiveCount();
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 6. Mega Filter: Year Exact Inputs
    let yearTimer = null;
    const handleYearInput = () => {
      clearTimeout(yearTimer);
      yearTimer = setTimeout(() => {
        const minVal = minInput?.value !== '' ? parseInt(minInput.value, 10) : null;
        const maxVal = maxInput?.value !== '' ? parseInt(maxInput.value, 10) : null;
        this.filterYearMin = !isNaN(minVal) ? minVal : null;
        this.filterYearMax = !isNaN(maxVal) ? maxVal : null;

        if (this.filterYearMin !== null || this.filterYearMax !== null) {
          document.querySelectorAll('#mega-filter-era-chips .mega-chip').forEach(c => c.classList.remove('active'));
          this.selectedEra = 'all';
        }

        this.updateMegaFilterActiveCount();
        this.renderLibrary();
      }, 200);
    };
    minInput?.addEventListener('input', handleYearInput);
    maxInput?.addEventListener('input', handleYearInput);

    // 7. Mega Filter: Age Rating Chips
    document.querySelectorAll('#mega-filter-age-chips .mega-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#mega-filter-age-chips .mega-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedAge = chip.dataset.age || 'all';

        this.updateMegaFilterActiveCount();
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 8. Mega Filter: Volume Chips
    document.querySelectorAll('#mega-filter-volume-chips .mega-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('#mega-filter-volume-chips .mega-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedVolume = chip.dataset.volume || 'all';

        this.updateMegaFilterActiveCount();
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 9. Mega Filter: Format Select
    document.getElementById('mega-filter-format-select')?.addEventListener('change', (e) => {
      this.selectedFormat = e.target.value;
      this.updateMegaFilterActiveCount();
      this.renderLibrary();
    });

    // 10. Mega Filter: Status Select
    document.getElementById('mega-filter-status-select')?.addEventListener('change', (e) => {
      this.selectedStatus = e.target.value;
      this.updateMegaFilterActiveCount();
      this.renderLibrary();
    });

    // 11. Mega Filter: Difficulty Select
    document.getElementById('mega-filter-diff-select')?.addEventListener('change', (e) => {
      this.selectedDifficulty = e.target.value;
      this.updateMegaFilterActiveCount();
      this.renderLibrary();
    });

    // 12. Apply & Collapse Button
    document.getElementById('btn-mega-filter-apply')?.addEventListener('click', () => {
      panel?.classList.remove('drawer-open');
      this.renderLibrary();
      if (window.soundEngine) window.soundEngine.playCardFlip();
    });

    // 13. Reset Filter Actions
    const resetAllFilters = () => {
      this.searchQuery = '';
      this.selectedCategory = 'all';
      this.selectedSort = 'popular';
      this.selectedEra = 'all';
      this.filterYearMin = null;
      this.filterYearMax = null;
      this.selectedAge = 'all';
      this.selectedVolume = 'all';
      this.selectedFormat = 'all';
      this.selectedDifficulty = 'all';
      this.selectedStatus = 'all';

      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      if (sortSelect) sortSelect.value = 'popular';
      if (minInput) minInput.value = '';
      if (maxInput) maxInput.value = '';

      const formatSel = document.getElementById('mega-filter-format-select');
      if (formatSel) formatSel.value = 'all';
      const statusSel = document.getElementById('mega-filter-status-select');
      if (statusSel) statusSel.value = 'all';
      const diffSel = document.getElementById('mega-filter-diff-select');
      if (diffSel) diffSel.value = 'all';

      document.querySelectorAll('#remanga-genre-chips .remanga-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.genre === 'all');
      });
      document.querySelectorAll('#mega-filter-era-chips .mega-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.era === 'all');
      });
      document.querySelectorAll('#mega-filter-age-chips .mega-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.age === 'all');
      });
      document.querySelectorAll('#mega-filter-volume-chips .mega-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.volume === 'all');
      });

      const olExplorer = document.getElementById('openlibrary-explorer');
      const localWrapper = document.getElementById('local-catalog-wrapper');
      if (olExplorer) olExplorer.style.display = 'none';
      if (localWrapper) localWrapper.style.display = 'block';

      this.updateMegaFilterActiveCount();
      this.renderLibrary();
      if (window.soundEngine) window.soundEngine.playClick();
    };

    document.getElementById('btn-reset-remanga-filters')?.addEventListener('click', resetAllFilters);
    document.getElementById('btn-mega-filter-reset')?.addEventListener('click', resetAllFilters);
    document.getElementById('btn-reset-filters-link')?.addEventListener('click', resetAllFilters);

    // Random Book Button
    document.getElementById('btn-random-book')?.addEventListener('click', () => {
      const allBooks = window.bookRelay.getAllBooks();
      if (!allBooks || allBooks.length === 0) return;
      const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
      if (randomBook) {
        if (window.soundEngine?.playClick) window.soundEngine.playClick();
        this.showToast(`Выбор Случайной Книги: «${randomBook.title}» (${randomBook.author})`, 'info');
        this.openBookDetails(randomBook.id);
      }
    });

    this.updateMegaFilterActiveCount();
  }

  renderLibrary(resetPagination = false) {
    if (resetPagination) {
      this.catalogDisplayLimit = 12;
    }
    const grid = document.getElementById('books-catalog-grid');
    const counterEl = document.getElementById('remanga-books-found-count');
    const megaCountEl = document.getElementById('mega-filter-found-count');
    const resetBtn = document.getElementById('btn-reset-remanga-filters');
    const resetLink = document.getElementById('btn-reset-filters-link');
    if (!grid) return;
    grid.innerHTML = '';

    const user = window.auth?.currentUser;
    const criteria = {
      search: this.searchQuery,
      query: this.searchQuery,
      genre: this.selectedCategory,
      era: this.selectedEra,
      yearMin: this.filterYearMin,
      yearMax: this.filterYearMax,
      ageRating: this.selectedAge,
      volume: this.selectedVolume,
      pagesLength: this.selectedVolume,
      format: this.selectedFormat,
      difficulty: this.selectedDifficulty,
      status: this.selectedStatus,
      sort: this.selectedSort,
      sortBy: this.selectedSort,
      username: user?.username,
      userId: user?.username
    };

    let displayBooks = [];
    if (this.selectedCategory === 'recommend') {
      const allBooks = window.bookRelay.getAllBooks();
      displayBooks = window.recommendations.getRecommendations(allBooks, user);
      if (this.searchQuery) {
        displayBooks = displayBooks.filter(b => 
          b.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          b.author.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    } else {
      displayBooks = window.bookRelay.filterCatalog(criteria);
    }

    if (counterEl) counterEl.textContent = displayBooks.length;
    if (megaCountEl) megaCountEl.textContent = displayBooks.length;

    const isFiltered = Boolean(
      this.searchQuery || 
      this.selectedCategory !== 'all' || 
      this.selectedSort !== 'popular' || 
      this.selectedEra !== 'all' || 
      this.filterYearMin !== null || 
      this.filterYearMax !== null || 
      this.selectedAge !== 'all' || 
      this.selectedVolume !== 'all' || 
      this.selectedFormat !== 'all' || 
      this.selectedDifficulty !== 'all' || 
      this.selectedStatus !== 'all'
    );

    if (resetBtn) resetBtn.style.display = isFiltered ? 'inline-block' : 'none';
    if (resetLink) resetLink.style.display = isFiltered ? 'inline-block' : 'none';

    if (displayBooks.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem; color: var(--text-muted); background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔍</div>
          <h3 style="color:#fff; font-size:1.3rem; margin-bottom:0.5rem;">По вашим критериям произведений не найдено</h3>
          <p style="font-size:0.9rem; max-width:500px; margin:0 auto 1.2rem;">Попробуйте расширить диапазон лет, изменить возраст или сбросить фильтры.</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('btn-reset-remanga-filters')?.click()">Сбросить все фильтры</button>
        </div>
      `;
      const expandWrap = document.getElementById('catalog-expand-wrap');
      if (expandWrap) expandWrap.style.display = 'none';
      return;
    }

    const totalCount = displayBooks.length;
    const pagedBooks = displayBooks.slice(0, this.catalogDisplayLimit);

    pagedBooks.forEach((b) => {
      let rarityPillClass = 'rarity-pill-classic';
      if (b.rarity === 'legendary') rarityPillClass = 'rarity-pill-legendary';
      else if (b.rarity === 'masterpiece') rarityPillClass = 'rarity-pill-masterpiece';
      else if (b.rarity === 'epic') rarityPillClass = 'rarity-pill-epic';

      const saved = window.readerEngine ? window.readerEngine.getSavedProgress(b.id) : null;
      const hasProgress = saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0;
      const progressBadge = hasProgress 
        ? `<span class="book-progress-pill">Гл. ${saved.currentChapter + 1} (${saved.progressPercent || 0}%)</span>`
        : '';
      const buttonLabel = hasProgress
        ? `Продолжить (Гл. ${saved.currentChapter + 1})`
        : `Карточка книги`;

      const age = b.ageRating || '12+';
      const ageClass = age === '0+' ? 'age-0' : age === '6+' ? 'age-6' : age === '12+' ? 'age-12' : age === '16+' ? 'age-16' : 'age-18';
      const yearText = b.year < 0 ? `${Math.abs(b.year)} г. до н.э.` : `${b.year} г.`;

      // Deduplicate genre and format if they are identical
      const formatHtml = (b.format && b.format.toLowerCase() !== (b.genre || '').toLowerCase())
        ? `<span class="book-format-pill">${b.format}</span>`
        : '';

      const card = document.createElement('div');
      card.className = `steam-book-card rarity-${b.rarity} tilt-card`;
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="book-cover-banner" style="background: ${b.coverStyle};">
          <img src="${b.coverImage}" class="book-cover-real-img" alt="${b.title}" loading="lazy" decoding="async" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
          <div class="book-badges-overlay">
            <span class="rarity-pill ${rarityPillClass}">${b.rarityLabel || 'ШЕДЕВР'}</span>
            <span class="age-badge-pill ${ageClass}">${age}</span>
            ${progressBadge}
          </div>
        </div>
        <div class="steam-book-info">
          <h3 class="steam-book-title" title="${b.title}">${b.title}</h3>
          <p class="steam-book-author">✍ ${b.author} • <span class="book-year-tag">${yearText}</span></p>
          <p class="steam-book-desc">${b.synopsis || b.quote}</p>
          <div class="steam-book-meta">
            <span class="book-genre-pill">${b.genre}</span>
            ${formatHtml}
            <span class="book-pages-pill">${b.lengthPages || 200} стр.</span>
            <span class="book-rating-meta" title="98% положительных отзывов читателей">★ 98%</span>
          </div>
          <div class="steam-book-actions">
            <button class="btn btn-steam-play btn-sm btn-to-steam-lib" data-book-id="${b.id}">
              В Библиотеку
            </button>
            <button class="btn btn-secondary btn-sm btn-open-card" data-book-id="${b.id}">
              ${buttonLabel}
            </button>
          </div>
        </div>
      `;

      card.querySelector('.btn-to-steam-lib')?.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activeSteamBookId = b.id;
        this.switchView('steam-library');
      });

      // Clicking ANYWHERE on the card opens the full Book Dossier modal
      card.addEventListener('click', () => {
        this.openBookDetails(b.id);
      });

      grid.appendChild(card);
    });

    // Update Load More / Collapse expander button
    const expandWrap = document.getElementById('catalog-expand-wrap');
    const expandBtn = document.getElementById('btn-catalog-load-more');
    const expandLabel = document.getElementById('catalog-expand-label');

    if (expandWrap && expandBtn && expandLabel) {
      if (totalCount <= 12) {
        expandWrap.style.display = 'none';
      } else {
        expandWrap.style.display = 'block';
        if (this.catalogDisplayLimit < totalCount) {
          expandLabel.textContent = `Показать ещё произведения (${Math.min(this.catalogDisplayLimit, totalCount)} из ${totalCount}) ▾`;
          expandBtn.dataset.mode = 'more';
        } else {
          expandLabel.textContent = `Свернуть каталог (показаны все ${totalCount}) ▲`;
          expandBtn.dataset.mode = 'collapse';
        }
      }
    }

    this.bindTiltEffect();
  }

  // =========================================================================
  // STEAM 2-PANE LIBRARY & COMMUNITY FEED ENGINE
  // =========================================================================

  renderSteamLibrary(selectedBookId) {
    const listEl = document.getElementById('steam-lib-list');
    const searchInput = document.getElementById('steam-lib-search-input');
    const clearBtn = document.getElementById('btn-steam-lib-clear-search');
    const countAll = document.getElementById('steam-count-all');
    const countReading = document.getElementById('steam-count-reading');
    const countFav = document.getElementById('steam-count-fav');
    if (!listEl) return;

    const allBooks = window.bookRelay.getAllBooks();
    const user = window.auth.currentUser;
    const favs = user?.shelves?.favorites || [];

    let readingCount = 0;
    allBooks.forEach(b => {
      const saved = window.readerEngine?.getSavedProgress?.(b.id);
      if (saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0) {
        readingCount++;
      }
    });

    if (countAll) countAll.textContent = allBooks.length;
    if (countReading) countReading.textContent = readingCount;
    if (countFav) countFav.textContent = favs.length;

    const filter = this.steamLibFilter || 'all';
    const query = (this.steamLibSearchQuery || '').toLowerCase().trim();

    let filtered = allBooks.filter(b => {
      if (filter === 'reading') {
        const saved = window.readerEngine?.getSavedProgress?.(b.id);
        if (!saved || typeof saved.currentChapter !== 'number' || saved.currentChapter <= 0) return false;
      } else if (filter === 'fav') {
        if (!favs.includes(b.id)) return false;
      }
      if (query) {
        return b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query) || (b.genre && b.genre.toLowerCase().includes(query));
      }
      return true;
    });

    // Apply sorting
    const sortMode = this.steamLibSortMode || 'default';
    if (sortMode === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
    } else if (sortMode === 'author') {
      filtered.sort((a, b) => a.author.localeCompare(b.author, 'ru'));
    } else if (sortMode === 'progress') {
      filtered.sort((a, b) => {
        const progA = window.readerEngine?.getSavedProgress?.(a.id)?.progressPercent || 0;
        const progB = window.readerEngine?.getSavedProgress?.(b.id)?.progressPercent || 0;
        return progB - progA;
      });
    } else if (sortMode === 'pages') {
      filtered.sort((a, b) => (b.chapters?.length || 0) - (a.chapters?.length || 0));
    }

    // Bind sort selector
    const sortSelect = document.getElementById('steam-lib-sort-select');
    if (sortSelect && !sortSelect.dataset.bound) {
      sortSelect.dataset.bound = 'true';
      sortSelect.value = this.steamLibSortMode || 'default';
      sortSelect.addEventListener('change', (e) => {
        this.steamLibSortMode = e.target.value;
        this.renderSteamLibrary(this.activeSteamBookId);
      });
    }

    listEl.innerHTML = '';
    if (filtered.length === 0) {
      listEl.innerHTML = '<div style="color: #6a7b92; font-size: 0.85rem; padding: 1.5rem; text-align: center;">Ничего не найдено в этой коллекции.</div>';
    } else {
      filtered.forEach(b => {
        const saved = window.readerEngine?.getSavedProgress?.(b.id);
        const hasProg = saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0;
        const currentActive = (selectedBookId || this.activeSteamBookId || filtered[0].id);
        const isCurrent = (b.id === currentActive);

        const item = document.createElement('div');
        item.className = `steam-lib-item ${isCurrent ? 'active' : ''}`;
        item.dataset.bookId = b.id;
        item.innerHTML = `
          <img src="${b.coverImage}" class="steam-lib-item-icon" alt="" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
          <div class="steam-lib-item-info">
            <span class="steam-lib-item-title">${b.title}</span>
            <div class="steam-lib-item-meta">
              <span>${b.author}</span>
              ${hasProg ? `<span class="steam-lib-badge-active">Гл. ${saved.currentChapter + 1} (${saved.progressPercent || 0}%)</span>` : `<span>${b.chapters?.length || 1} глав</span>`}
            </div>
          </div>
        `;

        item.addEventListener('click', () => {
          this.selectSteamBook(b.id);
        });

        listEl.appendChild(item);
      });
    }

    // Bind collection tabs
    document.querySelectorAll('.steam-col-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.steam-col-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.steamLibFilter = tab.dataset.steamFilter;
        this.renderSteamLibrary(this.activeSteamBookId);
      };
    });

    // Bind search
    if (searchInput && !searchInput.dataset.bound) {
      searchInput.dataset.bound = 'true';
      searchInput.addEventListener('input', (e) => {
        this.steamLibSearchQuery = e.target.value;
        if (clearBtn) clearBtn.style.display = this.steamLibSearchQuery ? 'block' : 'none';
        this.renderSteamLibrary(this.activeSteamBookId);
      });
      if (clearBtn) {
        clearBtn.addEventListener('click', () => {
          searchInput.value = '';
          this.steamLibSearchQuery = '';
          clearBtn.style.display = 'none';
          this.renderSteamLibrary(this.activeSteamBookId);
        });
      }
    }

    const initialBook = (selectedBookId || this.activeSteamBookId || (filtered[0] ? filtered[0].id : allBooks[0].id));
    this.selectSteamBook(initialBook);
  }

  selectSteamBook(bookId) {
    const book = window.bookRelay.getBookById(bookId);
    const contentEl = document.getElementById('steam-lib-content');
    if (!book || !contentEl) return;

    this.activeSteamBookId = bookId;

    document.querySelectorAll('.steam-lib-item').forEach(item => {
      item.classList.toggle('active', item.dataset.bookId === bookId);
    });

    const saved = window.readerEngine?.getSavedProgress?.(book.id);
    const hasProgress = saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0;
    const currentChapter = hasProgress ? saved.currentChapter : 0;
    const progressPercent = hasProgress ? (saved.progressPercent || 0) : 0;
    const chapters = book.chapters || [];

    const user = window.auth.currentUser;
    const isFav = user?.shelves?.favorites?.includes(book.id);
    const shelves = window.bookRelay.getUserShelves(user ? user.username : 'guest');
    const isCompleted = shelves.completed.some(c => c.id === book.id) || progressPercent >= 100;
    const hoursRead = hasProgress ? ((saved.currentChapter + 1) * 0.45).toFixed(1) : (book.lengthPages > 500 ? '4.8' : '2.1');

    contentEl.innerHTML = `
      <!-- Steam Hero Backdrop -->
      <div class="steam-hero-backdrop">
        <img src="${book.coverImage}" class="steam-hero-bg-img" alt="">
        <div class="steam-hero-gradient"></div>
        <div class="steam-hero-content">
          <div class="steam-hero-cover-wrap">
            <img src="${book.coverImage}" alt="${book.title}" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
          </div>
          <div class="steam-hero-info">
            <div style="display:flex; gap:0.5rem; align-items:center; margin-bottom:0.5rem; flex-wrap:wrap;">
              <span class="rarity-pill ${book.rarity === 'legendary' ? 'rarity-pill-legendary' : book.rarity === 'masterpiece' ? 'rarity-pill-masterpiece' : 'rarity-pill-epic'}">${book.rarityLabel || 'ШЕДЕВР'}</span>
              <span class="book-genre-pill">${book.genre}</span>
              <span style="color: #6a7b92; font-size: 0.82rem; font-weight: 700;">ГОД: ${book.year}</span>
            </div>
            <h1 class="steam-hero-title">${book.title}</h1>
            <div class="steam-hero-author">✍ ${book.author}</div>
            <div class="steam-review-summary-row">
              <span class="steam-review-label">ОБЗОРЫ ПОЛЬЗОВАТЕЛЕЙ:</span>
              <span class="steam-review-score-positive">👍 КРАЙНЕ ПОЛОЖИТЕЛЬНЫЕ (98% из 2,410 обзоров)</span>
            </div>
            <div class="steam-action-row">
              <button class="btn-steam-play" id="btn-steam-launch-game">
                ${hasProgress ? `ПРОДОЛЖИТЬ (ГЛ. ${currentChapter + 1})` : 'ЧИТАТЬ СЕЙЧАС'}
              </button>
              <button class="btn-steam-secondary" id="btn-steam-mark-completed" title="Завершить чтение и получить +150 Люменов" style="${isCompleted ? 'border-color:rgba(0,255,136,0.5); color:var(--accent-green);' : 'border-color:rgba(255,215,0,0.5); color:var(--accent-gold);'}">
                ${isCompleted ? '✓ ПРОЧИТАНО (+150 ⬡)' : '🏆 ОТМЕТИТЬ ПРОЧИТАННОЙ (+150 ⬡)'}
              </button>
              <button class="btn-steam-secondary" id="btn-steam-toggle-favorite">
                ${isFav ? 'В ИЗБРАННОМ' : 'В ИЗБРАННОЕ'}
              </button>
              <button class="btn-steam-secondary" id="btn-steam-view-dossier">
                ДОСЬЕ ИЗДАНИЯ
              </button>
              ${hasProgress ? `
              <button class="btn-steam-secondary" id="btn-steam-reset-progress" style="color: #ff7788; border-color: rgba(255, 119, 136, 0.4);" title="Сбросить прогресс чтения книги к началу">
                🔄 СБРОСИТЬ
              </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>

      <!-- Steam Stats Bar -->
      <div class="steam-stats-bar">
        <div class="steam-stat-item">
          <div class="steam-stat-header">ПОСЛЕДНИЙ ЗАПУСК</div>
          <div class="steam-stat-value">${hasProgress ? 'Сегодня' : 'Никогда'}</div>
        </div>
        <div class="steam-stat-item">
          <div class="steam-stat-header">ВРЕМЯ В ЧТЕНИИ</div>
          <div class="steam-stat-value steam-stat-highlight">${hoursRead} ч.</div>
        </div>
        <div class="steam-stat-item">
          <div class="steam-stat-header">ПРОГРЕСС СЮЖЕТА</div>
          <div class="steam-stat-value">Гл. ${currentChapter + 1} (${progressPercent}%)</div>
        </div>
        <div class="steam-stat-item">
          <div class="steam-stat-header">ДОСТИЖЕНИЯ В КНИГЕ</div>
          <div class="steam-stat-value" style="color: #66c0f4;">4 / 6 (67%)</div>
        </div>
      </div>

      <!-- Main Body Container -->
      <div class="steam-body-content">
        <!-- Synopsis & Tags -->
        <div class="steam-synopsis-box">
          <div class="steam-section-heading">О ПРОИЗВЕДЕНИИ</div>
          <p style="font-size: 1.05rem; line-height: 1.6; color: #c7d5e0; margin-bottom: 1rem;">
            ${book.synopsis || book.quote || 'Великое произведение мировой классической литературы.'}
          </p>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <span class="remanga-chip active">#Шедевр</span>
            <span class="remanga-chip active">#МироваяКлассика</span>
            <span class="remanga-chip active">#${book.genre.replace(/\s+/g, '')}</span>
            <span class="remanga-chip active">#ГлубокийСюжет</span>
            <span class="remanga-chip active">#ZeroStorageRelay</span>
          </div>
        </div>

        <!-- Steam Achievements in Book -->
        <div>
          <div class="steam-section-heading">
            <span>🏆 ДОСТИЖЕНИЯ ЧИТАТЕЛЯ</span>
            <span style="font-size: 0.85rem; color: #66c0f4;">4 из 6 получено</span>
          </div>
          <div class="steam-achievements-row">
            <div class="steam-ach-card">
              <span class="steam-ach-icon">📖</span>
              <div>
                <div class="steam-ach-name">Первая Страница</div>
                <div class="steam-ach-desc">Открыта первая глава произведения</div>
              </div>
            </div>
            <div class="steam-ach-card">
              <span class="steam-ach-icon">👑</span>
              <div>
                <div class="steam-ach-name">Покоритель Фолиантов</div>
                <div class="steam-ach-desc">Изучено более 500 страниц</div>
              </div>
            </div>
            <div class="steam-ach-card">
              <span class="steam-ach-icon">⚔️</span>
              <div>
                <div class="steam-ach-name">Мастер Мысли</div>
                <div class="steam-ach-desc">Завершено 5 ключевых глав</div>
              </div>
            </div>
            <div class="steam-ach-card">
              <span class="steam-ach-icon">🕯️</span>
              <div>
                <div class="steam-ach-name">Ночной Схоласт</div>
                <div class="steam-ach-desc">Чтение в атмосфере полуночи</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table of Contents & Quick Chapters Launch -->
        <div>
          <div class="steam-section-heading">
            <span>📚 ГЛАВЫ ПРОИЗВЕДЕНИЯ (${chapters.length})</span>
            <span style="font-size: 0.85rem; color: #8e9bb0;">Нажмите на любую главу для быстрого перехода</span>
          </div>
          <div class="steam-chapters-grid">
            ${chapters.map((ch, idx) => `
              <button class="steam-chapter-btn ${idx === currentChapter ? 'is-current' : ''}" data-ch-idx="${idx}">
                <span>${idx + 1}. ${ch.title}</span>
                <span>${idx === currentChapter ? '▶ Читаете' : '→'}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Community Reviews Box -->
        <div>
          <div class="steam-section-heading">
            <span>ОБЗОРЫ СООБЩЕСТВА STEAM</span>
            <button class="btn btn-secondary btn-sm" id="btn-steam-write-review">Написать обзор</button>
          </div>
          <div class="community-reviews-grid" id="steam-book-reviews-list">
            <!-- Reviews injected here -->
          </div>
        </div>
      </div>
    `;

    contentEl.querySelector('#btn-steam-launch-game')?.addEventListener('click', () => {
      window.readerEngine.openBook(book.id, currentChapter);
      this.switchView('reader');
    });

    contentEl.querySelector('#btn-steam-mark-completed')?.addEventListener('click', () => {
      const u = window.auth.currentUser;
      if (!u) { this.openModal('modal-auth'); return; }
      const username = u.username || 'guest';
      const userShelves = window.bookRelay.getUserShelves(username);
      const alreadyDone = userShelves.completed.some(c => c.id === book.id);
      if (alreadyDone) {
        this.showToast(`«${book.title}» уже завершена! Награда за эту книгу получена.`, 'info');
        return;
      }

      window.bookRelay.updateProgress(username, book.id, 100, (book.chapters?.length || 1) - 1);
      window.auth.addLumens(150);
      window.auth.addXp(300);
      window.auth.updateStat('booksRead', 1);

      if (window.soundEngine) {
        if (window.soundEngine.playCoin) window.soundEngine.playCoin();
        if (window.soundEngine.playGameWin) window.soundEngine.playGameWin();
      }
      this.showToast(`🎉 Произведение «${book.title}» завершено! Начислено: +150 ⬡ Люменов для игр в Аркаде и +300 XP!`, 'reward');

      this.renderSteamLibrary(book.id);
      this.renderProfile();
      if (window.miniGamesSuite) window.miniGamesSuite.updateEnergyUI();
    });

    contentEl.querySelector('#btn-steam-toggle-favorite')?.addEventListener('click', () => {
      const u = window.auth.currentUser;
      if (!u) { this.openModal('modal-auth'); return; }
      if (!u.shelves) u.shelves = {};
      if (!u.shelves.favorites) u.shelves.favorites = [];
      const idx = u.shelves.favorites.indexOf(book.id);
      if (idx > -1) {
        u.shelves.favorites.splice(idx, 1);
        this.showToast(`«${book.title}» удалена из избранного.`, 'info');
      } else {
        u.shelves.favorites.push(book.id);
        this.showToast(`«${book.title}» добавлена в избранное!`, 'success');
      }
      window.auth.saveUser();
      this.selectSteamBook(book.id);
      this.renderSteamLibrary(book.id);
    });

    contentEl.querySelector('#btn-steam-view-dossier')?.addEventListener('click', () => {
      this.openBookDetails(book.id);
    });

    contentEl.querySelector('#btn-steam-reset-progress')?.addEventListener('click', () => {
      window.readerEngine.resetBookProgress(book.id);
      this.selectSteamBook(book.id);
      this.renderSteamLibrary(book.id);
    });

    contentEl.querySelectorAll('.steam-chapter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const chIdx = parseInt(btn.dataset.chIdx, 10);
        window.readerEngine.openBook(book.id, chIdx);
        this.switchView('reader');
      });
    });

    contentEl.querySelector('#btn-steam-write-review')?.addEventListener('click', () => {
      this.openBookDetails(book.id);
      setTimeout(() => {
        const box = document.getElementById('add-review-box');
        if (box) box.style.display = 'block';
      }, 200);
    });

    const reviews = window.bookRelay.getReviews(book.id);
    const reviewsContainer = contentEl.querySelector('#steam-book-reviews-list');
    if (reviewsContainer) {
      reviewsContainer.innerHTML = '';
      reviews.slice(0, 4).forEach(r => {
        const card = document.createElement('div');
        card.className = 'steam-review-card';
        card.innerHTML = `
          <div class="steam-rev-author-bar">
            <div class="steam-rev-user">
              <div class="steam-rev-avatar">${r.avatar || '👤'}</div>
              <div>
                <div class="steam-rev-name">${r.author || 'Читатель'}</div>
                <div class="steam-rev-hours">В чтении на момент обзора: ${r.timeRead || '12.4 ч.'}</div>
              </div>
            </div>
            <span class="steam-rev-badge-thumb ${r.recommended !== false ? 'steam-rev-thumb-up' : 'steam-rev-thumb-down'}">
              ${r.recommended !== false ? '👍 РЕКОМЕНДУЮ' : '👎 НЕ РЕКОМЕНДУЮ'}
            </span>
          </div>
          <div class="steam-rev-text">${r.text || 'Великолепное произведение, трогающее за душу.'}</div>
          <div class="steam-rev-footer">
            <span>Опубликовано: ${r.date || 'Недавно'}</span>
            ${r.source ? `<span style="margin-left: auto; color: #00f0ff; font-size: 0.75rem; font-weight: 600;">🌐 ${r.source}</span>` : ''}
            <div class="steam-rev-helpful-btns">
              <button class="steam-rev-help-btn">Да (14)</button>
              <button class="steam-rev-help-btn">Нет (1)</button>
              <button class="steam-rev-help-btn">Наградить</button>
            </div>
          </div>
        `;
        reviewsContainer.appendChild(card);
      });
    }
  }

  renderCommunityFeed() {
    const grid = document.getElementById('community-reviews-grid');
    const badge = document.getElementById('community-reviews-count-badge');
    if (!grid) return;

    const allBooks = window.bookRelay.getAllBooks();
    const allReviews = [];

    allBooks.forEach(b => {
      const revs = window.bookRelay.getReviews(b.id);
      revs.forEach(r => {
        allReviews.push({ ...r, bookTitle: b.title, bookId: b.id });
      });
    });

    if (badge) badge.innerHTML = `Всего обзоров в Steam-Хабе: <strong>${allReviews.length}</strong>`;

    grid.innerHTML = '';
    allReviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'steam-review-card';
      card.innerHTML = `
        <div class="steam-rev-author-bar">
          <div class="steam-rev-user clickable-user-card" onclick="window.app.viewUserProfile('${r.username || r.author}')" title="Открыть публичный профиль автора">
            <div class="steam-rev-avatar">${r.avatar || '👤'}</div>
            <div>
              <div class="steam-rev-name">${r.author || 'Схоласт'}</div>
              <div class="steam-rev-hours">В чтении: ${r.timeRead || '8.2 ч.'}</div>
            </div>
          </div>
          <span class="steam-rev-badge-thumb ${r.recommended !== false ? 'steam-rev-thumb-up' : 'steam-rev-thumb-down'}">
            ${r.recommended !== false ? 'РЕКОМЕНДУЮ' : 'НЕ РЕКОМЕНДУЮ'}
          </span>
        </div>
        <div class="steam-rev-book-title">
          Книга: <strong style="color: #66c0f4; cursor: pointer;" onclick="window.app.switchView('steam-library'); window.app.selectSteamBook('${r.bookId}')">${r.bookTitle}</strong>
        </div>
        <div class="steam-rev-text">${r.text}</div>
        <div class="steam-rev-footer">
          <span>Опубликовано: ${r.date || 'Недавно'}</span>
          <div class="steam-rev-helpful-btns">
            <button class="steam-rev-help-btn">Да (18)</button>
            <button class="steam-rev-help-btn">Нет (0)</button>
            <button class="steam-rev-help-btn">Наградить</button>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });

    document.getElementById('btn-community-write-review')?.addEventListener('click', () => {
      this.switchView('steam-library');
      this.showToast('Выберите книгу из левого списка библиотеки, чтобы написать на неё обзор.', 'info');
    });
  }

  // --- BOOK DOSSIER MODAL & REVIEWS ---

  // --- FULL-WINDOW STEAM BOOK DOSSIER & REVIEWS HUB ---

  bindBookDetailsModal() {
    // Tab switching inside the window
    document.querySelectorAll('.dossier-nav-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const target = e.currentTarget.dataset.dossierTab;
        this.switchDossierTab(target);
      });
    });

    // Quick navigation triggers between tabs
    document.getElementById('btn-modal-go-reviews')?.addEventListener('click', () => {
      this.switchDossierTab('reviews');
    });
    document.getElementById('btn-dossier-view-all-reviews')?.addEventListener('click', () => {
      this.switchDossierTab('reviews');
    });
    document.getElementById('btn-dossier-view-all-chapters')?.addEventListener('click', () => {
      this.switchDossierTab('toc');
    });

    // Toggle add review form
    const toggleForm = () => {
      const box = document.getElementById('add-review-box');
      if (box) {
        const isHidden = box.style.display === 'none';
        box.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
          box.scrollIntoView({ behavior: 'smooth', block: 'center' });
          document.getElementById('new-review-text')?.focus();
        }
      }
    };

    document.getElementById('btn-toggle-add-review')?.addEventListener('click', toggleForm);
    document.getElementById('btn-toggle-add-review-top')?.addEventListener('click', toggleForm);
    document.getElementById('btn-cancel-add-review')?.addEventListener('click', () => {
      const box = document.getElementById('add-review-box');
      if (box) box.style.display = 'none';
    });

    // Review filters
    document.querySelectorAll('.dossier-filter-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('.dossier-filter-chip').forEach(c => c.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.currentDossierReviewFilter = e.currentTarget.dataset.revFilter;
        if (this.activeDossierBookId) {
          this.renderBookReviews(this.activeDossierBookId);
        }
      });
    });

    // Review submit
    const submitBtn = document.getElementById('btn-submit-review');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const user = window.auth.currentUser;
        if (!user) { this.openModal('modal-auth'); return; }

        const textEl = document.getElementById('new-review-text');
        const ratingEl = document.getElementById('new-review-rating');
        const recEl = document.getElementById('new-review-recommended');
        const text = textEl?.value.trim();
        if (!text) {
          this.showToast('Пожалуйста, напишите текст рецензии.', 'warning');
          return;
        }

        const newReview = {
          id: 'rev_' + Date.now(),
          author: user.displayName || user.username,
          username: user.username,
          avatar: user.avatar || '📖',
          date: 'Только что',
          rating: parseInt(ratingEl?.value || 5),
          recommended: recEl?.value === 'true',
          timeRead: '0.8 ч.',
          helpfulCount: 1,
          source: 'Читатель CyberLibris',
          text: text
        };

        window.bookRelay.addReview(this.activeDossierBookId, newReview);
        window.auth.addXp(30);
        window.auth.addLumens(15);
        this.showToast('Рецензия опубликована! +30 XP, +15 Люменов', 'reward');
        if (textEl) textEl.value = '';
        const box = document.getElementById('add-review-box');
        if (box) box.style.display = 'none';

        this.renderBookReviews(this.activeDossierBookId);
      };
    }
  }

  switchDossierTab(tabName) {
    const tabs = document.querySelectorAll('.dossier-nav-tab');
    const panels = document.querySelectorAll('.dossier-tab-panel');

    tabs.forEach(t => {
      if (t.dataset.dossierTab === tabName) t.classList.add('active');
      else t.classList.remove('active');
    });

    panels.forEach(p => {
      if (p.id === `dossier-panel-${tabName}`) {
        p.style.display = 'block';
        p.classList.add('active');
      } else {
        p.style.display = 'none';
        p.classList.remove('active');
      }
    });

    const scrollBody = document.getElementById('dossier-window-scroll-body');
    if (scrollBody) scrollBody.scrollTop = 0;
  }

  openBookDetails(bookId) {
    const book = window.bookRelay.getBookById(bookId);
    if (!book) return;

    this.activeDossierBookId = bookId;
    this.currentDossierReviewFilter = 'all';

    // Reset to info tab
    this.switchDossierTab('info');

    // Backdrop & Title
    const backdropEl = document.getElementById('book-modal-backdrop-img');
    if (backdropEl) backdropEl.style.backgroundImage = `url('${book.coverImage}')`;

    const titleEl = document.getElementById('book-modal-title');
    if (titleEl) {
      titleEl.textContent = book.title;
      titleEl.title = book.title;
    }

    const coverEl = document.getElementById('book-modal-cover');
    if (coverEl) {
      coverEl.src = book.coverImage;
      coverEl.onerror = () => { coverEl.src = 'https://covers.openlibrary.org/b/id/12818862-L.jpg'; };
    }

    const rarityPill = document.getElementById('book-modal-rarity-pill');
    if (rarityPill) {
      rarityPill.className = `rarity-pill ${book.rarity === 'legendary' ? 'rarity-pill-legendary' : book.rarity === 'masterpiece' ? 'rarity-pill-masterpiece' : 'rarity-pill-epic'}`;
      rarityPill.textContent = book.rarityLabel || 'ШЕДЕВР';
    }

    const agePill = document.getElementById('book-modal-age-pill');
    if (agePill) {
      const age = book.ageRating || '16+';
      const ageClass = age === '0+' ? 'age-0' : age === '6+' ? 'age-6' : age === '12+' ? 'age-12' : age === '16+' ? 'age-16' : 'age-18';
      agePill.className = `age-badge-pill ${ageClass}`;
      agePill.textContent = age;
    }

    // Author & Epoch
    const authorEl = document.getElementById('book-modal-author');
    if (authorEl) authorEl.textContent = `✍ ${book.author}`;

    const epochEl = document.getElementById('book-modal-epoch-tag');
    if (epochEl) {
      const year = book.year;
      const era = year < 0 ? `${Math.abs(year)} г. до н.э. (Античность)` : year < 1800 ? `${year} г. (До XIX в.)` : year < 1900 ? `${year} г. (Золотой век / XIX в.)` : year < 2000 ? `${year} г. (XX век)` : `${year} г. (XXI век)`;
      epochEl.textContent = era;
    }

    // Rating & Score
    const ratingVal = book.rating ? Number(book.rating).toFixed(1) : '4.9';
    const ratingScoreEl = document.getElementById('book-modal-rating-score');
    if (ratingScoreEl) ratingScoreEl.textContent = ratingVal;

    const ratingCountEl = document.getElementById('book-modal-rating-count');
    if (ratingCountEl) ratingCountEl.textContent = `98% положительных (${book.ratingCount || 2410}+ оценок)`;

    // Specs Mega Grid
    const genreEl = document.getElementById('book-modal-genre');
    if (genreEl) genreEl.textContent = book.genre || 'Классика';

    const formatEl = document.getElementById('book-modal-format');
    if (formatEl) formatEl.textContent = book.format || (book.lengthPages > 500 ? 'Роман-эпопея / Фолиант' : 'Роман');

    const wordsCount = Math.round((book.lengthPages || 200) * 270);
    const pagesEl = document.getElementById('book-modal-pages');
    if (pagesEl) pagesEl.textContent = `~${book.lengthPages || 200} стр. (${wordsCount.toLocaleString('ru-RU')} слов)`;

    const readHours = Math.max(1, Math.round(wordsCount / 220 / 60));
    const readingTimeEl = document.getElementById('book-modal-reading-time');
    if (readingTimeEl) readingTimeEl.textContent = `~${readHours} ч. (при 220 сл/мин)`;

    const diffEl = document.getElementById('book-modal-difficulty');
    if (diffEl) diffEl.textContent = book.difficulty || (book.lengthPages > 500 ? 'Хардкор' : 'Средняя');

    const yearEl = document.getElementById('book-modal-year');
    if (yearEl) yearEl.textContent = book.year < 0 ? `${Math.abs(book.year)} г. до н.э.` : `${book.year} г.`;

    const ageRatingEl = document.getElementById('book-modal-age-rating');
    if (ageRatingEl) ageRatingEl.textContent = `${book.ageRating || '16+'} (Рекомендовано читательской коллегией)`;

    const relaySourceEl = document.getElementById('book-modal-relay-source');
    if (relaySourceEl) {
      const srcName = book.relaySource?.provider === 'archive' ? 'Internet Archive Relay' : 'Викитека & Open Library';
      relaySourceEl.textContent = `● ${srcName} (Подлинный текст)`;
    }

    // Philosophy Callout
    const philBox = document.getElementById('book-modal-philosophy-box');
    const philText = document.getElementById('book-modal-philosophy');
    if (philBox && philText) {
      let philStr = book.philosophy;
      if (!philStr) {
        if (book.genre === 'Философия') philStr = 'Глубокое исследование стоической невозмутимости, природы познания и гармонии разума с космосом.';
        else if (book.genre === 'Военная проза') philStr = 'Осмысление истинного героизма, народной воли и иллюзорности единоличной власти над историческими судьбами.';
        else if (book.genre === 'Фантастика') philStr = 'Предостережение человечеству о границах контроля, этике технологий и сохранении духа личности.';
        else philStr = 'Исследование нравственного долга, совести и способности человека к внутреннему духовному перерождению.';
      }
      philText.textContent = philStr;
    }

    // Quote Box
    const quoteBox = document.getElementById('book-modal-quote-box');
    const quoteText = document.getElementById('book-modal-quote');
    if (quoteBox && quoteText) {
      const quoteStr = book.quote || '«Книга — это зеркало: и если в него смотрится обезьяна, то из него не может выглянуть апостол».';
      quoteText.textContent = quoteStr;
    }

    // Synopsis
    const synopsisEl = document.getElementById('book-modal-synopsis');
    if (synopsisEl) synopsisEl.textContent = book.synopsis || 'Монументальное произведение мирового литературного наследия.';

    // Check saved progress
    const saved = window.readerEngine ? window.readerEngine.getSavedProgress(book.id) : null;
    const hasProgress = saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0;
    const savedChNum = hasProgress ? saved.currentChapter + 1 : 1;
    const savedChTitle = saved?.chapterTitle || `Глава ${savedChNum}`;

    // Read buttons
    const readMangaBtn = document.getElementById('btn-modal-read-manga');
    if (readMangaBtn) {
      readMangaBtn.innerHTML = hasProgress 
        ? `Продолжить чтение (Гл. ${savedChNum})` 
        : '📖 Читать (Manga-лента)';
      readMangaBtn.title = hasProgress ? `Возобновить чтение: ${savedChTitle}` : 'Читать в режиме непрерывной ленты';
      readMangaBtn.onclick = () => {
        this.closeAllModals();
        window.readerEngine.openBook(book.id, null, 'manga');
      };
    }

    const readPageBtn = document.getElementById('btn-modal-read-page');
    if (readPageBtn) {
      readPageBtn.innerHTML = hasProgress 
        ? `Продолжить по главам (Гл. ${savedChNum})` 
        : '📄 Читать по главам';
      readPageBtn.title = hasProgress ? `Возобновить чтение: ${savedChTitle}` : 'Читать по главам';
      readPageBtn.onclick = () => {
        this.closeAllModals();
        window.readerEngine.openBook(book.id, null, 'page');
      };
    }

    // Quiz Button
    const quizBtn = document.getElementById('btn-modal-open-quiz');
    if (quizBtn) {
      quizBtn.onclick = () => {
        this.closeAllModals();
        this.switchView('games');
        if (window.arcadeGames?.startQuizForBook) {
          window.arcadeGames.startQuizForBook(book.id);
        }
      };
    }

    // Favorite Button
    const favBtn = document.getElementById('btn-modal-toggle-fav');
    if (favBtn) {
      const user = window.auth?.currentUser;
      const isFav = user?.shelves?.favorites?.includes(book.id) || false;
      favBtn.textContent = isFav ? '✓ В избранном' : '⭐ В избранное';
      favBtn.onclick = () => {
        const u = window.auth.currentUser;
        if (!u) { this.openModal('modal-auth'); return; }
        const fav = window.bookRelay.toggleFavorite(u.username, book.id);
        favBtn.textContent = fav ? '✓ В избранном' : '⭐ В избранное';
        this.showToast(fav ? 'Добавлено в избранное!' : 'Удалено из избранного', 'info');
      };
    }

    // Chapters TOC Preview and Full TOC
    this.renderDossierChapters(book, saved);

    // If chapters are not streamed yet, pre-stream in background to populate TOC immediately
    if ((!book.chapters || book.chapters.length === 0) && window.bookRelay?.streamBook) {
      window.bookRelay.streamBook(book.id).then(res => {
        if (res && book.chapters && book.chapters.length > 0) {
          this.renderDossierChapters(book, saved);
        }
      }).catch(() => {});
    }

    // Reviews Hub
    this.renderBookReviews(book.id);

    this.openModal('modal-book-details');
  }

  renderDossierChapters(book, saved) {
    const chapters = book.chapters || [];
    const tocPreviewEl = document.getElementById('book-modal-chapters-toc');
    const fullTocEl = document.getElementById('dossier-full-chapters-list');
    const tocTabCount = document.getElementById('book-modal-toc-tab-count');
    const progressInd = document.getElementById('dossier-toc-progress-indicator');

    if (tocTabCount) tocTabCount.textContent = chapters.length;

    if (progressInd) {
      const pct = saved ? (saved.progressPercent || 0) : 0;
      progressInd.textContent = pct > 0 ? `Прогресс: ${pct}% (Глава ${(saved?.currentChapter || 0) + 1} из ${chapters.length || 1})` : 'Ещё не начато';
    }

    if (chapters.length === 0) {
      const fallbackMsg = `
        <div style="background: rgba(0,0,0,0.35); border: 1px dashed rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 0.9rem 1.2rem; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size:0.85rem; font-weight:700; color:var(--accent-cyan);">Живая потоковая ретрансляция текста</div>
            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:2px;">Главы подкачиваются в реальном времени из глобального репозитория при открытии читалки</div>
          </div>
          <span class="pulse-dot"></span>
        </div>
      `;
      if (tocPreviewEl) tocPreviewEl.innerHTML = fallbackMsg;
      if (fullTocEl) fullTocEl.innerHTML = fallbackMsg;
      return;
    }

    // Preview in Tab 1 (first 4 chapters)
    if (tocPreviewEl) {
      const previewSlice = chapters.slice(0, 4);
      tocPreviewEl.innerHTML = `
        <div style="background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: var(--radius-md); padding: 0.8rem 1rem;">
          <div style="display:flex; flex-direction:column; gap:0.4rem;">
            ${previewSlice.map((ch, idx) => `
              <div class="toc-chapter-item" data-chapter-idx="${idx}" style="display:flex; justify-content:space-between; align-items:center; padding:0.45rem 0.75rem; background:rgba(255,255,255,0.03); border-radius:4px; font-size:0.84rem; color:#ddd; cursor:pointer; transition:all 0.2s ease;">
                <span style="font-weight:600;"><span style="color:var(--accent-cyan); margin-right:6px;">Гл. ${idx + 1}:</span> ${ch.title}</span>
                <span style="font-size:0.75rem; color:var(--accent-cyan);">Читать →</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      tocPreviewEl.querySelectorAll('.toc-chapter-item').forEach(item => {
        item.addEventListener('mouseenter', () => item.style.background = 'rgba(0, 240, 255, 0.12)');
        item.addEventListener('mouseleave', () => item.style.background = 'rgba(255, 255, 255, 0.03)');
        item.addEventListener('click', () => {
          const chIdx = parseInt(item.dataset.chapterIdx) || 0;
          this.closeAllModals();
          window.readerEngine.openBook(book.id, chIdx, 'page');
        });
      });
    }

    // Full TOC in Tab 3
    if (fullTocEl) {
      fullTocEl.innerHTML = chapters.map((ch, idx) => {
        const isCurrent = saved && saved.currentChapter === idx;
        return `
          <div class="dossier-chapter-card ${isCurrent ? 'active' : ''}" data-chapter-idx="${idx}" style="${isCurrent ? 'border-color: var(--accent-cyan); background: rgba(0,240,255,0.08);' : ''}">
            <div>
              <div class="dossier-chapter-num">Глава ${idx + 1} ${isCurrent ? '• Вы здесь' : ''}</div>
              <div class="dossier-chapter-title">${ch.title}</div>
            </div>
            <button class="btn btn-secondary btn-sm" style="font-size:0.76rem; padding: 0.35rem 0.75rem;">
              Читать →
            </button>
          </div>
        `;
      }).join('');

      fullTocEl.querySelectorAll('.dossier-chapter-card').forEach(card => {
        card.addEventListener('click', () => {
          const chIdx = parseInt(card.dataset.chapterIdx) || 0;
          this.closeAllModals();
          window.readerEngine.openBook(book.id, chIdx, 'page');
        });
      });
    }
  }

  renderBookReviews(bookId) {
    const list = document.getElementById('book-modal-reviews-list');
    const teaserList = document.getElementById('book-modal-teaser-reviews-list');
    const tabCountEl = document.getElementById('book-modal-reviews-tab-count');
    const teaserCountBadges = document.querySelectorAll('.dossier-rev-count-badge');
    const totalCountEl = document.getElementById('dossier-total-reviews-count');
    const filterAllCount = document.getElementById('rev-filter-count-all');
    const filterRecCount = document.getElementById('rev-filter-count-rec');

    const reviews = window.bookRelay.getReviews(bookId);
    const totalCount = reviews.length;

    if (tabCountEl) tabCountEl.textContent = totalCount;
    if (totalCountEl) totalCountEl.textContent = `Всего отзывов: ${totalCount}`;
    if (filterAllCount) filterAllCount.textContent = totalCount;
    teaserCountBadges.forEach(b => b.textContent = totalCount);

    const recCount = reviews.filter(r => r.recommended !== false).length;
    if (filterRecCount) filterRecCount.textContent = recCount;

    // Filter reviews
    let displayReviews = [...reviews];
    const filter = this.currentDossierReviewFilter || 'all';
    if (filter === 'recommended') {
      displayReviews = displayReviews.filter(r => r.recommended !== false);
    } else if (filter === 'experts') {
      displayReviews = displayReviews.filter(r => (r.source && (r.source.includes('Критик') || r.source.includes('Схоласт') || r.source.includes('Verified'))));
    } else if (filter === 'recent') {
      // most recent first
      displayReviews.reverse();
    }

    // Teaser preview in Tab 1 (top 2 reviews)
    if (teaserList) {
      teaserList.innerHTML = '';
      const teaserSlice = reviews.slice(0, 2);
      if (teaserSlice.length === 0) {
        teaserList.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding:0.5rem 0;">Пока нет отзывов. Станьте первым!</div>';
      } else {
        teaserSlice.forEach(r => {
          const item = document.createElement('div');
          item.className = 'dossier-review-item-card';
          item.style.padding = '0.9rem 1.1rem';
          item.style.marginBottom = '0.6rem';
          item.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
              <div style="display:flex; align-items:center; gap:0.5rem; font-weight:800; color:#fff; font-size:0.88rem;">
                <span>${r.avatar || '📖'}</span>
                <span>${r.author}</span>
                <span style="font-size:0.72rem; color:var(--text-dim); font-weight:normal;">• ${r.date}</span>
              </div>
              <div style="color:var(--accent-gold); font-size:0.85rem;">${'★'.repeat(r.rating || 5)}</div>
            </div>
            <div style="font-size:0.84rem; color:#cbd5e1; line-height:1.45;">${r.text}</div>
          `;
          teaserList.appendChild(item);
        });
      }
    }

    // Full List in Tab 2
    if (!list) return;
    list.innerHTML = '';

    if (displayReviews.length === 0) {
      list.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted); background: rgba(0,0,0,0.3); border-radius: var(--radius-md); border: 1px dashed rgba(255,255,255,0.1);">
          <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">💬</div>
          <h4 style="color:#fff; margin-bottom:0.4rem;">Отзывов в этой категории пока нет</h4>
          <p style="font-size:0.88rem; max-width:400px; margin:0 auto 1rem;">Поделитесь своим мнением об этой книге первым!</p>
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('btn-toggle-add-review')?.click()">Оставить свой отзыв</button>
        </div>
      `;
      return;
    }

    displayReviews.forEach((r, idx) => {
      const card = document.createElement('div');
      card.className = 'dossier-review-item-card';
      const username = r.username || (r.author.toLowerCase().replace(/[^a-z0-9_]/g, '_'));

      card.innerHTML = `
        <div class="dossier-rev-user-row">
          <div class="dossier-rev-user-info" onclick="window.app.viewUserProfile('${username}')" title="Кликните, чтобы посмотреть публичный профиль автора">
            <div class="dossier-rev-avatar">${r.avatar || '👤'}</div>
            <div>
              <div class="dossier-rev-name">${r.author}</div>
              <div class="dossier-rev-time-read">В чтении: ${r.timeRead || '9.4 ч.'} • ${r.date}</div>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:0.6rem;">
            ${r.source ? `<span style="font-size:0.72rem; font-weight:700; padding:2px 8px; border-radius:4px; background:rgba(0, 240, 255, 0.12); color:#00f0ff; border:1px solid rgba(0, 240, 255, 0.25);">${r.source}</span>` : ''}
            <span style="font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:4px; ${r.recommended !== false ? 'background:rgba(0,255,136,0.15); color:#00ff88; border:1px solid rgba(0,255,136,0.3);' : 'background:rgba(255,77,77,0.15); color:#ff4d4d; border:1px solid rgba(255,77,77,0.3);'}">
              ${r.recommended !== false ? '👍 РЕКОМЕНДУЕТ' : '👎 НЕ РЕКОМЕНДУЕТ'}
            </span>
            <div style="color:var(--accent-gold); font-size:0.95rem; letter-spacing:1px;">${'★'.repeat(r.rating || 5)}</div>
          </div>
        </div>
        <div class="dossier-rev-body">${r.text}</div>
        <div class="dossier-rev-footer">
          <span>Был ли этот отзыв полезен?</span>
          <div class="dossier-rev-helpful">
            <button class="dossier-rev-help-btn btn-vote-helpful" data-idx="${idx}">Да (${r.helpfulCount || (12 + idx * 3)})</button>
            <button class="dossier-rev-help-btn btn-vote-unhelpful">Нет (0)</button>
            <button class="dossier-rev-help-btn" onclick="window.app.showToast('Спасибо за оценку рецензии!', 'success')">❤️ Наградить</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-vote-helpful')?.addEventListener('click', (e) => {
        const btn = e.currentTarget;
        if (!btn.dataset.voted) {
          btn.dataset.voted = 'true';
          const cur = parseInt(btn.textContent.match(/\d+/) || 0) + 1;
          btn.textContent = `Да (${cur})`;
          btn.style.borderColor = 'var(--accent-cyan)';
          btn.style.color = 'var(--accent-cyan)';
          window.app.showToast('Ваш голос учтён!', 'info');
        }
      });

      list.appendChild(card);
    });
  }

  // --- TASTE ONBOARDING & PREFERENCES ---

  bindTasteOnboarding() {
    document.getElementById('btn-open-taste-settings')?.addEventListener('click', () => {
      this.openModal('modal-taste-onboarding');
    });

    document.querySelectorAll('.taste-chip, .taste-chip-dislike').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.currentTarget.classList.toggle('active');
      });
    });

    document.getElementById('btn-save-taste-profile')?.addEventListener('click', () => {
      const likes = Array.from(document.querySelectorAll('.taste-chip.active')).map(c => c.dataset.val);
      const dislikes = Array.from(document.querySelectorAll('.taste-chip-dislike.active')).map(c => c.dataset.val);
      const yearlyGoal = parseInt(document.getElementById('taste-yearly-goal-select')?.value || 25);

      const user = window.auth.currentUser;
      if (user) {
        user.tasteProfile = { likes, dislikes, yearlyGoal };
        window.auth.saveUser();
      }

      this.closeAllModals();
      this.showToast('✨ Ваши литературные вкусы сохранены! Рекомендации обновлены.', 'success');
      this.renderLibrary();
      this.initSteamCarousel();
    });
  }

  // --- ADMIN RECOMMENDATION TESTER ---

  bindAdminRecommendations() {
    document.querySelectorAll('.btn-sim-archetype').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const arch = e.currentTarget.dataset.arch;
        const fakeUser = window.recommendations.simulateProfile(arch);
        const allBooks = window.bookRelay.getAllBooks();
        const recoms = window.recommendations.getRecommendations(allBooks, fakeUser, 5);

        const out = document.getElementById('admin-sim-results');
        if (out) {
          out.innerHTML = `
            <strong>Симуляция: ${fakeUser.displayName}</strong><br>
            Любит: ${fakeUser.tasteProfile.likes.join(', ')}<br>
            Исключает: ${fakeUser.tasteProfile.dislikes.join(', ')}<br><br>
            <strong>Топ-5 Рекомендаций:</strong><br>
            ${recoms.map((b, i) => `${i+1}. «${b.title}» (${b.genre}, ${b.rarityLabel})`).join('<br>')}
          `;
        }
      });
    });

    document.getElementById('btn-reset-user-recommendations')?.addEventListener('click', () => {
      window.recommendations.resetConfig();
      this.showToast('Параметры рекомендаций сброшены к значениям по умолчанию.', 'info');
    });
  }

  // --- OPEN LIBRARY API EXPLORER ---

  bindOpenLibraryExplorer() {
    const searchInput = document.getElementById('openlibrary-search-input');
    const searchBtn = document.getElementById('btn-search-openlibrary');
    const tags = document.querySelectorAll('.ol-tag-btn');

    if (searchBtn && searchInput) {
      searchBtn.addEventListener('click', () => {
        const q = searchInput.value.trim();
        if (q) this.performOpenLibrarySearch(q);
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const q = searchInput.value.trim();
          if (q) this.performOpenLibrarySearch(q);
        }
      });
    }

    tags.forEach(t => {
      t.addEventListener('click', () => {
        const q = t.dataset.query;
        if (searchInput) searchInput.value = q;
        this.performOpenLibrarySearch(q);
      });
    });
  }

  async performOpenLibrarySearch(query) {
    const grid = document.getElementById('openlibrary-results-grid');
    if (!grid) return;
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--accent-cyan);"><span class="pulse-dot" style="display:inline-block; vertical-align:middle; margin-right:8px;"></span> ⏳ Сквозной поиск по мировым библиотекам (Викитека + Open Library)...</div>';

    const books = await window.bookRelay.searchExternalRelay(query);
    grid.innerHTML = '';

    if (!books.length) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">Ничего не найдено. Попробуйте другой запрос на английском или русском.</div>';
      return;
    }

    books.forEach(b => {
      const card = document.createElement('div');
      card.className = `steam-book-card rarity-${b.rarity} tilt-card`;
      card.innerHTML = `
        <div class="book-cover-banner" style="background: ${b.coverStyle};">
          <img src="${b.coverImage || 'https://covers.openlibrary.org/b/id/12818862-L.jpg'}" class="book-cover-real-img" alt="${b.title}" loading="lazy" decoding="async">
          <div class="book-badges-overlay">
            <span class="rarity-pill rarity-pill-epic">Open Library</span>
          </div>
        </div>
        <div class="steam-book-info">
          <h3 class="steam-book-title" title="${b.title}">${b.title}</h3>
          <p class="steam-book-author">✍ ${b.author} (${b.year})</p>
          <p class="steam-book-desc">${b.synopsis}</p>
          <div class="steam-book-meta">
            <span class="book-genre-pill">${b.genre}</span>
            <span class="book-pages-pill">~${b.lengthPages} стр.</span>
          </div>
          <div class="steam-book-actions">
            <button class="btn btn-primary btn-block btn-stream-read" style="height: 38px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700;">
              📖 Читать ретрансляцию (Manga-Scroll)
            </button>
          </div>
        </div>
      `;
      card.querySelector('.btn-stream-read')?.addEventListener('click', () => {
        window.bookRelay.relayedCatalog.unshift(b);
        window.readerEngine.openBook(b.id);
      });
      grid.appendChild(card);
    });

    this.bindTiltEffect();
  }

  // --- REBUILT GAMER & SCHOLAR PROFILE ---

  renderBookProgressCircle(pct) {
    const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
    const radius = 19;
    const circ = 2 * Math.PI * radius; // ~119.38
    const offset = circ - (circ * p) / 100;
    const isDone = p >= 100;
    const statusClass = isDone ? 'completed' : (p > 0 ? 'in-progress' : 'unstarted');

    return `
      <div class="book-progress-circle-badge ${statusClass}" title="Прочитано: ${p}%">
        <svg class="progress-ring-svg" width="46" height="46" viewBox="0 0 46 46">
          <circle class="progress-ring-bg" cx="23" cy="23" r="${radius}" />
          <circle class="progress-ring-bar" cx="23" cy="23" r="${radius}"
            style="stroke-dasharray: ${circ.toFixed(2)}; stroke-dashoffset: ${offset.toFixed(2)};" />
        </svg>
        <span class="progress-ring-text">${isDone ? '✓' : `${p}%`}</span>
      </div>
    `;
  }

  // --- HALL OF FAME & LEADERBOARD SYSTEM ---

  renderLeaderboard() {
    const podiumEl = document.getElementById('leaderboard-podium');
    const tbodyEl = document.getElementById('leaderboard-tbody');
    if (!podiumEl || !tbodyEl) return;

    // 1. Collect all users
    let users = [];
    if (window.dbEngine?.getUsers) {
      users = [...window.dbEngine.getUsers()];
    }

    // Ensure currently active user stats are up to date in the list
    const curUser = window.auth?.currentUser;
    if (curUser) {
      const idx = users.findIndex(u => u.id === curUser.id || u.username.toLowerCase() === curUser.username.toLowerCase());
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...curUser };
      } else {
        users.push(curUser);
      }
    }

    // 2. Sort users by level (primary), then xp, then gamesWon
    users.sort((a, b) => {
      const lvlA = parseInt(a.level || 1, 10);
      const lvlB = parseInt(b.level || 1, 10);
      if (lvlB !== lvlA) return lvlB - lvlA;
      const xpA = parseInt(a.xp || 0, 10);
      const xpB = parseInt(b.xp || 0, 10);
      if (xpB !== xpA) return xpB - xpA;
      const gamesA = a.stats?.gamesWon || 0;
      const gamesB = b.stats?.gamesWon || 0;
      return gamesB - gamesA;
    });

    // 3. Render Top 3 Podium
    const top3 = users.slice(0, 3);
    const renderPodiumCol = (u, rank) => {
      if (!u) return '';
      const isCur = curUser && (curUser.id === u.id || curUser.username === u.username);
      const readHrs = Math.floor((u.stats?.readTimeMinutes || 0) / 60);
      const readMins = (u.stats?.readTimeMinutes || 0) % 60;
      const timeStr = `${readHrs}ч ${readMins}м`;
      const frameClass = u.avatarFrame || 'frame-default';
      const rankBadge = rank === 1 ? '👑 ТОП 1' : (rank === 2 ? '🥈 ТОП 2' : '🥉 ТОП 3');

      return `
        <div class="podium-column rank-${rank} tilt-card clickable-user-card" onclick="window.app.viewUserProfile('${u.username}')" title="Нажмите, чтобы открыть профиль @${u.username}">
          <div class="podium-rank-badge">${rankBadge}</div>
          <div class="steam-avatar-holder ${frameClass}" style="width: 68px; height: 68px; margin: 1rem auto 0.5rem; font-size: 2.1rem; display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0;">
            ${u.avatar || '📖'}
          </div>
          <div style="font-weight: 900; font-size: 1.05rem; color: #fff; margin-bottom: 0.2rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; flex-wrap: wrap; text-align: center; line-height: 1.3; width: 100%;">
            <span>${u.displayName}</span>
            ${isCur ? '<span style="font-size: 0.65rem; background: var(--accent-cyan); color: #000; font-weight: 900; padding: 1px 5px; border-radius: 4px; display: inline-block;">ВЫ</span>' : ''}
          </div>
          <div style="font-size: 0.8rem; color: var(--accent-cyan); margin-bottom: 0.8rem; font-weight: 700; text-align: center;">
            ${u.title || u.role}
          </div>
          <div class="podium-stats-box" style="margin-top: auto; width: 100%;">
            <div style="display: flex; justify-content: space-between;">
              <span>Уровень:</span>
              <strong style="color: var(--accent-gold);">Ур. ${u.level}</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Опыт:</span>
              <span>${(u.xp || 0).toLocaleString()} XP</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Время чтения:</span>
              <span>${timeStr}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Побед в играх:</span>
              <strong style="color: var(--accent-green);">${u.stats?.gamesWon || 0}</strong>
            </div>
          </div>
        </div>
      `;
    };

    podiumEl.innerHTML = `
      ${top3[1] ? renderPodiumCol(top3[1], 2) : ''}
      ${top3[0] ? renderPodiumCol(top3[0], 1) : ''}
      ${top3[2] ? renderPodiumCol(top3[2], 3) : ''}
    `;

    // 4. Render Table Body (All users)
    tbodyEl.innerHTML = users.map((u, idx) => {
      const isCur = curUser && (curUser.id === u.id || curUser.username === u.username);
      const rankNum = idx + 1;
      const rankIcon = rankNum === 1 ? '🥇 1' : (rankNum === 2 ? '🥈 2' : (rankNum === 3 ? '🥉 3' : rankNum));
      const readHrs = Math.floor((u.stats?.readTimeMinutes || 0) / 60);
      const readMins = (u.stats?.readTimeMinutes || 0) % 60;
      const timeStr = `${readHrs}ч ${readMins}м`;
      const rowHighlight = isCur ? 'style="background: rgba(0, 240, 255, 0.08);"' : '';

      return `
        <tr ${rowHighlight} class="clickable-user-row" onclick="window.app.viewUserProfile('${u.username}')" title="Нажмите, чтобы открыть профиль @${u.username}">
          <td>
            <span style="font-weight: 900; font-size: 1.05rem; color: ${rankNum === 1 ? 'var(--accent-gold)' : rankNum === 2 ? 'var(--accent-cyan)' : rankNum === 3 ? '#cd7f32' : 'inherit'};">
              ${rankIcon}
            </span>
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.8rem;">
              <div class="steam-avatar-holder ${u.avatarFrame || 'frame-default'}" style="width: 38px; height: 38px; font-size: 1.25rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${u.avatar || '📖'}
              </div>
              <div>
                <div style="color: #fff; font-weight: 800; display: flex; align-items: center; gap: 0.4rem;">
                  ${u.displayName}
                  ${isCur ? '<span style="font-size: 0.65rem; background: var(--accent-cyan); color: #000; font-weight: 900; padding: 1px 5px; border-radius: 3px;">ВЫ</span>' : ''}
                </div>
                <div style="font-size: 0.75rem; color: var(--text-dim);">@${u.username}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-size: 0.85rem; color: var(--accent-cyan); font-weight: 600;">${u.title || u.role}</span>
          </td>
          <td>
            <strong style="color: var(--accent-gold);">Ур. ${u.level}</strong>
            <div style="font-size: 0.72rem; color: var(--text-dim);">${(u.xp || 0).toLocaleString()} XP</div>
          </td>
          <td>${timeStr}</td>
          <td>${u.stats?.speedRecordWPM || 300} сл/мин</td>
          <td><strong style="color: var(--accent-green);">${u.stats?.gamesWon || 0}</strong></td>
        </tr>
      `;
    }).join('');

    this.bindLeaderboardSearch();
    if (this.bindTiltEffect) this.bindTiltEffect();
  }

  getTitleInfo(titleNameOrId) {
    if (!titleNameOrId) return TITLES_REGISTRY.novice;
    const clean = titleNameOrId.toString().toLowerCase();
    for (const key of Object.keys(TITLES_REGISTRY)) {
      const item = TITLES_REGISTRY[key];
      if (item.id.toLowerCase() === clean || item.title.toLowerCase().includes(clean) || clean.includes(item.id.toLowerCase())) {
        return item;
      }
    }
    if (clean.includes('старейшина') || clean.includes('мысли')) return TITLES_REGISTRY.elder_thought;
    if (clean.includes('воевода') || clean.includes('стратег')) return TITLES_REGISTRY.strategy_warlord;
    if (clean.includes('создатель') || clean.includes('creator')) return TITLES_REGISTRY.creator;
    if (clean.includes('архивариус')) return TITLES_REGISTRY.archivist;
    if (clean.includes('схоласт')) return TITLES_REGISTRY.cyber_scholar;
    if (clean.includes('магистр')) return TITLES_REGISTRY.magister_mind;
    if (clean.includes('дракон')) return TITLES_REGISTRY.book_dragon;
    if (clean.includes('скорочтен')) return TITLES_REGISTRY.speed_magister;
    if (clean.includes('новичок') || clean.includes('любитель')) return TITLES_REGISTRY.novice;

    return {
      id: 'custom_title',
      title: titleNameOrId,
      rarity: 'legendary',
      rarityLabel: 'ПОЧЁТНЫЙ ТИТУЛ',
      category: 'Особое Достижение',
      lore: 'Индивидуальное звание читателя, присвоенное за особый вклад в сообщество и литературные успехи.',
      criteria: 'Получено за активную деятельность в экосистеме CyberLibris.'
    };
  }

  viewUserProfile(query) {
    if (!query) return;
    const clean = query.toString().replace('@', '').trim().toLowerCase();
    const users = window.dbEngine?.getUsers() || [];
    let target = users.find(u => u.username.toLowerCase() === clean || u.id === clean);
    if (!target) {
      target = users.find(u => u.displayName && u.displayName.toLowerCase().includes(clean));
    }
    if (!target) {
      this.showToast(`Читатель «${query}» не найден в базе`, 'info');
      return;
    }

    this.switchView('profile');
    this.renderProfile(target);
    this.showToast(`Открыт профиль читателя: ${target.displayName} (@${target.username})`, 'info');
  }

  bindProfileTitlePopover() {
    const titleTagEl = document.getElementById('profile-title-tag');
    const popover = document.getElementById('profile-title-popover');
    if (!titleTagEl || !popover) return;

    let hoverTimer = null;
    titleTagEl.onmouseenter = () => {
      clearTimeout(hoverTimer);
      popover.classList.add('active');
    };

    titleTagEl.onmouseleave = () => {
      hoverTimer = setTimeout(() => {
        if (!popover.dataset.pinned) {
          popover.classList.remove('active');
        }
      }, 250);
    };

    popover.onmouseenter = () => clearTimeout(hoverTimer);
    popover.onmouseleave = () => {
      hoverTimer = setTimeout(() => {
        if (!popover.dataset.pinned) {
          popover.classList.remove('active');
        }
      }, 250);
    };

    titleTagEl.onclick = (e) => {
      e.stopPropagation();
      const isPinned = popover.dataset.pinned === 'true';
      if (isPinned) {
        delete popover.dataset.pinned;
        popover.classList.remove('active');
      } else {
        popover.dataset.pinned = 'true';
        popover.classList.add('active');
      }
      if (popover.classList.contains('active') && window.soundEngine) {
        window.soundEngine.playClick();
      }
    };

    document.addEventListener('click', (e) => {
      if (!titleTagEl.contains(e.target) && !popover.contains(e.target)) {
        delete popover.dataset.pinned;
        popover.classList.remove('active');
      }
    });
  }

  bindLeaderboardSearch() {
    const searchInput = document.getElementById('leaderboard-user-search');
    if (!searchInput || searchInput.dataset.bound) return;
    searchInput.dataset.bound = 'true';

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      const rows = document.querySelectorAll('#leaderboard-tbody tr');
      rows.forEach(r => {
        const text = r.textContent.toLowerCase();
        r.style.display = text.includes(q) ? '' : 'none';
      });
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = e.target.value.trim();
        if (q) this.viewUserProfile(q);
      }
    });
  }

  renderProfile(targetUser = null) {
    const isOwnProfile = !targetUser || (window.auth.currentUser && targetUser.id === window.auth.currentUser.id);
    const user = isOwnProfile ? window.auth.currentUser : targetUser;
    if (!user) {
      this.openModal('modal-auth');
      return;
    }

    // Visitor banner handling
    const visitorBanner = document.getElementById('profile-visitor-banner');
    const bannerText = document.getElementById('visitor-banner-text');
    const btnEditProfile = document.getElementById('btn-open-edit-profile');
    const btnRecoverCreator = document.getElementById('btn-profile-recover-creator');
    const btnProfileLogout = document.getElementById('btn-profile-logout');

    if (visitorBanner) {
      if (!isOwnProfile) {
        visitorBanner.style.display = 'flex';
        if (bannerText) {
          bannerText.innerHTML = `Вы просматриваете публичный профиль: <strong>${user.displayName}</strong> (@${user.username}) · Ур. ${user.level}`;
        }
        if (btnEditProfile) btnEditProfile.style.display = 'none';
        if (btnRecoverCreator) btnRecoverCreator.style.display = 'none';
        if (btnProfileLogout) btnProfileLogout.style.display = 'none';
        if (window.reactiveBg) window.reactiveBg.setParticleShape(user.particleShape || 'dust');
      } else {
        visitorBanner.style.display = 'none';
        if (btnEditProfile) btnEditProfile.style.display = 'inline-flex';
        if (btnRecoverCreator) btnRecoverCreator.style.display = window.auth?.isCreator?.() ? 'inline-flex' : 'none';
        if (btnProfileLogout) btnProfileLogout.style.display = 'inline-flex';
        if (window.reactiveBg) window.reactiveBg.setParticleShape(user.particleShape || 'auto');
      }
    }

    const returnBtn = document.getElementById('btn-return-my-profile');
    if (returnBtn) {
      returnBtn.onclick = () => {
        this.renderProfile();
        this.showToast('Вы вернулись к своему профилю', 'info');
      };
    }

    const shelves = window.bookRelay.getUserShelves(user.username);

    // 1. Dynamic Profile Backdrop Theme
    const bgEl = document.getElementById('steam-profile-ambient-bg');
    if (bgEl) {
      bgEl.className = `steam-profile-ambient-bg ${user.profileBg || user.customBg || 'bg-starter'}`;
    }

    // 2. Avatar & Frame
    const wrap = document.getElementById('profile-avatar-wrap');
    if (wrap) {
      wrap.className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-default'}`;
      wrap.innerHTML = `<div class="avatar-inner" id="profile-avatar-emoji">${user.avatar || '🌱'}</div>`;
    }

    // 3. User Identity
    const dispNameEl = document.getElementById('profile-display-name');
    if (dispNameEl) dispNameEl.textContent = user.displayName || user.username;
    
    const userTagEl = document.getElementById('profile-username-tag');
    if (userTagEl) userTagEl.textContent = `@${user.username}`;

    const roleBadgeEl = document.getElementById('profile-role-badge');
    if (roleBadgeEl && window.auth.getRoleBadgeHTML) {
      roleBadgeEl.innerHTML = window.auth.getRoleBadgeHTML(user.role, user.level);
    }

    // 4. Dynamic Online Status & Real-time Presence
    this.updateProfilePresence();
    this.bindProfilePresenceControls(user);

    // 5. Steam Level & XP Progress
    const levelNumEl = document.getElementById('profile-level-num');
    if (levelNumEl) levelNumEl.textContent = user.level;

    const neededXp = user.level * 400;
    const currentXp = user.xp || 0;
    const percent = Math.min(100, Math.round((currentXp / neededXp) * 100));
    
    const xpTextEl = document.getElementById('profile-xp-text');
    if (xpTextEl) xpTextEl.textContent = `${currentXp} / ${neededXp} XP (${percent}%)`;
    
    const xpFillEl = document.getElementById('profile-xp-fill');
    if (xpFillEl) xpFillEl.style.width = `${percent}%`;

    const xpNextEl = document.getElementById('profile-xp-next-text');
    if (xpNextEl) {
      const diff = Math.max(0, neededXp - currentXp);
      xpNextEl.textContent = `+${diff} XP до ${user.level + 1} ур.`;
    }

    // 6. Highlights Row
    const lumensHighlight = document.getElementById('stat-lumens-highlight');
    if (lumensHighlight) lumensHighlight.textContent = `${user.lumens || 0} ⬡`;

    const streakValEl = document.getElementById('profile-streak-count');
    if (streakValEl) streakValEl.textContent = '3 дня подряд';
    const streakSubEl = document.getElementById('profile-streak-count-sub');
    if (streakSubEl) streakSubEl.textContent = '3 дня подряд';

    // 7. Dynamic Genre Title & Interactive Popover Justification
    const militaryCount = shelves.completed.filter(c => {
      const b = window.bookRelay.getBookById(c.id);
      return b && (b.genre.includes('Военная') || b.tags.includes('военная проза'));
    }).length;

    const scifiCount = shelves.completed.filter(c => {
      const b = window.bookRelay.getBookById(c.id);
      return b && (b.genre.includes('фантастика') || b.genre.includes('Киберпанк'));
    }).length;

    let genreRankTitle = '📖 Искатель Приключений';
    let genreJustification = 'Звание присвоено за первые шаги в познании мировой литературы.';
    let earnedBooks = shelves.completed.slice(0, 3);

    if (militaryCount >= 2) {
      genreRankTitle = '⚔️ Воевода Стратегии';
      genreJustification = `Звание «Воевода» заслужено глубоким освоением военной классики и трудов стратегии.`;
    } else if (scifiCount >= 2) {
      genreRankTitle = '🚀 Первопроходец Космоса';
      genreJustification = `Звание «Первопроходец» заслужено исследованием миров научной фантастики и киберпанка.`;
    } else {
      genreRankTitle = '📜 Старейшина Мысли';
      genreJustification = `Звание заслужено изучением бессмертных философских трактатов и классических романов.`;
    }

    const titleInfo = this.getTitleInfo(user.title || genreRankTitle);
    const titleTagEl = document.getElementById('profile-title-tag');
    if (titleTagEl) {
      titleTagEl.innerHTML = `
        <span class="rarity-pill rarity-pill-${titleInfo.rarity}">${titleInfo.title}</span>
        <span class="title-info-icon" title="Нажмите, чтобы узнать подробнее о звании">ℹ️</span>
        <div class="profile-title-popover" id="profile-title-popover">
          <div class="popover-title-header">
            <span class="popover-title-name">${titleInfo.title}</span>
            <span class="popover-title-rarity rarity-pill-${titleInfo.rarity}">${titleInfo.rarityLabel}</span>
          </div>
          <div style="font-size: 0.72rem; color: var(--accent-cyan); margin-bottom: 0.5rem; font-weight: 700;">
            Категория: ${titleInfo.category}
          </div>
          <div class="popover-title-lore">
            <strong>Почему присвоено звание:</strong><br>${titleInfo.lore}
          </div>
          <div class="popover-title-criteria">
            <strong>Критерии получения:</strong><br>${titleInfo.criteria}
          </div>
          ${isOwnProfile ? '<button type="button" class="popover-title-action-btn" onclick="window.app.switchView(\'profile-edit\')">🎨 Выбрать другое звание в Студии →</button>' : ''}
        </div>
      `;
      this.bindProfileTitlePopover();
    }

    const justTextEl = document.getElementById('profile-rank-justification-text');
    if (justTextEl) justTextEl.textContent = genreJustification;

    const rankBooksList = document.getElementById('profile-rank-books-list');
    if (rankBooksList) {
      rankBooksList.innerHTML = '';
      if (!earnedBooks.length && activeBook) {
        const chip = document.createElement('div');
        chip.className = 'rank-book-mini-chip';
        chip.innerHTML = `<img src="${activeBook.coverImage}" alt="${activeBook.title}"> <span>«${activeBook.title}»</span>`;
        rankBooksList.appendChild(chip);
      } else {
        earnedBooks.forEach(item => {
          const b = window.bookRelay.getBookById(item.id);
          if (b) {
            const chip = document.createElement('div');
            chip.className = 'rank-book-mini-chip';
            chip.innerHTML = `<img src="${b.coverImage}" alt="${b.title}"> <span>«${b.title}»</span>`;
            rankBooksList.appendChild(chip);
          }
        });
      }
    }

    // 8. Editable status motto
    const mottoTextEl = document.getElementById('profile-motto-text');
    if (mottoTextEl) {
      mottoTextEl.textContent = user.motto || 'В книгах ищу то, чего не хватает в реальности...';
    }
    const mottoBubble = document.getElementById('profile-user-status');
    if (mottoBubble) {
      if (isOwnProfile) {
        mottoBubble.title = 'Нажмите, чтобы изменить читательский девиз';
        mottoBubble.style.cursor = 'pointer';
        mottoBubble.onclick = () => {
          const next = prompt('Введите ваш статус / читательский девиз:', user.motto || '');
          if (next !== null && next.trim()) {
            user.motto = next.trim();
            window.auth.saveUser();
            if (mottoTextEl) mottoTextEl.textContent = user.motto;
            this.showToast('Девиз профиля обновлен!', 'success');
          }
        };
      } else {
        mottoBubble.title = '';
        mottoBubble.style.cursor = 'default';
        mottoBubble.onclick = null;
      }
    }

    // 9. Featured Masterpiece Showcase
    const featuredBookId = localStorage.getItem('cyberlibris_featured_book_' + user.username) || 'relay_war_and_peace';
    const featuredBook = window.bookRelay?.getBookById?.(featuredBookId) ||
                         window.bookRelay?.getBookById?.(featuredBookId.replace('relay_', '')) ||
                         window.bookRelay?.getBookById?.('relay_war_and_peace') ||
                         window.bookRelay?.getBookById?.('war_and_peace') ||
                         activeBook;

    if (featuredBook) {
      const coverImg = document.getElementById('featured-book-cover-img');
      if (coverImg) coverImg.src = featuredBook.coverImage;

      // Accurately compute progress strictly for this featuredBook
      const fBookId = featuredBook.id;
      const fShelfItem = (shelves.readingNow || []).find(b => b.id === fBookId || b.id === fBookId.replace('relay_', '') || `relay_${b.id}` === fBookId);
      const fCompleted = !fShelfItem && (shelves.completed || []).find(b => b.id === fBookId || b.id === fBookId.replace('relay_', '') || `relay_${b.id}` === fBookId);
      const fSaved = window.readerEngine?.getSavedProgress?.(fBookId) ||
                     window.readerEngine?.getSavedProgress?.(fBookId.replace('relay_', ''));

      let featPct = 38;
      let featCh = 3;
      let isFeatDone = false;

      if (fShelfItem) {
        featPct = typeof fShelfItem.progressPercent === 'number' ? fShelfItem.progressPercent : 38;
        featCh = typeof fShelfItem.chapterIdx === 'number' ? fShelfItem.chapterIdx + 1 : 3;
        if (featPct >= 100 && fBookId.includes('war_and_peace')) {
          featPct = 38;
          featCh = 3;
          fShelfItem.progressPercent = 38;
          fShelfItem.chapterIdx = 2;
        }
        isFeatDone = featPct >= 100;
      } else if (fCompleted) {
        featPct = 100;
        featCh = 28;
        isFeatDone = true;
      } else if (fSaved && typeof fSaved.progressPercent === 'number') {
        featPct = fSaved.progressPercent;
        featCh = (typeof fSaved.currentChapter === 'number') ? fSaved.currentChapter + 1 : 1;
        isFeatDone = featPct >= 100;
      } else if (fBookId.includes('war_and_peace')) {
        featPct = 38;
        featCh = 3;
        isFeatDone = false;
      }

      const coverWrap = document.getElementById('featured-book-cover-wrap');
      if (coverWrap) {
        coverWrap.querySelector('.featured-circle-badge')?.remove();
        const p = Math.max(0, Math.min(100, Math.round(featPct || 0)));
        const radius = 23;
        const circ = 2 * Math.PI * radius;
        const offset = circ - (circ * p) / 100;
        const circleDiv = document.createElement('div');
        circleDiv.className = `featured-circle-badge ${isFeatDone ? 'completed' : ''}`;
        circleDiv.title = isFeatDone ? 'Книга полностью завершена' : `Освоение книги: ${p}%`;
        circleDiv.innerHTML = `
          <svg class="progress-ring-svg" width="54" height="54" viewBox="0 0 54 54">
            <circle class="progress-ring-bg" cx="27" cy="27" r="${radius}" />
            <circle class="progress-ring-bar" cx="27" cy="27" r="${radius}"
              style="stroke-dasharray: ${circ.toFixed(2)}; stroke-dashoffset: ${offset.toFixed(2)};" />
          </svg>
          <span class="progress-ring-text">${isFeatDone ? '✓' : `${p}%`}</span>
        `;
        coverWrap.appendChild(circleDiv);
      }

      const titleEl = document.getElementById('featured-book-title');
      if (titleEl) titleEl.textContent = featuredBook.title;

      const authorEl = document.getElementById('featured-book-author');
      if (authorEl) authorEl.textContent = featuredBook.author;

      const totalChapters = featuredBook.chapters?.length || (featuredBook.id.includes('war_and_peace') ? 28 : 12);
      const statChapters = document.getElementById('featured-stat-chapters');
      if (statChapters) statChapters.textContent = `Глава ${featCh} из ${totalChapters}`;

      const statPercent = document.getElementById('featured-stat-percent');
      if (statPercent) {
        statPercent.textContent = isFeatDone ? 'Прочитано (100%)' : `${featPct}% книги`;
        statPercent.style.color = isFeatDone ? 'var(--accent-green)' : 'var(--accent-cyan)';
      }

      const statTime = document.getElementById('featured-stat-time');
      if (statTime) statTime.textContent = `${Math.max(15, (user.stats?.readTimeMinutes || 45))} мин`;

      const btnContinue = document.getElementById('btn-featured-continue-read');
      if (btnContinue) {
        btnContinue.textContent = isFeatDone ? 'Читать снова' : 'Продолжить чтение';
        btnContinue.onclick = () => {
          const targetCh = isFeatDone ? 0 : Math.max(0, featCh - 1);
          window.readerEngine.openBook(featuredBook.id, targetCh);
          this.switchView('reader');
        };
      }
    }

    // 10. Rare Achievements Showcase
    const rareContainer = document.getElementById('profile-rare-achievements-grid');
    if (rareContainer) {
      const rareBadges = [
        { id: 'creator', name: '👑 Создатель Реальности', desc: 'Обладатель высшего статуса системы CyberLibris', pct: '1.2%', xp: '+500 XP' },
        { id: 'master', name: '⚡ Пожиратель Фолиантов', desc: 'Прочтите более 1000 страниц классических текстов', pct: '3.8%', xp: '+250 XP' },
        { id: 'speedread', name: '⚡ Скорочтец Высшей Лиги', desc: 'Достигните скорости чтения более 500 слов в минуту', pct: '2.9%', xp: '+220 XP' },
        { id: 'critic', name: '✍️ Истинный Критик', desc: 'Напишите подробные рецензии к 3 и более книгам', pct: '5.1%', xp: '+200 XP' }
      ];
      rareContainer.innerHTML = rareBadges.map(ach => `
        <div class="rare-achievement-card tilt-card">
          <div class="rare-ach-icon-wrap">
            <span class="rare-ach-icon">${ach.name.split(' ')[0]}</span>
          </div>
          <div class="rare-ach-title">${ach.name.substring(2)}</div>
          <div class="rare-ach-desc">${ach.desc}</div>
          <div class="rare-ach-footer">
            <span class="rare-ach-pct">Редкость: ${ach.pct}</span>
            <span class="rare-ach-xp">${ach.xp}</span>
          </div>
        </div>
      `).join('');
    }

    // 11. Bento Stats Grid 2.0
    const statYearly = document.getElementById('stat-yearly-goal');
    if (statYearly) statYearly.textContent = `${shelves.completedThisYear} / ${shelves.yearlyGoal} книг`;

    const statUseful = document.getElementById('stat-useful-books');
    if (statUseful) statUseful.textContent = `${shelves.usefulBooksCount} книг`;

    const statPages = document.getElementById('stat-pages-read');
    if (statPages) statPages.textContent = `${(shelves.completedThisYear * 450 + 240).toLocaleString()} стр.`;

    const statReviews = document.getElementById('stat-reviews-count');
    if (statReviews) statReviews.textContent = '4 рецензии';

    const statLumens = document.getElementById('stat-lumens');
    if (statLumens) statLumens.textContent = `${user.lumens || 0} ⬡`;

    // 12. Render Weekly Reading Activity Heatmap
    this.renderWeeklyHeatmap(user);

    // 12b. Render Literary Competence Matrix (Rank + Fanning Card Deck)
    this.renderCompetenceMatrix(user, shelves);

    // 13. Shelf Tab Counts
    if (!shelves.favorites || shelves.favorites.length === 0) {
      shelves.favorites = [
        "relay_master_margarita",
        "relay_art_of_war",
        "relay_captains_daughter",
        "relay_eugene_onegin"
      ];
    }
    if (!shelves.completed || shelves.completed.length === 0) {
      shelves.completed = [
        { id: "relay_art_of_war", completedDate: "14.01.2026", rating: 5 },
        { id: "relay_master_margarita", completedDate: "02.02.2026", rating: 5 },
        { id: "relay_sherlock_holmes", completedDate: "18.02.2026", rating: 5 }
      ];
    }

    const countReading = document.getElementById('profile-shelf-count-reading');
    if (countReading) countReading.textContent = shelves.readingNow.length;

    const countFav = document.getElementById('profile-shelf-count-fav');
    if (countFav) countFav.textContent = shelves.favorites.length;

    const countCompleted = document.getElementById('profile-shelf-count-completed');
    if (countCompleted) countCompleted.textContent = shelves.completed.length;

    const countReviews = document.getElementById('profile-shelf-count-reviews');
    if (countReviews) countReviews.textContent = '2';

    // 14. Shelves Tab Switching
    document.querySelectorAll('.profile-shelf-tab').forEach(tab => {
      tab.onclick = () => {
        document.querySelectorAll('.profile-shelf-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.profileTab;
        document.querySelectorAll('.profile-shelf-content').forEach(c => {
          const isTarget = (c.id === `tab-content-${target}`);
          c.classList.toggle('active', isTarget);
          c.style.display = isTarget ? 'block' : 'none';
        });
        if (window.soundEngine) window.soundEngine.playClick();
      };
    });

    // Shelf 1: Reading Now
    const readingNowGrid = document.getElementById('profile-shelf-reading-now');
    if (readingNowGrid) {
      readingNowGrid.innerHTML = '';
      if (!shelves.readingNow.length) {
        readingNowGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 1.5rem; text-align: center;">Нет активных книг. Выберите книгу на витрине или продолжите любимый шедевр!</div>';
      } else {
        shelves.readingNow.forEach(item => {
          if (item.id.includes('war_and_peace')) {
            item.progressPercent = 38;
            item.chapterIdx = 2;
          }
          const b = window.bookRelay.getBookById(item.id);
          if (b) {
            const pct = item.progressPercent || 0;
            const card = document.createElement('div');
            card.className = 'shelf-book-card';
            card.innerHTML = `
              <div class="shelf-book-cover-wrap">
                <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}" loading="lazy" decoding="async">
                ${this.renderBookProgressCircle(pct)}
              </div>
              <div class="shelf-book-title">${b.title}</div>
              <div style="font-size:0.75rem; color:var(--text-dim); display:flex; justify-content:space-between; align-items:center; margin-top: 0.35rem;">
                <span>Глава: <strong>${(item.chapterIdx || 0) + 1}</strong></span>
                <span style="color:var(--accent-cyan); font-weight:700;">${pct}%</span>
              </div>
              <button class="btn btn-primary btn-sm btn-continue-reading" data-book-id="${b.id}" style="margin-top:0.4rem;">
                Продолжить →
              </button>
            `;
            card.querySelector('.btn-continue-reading')?.addEventListener('click', () => {
              window.readerEngine.openBook(b.id, typeof item.chapterIdx === 'number' ? item.chapterIdx : null, 'manga');
              this.switchView('reader');
            });
            readingNowGrid.appendChild(card);
          }
        });
      }
    }

    // Shelf 2: Favorites
    const favGrid = document.getElementById('profile-shelf-favorites');
    if (favGrid) {
      favGrid.innerHTML = '';
      if (!shelves.favorites.length) {
        favGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 1.5rem; text-align: center;">В избранном пока пусто. Добавьте понравившиеся книги кнопкой «В избранное»!</div>';
      } else {
        shelves.favorites.forEach(bookId => {
          const b = window.bookRelay.getBookById(bookId);
          if (b) {
            const saved = window.readerEngine?.getSavedProgress?.(bookId);
            const pct = saved ? (saved.progressPercent || 0) : 0;
            const card = document.createElement('div');
            card.className = 'shelf-book-card';
            card.innerHTML = `
              <div class="shelf-book-cover-wrap">
                <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}" loading="lazy" decoding="async">
                ${this.renderBookProgressCircle(pct)}
              </div>
              <div class="shelf-book-title">${b.title}</div>
              <div style="font-size:0.75rem; color:var(--accent-cyan); display:flex; justify-content:space-between; align-items:center;">
                <span>${b.author}</span>
                <span style="color: ${pct > 0 ? '#00f0ff' : '#8e9bb0'}; font-weight: 700;">${pct > 0 ? `${pct}%` : '0%'}</span>
              </div>
              <div style="display:flex; gap:0.4rem; margin-top:auto; height:34px;">
                <button class="btn btn-primary btn-sm btn-fav-read" data-book-id="${b.id}" style="flex:1;">
                  Читать →
                </button>
                <button class="btn btn-secondary btn-sm btn-fav-info" data-book-id="${b.id}">
                  Инфо
                </button>
              </div>
            `;
            card.querySelector('.btn-fav-read')?.addEventListener('click', () => {
              window.readerEngine.openBook(b.id, 0);
              this.switchView('reader');
            });
            card.querySelector('.btn-fav-info')?.addEventListener('click', () => {
              this.openBookDetails(b.id);
            });
            favGrid.appendChild(card);
          }
        });
      }
    }

    // Shelf 3: Completed
    const compGrid = document.getElementById('profile-shelf-completed');
    if (compGrid) {
      compGrid.innerHTML = '';
      if (!shelves.completed.length) {
        compGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem; padding: 1.5rem; text-align: center;">Пока нет полностью завершенных книг. Дочитайте все главы до конца!</div>';
      } else {
        shelves.completed.forEach(item => {
          const b = window.bookRelay.getBookById(item.id);
          if (b) {
            const card = document.createElement('div');
            card.className = 'shelf-book-card';
            card.innerHTML = `
              <div class="shelf-book-cover-wrap">
                <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}" loading="lazy" decoding="async">
                ${this.renderBookProgressCircle(100)}
              </div>
              <div class="shelf-book-title">${b.title}</div>
              <div style="font-size:0.75rem; color:var(--accent-green); font-weight: 700;">✓ Завершено (${item.completedDate})</div>
              <button class="btn btn-outline btn-sm btn-re-read" data-book-id="${b.id}" style="margin-top:auto; height:34px;">
                Читать снова ↻
              </button>
            `;
            card.querySelector('.btn-re-read')?.addEventListener('click', () => {
              window.readerEngine.openBook(b.id, 0);
              this.switchView('reader');
            });
            compGrid.appendChild(card);
          }
        });
      }
    }

    // Shelf 4: Reviews Showcase
    const reviewsList = document.getElementById('profile-reviews-list');
    if (reviewsList) {
      reviewsList.innerHTML = `
        <div class="steam-review-card" style="margin-bottom: 1rem;">
          <div class="steam-rev-header">
            <div class="steam-rev-badge">👍 РЕКОМЕНДУЮ (ОБЗОР ЧИТАТЕЛЯ)</div>
            <div class="steam-rev-time">В книге: 4 ч. 20 мин.</div>
          </div>
          <div class="steam-rev-book-title">
            Книга: <strong style="color: #66c0f4;">«Война и мир» (Лев Толстой)</strong>
          </div>
          <div class="steam-rev-text">
            Потрясающее монументальное произведение. Батальные сцены под Аустерлицем и Бородино читаются на одном дыхании, а психологическая глубина Пьера Безухова и Андрея Болконского актуальна и сегодня. Всем рекомендую!
          </div>
          <div class="steam-rev-footer">
            <span>Опубликовано: 2026 г.</span>
            <div class="steam-rev-helpful-btns">
              <button class="steam-rev-help-btn">Полезно (24)</button>
              <button class="steam-rev-help-btn">Наградить</button>
            </div>
          </div>
        </div>
        <div class="steam-review-card">
          <div class="steam-rev-header">
            <div class="steam-rev-badge">РЕКОМЕНДУЮ (ОБЗОР ЧИТАТЕЛЯ)</div>
            <div class="steam-rev-time">В книге: 2 ч. 15 мин.</div>
          </div>
          <div class="steam-rev-book-title">
            Книга: <strong style="color: #66c0f4;">«Дракула» (Брэм Стокер)</strong>
          </div>
          <div class="steam-rev-text">
            Невероятно густая готическая атмосфера, эпистолярный формат дневников и писем держит в напряжении с первой страницы в замке графа. Читать в темное время суток с эмбиентом дождя — абсолютный кайф.
          </div>
          <div class="steam-rev-footer">
            <span>Опубликовано: 2026 г.</span>
            <div class="steam-rev-helpful-btns">
              <button class="steam-rev-help-btn">Полезно (19)</button>
              <button class="steam-rev-help-btn">Наградить</button>
            </div>
          </div>
        </div>
      `;
    }

    // 15. Badges Showcase with Filter Pills
    const badgesGrid = document.getElementById('profile-badges-grid');
    if (badgesGrid) {
      badgesGrid.innerHTML = '';
      const allBadges = window.dbEngine.getBadges();
      let unlockedCount = 0;

      allBadges.forEach((b) => {
        const has = user.badges?.includes(b.id);
        if (has) unlockedCount++;
        const el = document.createElement('div');
        el.className = `profile-badge-card ${has ? 'unlocked' : 'locked'}`;
        const auraColor = has ? (b.color || '#00f0ff') : 'rgba(255, 255, 255, 0.2)';
        el.innerHTML = `
          <div class="profile-badge-icon-wrapper" style="box-shadow: 0 0 24px ${has ? auraColor + '40' : 'transparent'}; border-color: ${has ? auraColor + '60' : 'rgba(255,255,255,0.12)'};">
            <div class="profile-badge-icon" style="filter: drop-shadow(0 0 16px ${has ? auraColor + '90' : 'rgba(0,0,0,0.6)'});">${b.icon}</div>
          </div>
          <div class="profile-badge-name">${b.name}</div>
          <div class="profile-badge-desc">${b.description}</div>
          <div class="profile-badge-status">${has ? '✅ ПОЛУЧЕНО' : '🔒 В ПРОЦЕССЕ'}</div>
        `;
        badgesGrid.appendChild(el);
      });

      // Update badge counts
      const countAllB = document.getElementById('badge-count-all');
      if (countAllB) countAllB.textContent = allBadges.length;
      const countUnlockedB = document.getElementById('badge-count-unlocked');
      if (countUnlockedB) countUnlockedB.textContent = unlockedCount;
      const countLockedB = document.getElementById('badge-count-locked');
      if (countLockedB) countLockedB.textContent = allBadges.length - unlockedCount;

      // Filter pills listeners
      document.querySelectorAll('.badge-pill-btn').forEach(pill => {
        pill.onclick = () => {
          document.querySelectorAll('.badge-pill-btn').forEach(p => p.classList.remove('active'));
          pill.classList.add('active');
          const filter = pill.dataset.badgeFilter;
          badgesGrid.querySelectorAll('.profile-badge-card').forEach(card => {
            if (filter === 'all') card.style.display = 'flex';
            else if (filter === 'unlocked') card.style.display = card.classList.contains('unlocked') ? 'flex' : 'none';
            else if (filter === 'locked') card.style.display = card.classList.contains('locked') ? 'flex' : 'none';
          });
          if (window.soundEngine) window.soundEngine.playClick();
        };
      });
    }

    this.bindTiltEffect();
  }

  // --- LITERARY COMPETENCE MATRIX: RANK INSIGNIA & FANNING CARD DECK ---

  renderCompetenceMatrix(user, shelves) {
    const rankIcon = document.getElementById('profile-rank-icon');
    const rankLevelPill = document.getElementById('profile-rank-level-pill');
    const rankTitle = document.getElementById('profile-rank-title');
    const rankDesc = document.getElementById('profile-rank-desc');
    const rankBooksCount = document.getElementById('profile-rank-books-count');
    const rankSpeedPill = document.getElementById('profile-rank-speed-pill');
    const badgeRarity = document.getElementById('profile-competence-badge');
    const deckContainer = document.getElementById('profile-fanning-deck');

    const completedList = (shelves && shelves.completed) ? shelves.completed : [];
    // Collect all unique books actually completed or read (>50%) by the user
    const readBookIds = new Set(completedList.map(item => item.id));

    if (user && user.readingProgress) {
      Object.keys(user.readingProgress).forEach(bid => {
        if ((user.readingProgress[bid]?.progressPercent || 0) >= 40) {
          readBookIds.add(bid);
        }
      });
    }

    const books = Array.from(readBookIds)
      .map(id => window.bookRelay?.getBookById?.(id))
      .filter(Boolean);

    const count = books.length;
    let rankName = user?.title || 'Новичок Слова';
    let icon = '📖';
    let badgeText = 'РАНГ: C';
    let desc = 'Начало литературного пути. Читайте классику в каталоге, чтобы открыть высшие ранги.';

    if (count >= 10 || (user && user.level >= 30)) {
      rankName = user?.title || 'Создатель Системы [CREATOR]';
      icon = '👑';
      badgeText = 'ЭРУДИЦИЯ: РАНГ S+';
      desc = `Высшее литературное звание присуждено за освоение шедевров из раскрывающейся колоды справа.`;
    } else if (count >= 5) {
      rankName = 'Верховный Архивариус';
      icon = '⚜️';
      badgeText = 'ЭРУДИЦИЯ: РАНГ S';
      desc = `Присуждено за глубокое изучение ${count} фундаментальных книг мировой литературы.`;
    } else if (count >= 3) {
      rankName = 'Магистр Мысли';
      icon = '📜';
      badgeText = 'ЭРУДИЦИЯ: РАНГ A';
      desc = `Звание заслужено внимательным прочтением ${count} ключевых классических произведений.`;
    } else if (count >= 1) {
      rankName = 'Хранитель Знаний';
      icon = '🕯️';
      badgeText = 'ЭРУДИЦИЯ: РАНГ B';
      desc = `Первая ступень мастерства открыта прочтением ${count} шедевра из личной библиотеки.`;
    }

    if (rankIcon) rankIcon.textContent = icon;
    if (rankLevelPill) rankLevelPill.textContent = `LVL ${user?.level || 1}`;
    if (rankTitle) rankTitle.textContent = rankName;
    if (rankDesc) rankDesc.textContent = desc;
    if (rankBooksCount) rankBooksCount.textContent = `📚 В колоде звания: ${count} ${count === 1 ? 'книга' : (count >= 2 && count <= 4) ? 'книги' : 'книг'}`;
    if (rankSpeedPill) rankSpeedPill.textContent = `⚡ Скорость: ${user?.stats?.speedRecordWPM || 480} WPM`;
    if (badgeRarity) badgeRarity.textContent = badgeText;

    // Render the interactive Fanning Card Deck
    if (deckContainer) {
      deckContainer.innerHTML = '';
      if (books.length === 0) {
        deckContainer.innerHTML = `
          <div class="deck-empty-placeholder">
            <span style="font-size: 1.8rem; margin-bottom: 0.3rem;">📭</span>
            <span style="font-weight: 700; color: #fff;">Колода пока пуста</span>
            <span style="font-size: 0.72rem; color: #8e9bb0; margin-top: 0.2rem;">Прочтите книгу в Каталоге, чтобы запечатать ее в колоду звания!</span>
          </div>
        `;
      } else {
        const displayBooks = books.slice(0, 5);
        displayBooks.forEach((b, idx) => {
          const card = document.createElement('div');
          card.className = 'deck-book-card';
          const total = displayBooks.length;
          const center = (total - 1) / 2;
          const baseOffset = (idx - center) * 16;
          const baseRotate = (idx - center) * 5;
          card.style.transform = `translateX(${baseOffset}px) rotate(${baseRotate}deg)`;
          card.style.zIndex = idx + 10;
          card.title = `«${b.title}» (${b.author}) — Нажмите, чтобы открыть досье`;

          card.innerHTML = `
            <img src="${b.coverImage}" alt="${b.title}" loading="lazy" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
            <div class="deck-card-overlay">
              <span class="deck-card-stamp">✓ ИЗУЧЕНО</span>
              <div class="deck-card-title">${b.title}</div>
              <div class="deck-card-author">${b.author}</div>
            </div>
          `;

          card.addEventListener('click', (e) => {
            e.stopPropagation();
            this.openBookDetails(b.id);
            if (window.soundEngine) window.soundEngine.playCardFlip();
          });

          deckContainer.appendChild(card);
        });

        deckContainer.onclick = () => {
          deckContainer.classList.toggle('fanned');
          if (window.soundEngine) window.soundEngine.playCardFlip();
        };
      }
    }
  }

  // --- DYNAMIC ACTIVITY & PRESENCE ENGINE ---

  getCurrentUserActivity() {
    const user = window.auth?.currentUser;
    if (!user) return { status: 'offline', text: 'Не в сети', dotClass: 'dot-offline' };

    const username = user.username;
    const presenceState = localStorage.getItem('cyberlibris_presence_state_' + username) || 'online';
    const customStatus = localStorage.getItem('cyberlibris_custom_status_' + username) || '';

    if (presenceState === 'invisible') {
      return { status: 'invisible', text: 'Невидимка (Офлайн)', dotClass: 'dot-offline' };
    }
    if (presenceState === 'away') {
      return { status: 'away', text: customStatus ? `Отошёл • «${customStatus}»` : 'Отошёл (Не у терминала)', dotClass: 'dot-away' };
    }
    if (presenceState === 'dnd') {
      return { status: 'dnd', text: customStatus ? `Не беспокоить • «${customStatus}»` : 'Не беспокоить • В глубоком фокусе', dotClass: 'dot-dnd' };
    }

    // Custom status override when online
    if (customStatus) {
      return { status: 'online', text: `В сети • «${customStatus}»`, dotClass: 'dot-online' };
    }

    // Dynamic presence based on actual real-time site view
    if (this.currentView === 'reader' && window.readerEngine?.currentBook) {
      const bTitle = window.readerEngine.currentBook.title || 'Книгу';
      const chNum = (window.readerEngine.currentChapterIdx || 0) + 1;
      return { status: 'reading', text: `В сети • Читает «${bTitle}» (Гл. ${chNum})`, dotClass: 'dot-reading' };
    }

    if (this.currentView === 'games' && window.miniGames) {
      const gName = window.miniGames.gameNames?.[window.miniGames.currentGame] || 'Аркаду';
      return { status: 'gaming', text: `В сети • В игре: «${gName}»`, dotClass: 'dot-gaming' };
    }

    if (this.currentView === 'leaderboard') {
      return { status: 'online', text: 'В сети • Просматривает Зал Славы', dotClass: 'dot-online' };
    }

    if (this.currentView === 'community') {
      return { status: 'online', text: 'В сети • Изучает Кибер-Эфир и Новости', dotClass: 'dot-online' };
    }

    if (this.currentView === 'shop') {
      return { status: 'online', text: 'В сети • В Кибер-Гардеробе', dotClass: 'dot-online' };
    }

    if (this.currentView === 'admin') {
      return { status: 'online', text: 'В сети • В панели управления Хабом', dotClass: 'dot-online' };
    }

    if (this.currentView === 'library' || this.currentView === 'steam-library') {
      return { status: 'online', text: 'В сети • Изучает каталог произведений', dotClass: 'dot-online' };
    }

    return { status: 'online', text: 'В сети • В профиле читателя', dotClass: 'dot-online' };
  }

  updateProfilePresence() {
    const act = this.getCurrentUserActivity();
    const statusOnlineEl = document.getElementById('profile-status-online');
    if (statusOnlineEl) {
      statusOnlineEl.textContent = act.text;
    }
    const dotEl = document.getElementById('profile-online-pulse-dot');
    if (dotEl) {
      dotEl.className = `online-pulse-dot ${act.dotClass || 'dot-online'}`;
    }
  }

  bindProfilePresenceControls(user) {
    const badge = document.getElementById('profile-online-badge');
    const popover = document.getElementById('profile-presence-popover');
    if (!badge || !popover) return;

    badge.onclick = (e) => {
      e.stopPropagation();
      const isClosed = popover.style.display === 'none' || !popover.style.display;
      popover.style.display = isClosed ? 'block' : 'none';
      if (isClosed && window.soundEngine) window.soundEngine.playClick();
    };

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (popover && !popover.contains(e.target) && !badge.contains(e.target)) {
        popover.style.display = 'none';
      }
    });

    // Populate active presence state
    const currentPresence = localStorage.getItem('cyberlibris_presence_state_' + user.username) || 'online';
    const currentCustomText = localStorage.getItem('cyberlibris_custom_status_' + user.username) || '';

    popover.querySelectorAll('.presence-opt-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.presence === currentPresence);
      btn.onclick = (e) => {
        e.stopPropagation();
        const pState = btn.dataset.presence;
        localStorage.setItem('cyberlibris_presence_state_' + user.username, pState);
        popover.querySelectorAll('.presence-opt-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateProfilePresence();
        this.showToast(`Сетевой статус: ${btn.querySelector('.presence-opt-title')?.textContent || pState}`, 'success');
        if (window.soundEngine) window.soundEngine.playClick();
        setTimeout(() => { popover.style.display = 'none'; }, 400);
      };
    });

    const customInput = document.getElementById('input-custom-presence-text');
    if (customInput) customInput.value = currentCustomText;

    const btnSaveCustom = document.getElementById('btn-save-custom-presence');
    if (btnSaveCustom && customInput) {
      btnSaveCustom.onclick = (e) => {
        e.stopPropagation();
        const val = customInput.value.trim();
        localStorage.setItem('cyberlibris_custom_status_' + user.username, val);
        localStorage.setItem('cyberlibris_presence_state_' + user.username, 'online');
        popover.querySelectorAll('.presence-opt-btn').forEach(b => b.classList.toggle('active', b.dataset.presence === 'online'));
        this.updateProfilePresence();
        this.showToast(val ? `Статус установлен: «${val}»` : 'Статус обновлен!', 'success');
        if (window.soundEngine) window.soundEngine.playClick();
        popover.style.display = 'none';
      };
      customInput.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          btnSaveCustom.click();
        }
      };
    }

    const btnReset = document.getElementById('btn-reset-custom-presence');
    if (btnReset) {
      btnReset.onclick = (e) => {
        e.stopPropagation();
        localStorage.removeItem('cyberlibris_custom_status_' + user.username);
        localStorage.setItem('cyberlibris_presence_state_' + user.username, 'online');
        if (customInput) customInput.value = '';
        popover.querySelectorAll('.presence-opt-btn').forEach(b => b.classList.toggle('active', b.dataset.presence === 'online'));
        this.updateProfilePresence();
        this.showToast('Включен автоматический трекинг активности!', 'info');
        if (window.soundEngine) window.soundEngine.playClick();
        popover.style.display = 'none';
      };
    }
  }

  // --- EDIT PROFILE & STANDALONE STUDIO ENGINE ---

  bindEditProfileModal() {
    const btnOpen = document.getElementById('btn-open-edit-profile');
    if (btnOpen) {
      btnOpen.addEventListener('click', () => {
        const user = window.auth.currentUser;
        if (!user) { this.openModal('modal-auth'); return; }
        this.switchView('profile-edit');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    const form = document.getElementById('form-edit-profile');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = window.auth.currentUser;
        if (!user) return;

        const newName = document.getElementById('edit-display-name')?.value.trim();
        const newMotto = document.getElementById('edit-profile-motto')?.value.trim();
        const newAvatar = form.querySelector('input[name="edit-avatar"]:checked')?.value;
        const newFrame = form.querySelector('input[name="edit-avatar-frame"]:checked')?.value;
        const newBg = form.querySelector('input[name="edit-profile-bg"]:checked')?.value;
        const newParticleShape = form.querySelector('input[name="edit-particle-shape"]:checked')?.value;

        if (newName) user.displayName = newName;
        if (newMotto !== undefined) user.motto = newMotto;
        if (newAvatar) user.avatar = newAvatar;
        if (newFrame) user.avatarFrame = newFrame;
        if (newBg) user.profileBg = newBg;
        if (newParticleShape) {
          user.particleShape = newParticleShape;
          if (window.reactiveBg) window.reactiveBg.setParticleShape(newParticleShape);
        }

        window.auth.saveUser();
        window.auth.syncUserToUI();
        this.closeAllModals();
        this.renderProfile();
        this.showToast('Профиль успешно обновлен и сохранен', 'success');
        if (window.soundEngine?.playCorrect) window.soundEngine.playCorrect();
      });
    }
  }

  bindProfileStudio() {
    if (this.studioEventsBound) return;
    this.studioEventsBound = true;

    // 1. Navigation / Action Buttons
    document.getElementById('btn-back-to-profile-from-studio')?.addEventListener('click', () => this.cancelProfileStudio());
    document.getElementById('btn-cancel-profile-studio')?.addEventListener('click', () => this.cancelProfileStudio());
    document.getElementById('btn-cancel-profile-studio-bottom')?.addEventListener('click', () => this.cancelProfileStudio());

    document.getElementById('btn-save-profile-studio')?.addEventListener('click', () => this.saveProfileStudio());
    document.getElementById('btn-save-profile-studio-bottom')?.addEventListener('click', () => this.saveProfileStudio());

    // 2. Real-time Name Input
    const nameInput = document.getElementById('studio-input-name');
    nameInput?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const user = window.auth?.currentUser;
      const previewName = document.getElementById('preview-studio-display-name');
      if (previewName) {
        previewName.textContent = val || user?.username || 'Читатель';
      }
    });

    // 3. Real-time Motto Input & Quote Preset Chips
    const mottoInput = document.getElementById('studio-input-motto');
    mottoInput?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      const previewMotto = document.getElementById('preview-studio-motto');
      if (previewMotto) {
        previewMotto.textContent = val ? (val.startsWith('«') ? val : `«${val}»`) : '«В книгах ищу то, чего не хватает в реальности...»';
      }
    });

    document.querySelectorAll('#studio-motto-presets .studio-preset-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const quote = e.currentTarget.dataset.quote || '';
        if (mottoInput) {
          mottoInput.value = quote.replace(/^«|»$/g, '');
          mottoInput.dispatchEvent(new Event('input'));
        }
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 4. Honorific Title Selector
    document.getElementById('studio-select-title')?.addEventListener('change', (e) => {
      const val = e.target.value;
      const pill = document.getElementById('preview-studio-role-pill');
      if (pill) pill.textContent = val;
      if (window.soundEngine) window.soundEngine.playClick();
    });

    // 5. Avatar Glyph Grid
    document.querySelectorAll('#studio-avatars-grid .studio-avatar-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('#studio-avatars-grid .studio-avatar-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const avatar = e.currentTarget.dataset.avatar;
        this.studioSelectedAvatar = avatar;
        const glyph = document.getElementById('preview-studio-avatar-glyph');
        if (glyph) glyph.textContent = avatar;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 6. Neon Avatar Frame Options
    document.querySelectorAll('#studio-frames-grid .studio-opt-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('#studio-frames-grid .studio-opt-card').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const frame = e.currentTarget.dataset.frame;
        this.studioSelectedFrame = frame;
        const wrap = document.getElementById('preview-studio-avatar-wrap');
        if (wrap) wrap.className = `avatar-frame-wrap preview-avatar-large ${frame}`;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 7. Backdrop Swatches (Steam Themes)
    document.querySelectorAll('#studio-themes-grid .studio-opt-card').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('#studio-themes-grid .studio-opt-card').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const bg = e.currentTarget.dataset.bg;
        this.studioSelectedBg = bg;
        const ambient = document.getElementById('preview-studio-ambient-bg');
        if (ambient) ambient.className = `steam-profile-ambient-bg ${bg}`;
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 8. Featured Masterpiece Selection
    document.querySelectorAll('#studio-featured-books-grid .studio-book-pick-btn').forEach(card => {
      card.addEventListener('click', (e) => {
        document.querySelectorAll('#studio-featured-books-grid .studio-book-pick-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const bookId = e.currentTarget.dataset.bookId;
        this.studioSelectedBookId = bookId;
        this.updateStudioBookPreview(bookId);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // 9. Particle Shapes Chips
    document.querySelectorAll('#studio-particles-grid .studio-particle-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        document.querySelectorAll('#studio-particles-grid .studio-particle-chip').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const shape = e.currentTarget.dataset.shape;
        this.studioSelectedParticleShape = shape;
        window.reactiveBg?.setParticleShape?.(shape);
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });
  }

  renderProfileEditor() {
    const user = window.auth.currentUser;
    if (!user) {
      this.openModal('modal-auth');
      return;
    }

    // Initialize state from current user data
    this.studioSelectedAvatar = user.avatar || '👑';
    this.studioSelectedFrame = user.avatarFrame || 'frame-gold';
    this.studioSelectedBg = user.profileBg || 'bg-steam';
    this.studioSelectedParticleShape = user.particleShape || 'auto';
    this.studioSelectedBookId = localStorage.getItem('cyberlibris_featured_book_' + user.username) || 'relay_war_and_peace';

    // 1. Text Inputs
    const nameInput = document.getElementById('studio-input-name');
    if (nameInput) nameInput.value = user.displayName || user.username;

    const mottoInput = document.getElementById('studio-input-motto');
    if (mottoInput) mottoInput.value = user.motto || '';

    this.studioSelectedTitle = user.title || '👑 Создатель Системы [CREATOR]';
    const titleSelect = document.getElementById('studio-select-title');
    if (titleSelect) {
      titleSelect.value = this.studioSelectedTitle;
    }

    // Render Customizable Titles Grid
    const titlesGrid = document.getElementById('studio-titles-grid');
    if (titlesGrid) {
      titlesGrid.innerHTML = '';
      Object.values(TITLES_REGISTRY).forEach(t => {
        const card = document.createElement('div');
        const isActive = (this.studioSelectedTitle === t.title || this.studioSelectedTitle === t.id);
        card.className = `studio-title-card ${isActive ? 'active' : ''}`;
        card.dataset.title = t.title;
        card.innerHTML = `
          <div class="studio-title-card-top">
            <div class="studio-title-name">${t.title}</div>
            <div class="studio-title-rarity rarity-pill-${t.rarity}">${t.rarityLabel}</div>
          </div>
          <div style="font-size: 0.7rem; color: var(--accent-cyan); margin-bottom: 0.3rem; font-weight: 700;">${t.category}</div>
          <div class="studio-title-desc">${t.lore}</div>
        `;

        card.addEventListener('click', () => {
          document.querySelectorAll('#studio-titles-grid .studio-title-card').forEach(c => c.classList.remove('active'));
          card.classList.add('active');
          this.studioSelectedTitle = t.title;
          const hiddenInput = document.getElementById('studio-select-title');
          if (hiddenInput) hiddenInput.value = t.title;
          const previewPill = document.getElementById('preview-studio-role-pill');
          if (previewPill) previewPill.textContent = t.title;
          if (window.soundEngine) window.soundEngine.playClick();
        });

        titlesGrid.appendChild(card);
      });
    }

    // 2. Highlight Selection Buttons
    document.querySelectorAll('#studio-avatars-grid .studio-avatar-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.avatar === this.studioSelectedAvatar);
    });

    document.querySelectorAll('#studio-frames-grid .studio-opt-card').forEach(b => {
      b.classList.toggle('active', b.dataset.frame === this.studioSelectedFrame);
    });

    document.querySelectorAll('#studio-themes-grid .studio-opt-card').forEach(b => {
      b.classList.toggle('active', b.dataset.bg === this.studioSelectedBg);
    });

    document.querySelectorAll('#studio-particles-grid .studio-particle-chip').forEach(b => {
      b.classList.toggle('active', b.dataset.shape === this.studioSelectedParticleShape);
    });

    document.querySelectorAll('#studio-featured-books-grid .studio-book-pick-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.bookId === this.studioSelectedBookId);
    });

    // 3. Render Live Preview
    const previewName = document.getElementById('preview-studio-display-name');
    if (previewName) previewName.textContent = user.displayName || user.username;

    const previewTag = document.getElementById('preview-studio-username-tag');
    if (previewTag) previewTag.textContent = `@${user.username}`;

    const previewMotto = document.getElementById('preview-studio-motto');
    if (previewMotto) {
      const m = user.motto || 'В книгах ищу то, чего не хватает в реальности...';
      previewMotto.textContent = m.startsWith('«') ? m : `«${m}»`;
    }

    const previewGlyph = document.getElementById('preview-studio-avatar-glyph');
    if (previewGlyph) previewGlyph.textContent = this.studioSelectedAvatar;

    const previewWrap = document.getElementById('preview-studio-avatar-wrap');
    if (previewWrap) previewWrap.className = `avatar-frame-wrap preview-avatar-large ${this.studioSelectedFrame}`;

    const previewAmbient = document.getElementById('preview-studio-ambient-bg');
    if (previewAmbient) previewAmbient.className = `steam-profile-ambient-bg ${this.studioSelectedBg}`;

    const previewRolePill = document.getElementById('preview-studio-role-pill');
    if (previewRolePill) {
      previewRolePill.textContent = user.title || (user.role === 'creator' ? '👑 Создатель' : (user.role === 'admin' ? '🛡️ Администратор' : '📖 Читатель'));
    }

    const previewRoleBadge = document.getElementById('preview-studio-role-badge');
    if (previewRoleBadge && window.auth.getRoleBadgeHTML) {
      previewRoleBadge.innerHTML = window.auth.getRoleBadgeHTML(user.role, user.level);
    }

    // Level & XP
    const previewLevel = document.getElementById('preview-studio-level-num');
    if (previewLevel) previewLevel.textContent = user.level || 1;

    const neededXp = (user.level || 1) * 400;
    const currentXp = user.xp || 0;
    const xpPercent = Math.min(100, Math.round((currentXp / neededXp) * 100));
    const previewXpFill = document.getElementById('preview-studio-xp-fill');
    if (previewXpFill) previewXpFill.style.width = `${xpPercent}%`;

    // Presence in preview
    const previewStatusOnline = document.getElementById('preview-studio-status-online');
    if (previewStatusOnline) {
      previewStatusOnline.textContent = 'В сети • В студии профиля';
    }

    // Featured book preview
    this.updateStudioBookPreview(this.studioSelectedBookId);
  }

  updateStudioBookPreview(bookId) {
    const user = window.auth?.currentUser;
    const book = window.bookRelay?.getBookById?.(bookId) ||
                 window.bookRelay?.getBookById?.(bookId.replace('relay_', '')) ||
                 window.bookRelay?.getBookById?.('relay_war_and_peace') ||
                 window.bookRelay?.getBookById?.('war_and_peace');
    if (!book) return;

    const coverEl = document.getElementById('preview-studio-feat-cover');
    const titleEl = document.getElementById('preview-studio-feat-title');
    const authorEl = document.getElementById('preview-studio-feat-author');
    const statEl = document.getElementById('preview-studio-feat-stat');

    if (coverEl) coverEl.src = book.coverImage;
    if (titleEl) titleEl.textContent = `«${book.title}»`;
    if (authorEl) authorEl.textContent = book.author;

    let statText = 'Освоение: 38% книги • Глава 3 из 28';
    if (user && user.shelves) {
      const fItem = (user.shelves.readingNow || []).find(b => b.id === book.id || b.id === book.id.replace('relay_', '') || `relay_${b.id}` === book.id);
      const fDone = (user.shelves.completed || []).find(b => b.id === book.id || b.id === book.id.replace('relay_', '') || `relay_${b.id}` === book.id);
      if (fItem) {
        const p = fItem.progressPercent || 38;
        const c = (fItem.chapterIdx !== undefined ? fItem.chapterIdx + 1 : 3);
        statText = `Освоение: ${p}% книги • Глава ${c} из 28`;
      } else if (fDone) {
        statText = `Освоение: 100% книги • Полностью завершено`;
      } else if (book.id.includes('war_and_peace')) {
        statText = 'Освоение: 38% книги • Глава 3 из 28';
      } else {
        statText = 'Начало чтения • Глава 1 из 20';
      }
    }
    if (statEl) statEl.textContent = statText;
  }

  saveProfileStudio() {
    const user = window.auth.currentUser;
    if (!user) return;

    const nameVal = document.getElementById('studio-input-name')?.value.trim();
    const mottoVal = document.getElementById('studio-input-motto')?.value.trim();
    const titleVal = this.studioSelectedTitle || document.getElementById('studio-select-title')?.value;

    if (nameVal) user.displayName = nameVal;
    if (mottoVal !== undefined) user.motto = mottoVal;
    if (titleVal) user.title = titleVal;

    if (this.studioSelectedAvatar) user.avatar = this.studioSelectedAvatar;
    if (this.studioSelectedFrame) user.avatarFrame = this.studioSelectedFrame;
    if (this.studioSelectedBg) user.profileBg = this.studioSelectedBg;
    if (this.studioSelectedParticleShape) {
      user.particleShape = this.studioSelectedParticleShape;
      window.reactiveBg?.setParticleShape?.(this.studioSelectedParticleShape);
      const badge = document.getElementById('current-particle-badge');
      const shapeLabels = { auto: 'Авто', stars: 'Звёзды ✨', hearts: 'Сердца ❤️', pixels: 'Пиксели 👾', embers: 'Искры 🔥', petals: 'Лепестки 🍃', bubbles: 'Пузыри 🫧', dust: 'Пылинки 🌫️' };
      if (badge) badge.textContent = shapeLabels[this.studioSelectedParticleShape] || 'Авто';
      document.querySelectorAll('.particle-shape-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.shape === this.studioSelectedParticleShape);
      });
    }

    if (this.studioSelectedBookId) {
      localStorage.setItem('cyberlibris_featured_book_' + user.username, this.studioSelectedBookId);
    }

    window.auth.saveUser();
    window.auth.syncUserToUI();
    this.renderProfile();
    this.showToast('Профиль успешно обновлен! Все визуальные изменения сохранены.', 'success');
    if (window.soundEngine?.playCorrect) window.soundEngine.playCorrect();
    this.switchView('profile');
  }

  cancelProfileStudio() {
    const user = window.auth.currentUser;
    if (user && window.reactiveBg) {
      window.reactiveBg.setParticleShape(user.particleShape || 'auto');
    }
    this.switchView('profile');
  }

  // --- INTERACTIVE THEME PALETTE (COLOR CIRCLES PREVIEW) ---

  bindThemePalette() {
    const container = document.getElementById('theme-picker-container');
    const triggerBtn = document.getElementById('btn-theme-picker-trigger');
    const dot = document.getElementById('current-theme-dot');

    const themeGradients = {
      'theme-steam': 'linear-gradient(135deg, #1b2838, #66c0f4)',
      'theme-cyberpunk': 'linear-gradient(135deg, #00f0ff, #ff007f)',
      'theme-cosmic': 'linear-gradient(135deg, #7928ca, #4338ca)',
      'theme-amber': 'linear-gradient(135deg, #f59e0b, #d97706)',
      'theme-matrix': 'linear-gradient(135deg, #00ff66, #003b1f)',
      'theme-royal': 'linear-gradient(135deg, #9d4edd, #06d6a0)',
      'theme-synthwave': 'linear-gradient(135deg, #ff007f, #ffaa00)',
      'theme-ocean': 'linear-gradient(135deg, #0284c7, #06b6d4)',
      'theme-zen': 'linear-gradient(135deg, #94a3b8, #475569)'
    };

    const themeNames = {
      'theme-steam': 'Steam',
      'theme-cyberpunk': 'Киберпанк',
      'theme-cosmic': 'Космос',
      'theme-amber': 'Янтарь',
      'theme-matrix': 'Матрица',
      'theme-royal': 'Аврора',
      'theme-synthwave': 'Синтвейв',
      'theme-ocean': 'Океан',
      'theme-zen': 'Дзен'
    };

    const shapeLabels = {
      auto: 'Авто',
      stars: 'Звёзды ✨',
      hearts: 'Сердца ❤️',
      pixels: 'Пиксели 👾',
      embers: 'Искры 🔥',
      petals: 'Лепестки 🍃',
      bubbles: 'Пузыри 🫧'
    };

    const updateActiveThemeUI = (themeId) => {
      if (dot && themeGradients[themeId]) {
        dot.style.background = themeGradients[themeId];
      }
      document.querySelectorAll('.theme-swatch-item').forEach((item) => {
        if (item.dataset.theme === themeId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    };

    const updateActiveShapeUI = (shape) => {
      const currentShape = shape || (window.reactiveBg ? window.reactiveBg.particleShape : 'auto');
      const badge = document.getElementById('current-particle-badge');
      if (badge) {
        badge.textContent = shapeLabels[currentShape] || 'Авто';
      }
      document.querySelectorAll('.particle-shape-btn').forEach((btn) => {
        if (btn.dataset.shape === currentShape) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    };

    // Initialize UI with active theme & shape
    const activeTheme = window.reactiveBg ? window.reactiveBg.currentTheme : 'theme-cyberpunk';
    updateActiveThemeUI(activeTheme);
    const activeShape = window.reactiveBg ? window.reactiveBg.particleShape : 'auto';
    updateActiveShapeUI(activeShape);

    // Toggle dropdown
    if (triggerBtn && container) {
      triggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        container.classList.toggle('open');
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (container && !container.contains(e.target)) {
        container.classList.remove('open');
      }
    });

    // Swatches selection with visual circles
    document.querySelectorAll('.theme-swatch-item').forEach((swatch) => {
      swatch.addEventListener('click', (e) => {
        e.stopPropagation();
        const themeId = swatch.dataset.theme;
        if (!themeId) return;

        if (window.reactiveBg) {
          window.reactiveBg.setTheme(themeId);
        }
        const user = window.auth.currentUser;
        if (user) {
          user.customBg = themeId;
          window.auth.saveUser();
        }

        updateActiveThemeUI(themeId);
        updateActiveShapeUI(window.reactiveBg ? window.reactiveBg.particleShape : 'auto');
        if (container) container.classList.remove('open');

        window.dbEngine.updateQuestProgress('quest_change_theme', 1);
        this.renderDailyQuests();

        this.showToast(`Выбрана атмосфера: ${themeNames[themeId] || themeId}`, 'info');
        if (window.soundEngine) window.soundEngine.playCardFlip();
      });
    });

    // Particle Shape Selector Buttons
    document.querySelectorAll('.particle-shape-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const shape = btn.dataset.shape;
        if (!shape) return;

        if (window.reactiveBg) {
          window.reactiveBg.setParticleShape(shape);
        }
        const user = window.auth.currentUser;
        if (user) {
          user.particleShape = shape;
          window.auth.saveUser();
        }

        updateActiveShapeUI(shape);
        this.showToast(`Форма частиц: ${shapeLabels[shape] || shape}`, 'info');
        if (window.soundEngine) window.soundEngine.playCardFlip();
      });
    });
  }

  cycleNextTheme() {
    this.bindThemePalette();
  }

  // --- DAILY QUESTS ---

  renderDailyQuests() {
    const container = document.getElementById('daily-quests-container');
    if (!container) return;

    const quests = window.dbEngine.getDailyQuests();
    container.innerHTML = '';

    quests.forEach((q) => {
      const currentVal = q.current || 0;
      const percent = Math.min(100, Math.round((currentVal / q.target) * 100));
      const card = document.createElement('div');
      card.className = `quest-card ${q.claimed ? 'claimed' : q.completed ? 'completed' : ''}`;

      const rewardXp = q.rewardXp || q.rewardXP || 50;
      let btnHTML = '';
      if (q.claimed) {
        btnHTML = '<span class="quest-btn-claimed">Получено</span>';
      } else if (q.completed) {
        btnHTML = `<button class="btn btn-primary btn-sm btn-claim-quest" data-quest-id="${q.id}">Забрать +${q.rewardLumens} ⬡</button>`;
      } else {
        btnHTML = `<span class="quest-reward-preview">+${q.rewardLumens} ⬡ | +${rewardXp} XP</span>`;
      }

      card.innerHTML = `
        <div class="quest-header">
          <span class="quest-icon">${q.icon || '📜'}</span>
          <div class="quest-info">
            <div class="quest-title">${q.title}</div>
            <div class="quest-desc">${q.description}</div>
          </div>
        </div>
        <div class="quest-progress-wrap">
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${percent}%;"></div>
          </div>
          <div class="quest-progress-stats">${currentVal} / ${q.target} ${q.unit || ''}</div>
        </div>
        <div class="quest-action-row">
          ${btnHTML}
        </div>
      `;

      const claimBtn = card.querySelector('.btn-claim-quest');
      if (claimBtn) {
        claimBtn.addEventListener('click', () => {
          const res = window.dbEngine.claimQuest(q.id);
          if (res) {
            const xp = res.rewardXp || res.rewardXP || 50;
            window.auth.addLumens(res.rewardLumens);
            window.auth.addXp(xp);
            this.showToast(`Цель достигнута! +${res.rewardLumens} ⬡, +${xp} XP`, 'reward');
            if (window.soundEngine?.playCoin) window.soundEngine.playCoin();
            this.renderDailyQuests();
          }
        });
      }

      container.appendChild(card);
    });
  }

  renderWeeklyHeatmap(user) {
    const container = document.getElementById('weekly-heatmap-container');
    if (!container) return;

    const days = [
      { name: 'Пн', key: 1 },
      { name: 'Вт', key: 2 },
      { name: 'Ср', key: 3 },
      { name: 'Чт', key: 4 },
      { name: 'Пт', key: 5 },
      { name: 'Сб', key: 6 },
      { name: 'Вс', key: 0 }
    ];

    const today = new Date().getDay();
    const readMinutes = user?.stats?.readTimeMinutes || 25;

    const dailyMins = [
      Math.max(12, Math.round(readMinutes * 0.28)),
      Math.max(20, Math.round(readMinutes * 0.42)),
      Math.max(15, Math.round(readMinutes * 0.3)),
      Math.max(30, Math.round(readMinutes * 0.55)),
      Math.max(35, Math.round(readMinutes * 0.65)),
      Math.max(45, Math.round(readMinutes * 0.8)),
      Math.max(18, Math.round(readMinutes * 0.35))
    ];

    const maxMins = Math.max(...dailyMins, 45);

    container.innerHTML = days.map((day, idx) => {
      const mins = dailyMins[idx];
      const heightPercent = Math.min(100, Math.max(15, Math.round((mins / maxMins) * 100)));
      const isToday = day.key === today;

      return `
        <div class="heatmap-day-col ${isToday ? 'is-today' : ''}">
          <span class="heatmap-mins-label">${mins}м</span>
          <div class="heatmap-bar-wrap" title="${day.name}: ${mins} минут чтения">
            <div class="heatmap-bar-fill" style="height: ${heightPercent}%;"></div>
          </div>
          <span class="heatmap-day-label">${day.name}</span>
        </div>
      `;
    }).join('');
  }

  // --- MODALS & AUDIO ---

  bindModals() {
    document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close-btn')) {
          this.closeAllModals();
        }
      });
    });

    const formLogin = document.getElementById('form-login') || document.getElementById('auth-form-login');
    const formReg = document.getElementById('form-register') || document.getElementById('auth-form-register');

    formLogin?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username')?.value;
      const p = document.getElementById('login-password')?.value;
      const res = window.auth.login(u, p);
      if (res.success) {
        this.closeAllModals();
        this.showToast(`Добро пожаловать, ${res.user.displayName || res.user.username}!`, 'success');
      } else {
        this.showToast(res.message, 'error');
      }
    });

    formReg?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('reg-username')?.value;
      const d = document.getElementById('reg-display-name')?.value;
      const p = document.getElementById('reg-password')?.value;
      const a = document.querySelector('input[name="reg-avatar"]:checked')?.value || '📖';

      const res = window.auth.register(u, p, d, a);
      if (res.success) {
        this.closeAllModals();
        this.showToast(`Регистрация успешна! Добро пожаловать, ${d || u}!`, 'reward');
        this.openModal('modal-taste-onboarding');
      } else {
        this.showToast(res.message, 'error');
      }
    });

    // Fast 1-click test logins
    document.getElementById('btn-fast-creator')?.addEventListener('click', () => {
      window.auth.switchUser('usr_creator');
      this.closeAllModals();
      this.showToast('Вход выполнен как Создатель Системы 👑', 'reward');
    });

    document.getElementById('btn-fast-user')?.addEventListener('click', () => {
      window.auth.switchUser('usr_scholar');
      this.closeAllModals();
      this.showToast('Вход выполнен как Читатель-Схоласт 📖', 'info');
    });
  }

  openRoadmapModal() {
    this.openModal('modal-site-roadmap');
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  bindRoadmapModal() {
    document.getElementById('btn-nav-stages')?.addEventListener('click', () => {
      this.openRoadmapModal();
    });
    document.getElementById('ticker-badge-btn')?.addEventListener('click', () => {
      this.openRoadmapModal();
    });
    document.getElementById('btn-close-roadmap')?.addEventListener('click', () => {
      this.closeAllModals();
    });
  }

  bindTickerClicks() {
    const ticker = document.getElementById('ticker-items-scroll');
    if (!ticker) return;

    ticker.querySelectorAll('.ticker-item').forEach(item => {
      item.addEventListener('click', () => {
        const bookId = item.dataset.bookId;
        const action = item.dataset.action;

        if (action === 'roadmap') {
          this.openRoadmapModal();
        } else if (bookId) {
          this.openBookDetails(bookId);
        }
      });
    });
  }

  bindCatalogPagination() {
    document.getElementById('btn-catalog-load-more')?.addEventListener('click', () => {
      const btn = document.getElementById('btn-catalog-load-more');
      const mode = btn?.dataset.mode || 'more';
      if (mode === 'more') {
        this.catalogDisplayLimit += 12;
        this.renderLibrary();
      } else {
        this.catalogDisplayLimit = 12;
        this.renderLibrary();
        document.getElementById('remanga-filter-panel')?.scrollIntoView({ behavior: 'smooth' });
      }
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('active');
  }

  showLevelUpModal(level) {
    const modal = document.getElementById('level-up-modal');
    const numEl = document.getElementById('level-up-number');
    if (!modal) return;
    if (numEl) numEl.textContent = level;
    modal.classList.add('active');

    const closeBtn = document.getElementById('btn-close-levelup');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.classList.remove('active');
        if (window.soundEngine) window.soundEngine.playClick();
      };
    }
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    document.getElementById('level-up-modal')?.classList.remove('active');
  }

  bindTiltEffect() {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      if (card._tiltInitialized) return;
      card._tiltInitialized = true;

      let rect = null;
      let rafId = null;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;

      const update = () => {
        if (document.body.classList.contains('eco-mode')) {
          card.style.transform = '';
          rafId = null;
          return;
        }
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          rafId = requestAnimationFrame(update);
        } else {
          rafId = null;
        }
      };

      card.addEventListener('mouseenter', () => {
        if (!document.body.classList.contains('eco-mode')) {
          rect = card.getBoundingClientRect();
        }
      }, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('eco-mode')) return;
        if (!rect) rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        targetX = (y / (rect.height / 2)) * -3.5;
        targetY = (x / (rect.width / 2)) * 3.5;
        if (!rafId) rafId = requestAnimationFrame(update);
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        rect = null;
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(update);
      }, { passive: true });
    });
  }

  bindMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      if (btn._magneticInitialized) return;
      btn._magneticInitialized = true;

      let rect = null;
      let rafId = null;

      btn.addEventListener('mouseenter', () => {
        if (!document.body.classList.contains('eco-mode')) {
          rect = btn.getBoundingClientRect();
        }
      }, { passive: true });

      btn.addEventListener('mousemove', (e) => {
        if (document.body.classList.contains('eco-mode')) return;
        if (!rect) rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        if (!rafId) {
          rafId = requestAnimationFrame(() => {
            btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
            rafId = null;
          });
        }
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        rect = null;
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        btn.style.transform = 'translate(0px, 0px)';
      }, { passive: true });
    });
  }

  bindAudioTriggers() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .genre-pill, .carousel-arrow, .shop-item-card');
      if (btn && window.soundEngine) window.soundEngine.playClick();
    });
  }

  bindHoverSFX() {
    let lastHoverTime = 0;
    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('.nav-btn, .magnetic-btn, .steam-book-card, .theme-swatch-item, .remanga-chip, .profile-badge-card, .ambient-opt-btn, .oracle-crystal-orb');
      if (target && window.soundEngine && !window.soundEngine.isMuted) {
        const now = Date.now();
        if (now - lastHoverTime > 75) {
          lastHoverTime = now;
          window.soundEngine.playHover();
        }
      }
    }, { passive: true });
  }

  setupCyberOracle() {
    // Removed per user request
  }

  setupHeaderAmbientControl() {
    const trigger = document.getElementById('btn-ambient-picker-trigger');
    const dropdown = document.getElementById('ambient-dropdown');
    const label = document.getElementById('ambient-current-label');
    const optButtons = document.querySelectorAll('.ambient-opt-btn');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
      document.getElementById('theme-palette-dropdown')?.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && e.target !== trigger) {
        dropdown.classList.remove('active');
      }
    });

    const labelsMap = {
      off: '🎧 Эмбиент',
      rain: '🌧️ Дождь',
      fire: '🔥 Камин',
      cyber: '🌌 Дрон',
      library: '🕯️ Зал'
    };

    optButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const amb = btn.dataset.ambient;
        optButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (window.soundEngine) {
          if (amb === 'off') {
            window.soundEngine.stopAmbient();
            trigger.classList.remove('playing');
          } else {
            window.soundEngine.playAmbient(amb);
            trigger.classList.add('playing');
          }
        }

        if (label) label.textContent = labelsMap[amb] || '🎧 Эмбиент';
        dropdown.classList.remove('active');
      });
    });
  }

  updateAudioButtonState() {
    const btn = document.getElementById('btn-toggle-sfx');
    if (!btn) return;
    btn.textContent = window.soundEngine.isMuted ? 'Звук: Выкл' : 'Звук: Вкл';
    btn.classList.toggle('active', !window.soundEngine.isMuted);
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div style="font-size: 1.2rem;">${type === 'reward' ? '✨' : type === 'success' ? '✓' : type === 'error' ? '⚠️' : 'ℹ️'}</div>
      <div>${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // =========================================================================
  // GLOBAL COMMAND PALETTE (CTRL+K SPOTLIGHT) & SHORTCUTS ENGINE
  // =========================================================================

  bindCommandPalette() {
    const modal = document.getElementById('modal-command-palette');
    const input = document.getElementById('cmd-palette-input');
    const closeBtn = document.getElementById('btn-close-cmd-palette');
    const triggerBtn = document.getElementById('btn-open-command-palette');
    const resultsContainer = document.getElementById('cmd-palette-results');
    const filterPills = document.querySelectorAll('.cmd-filter-pill');

    if (!modal || !input || !resultsContainer) return;

    const openPalette = () => {
      modal.classList.add('active');
      this.cmdPaletteOpen = true;
      input.value = '';
      this.cmdPaletteQuery = '';
      this.cmdPaletteSelectedIndex = 0;
      this.renderCommandPaletteResults();
      setTimeout(() => input.focus(), 60);
      if (window.soundEngine) window.soundEngine.playClick();
    };

    const closePalette = () => {
      modal.classList.remove('active');
      this.cmdPaletteOpen = false;
      input.blur();
    };

    triggerBtn?.addEventListener('click', openPalette);
    closeBtn?.addEventListener('click', closePalette);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePalette();
    });

    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.cmdPaletteType = pill.dataset.cmdType || 'all';
        this.cmdPaletteSelectedIndex = 0;
        this.renderCommandPaletteResults();
        input.focus();
      });
    });

    input.addEventListener('input', (e) => {
      this.cmdPaletteQuery = e.target.value;
      this.cmdPaletteSelectedIndex = 0;
      this.renderCommandPaletteResults();
    });

    input.addEventListener('keydown', (e) => {
      const items = resultsContainer.querySelectorAll('.cmd-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.cmdPaletteSelectedIndex = (this.cmdPaletteSelectedIndex + 1) % items.length;
        this.highlightCommandPaletteItem();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.cmdPaletteSelectedIndex = (this.cmdPaletteSelectedIndex - 1 + items.length) % items.length;
        this.highlightCommandPaletteItem();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = items[this.cmdPaletteSelectedIndex];
        if (selected) selected.click();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        closePalette();
      }
    });

    this._openCommandPaletteFn = openPalette;
    this._closeCommandPaletteFn = closePalette;
  }

  renderCommandPaletteResults() {
    const resultsContainer = document.getElementById('cmd-palette-results');
    if (!resultsContainer) return;

    const query = (this.cmdPaletteQuery || '').toLowerCase().trim();
    const typeFilter = this.cmdPaletteType || 'all';
    const items = [];

    // 1. Navigation sections
    if (typeFilter === 'all' || typeFilter === 'nav') {
      const navSections = [
        { id: 'library', title: '🏪 Магазин (Каталог классики)', sub: 'Витрина, новинки, бестселлеры и рекомендации', icon: '🏪', type: 'nav' },
        { id: 'steam-library', title: '📚 Библиотека Steam', sub: 'Двухпанельный хаб коллекции и прогресс', icon: '📚', type: 'nav' },
        { id: 'community', title: '👥 Сообщество и обзоры', sub: 'Рецензии читателей, оценки и отзывы', icon: '👥', type: 'nav' },
        { id: 'games', title: '🎮 Кибер-Игры и Викторины', sub: 'Мини-игры, тесты на эрудицию, фарм Люменов и XP', icon: '🎮', type: 'nav' },
        { id: 'shop', title: '🛍️ Магазин предметов и рамок', sub: 'Косметические рамки аватарок за Люмены', icon: '🛍️', type: 'nav' },
        { id: 'leaderboard', title: '🏆 Зал Славы (Топ схоластов)', sub: 'Рейтинг лучших читателей академии', icon: '🏆', type: 'nav' },
        { id: 'profile', title: '👤 Профиль схоласта', sub: 'Личная статистика, полки и достижения', icon: '👤', type: 'nav' },
        { id: 'admin', title: '⚡ Панель Администратора', sub: 'Управление каталогом и сброс базы', icon: '⚡', type: 'nav' }
      ];

      navSections.forEach(nav => {
        if (!query || nav.title.toLowerCase().includes(query) || nav.sub.toLowerCase().includes(query)) {
          items.push({
            type: 'nav',
            badgeClass: 'badge-nav',
            badgeText: 'Раздел',
            iconHtml: `<div class="cmd-item-icon">${nav.icon}</div>`,
            title: nav.title,
            sub: nav.sub,
            hint: '↵ Перейти',
            action: () => {
              this._closeCommandPaletteFn?.();
              this.switchView(nav.id);
            }
          });
        }
      });
    }

    // 2. Platform Actions & Controls
    if (typeFilter === 'all' || typeFilter === 'action') {
      const actions = [
        {
          title: '🎨 Сменить цветовую тему оформления',
          sub: 'Переключить следующую палитру платформы (Steam, Неон, Космос, Янтарь...)',
          icon: '🎨',
          hint: 'T',
          action: () => {
            this._closeCommandPaletteFn?.();
            this.cycleNextTheme();
          }
        },
        {
          title: '🔊 Переключить звуковые эффекты (SFX)',
          sub: 'Включить или выключить звуки интерфейса и страниц',
          icon: '🔊',
          hint: 'M',
          action: () => {
            this._closeCommandPaletteFn?.();
            const isMuted = window.soundEngine.toggleMute();
            this.updateAudioButtonState();
            this.showToast(isMuted ? '🔇 Звук выключен' : '🔊 Звуковые эффекты включены', 'info');
          }
        },
        {
          title: '🎧 Переключить атмосферный эмбиент',
          sub: 'Фоновые звуки дождя, камина или космического дрона',
          icon: '🎧',
          hint: '',
          action: () => {
            this._closeCommandPaletteFn?.();
            const current = window.soundEngine?.currentAmbientType || 'off';
            const next = current === 'off' ? 'rain' : (current === 'rain' ? 'fire' : (current === 'fire' ? 'cyber' : 'off'));
            window.soundEngine?.playAmbient?.(next);
            const labels = { off: '🔇 Без звука', rain: '🌧️ Неоновый Дождь', fire: '🔥 Камин', cyber: '🌌 Космос' };
            const lbl = document.getElementById('ambient-current-label');
            if (lbl) lbl.textContent = `🎧 ${labels[next] || 'Эмбиент'}`;
            this.showToast(`Фоновый звук: ${labels[next] || next}`, 'info');
          }
        },
        {
          title: '⌨️ Шпаргалка по горячим клавишам',
          sub: 'Просмотреть полный список шорткатов клавиатуры',
          icon: '⌨️',
          hint: '?',
          action: () => {
            this._closeCommandPaletteFn?.();
            this.openModal('modal-shortcuts-help');
          }
        },
        {
          title: '📜 Переключить режим чтения (Лента / По главам)',
          sub: 'Плавный манга-скролл или постраничный классический просмотр',
          icon: '📜',
          hint: '',
          action: () => {
            this._closeCommandPaletteFn?.();
            window.readerEngine?.toggleReadingMode?.();
          }
        },
        {
          title: '🔝 Прокрутить страницу наверх',
          sub: 'Мгновенный возврат к началу текущего экрана',
          icon: '🔝',
          hint: 'Home',
          action: () => {
            this._closeCommandPaletteFn?.();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }
      ];

      actions.forEach(act => {
        if (!query || act.title.toLowerCase().includes(query) || act.sub.toLowerCase().includes(query)) {
          items.push({
            type: 'action',
            badgeClass: 'badge-action',
            badgeText: 'Действие',
            iconHtml: `<div class="cmd-item-icon">${act.icon}</div>`,
            title: act.title,
            sub: act.sub,
            hint: act.hint,
            action: act.action
          });
        }
      });
    }

    // 2.5 Readers & Profiles Search
    if (typeFilter === 'all' || typeFilter === 'user') {
      const allUsers = window.dbEngine?.getUsers ? window.dbEngine.getUsers() : [];
      allUsers.forEach(u => {
        const matchName = u.displayName && u.displayName.toLowerCase().includes(query);
        const matchUser = u.username && u.username.toLowerCase().includes(query);
        if (!query || matchName || matchUser) {
          items.push({
            type: 'user',
            badgeClass: 'badge-nav',
            badgeText: 'Читатель',
            iconHtml: `<div class="cmd-item-icon">${u.avatar || '👤'}</div>`,
            title: `👤 ${u.displayName} (@${u.username})`,
            sub: `${u.title || u.role} · Ур. ${u.level || 1} · Профиль и витрина читателя`,
            hint: 'Профиль',
            action: () => {
              this._closeCommandPaletteFn?.();
              this.viewUserProfile(u.username);
            }
          });
        }
      });
    }

    // 3. Books & Authors from Catalog
    if (typeFilter === 'all' || typeFilter === 'book') {
      const allBooks = window.bookRelay ? window.bookRelay.getAllBooks() : [];
      allBooks.forEach(b => {
        const matchTitle = b.title.toLowerCase().includes(query);
        const matchAuthor = b.author.toLowerCase().includes(query);
        const matchGenre = (b.genre || '').toLowerCase().includes(query);
        if (!query || matchTitle || matchAuthor || matchGenre) {
          const saved = window.readerEngine?.getSavedProgress?.(b.id);
          const hasProg = saved && typeof saved.currentChapter === 'number' && saved.currentChapter > 0;
          const progText = hasProg ? ` • Гл. ${saved.currentChapter + 1} (${saved.progressPercent || 0}%)` : '';

          items.push({
            type: 'book',
            badgeClass: 'badge-book',
            badgeText: 'Книга',
            iconHtml: `<img src="${b.coverImage}" class="cmd-item-icon" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">`,
            title: b.title,
            sub: `${b.author} • ${b.genre || 'Классика'} • ${b.chapters?.length || 1} глав${progText}`,
            hint: '▶ Читать',
            action: () => {
              this._closeCommandPaletteFn?.();
              const chIdx = (saved && saved.currentChapter) || 0;
              window.readerEngine.openBook(b.id, chIdx);
              this.switchView('reader');
            }
          });
        }
      });
    }

    resultsContainer.innerHTML = '';
    if (items.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 2.5rem 1rem; color: #64748b;">
          <div style="font-size: 2rem; margin-bottom: 0.5rem;">🔍</div>
          <div>По запросу «${this.cmdPaletteQuery}» ничего не найдено</div>
          <small style="color: #475569;">Попробуйте поискать название книги, автора или раздел платформы</small>
        </div>
      `;
      return;
    }

    items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = `cmd-item ${idx === this.cmdPaletteSelectedIndex ? 'selected' : ''}`;
      row.innerHTML = `
        ${item.iconHtml}
        <div class="cmd-item-content">
          <div class="cmd-item-title">${item.title}</div>
          <div class="cmd-item-sub">${item.sub}</div>
        </div>
        <span class="cmd-item-badge ${item.badgeClass}">${item.badgeText}</span>
        ${item.hint ? `<span class="cmd-item-hint">${item.hint}</span>` : ''}
      `;

      row.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playClick();
        item.action();
      });

      row.addEventListener('mouseenter', () => {
        this.cmdPaletteSelectedIndex = idx;
        this.highlightCommandPaletteItem();
      });

      resultsContainer.appendChild(row);
    });

    this.highlightCommandPaletteItem();
  }

  highlightCommandPaletteItem() {
    const resultsContainer = document.getElementById('cmd-palette-results');
    if (!resultsContainer) return;
    const items = resultsContainer.querySelectorAll('.cmd-item');
    items.forEach((item, idx) => {
      const isSel = idx === this.cmdPaletteSelectedIndex;
      item.classList.toggle('selected', isSel);
      if (isSel) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }

  // =========================================================================
  // GLOBAL KEYBOARD SHORTCUTS
  // =========================================================================

  bindGlobalShortcuts() {
    window.addEventListener('keydown', (e) => {
      const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
      const isInput = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;

      // 1. Ctrl + K / Cmd + K opens/closes Command Palette
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        if (this.cmdPaletteOpen) {
          this._closeCommandPaletteFn?.();
        } else {
          this._openCommandPaletteFn?.();
        }
        return;
      }

      // 2. Escape: Closes open palette, modal, or returns from reader
      if (e.key === 'Escape') {
        if (this.cmdPaletteOpen) {
          e.preventDefault();
          this._closeCommandPaletteFn?.();
          return;
        }
        const activeModal = document.querySelector('.modal-overlay.active, #level-up-modal.active');
        if (activeModal) {
          e.preventDefault();
          this.closeAllModals();
          return;
        }
        if (this.currentView === 'reader') {
          e.preventDefault();
          // 1. If Zen Mode is active, exit Zen Mode first
          if (document.body.classList.contains('zen-mode-active')) {
            window.readerEngine?.toggleZenMode?.(false);
            return;
          }
          // 2. If TOC Drawer is open, close TOC Drawer
          const tocDrawer = document.getElementById('reader-toc-drawer');
          if (tocDrawer && tocDrawer.classList.contains('active')) {
            window.readerEngine?.closeTocDrawer?.();
            return;
          }
          // 3. If popovers are open, close them
          const appPop = document.getElementById('reader-appearance-popover');
          if (appPop && appPop.style.display !== 'none') {
            window.readerEngine?.closeAppearancePopover?.();
            return;
          }
          const audPop = document.getElementById('reader-audio-popover');
          if (audPop && audPop.style.display !== 'none') {
            window.readerEngine?.closeAudioPopover?.();
            return;
          }
          this.returnFromReader();
          return;
        }
      }

      // If user is inside an input/textarea/select, do not hijack typing keys
      if (isInput) return;

      // 3. Slash '/' opens Command Palette
      if (e.key === '/') {
        e.preventDefault();
        this._openCommandPaletteFn?.();
        return;
      }

      // 4. '?' opens shortcuts help modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        this.openModal('modal-shortcuts-help');
        return;
      }

      // 5. 'T' cycles color theme
      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        this.cycleNextTheme();
        return;
      }

      // 6. 'M' toggles audio SFX
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        const isMuted = window.soundEngine.toggleMute();
        this.updateAudioButtonState();
        this.showToast(isMuted ? '🔇 Звук выключен' : '🔊 Звуковые эффекты включены', 'info');
        return;
      }

      // 7. Home key scrolls to top
      if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // 8. Number keys 1-7: Fast View switching
      const numMap = {
        '1': 'library',
        '2': 'steam-library',
        '3': 'community',
        '4': 'games',
        '5': 'shop',
        '6': 'leaderboard',
        '7': 'profile'
      };
      if (numMap[e.key] && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        this.switchView(numMap[e.key]);
        return;
      }

      // 9. Reader specific keys
      if (this.currentView === 'reader') {
        if (e.key === ' ') {
          e.preventDefault();
          window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
          return;
        }
        if (e.key === 'ArrowRight' || e.key === 'PageDown') {
          e.preventDefault();
          window.readerEngine?.nextPageOrChapter?.();
          return;
        }
        if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
          e.preventDefault();
          window.readerEngine?.prevPageOrChapter?.();
          return;
        }
      }
    });

    document.getElementById('btn-open-shortcuts-help')?.addEventListener('click', () => {
      this.openModal('modal-shortcuts-help');
    });
  }

  // =========================================================================
  // FLOATING SCROLL-TO-TOP FAB WITH PERCENTAGE INDICATOR
  // =========================================================================

  bindScrollTopFAB() {
    const fab = document.getElementById('btn-fab-scroll-top');
    const percentEl = document.getElementById('fab-scroll-percent');
    if (!fab) return;

    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || document.documentElement.scrollTop;
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          const percent = maxScroll > 0 ? Math.min(100, Math.max(0, Math.round((scrollY / maxScroll) * 100))) : 0;

          if (percentEl) percentEl.textContent = `${percent}%`;

          if (scrollY > 220) {
            fab.classList.add('visible');
          } else {
            fab.classList.remove('visible');
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });

    fab.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.soundEngine?.playPageFlip) window.soundEngine.playPageFlip();
      else window.soundEngine?.playCardFlip?.();
    });
  }
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

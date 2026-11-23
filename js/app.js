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

class AppController {
  constructor() {
    this.currentView = 'library';
    this.selectedCategory = 'all';
    this.selectedSort = 'popular';
    this.selectedStatus = 'all';
    this.selectedFormat = 'all';
    this.selectedDifficulty = 'all';
    this.searchQuery = '';

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
    this.bindTiltEffect();
    this.bindMagneticButtons();
    this.bindAudioTriggers();
    this.bindThemePalette();
    this.bindSearchAndFilters();
    this.bindSteamCarouselControls();
    this.bindTasteOnboarding();
    this.bindBookDetailsModal();
    this.bindAdminRecommendations();
    this.bindOpenLibraryExplorer();

    // 4. Initial Render
    this.initSteamCarousel();
    this.renderLibrary();
    this.renderDailyQuests();
    this.updateAudioButtonState();

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

    document.getElementById('user-pill-container')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-login')) {
        this.openModal('modal-auth');
      } else {
        this.switchView('profile');
      }
    });

    // Quick Theme Switcher Button in header
    document.getElementById('btn-quick-theme')?.addEventListener('click', () => {
      this.cycleNextTheme();
    });

    // Sound toggle button in header
    document.getElementById('btn-toggle-sfx')?.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      this.updateAudioButtonState();
      this.showToast(isMuted ? '🔇 Звук выключен' : '🔊 Звуковые эффекты включены', 'info');
    });
  }

  switchView(viewName) {
    if (viewName === 'admin' && !window.auth.isAdmin()) {
      this.showToast('Доступ запрещен. Требуются права Администратора или Создателя.', 'error');
      return;
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

    if (viewName === 'library') {
      this.renderLibrary();
      this.startCarouselTimer();
    } else {
      this.pauseCarouselTimer();
    }

    if (viewName === 'games') window.miniGames.switchGame(window.miniGames.currentGame);
    else if (viewName === 'shop') window.miniGames.renderShopCategory('frames');
    else if (viewName === 'leaderboard') this.renderLeaderboard();
    else if (viewName === 'profile') this.renderProfile();
    else if (viewName === 'admin') window.adminEngine.renderAdminView();

    if (window.soundEngine) window.soundEngine.playClick();
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
              <span style="color:#ffd700; font-weight:800; font-size:0.9rem;">⭐ ${book.rating}</span>
              <span style="color:var(--text-dim); font-size:0.8rem;">(~${book.lengthPages} стр.)</span>
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
          window.readerEngine.openBook(book.id, 0, 'manga');
        });

        mainEl.querySelector('#btn-carousel-details')?.addEventListener('click', () => {
          this.openBookDetails(book.id);
        });

        mainEl.querySelector('#btn-carousel-fav')?.addEventListener('click', () => {
          const user = window.auth.currentUser;
          if (!user) { this.openModal('modal-auth'); return; }
          const isFav = window.bookRelay.toggleFavorite(user.username, book.id);
          this.showToast(isFav ? `❤️ «${book.title}» добавлена в избранное!` : `Удалено из избранного`, 'info');
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

  bindSearchAndFilters() {
    const searchInput = document.getElementById('remanga-search-input');
    const clearBtn = document.getElementById('btn-clear-search');
    const sortSelect = document.getElementById('remanga-sort-select');
    const statusSelect = document.getElementById('remanga-status-select');
    const formatSelect = document.getElementById('remanga-format-select');
    const diffSelect = document.getElementById('remanga-diff-select');
    const resetBtn = document.getElementById('btn-reset-remanga-filters');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        if (clearBtn) clearBtn.style.display = this.searchQuery ? 'block' : 'none';
        this.renderLibrary();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.searchQuery = '';
        clearBtn.style.display = 'none';
        this.renderLibrary();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.selectedSort = e.target.value;
        this.renderLibrary();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.selectedStatus = e.target.value;
        this.renderLibrary();
      });
    }

    if (formatSelect) {
      formatSelect.addEventListener('change', (e) => {
        this.selectedFormat = e.target.value;
        this.renderLibrary();
      });
    }

    if (diffSelect) {
      diffSelect.addEventListener('change', (e) => {
        this.selectedDifficulty = e.target.value;
        this.renderLibrary();
      });
    }

    document.querySelectorAll('#remanga-genre-chips .remanga-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
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
          this.renderLibrary();
        }

        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.searchQuery = '';
        this.selectedCategory = 'all';
        this.selectedSort = 'popular';
        this.selectedStatus = 'all';
        this.selectedFormat = 'all';
        this.selectedDifficulty = 'all';

        if (searchInput) searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        if (sortSelect) sortSelect.value = 'popular';
        if (statusSelect) statusSelect.value = 'all';
        if (formatSelect) formatSelect.value = 'all';
        if (diffSelect) diffSelect.value = 'all';

        document.querySelectorAll('#remanga-genre-chips .remanga-chip').forEach(c => {
          c.classList.toggle('active', c.dataset.genre === 'all');
        });

        const olExplorer = document.getElementById('openlibrary-explorer');
        const localWrapper = document.getElementById('local-catalog-wrapper');
        if (olExplorer) olExplorer.style.display = 'none';
        if (localWrapper) localWrapper.style.display = 'block';

        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    }

    // Random Book Button
    document.getElementById('btn-random-book')?.addEventListener('click', () => {
      const allBooks = window.bookRelay.getAllBooks();
      if (!allBooks || allBooks.length === 0) return;
      const randomBook = allBooks[Math.floor(Math.random() * allBooks.length)];
      if (randomBook) {
        if (window.soundEngine) window.soundEngine.playLevelUp();
        this.showToast(`🎲 Выбор Судьбы: «${randomBook.title}» (${randomBook.author})!`, 'reward');
        this.openBookDetails(randomBook.id);
      }
    });
  }

  renderLibrary() {
    const grid = document.getElementById('books-catalog-grid');
    const counterEl = document.getElementById('remanga-books-found-count');
    const resetBtn = document.getElementById('btn-reset-remanga-filters');
    if (!grid) return;
    grid.innerHTML = '';

    const user = window.auth?.currentUser;
    const criteria = {
      search: this.searchQuery,
      query: this.searchQuery,
      genre: this.selectedCategory,
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

    const isFiltered = this.searchQuery || 
                       this.selectedCategory !== 'all' || 
                       this.selectedSort !== 'popular' || 
                       this.selectedStatus !== 'all' || 
                       this.selectedFormat !== 'all' || 
                       this.selectedDifficulty !== 'all';
    if (resetBtn) resetBtn.style.display = isFiltered ? 'inline-block' : 'none';

    if (displayBooks.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1rem; color: var(--text-muted); background: rgba(0,0,0,0.3); border-radius: var(--radius-lg); border: 1px dashed var(--border-glass);">
          <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔍</div>
          <h3 style="color:#fff; font-size:1.3rem; margin-bottom:0.5rem;">По вашим фильтрам ничего не найдено</h3>
          <p style="font-size:0.9rem; max-width:500px; margin:0 auto 1.2rem;">Попробуйте смягчить критерии поиска или сбросить фильтры.</p>
          <button class="btn btn-secondary btn-sm" onclick="document.getElementById('btn-reset-remanga-filters')?.click()">Сбросить фильтры</button>
        </div>
      `;
      return;
    }

    displayBooks.forEach((b) => {
      let rarityPillClass = 'rarity-pill-classic';
      if (b.rarity === 'legendary') rarityPillClass = 'rarity-pill-legendary';
      else if (b.rarity === 'masterpiece') rarityPillClass = 'rarity-pill-masterpiece';
      else if (b.rarity === 'epic') rarityPillClass = 'rarity-pill-epic';

      const card = document.createElement('div');
      card.className = `steam-book-card rarity-${b.rarity} tilt-card`;
      card.style.cursor = 'pointer';

      card.innerHTML = `
        <div class="book-cover-banner" style="background: ${b.coverStyle};">
          <img src="${b.coverImage}" class="book-cover-real-img" alt="${b.title}" onerror="this.src='https://covers.openlibrary.org/b/id/12818862-L.jpg'">
          <div class="book-badges-overlay">
            <span class="rarity-pill ${rarityPillClass}">${b.rarityLabel || 'ШЕДЕВР'}</span>
          </div>
        </div>
        <div class="steam-book-info">
          <h3 class="steam-book-title" title="${b.title}">${b.title}</h3>
          <p class="steam-book-author">✍ ${b.author} (${b.year})</p>
          <p class="steam-book-desc">${b.synopsis || b.quote}</p>
          <div class="steam-book-meta">
            <span class="book-genre-pill">${b.genre}</span>
            <span class="book-read-time">⭐ ${b.rating} | ${b.chapters ? b.chapters.length : 1} глав (~${b.lengthPages} стр.)</span>
          </div>
          <div style="margin-top: 0.8rem; display: flex; gap: 0.5rem;">
            <button class="btn btn-primary btn-block btn-open-card" data-book-id="${b.id}">
              ℹ️ Открыть карточку & Главы
            </button>
          </div>
        </div>
      `;

      // Clicking ANYWHERE on the card opens the full Book Dossier modal
      card.addEventListener('click', () => {
        this.openBookDetails(b.id);
      });

      grid.appendChild(card);
    });

    this.bindTiltEffect();
  }

  // --- BOOK DOSSIER MODAL & REVIEWS ---

  bindBookDetailsModal() {
    document.getElementById('btn-toggle-add-review')?.addEventListener('click', () => {
      const box = document.getElementById('add-review-box');
      if (box) box.style.display = box.style.display === 'none' ? 'block' : 'none';
    });
  }

  openBookDetails(bookId) {
    const book = window.bookRelay.getBookById(bookId);
    if (!book) return;

    this.activeDossierBookId = bookId;

    document.getElementById('book-modal-title').textContent = book.title;
    document.getElementById('book-modal-cover').src = book.coverImage;
    document.getElementById('book-modal-author').textContent = `Автор: ${book.author} (${book.year})`;
    document.getElementById('book-modal-genre').textContent = book.genre;
    document.getElementById('book-modal-rating').textContent = `⭐ ${book.rating} (${book.ratingCount || 100}+ оценок)`;
    document.getElementById('book-modal-pages').textContent = `~${book.lengthPages} стр. (${book.wordsCount?.toLocaleString()} слов)`;
    document.getElementById('book-modal-difficulty').textContent = book.difficulty;
    document.getElementById('book-modal-year').textContent = book.year;
    document.getElementById('book-modal-synopsis').textContent = book.synopsis;

    const rarityPill = document.getElementById('book-modal-rarity-pill');
    if (rarityPill) {
      rarityPill.className = `rarity-pill ${book.rarity === 'legendary' ? 'rarity-pill-legendary' : book.rarity === 'masterpiece' ? 'rarity-pill-masterpiece' : 'rarity-pill-epic'}`;
      rarityPill.textContent = book.rarityLabel || 'ШЕДЕВР';
    }

    // Chapters Table of Contents
    const tocEl = document.getElementById('book-modal-chapters-toc');
    if (tocEl) {
      const chapters = book.chapters || [];
      if (chapters.length > 0) {
        tocEl.innerHTML = `
          <div style="background: rgba(0,0,0,0.35); border: 1px solid var(--border-glass); border-radius: var(--radius-md); padding: 0.8rem 1rem;">
            <div style="font-size:0.75rem; text-transform:uppercase; letter-spacing:0.8px; color:var(--accent-cyan); font-weight:800; margin-bottom:0.5rem; display:flex; justify-content:space-between;">
              <span>📚 Содержание произведения</span>
              <span>${chapters.length} глав(ы)</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:0.35rem; max-height:130px; overflow-y:auto; padding-right:0.3rem;">
              ${chapters.map((ch, idx) => `
                <div class="toc-chapter-item" data-chapter-idx="${idx}" style="display:flex; justify-content:space-between; align-items:center; padding:0.35rem 0.6rem; background:rgba(255,255,255,0.03); border-radius:4px; font-size:0.82rem; color:#ddd; cursor:pointer; transition:background 0.2s ease;">
                  <span style="font-weight:600;">${ch.title}</span>
                  <span style="font-size:0.72rem; color:var(--text-dim);">Гл. ${idx + 1} →</span>
                </div>
              `).join('')}
            </div>
          </div>
        `;
        tocEl.querySelectorAll('.toc-chapter-item').forEach(item => {
          item.addEventListener('mouseenter', () => item.style.background = 'rgba(0, 240, 255, 0.12)');
          item.addEventListener('mouseleave', () => item.style.background = 'rgba(255, 255, 255, 0.03)');
          item.addEventListener('click', () => {
            const chIdx = parseInt(item.dataset.chapterIdx) || 0;
            this.closeAllModals();
            window.readerEngine.openBook(book.id, chIdx, 'page');
          });
        });
      } else {
        const providerName = book.relaySource?.provider === 'archive' ? 'Internet Archive' : 'Викитека (Wikisource)';
        tocEl.innerHTML = `
          <div style="background: rgba(0,0,0,0.35); border: 1px dashed rgba(0, 240, 255, 0.3); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-size:0.78rem; font-weight:700; color:var(--accent-cyan);">📡 Живая потоковая ретрансляция</div>
              <div style="font-size:0.74rem; color:var(--text-muted); margin-top:2px;">Подлинный текст подкачивается из <strong>${providerName}</strong> в память при чтении</div>
            </div>
            <span class="pulse-dot"></span>
          </div>
        `;
      }
    }

    // Read buttons
    const readMangaBtn = document.getElementById('btn-modal-read-manga');
    if (readMangaBtn) {
      readMangaBtn.onclick = () => {
        this.closeAllModals();
        window.readerEngine.openBook(book.id, 0, 'manga');
      };
    }

    const readPageBtn = document.getElementById('btn-modal-read-page');
    if (readPageBtn) {
      readPageBtn.onclick = () => {
        this.closeAllModals();
        window.readerEngine.openBook(book.id, 0, 'page');
      };
    }

    const favBtn = document.getElementById('btn-modal-toggle-fav');
    if (favBtn) {
      favBtn.onclick = () => {
        const user = window.auth.currentUser;
        if (!user) { this.openModal('modal-auth'); return; }
        const isFav = window.bookRelay.toggleFavorite(user.username, book.id);
        favBtn.textContent = isFav ? '❤️ В избранном' : '🤍 В избранное';
        this.showToast(isFav ? '❤️ Добавлено в избранное!' : 'Удалено из избранного', 'info');
      };
    }

    // Review submit
    const submitBtn = document.getElementById('btn-submit-review');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const user = window.auth.currentUser;
        if (!user) { this.openModal('modal-auth'); return; }

        const textEl = document.getElementById('new-review-text');
        const ratingEl = document.getElementById('new-review-rating');
        const text = textEl?.value.trim();
        if (!text) return;

        const newReview = {
          id: 'rev_' + Date.now(),
          author: user.displayName || user.username,
          avatar: user.avatar || '📖',
          date: 'Только что',
          rating: parseInt(ratingEl.value),
          text: text
        };

        window.bookRelay.addReview(book.id, newReview);
        window.auth.addXp(30);
        window.auth.addLumens(15);
        this.showToast('💬 Рецензия опубликована! +30 XP, +15 ⬡', 'reward');
        if (textEl) textEl.value = '';
        document.getElementById('add-review-box').style.display = 'none';
        this.renderBookReviews(book.id);
      };
    }

    this.renderBookReviews(book.id);
    this.openModal('modal-book-details');
  }

  renderBookReviews(bookId) {
    const list = document.getElementById('book-modal-reviews-list');
    if (!list) return;
    list.innerHTML = '';

    const reviews = window.bookRelay.getReviews(bookId);
    if (reviews.length === 0) {
      list.innerHTML = '<div style="color:var(--text-muted); font-size:0.88rem; padding:1rem 0;">Пока нет отзывов. Будьте первым, кто поделится размышлениями!</div>';
      return;
    }

    reviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.innerHTML = `
        <div class="review-author-row">
          <div style="display:flex; align-items:center; gap:0.5rem; font-weight:700; color:#fff;">
            <span>${r.avatar || '📖'}</span>
            <span>${r.author}</span>
            <span style="font-size:0.75rem; color:var(--text-dim); font-weight:normal;">• ${r.date}</span>
          </div>
          <div class="review-stars">${'⭐'.repeat(r.rating || 5)}</div>
        </div>
        <div style="font-size:0.9rem; color:#ddd; line-height:1.5;">${r.text}</div>
      `;
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
          <img src="${b.coverImage || 'https://covers.openlibrary.org/b/id/12818862-L.jpg'}" class="book-cover-real-img" alt="${b.title}">
          <div class="book-badges-overlay">
            <span class="rarity-pill rarity-pill-epic">Open Library</span>
          </div>
        </div>
        <div class="steam-book-info">
          <h3 class="steam-book-title">${b.title}</h3>
          <p class="steam-book-author">✍ ${b.author} (${b.year})</p>
          <p class="steam-book-desc">${b.synopsis}</p>
          <div class="steam-book-meta">
            <span class="book-genre-pill">${b.genre}</span>
            <span class="book-read-time">~${b.lengthPages} стр.</span>
          </div>
          <div style="margin-top: 0.8rem;">
            <button class="btn btn-primary btn-block btn-stream-read">
              📖 Читать ретрансляцию (Manga-Scroll)
            </button>
          </div>
        </div>
      `;
      card.querySelector('.btn-stream-read')?.addEventListener('click', () => {
        window.bookRelay.relayedCatalog.unshift(b);
        window.readerEngine.openBook(b.id, 0, 'manga');
      });
      grid.appendChild(card);
    });

    this.bindTiltEffect();
  }

  // --- REBUILT GAMER & SCHOLAR PROFILE ---

  renderProfile() {
    const user = window.auth.currentUser;
    if (!user) {
      this.openModal('modal-auth');
      return;
    }

    const shelves = window.bookRelay.getUserShelves(user.username);

    // Profile header
    const wrap = document.getElementById('profile-avatar-wrap');
    if (wrap) {
      wrap.className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-gold'}`;
      wrap.innerHTML = `<div class="avatar-inner">${user.avatar || '📖'}</div>`;
    }

    document.getElementById('profile-display-name').textContent = user.displayName || user.username;
    document.getElementById('profile-username-tag').textContent = `@${user.username}`;
    document.getElementById('profile-level-num').textContent = user.level;

    const neededXp = user.level * 400;
    const currentXp = user.xp || 0;
    const percent = Math.min(100, Math.round((currentXp / neededXp) * 100));
    document.getElementById('profile-xp-text').textContent = `${currentXp} / ${neededXp} XP (${percent}%)`;
    document.getElementById('profile-xp-fill').style.width = `${percent}%`;

    // Calculate Dynamic Genre Title & Justification
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

    const titleTagEl = document.getElementById('profile-title-tag');
    if (titleTagEl) {
      titleTagEl.innerHTML = `<span class="rarity-pill rarity-pill-legendary">${genreRankTitle}</span>`;
    }

    const justTextEl = document.getElementById('profile-rank-justification-text');
    if (justTextEl) justTextEl.textContent = genreJustification;

    const rankBooksList = document.getElementById('profile-rank-books-list');
    if (rankBooksList) {
      rankBooksList.innerHTML = '';
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

    // Meaningful Stats
    document.getElementById('stat-yearly-goal').textContent = `${shelves.completedThisYear} / ${shelves.yearlyGoal} книг`;
    document.getElementById('stat-useful-books').textContent = `${shelves.usefulBooksCount} книг`;
    document.getElementById('stat-pages-read').textContent = `${(shelves.completedThisYear * 450 + 240).toLocaleString()} стр.`;
    document.getElementById('stat-reviews-count').textContent = '4 рецензии';
    document.getElementById('stat-lumens').textContent = `${user.lumens || 0} ⬡`;

    // Editable status motto
    const mottoEl = document.getElementById('profile-user-status');
    if (mottoEl) {
      mottoEl.textContent = user.motto || '«В книгах ищу то, чего не хватает в реальности...» ✎';
      mottoEl.onclick = () => {
        const next = prompt('Введите ваш статус / читательский девиз:', user.motto || '');
        if (next !== null && next.trim()) {
          user.motto = next.trim();
          window.auth.saveUser();
          mottoEl.textContent = `«${user.motto}» ✎`;
          this.showToast('Девиз профиля обновлен!', 'success');
        }
      };
    }

    // Shelf 1: Reading Now
    const readingNowGrid = document.getElementById('profile-shelf-reading-now');
    if (readingNowGrid) {
      readingNowGrid.innerHTML = '';
      if (!shelves.readingNow.length) {
        readingNowGrid.innerHTML = '<div style="color:var(--text-muted); font-size:0.85rem;">Нет активных книг. Выберите книгу на витрине!</div>';
      } else {
        shelves.readingNow.forEach(item => {
          const b = window.bookRelay.getBookById(item.id);
          if (b) {
            const card = document.createElement('div');
            card.className = 'shelf-book-card';
            card.innerHTML = `
              <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}">
              <div class="shelf-book-title">${b.title}</div>
              <div class="shelf-book-progress-bar">
                <div class="shelf-book-progress-fill" style="width: ${item.progressPercent}%;"></div>
              </div>
              <div style="font-size:0.75rem; color:var(--text-dim); display:flex; justify-content:space-between;">
                <span>Прогресс:</span> <strong>${item.progressPercent}%</strong>
              </div>
              <button class="btn btn-primary btn-sm btn-continue-reading" data-book-id="${b.id}" style="margin-top:0.4rem;">
                Продолжить →
              </button>
            `;
            card.querySelector('.btn-continue-reading')?.addEventListener('click', () => {
              window.readerEngine.openBook(b.id, item.chapterIdx || 0, 'manga');
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
      shelves.favorites.forEach(bookId => {
        const b = window.bookRelay.getBookById(bookId);
        if (b) {
          const card = document.createElement('div');
          card.className = 'shelf-book-card';
          card.innerHTML = `
            <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}">
            <div class="shelf-book-title">${b.title}</div>
            <div style="font-size:0.75rem; color:var(--accent-cyan);">${b.author}</div>
            <button class="btn btn-secondary btn-sm" onclick="window.app.openBookDetails('${b.id}')" style="margin-top:0.4rem;">
              Карточка
            </button>
          `;
          favGrid.appendChild(card);
        }
      });
    }

    // Shelf 3: Completed
    const compGrid = document.getElementById('profile-shelf-completed');
    if (compGrid) {
      compGrid.innerHTML = '';
      shelves.completed.forEach(item => {
        const b = window.bookRelay.getBookById(item.id);
        if (b) {
          const card = document.createElement('div');
          card.className = 'shelf-book-card';
          card.innerHTML = `
            <img src="${b.coverImage}" class="shelf-book-cover" alt="${b.title}">
            <div class="shelf-book-title">${b.title}</div>
            <div style="font-size:0.75rem; color:var(--accent-green);">✓ Завершено (${item.completedDate})</div>
          `;
          compGrid.appendChild(card);
        }
      });
    }

    // Badges Showcase
    const badgesGrid = document.getElementById('profile-badges-grid');
    if (badgesGrid) {
      badgesGrid.innerHTML = '';
      const allBadges = window.dbEngine.getBadges();
      allBadges.forEach((b) => {
        const has = user.badges?.includes(b.id);
        const el = document.createElement('div');
        el.className = `profile-badge-card ${has ? 'unlocked' : 'locked'}`;
        el.innerHTML = `
          <div class="profile-badge-icon">${b.icon}</div>
          <div class="profile-badge-name">${b.name}</div>
          <div class="profile-badge-desc">${b.description}</div>
          <div class="profile-badge-status">${has ? '✓ ПОЛУЧЕНО' : '🔒 ЗАКРЫТО'}</div>
        `;
        badgesGrid.appendChild(el);
      });
    }

    this.bindTiltEffect();
  }

  // --- INTERACTIVE THEME PALETTE (COLOR CIRCLES PREVIEW) ---

  bindThemePalette() {
    const container = document.getElementById('theme-picker-container');
    const triggerBtn = document.getElementById('btn-theme-picker-trigger');
    const dot = document.getElementById('current-theme-dot');

    const themeGradients = {
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
      'theme-cyberpunk': 'Киберпанк',
      'theme-cosmic': 'Космос',
      'theme-amber': 'Янтарь',
      'theme-matrix': 'Матрица',
      'theme-royal': 'Аврора',
      'theme-synthwave': 'Синтвейв',
      'theme-ocean': 'Океан',
      'theme-zen': 'Дзен'
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

    // Initialize UI with active theme
    const activeTheme = window.reactiveBg ? window.reactiveBg.currentTheme : 'theme-cyberpunk';
    updateActiveThemeUI(activeTheme);

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
        if (container) container.classList.remove('open');

        window.dbEngine.updateQuestProgress('quest_change_theme', 1);
        this.renderDailyQuests();

        this.showToast(`🎨 Выбрана атмосфера: ${themeNames[themeId] || themeId}`, 'info');
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
        btnHTML = '<span class="quest-btn-claimed">✓ Получено</span>';
      } else if (q.completed) {
        btnHTML = `<button class="btn btn-primary btn-sm btn-claim-quest" data-quest-id="${q.id}">🎁 Забрать +${q.rewardLumens} ⬡</button>`;
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
            if (window.soundEngine) window.soundEngine.playLevelUp();
            this.renderDailyQuests();
          }
        });
      }

      container.appendChild(card);
    });
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

    // Auth Tabs
    document.getElementById('tab-btn-login')?.addEventListener('click', () => {
      document.getElementById('tab-btn-login').classList.add('active');
      document.getElementById('tab-btn-register').classList.remove('active');
      document.getElementById('auth-form-login').style.display = 'block';
      document.getElementById('auth-form-register').style.display = 'none';
    });

    document.getElementById('tab-btn-register')?.addEventListener('click', () => {
      document.getElementById('tab-btn-register').classList.add('active');
      document.getElementById('tab-btn-login').classList.remove('active');
      document.getElementById('auth-form-register').style.display = 'block';
      document.getElementById('auth-form-login').style.display = 'none';
    });

    document.getElementById('auth-form-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-password').value;
      const res = window.auth.login(u, p);
      if (res.success) {
        this.closeAllModals();
        this.showToast(`Добро пожаловать, ${res.user.displayName}!`, 'success');
      } else {
        this.showToast(res.message, 'error');
      }
    });

    document.getElementById('auth-form-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('reg-username').value;
      const d = document.getElementById('reg-display-name').value;
      const p = document.getElementById('reg-password').value;
      const a = document.querySelector('input[name="reg-avatar"]:checked')?.value || '📖';

      const res = window.auth.register(u, d, p, a);
      if (res.success) {
        this.closeAllModals();
        this.showToast(`Регистрация успешна! Задайте ваши литературные вкусы:`, 'reward');
        this.openModal('modal-taste-onboarding');
      } else {
        this.showToast(res.message, 'error');
      }
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

      let rafId = null;
      let targetX = 0, targetY = 0;
      let currentX = 0, currentY = 0;

      const update = () => {
        currentX += (targetX - currentX) * 0.15;
        currentY += (targetY - currentY) * 0.15;
        card.style.transform = `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg)`;
        if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
          rafId = requestAnimationFrame(update);
        } else {
          rafId = null;
        }
      };

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        targetX = (y / (rect.height / 2)) * -3.5;
        targetY = (x / (rect.width / 2)) * 3.5;
        if (!rafId) rafId = requestAnimationFrame(update);
      });

      card.addEventListener('mouseleave', () => {
        targetX = 0;
        targetY = 0;
        if (!rafId) rafId = requestAnimationFrame(update);
      });
    });
  }

  bindMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      if (btn._magneticInitialized) return;
      btn._magneticInitialized = true;

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  bindAudioTriggers() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .genre-pill, .carousel-arrow, .shop-item-card');
      if (btn && window.soundEngine) window.soundEngine.playClick();
    });
  }

  updateAudioButtonState() {
    const btn = document.getElementById('btn-toggle-sfx');
    if (!btn) return;
    btn.textContent = window.soundEngine.isMuted ? '🔇' : '🔊';
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
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

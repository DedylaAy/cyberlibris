/**
 * CyberLibris Reader & RSVP Speed Reading Suite
 */
class ReaderEngine {
  constructor() {
    this.currentBook = null;
    this.currentChapterIdx = 0;
    this.readTimer = null;
    this.readSeconds = 0;

    // RSVP Speed Reader State
    this.rsvpWords = [];
    this.rsvpIdx = 0;
    this.rsvpInterval = null;
    this.rsvpWpm = 350;
    this.isRsvpPlaying = false;
  }

  init() {
    this.bindEvents();
    this.setupScrollTracker();
  }

  bindEvents() {
    // Font Size Controls
    document.getElementById('btn-font-dec')?.addEventListener('click', () => this.adjustFontSize(-2));
    document.getElementById('btn-font-inc')?.addEventListener('click', () => this.adjustFontSize(2));

    // Manga vs Page mode toggle
    document.getElementById('btn-toggle-manga-mode')?.addEventListener('click', () => this.toggleReadingMode());

    // Reader Themes
    document.querySelectorAll('.btn-reader-theme').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.setReaderTheme(theme);
      });
    });

    // Font Family
    document.getElementById('reader-font-select')?.addEventListener('change', (e) => {
      const body = document.getElementById('reader-body-content');
      if (body) body.style.fontFamily = e.target.value;
    });

    // Ambient Audio Toggles
    document.querySelectorAll('.ambient-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const soundType = e.currentTarget.dataset.sound;
        document.querySelectorAll('.ambient-chip').forEach((c) => c.classList.remove('active'));
        const playing = window.soundEngine.playAmbient(soundType);
        if (playing) {
          e.currentTarget.classList.add('active');
          window.app.showToast(`🎧 Фоновый звук: ${e.currentTarget.textContent}`, 'info');
        }
      });
    });

    // RSVP Speed Reader trigger
    document.getElementById('btn-start-rsvp')?.addEventListener('click', () => this.openRsvpModal());
    document.getElementById('btn-rsvp-play')?.addEventListener('click', () => this.toggleRsvp());
    document.getElementById('btn-rsvp-prev')?.addEventListener('click', () => this.seekRsvp(-15));
    document.getElementById('btn-rsvp-next')?.addEventListener('click', () => this.seekRsvp(15));
    document.getElementById('btn-close-rsvp')?.addEventListener('click', () => this.closeRsvpModal());

    const wpmSlider = document.getElementById('rsvp-wpm-slider');
    if (wpmSlider) {
      wpmSlider.addEventListener('input', (e) => {
        this.rsvpWpm = parseInt(e.target.value);
        document.getElementById('rsvp-wpm-val').textContent = `${this.rsvpWpm} WPM`;
        if (this.isRsvpPlaying) {
          this.pauseRsvp();
          this.playRsvp();
        }
      });
    }

    // Add Bookmark button
    document.getElementById('btn-add-bookmark')?.addEventListener('click', () => this.createBookmark());
  }

  setupScrollTracker() {
    window.addEventListener('scroll', () => {
      if (!this.currentBook || !document.getElementById('view-reader')?.classList.contains('active')) return;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollHeight) * 100)));

      const fill = document.getElementById('reading-progress-fill');
      const valText = document.getElementById('reading-progress-percent');
      if (fill) fill.style.width = `${progress}%`;
      if (valText) valText.textContent = `${progress}%`;

      const user = window.auth?.currentUser;
      if (user && window.bookRelay) {
        window.bookRelay.updateProgress(user.username, this.currentBook.id, progress, this.currentChapterIdx);
      }
    });
  }

  async openBook(bookId, chapterIdx = 0, initialMode = 'manga') {
    let book = window.bookRelay ? window.bookRelay.getBookById(bookId) : null;
    if (!book && window.dbEngine) book = window.dbEngine.getBook(bookId);
    if (!book) return;

    this.currentBook = book;
    this.currentChapterIdx = chapterIdx;
    this.readingMode = initialMode;

    const user = window.auth?.currentUser;
    if (user && window.bookRelay) {
      window.bookRelay.setReadingNow(user.username, book.id);
    }

    // Заполняем заголовок читального зала
    const titleEl = document.getElementById('reader-book-title');
    const authorEl = document.getElementById('reader-book-author');
    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = book.author;

    const modeBtn = document.getElementById('btn-toggle-manga-mode');
    if (modeBtn) {
      modeBtn.innerHTML = this.readingMode === 'manga' ? '📜 Режим: Лента (Манга-скролл)' : '📖 Режим: По главам';
    }

    // Немедленно открываем экран читателя
    window.app.switchView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Проверяем, нужно ли ретранслировать текст книги в реальном времени
    if (!book.chapters || book.chapters.length === 0) {
      this.renderStreamingLoader();
      const streamRes = await window.bookRelay.streamBook(book.id);
      if (!streamRes || !book.chapters || book.chapters.length === 0) {
        this.renderStreamingError();
        return;
      }
    }

    this.updateRelayBadge();
    this.updateChapterDropdown();
    this.renderContent();

    // Запускаем трекер чтения
    this.startReadingTracker();
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  renderStreamingLoader() {
    const bodyEl = document.getElementById('reader-body-content');
    const chapterEl = document.getElementById('reader-chapter-title');
    const selectEl = document.getElementById('reader-chapter-select');
    if (selectEl) selectEl.style.display = 'none';
    if (chapterEl) chapterEl.textContent = '📡 Подключение к каналу потоковой ретрансляции...';
    if (!bodyEl) return;
    
    const providerName = this.currentBook?.relaySource?.provider === 'archive' 
      ? 'Internet Archive (archive.org)' 
      : 'Викитека — Свободная библиотека (ru.wikisource.org)';

    bodyEl.className = 'reader-streaming-mode';
    bodyEl.innerHTML = `
      <div class="relay-stream-loader-box">
        <div class="relay-radar-circle">
          <span class="relay-radar-icon">📡</span>
        </div>
        <h3 class="relay-stream-headline">ПОТОКОВАЯ РЕТРАНСЛЯЦИЯ В РЕАЛЬНОМ ВРЕМЕНИ</h3>
        <p class="relay-stream-subline">Установка прямого сетевого моста с открытым фондом мировой классики...</p>
        <div class="relay-stream-meter">
          <div class="relay-stream-meter-glow"></div>
        </div>
        <div class="relay-stream-source-info">
          🌐 Внешний источник: <strong>${providerName}</strong>
        </div>
        <div class="relay-stream-policy-badge">
          🛡️ <strong>Zero-Storage Protocol:</strong> На сервере книги не сохраняются. Подлинный текст передается потоком напрямую в оперативную память браузера.
        </div>
      </div>
    `;
  }

  renderStreamingError() {
    const bodyEl = document.getElementById('reader-body-content');
    const chapterEl = document.getElementById('reader-chapter-title');
    if (chapterEl) chapterEl.textContent = '⚠️ Ошибка ретрансляции книги';
    if (!bodyEl) return;
    bodyEl.innerHTML = `
      <div class="relay-stream-error-box">
        <div style="font-size: 3.5rem; margin-bottom: 1rem;">🛰️</div>
        <h3>Не удалось завершить потоковую передачу</h3>
        <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Внешний библиотечный сервер временно недоступен или ограничил поток. Проверьте соединение и повторите попытку.</p>
        <button class="btn btn-primary" onclick="window.readerEngine.openBook('${this.currentBook?.id}')">🔄 Повторить попытку ретрансляции</button>
      </div>
    `;
  }

  updateRelayBadge() {
    const headerRow = document.querySelector('.reader-book-header .reader-meta-row');
    if (!headerRow) return;
    let badge = document.getElementById('reader-relay-source-badge');
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'reader-relay-source-badge';
      badge.className = 'relay-live-badge';
      headerRow.appendChild(badge);
    }
    const sourceName = this.currentBook.relaySourceName || 'Викитека (Wikisource)';
    const sourceUrl = this.currentBook.relaySourceUrl || `https://ru.wikisource.org/wiki/${encodeURIComponent(this.currentBook.title)}`;
    badge.innerHTML = `<span class="pulse-dot"></span> 📡 Ретранслировано из: <a href="${sourceUrl}" target="_blank" rel="noopener">${sourceName} ↗</a>`;
  }

  updateChapterDropdown() {
    const selectEl = document.getElementById('reader-chapter-select');
    if (!selectEl || !this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    if (chapters.length > 1) {
      selectEl.style.display = 'inline-block';
      selectEl.innerHTML = chapters.map((ch, idx) => `
        <option value="${idx}" ${idx === this.currentChapterIdx ? 'selected' : ''}>${ch.title}</option>
      `).join('');
    } else {
      selectEl.style.display = 'none';
    }
  }

  jumpToChapter(idx) {
    if (!this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    if (idx >= 0 && idx < chapters.length) {
      this.currentChapterIdx = idx;
      if (this.readingMode === 'manga') {
        const el = document.getElementById(`chapter-block-${idx}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        this.renderContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  toggleReadingMode() {
    this.readingMode = this.readingMode === 'manga' ? 'page' : 'manga';
    const modeBtn = document.getElementById('btn-toggle-manga-mode');
    if (modeBtn) {
      modeBtn.innerHTML = this.readingMode === 'manga' ? '📜 Режим: Лента (Манга-скролл)' : '📖 Режим: По главам';
    }
    this.renderContent();
    window.app.showToast(this.readingMode === 'manga' ? 'Включен режим непрерывной ленты (скролл как манга)' : 'Включен постраничный режим', 'info');
  }

  renderContent() {
    if (!this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    const bodyEl = document.getElementById('reader-body-content');
    const navControls = document.getElementById('reader-chapter-nav');
    const chapterEl = document.getElementById('reader-chapter-title');
    const selectEl = document.getElementById('reader-chapter-select');

    if (!bodyEl) return;
    if (selectEl) selectEl.value = this.currentChapterIdx;

    if (this.readingMode === 'manga') {
      if (chapterEl) chapterEl.textContent = `Непрерывная лента (${chapters.length} глав)`;
      if (navControls) navControls.style.display = 'none';

      bodyEl.className = 'reader-manga-mode';
      bodyEl.innerHTML = chapters.map((ch, idx) => `
        <div class="manga-chapter-block" id="chapter-block-${idx}">
          <div class="manga-chapter-title">${ch.title}</div>
          <div class="manga-chapter-text">${ch.content.split('\n\n').filter((p) => p.trim()).map((p) => `<p>${p}</p>`).join('')}</div>
        </div>
      `).join('');
    } else {
      if (navControls) navControls.style.display = 'flex';
      const chapter = chapters[this.currentChapterIdx] || { title: 'Глава 1', content: 'Текст отсутствует.' };
      if (chapterEl) chapterEl.textContent = chapter.title;

      bodyEl.className = 'reader-page-mode';
      bodyEl.innerHTML = chapter.content
        .split('\n\n')
        .filter((p) => p.trim())
        .map((p) => `<p>${p}</p>`)
        .join('');

      const prevBtn = document.getElementById('btn-prev-chapter');
      const nextBtn = document.getElementById('btn-next-chapter');
      if (prevBtn) prevBtn.disabled = this.currentChapterIdx <= 0;
      if (nextBtn) nextBtn.disabled = this.currentChapterIdx >= chapters.length - 1;
    }
  }

  nextChapter() {
    if (this.currentBook && this.currentChapterIdx < (this.currentBook.chapters?.length || 0) - 1) {
      this.currentChapterIdx += 1;
      this.renderContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevChapter() {
    if (this.currentBook && this.currentChapterIdx > 0) {
      this.currentChapterIdx -= 1;
      this.renderContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  startReadingTracker() {
    clearInterval(this.readTimer);
    this.readSeconds = 0;
    this.readTimer = setInterval(() => {
      if (!document.getElementById('view-reader')?.classList.contains('active')) {
        clearInterval(this.readTimer);
        return;
      }
      this.readSeconds += 1;
      // Award rewards every 60 seconds of active reading
      if (this.readSeconds % 60 === 0) {
        window.auth.addLumens(15);
        window.auth.addXp(40);
        window.auth.updateStat('readTimeMinutes', 1);
        if (window.dbEngine) {
          window.dbEngine.updateQuestProgress('quest_read_2min', 1);
          if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
        }
        window.app.showToast('📖 Чтение вознаграждено: +15 ⬡, +40 XP!', 'reward');
        if (window.soundEngine) window.soundEngine.playClick();
      }
    }, 1000);
  }

  adjustFontSize(delta) {
    const el = document.getElementById('reader-body-content');
    if (!el) return;
    const current = parseInt(window.getComputedStyle(el).fontSize) || 18;
    const next = Math.max(13, Math.min(32, current + delta));
    el.style.fontSize = `${next}px`;
  }

  setReaderTheme(themeName) {
    const container = document.getElementById('reader-container-box');
    if (!container) return;
    container.className = `reader-container theme-${themeName}`;
    document.querySelectorAll('.btn-reader-theme').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === themeName);
    });
  }

  createBookmark() {
    if (!this.currentBook) return;
    const selection = window.getSelection().toString().trim();
    const snippet = selection ? `"${selection.substring(0, 80)}..."` : `Глава: ${this.currentBook.chapters[this.currentChapterIdx]?.title}`;

    const note = prompt('Добавьте заметку к закладке (необязательно):', '');
    const bookmark = {
      id: 'bm_' + Date.now(),
      bookId: this.currentBook.id,
      chapterId: this.currentChapterIdx,
      textSnippet: snippet,
      note: note || 'Без заметки',
      createdAt: new Date().toISOString()
    };

    if (!window.auth.currentUser.bookmarks) window.auth.currentUser.bookmarks = [];
    window.auth.currentUser.bookmarks.push(bookmark);
    window.auth.saveUser();

    window.app.showToast('🔖 Закладка успешно сохранена!', 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }

  // --- RSVP SPEED READING (SPRITZ) ---

  openRsvpModal() {
    const bodyEl = document.getElementById('reader-body-content');
    if (!bodyEl) return;
    const rawText = bodyEl.innerText;
    this.rsvpWords = rawText.match(/\S+/g) || ['Текст', 'отсутствует'];
    this.rsvpIdx = 0;

    const modal = document.getElementById('rsvp-modal');
    if (modal) modal.classList.add('active');

    this.renderRsvpWord();
    this.playRsvp();
  }

  closeRsvpModal() {
    this.pauseRsvp();
    const modal = document.getElementById('rsvp-modal');
    if (modal) modal.classList.remove('active');
  }

  toggleRsvp() {
    if (this.isRsvpPlaying) {
      this.pauseRsvp();
    } else {
      this.playRsvp();
    }
  }

  playRsvp() {
    this.isRsvpPlaying = true;
    const playBtn = document.getElementById('btn-rsvp-play');
    if (playBtn) playBtn.innerHTML = '⏸ Пауза';

    const delay = (60 / this.rsvpWpm) * 1000;
    clearInterval(this.rsvpInterval);
    this.rsvpInterval = setInterval(() => {
      if (this.rsvpIdx >= this.rsvpWords.length) {
        this.pauseRsvp();
        window.auth.updateStat('speedRecordWPM', this.rsvpWpm, true);
        window.auth.addLumens(30);
        window.auth.addXp(80);
        window.app.showToast(`⚡ Скорочтение завершено (${this.rsvpWpm} WPM)! +30 ⬡, +80 XP`, 'reward');
        return;
      }
      this.renderRsvpWord();
      this.rsvpIdx++;
    }, delay);
  }

  pauseRsvp() {
    this.isRsvpPlaying = false;
    clearInterval(this.rsvpInterval);
    const playBtn = document.getElementById('btn-rsvp-play');
    if (playBtn) playBtn.innerHTML = '▶ Старт';
  }

  seekRsvp(delta) {
    this.rsvpIdx = Math.max(0, Math.min(this.rsvpWords.length - 1, this.rsvpIdx + delta));
    this.renderRsvpWord();
  }

  renderRsvpWord() {
    const word = this.rsvpWords[this.rsvpIdx] || '';
    const len = word.length;
    // Calculate Optimal Recognition Point (approx 35%)
    let orpIdx = 0;
    if (len <= 1) orpIdx = 0;
    else if (len <= 5) orpIdx = 1;
    else if (len <= 9) orpIdx = 2;
    else orpIdx = 3;

    const prefix = word.substring(0, orpIdx);
    const orp = word[orpIdx] || '';
    const suffix = word.substring(orpIdx + 1);

    document.getElementById('rsvp-prefix').textContent = prefix;
    document.getElementById('rsvp-orp').textContent = orp;
    document.getElementById('rsvp-suffix').textContent = suffix;

    const progressPercent = Math.round((this.rsvpIdx / this.rsvpWords.length) * 100);
    const progressEl = document.getElementById('rsvp-progress-text');
    if (progressEl) progressEl.textContent = `${progressPercent}% (${this.rsvpIdx}/${this.rsvpWords.length})`;
  }
}

window.readerEngine = new ReaderEngine();

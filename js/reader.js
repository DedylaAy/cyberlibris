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
      const article = document.querySelector('.reader-article');
      if (!article || !document.getElementById('view-reader')?.classList.contains('active')) return;

      const rect = article.getBoundingClientRect();
      const totalHeight = article.offsetHeight - window.innerHeight;
      const progress = Math.min(100, Math.max(0, ((-rect.top) / totalHeight) * 100));

      const fill = document.getElementById('reading-progress-fill');
      if (fill) fill.style.width = `${progress}%`;
    });
  }

  openBook(bookId, chapterIdx = 0) {
    const book = window.dbEngine.getBook(bookId);
    if (!book) return;

    this.currentBook = book;
    this.currentChapterIdx = chapterIdx;

    const chapters = book.chapters || [];
    const chapter = chapters[chapterIdx] || { title: 'Глава 1', content: 'Текст отсутствует.' };

    // Fill UI
    document.getElementById('reader-book-title').textContent = book.title;
    document.getElementById('reader-book-author').textContent = book.author;
    document.getElementById('reader-chapter-title').textContent = chapter.title;

    // Render formatted paragraphs
    const bodyEl = document.getElementById('reader-body-content');
    bodyEl.innerHTML = chapter.content
      .split('\n\n')
      .filter((p) => p.trim())
      .map((p) => `<p>${p}</p>`)
      .join('');

    // Update navigation buttons
    const prevBtn = document.getElementById('btn-prev-chapter');
    const nextBtn = document.getElementById('btn-next-chapter');
    if (prevBtn) prevBtn.disabled = chapterIdx <= 0;
    if (nextBtn) nextBtn.disabled = chapterIdx >= chapters.length - 1;

    // Switch view
    window.app.switchView('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Start reading timer
    this.startReadingTracker();
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  nextChapter() {
    if (this.currentBook && this.currentChapterIdx < (this.currentBook.chapters?.length || 0) - 1) {
      this.openBook(this.currentBook.id, this.currentChapterIdx + 1);
    }
  }

  prevChapter() {
    if (this.currentBook && this.currentChapterIdx > 0) {
      this.openBook(this.currentBook.id, this.currentChapterIdx - 1);
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

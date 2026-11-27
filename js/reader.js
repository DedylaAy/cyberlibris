/**
 * CyberLibris Reader & RSVP Speed Reading Suite
 */

const DEFAULT_READER_COVER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 450' fill='%23111827'%3E%3Crect width='300' height='450' fill='%231b2838'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2366c0f4' font-size='64'%3E📖%3C/text%3E%3C/svg%3E";

const CLASSIC_LEXICON = {
  'кибитка': {
    title: 'Кибитка',
    meaning: 'Крытая дорожная повозка или сани на полозьях с парусиновым или войлочным верхом для дальних путешествий.',
    example: '«Ямщик сидит на облучке... Кибитка летит по рыхлому снегу.» — А. С. Пушкин',
    type: 'Исторический быт'
  },
  'верста': {
    title: 'Верста',
    meaning: 'Русская мера длины, равная 500 саженям (приблизительно 1,066 километра).',
    example: '«За версту было слышно дыхание метели в степи.»',
    type: 'Меры длины'
  },
  'асессор': {
    title: 'Коллежский асессор',
    meaning: 'Гражданский чин 8-го класса Табели о рангах в Российской империи, дававший право на потомственное дворянство.',
    example: '«Коллежский асессор Ковалёв проснулся довольно рано...» — Н. В. Гоголь',
    type: 'Табель о рангах'
  },
  'стратагема': {
    title: 'Стратагема',
    meaning: 'Стратегический замысел, скрытый тактический манёвр для достижения победы с минимальными потерями.',
    example: '«Война — это путь обмана. Удар наносится там, где враг не ожидает.» — Сунь-Цзы',
    type: 'Военная философия'
  },
  'яхонт': {
    title: 'Яхонт',
    meaning: 'Старинное название драгоценных корундов: червлёный (рубин) и лазоревый (сапфир).',
    example: '«Кольцо сверкало крупным яхонтом в золотом обрамлении.»',
    type: 'Драгоценности'
  },
  'денщик': {
    title: 'Денщик',
    meaning: 'Солдат, состоявший при офицере в качестве постоянного вестового и личного порученца.',
    example: '«Денщик зажег свечу и передал генералу пакет с донесением.»',
    type: 'Военный чин'
  },
  'десница': {
    title: 'Десница',
    meaning: 'Правая рука (высокий торжественный стиль); символ власти, правосудия или покровительства.',
    example: '«И десница судьбы простёрлась над полем брани.»',
    type: 'Архаизм'
  },
  'ланиты': {
    title: 'Ланиты',
    meaning: 'Щёки (поэтический архаизм XVIII—XIX веков).',
    example: '«Румянец юности играл на её нежных ланитах.»',
    type: 'Поэтизм'
  },
  'чело': {
    title: 'Чело',
    meaning: 'Лоб; в переносном значении — лицо или мысли («бить челом» — почтительно кланяться или просить).',
    example: '«На челе его лежала глубокая дума о судьбах отечества.»',
    type: 'Архаизм'
  },
  'фолиант': {
    title: 'Фолиант',
    meaning: 'Массивная книга большого формата (in-folio), старинный том в прочном кожаном переплете.',
    example: '«На полке стояли старинные фолианты по средневековой философии.»',
    type: 'Книговедение'
  },
  'симулякр': {
    title: 'Симулякр',
    meaning: 'Знак или образ, не имеющий оригинала в реальности; репрезентация отсутствующей сущности.',
    example: '«Цифровые симулякры заполнили неоновые улицы киберпространства.»',
    type: 'Киберпанк & Философия'
  },
  'бурбон': {
    title: 'Бурбон',
    meaning: 'Переносно: грубый, деспотичный, неотёсанный человек, самодур.',
    example: '«— Эх ты, бурбон! — с досадой произнёс полковник.»',
    type: 'Бытовой архаизм'
  },
  'кибернетика': {
    title: 'Кибернетика',
    meaning: 'Наука об общих закономерностях получения, хранения, передачи и преобразования информации в сложных системах.',
    example: '«Норберт Винер сформулировал фундаментальные законы кибернетики.»',
    type: 'Точные науки'
  },
  'морфин': {
    title: 'Морфий (Морфин)',
    meaning: 'Главный алкалоид опия, сильное анальгезирующее средство, порождающее зависимость.',
    example: '«Записки юного врача открывают драму борьбы разума и морфия.» — М. Булгаков',
    type: 'Медицина'
  },
  'шабаш': {
    title: 'Шабаш',
    meaning: 'Тайное ночное сборище нечистой силы и ведьм; шумно-разгульное пиршество.',
    example: '«И Маргарита устремилась в ночное небо навстречу шабашу.» — М. Булгаков',
    type: 'Мифология'
  }
};

class SpeechNarrator {
  constructor() {
    this.synth = window.speechSynthesis;
    this.utterance = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.rate = 1.0;
    this.voice = null;
    this.sentences = [];
    this.currentSentenceIdx = 0;
    this.initVoices();
  }

  initVoices() {
    if (!this.synth) return;
    const loadVoices = () => {
      const voices = this.synth.getVoices() || [];
      this.voice = voices.find(v => v.lang.startsWith('ru') || v.lang.includes('RU')) || voices[0] || null;
    };
    loadVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = loadVoices;
    }
  }

  start(text) {
    this.stop();
    if (!this.synth || !text) return;

    const clean = text.replace(/(\r\n|\n|\r)/gm, ' ').replace(/\s+/g, ' ');
    const parts = clean.match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/g) || [clean];
    this.sentences = parts.map(p => p.trim()).filter(p => p.length > 2);
    this.currentSentenceIdx = 0;
    this.isPlaying = true;
    this.isPaused = false;
    this.speakCurrentSentence();
  }

  speakCurrentSentence() {
    if (!this.isPlaying || this.currentSentenceIdx >= this.sentences.length) {
      this.stop();
      window.app?.showToast('Чтение главы завершено', 'info');
      return;
    }

    const sentence = this.sentences[this.currentSentenceIdx];
    this.utterance = new SpeechSynthesisUtterance(sentence);
    if (this.voice) this.utterance.voice = this.voice;
    this.utterance.rate = this.rate;

    this.utterance.onend = () => {
      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIdx++;
        this.speakCurrentSentence();
      }
    };

    this.utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      if (this.isPlaying && !this.isPaused) {
        this.currentSentenceIdx++;
        this.speakCurrentSentence();
      }
    };

    this.highlightSentence(sentence);
    this.synth.speak(this.utterance);
    this.updateUI();
  }

  highlightSentence(sentence) {
    const bodyEl = document.getElementById('reader-body-content');
    if (!bodyEl) return;
    bodyEl.querySelectorAll('.tts-speaking-highlight').forEach(el => el.classList.remove('tts-speaking-highlight'));
    const snippet = sentence.substring(0, 30).trim();
    if (!snippet) return;
    const paragraphs = bodyEl.querySelectorAll('p');
    for (const p of paragraphs) {
      if (p.textContent.includes(snippet)) {
        p.classList.add('tts-speaking-highlight');
        p.scrollIntoView({ behavior: 'smooth', block: 'center' });
        break;
      }
    }
  }

  toggle() {
    if (!this.synth) return;
    if (this.isPlaying && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
    } else if (this.isPlaying && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
    }
    this.updateUI();
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.isPaused = false;
    this.currentSentenceIdx = 0;
    const bodyEl = document.getElementById('reader-body-content');
    bodyEl?.querySelectorAll('.tts-speaking-highlight').forEach(el => el.classList.remove('tts-speaking-highlight'));
    this.updateUI();
  }

  setRate(rate) {
    this.rate = rate;
    if (this.isPlaying && !this.isPaused && this.synth) {
      this.synth.cancel();
      this.speakCurrentSentence();
    }
    this.updateUI();
  }

  updateUI() {
    const bar = document.getElementById('reader-tts-bar');
    const playBtn = document.getElementById('btn-tts-play-toggle');
    const title = document.getElementById('tts-status-title');
    const sub = document.getElementById('tts-status-sub');

    if (bar) bar.style.display = this.isPlaying ? 'flex' : 'none';
    if (playBtn) playBtn.textContent = this.isPaused ? '▶ Продолжить' : '⏸ Пауза';
    if (title) title.textContent = this.isPaused ? 'Кибер-Чтец: Пауза' : 'Кибер-Чтец: Воспроизведение';
    if (sub && this.sentences.length > 0) {
      sub.textContent = `Предложение ${this.currentSentenceIdx + 1} из ${this.sentences.length} (${Math.round(((this.currentSentenceIdx + 1) / this.sentences.length) * 100)}%)`;
    }
  }
}

class ReaderEngine {
  constructor() {
    this.currentBook = null;
    this.currentChapterIdx = 0;
    this.readTimer = null;
    this.readSeconds = 0;
    this.narrator = null;

    // RSVP Speed Reader State
    this.rsvpWords = [];
    this.rsvpIdx = 0;
    this.rsvpInterval = null;
    this.rsvpWpm = 350;
    this.isRsvpPlaying = false;

    // Reader Appearance & UX State
    this.fontSize = parseInt(localStorage.getItem('cyberlibris_reader_fontsize')) || 18;
    this.fontFamily = localStorage.getItem('cyberlibris_reader_font') || 'serif';
    this.readerWidth = localStorage.getItem('cyberlibris_reader_width') || 'normal';
    this.readerTheme = localStorage.getItem('cyberlibris_reader_theme') || 'dark';
    this.focusGuideActive = localStorage.getItem('cyberlibris_reader_focus_guide') === 'true';
    this.isZenMode = false;
    this._focusGuideBound = false;
  }

  init() {
    this.bindEvents();
    this.setupScrollTracker();
    this.setupKeyboardShortcuts();
    this.initReaderSettings();
  }

  initReaderSettings() {
    this.setFontFamily(this.fontFamily, false);
    this.setFontSize(this.fontSize, false);
    this.setReaderWidth(this.readerWidth, false);
    this.setReaderTheme(this.readerTheme, false);
    this.toggleFocusGuide(this.focusGuideActive, false);
  }

  bindEvents() {
    // Font Size Controls
    document.getElementById('btn-font-dec')?.addEventListener('click', () => this.adjustFontSize(-2));
    document.getElementById('btn-font-inc')?.addEventListener('click', () => this.adjustFontSize(2));

    const fontSlider = document.getElementById('reader-font-slider');
    if (fontSlider) {
      fontSlider.addEventListener('input', (e) => this.setFontSize(parseInt(e.target.value)));
    }

    // Font Family Chips
    document.querySelectorAll('.font-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const font = e.currentTarget.dataset.font;
        if (font) this.setFontFamily(font);
      });
    });

    // Width Chips
    document.querySelectorAll('.width-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const width = e.currentTarget.dataset.width;
        if (width) this.setReaderWidth(width);
      });
    });

    // Focus Guide Toggle
    document.getElementById('toggle-focus-guide')?.addEventListener('change', (e) => {
      this.toggleFocusGuide(e.target.checked);
    });

    // Popover Toggles
    document.getElementById('btn-reader-appearance')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAppearancePopover();
    });
    document.getElementById('btn-close-appearance')?.addEventListener('click', () => this.closeAppearancePopover());

    document.getElementById('btn-reader-audio-panel')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAudioPopover();
    });
    document.getElementById('btn-close-audio')?.addEventListener('click', () => this.closeAudioPopover());

    // Stop popover clicks from bubbling
    document.getElementById('reader-appearance-popover')?.addEventListener('click', (e) => e.stopPropagation());
    document.getElementById('reader-audio-popover')?.addEventListener('click', (e) => e.stopPropagation());

    // Table of Contents Drawer
    document.getElementById('btn-open-toc')?.addEventListener('click', () => this.openTocDrawer());
    document.getElementById('btn-compass-toc')?.addEventListener('click', () => this.openTocDrawer());
    document.getElementById('btn-close-toc')?.addEventListener('click', () => this.closeTocDrawer());
    document.getElementById('reader-toc-backdrop')?.addEventListener('click', () => this.closeTocDrawer());
    document.getElementById('reader-toc-search-input')?.addEventListener('input', (e) => this.filterTocList(e.target.value));

    // Zen Mode Toggles
    document.getElementById('btn-toggle-zen-mode')?.addEventListener('click', () => this.toggleZenMode());
    document.getElementById('btn-compass-zen')?.addEventListener('click', () => this.toggleZenMode());
    document.getElementById('btn-exit-zen')?.addEventListener('click', () => this.toggleZenMode(false));

    // Compass Quick Action: Aa Appearance
    document.getElementById('btn-compass-appearance')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAppearancePopover();
    });

    // Manga vs Page mode toggle
    document.getElementById('btn-toggle-manga-mode')?.addEventListener('click', () => this.toggleReadingMode());

    // Reader Themes
    document.querySelectorAll('.btn-reader-theme').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const theme = e.currentTarget.dataset.theme;
        this.setReaderTheme(theme);
      });
    });

    // Font Family Select (fallback)
    document.getElementById('reader-font-select')?.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val.includes('serif')) this.setFontFamily('serif');
      else if (val.includes('sans')) this.setFontFamily('sans');
      else if (val.includes('mono')) this.setFontFamily('mono');
    });

    // Ambient Audio Toggles
    document.querySelectorAll('.ambient-chip').forEach((chip) => {
      chip.addEventListener('click', (e) => {
        const soundType = e.currentTarget.dataset.sound;
        document.querySelectorAll('.ambient-chip').forEach((c) => c.classList.remove('active'));
        const playing = window.soundEngine.playAmbient(soundType);
        if (playing) {
          e.currentTarget.classList.add('active');
          window.app.showToast(`Фоновый звук: ${e.currentTarget.textContent}`, 'info');
        }
      });
    });

    // Ambient Volume Slider
    document.getElementById('reader-ambient-vol')?.addEventListener('input', (e) => {
      const vol = parseFloat(e.target.value);
      if (window.soundEngine) window.soundEngine.setVolume(vol);
    });

    // TTS Web Speech Narrator
    document.getElementById('btn-toggle-tts')?.addEventListener('click', () => this.toggleTTS());
    document.getElementById('btn-tts-play-toggle')?.addEventListener('click', () => this.toggleTTS());
    document.getElementById('btn-tts-stop')?.addEventListener('click', () => this.stopTTS());
    document.getElementById('tts-rate-select')?.addEventListener('change', (e) => {
      this.narrator?.setRate(parseFloat(e.target.value));
    });

    // Dismiss popovers on outside click
    document.addEventListener('click', (e) => {
      const appPop = document.getElementById('reader-appearance-popover');
      const appBtn = document.getElementById('btn-reader-appearance');
      const appCompassBtn = document.getElementById('btn-compass-appearance');
      const audPop = document.getElementById('reader-audio-popover');
      const audBtn = document.getElementById('btn-reader-audio-panel');

      if (appPop && appPop.style.display !== 'none') {
        if (!appPop.contains(e.target) && !appBtn?.contains(e.target) && !appCompassBtn?.contains(e.target)) {
          this.closeAppearancePopover();
        }
      }
      if (audPop && audPop.style.display !== 'none') {
        if (!audPop.contains(e.target) && !audBtn?.contains(e.target)) {
          this.closeAudioPopover();
        }
      }
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

    // Share Quote buttons
    document.getElementById('btn-share-quote')?.addEventListener('click', () => this.openQuoteModal());
    document.getElementById('floating-quote-btn')?.addEventListener('click', () => {
      const sel = window.getSelection().toString().trim();
      this.openQuoteModal(sel);
    });
    document.getElementById('btn-copy-quote')?.addEventListener('click', () => this.copyQuoteToClipboard());

    // Cyber-Lexicon Definition trigger
    document.getElementById('floating-define-btn')?.addEventListener('click', () => {
      const sel = window.getSelection().toString().trim();
      this.openWordLexicon(sel);
    });

    // Bookmarks Modal
    document.getElementById('btn-open-bookmarks')?.addEventListener('click', () => this.openBookmarksModal());
    document.getElementById('btn-add-bookmark')?.addEventListener('click', () => this.openBookmarksModal());
    document.getElementById('btn-save-current-bookmark')?.addEventListener('click', () => this.saveCurrentBookmark());

    // Fullscreen toggle
    document.getElementById('btn-toggle-fullscreen')?.addEventListener('click', () => this.toggleFullscreen());

    // Selection listener for floating actions (Quote + Lexicon)
    this.setupSelectionListener();
  }

  setupSelectionListener() {
    document.addEventListener('selectionchange', () => {
      const bar = document.getElementById('floating-selection-actions');
      const defBtn = document.getElementById('floating-define-btn');
      if (!bar) return;
      if (!document.getElementById('view-reader')?.classList.contains('active')) {
        bar.style.display = 'none';
        return;
      }

      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      if (text.length >= 2 && sel.rangeCount > 0) {
        const words = text.split(/\s+/).filter((w) => w.length > 0);
        if (defBtn) {
          defBtn.style.display = words.length <= 4 ? 'inline-block' : 'none';
        }
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect && rect.top > 0) {
          bar.style.display = 'flex';
          bar.style.left = `${Math.min(window.innerWidth - 120, Math.max(120, rect.left + rect.width / 2))}px`;
          bar.style.top = `${Math.max(10, rect.top - 12)}px`;
        }
      } else {
        bar.style.display = 'none';
      }
    });
  }

  toggleTTS() {
    if (!this.narrator) {
      this.narrator = new SpeechNarrator();
    }
    const bar = document.getElementById('reader-tts-bar');
    if (!this.narrator.isPlaying) {
      const bodyEl = document.getElementById('reader-body-content');
      const text = bodyEl ? bodyEl.innerText : '';
      if (!text || text.length < 10) {
        window.app.showToast('Текст главы ещё загружается...', 'error');
        return;
      }
      if (bar) bar.style.display = 'flex';
      this.narrator.start(text);
      window.app.showToast('Кибер-Чтец запущен: озвучивание главы', 'info');
    } else {
      this.narrator.toggle();
    }
  }

  stopTTS() {
    if (this.narrator) {
      this.narrator.stop();
    }
    const bar = document.getElementById('reader-tts-bar');
    if (bar) bar.style.display = 'none';
    window.app.showToast('⏹ Кибер-Чтец остановлен', 'info');
  }

  async openWordLexicon(rawWord) {
    if (!rawWord) return;
    const clean = rawWord.toLowerCase().replace(/[^а-яa-zё]/gi, '').trim();
    if (!clean) return;

    let entry = CLASSIC_LEXICON[clean];

    if (!entry) {
      const keys = Object.keys(CLASSIC_LEXICON);
      const match = keys.find((k) => clean.startsWith(k.substring(0, 4)) || k.startsWith(clean.substring(0, 4)));
      if (match) entry = CLASSIC_LEXICON[match];
    }

    const titleEl = document.getElementById('lexicon-term-title');
    const typeEl = document.getElementById('lexicon-term-type');
    const meaningEl = document.getElementById('lexicon-term-meaning');
    const exampleEl = document.getElementById('lexicon-term-example');
    const sourceEl = document.getElementById('lexicon-term-source');

    if (entry) {
      if (titleEl) titleEl.textContent = entry.title;
      if (typeEl) typeEl.textContent = entry.type;
      if (meaningEl) meaningEl.textContent = entry.meaning;
      if (exampleEl) exampleEl.textContent = entry.example;
      if (sourceEl) sourceEl.textContent = '📡 Источник: Словарь классической литературы CyberLibris';
    } else {
      if (titleEl) titleEl.textContent = rawWord;
      if (typeEl) typeEl.textContent = 'Литературный термин';
      if (meaningEl) meaningEl.textContent = `Слово «${rawWord}» встречается в тексте произведения. Поиск толкования...`;
      if (exampleEl) exampleEl.textContent = `Контекст: «...${rawWord}...»`;
      if (sourceEl) sourceEl.textContent = '📡 Источник: Открытый лексикон Викисловаря';

      try {
        const resp = await fetch(`https://ru.wiktionary.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(clean)}&format=json&origin=*`);
        if (resp.ok) {
          const data = await resp.json();
          const pages = data.query?.pages;
          if (pages) {
            const pageId = Object.keys(pages)[0];
            const extract = pages[pageId]?.extract;
            if (extract && pageId !== '-1') {
              const snippet = extract.split('\n').filter((l) => l.trim().length > 10)[0] || extract;
              if (meaningEl) meaningEl.textContent = snippet.substring(0, 300) + '...';
            } else {
              if (meaningEl) meaningEl.textContent = `«${rawWord}» — выразительный литературный образ, используемый автором для создания атмосферы эпохи.`;
            }
          }
        }
      } catch (e) {
        if (meaningEl) meaningEl.textContent = `«${rawWord}» — выразительный литературный образ, используемый автором для создания атмосферы эпохи.`;
      }
    }

    // Award XP for erudition
    if (window.auth) {
      window.auth.addXp(10);
      window.auth.addLumens(5);
      window.app.showToast('Толкование изучено: +10 XP, +5 ⬡', 'reward');
      if (window.soundEngine) window.soundEngine.playCorrect();
    }

    window.app.openModal('modal-word-definition');
  }

  saveProgress() {
    if (!this.currentBook) return;
    const bookId = this.currentBook.id;
    const chIdx = typeof this.currentChapterIdx === 'number' ? this.currentChapterIdx : 0;
    const chapters = this.currentBook.chapters || [];
    const chTitle = chapters[chIdx]?.title || `Глава ${chIdx + 1}`;
    const totalChapters = chapters.length || 1;

    // Retrieve previous saved state to ensure monotonic progress (scrolling back up never demotes reading progress!)
    const saved = this.getSavedProgress(bookId);
    const prevMaxChapter = saved ? (typeof saved.maxChapterReached === 'number' ? saved.maxChapterReached : (saved.currentChapter || 0)) : 0;
    const maxChapterReached = Math.max(prevMaxChapter, chIdx);

    const calculatedPercent = Math.min(100, Math.max(1, Math.round(((maxChapterReached + 1) / totalChapters) * 100)));
    const prevPercent = saved ? (saved.progressPercent || 0) : 0;
    const percent = Math.max(prevPercent, calculatedPercent);

    const progress = {
      bookId,
      bookTitle: this.currentBook.title,
      currentChapter: chIdx,
      maxChapterReached: maxChapterReached,
      chapterTitle: chTitle,
      progressPercent: percent,
      readingMode: this.readingMode,
      scrollY: window.scrollY || 0,
      lastReadDate: new Date().toISOString()
    };

    // 1. Save in localStorage for immediate client persistence
    try {
      localStorage.setItem(`cyberlibris_progress_${bookId}`, JSON.stringify(progress));
      localStorage.setItem('cyberlibris_last_read_book', bookId);
    } catch (e) {}

    // 2. Save in active user account & DB
    const user = window.auth?.currentUser;
    if (user) {
      if (!user.readingProgress) user.readingProgress = {};
      user.readingProgress[bookId] = progress;
      window.auth.saveUser();
    }

    // 3. Update bookRelay shelves with highest chapter reached
    if (user && window.bookRelay) {
      window.bookRelay.updateProgress(user.username, bookId, percent, maxChapterReached);
    }

    // 4. Update Header Quick Resume Pill
    window.app?.updateHeaderResumePill?.();
  }

  resetBookProgress(bookId = null) {
    const targetId = bookId || this.currentBook?.id;
    if (!targetId) return;

    if (!confirm('Вы действительно хотите сбросить прогресс чтения этой книги?')) {
      return;
    }

    try {
      localStorage.removeItem(`cyberlibris_progress_${targetId}`);
    } catch (e) {}

    const user = window.auth?.currentUser;
    if (user) {
      if (user.readingProgress && user.readingProgress[targetId]) {
        delete user.readingProgress[targetId];
      }
      window.auth.saveUser();
    }

    if (user && window.bookRelay) {
      window.bookRelay.resetProgress(user.username, targetId);
    }

    if (this.currentBook && this.currentBook.id === targetId) {
      this.currentChapterIdx = 0;
      this.jumpToChapter(0);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    window.app?.updateHeaderResumePill?.();
    window.app?.renderSteamLibrary?.();
    window.app?.renderProfile?.();
    window.app?.showToast?.('Прогресс чтения книги сброшен к началу!', 'info');
  }

  getSavedProgress(bookId) {
    if (!bookId) return null;
    const user = window.auth?.currentUser;
    if (user?.readingProgress?.[bookId]) {
      return user.readingProgress[bookId];
    }
    try {
      const raw = localStorage.getItem(`cyberlibris_progress_${bookId}`);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  setupMangaChapterObserver() {
    if (this._mangaObserver) {
      this._mangaObserver.disconnect();
      this._mangaObserver = null;
    }

    if (this.readingMode !== 'manga') return;

    const blocks = document.querySelectorAll('.manga-chapter-block');
    if (!blocks || blocks.length === 0) return;

    this._mangaObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const idx = parseInt(entry.target.dataset.idx || entry.target.id.replace('chapter-block-', ''));
          if (!isNaN(idx) && idx !== this.currentChapterIdx) {
            this.currentChapterIdx = idx;
            const selectEl = document.getElementById('reader-chapter-select');
            if (selectEl) selectEl.value = idx;
            this.updateActiveChapterHeader();
            this.saveProgress();
          }
        }
      });
    }, {
      root: null,
      rootMargin: '-15% 0px -65% 0px',
      threshold: 0
    });

    blocks.forEach((el) => this._mangaObserver.observe(el));
  }

  setupScrollTracker() {
    let ticking = false;
    let lastSavedProgress = -1;
    let saveTimeout = null;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (this.currentBook && document.getElementById('view-reader')?.classList.contains('active')) {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (scrollHeight > 0) {
              const progress = Math.min(100, Math.max(0, Math.round((window.scrollY / scrollHeight) * 100)));

              const fill = document.getElementById('reading-progress-fill');
              const valText = document.getElementById('reading-progress-percent');
              if (fill) fill.style.width = `${progress}%`;
              if (valText) valText.textContent = `${progress}%`;

              // Throttled persistence to prevent continuous storage I/O
              if (Math.abs(progress - lastSavedProgress) >= 2) {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                  lastSavedProgress = progress;
                  const user = window.auth?.currentUser;
                  if (user && window.bookRelay) {
                    window.bookRelay.updateProgress(user.username, this.currentBook.id, progress, this.currentChapterIdx);
                  }
                }, 300);
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  async openBook(bookId, chapterIdx = null, initialMode = null) {
    let book = window.bookRelay ? window.bookRelay.getBookById(bookId) : null;
    if (!book && window.dbEngine) book = window.dbEngine.getBook(bookId);
    if (!book) return;

    this.currentBook = book;

    // Retrieve saved reading progress for this book
    const saved = this.getSavedProgress(bookId);
    let resumed = false;

    if (chapterIdx !== null && chapterIdx !== undefined) {
      this.currentChapterIdx = chapterIdx;
    } else if (saved && typeof saved.currentChapter === 'number' && saved.currentChapter >= 0) {
      this.currentChapterIdx = saved.currentChapter;
      resumed = true;
    } else {
      this.currentChapterIdx = 0;
    }

    if (initialMode) {
      this.readingMode = initialMode;
    } else if (saved?.readingMode) {
      this.readingMode = saved.readingMode;
    } else {
      this.readingMode = 'manga';
    }

    const user = window.auth?.currentUser;
    if (user && window.bookRelay) {
      window.bookRelay.setReadingNow(user.username, book.id);
    }

    // Заполняем заголовок читального зала
    const titleEl = document.getElementById('reader-book-title');
    const authorEl = document.getElementById('reader-book-author');
    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = book.author;

    // Floating Island Info
    const islandThumb = document.getElementById('reader-island-thumb');
    const islandTitle = document.getElementById('reader-island-title');
    const islandAuthor = document.getElementById('reader-island-author');
    if (islandThumb) islandThumb.src = book.cover || DEFAULT_READER_COVER;
    if (islandTitle) islandTitle.textContent = book.title;
    if (islandAuthor) islandAuthor.textContent = book.author;

    // Hero Banner Elements
    const heroCover = document.getElementById('reader-hero-cover-img');
    const heroGenre = document.getElementById('reader-hero-genre-badge');
    const heroAge = document.getElementById('reader-hero-age-badge');
    const heroYear = document.getElementById('reader-hero-year-badge');
    const heroChapters = document.getElementById('reader-hero-chapters-count');

    if (heroCover) heroCover.src = book.cover || DEFAULT_READER_COVER;
    if (heroGenre) heroGenre.textContent = book.genre || 'Классика';
    if (heroAge) heroAge.textContent = book.ageLimit ? `${book.ageLimit}+` : (book.age || '12+');
    if (heroYear) heroYear.textContent = book.year ? `${book.year} г.` : 'Классика';
    if (heroChapters) heroChapters.textContent = `${book.chapters?.length || 1} глав`;

    // TOC Drawer Book Title
    const tocBookTitle = document.getElementById('reader-toc-book-title');
    if (tocBookTitle) tocBookTitle.textContent = book.title;

    const modeBtn = document.getElementById('btn-toggle-manga-mode');
    const modeLabel = document.getElementById('reader-mode-label');
    if (modeLabel) {
      modeLabel.textContent = this.readingMode === 'manga' ? 'Режим: Лента' : 'Режим: По главам';
    } else if (modeBtn) {
      modeBtn.textContent = this.readingMode === 'manga' ? 'Режим: Лента' : 'Режим: По главам';
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

    // Ensure within chapter range
    if (this.currentChapterIdx >= (book.chapters?.length || 1)) {
      this.currentChapterIdx = Math.max(0, (book.chapters?.length || 1) - 1);
    }

    if (heroChapters) heroChapters.textContent = `${book.chapters?.length || 1} глав`;

    this.updateRelayBadge();
    this.updateChapterDropdown();
    this.updateActiveChapterHeader();
    this.renderTocList();
    this.renderContent();

    // If resumed from previous reading progress
    if (resumed && this.currentChapterIdx > 0) {
      const chTitle = book.chapters?.[this.currentChapterIdx]?.title || `Глава ${this.currentChapterIdx + 1}`;
      window.app.showToast(`Возобновлено чтение: ${chTitle}`, 'info');

      if (this.readingMode === 'manga') {
        setTimeout(() => {
          const block = document.getElementById(`chapter-block-${this.currentChapterIdx}`);
          if (block) {
            block.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      }
    }

    // Save and track
    this.saveProgress();
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
        <button class="btn btn-primary" onclick="window.readerEngine.openBook('${this.currentBook?.id}')">Повторить попытку ретрансляции</button>
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
    selectEl.style.display = 'none';
    if (chapters.length > 1) {
      selectEl.innerHTML = chapters.map((ch, idx) => `
        <option value="${idx}" ${idx === this.currentChapterIdx ? 'selected' : ''}>${ch.title}</option>
      `).join('');
    }
  }

  jumpToChapter(idx) {
    if (!this.currentBook) return;
    this.stopTTS();
    const chapters = this.currentBook.chapters || [];
    if (idx >= 0 && idx < chapters.length) {
      this.currentChapterIdx = idx;
      this.updateActiveChapterHeader();
      this.renderTocList();
      this.saveProgress();
      if (this.readingMode === 'manga') {
        const el = document.getElementById(`chapter-block-${idx}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        this.renderContent();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  nextPageOrChapter() {
    if (!this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    if (this.currentChapterIdx < chapters.length - 1) {
      this.jumpToChapter(this.currentChapterIdx + 1);
      window.app?.showToast?.(`Глава ${this.currentChapterIdx + 1}: ${chapters[this.currentChapterIdx]?.title || ''}`, 'info');
      if (window.soundEngine?.playPageFlip) window.soundEngine.playPageFlip();
      else window.soundEngine?.playCardFlip?.();
    } else {
      window.app?.showToast?.('Вы на последней главе этой книги', 'info');
    }
  }

  prevPageOrChapter() {
    if (!this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    if (this.currentChapterIdx > 0) {
      this.jumpToChapter(this.currentChapterIdx - 1);
      window.app?.showToast?.(`Глава ${this.currentChapterIdx + 1}: ${chapters[this.currentChapterIdx]?.title || ''}`, 'info');
      if (window.soundEngine?.playPageFlip) window.soundEngine.playPageFlip();
      else window.soundEngine?.playCardFlip?.();
    } else {
      window.app?.showToast?.('Вы на первой главе этой книги', 'info');
    }
  }

  toggleReadingMode() {
    this.readingMode = this.readingMode === 'manga' ? 'page' : 'manga';
    const modeBtn = document.getElementById('btn-toggle-manga-mode');
    const modeLabel = document.getElementById('reader-mode-label');
    if (modeLabel) {
      modeLabel.textContent = this.readingMode === 'manga' ? 'Режим: Лента' : 'Режим: По главам';
    } else if (modeBtn) {
      modeBtn.textContent = this.readingMode === 'manga' ? 'Режим: Лента' : 'Режим: По главам';
    }
    this.saveProgress();
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
    this.updateActiveChapterHeader();

    if (this.readingMode === 'manga') {
      if (chapterEl) chapterEl.textContent = `Непрерывная лента (${chapters.length} глав)`;
      if (navControls) navControls.style.display = 'none';

      bodyEl.className = 'reader-text-body reader-manga-mode';
      bodyEl.innerHTML = chapters.map((ch, idx) => `
        <div class="manga-chapter-block" id="chapter-block-${idx}" data-idx="${idx}">
          <div class="manga-chapter-title">${ch.title}</div>
          <div class="manga-chapter-text">${ch.content.split('\n\n').filter((p) => p.trim()).map((p) => `<p>${p}</p>`).join('')}</div>
        </div>
      `).join('');

      this.setupMangaChapterObserver();
    } else {
      if (navControls) navControls.style.display = 'flex';
      const chapter = chapters[this.currentChapterIdx] || { title: 'Глава 1', content: 'Текст отсутствует.' };
      if (chapterEl) chapterEl.textContent = chapter.title;

      bodyEl.className = 'reader-text-body reader-page-mode';
      bodyEl.innerHTML = chapter.content
        .split('\n\n')
        .filter((p) => p.trim())
        .map((p) => `<p>${p}</p>`)
        .join('');

      const prevBtn = document.getElementById('btn-prev-chapter');
      const nextBtn = document.getElementById('btn-next-chapter');
      if (prevBtn) prevBtn.disabled = this.currentChapterIdx <= 0;
      if (nextBtn) nextBtn.disabled = this.currentChapterIdx >= chapters.length - 1;

      // Append completed celebration card if at the final chapter
      if (this.currentChapterIdx === chapters.length - 1) {
        bodyEl.innerHTML += `
          <div class="reader-book-completed-card">
            <div class="reader-completed-trophy">🏆</div>
            <h3 class="reader-completed-title">Произведение полностью прочитано!</h3>
            <p class="reader-completed-desc">Вы завершили чтение «${this.currentBook.title}». Награда за книгу: <strong>+150 ⬡ Люменов</strong> и <strong>+300 XP</strong>!</p>
            <div class="reader-completed-actions">
              <button class="btn btn-primary magnetic-btn" onclick="window.app.switchView('games')">🎮 Сыграть в Аркаде на Люмены</button>
              <button class="btn btn-secondary magnetic-btn" onclick="window.app.switchView('steam-library')">📚 В Библиотеку</button>
            </div>
          </div>
        `;
        this.awardBookCompletionReward(this.currentBook);
      }
    }
  }

  awardBookCompletionReward(book) {
    if (!book || !window.auth) return;
    const user = window.auth.currentUser;
    const username = user ? user.username : 'guest';

    if (window.bookRelay) {
      window.bookRelay.updateProgress(username, book.id, 100, (book.chapters?.length || 1) - 1);
    }

    const rewardKey = `cyberlibris_book_reward_${username}_${book.id}`;
    const alreadyRewarded = localStorage.getItem(rewardKey);
    if (!alreadyRewarded) {
      localStorage.setItem(rewardKey, 'true');
      window.auth.updateStat('booksRead', 1);
      window.auth.addXp(300);
      window.auth.addLumens(150);

      if (window.app) {
        window.app.showToast(`🎉 Произведение «${book.title}» прочитано! Награда: +150 ⬡ Люменов для игр в Аркаде и +300 XP!`, 'reward');
        if (window.miniGamesSuite) window.miniGamesSuite.updateEnergyUI();
      }
      if (window.soundEngine) {
        if (window.soundEngine.playCoin) window.soundEngine.playCoin();
        if (window.soundEngine.playGameWin) window.soundEngine.playGameWin();
      }
    }
  }

  nextChapter() {
    if (this.currentBook && this.currentChapterIdx < (this.currentBook.chapters?.length || 0) - 1) {
      this.stopTTS();
      this.currentChapterIdx += 1;
      this.saveProgress();

      // Reading progression rewards
      if (window.auth) {
        window.auth.addXp(30);
        window.auth.addLumens(10);
        window.auth.updateStat('chaptersRead', 1);

        const genre = (this.currentBook.genre || '').toLowerCase();
        if (genre.includes('класс') || genre.includes('поэ')) {
          window.auth.updateStat('classicChaptersRead', 1);
        } else if (genre.includes('фантаст') || genre.includes('кибер')) {
          window.auth.updateStat('scifiChaptersRead', 1);
        } else if (genre.includes('воен') || genre.includes('стратег')) {
          window.auth.updateStat('militaryChaptersRead', 1);
        } else if (genre.includes('философ') || genre.includes('мысл')) {
          window.auth.updateStat('philosophyChaptersRead', 1);
        }

        // Check if finished final chapter
        if (this.currentChapterIdx === (this.currentBook.chapters?.length || 0) - 1) {
          this.awardBookCompletionReward(this.currentBook);
        }
      }

      this.renderContent();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevChapter() {
    if (this.currentBook && this.currentChapterIdx > 0) {
      this.stopTTS();
      this.currentChapterIdx -= 1;
      this.saveProgress();
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
        window.auth.addLumens(5);
        window.auth.addXp(15);
        window.auth.updateStat('readTimeMinutes', 1);
        if (window.dbEngine) {
          window.dbEngine.updateQuestProgress('quest_read_2min', 1);
          if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
        }
      }
    }, 1000);
  }

  setFontFamily(family, save = true) {
    this.fontFamily = family;
    if (save) localStorage.setItem('cyberlibris_reader_font', family);

    let fontVar = 'var(--font-serif)';
    if (family === 'sans') fontVar = 'var(--font-sans)';
    if (family === 'mono') fontVar = 'var(--font-mono)';

    const bodyEl = document.getElementById('reader-body-content');
    if (bodyEl) bodyEl.style.fontFamily = fontVar;

    const articleEl = document.getElementById('reader-article-body');
    if (articleEl) articleEl.style.fontFamily = fontVar;

    document.querySelectorAll('.font-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.font === family);
    });

    const fontSelect = document.getElementById('reader-font-select');
    if (fontSelect) fontSelect.value = fontVar;
  }

  setFontSize(size, save = true) {
    this.fontSize = Math.max(14, Math.min(28, size));
    if (save) localStorage.setItem('cyberlibris_reader_fontsize', this.fontSize);

    const bodyEl = document.getElementById('reader-body-content');
    if (bodyEl) bodyEl.style.fontSize = `${this.fontSize}px`;

    const slider = document.getElementById('reader-font-slider');
    if (slider) slider.value = this.fontSize;

    const valEl = document.getElementById('reader-font-size-val');
    if (valEl) valEl.textContent = `${this.fontSize}px`;
  }

  adjustFontSize(delta) {
    this.setFontSize(this.fontSize + delta);
  }

  setReaderWidth(width, save = true) {
    this.readerWidth = width;
    if (save) localStorage.setItem('cyberlibris_reader_width', width);

    const box = document.getElementById('reader-container-box');
    if (box) {
      box.classList.remove('reader-width-narrow', 'reader-width-normal', 'reader-width-wide');
      box.classList.add(`reader-width-${width}`);
    }

    document.querySelectorAll('.width-chip').forEach((chip) => {
      chip.classList.toggle('active', chip.dataset.width === width);
    });
  }

  setReaderTheme(themeName, save = true) {
    this.readerTheme = themeName;
    if (save) localStorage.setItem('cyberlibris_reader_theme', themeName);

    const container = document.getElementById('reader-container-box');
    if (container) {
      const filtered = Array.from(container.classList).filter((c) => !c.startsWith('theme-'));
      filtered.push(`theme-${themeName}`);
      container.className = filtered.join(' ');
    }

    document.querySelectorAll('.btn-reader-theme').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === themeName);
    });
  }

  toggleFocusGuide(enable, save = true) {
    this.focusGuideActive = typeof enable === 'boolean' ? enable : !this.focusGuideActive;
    if (save) localStorage.setItem('cyberlibris_reader_focus_guide', this.focusGuideActive);

    const guide = document.getElementById('reader-focus-guide');
    const checkbox = document.getElementById('toggle-focus-guide');
    if (checkbox) checkbox.checked = this.focusGuideActive;

    if (!guide) return;
    if (this.focusGuideActive) {
      guide.style.display = 'block';
      if (!this._focusGuideBound) {
        this._focusGuideHandler = (e) => {
          if (this.focusGuideActive && document.getElementById('view-reader')?.classList.contains('active')) {
            guide.style.top = `${e.clientY - 19}px`;
          }
        };
        window.addEventListener('mousemove', this._focusGuideHandler, { passive: true });
        this._focusGuideBound = true;
      }
    } else {
      guide.style.display = 'none';
    }
  }

  toggleAppearancePopover(forceState) {
    const pop = document.getElementById('reader-appearance-popover');
    if (!pop) return;
    const isVisible = pop.style.display !== 'none';
    const next = typeof forceState === 'boolean' ? forceState : !isVisible;
    if (next) {
      this.closeAudioPopover();
      pop.style.display = 'block';
    } else {
      pop.style.display = 'none';
    }
  }

  closeAppearancePopover() {
    const pop = document.getElementById('reader-appearance-popover');
    if (pop) pop.style.display = 'none';
  }

  toggleAudioPopover(forceState) {
    const pop = document.getElementById('reader-audio-popover');
    if (!pop) return;
    const isVisible = pop.style.display !== 'none';
    const next = typeof forceState === 'boolean' ? forceState : !isVisible;
    if (next) {
      this.closeAppearancePopover();
      pop.style.display = 'block';
    } else {
      pop.style.display = 'none';
    }
  }

  closeAudioPopover() {
    const pop = document.getElementById('reader-audio-popover');
    if (pop) pop.style.display = 'none';
  }

  closeAllPopovers() {
    this.closeAppearancePopover();
    this.closeAudioPopover();
  }

  openTocDrawer() {
    this.closeAllPopovers();
    const drawer = document.getElementById('reader-toc-drawer');
    const backdrop = document.getElementById('reader-toc-backdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    const input = document.getElementById('reader-toc-search-input');
    if (input) {
      input.value = '';
      setTimeout(() => input.focus(), 150);
    }
    this.renderTocList();
  }

  closeTocDrawer() {
    const drawer = document.getElementById('reader-toc-drawer');
    const backdrop = document.getElementById('reader-toc-backdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }

  renderTocList(filterQuery = '') {
    const listEl = document.getElementById('reader-toc-list');
    if (!listEl || !this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    const query = (filterQuery || '').trim().toLowerCase();

    const filtered = chapters.map((ch, idx) => ({ ...ch, originalIdx: idx })).filter((ch) => {
      if (!query) return true;
      return ch.title.toLowerCase().includes(query) || `глава ${ch.originalIdx + 1}`.includes(query);
    });

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-dim); font-size: 0.85rem;">
          🔍 Главы по запросу «${filterQuery}» не найдены
        </div>
      `;
      return;
    }

    listEl.innerHTML = filtered.map((ch) => {
      const isActive = ch.originalIdx === this.currentChapterIdx;
      const numStr = (ch.originalIdx + 1) < 10 ? `0${ch.originalIdx + 1}` : `${ch.originalIdx + 1}`;
      return `
        <div class="reader-toc-item ${isActive ? 'active' : ''}" data-idx="${ch.originalIdx}">
          <div style="display: flex; align-items: center; gap: 0.8rem; overflow: hidden;">
            <span style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--accent-cyan); font-weight: 700; opacity: 0.85;">${numStr}</span>
            <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ch.title}</span>
          </div>
          ${isActive ? '<span style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 800; letter-spacing: 0.5px;">ЧИТАЕТСЯ</span>' : ''}
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.reader-toc-item').forEach((item) => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        if (!isNaN(idx)) {
          this.jumpToChapter(idx);
          this.closeTocDrawer();
        }
      });
    });
  }

  filterTocList(query) {
    this.renderTocList(query);
  }

  toggleZenMode(forceState) {
    const next = typeof forceState === 'boolean' ? forceState : !this.isZenMode;
    this.isZenMode = next;
    document.body.classList.toggle('zen-mode-active', this.isZenMode);

    if (this.isZenMode) {
      this.closeAllPopovers();
      this.closeTocDrawer();
      window.app?.showToast?.('Дзен-режим активирован. Нажмите Esc для выхода.', 'info');
    } else {
      window.app?.showToast?.('Выход из Дзен-режима', 'info');
    }
  }

  updateActiveChapterHeader() {
    if (!this.currentBook) return;
    const chapters = this.currentBook.chapters || [];
    const ch = chapters[this.currentChapterIdx];
    const chNum = this.currentChapterIdx + 1;
    const titleText = ch ? ch.title : `Глава ${chNum}`;

    const islandName = document.getElementById('reader-active-chapter-name');
    if (islandName) islandName.textContent = titleText;

    const compassTag = document.getElementById('compass-chapter-tag');
    if (compassTag) compassTag.textContent = `Гл. ${chNum}`;

    const navProgress = document.getElementById('reader-nav-progress-text');
    if (navProgress) navProgress.textContent = `Глава ${chNum} из ${chapters.length}`;

    const selectEl = document.getElementById('reader-chapter-select');
    if (selectEl) selectEl.value = this.currentChapterIdx;
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (!document.getElementById('view-reader')?.classList.contains('active')) return;

      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select') {
        if (e.key === 'Escape') {
          document.activeElement.blur();
        }
        return;
      }

      if (e.key === 'Escape') {
        const appearancePop = document.getElementById('reader-appearance-popover');
        const audioPop = document.getElementById('reader-audio-popover');
        const tocDrawer = document.getElementById('reader-toc-drawer');

        if (appearancePop && appearancePop.style.display !== 'none') {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.closeAppearancePopover();
          return;
        }
        if (audioPop && audioPop.style.display !== 'none') {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.closeAudioPopover();
          return;
        }
        if (tocDrawer && tocDrawer.classList.contains('active')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.closeTocDrawer();
          return;
        }
        if (this.isZenMode || document.body.classList.contains('zen-mode-active')) {
          e.preventDefault();
          e.stopImmediatePropagation();
          this.toggleZenMode(false);
          return;
        }
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        if (this.readingMode === 'page') {
          e.preventDefault();
          this.nextChapter();
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (this.readingMode === 'page') {
          e.preventDefault();
          this.prevChapter();
        }
      } else if (e.key.toLowerCase() === 'z') {
        this.toggleZenMode();
      }
    });
  }

  // --- QUOTE SHARING SUITE ---

  openQuoteModal(customText = '') {
    if (!this.currentBook) return;
    const quoteText = customText || this.currentBook.quote || '«Книга — живой диалог сквозь столетия.»';
    
    const textEl = document.getElementById('share-quote-text');
    const authorEl = document.getElementById('share-quote-author');
    const bookEl = document.getElementById('share-quote-book');
    const userEl = document.getElementById('share-quote-user');

    if (textEl) textEl.textContent = `«${quoteText.replace(/^«|»$/g, '')}»`;
    if (authorEl) authorEl.textContent = this.currentBook.author;
    if (bookEl) bookEl.textContent = `«${this.currentBook.title}»`;
    if (userEl) userEl.textContent = `@${window.auth.currentUser?.username || 'читатель'}`;

    window.app.openModal('modal-share-quote');
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  copyQuoteToClipboard() {
    if (!this.currentBook) return;
    const textEl = document.getElementById('share-quote-text');
    const quote = textEl ? textEl.textContent : '';
    const shareText = `${quote}\n— ${this.currentBook.author}, «${this.currentBook.title}»\n\n📖 Читайте на CyberLibris: https://dedylaay.github.io/cyberlibris/`;

    navigator.clipboard?.writeText(shareText).then(() => {
      window.app.showToast('Цитата скопирована в буфер обмена', 'success');
    }).catch(() => {
      window.app.showToast('Цитата готова к отправке', 'success');
    });

    // Award XP and Lumens for sharing knowledge
    window.auth.addXp(25);
    window.auth.addLumens(15);
    if (window.dbEngine) {
      window.dbEngine.updateQuestProgress('quest_share_quote', 1);
      if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
    }
    window.app.showToast('Вознаграждение за шеринг цитаты: +25 XP, +15 ⬡', 'reward');
    if (window.soundEngine) window.soundEngine.playCorrect();
    window.app.closeAllModals();
  }

  // --- BOOKMARKS & NOTES SUITE ---

  openBookmarksModal() {
    if (!this.currentBook) return;
    this.renderBookmarksList();
    window.app.openModal('modal-bookmarks');
    if (window.soundEngine) window.soundEngine.playClick();
  }

  saveCurrentBookmark() {
    if (!this.currentBook) return;
    const noteInput = document.getElementById('new-bookmark-note-input');
    const note = noteInput ? noteInput.value.trim() : '';

    const sel = window.getSelection().toString().trim();
    const chTitle = this.currentBook.chapters?.[this.currentChapterIdx]?.title || `Глава ${this.currentChapterIdx + 1}`;
    const snippet = sel ? `«${sel.substring(0, 100)}...»` : `Текущее место в "${chTitle}"`;

    const user = window.auth.currentUser;
    if (!user) return;
    if (!user.bookmarks) user.bookmarks = [];

    const bookmark = {
      id: 'bm_' + Date.now(),
      bookId: this.currentBook.id,
      bookTitle: this.currentBook.title,
      chapterIdx: this.currentChapterIdx,
      chapterTitle: chTitle,
      textSnippet: snippet,
      note: note || 'Быстрая закладка',
      scrollY: window.scrollY,
      createdAt: new Date().toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    user.bookmarks.unshift(bookmark);
    window.auth.saveUser();

    if (window.dbEngine) {
      window.dbEngine.updateQuestProgress('quest_share_quote', 1);
      if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
    }

    if (noteInput) noteInput.value = '';
    this.renderBookmarksList();
    window.app.showToast('Закладка успешно зафиксирована', 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }

  renderBookmarksList() {
    const listEl = document.getElementById('reader-bookmarks-list');
    if (!listEl) return;
    const user = window.auth.currentUser;
    const bookmarks = (user?.bookmarks || []).filter(b => b.bookId === this.currentBook?.id);

    if (bookmarks.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 1.5rem; color: var(--text-dim); font-size: 0.85rem;">В этой книге пока нет закладок. Нажмите кнопку выше, чтобы сохранить текущее место.</div>';
      return;
    }

    listEl.innerHTML = bookmarks.map(bm => `
      <div class="bookmark-card-item" data-bm-id="${bm.id}" data-chapter="${bm.chapterIdx}" data-scroll="${bm.scrollY || 0}">
        <div style="flex: 1; padding-right: 0.5rem;">
          <div class="bookmark-snippet">${bm.textSnippet}</div>
          <div style="display: flex; gap: 0.6rem; align-items: center;">
            <span class="bookmark-note">📝 ${bm.note}</span>
            <span class="bookmark-date">🕒 ${bm.createdAt}</span>
          </div>
        </div>
        <div style="display: flex; gap: 0.4rem; align-items: center;">
          <button class="btn btn-secondary btn-sm btn-jump-bm" title="Перейти к закладке" style="padding: 0.3rem 0.6rem; font-size: 0.75rem;">
            Перейти ↗
          </button>
          <button class="btn btn-secondary btn-sm btn-del-bm" title="Удалить закладку" style="padding: 0.3rem 0.5rem; font-size: 0.75rem; color: #ff5577;">
            ✕
          </button>
        </div>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-jump-bm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.bookmark-card-item');
        const ch = parseInt(card.dataset.chapter) || 0;
        const scroll = parseInt(card.dataset.scroll) || 0;
        window.app.closeAllModals();
        this.jumpToChapter(ch);
        setTimeout(() => window.scrollTo({ top: scroll, behavior: 'smooth' }), 200);
      });
    });

    listEl.querySelectorAll('.btn-del-bm').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.bookmark-card-item');
        const id = card.dataset.bmId;
        this.deleteBookmark(id);
      });
    });
  }

  deleteBookmark(id) {
    const user = window.auth.currentUser;
    if (!user || !user.bookmarks) return;
    user.bookmarks = user.bookmarks.filter(b => b.id !== id);
    window.auth.saveUser();
    this.renderBookmarksList();
    window.app.showToast('Закладка удалена', 'info');
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      window.app.showToast('Полноэкранный режим чтения включен', 'info');
    } else {
      document.exitFullscreen?.().catch(() => {});
      window.app.showToast('Полноэкранный режим выключен', 'info');
    }
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
        window.app.showToast(`Скорочтение завершено (${this.rsvpWpm} WPM)! +30 ⬡, +80 XP`, 'reward');
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

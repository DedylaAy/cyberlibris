/**
 * CyberLibris Central Database Engine
 * Manages reactive data state, persistence to localStorage, and GitHub cloud sync.
 * Guarantees persistent Steam-style catalog and shop items.
 */
class DatabaseEngine {
  constructor() {
    this.storageKey = 'cyberlibris_database_v3'; // Bumped version to clear any stale cache
    this.data = null;
    this.listeners = [];
    this.saveTimeout = null;
  }

  async init() {
    const local = localStorage.getItem(this.storageKey);
    if (local) {
      try {
        this.data = JSON.parse(local);
      } catch (e) {
        console.error('Failed to parse local DB, reloading defaults', e);
      }
    }

    // If local data missing or missing books/shop, load fresh database.json
    if (!this.data || !this.data.books || this.data.books.length === 0 || !this.data.shopItems?.frames?.length) {
      try {
        const res = await fetch('database.json');
        if (res.ok) {
          this.data = await res.json();
          this.persistLocally();
        }
      } catch (err) {
        console.warn('Could not fetch database.json, using fallback defaults', err);
        this.data = this.getEmergencyDefaults();
        this.persistLocally();
      }
    }

    // Pull from GitHub if Creator configured live GitHub mode
    if (window.githubSync && window.githubSync.config.mode === 'live' && window.githubSync.config.token) {
      window.githubSync.pullFromGitHub().then((res) => {
        if (res.success && res.data) {
          this.data = res.data;
          this.persistLocally();
          this.notify('remote_pull', this.data);
        }
      });
    }

    return this.data;
  }

  persistLocally() {
    if (!this.data) return;
    this.data.meta.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(this.data));
  }

  save(actionDescription = 'Update data') {
    this.persistLocally();
    this.notify('update', this.data);

    // Auto-commit to GitHub only if Creator has sync enabled
    if (window.githubSync && window.githubSync.config.autoSync) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        window.githubSync.pushToGitHub(this.data, `[CyberLibris] ${actionDescription}`);
      }, 1500);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    this.listeners.forEach((fn) => fn(event, payload));
  }

  // --- USERS ---
  getUsers() {
    return this.data?.users || [];
  }

  getUser(userId) {
    return this.getUsers().find((u) => u.id === userId || u.username === userId);
  }

  saveUser(updatedUser) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    this.addAuditLog('USER_UPDATE', `Обновлен: @${updatedUser.username} (${updatedUser.role})`);
    this.save(`Update user ${updatedUser.username}`);
  }

  // --- BOOKS (STEAM-STYLE) ---
  getBooks() {
    return this.data?.books || [];
  }

  getBook(bookId) {
    return this.getBooks().find((b) => b.id === bookId);
  }

  addBook(book) {
    if (!this.data.books) this.data.books = [];
    book.id = book.id || 'book_' + Date.now();
    this.data.books.push(book);
    this.addAuditLog('BOOK_ADDED', `Добавлено произведение: "${book.title}" (${book.rarity})`);
    this.save(`Add book ${book.title}`);
  }

  updateBook(updatedBook) {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === updatedBook.id);
    if (idx !== -1) {
      books[idx] = updatedBook;
      this.addAuditLog('BOOK_UPDATED', `Обновлено произведение: "${updatedBook.title}"`);
      this.save(`Update book ${updatedBook.title}`);
    }
  }

  deleteBook(bookId) {
    const book = this.getBook(bookId);
    if (book) {
      this.data.books = this.data.books.filter((b) => b.id !== bookId);
      this.addAuditLog('BOOK_DELETED', `Удалено произведение: "${book.title}"`);
      this.save(`Delete book ${book.title}`);
    }
  }

  // --- SHOP & REWARDS ---
  getShopItems() {
    return this.data?.shopItems || {
      frames: [
        { id: "frame-default", name: "Стандартная Оправа", price: 0, icon: "⚪", description: "Классическая строгая окантовка." },
        { id: "frame-neon", name: "Неоновый Пульс", price: 100, icon: "💠", description: "Бирюзовая неоновая пульсация." },
        { id: "frame-dragon", name: "Драконий Спектр", price: 250, icon: "🐉", description: "Голографический радужный вихрь." },
        { id: "frame-gold", name: "Золотой Триумф", price: 450, icon: "👑", description: "Императорский золотой ободок." },
        { id: "frame-void", name: "Глитч Пустоты", price: 700, icon: "🌀", description: "Кибернетический хроматический сдвиг." },
        { id: "frame-flame", name: "Плазменное Пламя", price: 950, icon: "🔥", description: "Пылающая плазменная граница." }
      ],
      backgrounds: [
        { id: "theme-cyberpunk", name: "Неоновый Киберпанк", price: 0, icon: "🌆", description: "Интерактивные неоновые частицы." },
        { id: "theme-cosmic", name: "Космическая Туманность", price: 150, icon: "🌌", description: "Параллакс звезд и туманность." },
        { id: "theme-amber", name: "Уютный Янтарь & Камин", price: 200, icon: "☕", description: "Теплые парящие золотые угольки." },
        { id: "theme-matrix", name: "Изумрудная Матрица", price: 350, icon: "📟", description: "Струящийся цифровой код матрицы." },
        { id: "theme-royal", name: "Полярная Аврора", price: 600, icon: "✨", description: "Золотистое северное сияние." }
      ],
      titles: [
        { id: "title-fan", name: "Любитель", price: 0 },
        { id: "title-worm", name: "Книжный Червь", price: 80 },
        { id: "title-connoisseur", name: "Знаток Глав", price: 180 },
        { id: "title-scholar", name: "Схоласт Сети", price: 350 },
        { id: "title-master", name: "Магистр Мысли", price: 600 },
        { id: "title-elder", name: "Старейшина Знаний", price: 1000 }
      ]
    };
  }

  getBadges() {
    return this.data?.badges || [];
  }

  getMiniGamesData() {
    return this.data?.miniGamesData || {};
  }

  // --- AUDIT LOGS ---
  addAuditLog(action, details, username = 'creator') {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const log = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: username,
      action: action,
      details: details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 50) this.data.auditLogs.pop();
  }

  getAuditLogs() {
    return this.data?.auditLogs || [];
  }

  // --- EXPORT & IMPORT ---
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.meta || !parsed.users || !parsed.books) {
        throw new Error('Некорректная структура файла JSON базы данных');
      }
      this.data = parsed;
      this.save('Imported database from JSON file');
      this.notify('imported', this.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async resetDatabase() {
    localStorage.removeItem(this.storageKey);
    const res = await fetch('database.json');
    if (res.ok) {
      this.data = await res.json();
    } else {
      this.data = this.getEmergencyDefaults();
    }
    this.persistLocally();
    this.notify('reset', this.data);
  }

  getEmergencyDefaults() {
    return {
      meta: { appName: "CyberLibris", version: "3.0.0", lastUpdated: new Date().toISOString() },
      users: [
        {
          id: "usr_creator",
          username: "admin",
          passwordHash: "admin123",
          role: "creator",
          displayName: "Верховный Создатель",
          avatar: "👑",
          avatarFrame: "frame-gold",
          customBg: "theme-royal",
          title: "Создатель Системы [CREATOR]",
          level: 35,
          xp: 14200,
          lumens: 5200,
          stats: { booksRead: 18, readTimeMinutes: 520, gamesWon: 64, speedRecordWPM: 620, cryptorSolved: 30, memoryFlips: 85, currentStreak: 21 },
          badges: ["creator_badge", "admin_power", "github_sync", "legend_reader"],
          unlockedCosmetics: { frames: ["frame-default", "frame-neon", "frame-dragon", "frame-gold", "frame-void", "frame-flame"], backgrounds: ["theme-cyberpunk", "theme-cosmic", "theme-amber", "theme-matrix", "theme-royal"], titles: ["Создатель Системы [CREATOR]"] },
          readingProgress: {},
          bookmarks: []
        }
      ],
      books: [],
      shopItems: this.getShopItems(),
      badges: [],
      auditLogs: []
    };
  }
}

window.dbEngine = new DatabaseEngine();

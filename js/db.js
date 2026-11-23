/**
 * CyberLibris Central Database Engine
 * Manages reactive data state, persistence to localStorage, and GitHub cloud sync.
 */
class DatabaseEngine {
  constructor() {
    this.storageKey = 'cyberlibris_database_v2';
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
        console.error('Failed to parse local DB, loading database.json', e);
      }
    }

    if (!this.data) {
      try {
        const res = await fetch('database.json');
        if (res.ok) {
          this.data = await res.json();
          this.persistLocally();
        }
      } catch (err) {
        console.warn('Could not fetch database.json, using fallback defaults', err);
        this.data = this.getEmergencyDefaults();
      }
    }

    // Attempt GitHub pull if live mode configured
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

  /**
   * Save database changes with automatic debounced GitHub sync
   */
  save(actionDescription = 'Update data') {
    this.persistLocally();
    this.notify('update', this.data);

    // Auto-commit to GitHub
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

  // --- USER ACCESSORS ---
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
    this.addAuditLog('USER_UPDATE', `Обновлен профиль: ${updatedUser.username}`);
    this.save(`Update user ${updatedUser.username}`);
  }

  // --- BOOK ACCESSORS ---
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
    this.addAuditLog('BOOK_ADDED', `Добавлена книга: "${book.title}"`);
    this.save(`Add book ${book.title}`);
  }

  updateBook(updatedBook) {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === updatedBook.id);
    if (idx !== -1) {
      books[idx] = updatedBook;
      this.addAuditLog('BOOK_UPDATED', `Отредактирована книга: "${updatedBook.title}"`);
      this.save(`Update book ${updatedBook.title}`);
    }
  }

  deleteBook(bookId) {
    const book = this.getBook(bookId);
    if (book) {
      this.data.books = this.data.books.filter((b) => b.id !== bookId);
      this.addAuditLog('BOOK_DELETED', `Удалена книга: "${book.title}"`);
      this.save(`Delete book ${book.title}`);
    }
  }

  // --- SHOP & BADGES ---
  getShopItems() {
    return this.data?.shopItems || { frames: [], backgrounds: [], titles: [] };
  }

  getBadges() {
    return this.data?.badges || [];
  }

  getMiniGamesData() {
    return this.data?.miniGamesData || {};
  }

  // --- AUDIT LOGS ---
  addAuditLog(action, details, username = 'current_user') {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const log = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: username,
      action: action,
      details: details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 50) {
      this.data.auditLogs.pop();
    }
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
        throw new Error('Некорректная схема JSON базы данных');
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
      meta: { appName: "CyberLibris", version: "2.4.0", lastUpdated: new Date().toISOString() },
      users: [
        {
          id: "usr_admin",
          username: "admin",
          passwordHash: "admin123",
          role: "admin",
          displayName: "Главный Архивариус",
          avatar: "⚡",
          avatarFrame: "frame-gold",
          customBg: "theme-royal",
          title: "Хранитель Истины [ADMIN]",
          level: 25,
          xp: 12850,
          lumens: 2400,
          stats: { booksRead: 12, readTimeMinutes: 340, gamesWon: 48, speedRecordWPM: 580, cryptorSolved: 24, memoryFlips: 62, currentStreak: 14 },
          badges: ["admin_power", "github_sync", "speed_demon", "crypto_master", "book_worm", "legend_reader"],
          unlockedCosmetics: { frames: ["frame-default", "frame-neon", "frame-dragon", "frame-gold", "frame-void", "frame-flame"], backgrounds: ["theme-cyberpunk", "theme-cosmic", "theme-amber", "theme-matrix", "theme-royal"], titles: ["Новичок", "Читатель", "Хранитель Истины [ADMIN]"] },
          readingProgress: {},
          bookmarks: []
        }
      ],
      books: [],
      shopItems: { frames: [], backgrounds: [], titles: [] },
      badges: [],
      auditLogs: []
    };
  }
}

window.dbEngine = new DatabaseEngine();

/**
 * CyberLibris Authentication & Player Progression System
 */
class AuthManager {
  constructor() {
    this.sessionKey = 'cyberlibris_active_user_id';
    this.currentUser = null;
    this.authListeners = [];
  }

  init() {
    const activeId = localStorage.getItem(this.sessionKey) || 'usr_scholar';
    this.currentUser = window.dbEngine.getUser(activeId);
    if (!this.currentUser) {
      // Fallback to first user or admin
      this.currentUser = window.dbEngine.getUsers()[0];
    }
    this.syncUserToUI();
  }

  onAuthChange(callback) {
    this.authListeners.push(callback);
  }

  notifyAuth(event) {
    this.authListeners.forEach((fn) => fn(event, this.currentUser));
    this.syncUserToUI();
  }

  login(username, password) {
    const user = window.dbEngine.getUsers().find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, message: 'Пользователь не найден!' };
    }

    if (user.passwordHash !== password) {
      return { success: false, message: 'Неверный пароль!' };
    }

    this.currentUser = user;
    localStorage.setItem(this.sessionKey, user.id);
    window.dbEngine.addAuditLog('USER_LOGIN', `Вход в систему: ${user.username}`, user.username);
    this.notifyAuth('login');
    return { success: true, user: this.currentUser };
  }

  register(username, password, displayName, avatar = '🚀') {
    if (!username || username.trim().length < 3) {
      return { success: false, message: 'Имя пользователя должно содержать не менее 3 символов!' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Пароль должен содержать не менее 4 символов!' };
    }

    const existing = window.dbEngine.getUsers().find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'Такое имя пользователя уже занято!' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      passwordHash: password,
      role: 'user',
      displayName: displayName?.trim() || username.trim(),
      avatar: avatar,
      avatarFrame: 'frame-default',
      customBg: 'theme-cyberpunk',
      title: 'Новичок Сети',
      level: 1,
      xp: 0,
      lumens: 100, // Starter bonus
      stats: {
        booksRead: 0,
        readTimeMinutes: 0,
        gamesWon: 0,
        speedRecordWPM: 0,
        cryptorSolved: 0,
        memoryFlips: 0,
        currentStreak: 1
      },
      badges: ['first_steps'],
      unlockedCosmetics: {
        frames: ['frame-default'],
        backgrounds: ['theme-cyberpunk'],
        titles: ['Новичок Сети']
      },
      readingProgress: {},
      bookmarks: []
    };

    window.dbEngine.getUsers().push(newUser);
    window.dbEngine.addAuditLog('USER_REGISTERED', `Зарегистрирован новый читатель: ${newUser.username}`, newUser.username);
    window.dbEngine.save(`Register user ${newUser.username}`);

    this.currentUser = newUser;
    localStorage.setItem(this.sessionKey, newUser.id);
    this.notifyAuth('register');
    return { success: true, user: newUser };
  }

  logout() {
    window.dbEngine.addAuditLog('USER_LOGOUT', `Выход из системы: ${this.currentUser?.username}`, this.currentUser?.username);
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    this.notifyAuth('logout');
  }

  isAdmin() {
    return this.currentUser?.role === 'admin';
  }

  // --- PROGRESSION & REWARDS ---

  addXp(amount) {
    if (!this.currentUser) return;
    this.currentUser.xp = (this.currentUser.xp || 0) + amount;

    // Check level up: XP needed = level * 450
    const needed = this.currentUser.level * 450;
    if (this.currentUser.xp >= needed) {
      this.currentUser.level += 1;
      this.currentUser.xp -= needed;
      this.currentUser.lumens = (this.currentUser.lumens || 0) + 150; // Bonus lumens
      this.triggerLevelUpCelebration(this.currentUser.level);
    }

    this.saveUser();
    this.syncUserToUI();
  }

  addLumens(amount) {
    if (!this.currentUser) return;
    this.currentUser.lumens = Math.max(0, (this.currentUser.lumens || 0) + amount);
    this.saveUser();
    this.syncUserToUI();
  }

  updateStat(statKey, delta = 1, isMax = false) {
    if (!this.currentUser) return;
    if (!this.currentUser.stats) this.currentUser.stats = {};

    if (isMax) {
      this.currentUser.stats[statKey] = Math.max(this.currentUser.stats[statKey] || 0, delta);
    } else {
      this.currentUser.stats[statKey] = (this.currentUser.stats[statKey] || 0) + delta;
    }

    this.checkBadges();
    this.saveUser();
    this.syncUserToUI();
  }

  awardBadge(badgeId) {
    if (!this.currentUser) return;
    if (!this.currentUser.badges.includes(badgeId)) {
      this.currentUser.badges.push(badgeId);
      const badge = window.dbEngine.getBadges().find((b) => b.id === badgeId);
      if (window.app) {
        window.app.showToast(`🏆 Получен новый значок: "${badge?.name || badgeId}"!`, 'reward');
        if (window.soundEngine) window.soundEngine.playCorrect();
      }
      this.saveUser();
    }
  }

  checkBadges() {
    const s = this.currentUser.stats || {};
    if ((s.booksRead || 0) >= 1) this.awardBadge('first_book');
    if ((s.booksRead || 0) >= 5) this.awardBadge('book_worm');
    if ((s.speedRecordWPM || 0) >= 400) this.awardBadge('speed_demon');
    if ((s.cryptorSolved || 0) >= 10) this.awardBadge('crypto_master');
    if (this.currentUser.level >= 20) this.awardBadge('legend_reader');
    if (this.isAdmin()) this.awardBadge('admin_power');
  }

  triggerLevelUpCelebration(newLevel) {
    if (window.soundEngine) window.soundEngine.playLevelUp();
    if (window.app) {
      window.app.showLevelUpModal(newLevel);
    }
  }

  saveUser() {
    if (this.currentUser) {
      window.dbEngine.saveUser(this.currentUser);
    }
  }

  syncUserToUI() {
    const user = this.currentUser;
    const body = document.body;

    // Toggle admin class
    if (user && user.role === 'admin') {
      body.classList.add('is-admin');
    } else {
      body.classList.remove('is-admin');
    }

    // Set background theme if equipped
    if (user?.customBg && window.reactiveBg) {
      window.reactiveBg.setTheme(user.customBg);
    }

    // Update Header Pill
    const pill = document.getElementById('user-pill-container');
    if (pill) {
      if (user) {
        pill.innerHTML = `
          <div class="user-pill">
            <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}">
              <div class="user-avatar-small">${user.avatar || '⚡'}</div>
            </div>
            <div class="user-pill-info">
              <div class="user-pill-name">${user.displayName || user.username}</div>
              <div class="user-pill-stats">
                <span>Ур. ${user.level}</span>
                <span>•</span>
                <span>${user.lumens || 0} ⬡</span>
              </div>
            </div>
          </div>
        `;
      } else {
        pill.innerHTML = `
          <button class="btn btn-primary btn-sm" id="btn-open-login">
            Войти / Регистрация
          </button>
        `;
      }
    }
  }
}

window.auth = new AuthManager();

/**
 * CyberLibris Authentication & Strict Hierarchy System
 * Roles:
 *  1. creator (Создатель) - Weight 100: GitHub Integration, full DB authority. Cannot be demoted.
 *  2. owner (Овнер) - Weight 80: Full System Management, DB Export/Import, User Promotions up to Admin.
 *  3. admin (Администратор) - Weight 60: Library CRUD, Mutes/Bans, Lumen grants.
 *  4. moderator (Модератор) - Weight 40: Audit logs, user warnings.
 *  5. user (Читатель) - Weight 10: Dynamic rank tags: Любитель, Книжный Червь, Знаток Глав, Схоласт Сети, Магистр Мысли, Старейшина Знаний.
 */
class AuthManager {
  constructor() {
    this.sessionKey = 'cyberlibris_active_user_id';
    this.currentUser = null;
    this.authListeners = [];

    this.roleWeights = {
      creator: 100,
      owner: 80,
      admin: 60,
      moderator: 40,
      user: 10
    };
  }

  init() {
    const activeId = localStorage.getItem(this.sessionKey) || 'usr_creator';
    this.currentUser = window.dbEngine.getUser(activeId);
    if (!this.currentUser) {
      // Default fallback to Creator
      this.currentUser = window.dbEngine.getUsers().find((u) => u.role === 'creator') || window.dbEngine.getUsers()[0];
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

  // --- HIERARCHY & ROLE CHECKS ---

  getRoleWeight(role) {
    return this.roleWeights[role] || 10;
  }

  isCreator() {
    return this.currentUser?.role === 'creator';
  }

  isOwner() {
    return this.isCreator() || this.currentUser?.role === 'owner';
  }

  isAdmin() {
    return this.isOwner() || this.currentUser?.role === 'admin';
  }

  isModerator() {
    return this.isAdmin() || this.currentUser?.role === 'moderator';
  }

  canManage(targetUser) {
    if (!this.currentUser || !targetUser) return false;
    // Cannot manage self (prevents accidental self-demotion!)
    if (this.currentUser.id === targetUser.id) return false;
    // Target creator cannot be modified by anyone
    if (targetUser.role === 'creator') return false;
    // Must have strictly higher role weight
    return this.getRoleWeight(this.currentUser.role) > this.getRoleWeight(targetUser.role);
  }

  getUserRankTag(level) {
    const lvl = level || 1;
    if (lvl >= 30) return 'Старейшина Знаний';
    if (lvl >= 20) return 'Магистр Мысли';
    if (lvl >= 15) return 'Схоласт Сети';
    if (lvl >= 10) return 'Знаток Глав';
    if (lvl >= 5) return 'Книжный Червь';
    return 'Любитель';
  }

  getRoleBadgeHTML(role, level) {
    if (role === 'creator') return '<span class="logo-badge" style="border-color: #ffd700; color: #ffd700; background: rgba(255,215,0,0.15); font-weight: 800;">👑 СОЗДАТЕЛЬ</span>';
    if (role === 'owner') return '<span class="logo-badge" style="border-color: #ff9100; color: #ff9100; background: rgba(255,145,0,0.15); font-weight: 800;">⚜️ ОВНЕР</span>';
    if (role === 'admin') return '<span class="logo-badge" style="border-color: #00f0ff; color: #00f0ff; background: rgba(0,240,255,0.15); font-weight: 800;">⚡ АДМИНИСТРАТОР</span>';
    if (role === 'moderator') return '<span class="logo-badge" style="border-color: #00ff88; color: #00ff88; background: rgba(0,255,136,0.15); font-weight: 800;">🛡️ МОДЕРАТОР</span>';
    
    // Regular reader rank tag
    const tag = this.getUserRankTag(level);
    return `<span class="logo-badge" style="border-color: var(--border-glass); color: var(--text-muted);">${tag}</span>`;
  }

  // --- RECOVERY MECHANISM (IF USER ACCIDENTALLY DEMOTED THEMSELVES) ---
  recoverCreatorRights() {
    if (!this.currentUser) {
      this.login('admin', 'admin123');
      return;
    }
    this.currentUser.role = 'creator';
    this.currentUser.title = 'Создатель Системы [CREATOR]';
    this.currentUser.avatar = '👑';
    this.currentUser.avatarFrame = 'frame-gold';
    this.saveUser();
    this.syncUserToUI();
    window.app.showToast('Верховные права Создателя успешно восстановлены', 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // --- AUTHENTICATION ---

  login(username, password) {
    const user = window.dbEngine.getUsers().find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );

    if (!user) {
      return { success: false, message: 'Пользователь с таким именем не найден!' };
    }

    if (user.passwordHash !== password) {
      return { success: false, message: 'Неверный пароль!' };
    }

    this.currentUser = user;
    localStorage.setItem(this.sessionKey, user.id);
    window.dbEngine.addAuditLog('USER_LOGIN', `Вход: @${user.username} (${user.role.toUpperCase()})`, user.username);
    this.notifyAuth('login');
    return { success: true, user: this.currentUser };
  }

  register(username, password, displayName, avatar = '📖') {
    if (!username || username.trim().length < 3) {
      return { success: false, message: 'Логин должен содержать от 3 символов!' };
    }
    if (!password || password.length < 4) {
      return { success: false, message: 'Пароль должен содержать от 4 символов!' };
    }

    const existing = window.dbEngine.getUsers().find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'Пользователь с таким логином уже существует!' };
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: username.trim(),
      passwordHash: password,
      role: 'user', // strictly regular reader
      displayName: displayName?.trim() || username.trim(),
      avatar: avatar,
      avatarFrame: 'frame-default',
      customBg: 'theme-cyberpunk',
      title: 'Любитель',
      level: 1,
      xp: 0,
      lumens: 150,
      stats: {
        booksRead: 0,
        readTimeMinutes: 0,
        gamesWon: 0,
        speedRecordWPM: 0,
        cryptorSolved: 0,
        memoryFlips: 0,
        currentStreak: 1
      },
      badges: ['book_worm'],
      unlockedCosmetics: {
        frames: ['frame-default'],
        backgrounds: ['theme-cyberpunk'],
        titles: ['Любитель']
      },
      readingProgress: {},
      bookmarks: []
    };

    window.dbEngine.getUsers().push(newUser);
    window.dbEngine.addAuditLog('USER_REGISTERED', `Новый читатель: @${newUser.username}`, newUser.username);
    window.dbEngine.save(`Register user ${newUser.username}`);

    this.currentUser = newUser;
    localStorage.setItem(this.sessionKey, newUser.id);
    this.notifyAuth('register');
    return { success: true, user: newUser };
  }

  logout() {
    window.dbEngine.addAuditLog('USER_LOGOUT', `Выход: @${this.currentUser?.username}`, this.currentUser?.username);
    this.currentUser = null;
    localStorage.removeItem(this.sessionKey);
    this.notifyAuth('logout');
  }

  // --- REWARDS & PROGRESSION ---

  addXp(amount) {
    if (!this.currentUser) return;
    this.currentUser.xp = (this.currentUser.xp || 0) + amount;

    // Check level up: XP needed = level * 400
    const needed = this.currentUser.level * 400;
    if (this.currentUser.xp >= needed) {
      this.currentUser.level += 1;
      this.currentUser.xp -= needed;
      this.currentUser.lumens = (this.currentUser.lumens || 0) + 150;

      // Update dynamic rank tag if user role is reader
      if (this.currentUser.role === 'user') {
        this.currentUser.title = this.getUserRankTag(this.currentUser.level);
      }

      this.triggerLevelUpCelebration(this.currentUser.level);
    }

    this.saveUser();
    this.syncUserToUI();
  }

  addXP(amount) {
    return this.addXp(amount);
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
    if (!this.currentUser.badges) this.currentUser.badges = [];
    if (!this.currentUser.badges.includes(badgeId)) {
      this.currentUser.badges.push(badgeId);
      const badge = window.dbEngine.getBadges().find((b) => b.id === badgeId);
      if (window.app) {
        window.app.showToast(`Получено достижение: «${badge?.name || badgeId}»`, 'reward');
        if (window.soundEngine) window.soundEngine.playCorrect();
      }
      this.saveUser();
    }
  }

  checkBadges() {
    const s = this.currentUser.stats || {};
    if ((s.booksRead || 0) >= 1 || (s.chaptersRead || 0) >= 1) this.awardBadge('book_first_page');
    if ((s.booksRead || 0) >= 3 || (s.chaptersRead || 0) >= 10) this.awardBadge('book_worm');
    if ((s.reviewsWritten || 0) >= 1) this.awardBadge('literary_critic');
    if ((s.quizzesPassed || 0) >= 3 || (s.cryptorSolved || 0) >= 3) this.awardBadge('quiz_erudite');
    if ((s.classicChaptersRead || 0) >= 3) this.awardBadge('classic_connoisseur');
    if ((s.scifiChaptersRead || 0) >= 3) this.awardBadge('scifi_explorer');
    if ((s.militaryChaptersRead || 0) >= 3) this.awardBadge('military_veteran');
    // philosophy sage removed per feedback
    
    // Check night reading (between 22:00 and 06:00)
    const currentHour = new Date().getHours();
    if (currentHour >= 22 || currentHour < 6) {
      if ((s.chaptersRead || 0) >= 2) this.awardBadge('night_reader');
    }
  }

  triggerLevelUpCelebration(newLevel) {
    if (window.soundEngine) window.soundEngine.playLevelUp();
    if (window.app?.showLevelUpModal) {
      window.app.showLevelUpModal(newLevel);
    }
  }

  saveUser() {
    if (this.currentUser) {
      window.dbEngine.saveUser(this.currentUser);
    }
  }

  // --- SYNC UI TO ROLE HIERARCHY ---

  syncUserToUI() {
    const user = this.currentUser;
    const body = document.body;

    // Reset role classes
    body.classList.remove('is-creator', 'is-owner', 'is-admin', 'is-moderator', 'is-user');

    if (user) {
      if (user.role === 'creator') {
        body.classList.add('is-creator', 'is-owner', 'is-admin', 'is-moderator');
      } else if (user.role === 'owner') {
        body.classList.add('is-owner', 'is-admin', 'is-moderator');
      } else if (user.role === 'admin') {
        body.classList.add('is-admin', 'is-moderator');
      } else if (user.role === 'moderator') {
        body.classList.add('is-moderator');
      } else {
        body.classList.add('is-user');
      }
    } else {
      body.classList.add('is-user');
    }

    // Set background theme if equipped
    if (user?.customBg && window.reactiveBg) {
      window.reactiveBg.setTheme(user.customBg);
    }
    if (user?.particleShape && window.reactiveBg) {
      window.reactiveBg.setParticleShape(user.particleShape);
    }

    // Update Header User Pill
    const pill = document.getElementById('user-pill-container');
    if (pill) {
      if (user) {
        const roleIcon = user.role === 'creator' ? '👑' : user.role === 'owner' ? '⚜️' : user.role === 'admin' ? '⚡' : user.role === 'moderator' ? '🛡️' : '';
        const rankTag = user.role === 'user' ? this.getUserRankTag(user.level) : (user.title || user.role.toUpperCase());

        pill.innerHTML = `
          <div class="user-pill" title="Профиль: ${user.displayName} (${rankTag})">
            <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}">
              <div class="user-avatar-small">${user.avatar || '📖'}</div>
            </div>
            <div class="user-pill-info">
              <div class="user-pill-name">${roleIcon} ${user.displayName || user.username}</div>
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

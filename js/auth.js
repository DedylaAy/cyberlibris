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
    let user = window.dbEngine.getUser(activeId);

    // Bulletproof sync from dedicated user persistence
    try {
      const savedUserStr = localStorage.getItem('cyberlibris_user_' + activeId);
      if (savedUserStr) {
        const savedUser = JSON.parse(savedUserStr);
        if (savedUser && savedUser.id === activeId) {
          if (user) {
            Object.assign(user, savedUser);
          } else {
            user = savedUser;
            window.dbEngine.getUsers().push(user);
          }
        }
      }
    } catch (e) {}

    if (!user) {
      // Default fallback to Creator
      user = window.dbEngine.getUsers().find((u) => u.role === 'creator') || window.dbEngine.getUsers()[0];
    }
    this.currentUser = user;
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
    if (window.soundEngine?.playCorrect) window.soundEngine.playCorrect();
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

  getXpNeededForNextLevel(level) {
    const lvl = Math.max(1, parseInt(level, 10) || 1);
    return Math.floor(lvl * 1500 + Math.pow(lvl, 2) * 200);
  }

  addXp(amount) {
    if (!this.currentUser) return;
    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) return;

    this.currentUser.level = Math.max(1, parseInt(this.currentUser.level, 10) || 1);
    this.currentUser.xp = Math.max(0, parseInt(this.currentUser.xp, 10) || 0) + val;

    // Check level up with realistic RPG curve
    let needed = this.getXpNeededForNextLevel(this.currentUser.level);
    let leveledUp = false;

    while (this.currentUser.xp >= needed) {
      this.currentUser.level += 1;
      this.currentUser.xp -= needed;
      this.currentUser.lumens = (this.currentUser.lumens || 0) + 150;
      leveledUp = true;
      needed = this.getXpNeededForNextLevel(this.currentUser.level);
    }

    if (leveledUp) {
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

  switchUser(userId) {
    const user = window.dbEngine.getUser(userId);
    if (!user) return false;
    this.currentUser = user;
    localStorage.setItem(this.sessionKey, user.id);
    this.notifyAuth('switch');
    if (user.customBg && window.reactiveBg) {
      window.reactiveBg.setTheme(user.customBg);
    }
    if (user.particleShape && window.reactiveBg) {
      window.reactiveBg.setParticleShape(user.particleShape);
    }
    return true;
  }

  saveUserTheme(themeId) {
    if (!this.currentUser) return;
    this.currentUser.customBg = themeId;
    this.saveUser();
  }

  saveUserParticleShape(shape) {
    if (!this.currentUser) return;
    this.currentUser.particleShape = shape;
    this.saveUser();
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
    if (window.app?.showToast) {
      window.app.showToast(`⭐ Уровень повышен: Ур. ${newLevel}! Награда: +150 ⬡ Люменов`, 'reward');
    }
  }

  saveUser() {
    if (this.currentUser) {
      try {
        localStorage.setItem('cyberlibris_user_' + this.currentUser.id, JSON.stringify(this.currentUser));
      } catch (e) {}
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

    // Set background theme and particle shape if equipped per user
    if (user?.customBg && window.reactiveBg) {
      window.reactiveBg.setTheme(user.customBg);
    }
    if (user?.particleShape && window.reactiveBg) {
      window.reactiveBg.setParticleShape(user.particleShape);
    }

    // Update Header User Pill with Steam-style dropdown
    const pill = document.getElementById('user-pill-container');
    if (pill) {
      if (user) {
        const roleIcon = user.role === 'creator' ? '👑' : user.role === 'owner' ? '⚜️' : user.role === 'admin' ? '⚡' : user.role === 'moderator' ? '🛡️' : '';
        const rankTag = user.role === 'user' ? this.getUserRankTag(user.level) : (user.title || user.role.toUpperCase());
        const xpNeeded = this.getXpNeededForNextLevel(user.level);
        const xpCurrent = user.xp || 0;
        const xpPct = Math.min(100, Math.round((xpCurrent / xpNeeded) * 100));

        const allUsers = window.dbEngine?.getUsers() || [];
        const otherUsersHtml = allUsers.map(u => {
          const isCurrent = u.id === user.id;
          return `
            <div class="steam-quick-user-row ${isCurrent ? 'active' : ''}" data-user-id="${u.id}">
              <div class="steam-quick-user-info">
                <span>${u.avatar || '📖'}</span>
                <span>${u.displayName || u.username}</span>
                <small style="color:var(--text-dim); font-size:0.7rem;">(${u.role === 'user' ? 'Ур. ' + (u.level || 1) : u.role})</small>
              </div>
              <span style="font-size:0.75rem; color:${isCurrent ? 'var(--accent-green)' : 'var(--accent-cyan)'}; font-weight:700;">
                ${isCurrent ? '● Активен' : 'Сменить →'}
              </span>
            </div>
          `;
        }).join('');

        pill.innerHTML = `
          <div class="steam-user-container" id="steam-user-container">
            <div class="steam-profile-pill magnetic-btn" id="btn-steam-profile-trigger" title="Открыть меню профиля Steam">
              <div class="steam-avatar-badge">${user.avatar || '📖'}</div>
              <div class="steam-pill-meta">
                <div class="steam-pill-name">${roleIcon} ${user.displayName || user.username}</div>
                <div class="steam-pill-stats">
                  <span class="steam-pill-level">Ур. ${user.level}</span>
                  <span>•</span>
                  <span class="steam-pill-lumens">${user.lumens || 0} ⬡</span>
                </div>
              </div>
              <span class="steam-pill-chevron">▾</span>
            </div>

            <!-- Steam Dropdown Menu -->
            <div class="steam-profile-dropdown" id="steam-profile-dropdown">
              <div class="steam-drop-header">
                <div class="steam-drop-avatar">${user.avatar || '📖'}</div>
                <div class="steam-drop-user-info">
                  <div class="steam-drop-username">${user.displayName || user.username}</div>
                  <div class="steam-drop-role-tag">${roleIcon} ${rankTag} · В сети</div>
                </div>
              </div>

              <div class="steam-drop-progress-row">
                <div class="steam-drop-bar-header">
                  <span>Опыт читателя (XP):</span>
                  <span><strong>${xpCurrent}</strong> / ${xpNeeded} XP (${xpPct}%)</span>
                </div>
                <div class="steam-drop-bar-track">
                  <div class="steam-drop-bar-fill" style="width: ${xpPct}%"></div>
                </div>
              </div>

              <div class="steam-drop-actions-list">
                <button class="steam-drop-item" data-action="profile">
                  <span class="steam-drop-item-icon">👤</span> <span>Мой профиль читателя</span>
                </button>
                <button class="steam-drop-item" data-action="profile-edit">
                  <span class="steam-drop-item-icon">🎨</span> <span>Редактировать профиль</span>
                </button>
                <button class="steam-drop-item" data-action="inventory">
                  <span class="steam-drop-item-icon">🎒</span> <span>Инвентарь & Артефакты</span>
                </button>
                <button class="steam-drop-item" data-action="themes">
                  <span class="steam-drop-item-icon">🎨</span> <span>Темы & Частицы фона</span>
                </button>
                <button class="steam-drop-item" data-action="roadmap">
                  <span class="steam-drop-item-icon">🚀</span> <span>Этапы развития сайта</span>
                </button>
              </div>

              <div class="steam-drop-accounts-block">
                <div class="steam-drop-accounts-title">Быстрая смена профиля:</div>
                <div class="steam-drop-users-grid" id="steam-quick-users-list">
                  ${otherUsersHtml}
                </div>
                <div class="steam-drop-footer-btns">
                  <button class="btn btn-secondary btn-sm" id="btn-steam-open-auth-modal" style="flex:1; font-size:0.78rem;">
                    ➕ Войти / Новый аккаунт
                  </button>
                  <button class="btn btn-outline btn-sm" id="btn-steam-logout" style="font-size:0.78rem;">
                    Выход
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        this.bindSteamDropdown();
      } else {
        pill.innerHTML = `
          <button class="btn btn-primary btn-sm magnetic-btn" id="btn-open-login" style="padding:0.45rem 1rem;">
            👤 Войти / Регистрация
          </button>
        `;
        document.getElementById('btn-open-login')?.addEventListener('click', () => {
          window.app?.openModal?.('modal-auth');
        });
      }
    }

    if (window.miniGames?.updateEnergyUI) {
      window.miniGames.updateEnergyUI();
    }
  }

  bindSteamDropdown() {
    const trigger = document.getElementById('btn-steam-profile-trigger');
    const dropdown = document.getElementById('steam-profile-dropdown');
    if (!trigger || !dropdown) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      document.querySelectorAll('.steam-profile-dropdown, .theme-palette-dropdown, .ambient-dropdown').forEach(d => d.classList.remove('open'));
      trigger.classList.toggle('active', !isOpen);
      dropdown.classList.toggle('open', !isOpen);
    });

    dropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
      trigger.classList.remove('active');
    });

    // Dropdown Action items
    dropdown.querySelectorAll('.steam-drop-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.action;
        dropdown.classList.remove('open');
        trigger.classList.remove('active');

        if (action === 'profile') {
          window.app?.switchView?.('profile');
        } else if (action === 'profile-edit') {
          window.app?.switchView?.('profile-edit');
        } else if (action === 'inventory') {
          window.app?.switchView?.('shop');
        } else if (action === 'themes') {
          document.getElementById('btn-theme-picker-trigger')?.click();
        } else if (action === 'roadmap') {
          window.app?.openRoadmapModal?.();
        }
      });
    });

    // Quick user switch in dropdown
    dropdown.querySelectorAll('.steam-quick-user-row').forEach(row => {
      row.addEventListener('click', () => {
        const userId = row.dataset.userId;
        if (userId && userId !== this.currentUser?.id) {
          dropdown.classList.remove('open');
          trigger.classList.remove('active');
          this.switchUser(userId);
          window.app?.showToast?.(`Переключено на аккаунт: ${this.currentUser?.displayName || this.currentUser?.username}`, 'info');
        }
      });
    });

    // Open Auth modal
    document.getElementById('btn-steam-open-auth-modal')?.addEventListener('click', () => {
      dropdown.classList.remove('open');
      trigger.classList.remove('active');
      window.app?.openModal?.('modal-auth');
    });

    // Logout
    document.getElementById('btn-steam-logout')?.addEventListener('click', () => {
      dropdown.classList.remove('open');
      trigger.classList.remove('active');
      this.logout();
    });
  }

  bindAuthModalTabs() {
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-register');
    const tabSwitch = document.getElementById('tab-btn-switch-account');
    const formLogin = document.getElementById('form-login');
    const formReg = document.getElementById('form-register');
    const panelSwitch = document.getElementById('auth-panel-switch');
    const title = document.getElementById('auth-modal-title');

    if (!tabLogin || !tabReg) return;

    const showTab = (mode) => {
      [tabLogin, tabReg, tabSwitch].forEach(b => b?.classList.remove('active'));
      if (formLogin) formLogin.style.display = 'none';
      if (formReg) formReg.style.display = 'none';
      if (panelSwitch) panelSwitch.style.display = 'none';

      if (mode === 'login') {
        tabLogin.classList.add('active');
        if (formLogin) formLogin.style.display = 'block';
        if (title) title.textContent = 'Вход в CyberLibris';
      } else if (mode === 'register') {
        tabReg.classList.add('active');
        if (formReg) formReg.style.display = 'block';
        if (title) title.textContent = 'Регистрация читателя';
      } else if (mode === 'switch') {
        tabSwitch?.classList.add('active');
        if (panelSwitch) panelSwitch.style.display = 'block';
        if (title) title.textContent = 'Смена активного профиля';
        this.renderAuthSwitchUsers();
      }
    };

    tabLogin.addEventListener('click', () => showTab('login'));
    tabReg.addEventListener('click', () => showTab('register'));
    tabSwitch?.addEventListener('click', () => showTab('switch'));
  }

  renderAuthSwitchUsers() {
    const container = document.getElementById('auth-switch-users-list');
    if (!container) return;
    const users = window.dbEngine?.getUsers() || [];
    container.innerHTML = '';

    users.forEach(u => {
      const isCur = u.id === this.currentUser?.id;
      const row = document.createElement('div');
      row.className = `steam-quick-user-row ${isCur ? 'active' : ''}`;
      row.style.padding = '0.75rem 1rem';
      row.innerHTML = `
        <div class="steam-quick-user-info" style="gap: 0.8rem;">
          <span style="font-size: 1.6rem;">${u.avatar || '📖'}</span>
          <div>
            <div style="font-weight: 800; color: #fff; font-size: 0.95rem;">${u.displayName || u.username}</div>
            <div style="color: var(--text-dim); font-size: 0.75rem;">${u.role.toUpperCase()} · Ур. ${u.level || 1} · ${u.lumens || 0} ⬡</div>
          </div>
        </div>
        <button class="btn btn-sm ${isCur ? 'btn-outline' : 'btn-primary'}" style="pointer-events: ${isCur ? 'none' : 'auto'};">
          ${isCur ? '✓ Выбран' : 'Войти →'}
        </button>
      `;
      row.addEventListener('click', () => {
        if (!isCur) {
          this.switchUser(u.id);
          window.app?.closeAllModals?.();
          window.app?.showToast?.(`Вы вошли как @${u.username} (${u.displayName})`, 'reward');
        }
      });
      container.appendChild(row);
    });
  }
}

window.auth = new AuthManager();

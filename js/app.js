/**
 * CyberLibris Application Master Controller
 * Steam-style Library with Rarity tiers, Recommendations, and Strict Hierarchy UI.
 */
class AppController {
  constructor() {
    this.currentView = 'library';
    this.selectedGenre = 'all';
    this.selectedRarity = 'all';
    this.searchQuery = '';
  }

  async init() {
    // 1. Initialize Database
    await window.dbEngine.init();

    // 2. Initialize Auth
    window.auth.init();

    // 3. Initialize Reader & Games
    window.readerEngine.init();
    window.miniGames.init();

    // 4. Setup Micro-interactions & Listeners
    this.bindNavigation();
    this.bindModals();
    this.bindTiltEffect();
    this.bindMagneticButtons();
    this.bindAudioTriggers();
    this.bindSearchAndFilters();
    this.bindOpenLibraryExplorer();

    // 5. Initial Render
    this.renderLibrary();
    this.renderDailyQuests();
    this.updateLocalBooksCount();
    this.updateAudioButtonState();

    console.log('⚡ CyberLibris v3.0 (Steam Edition) Ready.');
  }

  // --- NAVIGATION & VIEW ROUTING ---

  bindNavigation() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const view = e.currentTarget.dataset.view;
        if (view) {
          this.switchView(view);
        }
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

    // GitHub Pill click (Creator only)
    document.getElementById('btn-github-status')?.addEventListener('click', () => {
      if (window.auth.isCreator()) {
        this.openGitHubModal();
      } else {
        this.showToast('Интеграция с GitHub доступна только Создателю (Основателю) платформы.', 'error');
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
      this.showToast('Доступ запрещен. Необходимы права Администратора или Создателя.', 'error');
      return;
    }

    this.currentView = viewName;

    // Update active nav button
    document.querySelectorAll('.nav-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Switch view sections
    document.querySelectorAll('.view-section').forEach((sec) => {
      sec.classList.remove('active');
    });

    const targetSection = document.getElementById(`view-${viewName}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    // View-specific renders
    if (viewName === 'library') this.renderLibrary();
    else if (viewName === 'games') window.miniGames.switchGame(window.miniGames.currentGame);
    else if (viewName === 'shop') window.miniGames.renderShop();
    else if (viewName === 'leaderboard') this.renderLeaderboard();
    else if (viewName === 'profile') this.renderProfile();
    else if (viewName === 'admin') window.adminEngine.renderAdminView();

    if (window.soundEngine) window.soundEngine.playClick();
  }

  // --- STEAM-STYLE LIBRARY & RECOMMENDATIONS ---

  bindSearchAndFilters() {
    const searchInput = document.getElementById('library-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderLibrary();
      });
    }

    // Genre pills
    document.querySelectorAll('.genre-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.genre-pill').forEach((p) => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedGenre = e.currentTarget.dataset.genre;
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Rarity pills (Steam style)
    document.querySelectorAll('.rarity-filter-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.rarity-filter-pill').forEach((p) => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedRarity = e.currentTarget.dataset.rarity;
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    // Admin add book button
    document.getElementById('btn-open-add-book-library')?.addEventListener('click', () => {
      if (window.auth.isAdmin()) {
        window.adminEngine.openAddBookModal();
      } else {
        this.showToast('Добавлять книги могут только Администраторы!', 'info');
      }
    });
  }

  renderLibrary() {
    const books = window.dbEngine.getBooks();
    const currentUser = window.auth.currentUser;

    // 1. Render Steam Spotlight Recommendation Banner
    this.renderSteamSpotlight(books, currentUser);

    // 2. Filter Grid
    const grid = document.getElementById('books-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = books.filter((book) => {
      const matchGenre = this.selectedGenre === 'all' || book.genre.toLowerCase() === this.selectedGenre.toLowerCase();
      const matchRarity = this.selectedRarity === 'all' || (book.rarity || 'common') === this.selectedRarity;
      const matchSearch = !this.searchQuery ||
        book.title.toLowerCase().includes(this.searchQuery) ||
        book.author.toLowerCase().includes(this.searchQuery) ||
        (book.tags && book.tags.some((t) => t.toLowerCase().includes(this.searchQuery)));
      return matchGenre && matchRarity && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>Ничего не найдено по заданным фильтрам</h3>
          <p>Попробуйте сбросить фильтр редкости или изменить поисковый запрос.</p>
        </div>
      `;
      return;
    }

    filtered.forEach((book) => {
      const userProgress = currentUser?.readingProgress?.[book.id]?.progressPercent || 0;
      const rarity = book.rarity || 'common';

      const rarityBadgeHTML =
        rarity === 'legendary' ? '<span class="rarity-badge-legendary">🟠 ЛЕГЕНДАРНАЯ</span>' :
        rarity === 'epic' ? '<span class="rarity-badge-epic">🟣 ЭПИЧЕСКАЯ</span>' :
        rarity === 'rare' ? '<span class="rarity-badge-rare">🔵 ТОПОВАЯ</span>' :
        '<span class="rarity-badge-common">⚪ ОБЫЧНАЯ</span>';

      const complexityStars = '★'.repeat(book.complexity || 3) + '☆'.repeat(5 - (book.complexity || 3));

      const card = document.createElement('div');
      card.className = `cyber-card tilt-card book-card book-rarity-${rarity}`;

      card.innerHTML = `
        <div class="book-cover-banner" style="background: ${book.coverStyle || 'var(--bg-card)'};">
          ${book.coverImage ? `
            <img src="${book.coverImage}" class="book-cover-real-img" alt="${book.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" loading="lazy">
            <div class="book-cover-icon" style="display: none;">${book.coverIcon || '📖'}</div>
          ` : `
            <div class="book-cover-icon">${book.coverIcon || '📖'}</div>
          `}
          <div class="book-badges-overlay">
            ${rarityBadgeHTML}
            ${book.featuredBadge ? `<span class="steam-featured-tag">${book.featuredBadge}</span>` : ''}
          </div>
        </div>
        <div class="book-card-body">
          <div class="steam-meta-header">
            <span class="steam-genre-name">${book.genre}</span>
            <span class="steam-xp-badge">${book.xpMultiplier || 'x1.0 XP'}</span>
          </div>
          <h3 class="book-title">${book.title}</h3>
          <div class="book-author">✍ ${book.author} (${book.year})</div>
          
          <div class="steam-complexity-row">
            <span>Сложность: <strong style="color: var(--text-main);">${complexityStars}</strong></span>
            <span>~${book.estimatedReadTime || '10 мин'}</span>
          </div>

          <p class="book-description">${book.description}</p>
          
          <div class="book-tags-row">
            ${(book.tags || []).slice(0, 3).map((t) => `<span class="tag-pill">#${t}</span>`).join('')}
          </div>

          <div class="book-progress-wrapper">
            <div class="book-progress-info">
              <span>Прогресс изучения</span>
              <span style="color: var(--accent-cyan); font-weight: 700;">${userProgress}%</span>
            </div>
            <div class="book-progress-bar">
              <div class="book-progress-fill" style="width: ${userProgress}%;"></div>
            </div>
          </div>
        </div>
        <div class="book-card-footer">
          <div class="book-rating">★ ${book.rating || '4.9'}</div>
          <button class="btn btn-primary btn-sm btn-read-book magnetic-btn" data-id="${book.id}">
            ${userProgress > 0 ? 'Продолжить' : 'Читать'} →
          </button>
        </div>
      `;

      card.querySelector('.btn-read-book').addEventListener('click', () => {
        window.readerEngine.openBook(book.id, 0);
      });

      grid.appendChild(card);
    });

    this.bindTiltEffect();
  }

  renderSteamSpotlight(books, user) {
    const banner = document.getElementById('steam-spotlight-banner');
    if (!banner || books.length === 0) return;

    // Pick recommended book based on level:
    // Low level -> Common/Rare; High level -> Epic/Legendary
    const userLevel = user?.level || 1;
    let recommended = books.find((b) => userLevel >= 10 ? b.rarity === 'legendary' : b.rarity === 'epic') || books[0];

    banner.innerHTML = `
      <div class="spotlight-content">
        <div class="spotlight-badge-row">
          <span class="steam-spotlight-tag">🌟 РЕКОМЕНДАЦИЯ АЛГОРИТМА</span>
          ${recommended.rarity === 'legendary' ? '<span class="rarity-badge-legendary">🟠 ЛЕГЕНДАРНАЯ КНИГА</span>' : '<span class="rarity-badge-epic">🟣 ЭПИЧЕСКАЯ</span>'}
          <span class="steam-xp-badge" style="font-size: 0.8rem;">${recommended.xpMultiplier || 'x3.0 XP'}</span>
        </div>
        <h2 class="spotlight-title">${recommended.title}</h2>
        <div class="spotlight-author">Автор: <strong>${recommended.author}</strong> • Жанр: ${recommended.genre} • Рейтинг: ★ ${recommended.rating}</div>
        <p class="spotlight-desc">${recommended.description}</p>
        <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1.5rem;">
          <button class="btn btn-primary magnetic-btn" id="btn-spotlight-read" style="padding: 0.8rem 2rem; font-size: 1rem;">
            ▶ Начать Чтение (+Бонус XP)
          </button>
          <span style="font-size: 0.85rem; color: var(--text-muted);">Сложность: ${'★'.repeat(recommended.complexity || 5)} (${recommended.complexity || 5}/5)</span>
        </div>
      </div>
      <div class="spotlight-cover-visual" style="background: ${recommended.coverStyle};">
        ${recommended.coverImage ? `
          <img src="${recommended.coverImage}" alt="${recommended.title}" style="max-height: 220px; border-radius: 8px; box-shadow: 0 15px 30px rgba(0,0,0,0.7); object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" loading="lazy">
          <span style="display: none; font-size: 6rem; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.6));">${recommended.coverIcon || '💻'}</span>
        ` : `
          <span style="font-size: 6rem; filter: drop-shadow(0 15px 25px rgba(0,0,0,0.6));">${recommended.coverIcon || '💻'}</span>
        `}
      </div>
    `;

    document.getElementById('btn-spotlight-read')?.addEventListener('click', () => {
      window.readerEngine.openBook(recommended.id, 0);
    });
  }

  // --- LEADERBOARD ---

  renderLeaderboard() {
    const users = [...window.dbEngine.getUsers()];
    users.sort((a, b) => (b.level * 1000 + (b.stats?.readTimeMinutes || 0)) - (a.level * 1000 + (a.stats?.readTimeMinutes || 0)));

    const podiumContainer = document.getElementById('leaderboard-podium');
    if (podiumContainer) {
      podiumContainer.innerHTML = '';
      const top3 = users.slice(0, 3);
      const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

      podiumOrder.forEach((u) => {
        const rank = u === top3[0] ? 1 : u === top3[1] ? 2 : 3;
        const col = document.createElement('div');
        col.className = `podium-column rank-${rank} tilt-card`;

        const badgeHtml = window.auth.getRoleBadgeHTML(u.role, u.level);

        col.innerHTML = `
          <div class="podium-rank-badge">${rank === 1 ? '👑 #1' : rank === 2 ? '🥈 #2' : '🥉 #3'}</div>
          <div class="avatar-frame-wrap ${u.avatarFrame || 'frame-default'}" style="width: 70px; height: 70px; font-size: 2.2rem; margin: 0.8rem 0;">
            <div class="avatar-inner">${u.avatar || '📖'}</div>
          </div>
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.2rem;">${u.displayName || u.username}</h4>
          <div style="margin-bottom: 0.6rem;">${badgeHtml}</div>
          <div class="podium-stats-box">
            <div>Уровень: <strong>${u.level}</strong></div>
            <div>Время: <strong>${u.stats?.readTimeMinutes || 0} мин</strong></div>
            <div>Рекорд WPM: <strong>${u.stats?.speedRecordWPM || 0}</strong></div>
          </div>
        `;

        col.addEventListener('click', () => this.openUserDossier(u));
        podiumContainer.appendChild(col);
      });
    }

    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      users.forEach((u, idx) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        const badgeHtml = window.auth.getRoleBadgeHTML(u.role, u.level);

        tr.innerHTML = `
          <td><strong style="color: ${idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'};">#${idx + 1}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="avatar-frame-wrap ${u.avatarFrame || 'frame-default'}" style="width: 36px; height: 36px; font-size: 1.1rem;">
                <div class="avatar-inner">${u.avatar || '📖'}</div>
              </div>
              <div>
                <strong style="color: #fff;">${u.displayName || u.username}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">@${u.username}</div>
              </div>
            </div>
          </td>
          <td>${badgeHtml}</td>
          <td>Ур. ${u.level}</td>
          <td>${u.stats?.readTimeMinutes || 0} мин</td>
          <td>⚡ ${u.stats?.speedRecordWPM || 0} WPM</td>
          <td>${u.stats?.gamesWon || 0} побед</td>
        `;

        tr.addEventListener('click', () => this.openUserDossier(u));
        tbody.appendChild(tr);
      });
    }

    this.bindTiltEffect();
  }

  openUserDossier(user) {
    const modal = document.getElementById('modal-user-dossier');
    if (!modal) return;

    document.getElementById('dossier-avatar-wrap').className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-default'}`;
    document.getElementById('dossier-avatar').textContent = user.avatar || '📖';
    document.getElementById('dossier-name').textContent = user.displayName || user.username;
    document.getElementById('dossier-handle').textContent = `@${user.username}`;
    document.getElementById('dossier-title').innerHTML = window.auth.getRoleBadgeHTML(user.role, user.level);
    document.getElementById('dossier-level').textContent = user.level;
    document.getElementById('dossier-readtime').textContent = `${user.stats?.readTimeMinutes || 0} мин`;
    document.getElementById('dossier-wpm').textContent = `${user.stats?.speedRecordWPM || 0} WPM`;
    document.getElementById('dossier-games').textContent = user.stats?.gamesWon || 0;

    const badgesContainer = document.getElementById('dossier-badges');
    badgesContainer.innerHTML = '';
    const allBadges = window.dbEngine.getBadges();
    allBadges.forEach((b) => {
      const hasBadge = user.badges?.includes(b.id);
      const span = document.createElement('div');
      span.className = `badge-pill ${hasBadge ? 'unlocked' : 'locked'}`;
      span.innerHTML = `<span>${b.icon}</span> <span>${b.name}</span>`;
      span.title = b.description;
      badgesContainer.appendChild(span);
    });

    this.openModal('modal-user-dossier');
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  // --- PROFILE VIEW ---

  renderProfile() {
    const user = window.auth.currentUser;
    if (!user) {
      this.openModal('modal-auth');
      return;
    }

    const wrap = document.getElementById('profile-avatar-wrap');
    if (wrap) {
      wrap.className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-default'}`;
      wrap.innerHTML = `<div class="avatar-inner">${user.avatar || '📖'}</div>`;
    }

    document.getElementById('profile-display-name').textContent = user.displayName || user.username;
    document.getElementById('profile-username-tag').textContent = `@${user.username}`;
    document.getElementById('profile-title-tag').innerHTML = window.auth.getRoleBadgeHTML(user.role, user.level);
    document.getElementById('profile-level-num').textContent = user.level;

    const neededXp = user.level * 400;
    const currentXp = user.xp || 0;
    const percent = Math.min(100, Math.round((currentXp / neededXp) * 100));

    document.getElementById('profile-xp-text').textContent = `${currentXp} / ${neededXp} XP (${percent}%)`;
    document.getElementById('profile-xp-fill').style.width = `${percent}%`;

    // Stats
    document.getElementById('stat-read-time').textContent = `${user.stats?.readTimeMinutes || 0} мин`;
    document.getElementById('stat-books-count').textContent = user.stats?.booksRead || 0;
    document.getElementById('stat-games-won').textContent = user.stats?.gamesWon || 0;
    document.getElementById('stat-wpm-record').textContent = `${user.stats?.speedRecordWPM || 0} WPM`;
    document.getElementById('stat-lumens').textContent = `${user.lumens || 0} ⬡`;

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

    // Emergency creator recovery button (visible if user had creator role in DB)
    const creatorRecoveryBtn = document.getElementById('btn-profile-recover-creator');
    if (creatorRecoveryBtn) {
      creatorRecoveryBtn.style.display = 'inline-flex';
      creatorRecoveryBtn.onclick = () => {
        window.auth.recoverCreatorRights();
        this.renderProfile();
      };
    }

    this.bindTiltEffect();
  }

  // --- MODALS & FORMS ---

  bindModals() {
    document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close-btn')) {
          document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('active'));
        }
      });
    });

    // Auth Tabs
    document.getElementById('tab-btn-login')?.addEventListener('click', () => {
      document.getElementById('tab-btn-login').classList.add('active');
      document.getElementById('tab-btn-register').classList.remove('active');
      document.getElementById('form-login').style.display = 'block';
      document.getElementById('form-register').style.display = 'none';
    });

    document.getElementById('tab-btn-register')?.addEventListener('click', () => {
      document.getElementById('tab-btn-register').classList.add('active');
      document.getElementById('tab-btn-login').classList.remove('active');
      document.getElementById('form-login').style.display = 'none';
      document.getElementById('form-register').style.display = 'block';
    });

    // Login Submit
    document.getElementById('form-login')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('login-username').value;
      const p = document.getElementById('login-password').value;
      const res = window.auth.login(u, p);
      if (res.success) {
        this.closeModal('modal-auth');
        this.showToast(`Добро пожаловать, ${res.user.displayName}!`, 'success');
        if (window.soundEngine) window.soundEngine.playLevelUp();
      } else {
        this.showToast(res.message, 'error');
        if (window.soundEngine) window.soundEngine.playWrong();
      }
    });

    // Fast Login Buttons
    document.getElementById('btn-fast-creator')?.addEventListener('click', () => {
      window.auth.login('admin', 'admin123');
      this.closeModal('modal-auth');
      this.showToast('Вход выполнен: Верховный Создатель (Полный доступ к GitHub и Системе)', 'reward');
    });

    document.getElementById('btn-fast-user')?.addEventListener('click', () => {
      window.auth.login('cyber_scholar', 'scholar123');
      this.closeModal('modal-auth');
      this.showToast('Вход выполнен: Читатель (@cyber_scholar)', 'success');
    });

    // Register Submit
    document.getElementById('form-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('reg-username').value;
      const p = document.getElementById('reg-password').value;
      const d = document.getElementById('reg-display-name').value;
      const a = document.querySelector('input[name="reg-avatar"]:checked')?.value || '📖';

      const res = window.auth.register(u, p, d, a);
      if (res.success) {
        this.closeModal('modal-auth');
        this.showToast(`Регистрация успешна! Добро пожаловать, ${res.user.displayName}!`, 'reward');
        if (window.soundEngine) window.soundEngine.playLevelUp();
      } else {
        this.showToast(res.message, 'error');
      }
    });

    // Profile Logout
    document.getElementById('btn-profile-logout')?.addEventListener('click', () => {
      window.auth.logout();
      this.switchView('library');
      this.showToast('Вы вышли из учетной записи.', 'info');
    });

    // Edit Profile Modal
    document.getElementById('btn-open-edit-profile')?.addEventListener('click', () => {
      const user = window.auth.currentUser;
      document.getElementById('edit-display-name').value = user.displayName || '';
      this.openModal('modal-edit-profile');
    });

    document.getElementById('form-edit-profile')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = window.auth.currentUser;
      const newName = document.getElementById('edit-display-name').value.trim();
      const chosenAvatar = document.querySelector('input[name="edit-avatar"]:checked')?.value;

      if (newName) user.displayName = newName;
      if (chosenAvatar) user.avatar = chosenAvatar;

      window.auth.saveUser();
      window.auth.syncUserToUI();
      this.renderProfile();
      this.closeModal('modal-edit-profile');
      this.showToast('Профиль успешно обновлен!', 'success');
    });

    // Level-Up Modal Close
    document.getElementById('btn-close-levelup')?.addEventListener('click', () => {
      document.getElementById('level-up-modal').classList.remove('active');
    });
  }

  openGitHubModal() {
    if (!window.auth.isCreator()) {
      this.showToast('Настройки GitHub доступны только Создателю системы!', 'error');
      return;
    }

    const config = window.githubSync.config;
    document.getElementById('gh-owner').value = config.owner;
    document.getElementById('gh-repo').value = config.repo;
    document.getElementById('gh-branch').value = config.branch;
    document.getElementById('gh-filepath').value = config.filePath;
    document.getElementById('gh-token').value = config.token || '';
    document.getElementById('gh-mode').value = config.mode;

    const modal = document.getElementById('modal-github');
    if (modal) modal.classList.add('active');

    document.getElementById('btn-test-gh-connection').onclick = async () => {
      const res = await window.githubSync.testConnection();
      this.showToast(res.message, res.success ? 'success' : 'error');
    };

    document.getElementById('btn-save-gh-config').onclick = () => {
      window.githubSync.saveConfig({
        owner: document.getElementById('gh-owner').value.trim(),
        repo: document.getElementById('gh-repo').value.trim(),
        branch: document.getElementById('gh-branch').value.trim(),
        filePath: document.getElementById('gh-filepath').value.trim(),
        token: document.getElementById('gh-token').value.trim(),
        mode: document.getElementById('gh-mode').value
      });
      this.closeModal('modal-github');
      this.showToast('Настройки GitHub сохранены Создателем!', 'success');
      window.auth.awardBadge('github_sync');
    };

    document.getElementById('btn-sync-gh-now').onclick = async () => {
      this.showToast('Синхронизация с GitHub...', 'info');
      const res = await window.githubSync.pushToGitHub(window.dbEngine.data, 'Manual sync trigger by Creator');
      if (res.success) {
        this.showToast(`Успешно отправлено на GitHub! SHA: ${res.sha}`, 'reward');
      } else {
        this.showToast(`Ошибка: ${res.error}`, 'error');
      }
    };
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // --- PROGRESSIVE MICRO-INTERACTIONS ---

  bindTiltEffect() {
    document.querySelectorAll('.tilt-card').forEach((card) => {
      if (card._tiltInitialized) return;
      card._tiltInitialized = true;

      let currentX = 0;
      let currentY = 0;
      let targetX = 0;
      let targetY = 0;
      let currentLift = 0;
      let targetLift = 0;
      let isHovered = false;
      let rafId = null;

      const updateLerp = () => {
        // Fluid linear interpolation (Lerp factor 0.08) creates silky, organic movement
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        currentLift += (targetLift - currentLift) * 0.08;

        card.style.transform = `perspective(1000px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateY(${currentLift.toFixed(2)}px)`;

        const diffX = Math.abs(targetX - currentX);
        const diffY = Math.abs(targetY - currentY);
        const diffLift = Math.abs(targetLift - currentLift);

        if (!isHovered && diffX < 0.02 && diffY < 0.02 && diffLift < 0.02) {
          card.style.transform = '';
          rafId = null;
          return;
        }

        rafId = requestAnimationFrame(updateLerp);
      };

      const startRaf = () => {
        if (!rafId) {
          rafId = requestAnimationFrame(updateLerp);
        }
      };

      card.addEventListener('mouseenter', () => {
        isHovered = true;
        targetLift = -4;
        startRaf();
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Subtle, elegant angle (max 3.5 deg instead of jarring 8 deg)
        targetX = ((y - centerY) / centerY) * -3.5;
        targetY = ((x - centerX) / centerX) * 3.5;
        targetLift = -5;

        startRaf();
      });

      card.addEventListener('mouseleave', () => {
        isHovered = false;
        targetX = 0;
        targetY = 0;
        targetLift = 0;
        startRaf();
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
        btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  bindAudioTriggers() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .nav-btn, .shop-item-card, .speed-word-card');
      if (btn && window.soundEngine) {
        window.soundEngine.playClick();
      }

      if (btn && btn.classList.contains('btn')) {
        const circle = document.createElement('span');
        const diameter = Math.max(btn.clientWidth, btn.clientHeight);
        const radius = diameter / 2;
        const rect = btn.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${e.clientX - rect.left - radius}px`;
        circle.style.top = `${e.clientY - rect.top - radius}px`;
        circle.classList.add('btn-ripple');

        const ripple = btn.querySelector('.btn-ripple');
        if (ripple) ripple.remove();

        btn.appendChild(circle);
      }
    });

    document.querySelectorAll('.btn, .nav-btn, .game-tab-btn').forEach((el) => {
      el.addEventListener('mouseenter', () => {
        if (window.soundEngine) window.soundEngine.playHover();
      });
    });
  }

  updateAudioButtonState() {
    const btn = document.getElementById('btn-toggle-sfx');
    if (!btn) return;
    if (window.soundEngine.isMuted) {
      btn.textContent = '🔇';
      btn.title = 'Включить звук';
      btn.classList.remove('active');
    } else {
      btn.textContent = '🔊';
      btn.title = 'Выключить звук';
      btn.classList.add('active');
    }
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

  showLevelUpModal(newLevel) {
    const modal = document.getElementById('level-up-modal');
    if (!modal) return;
    document.getElementById('level-up-number').textContent = newLevel;
    modal.classList.add('active');
    this.spawnConfetti();
  }

  spawnConfetti() {
    const colors = ['#00f0ff', '#ff007f', '#ffd700', '#00ff88', '#9d4edd'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'sparkle-particle';
      const color = colors[Math.floor(Math.random() * colors.length)];
      p.style.backgroundColor = color;
      p.style.width = `${Math.random() * 8 + 4}px`;
      p.style.height = `${Math.random() * 8 + 4}px`;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      p.style.left = `${window.innerWidth / 2}px`;
      p.style.top = `${window.innerHeight / 2}px`;

      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 250 + 100;
      p.style.setProperty('--tx', `${Math.cos(angle) * dist}px`);
      p.style.setProperty('--ty', `${Math.sin(angle) * dist}px`);

      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1200);
    }
  }

  // --- THEME CYCLING ---
  cycleNextTheme() {
    const themes = [
      'theme-cyberpunk',
      'theme-space',
      'theme-matrix',
      'theme-cozy',
      'theme-aurora',
      'theme-synthwave',
      'theme-ocean',
      'theme-zen'
    ];
    const themeNames = {
      'theme-cyberpunk': 'Киберпанк Неон',
      'theme-space': 'Космическая Туманность',
      'theme-matrix': 'Изумрудная Матрица',
      'theme-cozy': 'Уютный Янтарь',
      'theme-aurora': 'Полярное Сияние',
      'theme-synthwave': 'Синтвейв 80-х',
      'theme-ocean': 'Глубокий Океан',
      'theme-zen': 'Минималистичный Дзен'
    };

    const currentTheme = window.reactiveBg ? window.reactiveBg.currentTheme : 'theme-cyberpunk';
    let idx = themes.indexOf(currentTheme);
    if (idx === -1) idx = 0;
    const nextTheme = themes[(idx + 1) % themes.length];

    if (window.reactiveBg) {
      window.reactiveBg.setTheme(nextTheme);
    }
    const user = window.auth.currentUser;
    if (user) {
      user.customBg = nextTheme;
      window.dbEngine.saveUser(user);
    }
    // Update quest progress for changing theme
    window.dbEngine.updateQuestProgress('quest_change_theme', 1);
    this.renderDailyQuests();

    this.showToast(`Фон изменен: ${themeNames[nextTheme] || nextTheme}`, 'info');
    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  // --- OPEN LIBRARY API INTEGRATION ---
  bindOpenLibraryExplorer() {
    const tabLocal = document.getElementById('tab-src-local');
    const tabOpenLib = document.getElementById('tab-src-openlibrary');
    const localSection = document.getElementById('local-library-section');
    const openLibSection = document.getElementById('openlibrary-explorer');
    const searchInput = document.getElementById('openlibrary-search-input');
    const searchBtn = document.getElementById('btn-openlibrary-search');
    const tags = document.querySelectorAll('.openlib-tag');

    if (tabLocal && tabOpenLib) {
      tabLocal.addEventListener('click', () => {
        tabLocal.classList.add('active');
        tabOpenLib.classList.remove('active');
        if (localSection) localSection.style.display = 'block';
        if (openLibSection) openLibSection.style.display = 'none';
        this.renderLibrary();
      });

      tabOpenLib.addEventListener('click', () => {
        tabOpenLib.classList.add('active');
        tabLocal.classList.remove('active');
        if (localSection) localSection.style.display = 'none';
        if (openLibSection) openLibSection.style.display = 'block';
        
        // Auto search if grid is empty
        const grid = document.getElementById('openlibrary-results-grid');
        if (grid && grid.children.length === 0) {
          this.performOpenLibrarySearch('Cyberpunk');
        }
      });
    }

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

    tags.forEach((tag) => {
      tag.addEventListener('click', () => {
        const query = tag.getAttribute('data-tag');
        if (searchInput) searchInput.value = query;
        this.performOpenLibrarySearch(query);
      });
    });
  }

  async performOpenLibrarySearch(query) {
    const grid = document.getElementById('openlibrary-results-grid');
    const status = document.getElementById('openlibrary-status');
    if (!grid) return;

    if (status) {
      status.textContent = `Поиск во Всемирном Каталоге Open Library: "${query}"...`;
      status.style.display = 'block';
    }
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);"><span class="spin" style="display:inline-block; font-size:2rem; margin-bottom:1rem;">⏳</span><br>Связываемся с серверами Open Library...</div>';

    try {
      const books = await window.openLibrary.searchBooks(query, 12);
      if (status) {
        status.textContent = `Найдено книг: ${books.length} по запросу "${query}"`;
      }
      grid.innerHTML = '';

      if (books.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">Ничего не найдено. Попробуйте другой запрос на английском или русском языке.</div>';
        return;
      }

      const existingBooks = window.dbEngine.getBooks();
      const existingIds = new Set(existingBooks.map((b) => b.id));

      books.forEach((b) => {
        const isImported = existingIds.has(b.id);
        const card = document.createElement('div');
        card.className = `steam-book-card rarity-${b.rarity}`;
        
        let rarityLabel = 'Обычная';
        if (b.rarity === 'top') rarityLabel = 'Популярная';
        if (b.rarity === 'epic') rarityLabel = 'Эпическая';
        if (b.rarity === 'legendary') rarityLabel = 'Легендарная';

        card.innerHTML = `
          <div class="book-cover-banner" style="background: ${b.coverStyle};">
            ${b.coverImage ? `
              <img src="${b.coverImage}" class="book-cover-real-img" alt="${b.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" loading="lazy">
              <div class="book-cover-icon" style="display: none;">${b.coverIcon || '📖'}</div>
            ` : `
              <div class="book-cover-icon">${b.coverIcon || '📖'}</div>
            `}
            <div class="book-badges-overlay">
              <span class="rarity-badge rarity-${b.rarity}">${rarityLabel}</span>
              <span class="steam-featured-tag">OpenLibrary</span>
            </div>
          </div>
          <div class="steam-book-info">
            <h3 class="steam-book-title" title="${b.title}">${b.title}</h3>
            <p class="steam-book-author">${b.author} (${b.year || 'Н/Д'})</p>
            <p class="steam-book-desc">${b.description || 'Классическое произведение мирового фонда.'}</p>
            <div class="steam-book-meta">
              <span class="book-genre-pill">${b.genre}</span>
              <span class="book-read-time">~${b.readTimeMinutes} мин</span>
            </div>
            <div style="margin-top: 0.8rem;">
              <button class="btn ${isImported ? 'btn-primary' : 'btn-secondary'} btn-block btn-import-openlib" data-book-id="${b.id}" ${isImported ? 'disabled' : ''}>
                ${isImported ? '✓ В вашей библиотеке' : '📥 Добавить в библиотеку (+50 XP)'}
              </button>
            </div>
          </div>
        `;

        const importBtn = card.querySelector('.btn-import-openlib');
        if (importBtn && !isImported) {
          importBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const imported = window.dbEngine.importBookFromOpenLibrary(b);
            if (imported) {
              importBtn.textContent = '✓ В вашей библиотеке';
              importBtn.disabled = true;
              importBtn.classList.remove('btn-secondary');
              importBtn.classList.add('btn-primary');
              
              // Award XP & Lumens for expanding knowledge
              window.auth.addXp(50);
              window.auth.addLumens(25);
              window.dbEngine.updateQuestProgress('quest_open_library', 1);
              this.renderDailyQuests();
              this.updateLocalBooksCount();
              this.showToast(`Книга "${b.title}" добавлена в библиотеку! +50 XP, +25 ⬡`, 'reward');
              if (window.soundEngine) window.soundEngine.playLevelUp();
            }
          });
        }

        grid.appendChild(card);
      });

      this.bindTiltEffect();
    } catch (err) {
      console.error('OpenLibrary search error:', err);
      if (status) status.textContent = 'Ошибка соединения с Open Library';
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--rarity-legendary);">Ошибка загрузки из Open Library. Проверьте интернет-соединение.</div>';
    }
  }

  updateLocalBooksCount() {
    const el = document.getElementById('local-books-count');
    if (el) {
      const books = window.dbEngine.getBooks();
      el.textContent = books.length;
    }
  }

  // --- DAILY QUESTS & CONTRACTS ---
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
            this.showToast(`Контракт выполнен! +${res.rewardLumens} ⬡, +${xp} XP`, 'reward');
            if (window.soundEngine) window.soundEngine.playLevelUp();
            this.renderDailyQuests();
          }
        });
      }

      container.appendChild(card);
    });
  }
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

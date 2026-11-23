/**
 * CyberLibris Application Master Controller
 */
class AppController {
  constructor() {
    this.currentView = 'library';
    this.selectedGenre = 'all';
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

    // 5. Initial Render
    this.renderLibrary();
    this.updateAudioButtonState();

    console.log('⚡ CyberLibris Web System Loaded Successfully.');
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

    // Logo click goes to library
    document.querySelector('.logo-container')?.addEventListener('click', () => {
      this.switchView('library');
    });

    // User pill click goes to profile
    document.getElementById('user-pill-container')?.addEventListener('click', (e) => {
      if (e.target.closest('#btn-open-login')) {
        this.openModal('modal-auth');
      } else {
        this.switchView('profile');
      }
    });

    // GitHub Pill click opens GitHub config modal
    document.getElementById('btn-github-status')?.addEventListener('click', () => {
      this.openGitHubModal();
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
      this.showToast('Доступ запрещен. Необходимы права Администратора.', 'error');
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

    // Scroll top
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

  // --- LIBRARY VIEW ---

  bindSearchAndFilters() {
    const searchInput = document.getElementById('library-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderLibrary();
      });
    }

    document.querySelectorAll('.genre-pill').forEach((pill) => {
      pill.addEventListener('click', (e) => {
        document.querySelectorAll('.genre-pill').forEach((p) => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.selectedGenre = e.currentTarget.dataset.genre;
        this.renderLibrary();
        if (window.soundEngine) window.soundEngine.playClick();
      });
    });

    document.getElementById('btn-open-add-book-library')?.addEventListener('click', () => {
      if (window.auth.isAdmin()) {
        window.adminEngine.openAddBookModal();
      } else {
        this.showToast('Добавлять книги в общественный архив могут только Администраторы!', 'info');
      }
    });
  }

  renderLibrary() {
    const grid = document.getElementById('books-catalog-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const books = window.dbEngine.getBooks();
    const filtered = books.filter((book) => {
      const matchGenre = this.selectedGenre === 'all' || book.genre.toLowerCase() === this.selectedGenre.toLowerCase();
      const matchSearch = !this.searchQuery ||
        book.title.toLowerCase().includes(this.searchQuery) ||
        book.author.toLowerCase().includes(this.searchQuery) ||
        (book.tags && book.tags.some((t) => t.toLowerCase().includes(this.searchQuery)));
      return matchGenre && matchSearch;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🔍</div>
          <h3>Ничего не найдено по вашему запросу</h3>
          <p>Попробуйте выбрать другой жанр или очистить поиск.</p>
        </div>
      `;
      return;
    }

    const currentUser = window.auth.currentUser;

    filtered.forEach((book) => {
      const userProgress = currentUser?.readingProgress?.[book.id]?.progressPercent || 0;
      const card = document.createElement('div');
      card.className = 'cyber-card tilt-card book-card';

      card.innerHTML = `
        <div class="book-cover-banner" style="background: ${book.coverStyle || 'var(--bg-card)'};">
          <div class="book-cover-icon">${book.coverIcon || '📖'}</div>
          <span class="book-genre-badge">${book.genre}</span>
        </div>
        <div class="book-card-body">
          <h3 class="book-title">${book.title}</h3>
          <div class="book-author">✍ ${book.author} (${book.year})</div>
          <p class="book-description">${book.description}</p>
          <div class="book-tags-row">
            ${(book.tags || []).slice(0, 3).map((t) => `<span class="tag-pill">#${t}</span>`).join('')}
          </div>
          <div class="book-progress-wrapper">
            <div class="book-progress-info">
              <span>Прогресс чтения</span>
              <span style="color: var(--accent-cyan); font-weight: 700;">${userProgress}%</span>
            </div>
            <div class="book-progress-bar">
              <div class="book-progress-fill" style="width: ${userProgress}%;"></div>
            </div>
          </div>
        </div>
        <div class="book-card-footer">
          <div class="book-rating">★ ${book.rating || '4.9'} <span style="font-size: 0.75rem; color: var(--text-dim);">(~${book.estimatedReadTime || '10 мин'})</span></div>
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

  // --- LEADERBOARD / HALL OF FAME ---

  renderLeaderboard() {
    const users = [...window.dbEngine.getUsers()];
    // Sort by level descending, then read minutes
    users.sort((a, b) => (b.level * 1000 + (b.stats?.readTimeMinutes || 0)) - (a.level * 1000 + (a.stats?.readTimeMinutes || 0)));

    // Render podium top 3
    const podiumContainer = document.getElementById('leaderboard-podium');
    if (podiumContainer) {
      podiumContainer.innerHTML = '';
      const top3 = users.slice(0, 3);
      const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean); // 2nd, 1st, 3rd

      podiumOrder.forEach((user) => {
        const rank = user === top3[0] ? 1 : user === top3[1] ? 2 : 3;
        const col = document.createElement('div');
        col.className = `podium-column rank-${rank} tilt-card`;

        col.innerHTML = `
          <div class="podium-rank-badge">${rank === 1 ? '👑 #1' : rank === 2 ? '🥈 #2' : '🥉 #3'}</div>
          <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}" style="width: 70px; height: 70px; font-size: 2.2rem; margin: 0.8rem 0;">
            <div class="avatar-inner">${user.avatar || '⚡'}</div>
          </div>
          <h4 style="font-size: 1.1rem; color: #fff; margin-bottom: 0.2rem;">${user.displayName || user.username}</h4>
          <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700; margin-bottom: 0.5rem;">${user.title || 'Исследователь'}</div>
          <div class="podium-stats-box">
            <div>Уровень: <strong>${user.level}</strong></div>
            <div>Время: <strong>${user.stats?.readTimeMinutes || 0} мин</strong></div>
            <div>Счёт WPM: <strong>${user.stats?.speedRecordWPM || 0}</strong></div>
          </div>
        `;

        col.addEventListener('click', () => this.openUserDossier(user));
        podiumContainer.appendChild(col);
      });
    }

    // Render Table for rest
    const tbody = document.getElementById('leaderboard-tbody');
    if (tbody) {
      tbody.innerHTML = '';
      users.forEach((user, idx) => {
        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
          <td><strong style="color: ${idx < 3 ? 'var(--accent-gold)' : 'var(--text-muted)'};">#${idx + 1}</strong></td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}" style="width: 36px; height: 36px; font-size: 1.1rem;">
                <div class="avatar-inner">${user.avatar || '⚡'}</div>
              </div>
              <div>
                <strong style="color: #fff;">${user.displayName || user.username}</strong>
                <div style="font-size: 0.75rem; color: var(--accent-cyan);">${user.title || 'Новичок'}</div>
              </div>
            </div>
          </td>
          <td><span class="logo-badge">Ур. ${user.level}</span></td>
          <td>${user.stats?.readTimeMinutes || 0} мин</td>
          <td>⚡ ${user.stats?.speedRecordWPM || 0} WPM</td>
          <td>${user.stats?.gamesWon || 0} побед</td>
          <td>
            <div style="display: flex; gap: 0.25rem;">
              ${(user.badges || []).slice(0, 4).map((b) => `<span title="${b}">🏅</span>`).join('')}
            </div>
          </td>
        `;

        tr.addEventListener('click', () => this.openUserDossier(user));
        tbody.appendChild(tr);
      });
    }

    this.bindTiltEffect();
  }

  openUserDossier(user) {
    const modal = document.getElementById('modal-user-dossier');
    if (!modal) return;

    document.getElementById('dossier-avatar-wrap').className = `avatar-frame-wrap ${user.avatarFrame || 'frame-default'}`;
    document.getElementById('dossier-avatar').textContent = user.avatar || '⚡';
    document.getElementById('dossier-name').textContent = user.displayName || user.username;
    document.getElementById('dossier-handle').textContent = `@${user.username} • Роль: ${user.role.toUpperCase()}`;
    document.getElementById('dossier-title').textContent = user.title || 'Читатель';
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
      wrap.innerHTML = `<div class="avatar-inner">${user.avatar || '⚡'}</div>`;
    }

    document.getElementById('profile-display-name').textContent = user.displayName || user.username;
    document.getElementById('profile-username-tag').textContent = `@${user.username} • ${user.role.toUpperCase()}`;
    document.getElementById('profile-title-tag').textContent = user.title || 'Новичок';
    document.getElementById('profile-level-num').textContent = user.level;

    const neededXp = user.level * 450;
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
        el.className = `profile-badge-card ${has ? 'unlocked' : 'locked'} tilt-card`;
        el.innerHTML = `
          <div class="profile-badge-icon">${b.icon}</div>
          <div class="profile-badge-name">${b.name}</div>
          <div class="profile-badge-desc">${b.description}</div>
          <div class="profile-badge-status">${has ? '✓ ПОЛУЧЕНО' : '🔒 ЗАКРЫТО'}</div>
        `;
        badgesGrid.appendChild(el);
      });
    }

    // Bookmarks List
    const bmList = document.getElementById('profile-bookmarks-list');
    if (bmList) {
      bmList.innerHTML = '';
      const bookmarks = user.bookmarks || [];
      if (bookmarks.length === 0) {
        bmList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Закладок пока нет. Вы можете сохранять интересные цитаты прямо во время чтения!</p>';
      } else {
        bookmarks.forEach((bm) => {
          const item = document.createElement('div');
          item.className = 'bookmark-item-card';
          item.innerHTML = `
            <div style="font-weight: 700; color: #fff; margin-bottom: 0.3rem;">${bm.textSnippet}</div>
            <div style="color: var(--accent-cyan); font-size: 0.8rem; margin-bottom: 0.4rem;">💡 Заметка: ${bm.note}</div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.75rem; color: var(--text-muted);">
              <span>${new Date(bm.createdAt).toLocaleDateString()}</span>
              <button class="btn btn-primary btn-sm btn-jump-bm" data-book="${bm.bookId}" data-chap="${bm.chapterId}">Перейти к книге</button>
            </div>
          `;
          item.querySelector('.btn-jump-bm').addEventListener('click', () => {
            window.readerEngine.openBook(bm.bookId, bm.chapterId);
          });
          bmList.appendChild(item);
        });
      }
    }

    this.bindTiltEffect();
  }

  // --- MODALS & FORMS ---

  bindModals() {
    // Universal close buttons
    document.querySelectorAll('.modal-close-btn, .modal-overlay').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('modal-close-btn')) {
          document.querySelectorAll('.modal-overlay').forEach((m) => m.classList.remove('active'));
        }
      });
    });

    // Auth Form Tabs
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

    // Login Form Submit
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
    document.getElementById('btn-fast-admin')?.addEventListener('click', () => {
      window.auth.login('admin', 'admin123');
      this.closeModal('modal-auth');
      this.showToast('Вход выполнен под учетной записью Главного Администратора!', 'reward');
    });

    document.getElementById('btn-fast-user')?.addEventListener('click', () => {
      window.auth.login('cyber_scholar', 'scholar123');
      this.closeModal('modal-auth');
      this.showToast('Вход выполнен как Читатель (Нео-Схоласт)!', 'success');
    });

    // Register Form Submit
    document.getElementById('form-register')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = document.getElementById('reg-username').value;
      const p = document.getElementById('reg-password').value;
      const d = document.getElementById('reg-display-name').value;
      const a = document.querySelector('input[name="reg-avatar"]:checked')?.value || '🚀';

      const res = window.auth.register(u, p, d, a);
      if (res.success) {
        this.closeModal('modal-auth');
        this.showToast(`Регистрация успешна! Добро пожаловать в CyberLibris, ${res.user.displayName}!`, 'reward');
        if (window.soundEngine) window.soundEngine.playLevelUp();
      } else {
        this.showToast(res.message, 'error');
      }
    });

    // Edit Profile Modal Form
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

    // Logout Button
    document.getElementById('btn-profile-logout')?.addEventListener('click', () => {
      window.auth.logout();
      this.switchView('library');
      this.showToast('Вы вышли из учетной записи.', 'info');
    });

    // Level-Up Modal Close
    document.getElementById('btn-close-levelup')?.addEventListener('click', () => {
      document.getElementById('level-up-modal').classList.remove('active');
    });
  }

  openGitHubModal() {
    const config = window.githubSync.config;
    document.getElementById('gh-owner').value = config.owner;
    document.getElementById('gh-repo').value = config.repo;
    document.getElementById('gh-branch').value = config.branch;
    document.getElementById('gh-filepath').value = config.filePath;
    document.getElementById('gh-token').value = config.token || '';
    document.getElementById('gh-mode').value = config.mode;

    const modal = document.getElementById('modal-github');
    if (modal) modal.classList.add('active');

    // Bind modal actions
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
      this.showToast('Настройки GitHub сохранены! Синхронизация активна.', 'success');
      window.auth.awardBadge('github_sync');
    };

    document.getElementById('btn-sync-gh-now').onclick = async () => {
      this.showToast('Синхронизация данных с GitHub...', 'info');
      const res = await window.githubSync.pushToGitHub(window.dbEngine.data, 'Manual sync trigger');
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
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
      });
    });
  }

  bindMagneticButtons() {
    document.querySelectorAll('.magnetic-btn').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
      });
    });
  }

  bindAudioTriggers() {
    // Add click sounds to all buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button, .nav-btn, .shop-item-card, .speed-word-card');
      if (btn && window.soundEngine) {
        window.soundEngine.playClick();
      }

      // Ripple effect
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

    // Hover sounds for primary controls
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

  // --- TOASTS & CELEBRATIONS ---

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
}

window.app = new AppController();
document.addEventListener('DOMContentLoaded', () => {
  window.app.init();
});

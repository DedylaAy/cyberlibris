/**
 * CyberLibris Admin & Creator Console
 * Enforces hierarchy: Creator > Owner > Admin > Moderator > User.
 * Disables self-demotion to prevent accidental lockout.
 */
class AdminEngine {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Add Book Button
    document.getElementById('btn-admin-add-book')?.addEventListener('click', () => this.openAddBookModal());
    document.getElementById('form-add-book')?.addEventListener('submit', (e) => this.handleSaveBook(e));

    // DB Operations
    document.getElementById('btn-download-db')?.addEventListener('click', () => this.downloadDatabaseJSON());
    document.getElementById('btn-import-db')?.addEventListener('click', () => document.getElementById('db-file-input')?.click());
    document.getElementById('db-file-input')?.addEventListener('change', (e) => this.handleFileImport(e));
    document.getElementById('btn-reset-db')?.addEventListener('click', () => this.handleResetDatabase());
    document.getElementById('btn-force-github-push')?.addEventListener('click', () => this.forceGitHubPush());

    // Emergency Recover Creator Button
    document.getElementById('btn-recover-creator')?.addEventListener('click', () => {
      window.auth.recoverCreatorRights();
      this.renderAdminView();
    });
  }

  renderAdminView() {
    if (!window.auth.isAdmin()) {
      window.app.showToast('Доступ запрещен! Требуются права Администратора или Создателя.', 'error');
      window.app.switchView('library');
      return;
    }

    this.renderStats();
    this.renderBooksTable();
    this.renderUsersTable();
    this.renderAuditLogsTable();
  }

  renderStats() {
    const users = window.dbEngine.getUsers();
    const books = window.dbEngine.getBooks();
    const jsonStr = window.dbEngine.exportJSON();
    const sizeKb = (new Blob([jsonStr]).size / 1024).toFixed(1);

    document.getElementById('admin-stat-users').textContent = users.length;
    document.getElementById('admin-stat-books').textContent = books.length;
    document.getElementById('admin-stat-dbsize').textContent = `${sizeKb} КБ`;
    document.getElementById('admin-stat-sha').textContent = window.githubSync.config.lastCommitSha || 'a9f3e12';
  }

  renderBooksTable() {
    const tbody = document.getElementById('admin-books-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const books = window.dbEngine.getBooks();
    books.forEach((book) => {
      const tr = document.createElement('tr');
      const rarityBadge = book.rarity === 'legendary' ? '<span class="rarity-badge-legendary">🟠 ЛЕГЕНДАРНАЯ</span>' :
                          book.rarity === 'epic' ? '<span class="rarity-badge-epic">🟣 ЭПИЧЕСКАЯ</span>' :
                          book.rarity === 'rare' ? '<span class="rarity-badge-rare">🔵 ТОПОВАЯ</span>' :
                          '<span class="rarity-badge-common">⚪ ОБЫЧНАЯ</span>';

      tr.innerHTML = `
        <td><strong style="color: #fff;">${book.title}</strong></td>
        <td>${book.author}</td>
        <td>${rarityBadge}</td>
        <td>Сложность: ${book.complexity || 3}/5</td>
        <td>⭐ ${book.rating || '5.0'}</td>
        <td>
          <button class="btn btn-secondary btn-sm btn-delete-book" data-id="${book.id}">Удалить</button>
        </td>
      `;

      tr.querySelector('.btn-delete-book').addEventListener('click', () => {
        if (confirm(`Вы уверены, что хотите удалить книгу "${book.title}"?`)) {
          window.dbEngine.deleteBook(book.id);
          this.renderAdminView();
          window.app.renderLibrary();
          window.app.showToast(`Книга "${book.title}" удалена.`, 'info');
        }
      });

      tbody.appendChild(tr);
    });
  }

  renderUsersTable() {
    const tbody = document.getElementById('admin-users-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const currentUser = window.auth.currentUser;
    const users = window.dbEngine.getUsers();

    users.forEach((user) => {
      const tr = document.createElement('tr');
      const isSelf = currentUser && currentUser.id === user.id;
      const canManageThisUser = window.auth.canManage(user);
      const badgeHTML = window.auth.getRoleBadgeHTML(user.role, user.level);

      let actionButtons = '';
      if (isSelf) {
        actionButtons = '<span style="color: var(--accent-cyan); font-weight: 700; font-size: 0.8rem;">(Это вы • Защита от удаления)</span>';
      } else if (canManageThisUser) {
        // Dropdown or cycle button depending on hierarchy
        actionButtons = `
          <div style="display: flex; gap: 0.4rem; align-items: center;">
            <select class="form-select select-role-change" data-id="${user.id}" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; width: auto;">
              ${window.auth.isCreator() ? '<option value="creator" ' + (user.role === 'creator' ? 'selected' : '') + '>Создатель</option>' : ''}
              ${window.auth.isCreator() ? '<option value="owner" ' + (user.role === 'owner' ? 'selected' : '') + '>Овнер</option>' : ''}
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Админ</option>
              <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Модератор</option>
              <option value="user" ${user.role === 'user' ? 'selected' : ''}>Читатель</option>
            </select>
            <button class="btn btn-gold btn-sm btn-grant-lumens" data-id="${user.id}">+300 ⬡</button>
          </div>
        `;
      } else {
        actionButtons = '<span style="color: var(--text-dim); font-size: 0.8rem;">Нет доступа (выше рангом)</span>';
      }

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}" style="width: 32px; height: 32px; font-size: 1rem;">
              <div class="avatar-inner">${user.avatar || '📖'}</div>
            </div>
            <div>
              <strong style="color: #fff;">${user.displayName || user.username}</strong>
              <div style="color: var(--text-muted); font-size: 0.78rem;">@${user.username}</div>
            </div>
          </div>
        </td>
        <td>${badgeHTML}</td>
        <td>Ур. ${user.level}</td>
        <td>${user.lumens || 0} ⬡</td>
        <td>${user.stats?.booksRead || 0} книг / ${user.stats?.gamesWon || 0} игр</td>
        <td>${actionButtons}</td>
      `;

      tr.querySelector('.select-role-change')?.addEventListener('change', (e) => {
        const newRole = e.target.value;
        user.role = newRole;
        if (newRole === 'user') {
          user.title = window.auth.getUserRankTag(user.level);
        } else if (newRole === 'moderator') {
          user.title = 'Модератор [MOD]';
        } else if (newRole === 'admin') {
          user.title = 'Администратор [ADMIN]';
        } else if (newRole === 'owner') {
          user.title = 'Владелец Хаба [OWNER]';
        }
        window.dbEngine.saveUser(user);
        this.renderAdminView();
        window.app.showToast(`Роль @${user.username} изменена на: ${newRole.toUpperCase()}`, 'success');
      });

      tr.querySelector('.btn-grant-lumens')?.addEventListener('click', () => {
        user.lumens = (user.lumens || 0) + 300;
        window.dbEngine.saveUser(user);
        this.renderAdminView();
        window.app.showToast(`Пользователю @${user.username} начислено 300 Люменов!`, 'reward');
        if (window.soundEngine) window.soundEngine.playCorrect();
      });

      tbody.appendChild(tr);
    });
  }

  renderAuditLogsTable() {
    const tbody = document.getElementById('admin-audit-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const logs = window.dbEngine.getAuditLogs();
    logs.slice(0, 15).forEach((log) => {
      const tr = document.createElement('tr');
      const timeStr = new Date(log.timestamp).toLocaleTimeString();
      tr.innerHTML = `
        <td style="font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted);">${timeStr}</td>
        <td><strong style="color: var(--accent-cyan); font-family: var(--font-mono); font-size: 0.85rem;">${log.action}</strong></td>
        <td>@${log.user}</td>
        <td>${log.details}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  openAddBookModal() {
    const modal = document.getElementById('modal-add-book');
    if (modal) modal.classList.add('active');
  }

  handleSaveBook(e) {
    e.preventDefault();
    const title = document.getElementById('book-input-title').value.trim();
    const author = document.getElementById('book-input-author').value.trim();
    const genre = document.getElementById('book-input-genre').value;
    const rarity = document.getElementById('book-input-rarity').value;
    const complexity = parseInt(document.getElementById('book-input-complexity').value) || 3;
    const desc = document.getElementById('book-input-desc').value.trim();
    const chTitle = document.getElementById('book-input-chtitle').value.trim();
    const chContent = document.getElementById('book-input-chcontent').value.trim();

    if (!title || !author || !chContent) {
      window.app.showToast('Заполните название, автора и текст главы!', 'error');
      return;
    }

    const coverGradients = {
      legendary: 'linear-gradient(135deg, #ff8c00, #ff0055, #4a00e0)',
      epic: 'linear-gradient(135deg, #050505, #4a00e0, #8e2de2)',
      rare: 'linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)',
      common: 'linear-gradient(135deg, #2c3e50, #4ca1af)'
    };

    const newBook = {
      id: 'book_' + Date.now(),
      title: title,
      author: author,
      genre: genre,
      rarity: rarity,
      complexity: complexity,
      xpMultiplier: rarity === 'legendary' ? 'x3.0 XP' : rarity === 'epic' ? 'x2.0 XP' : rarity === 'rare' ? 'x1.5 XP' : 'x1.0 XP',
      featuredBadge: rarity === 'legendary' ? 'ЛЕГЕНДАРНОЕ' : 'НОВИНКА',
      year: new Date().getFullYear(),
      rating: 5.0,
      coverStyle: coverGradients[rarity] || coverGradients.common,
      coverIcon: rarity === 'legendary' ? '🔥' : rarity === 'epic' ? '⚡' : '📖',
      tags: [genre, rarity.toUpperCase(), 'Новинка'],
      description: desc || 'Увлекательное произведение в цифровом архиве CyberLibris.',
      estimatedReadTime: `${complexity * 4} мин`,
      chapters: [
        {
          id: 1,
          title: chTitle || 'Глава 1: Введение',
          content: chContent
        }
      ]
    };

    window.dbEngine.addBook(newBook);
    document.getElementById('modal-add-book').classList.remove('active');
    document.getElementById('form-add-book').reset();

    this.renderAdminView();
    window.app.renderLibrary();
    window.app.showToast(`Книга "${title}" успешно добавлена в каталог!`, 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }

  downloadDatabaseJSON() {
    const jsonStr = window.dbEngine.exportJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberlibris-database-${new Date().toISOString().substring(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.app.showToast('База данных успешно выгружена в файл JSON!', 'success');
  }

  handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const res = window.dbEngine.importJSON(content);
      if (res.success) {
        window.app.showToast('База данных успешно импортирована!', 'success');
        this.renderAdminView();
        window.app.renderLibrary();
      } else {
        window.app.showToast(`Ошибка импорта: ${res.error}`, 'error');
      }
    };
    reader.readAsText(file);
  }

  handleResetDatabase() {
    if (confirm('Сбросить базу данных к заводским настройкам со всеми книгами и товарами?')) {
      window.dbEngine.resetDatabase().then(() => {
        window.app.showToast('База данных сброшена к исходному состоянию.', 'info');
        this.renderAdminView();
        window.app.renderLibrary();
        window.miniGames.renderShop();
      });
    }
  }

  async forceGitHubPush() {
    if (!window.auth.isCreator()) {
      window.app.showToast('Только Создатель (Основатель) может отправлять коммиты в GitHub!', 'error');
      return;
    }
    window.app.showToast('Отправка коммита в GitHub репозиторий...', 'info');
    const res = await window.githubSync.pushToGitHub(
      window.dbEngine.data,
      `[Admin Console] Manual database commit by @${window.auth.currentUser?.username}`
    );
    if (res.success) {
      window.app.showToast(`Успешный коммит в GitHub! SHA: ${res.sha}`, 'reward');
      this.renderStats();
    } else {
      window.app.showToast(`Ошибка отправки: ${res.error}`, 'error');
    }
  }
}

window.adminEngine = new AdminEngine();

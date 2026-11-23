/**
 * CyberLibris Admin Panel & System Oversight Suite
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
  }

  renderAdminView() {
    if (!window.auth.isAdmin()) {
      window.app.showToast('Доступ запрещен! Требуются права Администратора.', 'error');
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
    document.getElementById('admin-stat-sha').textContent = window.githubSync.config.lastCommitSha || 'None';
  }

  renderBooksTable() {
    const tbody = document.getElementById('admin-books-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    const books = window.dbEngine.getBooks();
    books.forEach((book) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong style="color: #fff;">${book.title}</strong></td>
        <td>${book.author}</td>
        <td><span class="logo-badge">${book.genre}</span></td>
        <td>${book.chapters?.length || 0} глав</td>
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

    const users = window.dbEngine.getUsers();
    users.forEach((user) => {
      const tr = document.createElement('tr');
      const isAdmin = user.role === 'admin';

      tr.innerHTML = `
        <td>
          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <div class="avatar-frame-wrap ${user.avatarFrame || 'frame-default'}" style="width: 32px; height: 32px; font-size: 1rem;">
              <div class="avatar-inner">${user.avatar || '⚡'}</div>
            </div>
            <strong>${user.displayName || user.username}</strong>
            <span style="color: var(--text-muted); font-size: 0.8rem;">(@${user.username})</span>
          </div>
        </td>
        <td><span class="logo-badge" style="border-color: ${isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)'}; color: ${isAdmin ? 'var(--accent-gold)' : 'var(--accent-cyan)'};">${user.role.toUpperCase()}</span></td>
        <td>Ур. ${user.level}</td>
        <td>${user.lumens} ⬡</td>
        <td>${user.stats?.booksRead || 0} книг / ${user.stats?.gamesWon || 0} игр</td>
        <td>
          <div style="display: flex; gap: 0.4rem;">
            <button class="btn btn-secondary btn-sm btn-toggle-role" data-id="${user.id}">
              ${isAdmin ? 'Снять админку' : 'Сделать админом'}
            </button>
            <button class="btn btn-gold btn-sm btn-grant-lumens" data-id="${user.id}">+300 ⬡</button>
          </div>
        </td>
      `;

      tr.querySelector('.btn-toggle-role').addEventListener('click', () => {
        user.role = isAdmin ? 'user' : 'admin';
        window.dbEngine.saveUser(user);
        this.renderAdminView();
        window.app.showToast(`Роль пользователя @${user.username} изменена на ${user.role}.`, 'success');
      });

      tr.querySelector('.btn-grant-lumens').addEventListener('click', () => {
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
    const desc = document.getElementById('book-input-desc').value.trim();
    const chTitle = document.getElementById('book-input-chtitle').value.trim();
    const chContent = document.getElementById('book-input-chcontent').value.trim();

    if (!title || !author || !chContent) {
      window.app.showToast('Заполните все обязательные поля книги!', 'error');
      return;
    }

    const newBook = {
      id: 'book_' + Date.now(),
      title: title,
      author: author,
      genre: genre,
      year: new Date().getFullYear(),
      rating: 5.0,
      coverStyle: 'linear-gradient(135deg, #1f4037, #99f2c8)',
      coverIcon: '📘',
      tags: [genre, 'Новинка', 'Библиотека'],
      description: desc || 'Увлекательное произведение в цифровом архиве CyberLibris.',
      estimatedReadTime: '8 мин',
      chapters: [
        {
          id: 1,
          title: chTitle || 'Глава 1: Начало',
          content: chContent
        }
      ]
    };

    window.dbEngine.addBook(newBook);
    document.getElementById('modal-add-book').classList.remove('active');
    document.getElementById('form-add-book').reset();

    this.renderAdminView();
    window.app.renderLibrary();
    window.app.showToast(`Книга "${title}" успешно добавлена в библиотеку!`, 'success');
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
    if (confirm('Сбросить базу данных к исходным настройкам? Все несохраненные локально изменения будут сброшены.')) {
      window.dbEngine.resetDatabase().then(() => {
        window.app.showToast('База данных сброшена к исходному состоянию.', 'info');
        this.renderAdminView();
        window.app.renderLibrary();
      });
    }
  }

  async forceGitHubPush() {
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

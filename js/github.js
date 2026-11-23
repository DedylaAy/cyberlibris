/**
 * CyberLibris GitHub API & Cloud Sync Connector
 * Provides bidirectional synchronization between the web client and a GitHub repository hosting the database.
 */
class GitHubSyncEngine {
  constructor() {
    this.storageKey = 'cyberlibris_github_config';
    this.config = this.loadConfig();
    this.lastSha = null;
    this.isSyncing = false;
    this.statusListeners = [];
  }

  loadConfig() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      owner: 'cyber-scholar',
      repo: 'cyberlibris-knowledge-db',
      branch: 'main',
      filePath: 'database.json',
      token: '',
      mode: 'mock', // 'live' | 'mock'
      autoSync: true,
      lastSyncTime: null,
      lastCommitSha: '9b2f4c1'
    };
  }

  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    this.notifyStatus('saved', 'Настройки GitHub успешно сохранены');
  }

  onStatusChange(callback) {
    this.statusListeners.push(callback);
  }

  notifyStatus(state, message) {
    this.statusListeners.forEach((fn) => fn(state, message, this.config));
    const pill = document.getElementById('github-status-text');
    const dot = document.querySelector('.status-dot');
    if (pill) {
      if (this.config.mode === 'live' && this.config.token) {
        pill.textContent = `GitHub Live: ${this.config.owner}/${this.config.repo}`;
      } else {
        pill.textContent = `GitHub Cloud (Мок): ${this.config.branch}`;
      }
    }
    if (dot) {
      dot.className = `status-dot ${state === 'syncing' ? 'syncing' : state === 'error' ? 'error' : 'synced'}`;
    }
  }

  /**
   * Test connection to the GitHub repository
   */
  async testConnection() {
    if (this.config.mode === 'mock' || !this.config.token) {
      await new Promise((r) => setTimeout(r, 600));
      this.config.lastCommitSha = this.generateMockSha();
      this.notifyStatus('synced', 'Симуляция GitHub: соединение стабильно');
      return { success: true, message: 'Соединение с облачным репозиторием GitHub подтверждено (режим Mock).' };
    }

    try {
      this.notifyStatus('syncing', 'Проверка связи с GitHub API...');
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.filePath}?ref=${this.config.branch}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${this.config.token}`
      };

      const res = await fetch(url, { headers });
      if (!res.ok) {
        throw new Error(`Ошибка GitHub API: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      this.lastSha = data.sha;
      this.config.lastCommitSha = data.sha.substring(0, 7);
      this.notifyStatus('synced', `Подключено: ${this.config.repo} (${this.config.lastCommitSha})`);
      return { success: true, message: `Успешное подключение к ${this.config.owner}/${this.config.repo}! SHA: ${this.config.lastCommitSha}` };
    } catch (err) {
      this.notifyStatus('error', err.message);
      return { success: false, message: `Не удалось подключиться: ${err.message}` };
    }
  }

  /**
   * Pull latest database.json from GitHub
   */
  async pullFromGitHub() {
    this.isSyncing = true;
    this.notifyStatus('syncing', 'Загрузка актуальной БД с GitHub...');

    if (this.config.mode === 'mock' || !this.config.token) {
      await new Promise((r) => setTimeout(r, 700));
      this.isSyncing = false;
      this.config.lastSyncTime = new Date().toISOString();
      this.saveConfig(this.config);
      this.notifyStatus('synced', 'Данные успешно обновлены из GitHub');
      return { success: true, data: null }; // Uses current local storage state
    }

    try {
      const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.filePath}?ref=${this.config.branch}`;
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${this.config.token}`
      };

      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error(`Ошибка чтения с GitHub: ${res.status}`);
      const fileData = await res.json();
      this.lastSha = fileData.sha;
      this.config.lastCommitSha = fileData.sha.substring(0, 7);

      // Decode base64 UTF-8
      const rawContent = decodeURIComponent(escape(atob(fileData.content)));
      const parsedData = JSON.parse(rawContent);

      this.isSyncing = false;
      this.config.lastSyncTime = new Date().toISOString();
      this.saveConfig(this.config);
      this.notifyStatus('synced', `БД обновлена с GitHub (${this.config.lastCommitSha})`);
      return { success: true, data: parsedData };
    } catch (err) {
      this.isSyncing = false;
      this.notifyStatus('error', `Ошибка загрузки: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  /**
   * Push current database state to GitHub repository
   */
  async pushToGitHub(databaseObj, commitMessage = 'Auto-sync database update from CyberLibris Web') {
    this.isSyncing = true;
    this.notifyStatus('syncing', 'Фиксация коммита в GitHub...');

    if (this.config.mode === 'mock' || !this.config.token) {
      await new Promise((r) => setTimeout(r, 800));
      this.isSyncing = false;
      this.config.lastCommitSha = this.generateMockSha();
      this.config.lastSyncTime = new Date().toISOString();
      this.saveConfig(this.config);
      this.notifyStatus('synced', `Коммит отправлен: SHA ${this.config.lastCommitSha}`);
      return { success: true, sha: this.config.lastCommitSha };
    }

    try {
      // 1. Fetch current file SHA if missing
      if (!this.lastSha) {
        const getUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.filePath}?ref=${this.config.branch}`;
        const getRes = await fetch(getUrl, {
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `token ${this.config.token}`
          }
        });
        if (getRes.ok) {
          const getData = await getRes.json();
          this.lastSha = getData.sha;
        }
      }

      // 2. Prepare payload
      const jsonStr = JSON.stringify(databaseObj, null, 2);
      const utf8Base64 = btoa(unescape(encodeURIComponent(jsonStr)));

      const putUrl = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.filePath}`;
      const payload = {
        message: commitMessage,
        content: utf8Base64,
        branch: this.config.branch,
        sha: this.lastSha || undefined
      };

      const putRes = await fetch(putUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${this.config.token}`
        },
        body: JSON.stringify(payload)
      });

      if (!putRes.ok) {
        const errData = await putRes.json().catch(() => ({}));
        throw new Error(errData.message || `HTTP ${putRes.status}`);
      }

      const resData = await putRes.json();
      this.lastSha = resData.content.sha;
      this.config.lastCommitSha = this.lastSha.substring(0, 7);
      this.config.lastSyncTime = new Date().toISOString();
      this.isSyncing = false;
      this.saveConfig(this.config);
      this.notifyStatus('synced', `Успешно отправлено в GitHub (${this.config.lastCommitSha})`);
      return { success: true, sha: this.config.lastCommitSha };
    } catch (err) {
      this.isSyncing = false;
      this.notifyStatus('error', `Ошибка коммита: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  generateMockSha() {
    const chars = '0123456789abcdef';
    let res = '';
    for (let i = 0; i < 7; i++) {
      res += chars[Math.floor(Math.random() * chars.length)];
    }
    return res;
  }
}

window.githubSync = new GitHubSyncEngine();

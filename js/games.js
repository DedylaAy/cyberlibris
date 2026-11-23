/**
 * CyberLibris Mini-Games Suite & Customization Wardrobe
 */
class MiniGamesSuite {
  constructor() {
    this.currentGame = 'speed';

    // Speed Rush State
    this.speedScore = 0;
    this.speedCombo = 1;
    this.speedTimeLeft = 30;
    this.speedTimer = null;
    this.speedCurrentTarget = '';
    this.speedIsActive = false;

    // Cryptor State
    this.cryptorQuote = null;
    this.cryptorGuessed = new Set();
    this.cryptorMistakes = 0;
    this.cryptorMaxMistakes = 5;

    // Memory State
    this.memoryCards = [];
    this.memoryFlipped = [];
    this.memoryMatchedCount = 0;
    this.memoryMoves = 0;
    this.memoryLock = false;
  }

  init() {
    this.bindNav();
    this.bindShopTabs();
  }

  bindNav() {
    document.querySelectorAll('.game-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const game = e.currentTarget.dataset.game;
        this.switchGame(game);
      });
    });

    // Speed Rush Controls
    document.getElementById('btn-start-speed-rush')?.addEventListener('click', () => this.startSpeedRush());

    // Cryptor Controls
    document.getElementById('btn-next-cryptor')?.addEventListener('click', () => this.loadCryptorQuote());

    // Memory Controls
    document.getElementById('btn-restart-memory')?.addEventListener('click', () => this.initMemoryGame());
  }

  switchGame(gameId) {
    this.currentGame = gameId;
    document.querySelectorAll('.game-tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.game === gameId));
    document.querySelectorAll('.game-arena-view').forEach((v) => v.style.display = 'none');

    const view = document.getElementById(`game-view-${gameId}`);
    if (view) view.style.display = 'block';

    if (gameId === 'speed' && !this.speedIsActive) {
      // Ready state
    } else if (gameId === 'cryptor') {
      this.loadCryptorQuote();
    } else if (gameId === 'memory') {
      this.initMemoryGame();
    }

    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  // =========================================================================
  // GAME 1: SPEED RUSH (СЛОВЕСНЫЙ ШТОРМ)
  // =========================================================================

  startSpeedRush() {
    this.speedScore = 0;
    this.speedCombo = 1;
    this.speedTimeLeft = 30;
    this.speedIsActive = true;

    document.getElementById('speed-score-display').textContent = '0';
    document.getElementById('speed-combo-display').textContent = 'x1';
    document.getElementById('speed-timer-display').textContent = '30с';
    document.getElementById('btn-start-speed-rush').style.display = 'none';

    this.nextSpeedWord();

    clearInterval(this.speedTimer);
    this.speedTimer = setInterval(() => {
      this.speedTimeLeft--;
      document.getElementById('speed-timer-display').textContent = `${this.speedTimeLeft}с`;
      if (this.speedTimeLeft <= 0) {
        this.endSpeedRush();
      }
    }, 1000);
  }

  nextSpeedWord() {
    const list = window.dbEngine.getMiniGamesData().speedRushWords || ['КИБЕРПАНК', 'МАТРИЦА', 'АЛГОРИТМ'];
    this.speedCurrentTarget = list[Math.floor(Math.random() * list.length)];
    document.getElementById('speed-target-word').textContent = this.speedCurrentTarget;

    // Pick 3 random distractors
    const options = [this.speedCurrentTarget];
    while (options.length < 4) {
      const cand = list[Math.floor(Math.random() * list.length)];
      if (!options.includes(cand)) options.push(cand);
    }
    // Shuffle
    options.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('speed-options-grid');
    grid.innerHTML = '';
    options.forEach((word) => {
      const card = document.createElement('div');
      card.className = 'speed-word-card tilt-card';
      card.textContent = word;
      card.addEventListener('click', () => this.handleSpeedChoice(word, card));
      grid.appendChild(card);
    });
  }

  handleSpeedChoice(selectedWord, cardEl) {
    if (!this.speedIsActive) return;

    if (selectedWord === this.speedCurrentTarget) {
      cardEl.classList.add('correct');
      if (window.soundEngine) window.soundEngine.playCorrect();
      this.speedScore += 100 * this.speedCombo;
      this.speedCombo = Math.min(5, this.speedCombo + 1);
      document.getElementById('speed-score-display').textContent = this.speedScore;
      document.getElementById('speed-combo-display').textContent = `x${this.speedCombo}`;

      setTimeout(() => this.nextSpeedWord(), 200);
    } else {
      cardEl.classList.add('wrong');
      if (window.soundEngine) window.soundEngine.playWrong();
      this.speedCombo = 1;
      document.getElementById('speed-combo-display').textContent = 'x1';
    }
  }

  endSpeedRush() {
    this.speedIsActive = false;
    clearInterval(this.speedTimer);
    document.getElementById('btn-start-speed-rush').style.display = 'inline-flex';
    document.getElementById('btn-start-speed-rush').textContent = 'Сыграть снова';

    const lumensEarned = Math.round(this.speedScore / 15);
    const xpEarned = Math.round(this.speedScore / 5);

    window.auth.addLumens(lumensEarned);
    window.auth.addXp(xpEarned);
    window.auth.updateStat('gamesWon', 1);

    window.app.showToast(`⚡ Раунд завершен! Счёт: ${this.speedScore}. Награда: +${lumensEarned} ⬡, +${xpEarned} XP!`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // GAME 2: CYBER CRYPTOR (КИБЕР-КРИПТОР)
  // =========================================================================

  loadCryptorQuote() {
    const quotes = window.dbEngine.getMiniGamesData().cryptorQuotes || [];
    this.cryptorQuote = quotes[Math.floor(Math.random() * quotes.length)];
    this.cryptorGuessed.clear();
    this.cryptorMistakes = 0;

    document.getElementById('cryptor-author').textContent = this.cryptorQuote.author || 'Неизвестный автор';
    document.getElementById('cryptor-hint').textContent = this.cryptorQuote.hint || 'Литературный артефакт';
    this.renderCryptorPhrase();
    this.renderCryptorKeyboard();
    this.updateCryptorShields();
  }

  renderCryptorPhrase() {
    const container = document.getElementById('cryptor-phrase-display');
    container.innerHTML = '';

    const words = this.cryptorQuote.quote.split(' ');
    words.forEach((word) => {
      const group = document.createElement('div');
      group.className = 'cryptor-word-group';

      for (let ch of word) {
        const slot = document.createElement('div');
        slot.className = 'cryptor-slot';
        if (this.cryptorGuessed.has(ch)) {
          slot.textContent = ch;
          slot.classList.add('revealed');
        } else {
          slot.textContent = '';
        }
        group.appendChild(slot);
      }
      container.appendChild(group);
    });
  }

  renderCryptorKeyboard() {
    const kb = document.getElementById('cryptor-keyboard');
    kb.innerHTML = '';
    const letters = 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

    for (let char of letters) {
      const btn = document.createElement('button');
      btn.className = 'crypto-key';
      btn.textContent = char;
      btn.disabled = this.cryptorGuessed.has(char);
      btn.addEventListener('click', () => this.handleCryptorGuess(char, btn));
      kb.appendChild(btn);
    }
  }

  handleCryptorGuess(char, btnEl) {
    btnEl.disabled = true;
    this.cryptorGuessed.add(char);

    if (this.cryptorQuote.quote.includes(char)) {
      if (window.soundEngine) window.soundEngine.playCorrect();
      this.renderCryptorPhrase();
      this.checkCryptorWin();
    } else {
      this.cryptorMistakes++;
      if (window.soundEngine) window.soundEngine.playWrong();
      this.updateCryptorShields();
      if (this.cryptorMistakes >= this.cryptorMaxMistakes) {
        window.app.showToast('⚠️ Щиты истощены! Шифр не поддался. Попробуйте еще раз.', 'error');
        this.loadCryptorQuote();
      }
    }
  }

  updateCryptorShields() {
    const count = this.cryptorMaxMistakes - this.cryptorMistakes;
    let shieldsStr = '';
    for (let i = 0; i < count; i++) shieldsStr += '🛡️ ';
    document.getElementById('cryptor-shields').textContent = shieldsStr || '⚠️ Щиты сняты';
  }

  checkCryptorWin() {
    const lettersInQuote = new Set(this.cryptorQuote.quote.replace(/[^А-ЯЁ]/g, ''));
    let allFound = true;
    for (let l of lettersInQuote) {
      if (!this.cryptorGuessed.has(l)) {
        allFound = false;
        break;
      }
    }

    if (allFound) {
      const lumens = this.cryptorQuote.rewardLumens || 50;
      const xp = this.cryptorQuote.rewardXp || 150;
      window.auth.addLumens(lumens);
      window.auth.addXp(xp);
      window.auth.updateStat('cryptorSolved', 1);
      window.auth.updateStat('gamesWon', 1);

      window.app.showToast(`🎉 Цитата расшифрована! Награда: +${lumens} ⬡, +${xp} XP!`, 'reward');
      if (window.soundEngine) window.soundEngine.playLevelUp();
      setTimeout(() => this.loadCryptorQuote(), 2500);
    }
  }

  // =========================================================================
  // GAME 3: MEMORY MATRIX (МАТРИЦА ПАМЯТИ)
  // =========================================================================

  initMemoryGame() {
    const baseCards = window.dbEngine.getMiniGamesData().memoryCards || [];
    // Duplicate for pairs
    const deck = [...baseCards, ...baseCards].map((c, idx) => ({
      ...c,
      instanceId: `card_${idx}_${c.match}`
    }));

    deck.sort(() => Math.random() - 0.5);
    this.memoryCards = deck;
    this.memoryFlipped = [];
    this.memoryMatchedCount = 0;
    this.memoryMoves = 0;
    this.memoryLock = false;

    document.getElementById('memory-moves-count').textContent = '0';
    document.getElementById('memory-pairs-left').textContent = `${baseCards.length}`;

    const grid = document.getElementById('memory-grid');
    grid.innerHTML = '';

    deck.forEach((card) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.id = card.instanceId;
      cardEl.dataset.match = card.match;

      cardEl.innerHTML = `
        <div class="memory-card-face memory-card-front">
          <div class="card-cyber-pattern">⬡</div>
        </div>
        <div class="memory-card-face memory-card-back">
          <div class="card-icon">${card.icon}</div>
          <div class="card-label">${card.label}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.flipMemoryCard(cardEl, card));
      grid.appendChild(cardEl);
    });
  }

  flipMemoryCard(cardEl, cardData) {
    if (this.memoryLock) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    cardEl.classList.add('flipped');
    if (window.soundEngine) window.soundEngine.playCardFlip();
    this.memoryFlipped.push({ element: cardEl, data: cardData });

    if (this.memoryFlipped.length === 2) {
      this.memoryMoves++;
      document.getElementById('memory-moves-count').textContent = this.memoryMoves;
      this.checkMemoryMatch();
    }
  }

  checkMemoryMatch() {
    this.memoryLock = true;
    const [c1, c2] = this.memoryFlipped;

    if (c1.data.match === c2.data.match) {
      setTimeout(() => {
        c1.element.classList.add('matched');
        c2.element.classList.add('matched');
        if (window.soundEngine) window.soundEngine.playCorrect();
        this.memoryMatchedCount++;
        this.memoryFlipped = [];
        this.memoryLock = false;

        const totalPairs = this.memoryCards.length / 2;
        document.getElementById('memory-pairs-left').textContent = `${totalPairs - this.memoryMatchedCount}`;

        if (this.memoryMatchedCount === totalPairs) {
          this.endMemoryGame();
        }
      }, 400);
    } else {
      setTimeout(() => {
        c1.element.classList.remove('flipped');
        c2.element.classList.remove('flipped');
        if (window.soundEngine) window.soundEngine.playWrong();
        this.memoryFlipped = [];
        this.memoryLock = false;
      }, 900);
    }
  }

  endMemoryGame() {
    const lumens = Math.max(30, 100 - this.memoryMoves * 2);
    const xp = 160;
    window.auth.addLumens(lumens);
    window.auth.addXp(xp);
    window.auth.updateStat('memoryFlips', 1);
    window.auth.updateStat('gamesWon', 1);

    window.app.showToast(`🏆 Матрица раскрыта за ${this.memoryMoves} ходов! +${lumens} ⬡, +${xp} XP!`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // SHOP & WARDROBE (КАСТОМИЗАЦИЯ ПРОФИЛЯ)
  // =========================================================================

  bindShopTabs() {
    document.querySelectorAll('.shop-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.shopTab;
        document.querySelectorAll('.shop-tab-btn').forEach((b) => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderShopCategory(cat);
      });
    });
  }

  renderShop() {
    this.updateShopUserPreview();
    this.renderShopCategory('frames');
  }

  updateShopUserPreview() {
    const user = window.auth.currentUser;
    if (!user) return;

    const wrap = document.getElementById('shop-preview-avatar-wrap');
    if (wrap) {
      wrap.className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-default'}`;
      wrap.innerHTML = `<div class="avatar-inner">${user.avatar || '⚡'}</div>`;
    }
    const nameEl = document.getElementById('shop-preview-name');
    if (nameEl) nameEl.textContent = user.displayName || user.username;
    const titleEl = document.getElementById('shop-preview-title');
    if (titleEl) titleEl.textContent = user.title || 'Читатель';
    const lumensEl = document.getElementById('shop-user-lumens');
    if (lumensEl) lumensEl.textContent = `${user.lumens || 0} ⬡`;
  }

  renderShopCategory(category) {
    const user = window.auth.currentUser;
    const items = window.dbEngine.getShopItems()[category] || [];
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    items.forEach((item) => {
      const isUnlocked = user.unlockedCosmetics?.[category]?.includes(item.id) || item.price === 0;
      const isEquipped = (category === 'frames' && user.avatarFrame === item.id) ||
                         (category === 'backgrounds' && user.customBg === item.id) ||
                         (category === 'titles' && user.title === item.name);

      const card = document.createElement('div');
      card.className = 'shop-item-card tilt-card';

      card.innerHTML = `
        <div>
          <div class="shop-item-header">
            <div class="shop-item-icon">${item.icon || '✨'}</div>
            <div>
              <div class="shop-item-title">${item.name}</div>
              <span class="logo-badge" style="font-size: 0.6rem;">${category.toUpperCase()}</span>
            </div>
          </div>
          <div class="shop-item-desc">${item.description || ''}</div>
        </div>
        <div class="shop-item-footer">
          <div class="shop-price-tag">
            ${isUnlocked ? '<span style="color: var(--accent-green); font-size: 0.85rem;">РАЗБЛОКИРОВАНО</span>' : `<span>${item.price}</span> ⬡`}
          </div>
          <div>
            ${
              isEquipped
                ? '<button class="btn btn-secondary btn-sm" disabled>Используется</button>'
                : isUnlocked
                ? `<button class="btn btn-primary btn-sm btn-equip" data-cat="${category}" data-id="${item.id}" data-name="${item.name}">Надеть</button>`
                : `<button class="btn btn-gold btn-sm btn-buy" data-cat="${category}" data-id="${item.id}" data-price="${item.price}" data-name="${item.name}">Купить</button>`
            }
          </div>
        </div>
      `;

      card.querySelector('.btn-equip')?.addEventListener('click', () => this.equipItem(category, item.id, item.name));
      card.querySelector('.btn-buy')?.addEventListener('click', () => this.buyItem(category, item.id, item.price, item.name));

      grid.appendChild(card);
    });
  }

  buyItem(category, itemId, price, itemName) {
    const user = window.auth.currentUser;
    if ((user.lumens || 0) < price) {
      window.app.showToast('Недостаточно люменов (⬡)! Сыграйте в мини-игры или почитайте книги.', 'error');
      if (window.soundEngine) window.soundEngine.playWrong();
      return;
    }

    user.lumens -= price;
    if (!user.unlockedCosmetics) user.unlockedCosmetics = { frames: [], backgrounds: [], titles: [] };
    if (!user.unlockedCosmetics[category]) user.unlockedCosmetics[category] = [];
    user.unlockedCosmetics[category].push(itemId);

    window.app.showToast(`🎉 Куплено: "${itemName}"!`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();

    this.equipItem(category, itemId, itemName);
  }

  equipItem(category, itemId, itemName) {
    const user = window.auth.currentUser;
    if (category === 'frames') user.avatarFrame = itemId;
    else if (category === 'backgrounds') user.customBg = itemId;
    else if (category === 'titles') user.title = itemName;

    window.auth.saveUser();
    window.auth.syncUserToUI();
    this.updateShopUserPreview();
    this.renderShopCategory(category);
    window.app.showToast(`✨ Применено: "${itemName}"`, 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }
}

window.miniGames = new MiniGamesSuite();

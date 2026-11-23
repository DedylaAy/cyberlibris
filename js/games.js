/**
 * CyberLibris Mini-Games Suite & Customization Wardrobe
 * -------------------------------------------------------------
 * 1. «Словесный Шторм» (Цитаты великих личностей и мыслителей)
 * 2. «Литературный Квиз Эрудита» (Интеллектуальная викторина по книгам)
 * 3. Артефактный Магазин (Трата Люменов на аватарные рамки, титулы, фоны и темы)
 */

class MiniGamesSuite {
  constructor() {
    this.currentGame = 'speed';

    // Game 1: Speed Rush (Цитаты великих людей)
    this.speedScore = 0;
    this.speedCombo = 1;
    this.speedTimeLeft = 30;
    this.speedTimer = null;
    this.speedCurrentTarget = '';
    this.speedCurrentAuthor = '';
    this.speedIsActive = false;

    this.famousQuotes = [
      { word: "ГОЛОДНЫМИ", quote: "Оставайтесь голодными, оставайтесь безрассудными.", author: "Стив Джобс" },
      { word: "КРАСОТА", quote: "Красота спасёт этот безумный мир.", author: "Фёдор Достоевский" },
      { word: "НАЧАТЬ", quote: "Секрет того, чтобы преуспеть — просто начать.", author: "Марк Твен" },
      { word: "ВООБРАЖЕНИЕ", quote: "Воображение куда важнее, чем сухие знания.", author: "Альберт Эйнштейн" },
      { word: "СИЛЬНЕЕ", quote: "То, что нас не убивает, делает нас сильнее.", author: "Фридрих Ницше" },
      { word: "РОЛИ", quote: "Будь собой, все остальные роли уже безнадежно заняты.", author: "Оскар Уайльд" },
      { word: "ПРОСТЫ", quote: "Все мысли, имеющие огромные последствия, всегда просты.", author: "Лев Толстой" },
      { word: "НЕ ГОРЯТ", quote: "Поверьте мне, настоящие рукописи никогда не горят.", author: "Михаил Булгаков" },
      { word: "СТРАХ", quote: "Страх убивает разум. Страх — это малая смерть.", author: "Фрэнк Герберт (Дюна)" },
      { word: "ИСТИНА", quote: "Отбросьте все невозможное; то, что останется, и есть истина.", author: "Шерлок Холмс" },
      { word: "ПОБЕДА", quote: "Лучшая победа — это покорить врага без единого выстрела.", author: "Сунь-Цзы" },
      { word: "ВРЕМЯ", quote: "Всему свой час, и время всякой вещи под этим небом.", author: "Царь Соломон" }
    ];

    // Game 2: Literary Quiz Erudite
    this.quizQuestions = [
      {
        question: "В каком бессмертном романе Москву посещает Воланд со своей свитой и котом Бегемотом?",
        options: ["«Мастер и Маргарита»", "«Белая гвардия»", "«Собачье сердце»", "«Роковые яйца»"],
        correct: 0,
        hint: "Михаил Булгаков"
      },
      {
        question: "Кто является автором древнейшего и самого почитаемого военного трактата «Искусство войны»?",
        options: ["Конфуций", "Сунь-Цзы", "Лао-Цзы", "Сыма Цянь"],
        correct: 1,
        hint: "Стратегия победы без боя"
      },
      {
        question: "Как звали главного героя культовой антиутопии Джорджа Оруэлла «1984»?",
        options: ["Родион Раскольников", "Уинстон Смит", "О'Брайен", "Пьер Безухов"],
        correct: 1,
        hint: "Сотрудник Министерства Правды"
      },
      {
        question: "Какая суровая пустынная планета служила единственным источником Пряности в романе Фрэнка Герберта?",
        options: ["Каладан", "Гьеди Прайм", "Арракис (Дюна)", "Солярис"],
        correct: 2,
        hint: "Песчаные черви и фримены"
      },
      {
        question: "Какой студент мучился вопросом: «Тварь ли я дрожащая или право имею?»",
        options: ["Родион Раскольников", "Дмитрий Карамазов", "Евгений Онегин", "Андрей Болконский"],
        correct: 0,
        hint: "Ф.М. Достоевский, «Преступление и наказание»"
      },
      {
        question: "«Небо над портом напоминало телевизионный экран, включенный на мертвый канал» — первые строки какого шедевра киберпанка?",
        options: ["«Лавина» Нила Стивенсона", "«Нейромант» Уильяма Гибсона", "«Видоизмененный углерод»", "«Мечтают ли андроиды об электроовцах?»"],
        correct: 1,
        hint: "Кейс и Тиба-Сити"
      },
      {
        question: "Кто произнес знаменитую фразу: «Время разбрасывать камни, и время собирать камни»?",
        options: ["Царь Соломон (Экклезиаст)", "Аристотель", "Сократ", "Марк Аврелий"],
        correct: 0,
        hint: "Книга Экклезиаста"
      },
      {
        question: "Какое великое произведение Льва Толстого описывает Бородинское сражение и небо Аустерлица?",
        options: ["«Анна Каренина»", "«Воскресение»", "«Война и мир»", "«Смерть Ивана Ильича»"],
        correct: 2,
        hint: "Монументальная четырехтомная эпопея"
      }
    ];
    this.quizIdx = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
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

    // Quiz Controls
    document.getElementById('btn-next-quiz')?.addEventListener('click', () => this.nextQuizQuestion());
  }

  switchGame(gameId) {
    this.currentGame = gameId;
    document.querySelectorAll('.game-tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.game === gameId));
    document.querySelectorAll('.game-arena-view').forEach((v) => v.style.display = 'none');

    const view = document.getElementById(`game-view-${gameId}`);
    if (view) view.style.display = 'block';

    if (gameId === 'speed') {
      if (!this.speedIsActive) {
        document.getElementById('speed-target-word').textContent = 'НАЖМИТЕ СТАРТ';
        document.getElementById('speed-options-grid').innerHTML = '';
        document.getElementById('btn-start-speed-rush').style.display = 'inline-flex';
      }
    } else if (gameId === 'quiz') {
      this.initQuizGame();
    }

    if (window.soundEngine) window.soundEngine.playCardFlip();
  }

  // =========================================================================
  // GAME 1: SPEED RUSH 2.0 (ЦИТАТЫ ВЕЛИКИХ ЛИЧНОСТЕЙ)
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
    const item = this.famousQuotes[Math.floor(Math.random() * this.famousQuotes.length)];
    this.speedCurrentTarget = item.word;
    this.speedCurrentAuthor = item.author;

    const targetEl = document.getElementById('speed-target-word');
    if (targetEl) {
      targetEl.innerHTML = `
        <span style="display:block; font-size: 0.95rem; color: var(--accent-magenta); margin-bottom: 0.4rem;">«${item.quote}»</span>
        <span style="font-size: 1.8rem; letter-spacing: 2px;">${item.word}</span>
        <span style="display:block; font-size: 0.8rem; color: var(--text-dim); margin-top: 0.4rem;">— ${item.author}</span>
      `;
    }

    // Generate 4 button choices (1 correct, 3 decoys)
    const allWords = this.famousQuotes.map(q => q.word);
    const decoys = allWords.filter(w => w !== this.speedCurrentTarget).sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [this.speedCurrentTarget, ...decoys].sort(() => Math.random() - 0.5);

    const grid = document.getElementById('speed-options-grid');
    if (!grid) return;
    grid.innerHTML = '';

    options.forEach((word) => {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary speed-word-card';
      btn.style.padding = '1.2rem 1.5rem';
      btn.style.fontSize = '1.1rem';
      btn.style.fontWeight = '800';
      btn.textContent = word;

      btn.addEventListener('click', () => this.handleSpeedWordChoice(word, btn));
      grid.appendChild(btn);
    });
  }

  handleSpeedWordChoice(chosenWord, btn) {
    if (!this.speedIsActive) return;

    if (chosenWord === this.speedCurrentTarget) {
      btn.style.background = 'var(--accent-green)';
      btn.style.borderColor = 'var(--accent-green)';
      this.speedScore += 100 * this.speedCombo;
      this.speedCombo = Math.min(5, this.speedCombo + 1);

      document.getElementById('speed-score-display').textContent = this.speedScore;
      document.getElementById('speed-combo-display').textContent = `x${this.speedCombo}`;

      if (window.soundEngine) window.soundEngine.playCorrect();
      setTimeout(() => this.nextSpeedWord(), 250);
    } else {
      btn.style.background = 'var(--accent-magenta)';
      btn.style.borderColor = 'var(--accent-magenta)';
      this.speedCombo = 1;
      document.getElementById('speed-combo-display').textContent = 'x1';
      if (window.soundEngine) window.soundEngine.playError();
    }
  }

  endSpeedRush() {
    this.speedIsActive = false;
    clearInterval(this.speedTimer);

    const btn = document.getElementById('btn-start-speed-rush');
    if (btn) {
      btn.style.display = 'inline-flex';
      btn.textContent = '⚡ Сыграть снова';
    }

    const lumensEarned = Math.round(this.speedScore / 10);
    const xpEarned = Math.round(this.speedScore / 3);

    if (window.auth) {
      window.auth.addLumens(lumensEarned);
      window.auth.addXp(xpEarned);
      window.auth.updateStat('gamesWon', 1);
    }

    if (window.dbEngine) {
      window.dbEngine.updateQuestProgress('quest_speed_rush', 1);
      if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
    }

    window.app.showToast(`⚡ Раунд завершен! Счёт: ${this.speedScore}. Награда: +${lumensEarned} ⬡, +${xpEarned} XP!`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // GAME 2: LITERARY QUIZ ERUDITE (КВИЗ ЭРУДИТА)
  // =========================================================================

  initQuizGame() {
    this.quizIdx = 0;
    this.quizScore = 0;
    this.quizStreak = 0;
    this.renderQuizQuestion();
  }

  renderQuizQuestion() {
    const q = this.quizQuestions[this.quizIdx % this.quizQuestions.length];
    const qTextEl = document.getElementById('quiz-question-text');
    const qNumEl = document.getElementById('quiz-number-display');
    const qScoreEl = document.getElementById('quiz-score-display');
    const qStreakEl = document.getElementById('quiz-streak-display');
    const answersGrid = document.getElementById('quiz-answers-grid');

    if (qNumEl) qNumEl.textContent = `Вопрос ${this.quizIdx + 1} из ${this.quizQuestions.length}`;
    if (qScoreEl) qScoreEl.textContent = `${this.quizScore} ⬡`;
    if (qStreakEl) qStreakEl.textContent = `Серия: ${this.quizStreak} 🔥`;
    if (qTextEl) qTextEl.textContent = q.question;

    if (!answersGrid) return;
    answersGrid.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn-quiz-answer';
      btn.innerHTML = `<span style="color:var(--accent-cyan); font-weight:900; margin-right:0.6rem;">${String.fromCharCode(65 + idx)}.</span> ${opt}`;

      btn.addEventListener('click', () => {
        const allBtns = answersGrid.querySelectorAll('.btn-quiz-answer');
        allBtns.forEach(b => b.disabled = true);

        if (idx === q.correct) {
          btn.style.background = 'rgba(0, 255, 136, 0.25)';
          btn.style.borderColor = 'var(--accent-green)';
          this.quizStreak += 1;
          const reward = 25 * Math.min(3, this.quizStreak);
          this.quizScore += reward;

          if (window.auth) {
            window.auth.addLumens(reward);
            window.auth.addXp(reward * 2);
          }

          if (window.dbEngine) {
            window.dbEngine.updateQuestProgress('quest_cryptor', 1);
            if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
          }

          window.app.showToast(`✓ Верно! +${reward} ⬡, +${reward * 2} XP!`, 'reward');
          if (window.soundEngine) window.soundEngine.playCorrect();
        } else {
          btn.style.background = 'rgba(255, 0, 127, 0.25)';
          btn.style.borderColor = 'var(--accent-magenta)';
          allBtns[q.correct].style.background = 'rgba(0, 255, 136, 0.25)';
          allBtns[q.correct].style.borderColor = 'var(--accent-green)';
          this.quizStreak = 0;
          if (window.soundEngine) window.soundEngine.playError();
        }

        setTimeout(() => {
          this.quizIdx += 1;
          this.renderQuizQuestion();
        }, 1600);
      });

      answersGrid.appendChild(btn);
    });
  }

  // =========================================================================
  // SHOP & CUSTOMIZATION WARDROBE (ТРАТА ВАЛЮТЫ)
  // =========================================================================

  bindShopTabs() {
    document.querySelectorAll('.shop-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = e.currentTarget.dataset.shopTab;
        document.querySelectorAll('.shop-tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.shopTab === cat));
        this.renderShopCategory(cat);
      });
    });

    this.renderShopCategory('frames');
    this.updateShopUserPreview();
  }

  updateShopUserPreview() {
    const user = window.auth.currentUser;
    if (!user) return;

    const wrap = document.getElementById('shop-preview-avatar');
    if (wrap) {
      wrap.className = `avatar-frame-wrap preview-avatar-large ${user.avatarFrame || 'frame-default'}`;
      wrap.innerHTML = `<div class="avatar-inner">${user.avatar || '📖'}</div>`;
    }

    const titleEl = document.getElementById('shop-preview-title');
    if (titleEl) {
      titleEl.innerHTML = window.auth.getRoleBadgeHTML(user.role, user.level);
    }
  }

  renderShopCategory(category) {
    const grid = document.getElementById('shop-items-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const shopData = window.dbEngine.getShopItems();
    const items = (shopData && shopData[category]) ? shopData[category] : [];
    const user = window.auth.currentUser;

    items.forEach((item) => {
      const isOwned = user?.inventory?.[category]?.includes(item.id) || item.price === 0;
      const isEquipped = (category === 'frames' && user?.avatarFrame === item.id) ||
                         (category === 'backgrounds' && user?.customBg === item.id) ||
                         (category === 'titles' && user?.title === item.name);

      const card = document.createElement('div');
      card.className = `shop-item-card ${isEquipped ? 'equipped' : isOwned ? 'owned' : ''}`;

      card.innerHTML = `
        <div class="shop-item-preview">
          ${category === 'frames' ? `
            <div class="avatar-frame-wrap ${item.id}" style="width: 70px; height: 70px; margin: 0 auto;">
              <div class="avatar-inner" style="font-size: 2rem;">${user?.avatar || '📖'}</div>
            </div>
          ` : category === 'backgrounds' ? `
            <div style="height: 70px; border-radius: 8px; background: ${item.preview || 'var(--bg-card)'}; display:flex; align-items:center; justify-content:center; font-size:1.8rem;">
              🎨
            </div>
          ` : `
            <div style="height: 70px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:1.1rem; color:var(--accent-gold);">
              👑 ${item.name}
            </div>
          `}
        </div>
        <div class="shop-item-info">
          <div class="shop-item-name">${item.name}</div>
          <div class="shop-item-desc">${item.description || ''}</div>
          <div class="shop-item-price">${isOwned ? 'КУПЛЕНО' : `${item.price} ⬡`}</div>
        </div>
        <div class="shop-item-actions">
          ${isEquipped ? `
            <button class="btn btn-secondary btn-sm" disabled>✓ Активно</button>
          ` : isOwned ? `
            <button class="btn btn-primary btn-sm btn-equip" data-cat="${category}" data-id="${item.id}">Применить</button>
          ` : `
            <button class="btn btn-gold btn-sm btn-buy" data-cat="${category}" data-id="${item.id}" data-price="${item.price}">Купить за ${item.price} ⬡</button>
          `}
        </div>
      `;

      card.querySelector('.btn-buy')?.addEventListener('click', () => this.buyItem(category, item.id, item.price, item.name));
      card.querySelector('.btn-equip')?.addEventListener('click', () => this.equipItem(category, item.id, item.name));

      grid.appendChild(card);
    });

    if (window.app?.bindTiltEffect) window.app.bindTiltEffect();
  }

  buyItem(category, itemId, price, itemName) {
    const user = window.auth.currentUser;
    if (!user) {
      window.app.openModal('modal-auth');
      return;
    }

    if ((user.lumens || 0) < price) {
      window.app.showToast('Недостаточно Люменов (⬡)! Читайте книги и выполняйте квесты.', 'error');
      if (window.soundEngine) window.soundEngine.playError();
      return;
    }

    user.lumens -= price;
    if (!user.inventory) user.inventory = { frames: [], backgrounds: [], titles: [] };
    if (!user.inventory[category]) user.inventory[category] = [];
    user.inventory[category].push(itemId);

    window.auth.saveUser();
    window.auth.syncUserToUI();

    window.app.showToast(`🎉 Куплено: "${itemName}" (-${price} ⬡)!`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();

    this.equipItem(category, itemId, itemName);
  }

  equipItem(category, itemId, itemName) {
    const user = window.auth.currentUser;
    if (!user) return;

    if (category === 'frames') {
      user.avatarFrame = itemId;
    } else if (category === 'backgrounds') {
      user.customBg = itemId;
      if (window.reactiveBg) window.reactiveBg.setTheme(itemId);
      if (window.dbEngine) {
        window.dbEngine.updateQuestProgress('quest_change_theme', 1);
        if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
      }
    } else if (category === 'titles') {
      user.title = itemName;
    }

    window.auth.saveUser();
    window.auth.syncUserToUI();
    this.updateShopUserPreview();
    this.renderShopCategory(category);
    window.app.showToast(`✨ Применено: "${itemName}"`, 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }
}

window.miniGames = new MiniGamesSuite();

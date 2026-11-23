/**
 * CyberLibris Mini-Games Suite & Customization Wardrobe v4.5
 * -------------------------------------------------------------
 * 1. «Словесный Шторм 2.0» (Цитаты великих мыслителей, мгновенный перезапуск)
 * 2. «Литературный Квиз Эрудита» (Выбор книги читателем -> вопросы по выбранной книге!)
 * 3. Артефактный Магазин (Анимированные рамки, фоны, читательские стили и титулы)
 */

class MiniGamesSuite {
  constructor() {
    this.currentGame = 'speed';

    // Game 1: Speed Rush State
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

    // Game 2: Book-Specific Quiz Database
    this.selectedQuizBookId = null;
    this.currentQuizQuestions = [];
    this.quizIdx = 0;
    this.quizScore = 0;
    this.quizStreak = 0;

    this.bookQuizzes = {
      relay_master_margarita: {
        title: "Мастер и Маргарита",
        author: "М.А. Булгаков",
        cover: "https://covers.openlibrary.org/b/id/10523455-L.jpg",
        questions: [
          {
            question: "Кто находился на Патриарших прудах вместе с Михаилом Берлиозом в момент появления Воланда?",
            options: ["Поэт Иван Бездомный", "Директор варьете Лиходеев", "Мастер", "Коровьев"],
            correct: 0,
            hint: "Молодой поэт, пишущий антирелигиозную поэму"
          },
          {
            question: "Какое масло разлила Аннушка на трамвайных путях у Патриарших?",
            options: ["Подсолнечное", "Оливковое", "Льняное", "Кунжутное"],
            correct: 0,
            hint: "«Не только разлила, но уже и купила...»"
          },
          {
            question: "Какая бессмертная фраза Воланда стала манифестом о вечности рукописного слова?",
            options: ["«Рукописи не горят»", "«Каждому воздастся по вере его»", "«Трусость — самый тяжкий порок»", "«Никогда ничего не просите»"],
            correct: 0,
            hint: "Слова при возвращении сожженного романа Мастеру"
          },
          {
            question: "Какой недуг мучил римского прокуратора Понтия Пилата в Ершалаиме?",
            options: ["Гемикрания (ужасная боль полуголовы)", "Бессонница", "Слепота", "Лихорадка"],
            correct: 0,
            hint: "Невыносимая головная боль, от которой пахло розовым маслом"
          },
          {
            question: "Кем по своей демонической сути являлся черный кот Бегемот в свите Воланда?",
            options: ["Демоном-пажем и шутом-оборотнем", "Обычным бродячим котом", "Заколдованным чародеем", "Галлюцинацией москвичей"],
            correct: 0,
            hint: "Любитель примусов, водки и маринованных грибов"
          }
        ]
      },
      relay_war_and_peace: {
        title: "Война и мир",
        author: "Л.Н. Толстой",
        cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
        questions: [
          {
            question: "Какое зрелище на поле Аустерлица перевернуло мировоззрение тяжелораненого князя Андрея Болконского?",
            options: ["Высокое, бесконечное и тихое небо", "Бегущие полки Наполеона", "Яркое полуденное солнце", "Знамя Апшеронского полка"],
            correct: 0,
            hint: "«Как тихо, спокойно и торжественно... Все пустое, кроме этого бесконечного неба»"
          },
          {
            question: "Чьим незаконным сыном являлся Пьер до внезапного получения колоссального наследства?",
            options: ["Графа Кирилла Безухова", "Князя Василия Курагина", "Генерала Багратиона", "Князя Николая Болконского"],
            correct: 0,
            hint: "Екатерининский вельможа, умиравший в Москве"
          },
          {
            question: "Командир какой неприметной батареи совершил подвиг в Шенграбенском сражении без прикрытия?",
            options: ["Капитан Тушин", "Штабс-капитан Долохов", "Поручик Ржевский", "Полковник Денисов"],
            correct: 0,
            hint: "Скромный офицер в чулках и с трубочкой в зубах"
          },
          {
            question: "На ком женился Пьер Безухов в финале романа после всех испытаний плена и войны?",
            options: ["На Наташе Ростовой", "На Элен Курагиной", "На княжне Марье Болконской", "На Соне"],
            correct: 0,
            hint: "Любимая героиня Льва Толстого"
          }
        ]
      },
      relay_crime_and_punishment: {
        title: "Преступление и наказание",
        author: "Ф.М. Достоевский",
        cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
        questions: [
          {
            question: "Каким орудием Родион Раскольников совершил роковое преступление?",
            options: ["Топором из кухни дворника", "Кинжалом", "Тяжелым подсвечником", "Шнуром"],
            correct: 0,
            hint: "Спрятан под пальто в самодельной петле"
          },
          {
            question: "Какой сакраментальный вопрос терзал Раскольникова при создании его теории?",
            options: ["«Тварь ли я дрожащая или право имею?»", "«Вся власть — насилие?»", "«Есть ли жизнь после смерти?»", "«Все ли позволено сильным?»"],
            correct: 0,
            hint: "Деление людей на обыкновенных и Наполеонов"
          },
          {
            question: "Кто последовал за Раскольниковым на каторгу в Сибирь, став его духовной опорой?",
            options: ["Соня Мармеладова", "Сестра Авдотья (Дуня)", "Друг Разумихин", "Мать Пульхерия Александровна"],
            correct: 0,
            hint: "Дочь чиновника Мармеладова, читавшая ему Евангелие о воскрешении Лазаря"
          },
          {
            question: "Какой цвет навязчиво преобладает в описании комнат, обоев и билета Сони в Петербурге Достоевского?",
            options: ["Желтый", "Серый", "Зеленый", "Багровый"],
            correct: 0,
            hint: "Цвет болезни, безумия и нищеты"
          }
        ]
      },
      relay_1984_orwell: {
        title: "1984",
        author: "Джордж Оруэлл",
        cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
        questions: [
          {
            question: "В каком министерстве служил Уинстон Смит, занимаясь переписыванием архивных газет?",
            options: ["Министерство Правды (Миниправ)", "Министерство Любви (Минилюб)", "Министерство Изобилия", "Министерство Мира"],
            correct: 0,
            hint: "Орган, ведающий пропагандой и фальсификацией истории"
          },
          {
            question: "Какой номер носила зловещая комната абсолютного страха в подвалах Министерства Любви?",
            options: ["Комната 101", "Комната 404", "Комната 1984", "Комната 7"],
            correct: 0,
            hint: "«Там находится то, что хуже всего на свете...»"
          },
          {
            question: "Как назывался искусственный язык Океании, создаваемый для полного исключения опасных мыслей?",
            options: ["Новояз (Newspeak)", "Партоглагол", "Евролингва", "Ангсоц"],
            correct: 0,
            hint: "Язык с ежегодным сокращением словарного запаса"
          },
          {
            question: "Какой предмет старинного быта из лавки Чаррингтона стал для Уинстона символом утраченного прошлого?",
            options: ["Стеклянное пресс-папье с кораллом внутри", "Медные карманные часы", "Фарфоровая чашка", "Граммофонная пластинка"],
            correct: 0,
            hint: "Кусочек застывшего чистого времени"
          }
        ]
      },
      relay_dune: {
        title: "Дюна",
        author: "Фрэнк Герберт",
        cover: "https://covers.openlibrary.org/b/id/11187425-L.jpg",
        questions: [
          {
            question: "Как коренные жители пустыни (фримены) почтительно именовали гигантских песчаных червей?",
            options: ["Шаи-Хулуд", "Сардаукар", "Краулер", "Создатель глубин"],
            correct: 0,
            hint: "«Старик Пустыни» и «Вечный Червь»"
          },
          {
            question: "Какое бесценное вещество добывалось исключительно на песках планеты Арракис?",
            options: ["Пряность (Меланж)", "Тяжелая вода", "Кристаллы спайса", "Эфириум"],
            correct: 0,
            hint: "Продлевает жизнь и позволяет гильд-навигаторам сворачивать пространство"
          },
          {
            question: "Какой коварный Дом предал Атрейдесов при тайной поддержке Падишах-Императора?",
            options: ["Дом Харконненов", "Дом Коррино", "Дом Ричез", "Дом Верниус"],
            correct: 0,
            hint: "Барон Владимир Харконнен с темной планеты Гьеди Прайм"
          },
          {
            question: "Какое имя принял Пол Атрейдес среди вольных племен фрименов в ситче Табр?",
            options: ["Муад'Диб (Пустынная мышь)", "Квисатц Хадерах", "Усул", "Лисан аль-Гаиб"],
            correct: 0,
            hint: "Маленькая проворная мышь, рисунок которой виден на второй луне Арракиса"
          }
        ]
      },
      relay_art_of_war: {
        title: "Искусство войны",
        author: "Сунь-Цзы",
        cover: "https://covers.openlibrary.org/b/id/12095383-L.jpg",
        questions: [
          {
            question: "Что Сунь-Цзы провозглашает абсолютной вершиной полководческого мастерства?",
            options: ["Покорить чужую армию, не вступая в бой", "Победить сто раз в ста битвах", "Взять штурмом неприступную крепость", "Иметь самую многочисленную конницу"],
            correct: 0,
            hint: "Разрушить замыслы и союзы противника прежде сражения"
          },
          {
            question: "Какой из пяти факторов войны выражает духовное единение народа с правителем?",
            options: ["Дао (Путь)", "Тянь (Небо)", "Ди (Земля)", "Фа (Закон)"],
            correct: 0,
            hint: "Первая и главнейшая основа государственного бытия"
          },
          {
            question: "Каких двух зверей должен уметь воплощать мудрый стратег?",
            options: ["Льва и Лисицу", "Дракона и Тигра", "Сокола и Змею", "Волка и Медведя"],
            correct: 0,
            hint: "Быть лисицей против капканов и львом против волков"
          }
        ]
      },
      relay_sherlock_holmes: {
        title: "Приключения Шерлока Холмса",
        author: "А. Конан Дойл",
        cover: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
        questions: [
          {
            question: "Какой знаменитый лондонский адрес служил квартирой Шерлоку Холмсу и доктору Ватсону?",
            options: ["Бейкер-стрит, 221Б", "Флит-стрит, 10", "Даунинг-стрит, 42", "Пикадилли, 7"],
            correct: 0,
            hint: "Усадьба миссис Хадсон"
          },
          {
            question: "Как Шерлок Холмс всегда уважительно именовал певицу Ирен Адлер?",
            options: ["«Эта Женщина»", "«Королева Шахмат»", "«Лондонская Муза»", "«Мой единственный соперник»"],
            correct: 0,
            hint: "Героиня рассказа «Скандал в Богемии»"
          },
          {
            question: "Какое смертоносное существо оказалось «Пестрой лентой» доктора Ройлотта?",
            options: ["Болотная гадюка (ядовитая индийская змея)", "Мадагаскарский паук", "Дрессированный хорек", "Полосатый скорпион"],
            correct: 0,
            hint: "Спускалась по шнуру от колокольчика в вентиляционное отверстие"
          }
        ]
      }
    };
  }

  init() {
    this.bindNav();
    this.bindShopTabs();
    this.bindQuizBookSelector();
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
      this.renderQuizBookSelector();
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
        <span style="display:block; font-size: 1rem; color: var(--accent-magenta); margin-bottom: 0.5rem; font-style:italic;">«${item.quote}»</span>
        <span style="font-size: 1.9rem; letter-spacing: 2px; font-weight:900;">${item.word}</span>
        <span style="display:block; font-size: 0.85rem; color: var(--text-dim); margin-top: 0.5rem;">— ${item.author}</span>
      `;
    }

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
      btn.style.fontSize = '1.15rem';
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
  // GAME 2: LITERARY QUIZ (ВЫБОР КНИГИ -> ВОПРОСЫ ПО ЭТОЙ КНИГЕ!)
  // =========================================================================

  bindQuizBookSelector() {
    document.getElementById('btn-back-to-quiz-books')?.addEventListener('click', () => {
      this.renderQuizBookSelector();
    });
  }

  renderQuizBookSelector() {
    const selectorStage = document.getElementById('quiz-book-selector-stage');
    const questionStage = document.getElementById('quiz-active-question-stage');
    const booksGrid = document.getElementById('quiz-books-picker-grid');

    if (selectorStage) selectorStage.style.display = 'block';
    if (questionStage) questionStage.style.display = 'none';

    if (!booksGrid) return;
    booksGrid.innerHTML = '';

    Object.keys(this.bookQuizzes).forEach((bookId) => {
      const b = this.bookQuizzes[bookId];
      const card = document.createElement('div');
      card.className = 'quiz-book-pick-card tilt-card';
      card.style.background = 'var(--bg-card)';
      card.style.border = '1px solid var(--border-glow)';
      card.style.borderRadius = 'var(--radius-md)';
      card.style.padding = '0.9rem';
      card.style.cursor = 'pointer';
      card.style.textAlign = 'center';
      card.style.transition = 'all 0.25s ease';

      card.innerHTML = `
        <img src="${b.cover}" style="width:100%; height:160px; object-fit:cover; border-radius:4px; margin-bottom:0.6rem; box-shadow:0 8px 18px rgba(0,0,0,0.6);" alt="${b.title}">
        <div style="font-weight:800; font-size:0.92rem; color:#fff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${b.title}</div>
        <div style="font-size:0.75rem; color:var(--accent-cyan); margin-bottom:0.5rem;">${b.author}</div>
        <div style="font-size:0.75rem; color:var(--text-dim);">${b.questions.length} вопросов</div>
        <button class="btn btn-primary btn-sm btn-block" style="margin-top:0.6rem;">
          🎯 Проверить эрудицию
        </button>
      `;

      card.addEventListener('click', () => {
        this.startQuizForBook(bookId);
      });

      booksGrid.appendChild(card);
    });

    if (window.app?.bindTiltEffect) window.app.bindTiltEffect();
  }

  startQuizForBook(bookId) {
    const bookData = this.bookQuizzes[bookId];
    if (!bookData) return;

    this.selectedQuizBookId = bookId;
    this.currentQuizQuestions = bookData.questions;
    this.quizIdx = 0;
    this.quizScore = 0;
    this.quizStreak = 0;

    const selectorStage = document.getElementById('quiz-book-selector-stage');
    const questionStage = document.getElementById('quiz-active-question-stage');
    const bookBadge = document.getElementById('quiz-current-book-badge');

    if (selectorStage) selectorStage.style.display = 'none';
    if (questionStage) questionStage.style.display = 'block';
    if (bookBadge) bookBadge.textContent = `«${bookData.title}» (${bookData.author})`;

    this.renderCurrentQuizQuestion();
  }

  renderCurrentQuizQuestion() {
    const q = this.currentQuizQuestions[this.quizIdx];
    if (!q) {
      // Quiz completed!
      this.finishBookQuiz();
      return;
    }

    const qTextEl = document.getElementById('quiz-question-text');
    const qNumEl = document.getElementById('quiz-number-display');
    const qScoreEl = document.getElementById('quiz-score-display');
    const qStreakEl = document.getElementById('quiz-streak-display');
    const answersGrid = document.getElementById('quiz-answers-grid');

    if (qNumEl) qNumEl.textContent = `Вопрос ${this.quizIdx + 1} из ${this.currentQuizQuestions.length}`;
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
          const reward = 30 * Math.min(3, this.quizStreak);
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
          this.renderCurrentQuizQuestion();
        }, 1600);
      });

      answersGrid.appendChild(btn);
    });
  }

  finishBookQuiz() {
    const qTextEl = document.getElementById('quiz-question-text');
    const answersGrid = document.getElementById('quiz-answers-grid');
    if (qTextEl) {
      qTextEl.innerHTML = `
        <div style="font-size:2.5rem; margin-bottom:0.5rem;">🎉</div>
        <div style="color:var(--accent-gold); font-size:1.6rem; font-weight:900;">Тест завершен!</div>
        <div style="font-size:1rem; color:#fff; margin-top:0.5rem;">Вы заработали <strong>+${this.quizScore} Люменов (⬡)</strong> за знание произведения!</div>
      `;
    }
    if (answersGrid) {
      answersGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; margin-top: 1rem;">
          <button class="btn btn-primary" id="btn-quiz-pick-another" style="padding:0.8rem 2rem;">
            ← Выбрать другое произведение
          </button>
        </div>
      `;
      answersGrid.querySelector('#btn-quiz-pick-another')?.addEventListener('click', () => {
        this.renderQuizBookSelector();
      });
    }
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // SHOP & WARDROBE
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
      window.app.showToast('Недостаточно Люменов (⬡)! Читайте книги и проходите квизы.', 'error');
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

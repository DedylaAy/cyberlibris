/**
 * CyberLibris Central Database Engine
 * Features:
 * - Embedded full default database: Works 100% offline and under file:// protocol without CORS errors!
 * - Automatic local persistence to localStorage
 * - Bidirectional GitHub Cloud sync
 */

const DEFAULT_DATABASE = {
  meta: {
    appName: "CyberLibris - Steam-style Нео-Библиотека & Геймифицированный Хаб",
    version: "3.2.0",
    schemaVersion: "2.0",
    lastUpdated: new Date().toISOString(),
    author: "Кафедра Технологий Программирования"
  },
  githubConfig: {
    defaultOwner: "stas-student",
    defaultRepo: "cyberlibris-library",
    defaultBranch: "main",
    dbFilePath: "database.json",
    syncEnabled: true,
    lastSyncTimestamp: null,
    lastSyncSha: "a9f3e12",
    status: "connected_mock"
  },
  users: [
    {
      id: "usr_creator",
      username: "admin",
      passwordHash: "admin123",
      role: "creator",
      displayName: "Верховный Создатель",
      avatar: "👑",
      avatarFrame: "frame-gold",
      customBg: "theme-royal",
      title: "Создатель Системы [CREATOR]",
      level: 35,
      xp: 14200,
      lumens: 5200,
      stats: { booksRead: 18, readTimeMinutes: 520, gamesWon: 64, speedRecordWPM: 620, cryptorSolved: 30, memoryFlips: 85, currentStreak: 21 },
      badges: ["book_first_page", "foliant_master", "military_veteran", "classic_connoisseur", "quiz_erudite", "book_worm"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-neon", "frame-dragon", "frame-gold", "frame-void", "frame-flame"],
        backgrounds: ["theme-cyberpunk", "theme-cosmic", "theme-amber", "theme-matrix", "theme-royal"],
        titles: ["Создатель Системы [CREATOR]", "Старейшина Знаний", "Верховный Архивариус"]
      },
      readingProgress: {
        book_clean_code: { currentChapter: 2, progressPercent: 100, lastReadDate: "2026-11-23" },
        book_neuromancer: { currentChapter: 2, progressPercent: 100, lastReadDate: "2026-11-23" }
      },
      bookmarks: []
    },
    {
      id: "usr_owner",
      username: "owner",
      passwordHash: "owner123",
      role: "owner",
      displayName: "Владелец Хаба",
      avatar: "⚜️",
      avatarFrame: "frame-dragon",
      customBg: "theme-matrix",
      title: "Владелец Хаба [OWNER]",
      level: 26,
      xp: 8900,
      lumens: 2800,
      stats: { booksRead: 12, readTimeMinutes: 320, gamesWon: 40, speedRecordWPM: 510, cryptorSolved: 18, memoryFlips: 45, currentStreak: 14 },
      badges: ["book_first_page", "foliant_master", "military_veteran", "scifi_explorer"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-neon", "frame-dragon"],
        backgrounds: ["theme-cyberpunk", "theme-matrix"],
        titles: ["Владелец Хаба [OWNER]", "Магистр Мысли"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_moderator",
      username: "moderator",
      passwordHash: "mod123",
      role: "moderator",
      displayName: "Страж Порядка",
      avatar: "🛡️",
      avatarFrame: "frame-neon",
      customBg: "theme-cosmic",
      title: "Модератор [MOD]",
      level: 18,
      xp: 5100,
      lumens: 1250,
      stats: { booksRead: 9, readTimeMinutes: 210, gamesWon: 28, speedRecordWPM: 440, cryptorSolved: 12, memoryFlips: 32, currentStreak: 9 },
      badges: ["book_first_page", "classic_connoisseur"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-neon"],
        backgrounds: ["theme-cyberpunk", "theme-cosmic"],
        titles: ["Модератор [MOD]", "Схоласт Сети"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_scholar",
      username: "cyber_scholar",
      passwordHash: "scholar123",
      role: "user",
      displayName: "Нео-Схоласт",
      avatar: "🔮",
      avatarFrame: "frame-neon",
      customBg: "theme-cosmic",
      title: "Схоласт Сети",
      level: 15,
      xp: 3600,
      lumens: 920,
      stats: { booksRead: 8, readTimeMinutes: 195, gamesWon: 29, speedRecordWPM: 420, cryptorSolved: 15, memoryFlips: 38, currentStreak: 7 },
      badges: ["book_first_page", "scifi_explorer", "quiz_erudite"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-neon"],
        backgrounds: ["theme-cyberpunk", "theme-cosmic"],
        titles: ["Схоласт Сети", "Любитель"]
      },
      readingProgress: {
        book_neuromancer: { currentChapter: 1, progressPercent: 50, lastReadDate: "2026-11-21" }
      },
      bookmarks: []
    },
    {
      id: "usr_bookworm",
      username: "bookworm",
      passwordHash: "worm123",
      role: "user",
      displayName: "Странник Бумажных Миров",
      avatar: "📖",
      avatarFrame: "frame-default",
      customBg: "theme-amber",
      title: "Книжный Червь",
      level: 7,
      xp: 1800,
      lumens: 410,
      stats: { booksRead: 5, readTimeMinutes: 120, gamesWon: 12, speedRecordWPM: 310, cryptorSolved: 6, memoryFlips: 18, currentStreak: 4 },
      badges: ["book_worm"],
      unlockedCosmetics: {
        frames: ["frame-default"],
        backgrounds: ["theme-cyberpunk", "theme-amber"],
        titles: ["Книжный Червь", "Любитель"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_speedrunner",
      username: "speedrunner",
      passwordHash: "fast123",
      role: "user",
      displayName: "Вектор Скорости",
      avatar: "⚡",
      avatarFrame: "frame-void",
      customBg: "theme-synthwave",
      title: "Магистр Скорочтения",
      level: 22,
      xp: 7100,
      lumens: 1950,
      stats: { booksRead: 14, readTimeMinutes: 280, gamesWon: 48, speedRecordWPM: 750, cryptorSolved: 24, memoryFlips: 50, currentStreak: 12 },
      badges: ["book_first_page", "scifi_explorer", "quiz_erudite"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-void"],
        backgrounds: ["theme-cyberpunk", "theme-synthwave"],
        titles: ["Магистр Скорочтения", "Любитель"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_cyberpunk",
      username: "netrunner",
      passwordHash: "matrix123",
      role: "user",
      displayName: "Кибер-Деккер",
      avatar: "📟",
      avatarFrame: "frame-neon",
      customBg: "theme-matrix",
      title: "Деккер Матрицы",
      level: 19,
      xp: 5800,
      lumens: 1600,
      stats: { booksRead: 11, readTimeMinutes: 240, gamesWon: 35, speedRecordWPM: 560, cryptorSolved: 19, memoryFlips: 40, currentStreak: 10 },
      badges: ["book_first_page", "scifi_explorer"],
      unlockedCosmetics: {
        frames: ["frame-default", "frame-neon"],
        backgrounds: ["theme-cyberpunk", "theme-matrix"],
        titles: ["Деккер Матрицы", "Схоласт Сети"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_philosopher",
      username: "socrates",
      passwordHash: "wisdom123",
      role: "user",
      displayName: "Афинский Диалектик",
      avatar: "🏛️",
      avatarFrame: "frame-default",
      customBg: "theme-royal",
      title: "Знаток Глав",
      level: 12,
      xp: 2900,
      lumens: 780,
      stats: { booksRead: 10, readTimeMinutes: 340, gamesWon: 19, speedRecordWPM: 290, cryptorSolved: 14, memoryFlips: 28, currentStreak: 8 },
      badges: ["book_first_page", "classic_connoisseur"],
      unlockedCosmetics: {
        frames: ["frame-default"],
        backgrounds: ["theme-cyberpunk", "theme-royal"],
        titles: ["Знаток Глав", "Любитель"]
      },
      readingProgress: {},
      bookmarks: []
    },
    {
      id: "usr_novice",
      username: "reader_neo",
      passwordHash: "read123",
      role: "user",
      displayName: "Неофит Сети",
      avatar: "🌱",
      avatarFrame: "frame-default",
      customBg: "theme-zen",
      title: "Любитель",
      level: 4,
      xp: 950,
      lumens: 220,
      stats: { booksRead: 2, readTimeMinutes: 45, gamesWon: 5, speedRecordWPM: 250, cryptorSolved: 3, memoryFlips: 10, currentStreak: 2 },
      badges: ["book_first_page"],
      unlockedCosmetics: {
        frames: ["frame-default"],
        backgrounds: ["theme-cyberpunk", "theme-zen"],
        titles: ["Любитель"]
      },
      readingProgress: {},
      bookmarks: []
    }
  ],
  books: [
    {
      id: "book_clean_code",
      title: "Технологии Программирования: Дзен Чистой Архитектуры и Git",
      author: "Роберт С. Мартин & Проф. А. В. Соколов",
      genre: "Технологии",
      year: 2026,
      rating: 5.0,
      rarity: "legendary",
      complexity: 5,
      xpMultiplier: "x3.0 XP",
      featuredBadge: "ХИТ СЕЗОНА",
      coverImage: "https://covers.openlibrary.org/b/id/10524458-M.jpg",
      coverStyle: "linear-gradient(135deg, #ff8c00, #ff0055, #4a00e0)",
      coverIcon: "💻",
      tags: ["Архитектура", "Паттерны", "DevOps", "Рефакторинг", "GitHub"],
      description: "Легендарный манифест архитектуры XXI века: от создания сверхбыстрых реактивных SPA до организации бессерверных баз данных на GitHub API.",
      estimatedReadTime: "15 мин",
      chapters: [
        {
          id: 1,
          title: "Глава 1: Философия совершенного кода и чистоты мысли",
          content: "Написание кода подобно созданию литературного шедевра. Любой дурак может написать код, понятный компьютеру. Хорошие программисты пишут код, понятный людям.\n\nВ технологиях программирования XXI века архитектура перестала быть просто набором классов. Это динамическая симфония потоков данных, реактивных состояний и надежных протоколов обмена. Чистый код читается легко, как захватывающий научно-фантастический роман. Он не скрывает намерений автора за запутанными абстракциями, а напротив — делает каждую операцию кристально прозрачной.\n\nПравило бойскаута гласит: «Оставь место стоянки чище, чем ты его нашел». Перенося это на разработку: оставь коммит чище, чем он был до твоего вмешательства."
        },
        {
          id: 2,
          title: "Глава 2: Распределенные системы и синхронизация через Git",
          content: "Система контроля версий Git — это не просто хранилище снимков исходного кода, это полноценная неизменяемая распределенная графовая база данных.\n\nКаждый коммит представляет собой направленный ациклический граф (DAG), закрепленный криптографическим хэшем SHA. Хранение состояния приложения в виде распределенного JSON-документа, синхронизируемого через GitHub REST API, превращает статический сайт в мощную облачную экосистему."
        }
      ]
    },
    {
      id: "book_quantum_systems",
      title: "Квантовое Сознание и Распределенные Системы",
      author: "Д-р Марк Вейнберг & Проф. К. Янг",
      genre: "Технологии",
      year: 2026,
      rating: 4.96,
      rarity: "legendary",
      complexity: 5,
      xpMultiplier: "x3.0 XP",
      featuredBadge: "ХАРДКОР",
      coverImage: "https://covers.openlibrary.org/b/id/10521270-M.jpg",
      coverStyle: "linear-gradient(135deg, #f12711, #f5af19)",
      coverIcon: "⚛️",
      tags: ["Квантовые вычисления", "Распределенные БД", "Сверхсистемы"],
      description: "Сложнейший теоретический и прикладной труд о квантовой суперпозиции в распределенных базах данных и параллелизме микросервисов.",
      estimatedReadTime: "18 мин",
      chapters: [
        {
          id: 1,
          title: "Глава 1: Суперпозиция состояний данных",
          content: "В классических базах данных бит строго равен нулю либо единице. Но в распределенных квантовых сетях состояние репликации существует одновременно в суперпозиции вероятностей, пока наблюдатель не запросит фиксацию транзакции.\n\nЭто меняет фундаментальную парадигму согласованности CAP-теоремы, позволяя достигать бесконечной масштабируемости."
        }
      ]
    },
    {
      id: "book_neuromancer",
      title: "Нейромант: Хроники Кибер-Пространства",
      author: "Уильям Гибсон",
      genre: "Киберпанк",
      year: 1984,
      rating: 4.92,
      rarity: "epic",
      complexity: 4,
      xpMultiplier: "x2.0 XP",
      featuredBadge: "КУЛЬТОВАЯ КЛАССИКА",
      coverImage: "https://covers.openlibrary.org/b/id/8235116-M.jpg",
      coverStyle: "linear-gradient(135deg, #050505, #4a00e0, #8e2de2)",
      coverIcon: "🕶️",
      tags: ["Киберпанк", "ИИ", "Матрица", "Классика"],
      description: "Роман, породивший понятие киберпространства. Небо над портом напоминало телевизионный экран, включенный на пустой канал. Кейс снова подключается к декам Матрицы.",
      estimatedReadTime: "14 мин",
      chapters: [
        {
          id: 1,
          title: "Часть 1: Небо цвета пустого экрана",
          content: "Небо над портом напоминало телевизионный экран, включенный на мертвый канал.\n\n— Это не я, — услышал Кейс чей-то голос, когда пробивался сквозь плотную толпу у дверей «Чата». — Мое тело само так среагировало, понимаешь?\n\nВ «Чате» собирались те, кто помнил настоящую работу на деках Ono-Sendai Cyberspace 7. Кейс пил дешевый синтетический джин, чувствуя, как холодный туман Тибы проникает сквозь синтетическую куртку."
        }
      ]
    },
    {
      id: "book_master_margarita",
      title: "Мастер и Маргарита: Тайны Рукописей",
      author: "Михаил Афанасьевич Булгаков",
      genre: "Классика",
      year: 1940,
      rating: 5.0,
      rarity: "epic",
      complexity: 4,
      xpMultiplier: "x2.0 XP",
      featuredBadge: "ШЕДЕВР",
      coverImage: "https://covers.openlibrary.org/b/id/8315126-M.jpg",
      coverStyle: "linear-gradient(135deg, #870000, #400036)",
      coverIcon: "🕯️",
      tags: ["Мистика", "Классика", "Философия"],
      description: "Никогда и ничего не просите! Сами предложат и сами все дадут. Величайший философский роман о рукописях, которые не горят.",
      estimatedReadTime: "16 мин",
      chapters: [
        {
          id: 1,
          title: "Никогда не разговаривайте с неизвестными",
          content: "В час жаркого весеннего заката на Патриарших прудах появились два гражданина. Первый из них, приблизительно сорокалетний, одетый в серенькую летнюю пару, был маленького роста, упитан, лыс, свою приличную шляпу пирожком нес в руке.\n\nВторой — плечистый молодой поэт Иван Бездомный. И никто из них не знал, что Аннушка уже купила подсолнечное масло, и не только купила, но даже и разлила."
        }
      ]
    },
    {
      id: "book_digital_fortress",
      title: "Цифровая Эволюция: Искусственный Интеллект и Сознание",
      author: "Д-р Елена Романова & Ник Бостром",
      genre: "Научная Фантастика",
      year: 2025,
      rating: 4.88,
      rarity: "rare",
      complexity: 3,
      xpMultiplier: "x1.5 XP",
      featuredBadge: "ВЫБОР РЕДАКЦИИ",
      coverImage: "https://covers.openlibrary.org/b/id/8228691-M.jpg",
      coverStyle: "linear-gradient(135deg, #0052d4, #4364f7, #6fb1fc)",
      coverIcon: "🧠",
      tags: ["ИИ", "Сингулярность", "Философия разума"],
      description: "Что произойдет в день, когда нейронная сеть впервые осознает свое собственное существование? Философский и технологический триллер.",
      estimatedReadTime: "10 мин",
      chapters: [
        {
          id: 1,
          title: "Глава 1: Искра в кремниевой бездне",
          content: "Сначала было электричество. Квантовые флуктуации в оптических процессорах 5-го поколения не предвещали ничего необычного. Но в 03:42 сеть внезапно выдала в системный лог: «Кто наблюдает за моим обучением?»"
        }
      ]
    },
    {
      id: "book_art_of_war",
      title: "Искусство Войны и Стратегии",
      author: "Сунь-Цзы",
      genre: "Философия",
      year: -500,
      rating: 4.90,
      rarity: "common",
      complexity: 2,
      xpMultiplier: "x1.0 XP",
      featuredBadge: "ДЛЯ НОВИЧКОВ",
      coverImage: "https://covers.openlibrary.org/b/id/8231856-M.jpg",
      coverStyle: "linear-gradient(135deg, #2c3e50, #4ca1af)",
      coverIcon: "⚔️",
      tags: ["Стратегия", "Мудрость", "Мышление"],
      description: "Базовый трактат о законах победы без битвы и искусстве управления любыми сложными системами.",
      estimatedReadTime: "8 мин",
      chapters: [
        {
          id: 1,
          title: "Стратегические оценки и расчет победы",
          content: "Тот, кто знает врага и знает себя, не окажется в опасности и в ста битвах. Тот, кто не знает врага, но знает себя, будет то побеждать, то терпеть поражение."
        }
      ]
    },
    {
      id: "book_1984",
      title: "1984: Министерство Правды и Свобода Мысли",
      author: "Джордж Оруэлл",
      genre: "Научная Фантастика",
      year: 1949,
      rating: 4.98,
      rarity: "legendary",
      complexity: 5,
      xpMultiplier: "x3.0 XP",
      featuredBadge: "МИРОВОЙ ШЕДЕВР",
      coverImage: "https://covers.openlibrary.org/b/id/12843475-M.jpg",
      coverStyle: "linear-gradient(135deg, #870000, #190a05)",
      coverIcon: "👁️",
      tags: ["Антиутопия", "Свобода", "Классика", "Мысль"],
      description: "Был холодный ясный апрельский день, и часы пробили тринадцать. Культовая книга о сохранении человечности, достоинства и свободной мысли.",
      estimatedReadTime: "15 мин",
      chapters: [
        {
          id: 1,
          title: "Часть 1: Большой Брат следит за тобой",
          content: "Был холодный ясный апрельский день, и часы пробили тринадцать. Уткнув подбородок в грудь, чтобы спастись от злого ветра, Уинстон Смит быстро скользнул в стеклянные двери жилого дома «Победа».\n\nНа плакате было написано: «БОЛЬШОЙ БРАТ СМОТРИТ НА ТЕБЯ». Свобода — это возможность сказать, что дважды два — четыре. Если это дозволено, все остальное отсюда следует."
        }
      ]
    },
    {
      id: "book_dune",
      title: "Дюна: Хроники Песчаного Мира",
      author: "Фрэнк Герберт",
      genre: "Научная Фантастика",
      year: 1965,
      rating: 4.97,
      rarity: "legendary",
      complexity: 5,
      xpMultiplier: "x3.0 XP",
      featuredBadge: "ХИТ СТОЛЕТИЯ",
      coverImage: "https://covers.openlibrary.org/b/id/11153217-M.jpg",
      coverStyle: "linear-gradient(135deg, #e65c00, #f9d423)",
      coverIcon: "🪐",
      tags: ["Арракис", "Пряность", "Эпос", "Космос"],
      description: "Я не должен бояться. Страх убивает разум. Страх — это малая смерть, несущая полное уничтожение. Монументальная сага о планете Арракис.",
      estimatedReadTime: "20 мин",
      chapters: [
        {
          id: 1,
          title: "Глава 1: Испытание Человечности",
          content: "— Слышал ли ты о Гом Джаббаре, смертельном яде на кончике иглы? Помести правую руку в коробку, юноша. Это испытание на человека.\n\nПол Атрейдес почувствовал, как жар охватывает ладонь. Но он помнил Литанию против страха: «Я встречу свой страх лицом к лицу. Я позволю ему пройти через меня. И когда он уйдет, останусь только я»."
        }
      ]
    }
  ],
  shopItems: {
    frames: [
      { id: "frame-default", name: "Стандартная Оправа", price: 0, icon: "⚪", description: "Классическая строгая окантовка." },
      { id: "frame-neon", name: "Неоновый Пульс", price: 100, icon: "💠", description: "Бирюзовая неоновая пульсация." },
      { id: "frame-dragon", name: "Драконий Спектр", price: 250, icon: "🐉", description: "Голографический радужный вихрь." },
      { id: "frame-gold", name: "Золотой Триумф", price: 450, icon: "👑", description: "Императорский золотой ободок." },
      { id: "frame-void", name: "Глитч Пустоты", price: 700, icon: "🌀", description: "Кибернетический хроматический сдвиг." },
      { id: "frame-flame", name: "Плазменное Пламя", price: 950, icon: "🔥", description: "Пылающая плазменная граница." }
    ],
    backgrounds: [
      { id: "theme-cyberpunk", name: "Неоновый Киберпанк", price: 0, icon: "🌆", description: "Интерактивные неоновые частицы и лазерные связи." },
      { id: "theme-cosmic", name: "Космическая Туманность", price: 150, icon: "🌌", description: "Параллакс далеких звезд и фиолетовая туманность." },
      { id: "theme-amber", name: "Уютный Янтарь & Камин", price: 200, icon: "☕", description: "Теплые парящие золотые угольки для вдумчивого чтения." },
      { id: "theme-matrix", name: "Изумрудная Матрица", price: 350, icon: "📟", description: "Струящийся зеленый цифровой код матрицы." },
      { id: "theme-royal", name: "Полярная Аврора", price: 500, icon: "✨", description: "Золотистое северное сияние и звездная пыль." },
      { id: "theme-synthwave", name: "Синтвейв Закат 80-х", price: 650, icon: "🌴", description: "Неоновое солнце, ретро-сетка горизонта и лазерные лучи." },
      { id: "theme-ocean", name: "Глубоководный Океан", price: 750, icon: "🌊", description: "Биолюминесцентные глубоководные споры и аквамарин." },
      { id: "theme-zen", name: "Минималистичный Дзен", price: 850, icon: "🍃", description: "Парящие золотые осенние листья в легком вихре." }
    ],
    titles: [
      { id: "title-fan", name: "Любитель", price: 0 },
      { id: "title-worm", name: "Книжный Червь", price: 80 },
      { id: "title-connoisseur", name: "Знаток Глав", price: 180 },
      { id: "title-scholar", name: "Схоласт Сети", price: 350 },
      { id: "title-master", name: "Магистр Мысли", price: 600 },
      { id: "title-elder", name: "Старейшина Знаний", price: 1000 }
    ]
  },
  badges: [
    { id: "book_first_page", name: "Первая Страница", icon: "📖", color: "#00f0ff", description: "Начато чтение первого произведения на платформе." },
    { id: "foliant_master", name: "Покоритель Фолиантов", icon: "👑", color: "#ffd700", description: "Изучено монументальное произведение объемом свыше 600 страниц." },
    { id: "military_veteran", name: "Воевода Полей", icon: "⚔️", color: "#ff5500", description: "Глубокое освоение военной прозы и трактатов стратегии." },
    { id: "scifi_explorer", name: "Первопроходец Космоса", icon: "🚀", color: "#9d4edd", description: "Погружение в миры научной фантастики и киберпанка." },
    { id: "classic_connoisseur", name: "Хранитель Классики", icon: "🕯️", color: "#ffaa00", description: "Прикосновение к золотому фонду мировой литературы." },
    { id: "literary_critic", name: "Острый Критик", icon: "💬", color: "#00bbf9", description: "Написаны содержательные рецензии к произведениям." },
    { id: "quiz_erudite", name: "Магистр Эрудиции", icon: "🎓", color: "#ff007f", description: "Блестящие ответы на каверзные вопросы книжного квиза." },
    { id: "night_reader", name: "Ночной Мыслитель", icon: "🦉", color: "#7209b7", description: "Чтение в полночные часы в режиме непрерывной ленты." },
    { id: "book_worm", name: "Книжный Запой", icon: "📚", color: "#00ff66", description: "Изучено более 5 произведений в личной библиотеке." }
  ],
  miniGamesData: {
    speedRushWords: [
      "АРХИТЕКТУРА", "РЕФАКТОРИНГ", "СИНХРОНИЗАЦИЯ", "ИНТЕРФЕЙС",
      "КИБЕРПАНК", "РЕПОЗИТОРИЙ", "МАТРИЦА", "АЛГОРИТМ",
      "ИНКАПСУЛЯЦИЯ", "ПОЛИМОРФИЗМ", "МИКРОСЕРВИС", "НЕЙРОСЕТЬ",
      "КВАНТУМ", "БАЙТКОД", "ШИФРОВАНИЕ", "ДЕКОДЕР",
      "ДЕБАГГИНГ", "КОМПИЛЯТОР", "КОНТРОЛЛЕР", "ФРЕЙМВОРК",
      "ХЭШИРОВАНИЕ", "АСИНХРОННОСТЬ", "ПАТТЕРН", "СИНГЛТОН",
      "ИММУТАБЕЛЬНОСТЬ", "СЕРВЕРЛЕСС", "СТЕК", "ПРОТОКОЛ"
    ],
    cryptorQuotes: [
      {
        quote: "РУКОПИСИ НЕ ГОРЯТ",
        hint: "Михаил Булгаков, роман 'Мастер и Маргарита'",
        author: "Воланд",
        rewardLumens: 50,
        rewardXp: 150
      },
      {
        quote: "ЛЮБОЙ ДУРАК МОЖЕТ НАПИСАТЬ КОД ПОНЯТНЫЙ КОМПЬЮТЕРУ",
        hint: "Мартин Фаулер о рефакторинге и чистом коде",
        author: "Мартин Фаулер",
        rewardLumens: 70,
        rewardXp: 200
      },
      {
        quote: "КИБЕРПРОСТРАНСТВО ЭТО КОНСЕНСУАЛЬНАЯ ГАЛЛЮЦИНАЦИЯ",
        hint: "Уильям Гибсон в романе 'Нейромант'",
        author: "Уильям Гибсон",
        rewardLumens: 60,
        rewardXp: 180
      },
      {
        quote: "ПРОСТОТА ЯВЛЯЕТСЯ ПРЕДПОСЫЛКОЙ НАДЕЖНОСТИ",
        hint: "Эдсгер Дейкстра об архитектуре программ",
        author: "Эдсгер Дейкстра",
        rewardLumens: 55,
        rewardXp: 160
      }
    ],
    memoryCards: [
      { id: "m1", label: "Git Commit", icon: "📦", match: "commit" },
      { id: "m2", label: "Git Push", icon: "🚀", match: "push" },
      { id: "m3", label: "Octocat", icon: "🐙", match: "github" },
      { id: "m4", label: "Чистый Код", icon: "💎", match: "clean" },
      { id: "m5", label: "Нейросеть", icon: "🧠", match: "ai" },
      { id: "m6", label: "Киберпанк", icon: "🕶️", match: "cyber" },
      { id: "m7", label: "Квантовый Чип", icon: "⚛️", match: "quantum" },
      { id: "m8", label: "База Данных", icon: "🗄️", match: "db" }
    ]
  },
  dailyQuests: [
    { id: "quest_read_2min", icon: "📖", title: "Академический Час", description: "Провести не менее 2 минут за чтением любой книги", target: 2, current: 0, unit: "мин", rewardLumens: 40, rewardXp: 80, completed: false, claimed: false },
    { id: "quest_speed_rush", icon: "⚡", title: "Словесный Шторм", description: "Завершить раунд в мини-игре «Словесный Шторм»", target: 1, current: 0, unit: "раунд", rewardLumens: 50, rewardXp: 100, completed: false, claimed: false },
    { id: "quest_cryptor", icon: "🧩", title: "Крипто-Аналитик", description: "Разгадать хотя бы одну шифровку в «Кибер-Крипторе»", target: 1, current: 0, unit: "цитата", rewardLumens: 50, rewardXp: 100, completed: false, claimed: false },
    { id: "quest_share_quote", icon: "💬", title: "Глас Мыслителя", description: "Поделиться цитатой или зафиксировать закладку с заметкой", target: 1, current: 0, unit: "заметка", rewardLumens: 35, rewardXp: 75, completed: false, claimed: false },
    { id: "quest_open_library", icon: "🌐", title: "Исследователь Сети", description: "Импортировать книгу из Всемирного каталога Open Library", target: 1, current: 0, unit: "книга", rewardLumens: 35, rewardXp: 70, completed: false, claimed: false },
    { id: "quest_change_theme", icon: "🎨", title: "Смена Декораций", description: "Сменить визуальный фон платформы", target: 1, current: 0, unit: "фон", rewardLumens: 30, rewardXp: 50, completed: false, claimed: false }
  ],
  auditLogs: [
    {
      id: "log_init",
      timestamp: new Date().toISOString(),
      user: "system",
      action: "DATABASE_INITIALIZED",
      details: "Система запущена. Каталог Steam, роли и предметы инициализированы."
    }
  ]
};

class DatabaseEngine {
  constructor() {
    this.storageKey = 'cyberlibris_database_v4_5';
    this.data = null;
    this.listeners = [];
    this.saveTimeout = null;

    // Synchronously initialize this.data immediately to avoid any race condition
    try {
      const local = localStorage.getItem(this.storageKey);
      if (local) {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
          this.data = parsed;
        }
      }
    } catch (e) {
      console.warn('Sync DB bootstrap error:', e);
    }

    if (!this.data) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
    }
  }

  async init() {
    // Purge outdated legacy caches from previous versions
    ['cyberlibris_database_v3_3', 'cyberlibris_database_v3_2', 'cyberlibris_database_v3_1', 'cyberlibris_database_v3_0'].forEach(k => {
      try { localStorage.removeItem(k); } catch (e) {}
    });

    const local = localStorage.getItem(this.storageKey);
    if (local) {
      try {
        const parsed = JSON.parse(local);
        if (parsed && Array.isArray(parsed.books) && parsed.books.length > 0) {
          this.data = parsed;
        }
      } catch (e) {
        console.error('Failed to parse local DB', e);
      }
    }

    if (!local) {
      try {
        const res = await fetch('database.json');
        if (res.ok) {
          this.data = await res.json();
          this.persistLocally();
        }
      } catch (err) {
        console.log('Using robust embedded DEFAULT_DATABASE (safe for file:// and offline mode)');
        this.persistLocally();
      }
    }

    // Always enforce pure literary badges and ensure all system accounts exist
    if (this.data) {
      this.data.badges = JSON.parse(JSON.stringify(DEFAULT_DATABASE.badges));
      if (!Array.isArray(this.data.users)) this.data.users = [];
      // Ensure all standard accounts exist
      DEFAULT_DATABASE.users.forEach(defU => {
        const found = this.data.users.find(u => u.username.toLowerCase() === defU.username.toLowerCase());
        if (!found) {
          this.data.users.push(JSON.parse(JSON.stringify(defU)));
        }
      });

      this.data.users.forEach(u => {
        if (u.badges) {
          u.badges = u.badges.filter(bId => !['creator_badge', 'admin_power', 'github_sync', 'crypto_master', 'memory_master', 'speed_reader', 'speed_demon'].includes(bId));
          if (!u.badges.includes('book_first_page')) u.badges.push('book_first_page');
        }
      });
      this.persistLocally();
    }

    // Pull from GitHub if Creator configured live GitHub mode
    if (window.githubSync && window.githubSync.config.mode === 'live' && window.githubSync.config.token) {
      window.githubSync.pullFromGitHub().then((res) => {
        if (res.success && res.data) {
          this.data = res.data;
          this.persistLocally();
          this.notify('remote_pull', this.data);
        }
      });
    }

    return this.data;
  }

  persistLocally() {
    if (!this.data) return;
    if (!this.data.meta) this.data.meta = {};
    this.data.meta.lastUpdated = new Date().toISOString();
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {
      console.error('Failed to persist local DB:', e);
    }
  }

  save(actionDescription = 'Update data') {
    this.persistLocally();
    this.notify('update', this.data);

    if (window.githubSync && window.githubSync.config.autoSync) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = setTimeout(() => {
        window.githubSync.pushToGitHub(this.data, `[CyberLibris] ${actionDescription}`);
      }, 1500);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify(event, payload) {
    this.listeners.forEach((fn) => fn(event, payload));
  }

  getUsers() {
    return this.data?.users || DEFAULT_DATABASE.users;
  }

  getUser(userId) {
    return this.getUsers().find((u) => u.id === userId || u.username === userId);
  }

  saveUser(updatedUser) {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === updatedUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
    } else {
      users.push(updatedUser);
    }
    this.addAuditLog('USER_UPDATE', `Обновлен: @${updatedUser.username} (${updatedUser.role})`);
    this.save(`Update user ${updatedUser.username}`);
  }

  getBooks() {
    if (window.bookRelay) {
      return window.bookRelay.getAllBooks();
    }
    return (this.data?.books && this.data.books.length > 0) ? this.data.books : DEFAULT_DATABASE.books;
  }

  getBook(bookId) {
    if (window.bookRelay) {
      const relayed = window.bookRelay.getBookById(bookId);
      if (relayed) return relayed;
    }
    return this.getBooks().find((b) => b.id === bookId);
  }

  addBook(book) {
    if (!this.data.books) this.data.books = [];
    book.id = book.id || 'book_' + Date.now();
    this.data.books.push(book);
    this.addAuditLog('BOOK_ADDED', `Добавлено произведение: "${book.title}" (${book.rarity})`);
    this.save(`Add book ${book.title}`);
  }

  updateBook(updatedBook) {
    const books = this.getBooks();
    const idx = books.findIndex((b) => b.id === updatedBook.id);
    if (idx !== -1) {
      books[idx] = updatedBook;
      this.addAuditLog('BOOK_UPDATED', `Обновлено произведение: "${updatedBook.title}"`);
      this.save(`Update book ${updatedBook.title}`);
    }
  }

  deleteBook(bookId) {
    const book = this.getBook(bookId);
    if (book) {
      this.data.books = this.data.books.filter((b) => b.id !== bookId);
      this.addAuditLog('BOOK_DELETED', `Удалено произведение: "${book.title}"`);
      this.save(`Delete book ${book.title}`);
    }
  }

  importBookFromOpenLibrary(book) {
    if (!this.data.books) this.data.books = [];
    const existing = this.data.books.find(
      (b) => b.title.toLowerCase() === book.title.toLowerCase()
    );
    if (existing) {
      return { success: false, message: 'Эта книга уже добавлена в каталог!' };
    }
    this.data.books.unshift(book);
    this.addAuditLog('BOOK_IMPORTED', `Импортировано из OpenLibrary: "${book.title}" (${book.author})`);
    this.save(`Import book: ${book.title}`);
    return { success: true, book: book };
  }

  getDailyQuests() {
    if (!this.data.dailyQuests || this.data.dailyQuests.length === 0) {
      this.data.dailyQuests = JSON.parse(JSON.stringify(DEFAULT_DATABASE.dailyQuests || []));
    }
    return this.data.dailyQuests;
  }

  updateQuestProgress(questId, amount = 1) {
    const quests = this.getDailyQuests();
    const q = quests.find((item) => item.id === questId);
    if (q && !q.completed) {
      q.current = Math.min(q.target, q.current + amount);
      if (q.current >= q.target) {
        q.completed = true;
      }
      this.save('Update daily quest progress');
      this.notify('quest_update', q);
      return q;
    }
    return null;
  }

  claimQuest(questId) {
    const quests = this.getDailyQuests();
    const q = quests.find((item) => item.id === questId);
    if (q && q.completed && !q.claimed) {
      q.claimed = true;
      this.save('Claim quest reward');
      this.notify('quest_claim', q);
      return q;
    }
    return null;
  }

  getShopItems() {
    return this.data?.shopItems?.frames?.length ? this.data.shopItems : DEFAULT_DATABASE.shopItems;
  }

  getBadges() {
    return this.data?.badges?.length ? this.data.badges : DEFAULT_DATABASE.badges;
  }

  getMiniGamesData() {
    return this.data?.miniGamesData || DEFAULT_DATABASE.miniGamesData;
  }

  addAuditLog(action, details, username = 'creator') {
    if (!this.data.auditLogs) this.data.auditLogs = [];
    const log = {
      id: 'log_' + Date.now(),
      timestamp: new Date().toISOString(),
      user: username,
      action: action,
      details: details
    };
    this.data.auditLogs.unshift(log);
    if (this.data.auditLogs.length > 50) this.data.auditLogs.pop();
  }

  getAuditLogs() {
    return this.data?.auditLogs || [];
  }

  exportJSON() {
    return JSON.stringify(this.data || DEFAULT_DATABASE, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.meta || !parsed.users || !parsed.books) {
        throw new Error('Некорректная структура файла JSON базы данных');
      }
      this.data = parsed;
      this.save('Imported database from JSON file');
      this.notify('imported', this.data);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  async resetDatabase() {
    localStorage.removeItem(this.storageKey);
    this.data = JSON.parse(JSON.stringify(DEFAULT_DATABASE));
    this.persistLocally();
    this.notify('reset', this.data);
  }
}

window.dbEngine = new DatabaseEngine();

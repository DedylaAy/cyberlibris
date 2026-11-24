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

    // ==========================================
    // GAME 3: LITERARY MEMORY MATRIX (МЕМОРИ-КАРТЫ)
    // ==========================================
    this.memoryPairsData = [
      {
        pairId: "pair_crime",
        cardA: { icon: "🪓", title: "Раскольников & Топор", type: "Персонаж / Символ", hint: "Бросил вызов обществу и морали" },
        cardB: { icon: "📖", title: "«Преступление и наказание»", type: "Роман Ф.М. Достоевского", hint: "1866 год, Петербург" }
      },
      {
        pairId: "pair_master",
        cardA: { icon: "🐱", title: "Кот Бегемот с примусом", type: "Персонаж / Свита", hint: "«Не шалю, никого не трогаю...»" },
        cardB: { icon: "✨", title: "«Мастер и Маргарита»", type: "Роман М.А. Булгакова", hint: "Рукописи не горят" }
      },
      {
        pairId: "pair_1984",
        cardA: { icon: "👁️", title: "Комната 101 & Большой Брат", type: "Антиутопия / Символ", hint: "«Война — это мир, свобода — это рабство»" },
        cardB: { icon: "⏳", title: "«1984»", type: "Роман Джорджа Оруэлла", hint: "1949 год, Океания" }
      },
      {
        pairId: "pair_prince",
        cardA: { icon: "🌹", title: "Маленький принц и Роза", type: "Герой / Философия", hint: "«Зорко одно лишь сердце»" },
        cardB: { icon: "⭐", title: "Антуан де Сент-Экзюпери", type: "Автор / Сказка", hint: "Астероид Б-612 и Лис" }
      },
      {
        pairId: "pair_holmes",
        cardA: { icon: "🔍", title: "Шерлок Холмс & 221Б", type: "Сыщик / Метод", hint: "Дедуктивный метод и скрипка" },
        cardB: { icon: "🎩", title: "Артур Конан Дойл", type: "Автор / Детективы", hint: "Бейкер-стрит и доктор Ватсон" }
      },
      {
        pairId: "pair_nemo",
        cardA: { icon: "⚓", title: "Капитан Немо & «Наутилус»", type: "Капитан / Субмарина", hint: "Покоритель морских глубин" },
        cardB: { icon: "🌊", title: "«20 000 лье под водой»", type: "Роман Жюля Верна", hint: "1870 год, странствия по океанам" }
      },
      {
        pairId: "pair_tolstoy",
        cardA: { icon: "☁️", title: "Небо Аустерлица & Болконский", type: "Эпизод / Герой", hint: "«Как тихо и спокойно... все пустое»" },
        cardB: { icon: "📜", title: "«Война и мир»", type: "Эпопея Льва Толстого", hint: "1869 год, четыре тома" }
      },
      {
        pairId: "pair_faust",
        cardA: { icon: "🔮", title: "Доктор Фауст & Мефистофель", type: "Трагедия / Сделка", hint: "«Остановись, мгновенье! Ты прекрасно!»" },
        cardB: { icon: "🏛️", title: "Иоганн Вольфганг Гёте", type: "Автор / Классика", hint: "Вечный спор о душе человека" }
      },
      {
        pairId: "pair_dorian",
        cardA: { icon: "🖼️", title: "Дориан Грей и его Портрет", type: "Мистика / Грех", hint: "Стареющий холст вместо юноши" },
        cardB: { icon: "🥀", title: "Оскар Уайльд", type: "Автор / Роман", hint: "1890 год, эстетизм" }
      },
      {
        pairId: "pair_oblomov",
        cardA: { icon: "🛋️", title: "Илья Обломов & Диван", type: "Герой / Феномен", hint: "Чистая душа и лень Обломовки" },
        cardB: { icon: "☕", title: "«Обломов» (Иван Гончаров)", type: "Русская классика", hint: "1859 год, противостояние Штольцу" }
      },
      {
        pairId: "pair_silver",
        cardA: { icon: "🏴‍☠️", title: "Джон Сильвер & «Испаньола»", type: "Пират / Охота", hint: "Пятнадцать человек на сундук мертвеца" },
        cardB: { icon: "🗺️", title: "«Остров сокровищ»", type: "Роман Р.Л. Стивенсона", hint: "1883 год, золото Флинта" }
      },
      {
        pairId: "pair_zarathustra",
        cardA: { icon: "⛰️", title: "Заратустра & Сверхчеловек", type: "Философия / Гимн", hint: "«Человек — это канат над пропастью»" },
        cardB: { icon: "⚡", title: "Фридрих Ницше", type: "Мыслитель / Трактат", hint: "1883 год, вечное возвращение" }
      }
    ];

    this.memoryDifficulty = 8;
    this.memoryCards = [];
    this.memoryFlippedCards = [];
    this.memoryMatchedCount = 0;
    this.memoryMoves = 0;
    this.memoryTimer = null;
    this.memorySeconds = 0;
    this.memoryIsBusy = false;
    this.memoryGameActive = false;

    // ==========================================
    // GAME 4: SPEED READING & FLASH MEMORY (СКОРОЧТЕНИЕ)
    // ==========================================
    this.speedReadExcerpts = [
      {
        book: "Мастер и Маргарита",
        author: "М.А. Булгаков",
        wpmDefault: 300,
        text: "В белый плащ с кровавым подбоем, шаркающей кавалерийской походкой, ранним утром четырнадцатого числа весеннего месяца нисана в крытую колоннаду между двумя крыльями дворца Ирода Великого вышел прокуратор Иудеи Понтий Пилат.",
        questions: [
          {
            q: "Какого цвета был подбой у плаща прокуратора?",
            options: ["Кровавый (алый)", "Золотой", "Черный", "Белый"],
            correct: 0
          },
          {
            q: "В какой весенний месяц происходило действие?",
            options: ["Нисан", "Март", "Август", "Ияр"],
            correct: 0
          },
          {
            q: "Чьей походкой шёл Понтий Пилат?",
            options: ["Шаркающей кавалерийской", "Лёгкой легионерской", "Бесшумной царственной", "Быстрой старческой"],
            correct: 0
          }
        ]
      },
      {
        book: "Преступление и наказание",
        author: "Ф.М. Достоевский",
        wpmDefault: 300,
        text: "В начале июля, в чрезвычайно жаркое время, под вечер, один молодой человек вышел из своей каморки, которую нанимал от жильцов в С-м переулке, на улицу и медленно, как бы в нерешимости, отправился к К-ну мосту.",
        questions: [
          {
            q: "В какое время года и суток герой покинул каморку?",
            options: ["В начале июля, под вечер в чрезвычайную жару", "В конце августа, ранним утром", "В середине мая, в полночь", "Зимой в полдень"],
            correct: 0
          },
          {
            q: "К какому мосту направился молодой человек?",
            options: ["К К-ну мосту", "К Аничкову мосту", "К Дворцовому мосту", "К Сенатскому мосту"],
            correct: 0
          },
          {
            q: "Как двигался герой при выходе на улицу?",
            options: ["Медленно, как бы в нерешимости", "Стремительно и уверенно", "Озираясь и бегом", "Спокойно и насвистывая"],
            correct: 0
          }
        ]
      },
      {
        book: "1984",
        author: "Джордж Оруэлл",
        wpmDefault: 350,
        text: "Был холодный ясный апрельский день, и часы пробили тринадцать. Уинстон Смит, прижав подбородок к груди, чтобы спастись от злого ветра, быстро скользнул в стеклянные двери жилого дома «Победа».",
        questions: [
          {
            q: "Сколько ударов пробили часы в начале романа?",
            options: ["Тринадцать", "Двенадцать", "Семь", "Одиннадцать"],
            correct: 0
          },
          {
            q: "Как назывался жилой дом, в который вошёл Уинстон?",
            options: ["«Победа»", "«Океания»", "«Правда»", "«Ангсоц»"],
            correct: 0
          },
          {
            q: "Какой месяц стоял в день начала событий?",
            options: ["Апрель", "Май", "Октябрь", "Январь"],
            correct: 0
          }
        ]
      },
      {
        book: "Маленький принц",
        author: "Антуан де Сент-Экзюпери",
        wpmDefault: 250,
        text: "Вот мой секрет, он очень прост: зорко одно лишь сердце. Самого главного глазами не увидишь. Твоя роза так дорога тебе потому, что ты отдавал ей всю свою душу. Люди забыли эту истину, но ты не забывай: ты навсегда в ответе за всех, кого приручил.",
        questions: [
          {
            q: "Что, по словам Лиса, зорко на самом деле?",
            options: ["Одно лишь сердце", "Человеческий разум", "Детский взор", "Мудрая интуиция"],
            correct: 0
          },
          {
            q: "Почему роза была так дорога Маленькому принцу?",
            options: ["Потому что он отдавал ей всю свою душу и время", "Потому что она была единственной во всей вселенной", "Потому что она пахла прекраснее всех", "Потому что её подарил Лис"],
            correct: 0
          },
          {
            q: "За кого человек навсегда остаётся в ответе?",
            options: ["За всех, кого приручил", "За свои сокровенные мечты", "За родную планету", "За сказанные слова"],
            correct: 0
          }
        ]
      },
      {
        book: "Государство",
        author: "Платон",
        wpmDefault: 300,
        text: "Посмотри на людей в подземном жилище наподобие пещеры: они с малых лет закованы в цепи и видят лишь тени на стене перед собой, принимая тени за подлинную сущность вещей, пока один из них не выйдет к свету солнца.",
        questions: [
          {
            q: "Где находились закованные в цепи люди в знаменитом мифе Платона?",
            options: ["В подземной пещере", "На вершине башни", "В лабиринте Минотавра", "На дне колодца"],
            correct: 0
          },
          {
            q: "Что именно узники принимали за подлинную сущность вещей?",
            options: ["Тени на стене перед собой", "Звуки эха в темноте", "Свои сновидения", "Слова стражников"],
            correct: 0
          },
          {
            q: "К какому свету должен выйти освобождённый узник, чтобы познать истину?",
            options: ["К свету солнца", "К пламени костра", "К сиянию звёзд", "К лунному свету"],
            correct: 0
          }
        ]
      }
    ];

    this.speedReadIdx = 0;
    this.speedReadCurrentWpm = 300;
    this.speedReadWords = [];
    this.speedReadWordIdx = 0;
    this.speedReadTimer = null;
    this.speedReadIsRunning = false;
    this.speedReadQuestionsAnswered = 0;
    this.speedReadQuestionsCorrect = 0;

    // ==========================================
    // GAME 5: QUOTE MEMORY RECONSTRUCTOR (МНЕМО-ЦИТАТЫ)
    // ==========================================
    this.reconstructQuotes = [
      {
        quote: "Красота спасёт этот безумный мир",
        author: "Фёдор Достоевский",
        book: "«Идиот»",
        decoys: ["вечный", "душу"]
      },
      {
        quote: "Зорко одно лишь сердце самого главного глазами не увидишь",
        author: "Антуан де Сент-Экзюпери",
        book: "«Маленький принц»",
        decoys: ["разум", "навсегда"]
      },
      {
        quote: "Поверьте мне настоящие рукописи никогда не горят",
        author: "Михаил Булгаков",
        book: "«Мастер и Маргарита»",
        decoys: ["слова", "правда"]
      },
      {
        quote: "Все мысли которые имеют огромные последствия всегда просты",
        author: "Лев Толстой",
        book: "«Война и мир»",
        decoys: ["сложны", "великие"]
      },
      {
        quote: "Свобода это возможность сказать что дважды два четыре",
        author: "Джордж Оруэлл",
        book: "«1984»",
        decoys: ["пять", "власть"]
      },
      {
        quote: "Остановись мгновенье ты поистине прекрасно",
        author: "Иоганн Гёте",
        book: "«Фауст»",
        decoys: ["вечность", "навсегда"]
      },
      {
        quote: "Человек это канат натянутый между животным и Сверхчеловеком",
        author: "Фридрих Ницше",
        book: "«Так говорил Заратустра»",
        decoys: ["мост", "землей"]
      },
      {
        quote: "Лучшая победа это покорить врага без единого выстрела",
        author: "Сунь-Цзы",
        book: "«Искусство войны»",
        decoys: ["боя", "быстро"]
      }
    ];

    this.reconstructIdx = 0;
    this.reconstructStreak = 0;
    this.reconstructScore = 0;
    this.reconstructTargetWords = [];
    this.reconstructPlacedWords = [];
    this.reconstructAvailableWords = [];
    this.reconstructCountdown = 5;
    this.reconstructTimer = null;
  }

  init() {
    this.bindNav();
    this.bindShopTabs();
    this.bindQuizBookSelector();
    this.bindMemoryControls();
    this.bindSpeedReadControls();
    this.bindReconstructControls();
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
    } else if (gameId === 'memory') {
      this.initMemoryGame();
    } else if (gameId === 'speedread') {
      this.initSpeedReadGame();
    } else if (gameId === 'reconstruct') {
      this.initReconstructGame();
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
      btn.textContent = 'Сыграть снова';
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

    window.app.showToast(`Раунд завершен! Счёт: ${this.speedScore}. Награда: +${lumensEarned} ⬡, +${xpEarned} XP`, 'reward');
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

          window.app.showToast(`Верно! +${reward} ⬡, +${reward * 2} XP`, 'reward');
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
  // GAME 3: LITERARY MEMORY MATRIX (МЕМОРИ-КАРТЫ)
  // =========================================================================

  bindMemoryControls() {
    document.getElementById('btn-memory-restart')?.addEventListener('click', () => {
      this.initMemoryGame(this.memoryDifficulty);
    });

    document.getElementById('btn-memory-peek')?.addEventListener('click', () => {
      this.peekMemoryCards();
    });

    document.querySelectorAll('.memory-diff-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.memory-diff-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        const pairs = parseInt(e.currentTarget.dataset.pairs, 10) || 8;
        this.memoryDifficulty = pairs;
        this.initMemoryGame(pairs);
      });
    });
  }

  initMemoryGame(numPairs = this.memoryDifficulty) {
    if (this.memoryTimer) clearInterval(this.memoryTimer);

    this.memoryDifficulty = numPairs;
    this.memoryMatchedCount = 0;
    this.memoryMoves = 0;
    this.memorySeconds = 0;
    this.memoryFlippedCards = [];
    this.memoryIsBusy = false;
    this.memoryGameActive = true;

    // Reset HUD
    const movesEl = document.getElementById('memory-moves-display');
    const matchesEl = document.getElementById('memory-matches-display');
    const timerEl = document.getElementById('memory-timer-display');
    const scoreEl = document.getElementById('memory-score-display');

    if (movesEl) movesEl.textContent = '0';
    if (matchesEl) matchesEl.textContent = `0 / ${numPairs}`;
    if (timerEl) timerEl.textContent = '00:00';
    if (scoreEl) scoreEl.textContent = '0 ⬡';

    // Pick pairs
    const pool = [...this.memoryPairsData].sort(() => Math.random() - 0.5).slice(0, numPairs);
    const cardList = [];

    pool.forEach((p) => {
      cardList.push({
        id: `${p.pairId}_a`,
        pairId: p.pairId,
        icon: p.cardA.icon,
        title: p.cardA.title,
        type: p.cardA.type,
        hint: p.cardA.hint,
        matched: false
      });
      cardList.push({
        id: `${p.pairId}_b`,
        pairId: p.pairId,
        icon: p.cardB.icon,
        title: p.cardB.title,
        type: p.cardB.type,
        hint: p.cardB.hint,
        matched: false
      });
    });

    // Shuffle cards
    this.memoryCards = cardList.sort(() => Math.random() - 0.5);

    // Render grid
    this.renderMemoryBoard();

    // Start timer
    this.memoryTimer = setInterval(() => {
      this.memorySeconds++;
      const mins = String(Math.floor(this.memorySeconds / 60)).padStart(2, '0');
      const secs = String(this.memorySeconds % 60).padStart(2, '0');
      const tEl = document.getElementById('memory-timer-display');
      if (tEl) tEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  renderMemoryBoard() {
    const grid = document.getElementById('literary-memory-grid');
    if (!grid) return;
    grid.innerHTML = '';

    if (this.memoryDifficulty === 12) {
      grid.style.maxWidth = '980px';
      grid.style.gridTemplateColumns = 'repeat(6, 1fr)';
    } else {
      grid.style.maxWidth = '840px';
      grid.style.gridTemplateColumns = 'repeat(4, 1fr)';
    }

    this.memoryCards.forEach((c) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'literary-memory-card tilt-card';
      cardEl.dataset.id = c.id;

      cardEl.innerHTML = `
        <div class="literary-card-face literary-card-front">
          <div class="card-cyber-icon">🔮</div>
          <div class="card-cyber-tag">CYBER•MEM</div>
        </div>
        <div class="literary-card-face literary-card-back">
          <div class="card-badge">${c.type}</div>
          <div class="card-title">${c.icon} ${c.title}</div>
          <div class="card-hint">${c.hint}</div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.handleMemoryCardClick(c, cardEl));
      grid.appendChild(cardEl);
    });

    if (window.app?.bindTiltEffect) window.app.bindTiltEffect();
  }

  handleMemoryCardClick(card, cardEl) {
    if (!this.memoryGameActive || this.memoryIsBusy) return;
    if (card.matched) return;
    if (cardEl.classList.contains('flipped')) return;

    // Flip card
    cardEl.classList.add('flipped');
    this.memoryFlippedCards.push({ card, el: cardEl });

    if (window.soundEngine) window.soundEngine.playCardFlip();

    if (this.memoryFlippedCards.length === 2) {
      this.memoryMoves++;
      const movesEl = document.getElementById('memory-moves-display');
      if (movesEl) movesEl.textContent = this.memoryMoves;

      const [first, second] = this.memoryFlippedCards;

      if (first.card.pairId === second.card.pairId) {
        // MATCH!
        first.card.matched = true;
        second.card.matched = true;
        first.el.classList.add('matched');
        second.el.classList.add('matched');
        this.memoryMatchedCount++;

        const matchesEl = document.getElementById('memory-matches-display');
        if (matchesEl) matchesEl.textContent = `${this.memoryMatchedCount} / ${this.memoryDifficulty}`;

        const scoreEl = document.getElementById('memory-score-display');
        const currentPoints = this.memoryMatchedCount * 25;
        if (scoreEl) scoreEl.textContent = `${currentPoints} ⬡`;

        if (window.soundEngine) window.soundEngine.playCorrect();

        this.memoryFlippedCards = [];

        if (this.memoryMatchedCount === this.memoryDifficulty) {
          setTimeout(() => this.endMemoryGame(), 450);
        }
      } else {
        // WRONG PAIR
        this.memoryIsBusy = true;
        if (window.soundEngine) window.soundEngine.playWrong();

        setTimeout(() => {
          first.el.classList.remove('flipped');
          second.el.classList.remove('flipped');
          this.memoryFlippedCards = [];
          this.memoryIsBusy = false;
        }, 900);
      }
    }
  }

  peekMemoryCards() {
    if (!this.memoryGameActive || this.memoryIsBusy) return;

    this.memoryIsBusy = true;
    const cards = document.querySelectorAll('.literary-memory-card:not(.matched)');
    cards.forEach(c => c.classList.add('flipped'));

    if (window.soundEngine) window.soundEngine.playHover();

    setTimeout(() => {
      cards.forEach(c => {
        const id = c.dataset.id;
        const isMatched = this.memoryCards.find(card => card.id === id)?.matched;
        if (!isMatched) c.classList.remove('flipped');
      });
      this.memoryIsBusy = false;
    }, 1500);
  }

  endMemoryGame() {
    this.memoryGameActive = false;
    if (this.memoryTimer) clearInterval(this.memoryTimer);

    // Calculate reward based on time and moves
    const timeSec = Math.max(1, this.memorySeconds);
    const speedBonus = Math.max(10, 150 - timeSec);
    const moveBonus = Math.max(10, (this.memoryDifficulty * 3 - this.memoryMoves) * 5);
    const totalLumens = Math.round(50 + speedBonus + moveBonus);
    const totalXp = totalLumens * 2;

    if (window.auth) {
      window.auth.addLumens(totalLumens);
      window.auth.addXp(totalXp);
      window.auth.updateStat('gamesWon', 1);
    }

    if (window.dbEngine) {
      window.dbEngine.updateQuestProgress('quest_cryptor', 1);
      if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
    }

    const mins = Math.floor(timeSec / 60);
    const secs = timeSec % 60;
    const timeStr = mins > 0 ? `${mins}м ${secs}с` : `${secs}с`;

    window.app.showToast(`Все пары найдены за ${timeStr}! Ходы: ${this.memoryMoves}. Награда: +${totalLumens} ⬡, +${totalXp} XP`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // GAME 4: SPEED READING & FLASH MEMORY (СКОРОЧТЕНИЕ)
  // =========================================================================

  bindSpeedReadControls() {
    document.getElementById('btn-speedread-start')?.addEventListener('click', () => {
      this.startSpeedReading();
    });

    document.getElementById('btn-speedread-next-text')?.addEventListener('click', () => {
      this.nextSpeedReadExcerpt();
    });

    document.querySelectorAll('.speedread-wpm-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.speedread-wpm-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.speedReadCurrentWpm = parseInt(e.currentTarget.dataset.wpm, 10) || 300;
        const wpmDisplay = document.getElementById('speedread-wpm-display');
        if (wpmDisplay) wpmDisplay.textContent = `${this.speedReadCurrentWpm} сл/мин`;
      });
    });
  }

  initSpeedReadGame() {
    if (this.speedReadTimer) clearInterval(this.speedReadTimer);
    this.speedReadIsRunning = false;

    const excerpt = this.speedReadExcerpts[this.speedReadIdx] || this.speedReadExcerpts[0];

    const titleEl = document.getElementById('speedread-book-title');
    if (titleEl) titleEl.textContent = `«${excerpt.book}» (${excerpt.author})`;

    const wpmDisplay = document.getElementById('speedread-wpm-display');
    if (wpmDisplay) wpmDisplay.textContent = `${this.speedReadCurrentWpm} сл/мин`;

    const activeWordEl = document.getElementById('speedread-active-word');
    if (activeWordEl) activeWordEl.textContent = 'ГОТОВЫ К ЧТЕНИЮ?';

    const fillEl = document.getElementById('speedread-progress-fill');
    if (fillEl) fillEl.style.width = '0%';

    const readingStage = document.getElementById('speedread-reading-stage');
    const quizStage = document.getElementById('speedread-quiz-stage');
    if (readingStage) readingStage.style.display = 'block';
    if (quizStage) quizStage.style.display = 'none';

    const startBtn = document.getElementById('btn-speedread-start');
    if (startBtn) {
      startBtn.disabled = false;
      startBtn.textContent = '▶ Запустить чтение';
    }
  }

  nextSpeedReadExcerpt() {
    if (this.speedReadTimer) clearInterval(this.speedReadTimer);
    this.speedReadIdx = (this.speedReadIdx + 1) % this.speedReadExcerpts.length;
    this.initSpeedReadGame();
  }

  startSpeedReading() {
    if (this.speedReadIsRunning) return;
    this.speedReadIsRunning = true;

    const excerpt = this.speedReadExcerpts[this.speedReadIdx];
    this.speedReadWords = excerpt.text.split(/\s+/).filter(Boolean);
    this.speedReadWordIdx = 0;

    const startBtn = document.getElementById('btn-speedread-start');
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = '⏱ Чтение в процессе...';
    }

    const intervalMs = Math.round((60 / this.speedReadCurrentWpm) * 1000);
    const activeWordEl = document.getElementById('speedread-active-word');
    const fillEl = document.getElementById('speedread-progress-fill');

    if (this.speedReadTimer) clearInterval(this.speedReadTimer);

    this.speedReadTimer = setInterval(() => {
      if (this.speedReadWordIdx >= this.speedReadWords.length) {
        clearInterval(this.speedReadTimer);
        this.speedReadIsRunning = false;
        if (fillEl) fillEl.style.width = '100%';
        if (activeWordEl) activeWordEl.textContent = '✓ ФРАГМЕНТ ПРОЧИТАН!';
        if (window.soundEngine) window.soundEngine.playCorrect();

        setTimeout(() => this.showSpeedReadQuiz(), 900);
        return;
      }

      const word = this.speedReadWords[this.speedReadWordIdx];
      // Optimal Recognition Point (middle letter highlighted)
      const mid = Math.floor(word.length / 2);
      const before = word.slice(0, mid);
      const orp = word[mid] || '';
      const after = word.slice(mid + 1);

      if (activeWordEl) {
        activeWordEl.innerHTML = `${before}<span class="speedread-orp-letter">${orp}</span>${after}`;
      }

      this.speedReadWordIdx++;
      const pct = Math.round((this.speedReadWordIdx / this.speedReadWords.length) * 100);
      if (fillEl) fillEl.style.width = `${pct}%`;
    }, intervalMs);
  }

  showSpeedReadQuiz() {
    const readingStage = document.getElementById('speedread-reading-stage');
    const quizStage = document.getElementById('speedread-quiz-stage');
    if (readingStage) readingStage.style.display = 'none';
    if (quizStage) quizStage.style.display = 'block';

    const excerpt = this.speedReadExcerpts[this.speedReadIdx];
    this.speedReadQuestionsAnswered = 0;
    this.speedReadQuestionsCorrect = 0;

    this.renderSpeedReadQuestion(0);
  }

  renderSpeedReadQuestion(qIdx) {
    const excerpt = this.speedReadExcerpts[this.speedReadIdx];
    const q = excerpt.questions[qIdx];
    if (!q) {
      this.finishSpeedReadRound();
      return;
    }

    const qNumEl = document.getElementById('speedread-q-num');
    const qTextEl = document.getElementById('speedread-q-text');
    const optionsGrid = document.getElementById('speedread-q-options');

    if (qNumEl) qNumEl.textContent = `Вопрос ${qIdx + 1} из ${excerpt.questions.length}`;
    if (qTextEl) qTextEl.textContent = q.q;

    if (!optionsGrid) return;
    optionsGrid.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'speedread-q-option';
      btn.innerHTML = `<span style="color:var(--accent-cyan); font-weight:800; margin-right:0.75rem;">${String.fromCharCode(65 + idx)}.</span> ${opt}`;

      btn.addEventListener('click', () => {
        const all = optionsGrid.querySelectorAll('.speedread-q-option');
        all.forEach(b => b.disabled = true);

        if (idx === q.correct) {
          btn.style.background = 'rgba(0, 255, 136, 0.25)';
          btn.style.borderColor = 'var(--accent-green)';
          this.speedReadQuestionsCorrect++;
          if (window.soundEngine) window.soundEngine.playCorrect();
        } else {
          btn.style.background = 'rgba(255, 0, 127, 0.25)';
          btn.style.borderColor = 'var(--accent-magenta)';
          all[q.correct].style.background = 'rgba(0, 255, 136, 0.25)';
          all[q.correct].style.borderColor = 'var(--accent-green)';
          if (window.soundEngine) window.soundEngine.playWrong();
        }

        setTimeout(() => this.renderSpeedReadQuestion(qIdx + 1), 1300);
      });

      optionsGrid.appendChild(btn);
    });
  }

  finishSpeedReadRound() {
    const excerpt = this.speedReadExcerpts[this.speedReadIdx];
    const total = excerpt.questions.length;
    const accuracy = Math.round((this.speedReadQuestionsCorrect / total) * 100);

    const accDisplay = document.getElementById('speedread-accuracy-display');
    if (accDisplay) accDisplay.textContent = `${accuracy}%`;

    const lumensEarned = Math.round(30 + accuracy * 0.7);
    const xpEarned = lumensEarned * 2;

    if (window.auth) {
      window.auth.addLumens(lumensEarned);
      window.auth.addXp(xpEarned);
      window.auth.updateStat('gamesWon', 1);
    }

    if (window.dbEngine) {
      window.dbEngine.updateQuestProgress('quest_speed_rush', 1);
      if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
    }

    const qTextEl = document.getElementById('speedread-q-text');
    const optionsGrid = document.getElementById('speedread-q-options');

    if (qTextEl) {
      qTextEl.innerHTML = `
        <div style="font-size:2rem; margin-bottom:0.4rem;">🎯</div>
        <div style="color:var(--accent-gold); font-size:1.4rem;">Тест скорочтения завершен!</div>
        <div style="font-size:1rem; color:#fff; margin-top:0.4rem;">
          Темп: <strong>${this.speedReadCurrentWpm} сл/мин</strong> | Точность запоминания: <strong>${accuracy}%</strong> (${this.speedReadQuestionsCorrect} из ${total})
        </div>
      `;
    }

    if (optionsGrid) {
      optionsGrid.innerHTML = `
        <div style="text-align:center; margin-top:1.2rem;">
          <button class="btn btn-primary" id="btn-speedread-repeat" style="padding:0.75rem 2rem;">
            ← Следующий фрагмент
          </button>
        </div>
      `;
      optionsGrid.querySelector('#btn-speedread-repeat')?.addEventListener('click', () => {
        this.nextSpeedReadExcerpt();
      });
    }

    window.app.showToast(`Раунд скорочтения пройден! Точность: ${accuracy}%. Награда: +${lumensEarned} ⬡, +${xpEarned} XP`, 'reward');
    if (window.soundEngine) window.soundEngine.playLevelUp();
  }

  // =========================================================================
  // GAME 5: QUOTE MEMORY RECONSTRUCTOR (МНЕМО-ЦИТАТЫ)
  // =========================================================================

  bindReconstructControls() {
    document.getElementById('btn-reconstruct-skip-preview')?.addEventListener('click', () => {
      this.startReconstructAssembly();
    });

    document.getElementById('btn-reconstruct-check')?.addEventListener('click', () => {
      this.checkReconstructAssembly();
    });

    document.getElementById('btn-reconstruct-clear')?.addEventListener('click', () => {
      this.clearReconstructAssembly();
    });

    document.getElementById('btn-reconstruct-hint')?.addEventListener('click', () => {
      this.provideReconstructHint();
    });
  }

  initReconstructGame() {
    if (this.reconstructTimer) clearInterval(this.reconstructTimer);

    const qItem = this.reconstructQuotes[this.reconstructIdx] || this.reconstructQuotes[0];

    const numEl = document.getElementById('reconstruct-quote-num');
    if (numEl) numEl.textContent = `Цитата ${this.reconstructIdx + 1} из ${this.reconstructQuotes.length}`;

    const quoteEl = document.getElementById('reconstruct-preview-quote');
    const authorEl = document.getElementById('reconstruct-preview-author');
    if (quoteEl) quoteEl.textContent = `«${qItem.quote}»`;
    if (authorEl) authorEl.textContent = `— ${qItem.author} (${qItem.book})`;

    const previewStage = document.getElementById('reconstruct-stage-preview');
    const assembleStage = document.getElementById('reconstruct-stage-assemble');
    if (previewStage) previewStage.style.display = 'block';
    if (assembleStage) assembleStage.style.display = 'none';

    // Start 5-second countdown
    this.reconstructCountdown = 5;
    const fillEl = document.getElementById('reconstruct-timer-fill');
    if (fillEl) fillEl.style.width = '100%';

    let elapsed = 0;
    const totalMs = 5000;
    const stepMs = 50;

    this.reconstructTimer = setInterval(() => {
      elapsed += stepMs;
      const remPct = Math.max(0, 100 - (elapsed / totalMs) * 100);
      if (fillEl) fillEl.style.width = `${remPct}%`;

      if (elapsed >= totalMs) {
        clearInterval(this.reconstructTimer);
        this.startReconstructAssembly();
      }
    }, stepMs);
  }

  startReconstructAssembly() {
    if (this.reconstructTimer) clearInterval(this.reconstructTimer);

    const previewStage = document.getElementById('reconstruct-stage-preview');
    const assembleStage = document.getElementById('reconstruct-stage-assemble');
    if (previewStage) previewStage.style.display = 'none';
    if (assembleStage) assembleStage.style.display = 'block';

    const qItem = this.reconstructQuotes[this.reconstructIdx];
    this.reconstructTargetWords = qItem.quote.split(/\s+/).filter(Boolean);
    this.reconstructPlacedWords = [];

    // Words bank: target words + decoys shuffled
    const allTokens = [...this.reconstructTargetWords, ...(qItem.decoys || [])];
    this.reconstructAvailableWords = allTokens
      .map((w, idx) => ({ id: `word_${idx}_${w}`, word: w, used: false }))
      .sort(() => Math.random() - 0.5);

    this.renderReconstructZones();
  }

  renderReconstructZones() {
    const assemblyZone = document.getElementById('reconstruct-assembly-zone');
    const bankZone = document.getElementById('reconstruct-bank-zone');

    if (assemblyZone) {
      assemblyZone.innerHTML = '';
      if (this.reconstructPlacedWords.length === 0) {
        assemblyZone.innerHTML = '<div class="reconstruct-assembly-placeholder">Нажимайте на слова внизу в правильном порядке</div>';
      } else {
        this.reconstructPlacedWords.forEach((item, pIdx) => {
          const chip = document.createElement('button');
          chip.className = 'reconstruct-word-chip placed';
          chip.textContent = item.word;
          chip.title = 'Нажмите, чтобы убрать слово';
          chip.addEventListener('click', () => {
            this.removeWordFromAssembly(pIdx);
          });
          assemblyZone.appendChild(chip);
        });
      }
    }

    if (bankZone) {
      bankZone.innerHTML = '';
      this.reconstructAvailableWords.forEach((item) => {
        const chip = document.createElement('button');
        chip.className = 'reconstruct-word-chip';
        chip.textContent = item.word;
        if (item.used) {
          chip.style.opacity = '0.25';
          chip.style.pointerEvents = 'none';
        }

        chip.addEventListener('click', () => {
          if (!item.used) {
            this.addWordToAssembly(item);
          }
        });

        bankZone.appendChild(chip);
      });
    }
  }

  addWordToAssembly(item) {
    item.used = true;
    this.reconstructPlacedWords.push(item);
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderReconstructZones();
  }

  removeWordFromAssembly(index) {
    const item = this.reconstructPlacedWords.splice(index, 1)[0];
    if (item) item.used = false;
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderReconstructZones();
  }

  clearReconstructAssembly() {
    this.reconstructPlacedWords = [];
    this.reconstructAvailableWords.forEach(i => i.used = false);
    if (window.soundEngine) window.soundEngine.playWrong();
    this.renderReconstructZones();
  }

  provideReconstructHint() {
    const nextIdx = this.reconstructPlacedWords.length;
    if (nextIdx >= this.reconstructTargetWords.length) return;

    const neededWord = this.reconstructTargetWords[nextIdx];
    const candidate = this.reconstructAvailableWords.find(i => !i.used && i.word === neededWord);

    if (candidate) {
      this.addWordToAssembly(candidate);
      window.app.showToast(`Подсказка: «${neededWord}»`, 'info');
    }
  }

  checkReconstructAssembly() {
    const userString = this.reconstructPlacedWords.map(i => i.word).join(' ');
    const targetString = this.reconstructTargetWords.join(' ');

    const assemblyZone = document.getElementById('reconstruct-assembly-zone');

    if (userString === targetString) {
      // MATCH!
      if (assemblyZone) {
        assemblyZone.style.borderColor = 'var(--accent-green)';
        assemblyZone.style.background = 'rgba(0, 255, 136, 0.15)';
      }

      this.reconstructStreak++;
      const streakEl = document.getElementById('reconstruct-streak-display');
      if (streakEl) streakEl.textContent = this.reconstructStreak;

      const rewardLumens = 35 * Math.min(4, this.reconstructStreak);
      const rewardXp = rewardLumens * 2;
      this.reconstructScore += rewardLumens;

      const scoreEl = document.getElementById('reconstruct-score-display');
      if (scoreEl) scoreEl.textContent = `${this.reconstructScore} ⬡`;

      if (window.auth) {
        window.auth.addLumens(rewardLumens);
        window.auth.addXp(rewardXp);
        window.auth.updateStat('gamesWon', 1);
      }

      if (window.dbEngine) {
        window.dbEngine.updateQuestProgress('quest_cryptor', 1);
        if (window.app?.renderDailyQuests) window.app.renderDailyQuests();
      }

      window.app.showToast(`Идеально собрано по памяти! +${rewardLumens} ⬡, +${rewardXp} XP`, 'reward');
      if (window.soundEngine) window.soundEngine.playLevelUp();

      setTimeout(() => {
        this.reconstructIdx = (this.reconstructIdx + 1) % this.reconstructQuotes.length;
        this.initReconstructGame();
      }, 1400);
    } else {
      // MISMATCH
      if (assemblyZone) {
        assemblyZone.style.borderColor = 'var(--accent-magenta)';
        assemblyZone.style.background = 'rgba(255, 0, 127, 0.15)';
        setTimeout(() => {
          assemblyZone.style.borderColor = 'rgba(0, 240, 255, 0.3)';
          assemblyZone.style.background = 'rgba(0, 0, 0, 0.35)';
        }, 800);
      }

      this.reconstructStreak = 0;
      const streakEl = document.getElementById('reconstruct-streak-display');
      if (streakEl) streakEl.textContent = '0';

      if (window.soundEngine) window.soundEngine.playWrong();
      window.app.showToast('Порядок слов не совпадает. Попробуйте переставить слова или использовать подсказку!', 'error');
    }
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
            <button class="btn btn-secondary btn-sm" disabled>Активно</button>
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

    window.app.showToast(`Куплено: «${itemName}» (-${price} ⬡)`, 'reward');
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
    window.app.showToast(`Применено: «${itemName}»`, 'success');
    if (window.soundEngine) window.soundEngine.playCorrect();
  }
}

window.miniGames = new MiniGamesSuite();

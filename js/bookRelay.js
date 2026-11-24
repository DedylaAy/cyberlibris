/**
 * CYBERLIBRIS - Book Relay & Live Content Streaming Engine v5.0
 * -------------------------------------------------------------
 * Принцип Zero-Storage: НОЛЬ книг на сервере или локальном диске!
 * Подлинные тексты мировых шедевров ретранслируются в реальном времени
 * из открытых источников: Wikisource (Викитека), Open Library, Internet Archive.
 */

class BookRelayService {
  constructor() {
    this.storagePrefix = 'cyberlibris_relay_';
    this.reviewsKey = 'cyberlibris_book_reviews_v3';
    this.readingStateKey = 'cyberlibris_reading_state_v3';
    this.externalSearchResults = new Map();

    // Золотой Фонд Ретрансляции: 26 мировых шедевров с динамической подгрузкой
    // Никаких жестко зашитых глав! Тексты потоково транслируются из открытых источников.
    this.relayedCatalog = [
      // ==========================================
      // ВОЕННАЯ ПРОЗА И СТРАТЕГИЯ
      // ==========================================
      {
        id: "relay_war_and_peace",
        title: "Война и мир",
        author: "Лев Николаевич Толстой",
        year: 1869,
        genre: "Военная проза",
        tags: ["военное", "история", "классика", "эпопея", "философия", "драма"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ФОЛИАНТ",
        format: "Фолиант",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 1440,
        wordsCount: 460000,
        rating: 4.96,
        ratingCount: 1540,
        popularity: 98500,
        coverImage: "https://covers.openlibrary.org/b/id/12818862-L.jpg",
        coverStyle: "linear-gradient(135deg, #1b0000, #3d1400)",
        quote: "Все мысли, которые имеют огромные последствия, всегда просты.",
        synopsis: "Монументальная эпопея русской литературы об эпохе войн против Наполеона 1805–1812 годов. Судьбы Андрея Болконского, Пьера Безухова, Наташи Ростовой и тысяч людей на фоне исторических битв.",
        relaySource: {
          provider: "wikisource",
          page: "Война_и_мир_(Толстой)/Том_1",
          lang: "ru"
        }
      },
      {
        id: "relay_art_of_war",
        title: "Искусство войны",
        author: "Сунь-Цзы",
        year: -500,
        genre: "Военная проза",
        tags: ["военное", "стратегия", "философия", "древность", "лидерство", "трактат"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР СТРАТЕГИИ",
        format: "Трактат",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 180,
        wordsCount: 48000,
        rating: 4.93,
        ratingCount: 2150,
        popularity: 112000,
        coverImage: "https://covers.openlibrary.org/b/id/12095383-L.jpg",
        coverStyle: "linear-gradient(135deg, #1c0000, #4a1200)",
        quote: "Лучшая победа — это покорить врага без единого выстрела.",
        synopsis: "Древнейший трактат о военной стратегии, дипломатии, искусстве разведки и психологии победы. 13 глав бессмертной тактической мудрости.",
        relaySource: {
          provider: "wikisource",
          page: "The_Art_of_War_(Sun)",
          lang: "en"
        }
      },
      {
        id: "relay_taras_bulba",
        title: "Тарас Бульба",
        author: "Николай Васильевич Гоголь",
        year: 1835,
        genre: "Военная проза",
        tags: ["военное", "история", "классика", "казачество", "драма", "повесть"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ ПОВЕСТЬ",
        format: "Повесть",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 220,
        wordsCount: 62000,
        rating: 4.88,
        ratingCount: 980,
        popularity: 54000,
        coverImage: "https://covers.openlibrary.org/b/id/8739161-L.jpg",
        coverStyle: "linear-gradient(135deg, #1f0b00, #4a1d00)",
        quote: "Я тебя породил, я тебя и убью!",
        synopsis: "Драматическая повесть о Запорожской Сечи, казачьем братстве, долге, чести и трагедии отцов и сыновей.",
        relaySource: {
          provider: "wikisource",
          page: "Тарас_Бульба_(Гоголь)",
          lang: "ru"
        }
      },
      {
        id: "relay_white_guard",
        title: "Белая гвардия",
        author: "Михаил Афанасьевич Булгаков",
        year: 1925,
        genre: "Военная проза",
        tags: ["военное", "история", "революция", "киевляне", "драма", "роман"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКИЙ РОМАН",
        format: "Роман",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 360,
        wordsCount: 110000,
        rating: 4.91,
        ratingCount: 890,
        popularity: 62000,
        coverImage: "https://covers.openlibrary.org/b/id/11139433-L.jpg",
        coverStyle: "linear-gradient(135deg, #160a00, #381500)",
        quote: "Велик был год и страшен год по рождестве Христовом 1918.",
        synopsis: "Трагический роман о Гражданской войне, судьбе интеллигентной семьи Турбиных в осажденном Киеве и крушении старого мира.",
        relaySource: {
          provider: "wikisource",
          page: "Белая_гвардия_(Булгаков)",
          lang: "ru"
        }
      },

      // ==========================================
      // РУССКАЯ И МИРОВАЯ КЛАССИКА
      // ==========================================
      {
        id: "relay_crime_and_punishment",
        title: "Преступление и наказание",
        author: "Фёдор Михайлович Достоевский",
        year: 1866,
        genre: "Классика",
        tags: ["классика", "психология", "философия", "петербург", "детектив", "драма"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ФОЛИАНТ",
        format: "Фолиант",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 640,
        wordsCount: 210000,
        rating: 4.95,
        ratingCount: 2840,
        popularity: 145000,
        coverImage: "https://covers.openlibrary.org/b/id/8231856-L.jpg",
        coverStyle: "linear-gradient(135deg, #120017, #2d003b)",
        quote: "Тварь ли я дрожащая или право имею?",
        synopsis: "Глубочайшее психологическое исследование совести Родиона Раскольникова в душных переулках Петербурга.",
        relaySource: {
          provider: "wikisource",
          page: "Преступление_и_наказание_(Достоевский)",
          lang: "ru"
        }
      },
      {
        id: "relay_master_margarita",
        title: "Собачье сердце",
        author: "Михаил Афанасьевич Булгаков",
        year: 1925,
        genre: "Классика",
        tags: ["классика", "мистика", "сатира", "москва", "фантасмагория"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ЛИТЕРАТУРЫ",
        format: "Повесть",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 160,
        wordsCount: 52000,
        rating: 4.97,
        ratingCount: 3400,
        popularity: 165000,
        coverImage: "https://covers.openlibrary.org/b/id/8386348-L.jpg",
        coverStyle: "linear-gradient(135deg, #0b1a2b, #1b3558)",
        quote: "Не читайте до обеда советских газет!",
        synopsis: "Остросатирическая повесть о профессоре Преображенском, Шарикове и опасности форсирования человеческой природы.",
        relaySource: {
          provider: "wikisource",
          page: "Собачье_сердце_(Булгаков)",
          lang: "ru"
        }
      },
      {
        id: "relay_captains_daughter",
        title: "Капитанская дочка",
        author: "Александр Сергеевич Пушкин",
        year: 1836,
        genre: "Классика",
        tags: ["классика", "история", "честь", "пугачевщина", "любовь", "повесть"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ ПОВЕСТЬ",
        format: "Повесть",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 210,
        wordsCount: 58000,
        rating: 4.92,
        ratingCount: 1620,
        popularity: 88000,
        coverImage: "https://covers.openlibrary.org/b/id/9091823-L.jpg",
        coverStyle: "linear-gradient(135deg, #1f1400, #422d05)",
        quote: "Береги честь смолоду, а платье снову.",
        synopsis: "История Петра Гринёва, Маши Мироновой и бунтовщика Емельяна Пугачева во время крестьянского восстания.",
        relaySource: {
          provider: "wikisource",
          page: "Капитанская_дочка_(Пушкин)",
          lang: "ru"
        }
      },
      {
        id: "relay_eugene_onegin",
        title: "Евгений Онегин",
        author: "Александр Сергеевич Пушкин",
        year: 1833,
        genre: "Классика",
        tags: ["классика", "поэма", "стихи", "роман в стихах", "любовь", "энциклопедия"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ РОМАН В СТИХАХ",
        format: "Роман",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 280,
        wordsCount: 42000,
        rating: 4.98,
        ratingCount: 3100,
        popularity: 152000,
        coverImage: "https://covers.openlibrary.org/b/id/8315121-L.jpg",
        coverStyle: "linear-gradient(135deg, #100b21, #2b1b54)",
        quote: "Мой дядя самых честных правил, когда не в шутку занемог...",
        synopsis: "Энциклопедия русской жизни XIX века. Любовь Татьяны Лариной, дуэль с Ленским и пресыщенность светской суетой.",
        relaySource: {
          provider: "wikisource",
          page: "Евгений_Онегин_(Пушкин)",
          lang: "ru"
        }
      },
      {
        id: "relay_hero_of_our_time",
        title: "Герой нашего времени",
        author: "Михаил Юрьевич Лермонтов",
        year: 1840,
        genre: "Классика",
        tags: ["классика", "кавказ", "психология", "романтизм", "печорин", "роман"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ПСИХОЛОГИИ",
        format: "Роман",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 260,
        wordsCount: 68000,
        rating: 4.91,
        ratingCount: 1420,
        popularity: 76000,
        coverImage: "https://covers.openlibrary.org/b/id/8412852-L.jpg",
        coverStyle: "linear-gradient(135deg, #091a24, #14354a)",
        quote: "Я был готов любить весь мир, — меня никто не понял: и я выучился ненавидеть.",
        synopsis: "Портрет поколения в лице Григория Печорина — лишнего человека, ищущего сильных страстей среди величественных гор Кавказа.",
        relaySource: {
          provider: "wikisource",
          page: "Герой_нашего_времени_(Лермонтов)",
          lang: "ru"
        }
      },
      {
        id: "relay_woe_from_wit",
        title: "Горе от ума",
        author: "Александр Сергеевич Грибоедов",
        year: 1825,
        genre: "Классика",
        tags: ["классика", "комедия", "сатира", "чацкий", "фамусовщина", "стихи"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ КОМЕДИЯ",
        format: "Пьеса",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 180,
        wordsCount: 36000,
        rating: 4.89,
        ratingCount: 1100,
        popularity: 67000,
        coverImage: "https://covers.openlibrary.org/b/id/8372911-L.jpg",
        coverStyle: "linear-gradient(135deg, #18001a, #36003b)",
        quote: "А судьи кто? За древностию лет к свободной жизни их вражда непримирима.",
        synopsis: "Острая социальная сатира на московское дворянское общество и столкновение свободомыслящего Чацкого с косным Фамусовым.",
        relaySource: {
          provider: "wikisource",
          page: "Горе_от_ума_(Грибоедов)",
          lang: "ru"
        }
      },
      {
        id: "relay_dead_souls",
        title: "Мёртвые души",
        author: "Николай Васильевич Гоголь",
        year: 1842,
        genre: "Классика",
        tags: ["классика", "поэма", "сатира", "чичиков", "губерния", "россия"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНАЯ ПОЭМА",
        format: "Фолиант",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 420,
        wordsCount: 138000,
        rating: 4.93,
        ratingCount: 1780,
        popularity: 92000,
        coverImage: "https://covers.openlibrary.org/b/id/8291475-L.jpg",
        coverStyle: "linear-gradient(135deg, #171000, #3d2c00)",
        quote: "Русь, куда ж несешься ты? Дай ответ. Не дает ответа.",
        synopsis: "Путешествие Павла Ивановича Чичикова по провинциальной России со скупкой умерших крестьянских душ.",
        relaySource: {
          provider: "wikisource",
          page: "Мёртвые_души_(Гоголь)",
          lang: "ru"
        }
      },
      {
        id: "relay_fathers_and_sons",
        title: "Отцы и дети",
        author: "Иван Сергеевич Тургенев",
        year: 1862,
        genre: "Классика",
        tags: ["классика", "нигилизм", "базаров", "поколения", "драма", "роман"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ЛИТЕРАТУРЫ",
        format: "Роман",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 310,
        wordsCount: 88000,
        rating: 4.87,
        ratingCount: 1350,
        popularity: 71000,
        coverImage: "https://covers.openlibrary.org/b/id/8301984-L.jpg",
        coverStyle: "linear-gradient(135deg, #091a13, #153b2c)",
        quote: "Природа не храм, а мастерская, и человек в ней работник.",
        synopsis: "Конфликт консервативного дворянства и радикального нигилиста Евгения Базарова, отвергающего любые авторитеты.",
        relaySource: {
          provider: "wikisource",
          page: "Отцы_и_дети_(Тургенев)",
          lang: "ru"
        }
      },
      {
        id: "relay_anna_karenina",
        title: "Анна Каренина",
        author: "Лев Николаевич Толстой",
        year: 1877,
        genre: "Классика",
        tags: ["классика", "роман", "любовь", "семья", "трагедия", "фолиант"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ФОЛИАНТ",
        format: "Фолиант",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 860,
        wordsCount: 350000,
        rating: 4.95,
        ratingCount: 2200,
        popularity: 118000,
        coverImage: "https://covers.openlibrary.org/b/id/8235108-L.jpg",
        coverStyle: "linear-gradient(135deg, #1f0014, #42002b)",
        quote: "Все счастливые семьи похожи друг на друга, каждая несчастливая семья несчастлива по-своему.",
        synopsis: "Всемирно известный роман о любви Анны Карениной и графа Вронского, светском лицемерии и поисках смысла жизни Константином Левиным.",
        relaySource: {
          provider: "wikisource",
          page: "Анна_Каренина_(Толстой)/Часть_первая",
          lang: "ru"
        }
      },
      {
        id: "relay_the_idiot",
        title: "Идиот",
        author: "Фёдор Михайлович Достоевский",
        year: 1869,
        genre: "Классика",
        tags: ["классика", "мышкин", "красота", "петербург", "драма", "фолиант"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ФОЛИАНТ",
        format: "Фолиант",
        difficulty: "Хардкор",
        status: "Завершено",
        lengthPages: 680,
        wordsCount: 240000,
        rating: 4.94,
        ratingCount: 1950,
        popularity: 104000,
        coverImage: "https://covers.openlibrary.org/b/id/8231991-L.jpg",
        coverStyle: "linear-gradient(135deg, #140b24, #2c1a4e)",
        quote: "Красота спасет мир.",
        synopsis: "История прекраснодушного князя Мышкина, оказавшегося в водовороте страстей, корысти и безумия петербургского общества.",
        relaySource: {
          provider: "wikisource",
          page: "Идиот_(Достоевский)",
          lang: "ru"
        }
      },
      {
        id: "relay_overcoat",
        title: "Шинель",
        author: "Николай Васильевич Гоголь",
        year: 1842,
        genre: "Классика",
        tags: ["классика", "маленький человек", "петербург", "гротеск", "повесть"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ГРОТЕСКА",
        format: "Повесть",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 90,
        wordsCount: 22000,
        rating: 4.90,
        ratingCount: 1400,
        popularity: 58000,
        coverImage: "https://covers.openlibrary.org/b/id/8372801-L.jpg",
        coverStyle: "linear-gradient(135deg, #1a160c, #3d341d)",
        quote: "Я брат твой.",
        synopsis: "Трагическая история мелкого чиновника Акакия Акакиевича Башмачкина, чья новая шинель стала смыслом жизни и причиной гибели.",
        relaySource: {
          provider: "wikisource",
          page: "Шинель_(Гоголь)",
          lang: "ru"
        }
      },
      {
        id: "relay_revisor",
        title: "Ревизор",
        author: "Николай Васильевич Гоголь",
        year: 1836,
        genre: "Классика",
        tags: ["классика", "комедия", "хлестаков", "чиновники", "сатира", "пьеса"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ КОМЕДИЯ",
        format: "Пьеса",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 170,
        wordsCount: 38000,
        rating: 4.92,
        ratingCount: 1890,
        popularity: 84000,
        coverImage: "https://covers.openlibrary.org/b/id/8372855-L.jpg",
        coverStyle: "linear-gradient(135deg, #1c1405, #42300b)",
        quote: "К нам едет ревизор!",
        synopsis: "Бессмертная комедия о чиновничьем страхе и проходимце Хлестакове, принятом уездным городком за важного столичного сановника.",
        relaySource: {
          provider: "wikisource",
          page: "Ревизор_(Гоголь)",
          lang: "ru"
        }
      },

      // ==========================================
      // ФИЛОСОФИЯ, ПОЛИТИКА И МЫШЛЕНИЕ
      // ==========================================
      {
        id: "relay_prince_machiavelli",
        title: "Государь",
        author: "Никколо Макиавелли",
        year: 1532,
        genre: "Философия",
        tags: ["философия", "политика", "власть", "лидерство", "государство", "трактат"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ПОЛИТОЛОГИИ",
        format: "Трактат",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 210,
        wordsCount: 52000,
        rating: 4.92,
        ratingCount: 1850,
        popularity: 94000,
        coverImage: "https://covers.openlibrary.org/b/id/8235212-L.jpg",
        coverStyle: "linear-gradient(135deg, #1a0808, #421818)",
        quote: "Цель оправдывает средства, если этой целью является величие государства.",
        synopsis: "Фундаментальный труд эпохи Возрождения о методах захвата, удержания власти и природе государственного управления.",
        relaySource: {
          provider: "wikisource",
          page: "Государь_(Макиавелли)",
          lang: "ru"
        }
      },

      // ==========================================
      // НАУЧНАЯ ФАНТАСТИКА И МИСТИКА
      // ==========================================
      {
        id: "relay_time_machine",
        title: "Машина времени",
        author: "Герберт Джордж Уэллс",
        year: 1895,
        genre: "Фантастика",
        tags: ["фантастика", "время", "будущее", "элои", "морлоки", "приключения"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ ФАНТАСТИКА",
        format: "Роман",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 190,
        wordsCount: 44000,
        rating: 4.90,
        ratingCount: 2450,
        popularity: 115000,
        coverImage: "https://covers.openlibrary.org/b/id/8226191-L.jpg",
        coverStyle: "linear-gradient(135deg, #021a24, #0a3d54)",
        quote: "Мы все движемся вперед во времени с неизменной скоростью.",
        synopsis: "Родоначальник путешествий во времени: Путешественник отправляется в 802 701 год и видит закат человечества.",
        relaySource: {
          provider: "wikisource",
          page: "The_Time_Machine",
          lang: "en"
        }
      },
      {
        id: "relay_war_of_the_worlds",
        title: "Война миров",
        author: "Герберт Джордж Уэллс",
        year: 1898,
        genre: "Фантастика",
        tags: ["фантастика", "марс", "пришельцы", "апокалипсис", "треножники"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКАЯ ФАНТАСТИКА",
        format: "Роман",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 250,
        wordsCount: 65000,
        rating: 4.89,
        ratingCount: 1980,
        popularity: 96000,
        coverImage: "https://covers.openlibrary.org/b/id/8226112-L.jpg",
        coverStyle: "linear-gradient(135deg, #1a0505, #3d0c0c)",
        quote: "Никто не поверил бы в последние годы девятнадцатого столетия, что за всем происходящим на Земле зорко следят существа более развитые, чем человек.",
        synopsis: "Первое и величайшее в литературе вторжение марсиан на Землю на гигантских боевых треножниках со смертоносными тепловыми лучами.",
        relaySource: {
          provider: "wikisource",
          page: "The_War_of_the_Worlds",
          lang: "en"
        }
      },
      {
        id: "relay_twenty_thousand_leagues",
        title: "20 000 лье под водой",
        author: "Жюль Верн",
        year: 1870,
        genre: "Фантастика",
        tags: ["фантастика", "океан", "наутилус", "капитан немо", "приключения"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ФОЛИАНТ",
        format: "Фолиант",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 520,
        wordsCount: 175000,
        rating: 4.93,
        ratingCount: 2200,
        popularity: 124000,
        coverImage: "https://covers.openlibrary.org/b/id/8226245-L.jpg",
        coverStyle: "linear-gradient(135deg, #00171f, #003447)",
        quote: "Подвижный в подвижной среде (Mobilis in mobili).",
        synopsis: "Удивительное кругосветное путешествие профессора Аронакса на подводной лодке «Наутилус» под командованием таинственного капитана Немо.",
        relaySource: {
          provider: "wikisource",
          page: "Twenty_Thousand_Leagues_Under_the_Sea_(Walter)",
          lang: "en"
        }
      },
      {
        id: "relay_dracula",
        title: "Дракула",
        author: "Брэм Стокер",
        year: 1897,
        genre: "Фантастика",
        tags: ["готика", "мистика", "вампиры", "трансильвания", "хоррор"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКИЙ ХОРРОР",
        format: "Роман",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 440,
        wordsCount: 160000,
        rating: 4.92,
        ratingCount: 2100,
        popularity: 110000,
        coverImage: "https://covers.openlibrary.org/b/id/8231872-L.jpg",
        coverStyle: "linear-gradient(135deg, #140000, #380202)",
        quote: "Добро пожаловать в мой дом! Входите смело и оставьте немного счастья, которое вы принесли с собой.",
        synopsis: "Классический готический роман в письмах и дневниках об опасном трансильванском графе-вампире и охотнике Ван Хельсинге.",
        relaySource: {
          provider: "wikisource",
          page: "Dracula",
          lang: "en"
        }
      },
      {
        id: "relay_frankenstein",
        title: "Франкенштейн",
        author: "Мэри Шелли",
        year: 1818,
        genre: "Фантастика",
        tags: ["готика", "наука", "создатель", "монстр", "роман"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ГОТИКИ",
        format: "Роман",
        difficulty: "Средняя",
        status: "Завершено",
        lengthPages: 280,
        wordsCount: 75000,
        rating: 4.88,
        ratingCount: 1650,
        popularity: 88000,
        coverImage: "https://covers.openlibrary.org/b/id/8225912-L.jpg",
        coverStyle: "linear-gradient(135deg, #0d1417, #1b2a30)",
        quote: "Если я не могу внушить любовь, я буду внушать страх!",
        synopsis: "История ученого Виктора Франкенштейна, дерзнувшего создать искусственного человека, и трагедия отвергнутого создания.",
        relaySource: {
          provider: "wikisource",
          page: "Frankenstein,_or_the_Modern_Prometheus_(1818)",
          lang: "en"
        }
      },
      {
        id: "relay_dorian_gray",
        title: "Портрет Дориана Грея",
        author: "Оскар Уайльд",
        year: 1890,
        genre: "Классика",
        tags: ["классика", "эстетизм", "красота", "грех", "портрет", "лондон"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР ЭСТЕТИЗМА",
        format: "Роман",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 290,
        wordsCount: 82000,
        rating: 4.94,
        ratingCount: 2900,
        popularity: 148000,
        coverImage: "https://covers.openlibrary.org/b/id/8231902-L.jpg",
        coverStyle: "linear-gradient(135deg, #1b1200, #422d05)",
        quote: "Единственный способ отделаться от искушения — уступить ему.",
        synopsis: "Юный Дориан Грей сохраняет вечную молодость, пока его скрытый портрет стареет и впитывает следы всех его пороков.",
        relaySource: {
          provider: "wikisource",
          page: "The_Picture_of_Dorian_Gray",
          lang: "en"
        }
      },

      // ==========================================
      // ДЕТЕКТИВ И ПРИКЛЮЧЕНИЯ
      // ==========================================
      {
        id: "relay_sherlock_holmes",
        title: "Приключения Шерлока Холмса",
        author: "Артур Конан Дойл",
        year: 1892,
        genre: "Детектив",
        tags: ["детектив", "дедукция", "лондон", "ватсон", "викторианский", "расследования"],
        rarity: "legendary",
        rarityLabel: "ЛЕГЕНДАРНЫЙ ЦИКЛ",
        format: "Сборник",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 380,
        wordsCount: 112000,
        rating: 4.96,
        ratingCount: 3800,
        popularity: 175000,
        coverImage: "https://covers.openlibrary.org/b/id/8315264-L.jpg",
        coverStyle: "linear-gradient(135deg, #141700, #2c3300)",
        quote: "Отбросьте все невозможное; то, что останется, и будет истиной, сколь бы невероятным оно ни казалось.",
        synopsis: "Сборник из 12 классических расследований гениального сыщика с Бейкер-стрит и его верного спутника доктора Ватсона.",
        relaySource: {
          provider: "wikisource",
          page: "Приключения_Шерлока_Холмса_(Конан_Дойль)",
          lang: "ru"
        }
      },
      {
        id: "relay_treasure_island",
        title: "Остров сокровищ",
        author: "Роберт Льюис Стивенсон",
        year: 1883,
        genre: "Приключения",
        tags: ["приключения", "пираты", "сокровища", "джон сильвер", "море", "роман"],
        rarity: "epic",
        rarityLabel: "ЭПИЧЕСКИЕ ПРИКЛЮЧЕНИЯ",
        format: "Роман",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 270,
        wordsCount: 72000,
        rating: 4.91,
        ratingCount: 2300,
        popularity: 118000,
        coverImage: "https://covers.openlibrary.org/b/id/8226081-L.jpg",
        coverStyle: "linear-gradient(135deg, #1f1200, #4a2d05)",
        quote: "Пятнадцать человек на сундук мертвеца, йо-хо-хо, и бутылка рому!",
        synopsis: "Захватывающая охота за золотом капитана Флинта: юный Джим Хокинс, шхуна «Испаньола» и коварный пират Джон Сильвер.",
        relaySource: {
          provider: "wikisource",
          page: "Остров_сокровищ_(Стивенсон)",
          lang: "ru"
        }
      },
      {
        id: "relay_alice_in_wonderland",
        title: "Алиса в Стране чудес",
        author: "Льюис Кэрролл",
        year: 1865,
        genre: "Сказка",
        tags: ["сказка", "нонсенс", "белый кролик", "чеширский кот", "детям и взрослым"],
        rarity: "masterpiece",
        rarityLabel: "ШЕДЕВР НОНСЕНСА",
        format: "Повесть",
        difficulty: "Легкая",
        status: "Завершено",
        lengthPages: 160,
        wordsCount: 32000,
        rating: 4.90,
        ratingCount: 3100,
        popularity: 135000,
        coverImage: "https://covers.openlibrary.org/b/id/8225890-L.jpg",
        coverStyle: "linear-gradient(135deg, #1b0024, #3d0052)",
        quote: "Нужно бежать со всех ног, чтобы только оставаться на одном месте!",
        synopsis: "Головокружительное падение в кроличью нору: Безумное чаепитие, улыбка Чеширского кота и парадоксальная логика Чарльза Доджсона.",
        relaySource: {
          provider: "wikisource",
          page: "Alice%27s_Adventures_in_Wonderland",
          lang: "en"
        }
      }
    ];

    // Map verified age ratings across catalog
    const AGE_MAP = {
      'relay_war_and_peace': '16+',
      'relay_art_of_war': '12+',
      'relay_taras_bulba': '12+',
      'relay_white_guard': '16+',
      'relay_crime_and_punishment': '16+',
      'relay_master_margarita': '16+',
      'relay_heart_of_dog': '16+',
      'relay_captains_daughter': '12+',
      'relay_eugene_onegin': '12+',
      'relay_hero_of_our_time': '16+',
      'relay_woe_from_wit': '12+',
      'relay_dead_souls': '12+',
      'relay_fathers_and_sons': '16+',
      'relay_anna_karenina': '16+',
      'relay_the_idiot': '16+',
      'relay_idiot': '16+',
      'relay_overcoat': '12+',
      'relay_revisor': '12+',
      'relay_inspector_general': '12+',
      'relay_prince_machiavelli': '16+',
      'relay_prince': '16+',
      'relay_time_machine': '12+',
      'relay_war_of_the_worlds': '12+',
      'relay_twenty_thousand_leagues': '6+',
      'relay_20000_leagues': '6+',
      'relay_dracula': '16+',
      'relay_frankenstein': '16+',
      'relay_dorian_gray': '16+',
      'relay_sherlock_holmes': '12+',
      'relay_treasure_island': '6+',
      'relay_alice_in_wonderland': '0+',
      'relay_alice_wonderland': '0+'
    };

    this.relayedCatalog.forEach(b => {
      if (!b.ageRating) {
        b.ageRating = AGE_MAP[b.id] || (b.lengthPages > 500 ? '16+' : '12+');
      }
    });
  }

  // Получить все книги каталога
  getAllBooks() {
    return this.relayedCatalog;
  }

  // Получить книгу по ID
  getBookById(id) {
    if (!id) return null;
    let book = this.relayedCatalog.find(b => b.id === id);
    if (!book && this.externalSearchResults.has(id)) {
      book = this.externalSearchResults.get(id);
    }
    return book || null;
  }

  /**
   * Потоковая ретрансляция книги из внешнего источника.
   * Принцип Zero-Storage: ничего не сохраняется на диск,
   * всё подкачивается в ОЗУ в реальном времени.
   */
  async streamBook(bookId) {
    const book = this.getBookById(bookId);
    if (!book) return null;

    // Если главы уже были скачаны в текущей сессии — отдаем мгновенно из ОЗУ
    if (book.chapters && book.chapters.length > 0) {
      return {
        success: true,
        book,
        chapters: book.chapters,
        sourceName: book.relaySourceName || "Викитека (Wikisource)",
        sourceUrl: book.relaySourceUrl || `https://ru.wikisource.org/wiki/${encodeURIComponent(book.title)}`
      };
    }

    const cfg = book.relaySource || {
      provider: "wikisource",
      page: book.title.replace(/\s+/g, '_'),
      lang: "ru"
    };

    // 1. Попытка ретрансляции через серверный прокси (/api/relay/stream)
    try {
      const url = `/api/relay/stream?provider=${encodeURIComponent(cfg.provider)}&page=${encodeURIComponent(cfg.page || '')}&lang=${encodeURIComponent(cfg.lang || 'ru')}&identifier=${encodeURIComponent(cfg.identifier || '')}&max_chapters=15`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.chapters && data.chapters.length > 0) {
          book.chapters = data.chapters;
          book.relaySourceName = data.sourceName;
          book.relaySourceUrl = data.sourceUrl;
          this.manageLruCache(book.id);
          return {
            success: true,
            book,
            chapters: data.chapters,
            sourceName: data.sourceName,
            sourceUrl: data.sourceUrl
          };
        }
      }
    } catch (e) {
      console.warn("[Relay] Ошибка запроса к серверному прокси, пробуем прямой запрос из браузера...", e);
    }

    // 2. Прямой браузерный fallback к Викитеке с CORS (на случай если сервер недоступен)
    try {
      const pageTitle = cfg.page || book.title.replace(/\s+/g, '_');
      const lang = cfg.lang || 'ru';
      const wikiUrl = `https://${lang}.wikisource.org/w/api.php?action=parse&origin=*&page=${encodeURIComponent(pageTitle)}&prop=text&format=json`;
      const resp = await fetch(wikiUrl);
      if (resp.ok) {
        const d = await resp.json();
        const rawHtml = d?.parse?.text?.['*'];
        if (rawHtml) {
          const div = document.createElement('div');
          div.innerHTML = rawHtml;
          // Удаляем служебные плашки
          div.querySelectorAll('script, style, .ws-noexport, .headertemplate, .navbox, table').forEach(el => el.remove());
          
          const pElements = Array.from(div.querySelectorAll('p'))
            .map(p => p.textContent.trim())
            .filter(t => t.length > 25 && !t.startsWith('↑'));

          const chapters = [];
          const chunkSize = 16;
          for (let i = 0; i < pElements.length; i += chunkSize) {
            const chunk = pElements.slice(i, i + chunkSize);
            chapters.push({
              title: `Глава ${Math.floor(i / chunkSize) + 1}`,
              content: chunk.join('\n\n')
            });
          }

          if (chapters.length > 0) {
            book.chapters = chapters;
            book.relaySourceName = `Викитека (${lang}.wikisource.org)`;
            book.relaySourceUrl = `https://${lang}.wikisource.org/wiki/${encodeURIComponent(pageTitle)}`;
            this.manageLruCache(book.id);
            return {
              success: true,
              book,
              chapters,
              sourceName: book.relaySourceName,
              sourceUrl: book.relaySourceUrl
            };
          }
        }
      }
    } catch (clientErr) {
      console.error("[Relay] Браузерный fallback завершился ошибкой:", clientErr);
    }

    return null;
  }

  // LRU in-memory cache manager (Zero-Storage adherence & low RAM footprint)
  manageLruCache(activeBookId) {
    if (!this.cachedBookIds) this.cachedBookIds = [];
    this.cachedBookIds = this.cachedBookIds.filter(id => id !== activeBookId);
    this.cachedBookIds.push(activeBookId);

    while (this.cachedBookIds.length > 6) {
      const oldestId = this.cachedBookIds.shift();
      const oldestBook = this.getBookById(oldestId);
      if (oldestBook && oldestId !== activeBookId) {
        delete oldestBook.chapters;
      }
    }
  }

  // Универсальный движок Большого Фильтра и Сортировки
  filterCatalog(criteria = {}) {
    let result = [...this.relayedCatalog];

    // 1. Поиск по строке (название, автор, синопсис, теги, год)
    const query = (criteria.search || criteria.query || '').trim().toLowerCase();
    if (query) {
      const qTokens = query.split(/\s+/).filter(Boolean);
      result = result.filter(b => {
        const title = (b.title || '').toLowerCase();
        const author = (b.author || '').toLowerCase();
        const synopsis = (b.synopsis || '').toLowerCase();
        const tags = Array.isArray(b.tags) ? b.tags.map(t => t.toLowerCase()).join(' ') : '';
        const yearStr = String(b.year || '');
        const genre = (b.genre || '').toLowerCase();

        const fullHaystack = `${title} ${author} ${synopsis} ${tags} ${yearStr} ${genre}`;
        return qTokens.every(tok => fullHaystack.includes(tok));
      });
    }

    // 2. Год издания / Эпоха (criteria.yearMin, criteria.yearMax, criteria.era)
    if (criteria.era && criteria.era !== 'all') {
      if (criteria.era === 'ancient' || criteria.era === 'before_1800') {
        result = result.filter(b => (b.year || 0) < 1800);
      } else if (criteria.era === '19th' || criteria.era === '1800_1899') {
        result = result.filter(b => (b.year || 0) >= 1800 && (b.year || 0) <= 1899);
      } else if (criteria.era === '20th' || criteria.era === '1900_1999') {
        result = result.filter(b => (b.year || 0) >= 1900 && (b.year || 0) <= 1999);
      } else if (criteria.era === '21st' || criteria.era === '2000_plus') {
        result = result.filter(b => (b.year || 0) >= 2000);
      }
    }
    if (typeof criteria.yearMin === 'number' && !isNaN(criteria.yearMin)) {
      result = result.filter(b => (b.year || 0) >= criteria.yearMin);
    }
    if (typeof criteria.yearMax === 'number' && !isNaN(criteria.yearMax)) {
      result = result.filter(b => (b.year || 0) <= criteria.yearMax);
    }

    // 3. Возрастной рейтинг (criteria.age / criteria.ageRating)
    if (criteria.ageRating && criteria.ageRating !== 'all') {
      const ar = criteria.ageRating.trim();
      if (criteria.ageMode === 'exact') {
        result = result.filter(b => (b.ageRating || '12+') === ar);
      } else {
        if (ar === '0+') {
          result = result.filter(b => (b.ageRating || '12+') === '0+');
        } else if (ar === '6+') {
          result = result.filter(b => ['0+', '6+'].includes(b.ageRating || '12+'));
        } else if (ar === '12+') {
          result = result.filter(b => ['0+', '6+', '12+'].includes(b.ageRating || '12+'));
        } else if (ar === '16+') {
          result = result.filter(b => ['0+', '6+', '12+', '16+'].includes(b.ageRating || '12+'));
        } else if (ar === '18+') {
          result = result.filter(b => (b.ageRating || '12+') === '18+');
        } else {
          result = result.filter(b => (b.ageRating || '12+') === ar);
        }
      }
    }

    // 4. Жанр / Тематика
    if (criteria.genre && criteria.genre !== 'all') {
      const g = criteria.genre.toLowerCase();
      if (g === 'recommend') {
        // Рекомендации вычисляются на уровне приложения
      } else if (g === 'masterpiece' || g === 'legendary') {
        result = result.filter(b => b.rarity === g || (b.tags && b.tags.includes(g)));
      } else {
        result = result.filter(b => {
          const bGenre = (b.genre || '').toLowerCase();
          const bTags = Array.isArray(b.tags) ? b.tags.map(t => t.toLowerCase()) : [];
          return bGenre.includes(g) || bTags.some(t => t.includes(g));
        });
      }
    }

    // 5. Объём страниц (criteria.pagesLength / criteria.volume)
    if (criteria.pagesLength && criteria.pagesLength !== 'all') {
      if (criteria.pagesLength === 'short') {
        result = result.filter(b => (b.lengthPages || 0) < 200);
      } else if (criteria.pagesLength === 'medium') {
        result = result.filter(b => (b.lengthPages || 0) >= 200 && (b.lengthPages || 0) <= 500);
      } else if (criteria.pagesLength === 'epic' || criteria.pagesLength === 'long') {
        result = result.filter(b => (b.lengthPages || 0) > 500);
      }
    }

    // 6. Формат (Фолиант, Роман, Трактат, Повесть, Сборник)
    if (criteria.format && criteria.format !== 'all') {
      const formatMap = {
        'foliant': 'Фолиант',
        'novel': 'Роман',
        'treatise': 'Трактат',
        'novella': 'Повесть',
        'collection': 'Сборник'
      };
      const targetFormat = formatMap[criteria.format] || criteria.format;
      result = result.filter(b => b.format === targetFormat);
    }

    // 7. Сложность (Базовая/Легкая, Средняя, Хардкор)
    if (criteria.difficulty && criteria.difficulty !== 'all') {
      const diffMap = {
        'easy': 'Базовая',
        'medium': 'Средняя',
        'hardcore': 'Хардкор'
      };
      const targetDiff = diffMap[criteria.difficulty] || criteria.difficulty;
      result = result.filter(b => {
        if (targetDiff === 'Базовая' || targetDiff === 'Легкая') {
          return b.difficulty === 'Базовая' || b.difficulty === 'Легкая';
        }
        return b.difficulty === targetDiff;
      });
    }

    // 8. Статус чтения в профиле
    const username = criteria.username || criteria.userId;
    if (criteria.status && criteria.status !== 'all' && username) {
      const shelves = this.getUserShelves(username);
      const readingIds = new Set((shelves.readingNow || []).map(r => r.id));
      const compIds = new Set((shelves.completed || []).map(c => c.id));
      const favIds = new Set(shelves.favorites || []);

      if (criteria.status === 'reading') {
        result = result.filter(b => readingIds.has(b.id));
      } else if (criteria.status === 'completed') {
        result = result.filter(b => compIds.has(b.id));
      } else if (criteria.status === 'favorite' || criteria.status === 'favorites') {
        result = result.filter(b => favIds.has(b.id));
      } else if (criteria.status === 'unstarted') {
        result = result.filter(b => !readingIds.has(b.id) && !compIds.has(b.id));
      }
    }

    // 9. Сортировка
    const sortMode = criteria.sort || criteria.sortBy;
    if (sortMode) {
      if (sortMode === 'popular') {
        result.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      } else if (sortMode === 'rating') {
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      } else if (sortMode === 'pages_desc') {
        result.sort((a, b) => (b.lengthPages || 0) - (a.lengthPages || 0));
      } else if (sortMode === 'pages_asc') {
        result.sort((a, b) => (a.lengthPages || 0) - (b.lengthPages || 0));
      } else if (sortMode === 'year_desc') {
        result.sort((a, b) => (b.year || 0) - (a.year || 0));
      } else if (sortMode === 'year_asc') {
        result.sort((a, b) => (a.year || 0) - (b.year || 0));
      } else if (sortMode === 'title') {
        result.sort((a, b) => a.title.localeCompare(b.title, 'ru'));
      }
    }

    return result;
  }

  // Живой сквозной поиск по внешним библиотекам (Wikisource + Open Library)
  async searchExternalRelay(query) {
    if (!query) return [];

    // 1. Попытка запроса через наш серверный API /api/relay/search
    try {
      const resp = await fetch(`/api/relay/search?q=${encodeURIComponent(query)}&lang=ru`);
      if (resp.ok) {
        const data = await resp.json();
        if (data.success && data.results && data.results.length > 0) {
          data.results.forEach(b => {
            this.externalSearchResults.set(b.id, b);
          });
          return data.results;
        }
      }
    } catch (e) {
      console.warn("[Relay] Серверный поиск недоступен, fallback к прямому Open Library...", e);
    }

    // 2. Fallback: прямой поиск по Open Library
    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) return [];
      const data = await response.json();

      return (data.docs || []).map(doc => {
        const coverId = doc.cover_i;
        const coverImage = coverId 
          ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          : 'https://covers.openlibrary.org/b/id/12818862-L.jpg';

        const numPages = doc.number_of_pages_median || Math.floor(Math.random() * 300 + 200);
        const iaList = doc.ia || [];
        const iaId = iaList.length > 0 ? iaList[0] : null;

        const bookObj = {
          id: `ext_${doc.key.replace('/works/', '')}`,
          title: doc.title,
          author: doc.author_name ? doc.author_name[0] : 'Мировой классик',
          year: doc.first_publish_year || 1900,
          genre: (doc.subject && doc.subject[0]) || 'Классика',
          tags: (doc.subject || []).slice(0, 5).concat(["открытый фонд", "ретрансляция"]),
          rarity: numPages > 500 ? 'legendary' : 'epic',
          rarityLabel: numPages > 500 ? 'ЛЕГЕНДАРНЫЙ ФОЛИАНТ' : 'ЭПИЧЕСКОЕ ТВОРЕНИЕ',
          format: numPages > 600 ? 'Фолиант' : 'Роман',
          difficulty: numPages > 500 ? 'Хардкор' : 'Средняя',
          lengthPages: numPages,
          wordsCount: numPages * 280,
          rating: Number((4.6 + Math.random() * 0.38).toFixed(2)),
          ratingCount: Math.floor(Math.random() * 400 + 100),
          popularity: Math.floor(Math.random() * 50000 + 10000),
          coverImage: coverImage,
          coverStyle: 'linear-gradient(135deg, #101524, #1f2a48)',
          quote: '«Книга — живой диалог сквозь столетия.»',
          synopsis: doc.first_sentence ? doc.first_sentence[0] : 'Шедевр мирового фонда литературы Open Library.',
          relaySource: {
            provider: iaId ? "archive" : "wikisource",
            identifier: iaId,
            page: doc.title.replace(/\s+/g, '_'),
            lang: /[а-яА-Я]/.test(doc.title) ? "ru" : "en"
          }
        };

        this.externalSearchResults.set(bookObj.id, bookObj);
        return bookObj;
      });
    } catch {
      return [];
    }
  }

  // Рецензии пользователей
  getReviews(bookId) {
    try {
      const all = JSON.parse(localStorage.getItem(this.reviewsKey) || '{}');
      const defaultReviews = [
        {
          id: 'rev_1',
          author: 'Игорь_Стратег',
          avatar: '⚔️',
          date: '2 дня назад',
          rating: 5,
          text: 'Грандиозный масштаб и глубина мысли! Подлинный текст читается на одном дыхании в режиме непрерывной ленты.'
        },
        {
          id: 'rev_2',
          author: 'София_Читатель',
          avatar: '🦉',
          date: 'Вчера',
          rating: 5,
          text: 'Одно из лучших произведений мировой классики. Ретрансляция работает моментально, главы чистые и структурированные!'
        }
      ];
      return all[bookId] || defaultReviews;
    } catch {
      return [];
    }
  }

  addReview(bookId, review) {
    try {
      const all = JSON.parse(localStorage.getItem(this.reviewsKey) || '{}');
      if (!all[bookId]) all[bookId] = this.getReviews(bookId);
      all[bookId].unshift(review);
      localStorage.setItem(this.reviewsKey, JSON.stringify(all));
      return true;
    } catch {
      return false;
    }
  }

  // Полки чтения
  getUserShelves(username) {
    try {
      const raw = localStorage.getItem(`${this.readingStateKey}_${username}`);
      if (raw) return JSON.parse(raw);
    } catch {}

    return {
      readingNow: [
        { id: "relay_war_and_peace", progressPercent: 38, lastRead: "Сегодня", chapterIdx: 2 },
        { id: "relay_crime_and_punishment", progressPercent: 64, lastRead: "Вчера", chapterIdx: 3 }
      ],
      favorites: [
        "relay_master_margarita",
        "relay_art_of_war",
        "relay_captains_daughter",
        "relay_eugene_onegin"
      ],
      completed: [
        { id: "relay_art_of_war", completedDate: "14.01.2026", rating: 5 },
        { id: "relay_master_margarita", completedDate: "02.02.2026", rating: 5 },
        { id: "relay_sherlock_holmes", completedDate: "18.02.2026", rating: 5 }
      ],
      yearlyGoal: 25,
      completedThisYear: 3,
      usefulBooksCount: 2
    };
  }

  saveUserShelves(username, shelves) {
    try {
      localStorage.setItem(`${this.readingStateKey}_${username}`, JSON.stringify(shelves));
    } catch {}
  }

  toggleFavorite(username, bookId) {
    const shelves = this.getUserShelves(username);
    const idx = shelves.favorites.indexOf(bookId);
    let isFav = false;
    if (idx >= 0) {
      shelves.favorites.splice(idx, 1);
      isFav = false;
    } else {
      shelves.favorites.push(bookId);
      isFav = true;
    }
    this.saveUserShelves(username, shelves);
    return isFav;
  }

  setReadingNow(username, bookId) {
    const shelves = this.getUserShelves(username);
    const existing = shelves.readingNow.find(b => b.id === bookId);
    if (!existing) {
      shelves.readingNow.unshift({
        id: bookId,
        progressPercent: 5,
        lastRead: "Только что",
        chapterIdx: 0
      });
      this.saveUserShelves(username, shelves);
    }
  }

  updateProgress(username, bookId, percent, chapterIdx) {
    const shelves = this.getUserShelves(username);
    const existing = shelves.readingNow.find(b => b.id === bookId);
    if (existing) {
      existing.progressPercent = Math.min(100, Math.max(existing.progressPercent, percent));
      existing.lastRead = "Только что";
      existing.chapterIdx = chapterIdx;
    } else {
      shelves.readingNow.unshift({
        id: bookId,
        progressPercent: percent,
        lastRead: "Только что",
        chapterIdx: chapterIdx
      });
    }

    if (percent >= 100) {
      if (!shelves.completed.find(b => b.id === bookId)) {
        shelves.completed.push({
          id: bookId,
          completedDate: new Date().toLocaleDateString('ru-RU'),
          rating: 5
        });
        shelves.completedThisYear += 1;
        const b = this.getBookById(bookId);
        if (b && (b.rarity === 'legendary' || b.rarity === 'masterpiece')) {
          shelves.usefulBooksCount += 1;
        }
      }
    }

    this.saveUserShelves(username, shelves);
  }
}

window.bookRelay = new BookRelayService();

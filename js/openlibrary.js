/**
 * CyberLibris Open Library API Connector
 * Fetches real books, real high-res covers, authors, and genres from openlibrary.org.
 * Allows 1-click live import into the user's local and GitHub-synced library.
 */

class OpenLibraryService {
  constructor() {
    this.baseUrl = 'https://openlibrary.org';
    this.coversUrl = 'https://covers.openlibrary.org/b/id';
    this.cache = new Map();
  }

  async searchBooks(query, limit = 12) {
    const cacheKey = `${query.toLowerCase().trim()}_${limit}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const encoded = encodeURIComponent(query.trim());
      const res = await fetch(`${this.baseUrl}/search.json?q=${encoded}&limit=${limit}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const results = (data.docs || []).map((doc) => this.formatBook(doc));
      this.cache.set(cacheKey, results);
      return results;
    } catch (err) {
      console.warn('OpenLibrary search error, using curated fallbacks:', err);
      return this.getFallbackBooks(query);
    }
  }

  formatBook(doc) {
    const coverId = doc.cover_i;
    const coverImage = coverId ? `${this.coversUrl}/${coverId}-M.jpg` : null;
    const author = (doc.author_name && doc.author_name[0]) || 'Неизвестный автор';
    const year = doc.first_publish_year || doc.publish_year?.[0] || 'Классика';
    const editions = doc.edition_count || 1;
    const ratings = doc.ratings_average ? Number(doc.ratings_average).toFixed(1) : (4.5 + Math.random() * 0.4).toFixed(1);

    // Calculate Steam-style rarity based on popularity and editions
    let rarity = 'common';
    let xpMultiplier = 'x1.0 XP';
    let complexity = 2;
    let featuredBadge = '';

    if (editions > 40 || ratings >= 4.8) {
      rarity = 'legendary';
      xpMultiplier = 'x3.0 XP';
      complexity = 5;
      featuredBadge = 'МИРОВОЙ ШЕДЕВР';
    } else if (editions > 18 || ratings >= 4.6) {
      rarity = 'epic';
      xpMultiplier = 'x2.0 XP';
      complexity = 4;
      featuredBadge = 'КУЛЬТОВАЯ КНИГА';
    } else if (editions > 6 || ratings >= 4.3) {
      rarity = 'rare';
      xpMultiplier = 'x1.5 XP';
      complexity = 3;
      featuredBadge = 'ПОПУЛЯРНОЕ';
    }

    const genre = this.detectGenre(doc.subject || [], doc.title);

    return {
      id: `ol_${doc.key ? doc.key.replace(/\//g, '_') : Math.random().toString(36).substr(2, 9)}`,
      title: doc.title,
      author: author,
      genre: genre,
      year: year,
      rating: parseFloat(ratings),
      rarity: rarity,
      complexity: complexity,
      xpMultiplier: xpMultiplier,
      featuredBadge: featuredBadge,
      coverImage: coverImage,
      coverIcon: this.getGenreIcon(genre),
      coverStyle: this.getGenreGradient(genre),
      tags: (doc.subject || []).slice(0, 4),
      description: doc.first_sentence?.[0] || `Классическое произведение мировой литературы. Автор: ${author}. Опубликовано: ${year}.`,
      estimatedReadTime: `${Math.floor(Math.random() * 10 + 10)} мин`,
      isOpenLibrary: true,
      openLibraryKey: doc.key,
      chapters: [
        {
          id: 1,
          title: "Глава 1: Введение в произведение",
          content: doc.first_sentence?.[0] 
            ? `${doc.first_sentence[0]}\n\nЭто подлинное издание из Всемирного каталога Open Library. Книга добавлена в вашу цифровую коллекцию CyberLibris.`
            : `Книга «${doc.title}» автора ${author} была впервые издана в ${year} году и завоевала признание миллионов читателей по всему миру.\n\nЧтение оригинальных шедевров мировой литературы активирует когнитивные нейросети и расширяет кругозор исследователя.`
        },
        {
          id: 2,
          title: "Глава 2: Кульминация и философский смысл",
          content: `Глубокий анализ мотивов и ключевых идей произведения «${doc.title}».\n\nКаждая прочитанная страница увеличивает ваш интеллектуальный уровень в CyberLibris и открывает доступ к новым космическим кастомизациям в Магазине.`
        }
      ]
    };
  }

  detectGenre(subjects, title) {
    const text = (subjects.join(' ') + ' ' + title).toLowerCase();
    if (text.includes('cyber') || text.includes('punk') || text.includes('matrix')) return 'Киберпанк';
    if (text.includes('science fiction') || text.includes('space') || text.includes('alien') || text.includes('future')) return 'Научная Фантастика';
    if (text.includes('computer') || text.includes('program') || text.includes('software') || text.includes('code') || text.includes('tech')) return 'Технологии';
    if (text.includes('philosophy') || text.includes('ethics') || text.includes('mind') || text.includes('war')) return 'Философия';
    if (text.includes('fantasy') || text.includes('magic') || text.includes('dragon')) return 'Фэнтези';
    return 'Классика';
  }

  getGenreIcon(genre) {
    const map = {
      'Киберпанк': '🕶️',
      'Технологии': '💻',
      'Научная Фантастика': '🚀',
      'Философия': '⚔️',
      'Фэнтези': '🔮',
      'Классика': '📜'
    };
    return map[genre] || '📖';
  }

  getGenreGradient(genre) {
    const map = {
      'Киберпанк': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      'Технологии': 'linear-gradient(135deg, #11998e, #38ef7d)',
      'Научная Фантастика': 'linear-gradient(135deg, #4b6cb7, #182848)',
      'Философия': 'linear-gradient(135deg, #2c3e50, #fd746c)',
      'Фэнтези': 'linear-gradient(135deg, #8a2387, #e94057, #f27121)',
      'Классика': 'linear-gradient(135deg, #3a1c71, #d76d77, #ffaf7b)'
    };
    return map[genre] || 'linear-gradient(135deg, #141e30, #243b55)';
  }

  getFallbackBooks(query) {
    // High-quality curated fallbacks with real OpenLibrary covers if network is offline
    const fallbacks = [
      {
        id: "ol_1984",
        title: "1984: Министерство Правды",
        author: "Джордж Оруэлл",
        genre: "Научная Фантастика",
        year: 1949,
        rating: 4.95,
        rarity: "legendary",
        complexity: 5,
        xpMultiplier: "x3.0 XP",
        featuredBadge: "МИРОВОЙ ШЕДЕВР",
        coverImage: "https://covers.openlibrary.org/b/id/12843475-M.jpg",
        coverIcon: "👁️",
        coverStyle: "linear-gradient(135deg, #870000, #190a05)",
        tags: ["Антиутопия", "Классика", "Свобода"],
        description: "Был холодный ясный апрельский день, и часы пробили тринадцать. Величайшая антиутопия о контроле информации и силе разума.",
        estimatedReadTime: "15 мин",
        chapters: [
          {
            id: 1,
            title: "Часть 1: Большой Брат следит за тобой",
            content: "Был холодный ясный апрельский день, и часы пробили тринадцать. Уткнув подбородок в грудь, чтобы спастись от злого ветра, Уинстон Смит быстро скользнул в стеклянные двери жилого дома «Победа»."
          }
        ]
      },
      {
        id: "ol_dune",
        title: "Дюна: Хроники Песчаной Планеты",
        author: "Фрэнк Герберт",
        genre: "Научная Фантастика",
        year: 1965,
        rating: 4.98,
        rarity: "legendary",
        complexity: 5,
        xpMultiplier: "x3.0 XP",
        featuredBadge: "ХИТ СТОЛЕТИЯ",
        coverImage: "https://covers.openlibrary.org/b/id/11153217-M.jpg",
        coverIcon: "🪐",
        coverStyle: "linear-gradient(135deg, #e65c00, #f9d423)",
        tags: ["Арракис", "Пряность", "Эпос", "Космос"],
        description: "Я не должен бояться. Страх убивает разум. Страх — это малая смерть, несущая полное уничтожение. Монументальная сага о Поле Атрейдесе.",
        estimatedReadTime: "20 мин",
        chapters: [
          {
            id: 1,
            title: "Глава 1: Испытание Гом Джаббаром",
            content: "В предутренних сумерках перед отлетом на Арракис в замок Каладан явилась Преподобная Мать Гайя-Елена Мохиам. Пол Атрейдес готовился к встрече со своей судьбой."
          }
        ]
      },
      {
        id: "ol_fahrenheit",
        title: "451° по Фаренгейту",
        author: "Рэй Брэдбери",
        genre: "Классика",
        year: 1953,
        rating: 4.88,
        rarity: "epic",
        complexity: 4,
        xpMultiplier: "x2.0 XP",
        featuredBadge: "ШЕДЕВР",
        coverImage: "https://covers.openlibrary.org/b/id/10574041-M.jpg",
        coverIcon: "🔥",
        coverStyle: "linear-gradient(135deg, #ff416c, #ff4b2b)",
        tags: ["Книги", "Огонь", "Будущее", "Мысль"],
        description: "Температура, при которой воспламеняется и горит бумага. Гай Монтэг — пожарный, чья работа — сжигать книги. До тех пор, пока он не открыл одну из них.",
        estimatedReadTime: "12 мин",
        chapters: [
          {
            id: 1,
            title: "Часть 1: Очаг и Саламандра",
            content: "Жечь было наслаждением. Какое-то особое наслаждение видеть, как огонь пожирает вещи, как они чернеют и меняются."
          }
        ]
      },
      {
        id: "ol_frankenstein",
        title: "Франкенштейн, или Современный Прометей",
        author: "Мэри Шелли",
        genre: "Классика",
        year: 1818,
        rating: 4.75,
        rarity: "rare",
        complexity: 3,
        xpMultiplier: "x1.5 XP",
        featuredBadge: "ПЕРВАЯ ФАНТАСТИКА",
        coverImage: "https://covers.openlibrary.org/b/id/8228691-M.jpg",
        coverIcon: "⚡",
        coverStyle: "linear-gradient(135deg, #134e5e, #71b280)",
        tags: ["Наука", "Творец", "Готика"],
        description: "История молодого ученого Виктора Франкенштейна, создавшего искусственное существо из неживой материи.",
        estimatedReadTime: "14 мин",
        chapters: [
          {
            id: 1,
            title: "Глава 1: Искра жизни",
            content: "В одну из ненастных ночей ноября я созерцал плоды своих трудов. С мучительным напряжением я собрал вокруг себя инструменты, должные вдохнуть искру жизни в неодушевленное тело."
          }
        ]
      }
    ];

    if (!query) return fallbacks;
    return fallbacks.filter((b) => 
      b.title.toLowerCase().includes(query.toLowerCase()) || 
      b.author.toLowerCase().includes(query.toLowerCase()) ||
      b.genre.toLowerCase().includes(query.toLowerCase())
    );
  }
}

window.openLibrary = new OpenLibraryService();

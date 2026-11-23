/**
 * CYBERLIBRIS - Personal Recommendation & Taste Engine
 * -------------------------------------------------------------
 * Алгоритм рекомендаций книг на основе персональных вкусов,
 * исключающих фильтров, истории чтения и литературного веса.
 */

class RecommendationEngine {
  constructor() {
    this.defaultConfig = {
      likeWeight: 30,
      dislikePenalty: 60,
      historyWeight: 20,
      masterpieceBoost: 15,
      noveltyFactor: 10
    };
    this.config = this.loadConfig();
  }

  loadConfig() {
    try {
      const saved = localStorage.getItem('cyberlibris_recom_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { ...this.defaultConfig };
  }

  saveConfig(cfg) {
    this.config = { ...this.config, ...cfg };
    localStorage.setItem('cyberlibris_recom_config', JSON.stringify(this.config));
  }

  resetConfig() {
    this.config = { ...this.defaultConfig };
    localStorage.removeItem('cyberlibris_recom_config');
  }

  // Расчёт релевантности книги для пользователя
  scoreBook(book, userProfile) {
    if (!book) return 0;
    let score = 50; // Базовый нейтральный скор

    const likes = (userProfile?.tasteProfile?.likes || ['военная проза', 'фантастика', 'классика', 'философия']).map(s => s.toLowerCase());
    const dislikes = (userProfile?.tasteProfile?.dislikes || []).map(s => s.toLowerCase());
    const bookTags = (book.tags || []).map(t => t.toLowerCase());
    const bookGenre = (book.genre || '').toLowerCase();

    // 1. Штраф за нелюбимые категории
    for (const dis of dislikes) {
      if (bookTags.includes(dis) || bookGenre.includes(dis)) {
        score -= this.config.dislikePenalty;
      }
    }

    // 2. Бонус за любимые категории
    for (const like of likes) {
      if (bookTags.includes(like) || bookGenre.includes(like)) {
        score += this.config.likeWeight;
      }
    }

    // 3. Бонус за статус Шедевра / Легендарности
    if (book.rarity === 'legendary') score += this.config.masterpieceBoost * 1.5;
    else if (book.rarity === 'masterpiece') score += this.config.masterpieceBoost;

    // 4. Бонус за рейтинг
    if (book.rating) {
      score += (book.rating - 4.5) * 20;
    }

    // 5. Небольшой фактор новизны
    score += Math.random() * this.config.noveltyFactor;

    return Math.round(score);
  }

  // Получить ранжированный список рекомендованных книг
  getRecommendations(books, userProfile, limit = 8) {
    if (!books || !books.length) return [];
    
    const scored = books.map(book => ({
      book,
      score: this.scoreBook(book, userProfile)
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map(item => item.book);
  }

  // Симуляция профиля для тестирования в админ-панели
  simulateProfile(archetype) {
    if (archetype === 'military') {
      return {
        username: 'Тестовый_Военкор',
        displayName: 'Капитан Стратегии',
        tasteProfile: {
          likes: ['военная проза', 'стратегия', 'история', 'лидерство'],
          dislikes: ['сентиментальное', 'сказки'],
          yearlyGoal: 30
        }
      };
    } else if (archetype === 'cyberpunk') {
      return {
        username: 'Тестовый_Киберпанк',
        displayName: 'Нейро-Хакер',
        tasteProfile: {
          likes: ['киберпанк', 'фантастика', 'матрица', 'будущее'],
          dislikes: ['древность', 'поэзия'],
          yearlyGoal: 50
        }
      };
    } else if (archetype === 'philosophy') {
      return {
        username: 'Тестовый_Мудрец',
        displayName: 'Старейшина Архива',
        tasteProfile: {
          likes: ['философия', 'классика', 'мудрость', 'психология'],
          dislikes: ['боевики', 'комиксы'],
          yearlyGoal: 20
        }
      };
    } else if (archetype === 'mystery') {
      return {
        username: 'Тестовый_Детектив',
        displayName: 'Инспектор Скотланд-Ярда',
        tasteProfile: {
          likes: ['детектив', 'логика', 'лондон', 'викторианство'],
          dislikes: ['фэнтези', 'космос'],
          yearlyGoal: 25
        }
      };
    }
    return null;
  }
}

window.recommendations = new RecommendationEngine();

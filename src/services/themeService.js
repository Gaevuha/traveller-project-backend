// src/services/themeService.js
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';

class ThemeService {
  /**
   * Зберегти тему для користувача
   */
  async saveUserTheme(userId, theme) {
    const user = await UsersCollection.findByIdAndUpdate(
      userId,
      { theme },
      { new: true, select: 'name avatarUrl theme' },
    );

    if (!user) {
      throw createHttpError(404, 'User not found');
    }

    return {
      _id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
      theme: user.theme,
    };
  }

  /**
   * Отримати тему користувача
   */
  async getUserTheme(userId) {
    const user = await UsersCollection.findById(userId).select('theme');
    return user ? user.theme : null;
  }

  /**
   * Отримати тему з різних джерел
   */
  async resolveTheme(userId, cookies, session) {
    let theme = 'light'; // Значення за замовчуванням

    // Спроба отримати з БД (якщо користувач авторизований)
    if (userId) {
      const userTheme = await this.getUserTheme(userId);
      if (userTheme) {
        theme = userTheme;
      }
    }

    // Перевірка кукі
    if (!theme && cookies?.theme) {
      theme = cookies.theme;
    }

    // Перевірка сесії
    if (!theme && session?.theme) {
      theme = session.theme;
    }

    // Валідація теми
    if (!['light', 'dark'].includes(theme)) {
      theme = 'light'; // Fallback
    }

    return theme;
  }
}

export default new ThemeService();

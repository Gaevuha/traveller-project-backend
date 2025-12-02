import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';

class ThemeService {
  /**
   * Зберегти тему для користувача
   */
  async saveUserTheme(userId, theme) {
    const user = await UsersCollection.findOneAndUpdate(
      { _id: userId },
      { $set: { theme: theme } },
      {
        new: true,
        runValidators: true,
        context: 'query',
        bypassDocumentValidation: false,
      },
    );

    if (!user) {
      throw createHttpError(404, `User ${userId} not found`);
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
    let theme = 'light';

    if (userId) {
      const userTheme = await this.getUserTheme(userId);
      if (userTheme) {
        theme = userTheme;
      }
    }

    if (!theme && cookies?.theme) {
      theme = cookies.theme;
    }

    if (!theme && session?.theme) {
      theme = session.theme;
    }

    if (!['light', 'dark'].includes(theme)) {
      theme = 'light';
    }

    return theme;
  }
}

export default new ThemeService();

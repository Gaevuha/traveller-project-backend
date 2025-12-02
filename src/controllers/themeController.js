// src/controllers/themeController.js
import createHttpError from 'http-errors';
import themeService from '../services/themeService.js';

/**
 * POST /api/theme - Зберегти тему (публічний маршрут)
 * @access Public
 */
export const saveThemeController = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user?._id; // Може бути undefined, якщо не авторизований

  // Валідація
  if (!theme || !['light', 'dark'].includes(theme)) {
    throw createHttpError(400, 'Theme must be "light" or "dark"');
  }

  // Якщо користувач авторизований - зберегти в БД
  let savedToDatabase = false;
  if (userId) {
    await themeService.saveUserTheme(userId, theme);
    savedToDatabase = true;
  }

  // Зберегти в сесії (якщо використовуєте сесії)
  if (req.session) {
    req.session.theme = theme;
  }

  // Встановити кукі
  res.cookie('theme', theme, {
    maxAge: 365 * 24 * 60 * 60 * 1000, // 1 рік
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    status: 200,
    message: savedToDatabase
      ? 'Theme saved to database and cookies'
      : 'Theme saved to cookies',
    data: {
      theme,
      savedToDatabase,
      userId: userId || null,
    },
  });
};

/**
 * POST /api/theme/private - Зберегти тему (приватний маршрут)
 * @access Private (тільки для авторизованих)
 */
export const saveThemePrivateController = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user._id; // Тут точно є, бо пройшов authenticate

  // Валідація
  if (!theme || !['light', 'dark'].includes(theme)) {
    throw createHttpError(400, 'Theme must be "light" or "dark"');
  }

  // Зберегти в БД
  const updatedUser = await themeService.saveUserTheme(userId, theme);

  // Зберегти в сесії (якщо використовуєте сесії)
  if (req.session) {
    req.session.theme = theme;
  }

  // Встановити кукі
  res.cookie('theme', theme, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  res.status(200).json({
    status: 200,
    message: 'Theme saved to database and cookies',
    data: {
      theme,
      savedToDatabase: true,
      userId,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        avatarUrl: updatedUser.avatarUrl,
      },
    },
  });
};

/**
 * GET /api/theme - Отримати поточну тему
 * @access Public
 */
export const getThemeController = async (req, res) => {
  const userId = req.user?._id; // Може бути undefined

  const theme = await themeService.resolveTheme(
    userId,
    req.cookies,
    req.session,
  );

  // Визначення джерела теми
  let source = 'default';
  if (userId) {
    source = 'database';
  } else if (req.cookies?.theme) {
    source = 'cookies';
  } else if (req.session?.theme) {
    source = 'session';
  }

  res.status(200).json({
    status: 200,
    message: 'Theme retrieved successfully',
    data: {
      theme,
      source,
      userId: userId || null,
    },
  });
};

/**
 * Middleware для встановлення теми в res.locals
 */
export const setThemeMiddleware = async (req, res, next) => {
  try {
    const userId = req.user?._id;

    const theme = await themeService.resolveTheme(
      userId,
      req.cookies,
      req.session,
    );

    // Додати тему до res.locals для використання в шаблонах
    res.locals.theme = theme;

    // Додати для API відповідей
    req.theme = theme;
  } catch (error) {
    console.error('ThemeMiddleware error:', error);
    res.locals.theme = 'light';
    req.theme = 'light';
  }

  next();
};

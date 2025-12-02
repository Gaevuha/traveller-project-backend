import createHttpError from 'http-errors';
import themeService from '../services/themeService.js';

/**
 * POST /api/theme - Зберегти тему (публічний маршрут)
 * @access Public
 */
export const saveThemeController = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user?._id;

  if (!theme || !['light', 'dark'].includes(theme)) {
    throw createHttpError(400, 'Theme must be "light" or "dark"');
  }

  let savedToDatabase = false;
  if (userId) {
    await themeService.saveUserTheme(userId, theme);
    savedToDatabase = true;
  }

  if (req.session) {
    req.session.theme = theme;
  }

  res.cookie('theme', theme, {
    maxAge: 365 * 24 * 60 * 60 * 1000,
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
  const userId = req.user._id;

  if (!theme || !['light', 'dark'].includes(theme)) {
    throw createHttpError(400, 'Theme must be "light" or "dark"');
  }

  const updatedUser = await themeService.saveUserTheme(userId, theme);

  if (req.session) {
    req.session.theme = theme;
  }

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
  try {
    const { UsersCollection } = await import('../db/models/user.js');
    const userId = req.user?._id;

    let theme = 'light';
    let source = 'default';

    if (userId) {
      const user = await UsersCollection.findById(userId).select('theme');
      if (user?.theme) {
        theme = user.theme;
        source = 'database';
      }
    }

    if (theme === 'light' && req.cookies?.theme) {
      const cookieTheme = req.cookies.theme;
      if (cookieTheme === 'light' || cookieTheme === 'dark') {
        theme = cookieTheme;
        source = 'cookies';
      }
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
  } catch (error) {
    console.error('getThemeController error:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};

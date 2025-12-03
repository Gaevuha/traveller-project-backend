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

  // Для авторизованих користувачів зберігаємо в базу
  if (userId) {
    await themeService.saveUserTheme(userId, theme);
    savedToDatabase = true;
    console.log(`Theme saved to database for user ${userId}: ${theme}`);
  }

  // Зберігаємо в сесії (якщо використовуєте сесії)
  if (req.session) {
    req.session.theme = theme;
  }

  // Встановлюємо cookie з темою
  res.cookie('theme', theme, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
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
      source: savedToDatabase ? 'database' : 'cookies',
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

  // Зберігаємо в базу даних
  const updatedUser = await themeService.saveUserTheme(userId, theme);

  // Зберігаємо в сесії (якщо використовуєте сесії)
  if (req.session) {
    req.session.theme = theme;
  }

  // Встановлюємо cookie з темою
  res.cookie('theme', theme, {
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
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
      source: 'database',
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
    let usedCookie = false;

    console.log('getThemeController called:', {
      userId,
      hasCookie: !!req.cookies?.theme,
      cookieValue: req.cookies?.theme,
    });

    // 1. Авторизовані користувачі - тема з бази даних (основне джерело)
    if (userId) {
      const user = await UsersCollection.findById(userId).select('theme');
      if (user?.theme) {
        theme = user.theme;
        source = 'database';
        console.log(`Theme from database for user ${userId}: ${theme}`);

        // Перевіряємо, чи cookie відрізняється від бази
        if (req.cookies?.theme && req.cookies.theme !== theme) {
          console.log(
            `Cookie mismatch: cookie=${req.cookies.theme}, database=${theme}`,
          );
          // Cookie буде оновлено нижче
        }
      } else {
        console.log(`No theme in database for user ${userId}`);
      }
    }

    // 2. Для неавторизованих або якщо не знайшли в базі - перевіряємо cookie
    if (theme === 'light' && req.cookies?.theme) {
      const cookieTheme = req.cookies.theme;
      if (cookieTheme === 'light' || cookieTheme === 'dark') {
        // Для авторизованих: cookie має нижчий пріоритет, але все одно повертаємо його
        // як fallback, якщо в базі немає теми
        if (!userId || source === 'default') {
          theme = cookieTheme;
          source = 'cookies';
          usedCookie = true;
          console.log(
            `Theme from cookies: ${theme} (userId: ${userId || 'unauth'})`,
          );
        }
      }
    }

    // 3. Встановлюємо/оновлюємо cookie з правильною темою
    // Це важливо для синхронізації між пристроями
    res.cookie('theme', theme, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      status: 200,
      message: 'Theme retrieved successfully',
      data: {
        theme,
        source,
        userId: userId || null,
        usedCookie,
        debug: {
          hadCookie: !!req.cookies?.theme,
          cookieValue: req.cookies?.theme,
          finalTheme: theme,
        },
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

/**
 * Middleware для синхронізації cookie з базою даних
 */
export const syncThemeCookieMiddleware = async (req, res, next) => {
  try {
    // Якщо користувач авторизований
    if (req.user?._id) {
      const { UsersCollection } = await import('../db/models/user.js');
      const user = await UsersCollection.findById(req.user._id).select('theme');

      if (user?.theme) {
        // Якщо cookie існує і відрізняється від бази
        if (req.cookies?.theme && req.cookies.theme !== user.theme) {
          console.log(
            `Syncing cookie: ${req.cookies.theme} -> ${user.theme} for user ${req.user._id}`,
          );

          // Оновлюємо cookie
          res.cookie('theme', user.theme, {
            maxAge: 30 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
          });

          // Додаємо інформацію до запиту для контролера
          req.cookieWasSynced = true;
          req.syncedTheme = user.theme;
        }
      }
    }
  } catch (error) {
    console.error('Error in syncThemeCookieMiddleware:', error);
    // Не блокуємо запит у разі помилки
  }

  next();
};

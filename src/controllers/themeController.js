import { UsersCollection } from '../db/models/user.js';

/**
 * POST /api/theme - Зберегти тему
 */
export const saveThemeController = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user?._id;

  if (!theme || !['light', 'dark'].includes(theme)) {
    return res.status(400).json({
      status: 400,
      message: 'Theme must be "light" or "dark"',
    });
  }

  if (!userId) {
    return res.status(401).json({
      status: 401,
      message: 'User not authenticated',
    });
  }

  try {
    // Оновлюємо тему в БД
    const updatedUser = await UsersCollection.findByIdAndUpdate(
      userId,
      { theme },
      {
        new: true,
        select: '-password',
        runValidators: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    // Встановлюємо cookie
    res.cookie('theme', theme, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res.status(200).json({
      status: 200,
      message: 'Theme saved successfully',
      data: {
        theme,
        savedToDatabase: true,
        userId,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          avatarUrl: updatedUser.avatarUrl,
          theme: updatedUser.theme,
        },
      },
    });
  } catch (error) {
    console.error('Помилка при збереженні теми:', error);
    return res.status(500).json({
      status: 500,
      message: 'Database error',
      error: error.message,
    });
  }
};

/**
 * GET /api/theme - Отримати поточну тему
 */
export const getThemeController = async (req, res) => {
  try {
    const userId = req.user?._id;
    let theme = 'light';
    let source = 'default';

    // 1. Спочатку перевіряємо авторизованого користувача в базі
    if (userId) {
      const user = await UsersCollection.findById(userId).select(
        'theme name email',
      );

      if (user?.theme) {
        theme = user.theme;
        source = 'database';
      }
    }

    // 2. Якщо не авторизований або в базі немає теми - перевіряємо cookie
    if (source === 'default' && req.cookies?.theme) {
      const cookieTheme = req.cookies.theme;
      if (cookieTheme === 'light' || cookieTheme === 'dark') {
        theme = cookieTheme;
        source = 'cookies';
      }
    }

    // 3. Оновлюємо cookie якщо потрібно
    if (userId && req.cookies?.theme !== theme) {
      res.cookie('theme', theme, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Theme retrieved successfully',
      data: {
        theme,
        source,
        userId: userId || null,
        hasAuth: !!userId,
      },
    });
  } catch (error) {
    console.error('Помилка при отриманні теми:', error);
    return res.status(200).json({
      status: 200,
      theme: 'light',
      source: 'default (error)',
    });
  }
};

/**
 * GET /api/theme/public - Отримати тему без автентифікації
 */
export const getThemePublicController = async (req, res) => {
  try {
    let theme = 'light';
    let source = 'default';

    if (req.cookies?.theme) {
      const cookieTheme = req.cookies.theme;
      if (cookieTheme === 'light' || cookieTheme === 'dark') {
        theme = cookieTheme;
        source = 'cookies';
      }
    }

    return res.status(200).json({
      status: 200,
      message: 'Theme retrieved (public)',
      data: {
        theme,
        source,
        userId: null,
      },
    });
  } catch (error) {
    console.error('Помилка отримання публічної теми:', error);
    return res.status(200).json({
      status: 200,
      theme: 'light',
      source: 'default',
    });
  }
};

/**
 * Middleware для синхронізації cookie з базою даних
 */
export const syncThemeCookieMiddleware = async (req, res, next) => {
  try {
    if (req.user?._id) {
      const user = await UsersCollection.findById(req.user._id).select(
        'theme name',
      );

      if (
        user?.theme &&
        req.cookies?.theme &&
        req.cookies.theme !== user.theme
      ) {
        res.cookie('theme', user.theme, {
          maxAge: 30 * 24 * 60 * 60 * 1000,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
        });

        req.cookieWasSynced = true;
        req.syncedTheme = user.theme;
      }
    }
  } catch (error) {
    console.error('Помилка синхронізації cookie:', error);
  }

  next();
};

// Аліас для зворотної сумісності
export const saveThemePrivateController = saveThemeController;

import { UsersCollection } from '../db/models/user.js';

/**
 * POST /api/theme - Зберегти тему в БД
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

  // Тільки для авторизованих користувачів
  if (!userId) {
    // Встановлюємо cookie для гостя
    res.cookie('theme', theme, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      message: 'Theme saved locally (guest)',
      data: { theme, savedInDB: false },
    });
  }

  try {
    const updatedUser = await UsersCollection.findByIdAndUpdate(
      userId,
      { $set: { theme } },
      {
        new: true,
        select: '-password',
        runValidators: true,
        lean: true,
      },
    );

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: 'User not found',
      });
    }

    // Оновлюємо cookie
    res.cookie('theme', theme, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      message: 'Theme saved successfully',
      data: {
        theme,
        savedInDB: true,
        userId: updatedUser._id.toString(),
      },
    });
  } catch (error) {
    console.error('Theme save error:', error.message);

    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 400,
        message: 'Invalid user ID format',
        error: error.message,
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Database error',
      error: error.message,
    });
  }
};

/**
 * GET /api/theme - Отримати тему з БД
 */
export const getThemeController = async (req, res) => {
  try {
    const userId = req.user?._id;

    // За замовчуванням - світла тема
    let theme = 'light';
    let source = 'default';

    // Тільки для авторизованих користувачів
    if (userId) {
      const user = await UsersCollection.findById(userId)
        .select('theme')
        .lean();

      if (user?.theme) {
        theme = user.theme;
        source = 'database';
      }
    } else {
      // Для гостя - перевірити cookie
      const cookieTheme = req.cookies?.theme;
      if (cookieTheme && (cookieTheme === 'light' || cookieTheme === 'dark')) {
        theme = cookieTheme;
        source = 'cookie';
      }
    }

    return res.status(200).json({
      status: 200,
      message: 'Theme retrieved',
      data: {
        theme,
        source,
        userId: userId ? userId.toString() : null,
      },
    });
  } catch (error) {
    console.error('Theme get error:', error);

    // Fallback до cookie або default
    const cookieTheme = req.cookies?.theme;
    const fallbackTheme =
      cookieTheme && (cookieTheme === 'light' || cookieTheme === 'dark')
        ? cookieTheme
        : 'light';

    return res.status(200).json({
      status: 200,
      message: 'Theme retrieved (fallback)',
      data: {
        theme: fallbackTheme,
        source: 'fallback',
        userId: null,
      },
    });
  }
};

import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  saveThemeController,
  getThemeController,
  getThemePublicController,
  syncThemeCookieMiddleware,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/authenticate.js';
import { UsersCollection } from '../db/models/user.js';

const router = express.Router();

// Зберегти тему (тільки для авторизованих)
router.post('/', authenticate, ctrlWrapper(saveThemeController));

// Отримати тему для авторизованих користувачів (з синхронізацією)
router.get(
  '/',
  authenticate,
  syncThemeCookieMiddleware,
  ctrlWrapper(getThemeController),
);

// Отримати тему для неавторизованих користувачів
router.get('/public', ctrlWrapper(getThemePublicController));

// Маршрут для перевірки автентифікації
router.get('/check-auth', authenticate, (req, res) => {
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
    cookies: req.cookies,
  });
});

// Маршрут для перевірки поточного користувача
router.get('/debug-current', authenticate, async (req, res) => {
  try {
    const userId = req.user?._id;
    const userFromDB = await UsersCollection.findById(userId).select(
      'name email theme updatedAt createdAt',
    );

    if (!userFromDB) {
      return res.status(404).json({
        authenticated: true,
        error: 'User not found in DB',
        userId,
      });
    }

    res.json({
      authenticated: true,
      userId,
      userFromRequest: req.user,
      userFromDatabase: {
        _id: userFromDB._id,
        name: userFromDB.name,
        email: userFromDB.email,
        theme: userFromDB.theme,
        updatedAt: userFromDB.updatedAt,
        createdAt: userFromDB.createdAt,
      },
      comparison: {
        themeMatches: req.user.theme === userFromDB.theme,
        userMatches: req.user._id.toString() === userFromDB._id.toString(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Тестовий маршрут для перевірки БД
router.get('/debug-db/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const userFromDB = await UsersCollection.findById(userId).select(
      'name email theme updatedAt createdAt',
    );

    if (!userFromDB) {
      return res.status(404).json({
        error: 'User not found in database',
        userId,
      });
    }

    res.json({
      success: true,
      userId,
      userFound: true,
      data: {
        _id: userFromDB._id,
        name: userFromDB.name,
        email: userFromDB.email,
        theme: userFromDB.theme,
        updatedAt: userFromDB.updatedAt,
        createdAt: userFromDB.createdAt,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

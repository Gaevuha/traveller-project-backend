import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  saveThemeController,
  getThemeController,
  saveThemePrivateController,
  syncThemeCookieMiddleware,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Публічний маршрут для збереження теми (для неавторизованих)
router.post('/', ctrlWrapper(saveThemeController));

// Приватний маршрут для збереження теми (для авторизованих)
router.post('/private', authenticate, ctrlWrapper(saveThemePrivateController));

// Маршрут для отримання теми з синхронізацією cookie
router.get(
  '/',
  authenticate,
  syncThemeCookieMiddleware,
  ctrlWrapper(getThemeController),
);

export default router;

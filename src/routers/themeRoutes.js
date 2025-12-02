import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  saveThemeController,
  getThemeController,
  saveThemePrivateController,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

// Публічний маршрут
router.post('/', ctrlWrapper(saveThemeController));

// Приватний маршрут
router.post('/private', authenticate, ctrlWrapper(saveThemePrivateController));

// Отримання теми
router.get('/', ctrlWrapper(getThemeController));

export default router;

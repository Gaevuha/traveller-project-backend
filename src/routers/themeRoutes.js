import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  saveThemeController,
  getThemeController,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', authenticate, ctrlWrapper(saveThemeController));

router.get('/', authenticate, ctrlWrapper(getThemeController));

export default router;

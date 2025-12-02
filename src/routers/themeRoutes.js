import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import {
  saveThemeController,
  getThemeController,
  saveThemePrivateController,
} from '../controllers/themeController.js';
import { authenticate } from '../middlewares/authenticate.js';

const router = express.Router();

router.post('/', ctrlWrapper(saveThemeController));

router.post('/private', authenticate, ctrlWrapper(saveThemePrivateController));

router.get('/', authenticate, ctrlWrapper(getThemeController));

export default router;

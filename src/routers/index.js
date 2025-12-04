import { Router } from 'express';
import themeRoutes from './themeRoutes.js';
import authRouter from './auth.js';
import stories from './stories.js';
import users from './users.js';
import categories from './categories.js';

const router = Router();

// Підключаємо /theme
router.use('/theme', themeRoutes);

router.use('/auth', authRouter);
router.use('/stories', stories);
router.use('/users', users);
router.use('/categories', categories);
export default router;

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { uploadAvatar } from '../middlewares/uploadAvatar.js';
import {
  getAllUsersController,
  deleteMeSavedStoriesController,
  getMeProfileController,
  getUsersByIdController,
  patchMeAvatarController,
  patchMeController,
  addSavedArticleController,
  getUsersSavedArticlesController,
  getMeSavedArticlesController,
  getMeController,
} from '../controllers/users.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { UpdateUserSchema } from '../validation/user.js';

const router = Router();

//Приватні
router.get('/me', authenticate, ctrlWrapper(getMeController));
router.get('/me/profile', authenticate, ctrlWrapper(getMeProfileController));
router.get(
  '/me/saved-articles',
  authenticate,
  ctrlWrapper(getMeSavedArticlesController),
);
router.post(
  '/me/saved/:storyId',
  authenticate,
  ctrlWrapper(addSavedArticleController),
); // створити приватний ендпоінт для додавання статті до збережених статей користувача
router.delete(
  '/me/saved/:storyId',
  authenticate,
  ctrlWrapper(deleteMeSavedStoriesController),
); // створити приватний ендпоінт для видалення статті зі збережених статей користувача
router.patch(
  '/me/avatar',
  authenticate,
  uploadAvatar,
  ctrlWrapper(patchMeAvatarController),
); // створити приватний ендпоінт для оновлення аватару корситувача
router.patch(
  '/me',
  authenticate,
  uploadAvatar,
  validateBody(UpdateUserSchema),
  ctrlWrapper(patchMeController),
); //створити приватний ендпоінт для оновлення даних користувача

//публічні
router.get('/', ctrlWrapper(getAllUsersController));
router.get('/:userId', ctrlWrapper(getUsersByIdController));
router.get(
  '/:userId/saved-articles',
  ctrlWrapper(getUsersSavedArticlesController),
);
export default router;

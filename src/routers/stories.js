import { Router } from 'express';
import { ctrlWrapper } from "../utils/ctrlWrapper.js";
import { createStoryController, getAllStoriesController, patchStoryController } from '../controllers/stories.js';
import { deleteMeSavedStoriesController } from '../controllers/users.js';

const router = Router();

//публічний
router.get('/', ctrlWrapper(getAllStoriesController)); //створити публічний ендпоінт для ОТРИМАННЯ історій + пагінація + фільтрація за категоріями

//приватний
router.post('/', ctrlWrapper(createStoryController)); //створити приватний ендпоінт для СТВОРЕННЯ історії
router.patch('/:id', ctrlWrapper(patchStoryController)); //створити приватний ендпоінт для РЕДАГУВАННЯ історії

router.delete('saved-stories/:storyId', /*authenticate middleware*/ ctrlWrapper(deleteMeSavedStoriesController)) //роутер для удаления истории


export default router;

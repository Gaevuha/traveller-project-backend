import { Router } from 'express';
import { getAllUsersController } from '../controllers/users.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

router.get('/', ctrlWrapper(getAllUsersController));

export default router;

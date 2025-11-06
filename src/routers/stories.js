import { Router } from 'express';

const router = Router();

//публічний
// router.get('/'); //створити публічний ендпоінт для ОТРИМАННЯ історій + пагінація + фільтрація за категоріями

//приватний
// router.post('/'); //створити приватний ендпоінт для СТВОРЕННЯ історії
// router.patch('/:id'); //створити приватний ендпоінт для РЕДАГУВАННЯ історії

router.get('/', (req, res) => {
  res.json({ message: 'Stories route is working' });
});

export default router;

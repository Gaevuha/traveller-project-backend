import { UsersCollection } from '../db/models/user.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllUsers = async ({ page = 1, perPage = 12 }) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  // Підрахунок кількості користувачів
  const usersCount = await UsersCollection.countDocuments();

  // Отримуємо користувачів без пароля
  const users = await UsersCollection.find({}, '-password')
    .skip(skip)
    .limit(limit)
    .lean();

  // Формуємо дані пагінації
  const paginationData = calculatePaginationData(usersCount, perPage, page);

  return {
    data: users,
    ...paginationData,
  };
};

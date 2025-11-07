import { UsersCollection } from '../db/models/user.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getAllUsers = async ({ page = 1, perPage = 12 }) => {
  const limit = perPage;
  const skip = (page - 1) * perPage;

  try {
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
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

export async function updateMe(userId, payload, options = {}) {
  return UsersCollection.findOneAndUpdate(
    { _id: userId },
    { $set: payload },
    {
      new: true,
      runValidators: true,
      projection: '_id name description avatarUrl articlesAmount createdAt',
      lean: true,
      ...options,
    },
  );
}

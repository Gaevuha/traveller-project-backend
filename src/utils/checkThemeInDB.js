// utils/checkThemeInDB.js
import { UsersCollection } from '../db/models/user.js';

export async function checkUserThemeInDB(userId) {
  try {
    // Перевіряємо напряму в колекції
    const user = await UsersCollection.findById(userId).select(
      'name email theme updatedAt createdAt',
    );

    if (!user) {
      console.log('Користувача не знайдено в БД');
      return null;
    }

    return user;
  } catch (error) {
    console.error('ПОМИЛКА ПЕРЕВІРКИ БАЗИ:');
    console.error(error.message);
    return null;
  }
}

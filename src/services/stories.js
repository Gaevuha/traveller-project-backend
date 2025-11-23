import { TravellersCollection } from '../db/models/traveller.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import mongoose from 'mongoose';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { UsersCollection } from '../db/models/user.js';

// GET ALL STORIES (PUBLIC)
export const getAllStories = async (query) => {
  const { page, perPage } = parsePaginationParams(query);
  const filter = parseFilterParams(query);
  const skip = (page - 1) * perPage;

  if (query.excludeId && mongoose.isValidObjectId(query.excludeId)) {
    filter._id = { $ne: new mongoose.Types.ObjectId(query.excludeId) };
  }

  const [stories, total] = await Promise.all([
    TravellersCollection.find(filter)
      .populate('category', 'name')
      .populate('ownerId')
      .sort({ favoriteCount: -1, date: -1 })
      .skip(skip)
      .limit(perPage),
    TravellersCollection.countDocuments(filter),
  ]);

  return {
    page,
    perPage,
    total,
    totalPages: Math.ceil(total / perPage),
    data: stories,
  };
};

// GET STRY BY ID (PUBKIC)
export const getStoryById = async (storyId) => {
  const story = await TravellersCollection.findById(storyId)
    .populate('category', '_id name')
    .populate('ownerId', '_id name avatarUrl description')
    .lean();
  return story;
};

// POST STORIE (PRIVATE)
export const addStory = async (payload, userId, photo) => {
  let photoUrl = payload?.img || null;
  if (photo) photoUrl = await saveFileToCloudinary(photo);

  const story = await TravellersCollection.create({
    ...payload,
    img: photoUrl,
    ownerId: userId,
    date: new Date(),
  });

  await UsersCollection.updateOne(
    { _id: userId },
    { $inc: { articlesAmount: 1 } },
  );

  return story;
};

// PATCH UPDATE STORY
export async function updateStoryById(
  storyId,
  ownerId,
  payload,
  storyImageFile,
  options = {},
) {
  const updateData = { ...payload };

  if (storyImageFile) {
    const photoUrl = await saveFileToCloudinary(storyImageFile);
    updateData.img = photoUrl;
  }

  const storyObjectId = new mongoose.Types.ObjectId(storyId);
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const rawResult = await TravellersCollection.findOneAndUpdate(
    { _id: storyObjectId, ownerId: ownerObjectId },
    updateData,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return rawResult.value;
}

// DELETE STORY (PRIVATE)
export const deleteStoryService = async (storyId, userId) => {
  // 1. Знаходимо історію
  const story = await TravellersCollection.findById(storyId); // Використовуємо TravellersCollection

  if (!story) {
    const error = new Error('Story not found');
    error.status = 404;
    throw error;
  }

  // 2. Перевіряємо, чи користувач є власником історії
  if (story.ownerId.toString() !== userId.toString()) {
    const error = new Error('Not authorized to delete this story');
    error.status = 403;
    throw error;
  }

  // 3. Видаляємо історію з бази даних
  await TravellersCollection.findByIdAndDelete(storyId); // Використовуємо TravellersCollection

  // 4. Видаляємо історію зі збережених у всіх користувачів
  await UsersCollection.updateMany(
    // Використовуємо UsersCollection
    { savedStories: storyId },
    { $pull: { savedStories: storyId } },
  );

  // 5. Зменшуємо лічильник статей у власника
  await UsersCollection.findByIdAndUpdate(userId, {
    // Використовуємо UsersCollection
    $inc: { articlesAmount: -1 },
  });

  return {
    deletedStoryId: storyId,
    title: story.title,
  };
};

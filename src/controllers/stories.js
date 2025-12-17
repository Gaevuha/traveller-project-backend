import updateStorySchema from '../validation/traveller.js';
import {
  getAllStories,
  updateStoryById,
  addStory,
  getStoryById,
  deleteStoryService,
} from '../services/stories.js';

import { checkCategoryExists } from '../services/categories.js';
import createHttpError from 'http-errors';
import fs from 'node:fs/promises';

import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

// GET ALL STORIES (PUBLIC)
export const getAllStoriesController = async (req, res) => {
  const result = await getAllStories(req.query);

  res.json({
    status: 200,
    message: 'Successfully found stories!',
    ...result,
  });
};

// GET STORY BY ID
export const getStoriesByIdController = async (req, res) => {
  const { storyId } = req.params;

  const story = await getStoryById(storyId);
  if (!story) {
    throw createHttpError(404, 'Story not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found story!`,
    data: story,
  });
};

// POST STORIE (PRIVATE)
export const createStoryController = async (req, res) => {
  const { _id: userId } = req.user;
  const img = req.file || null;

  const storyRawData = req.body;

  function sortCategories(categoryName) {
    if (categoryName === 'Азія') return '68fb50c80ae91338641121f0';
    if (categoryName === 'Гори') return '68fb50c80ae91338641121f1';
    if (categoryName === 'Європа') return '68fb50c80ae91338641121f2';
    if (categoryName === 'Америка') return '68fb50c80ae91338641121f3';
    if (categoryName === 'Африка') return '68fb50c80ae91338641121f4';
    if (categoryName === 'Пустелі') return '68fb50c80ae91338641121f6';
    if (categoryName === 'Балкани') return '68fb50c80ae91338641121f7';
    if (categoryName === 'Кавказ') return '68fb50c80ae91338641121f8';
    if (categoryName === 'Океанія') return '68fb50c80ae91338641121f9';
  }

  const category = sortCategories(req.body.category);
  storyRawData.category = category;

  const story = await addStory(storyRawData, userId, img);

  res.status(201).json({
    status: 201,
    message: 'Story created successfully',
    data: story,
  });
};

// PATCH UPDATE STORY
export const patchStoryController = async (req, res, next) => {
  try {
    const { storyId } = req.params;
    const ownerId = req.user._id;

    const storyImageFile = req.file; // multer додає req.file
    const updateFields = { ...req.body }; // текстові поля

    // Якщо є файл img — видаляємо його з body, щоб Joi не ругався
    if (storyImageFile) delete updateFields.img;

    // Конвертація category, якщо передано як назву
    if (updateFields.category) {
      const categoryMap = {
        Азія: '68fb50c80ae91338641121f0',
        Гори: '68fb50c80ae91338641121f1',
        Європа: '68fb50c80ae91338641121f2',
        Америка: '68fb50c80ae91338641121f3',
        Африка: '68fb50c80ae91338641121f4',
        Пустелі: '68fb50c80ae91338641121f6',
        Балкани: '68fb50c80ae91338641121f7',
        Кавказ: '68fb50c80ae91338641121f8',
        Океанія: '68fb50c80ae91338641121f9',
      };
      updateFields.category =
        categoryMap[updateFields.category] || updateFields.category;
    }

    // Валідація текстових полів через Joi
    if (Object.keys(updateFields).length > 0) {
      const { error } = updateStorySchema.validate(updateFields);
      if (error) {
        if (storyImageFile) await fs.unlink(storyImageFile.path);
        return next(createHttpError(400, error.details[0].message));
      }

      // Перевірка category ID
      if (updateFields.category) {
        const exists = await checkCategoryExists(updateFields.category);
        if (!exists) {
          if (storyImageFile) await fs.unlink(storyImageFile.path);
          return next(
            createHttpError(
              400,
              `Category with ID ${updateFields.category} not found`,
            ),
          );
        }
      }
    }

    // Завантаження файлу img на Cloudinary
    if (storyImageFile) {
      const photoUrl = await saveFileToCloudinary(storyImageFile);
      updateFields.img = photoUrl;
    }

    const updatedStory = await updateStoryById(storyId, ownerId, updateFields);

    if (!updatedStory) {
      return next(
        createHttpError(
          404,
          'The story cannot be found or you are not its author',
        ),
      );
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated the story!',
      data: updatedStory,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStoryController = async (req, res) => {
  const { storyId } = req.params;
  const userId = req.user._id; // з middleware authenticate

  const result = await deleteStoryService(storyId, userId);

  res.status(200).json({
    status: 200,
    message: 'Story successfully deleted',
    data: result,
  });
};

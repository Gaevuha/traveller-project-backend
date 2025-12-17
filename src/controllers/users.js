import createHttpError from 'http-errors';
import {
  getAllUsers,
  getUserById,
  updateUserAvatar,
  updateMe,
  addArticleToSaved,
  getMeProfile,
  getUserSavedArticles,
} from '../services/users.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
// import { deleteSavedStory } from '../services/users.js';
import { uploadImageToCloudinary } from '../services/cloudinary.js';
import { UsersCollection } from '../db/models/user.js';
import { TravellersCollection } from '../db/models/traveller.js';

// GET ALL USERS (PUBLIC)
export const getAllUsersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);

  const {
    data: users,
    page: _page,
    perPage: _perPage,
    totalItems,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  } = await getAllUsers({ page, perPage });

  res.status(200).json({
    status: 200,
    message: 'Successfully found users!',
    data: {
      users,
      page: _page,
      perPage: _perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

// GET USER BY ID (PUBLIC)
export const getUsersByIdController = async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const { user, articles } = await getUserById(userId, page, perPage);

    return res.status(200).json({
      status: 200,
      message: 'Successfully found user by id!',
      data: { user, articles },
    });
  } catch (err) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const payload = err.data ?? null;
    return res.status(status).json({ status, message, data: payload });
  }
};

//GET USER BY ID + SAVED ARTICLES
export const getUsersSavedArticlesController = async (req, res) => {
  const userId = req.params.userId;

  const { user } = await getUserSavedArticles(userId);

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const { _id, name, avatarUrl, description, createdAt, savedStories } =
    user.toObject();

  res.status(200).json({
    status: 200,
    message: 'Successfully found user by id and saved stories!',
    data: {
      user: {
        _id,
        name,
        avatarUrl,
        description,
        createdAt,
      },
      savedStories,
    },
  });
};

// GET USER (PRIVATE)
export const getMeProfileController = async (req, res) => {
  const userId = req.user._id;
  const user = await getMeProfile(userId);

  res.status(200).json({
    status: 200,
    message: `Successfully found the user with id: ${userId}`,
    data: user,
  });
};

// GET USER + SAVED ARTICLES (PRIVATE)
export const getMeSavedArticlesController = async (req, res) => {
  const userId = req.user._id;

  const { user } = await getUserSavedArticles(userId);

  if (!user) {
    return res.status(404).json({
      status: 404,
      message: 'User not found',
      data: null,
    });
  }

  const savedStories = user.savedStories || [];

  return res.status(200).json({
    status: 200,
    message: 'Successfully found saved stories for current user',
    data: {
      user: {
        _id: user._id,
        name: user.name,
        avatarUrl: user.avatarUrl,
        description: user.description,
        createdAt: user.createdAt,
      },
      savedStories,
    },
  });
};

// POST ARTICLE BY ID (PRIVATE)
export const addSavedArticleController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    const { created } = await addArticleToSaved(userId, storyId);
    const status = created ? 201 : 200;

    const user = await UsersCollection.findById(userId)
      .select('+savedStories')
      .lean();

    return res.status(status).json({
      status,
      message: created ? 'Story saved' : 'Story alrady in saved',
      data: { user: { savedStories: (user.savedStories || []).map(String) } },
    });
  } catch (err) {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    const payload = err.data ?? null;

    return res.status(status).json({ status, message, data: payload });
  }
};

// DELETE ARTICLE BY ID (PRIVATE)
export const deleteMeSavedStoriesController = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { storyId } = req.params;

    if (!userId)
      return res.status(401).json({ status: 401, message: 'Unauthorized' });
    if (!storyId)
      return res
        .status(400)
        .json({ status: 400, message: 'storyId is required' });

    const user = await UsersCollection.findById(userId).select('+savedStories');
    if (!user)
      return res.status(404).json({ status: 404, message: 'User not found' });

    const index = user.savedStories.findIndex(
      (id) => id.toString() === storyId,
    );
    if (index === -1)
      return res.status(200).json({
        status: 200,
        message: 'Story was not in saved',
        data: { savedStories: user.savedStories.map(String) },
      });

    // Видаляємо історію зі збережених
    user.savedStories.splice(index, 1);
    user.savedAmount = Math.max((user.savedAmount ?? 0) - 1, 0);

    await user.save();

    // Зменшуємо favoriteCount у Traveller
    await TravellersCollection.updateOne(
      { _id: storyId, favoriteCount: { $gt: 0 } },
      { $inc: { favoriteCount: -1 } },
    );

    return res.status(200).json({
      status: 200,
      message: 'Story removed from saved',
      data: { savedStories: user.savedStories.map(String) },
    });
  } catch (err) {
    console.error('🔥 DELETE SAVED STORY ERROR', err);
    return res
      .status(500)
      .json({ status: 500, message: 'Internal server error' });
  }
};

//PATCH AVATAR (PRIVATE)
export const patchMeAvatarController = async (req, res) => {
  const { user } = req;

  if (!user || !user._id) {
    return res.status(401).json({
      status: 401,
      message: 'Unauthorized',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      status: 400,
      message: 'Avatar file is required',
    });
  }

  const avatarUrl = await uploadImageToCloudinary(req.file);

  const updatedUser = await updateUserAvatar(user._id, avatarUrl);

  res.status(200).json({
    status: 200,
    message: 'Successfully updated avatar!',
    data: {
      avatarUrl: updatedUser.avatarUrl,
    },
  });
};

//PATCH ME (PRIVATE)
export const patchMeController = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const update = { ...req.body };

    // Перевірка, що хоча б одне поле або файл надано
    const hasTextFields = Object.keys(update).length > 0;
    const hasFile = !!req.file;

    if (!hasTextFields && !hasFile) {
      return next(
        createHttpError(
          400,
          'At least one field (name, description) or file (avatar) must be provided',
        ),
      );
    }

    // Завантаження аватару, якщо надано
    if (req.file) {
      try {
        const avatarUrl = await uploadImageToCloudinary(req.file);
        update.avatarUrl = avatarUrl;
      } catch (error) {
        return next(
          createHttpError(500, 'Failed to upload avatar image', {
            details: error.message,
          }),
        );
      }
    }

    const updatedUser = await updateMe(userId, update);

    if (!updatedUser) {
      return next(createHttpError(404, 'User not found'));
    }

    res.json({
      status: 200,
      message: 'Successfully updated profile!',
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMeController = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      status: 401,
      message: 'Not authenticated',
    });
  }

  try {
    // Повертаємо базову інформацію про користувача
    const userResponse = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      avatarUrl: req.user.avatarUrl,
      articlesAmount: req.user.articlesAmount || 0,
      description: req.user.description || '',
      theme: req.user.theme || 'light', // Додайте це поле!
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
    };

    res.status(200).json({
      status: 200,
      data: userResponse,
    });
  } catch (error) {
    console.error('❌ getMeController error:', error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
};

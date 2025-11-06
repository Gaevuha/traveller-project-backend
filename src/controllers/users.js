import * as usersService from '../services/users.js';
import { getAllUsers, getUserById } from '../services/users.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';

export const getAllUsersController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);

  const users = await getAllUsers({
    page,
    perPage,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully found users!',
    data: users,
  });
};

export const getUsersByIdController = async (req, res) => {
  const { userId } = req.params;
  const data = await getUserById(userId);
  res.status(200).json({
    status: 200,
    message: `Successfully found users with id!`,
    data,
  });
};

export const getMeProfileController = async (req, res) => {
  res.status(200).json({
    status: 200,
    message: ``,
  });
};

export const createMeSavedStoriesController = async (req, res) => {
  res.status(201).json({
    status: 201,
    message: 'Successfully created a story!',
  });
};

export const deleteMeSavedStoriesController = async (req, res) => {
  res.status(204).send();
};

export const patchMeAvatarController = async (req, res) => {
  res.json({
    status: 200,
    message: `Successfully patched a avatar!`,
  });
};

export const patchMeController = async (req, res) => {
  res.json({
    status: 200,
    message: `Successfully patched my profile!`,
  });
};

export const addSavedArticle = async (req, res) => {
  try {
    const userId = req.user._id; // з authMiddleware
    const { articleId } = req.body;

    if (!articleId) {
      return res.status(400).json({ message: 'articleId is required' });
    }

    const savedArticles = await usersService.addArticleToSaved(
      userId,
      articleId,
    );

    res.status(200).json({
      message: 'Article added to saved list',
      savedArticles,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

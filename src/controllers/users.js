import createHttpError from 'http-errors';
import { getAllUsers, updateMe } from '../services/users.js';
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
  res.status(200).json({
    status: 200,
    message: `Successfully found users with id!`,
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

export const patchMeController = async (req, res, next) => {
  const userId = req.user?._id || req.user?.id;
  const user = await updateMe(userId, req.body);

  if (!user) {
    return next(createHttpError(404, 'User not found'));
  }

  res.json({
    status: 200,
    message: `Successfully patched my profile!`,
    data: user,
  });
};

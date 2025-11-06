

import { getAllUsers, getUserById, updateUserAvatar} from '../services/users.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { uploadImageToCloudinary } from '../services/cloudinary.js';

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
  const user = req.user;
  res.status(200).json({
    status: 200,
    message: `Successfully found the user with id: ${user.userId}`,
    data: user,
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

  // Завантажуємо зображення в Cloudinary
  const avatarUrl = await uploadImageToCloudinary(req.file);

  // Оновлюємо аватар користувача в БД
  const updatedUser = await updateUserAvatar(user._id, avatarUrl);

  res.status(200).json({
    status: 200,
    message: 'Successfully updated avatar!',
    data: {
      avatarUrl: updatedUser.avatarUrl,
    },

  });
};

export const patchMeController = async (req, res) => {
  res.json({
    status: 200,
    message: `Successfully patched my profile!`,
  });
};

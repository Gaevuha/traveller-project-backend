
import { getAllUsers } from '../services/users.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { deleteSavedStory } from '../services/users.js';

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
  try {
    const userId = req.user._id;
    const { storyId } = req.params;

    const updatedUser = await deleteSavedStory(userId, storyId);

    if (!updatedUser) {
      return res.status(404).json({
        status: 404,
        message: 'User or saved story not found',
      });
    }

    return res.status(200).json({
      status: 200,
      message: 'Successfully deleted saved story!',
      data: updatedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: 'Internal server error',
    });
  }
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
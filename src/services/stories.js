import mongoose from 'mongoose';
import Story from '../db/models/story.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

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
    updateData.storyImage = photoUrl;
  }

  const storyObjectId = new mongoose.Types.ObjectId(storyId);
  const ownerObjectId = new mongoose.Types.ObjectId(ownerId);

  const rawResult = await Story.findOneAndUpdate(
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

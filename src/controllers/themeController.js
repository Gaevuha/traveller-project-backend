import { UsersCollection } from '../db/models/user.js';

export const saveThemeController = async (req, res) => {
  const { theme } = req.body;
  const userId = req.user?._id;

  if (!['light', 'dark'].includes(theme)) {
    return res.status(400).json({ message: 'Theme must be "light" or "dark"' });
  }

  if (!userId) {
    res.cookie('theme', theme, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
    });
    return res
      .status(200)
      .json({ message: 'Theme saved locally (guest)', theme });
  }

  try {
    const user = await UsersCollection.findByIdAndUpdate(
      userId,
      { theme },
      { new: true },
    ).lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.cookie('theme', theme, {
      maxAge: 30 * 24 * 60 * 60 * 1000,
      httpOnly: false,
      sameSite: 'lax',
    });
    return res.status(200).json({ message: 'Theme saved', theme });
  } catch (error) {
    console.error('Theme save error:', error);
    return res
      .status(500)
      .json({ message: 'Database error', error: error.message });
  }
};

export const getThemeController = async (req, res) => {
  try {
    const userId = req.user?._id;
    let theme = 'light';

    if (userId) {
      const user = await UsersCollection.findById(userId)
        .select('theme')
        .lean();
      if (user?.theme) theme = user.theme;
    } else if (req.cookies?.theme) {
      theme = req.cookies.theme;
    }

    return res.status(200).json({ theme });
  } catch (error) {
    console.error('Theme get error:', error);
    return res
      .status(500)
      .json({ message: 'Database error', error: error.message });
  }
};

const express = require('express');
const User = require('../models/User');
const Message = require('../models/Message'); // Import the Message model
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with their last message
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // 1. Find all users except the current one
    const users = await User.find({ _id: { $ne: loggedInUserId } }).lean(); // Use .lean() for plain JS objects

    // 2. For each user, find the last message exchanged with the logged-in user
    const usersWithLastMessage = await Promise.all(
      users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { sender: loggedInUserId, recipient: user._id },
            { sender: user._id, recipient: loggedInUserId },
          ],
        }).sort({ createdAt: -1 }); // Get the most recent message

        return {
          ...user,
          lastMessage: lastMessage ? { content: lastMessage.content, createdAt: lastMessage.createdAt } : null,
        };
      })
    );

    res.json(usersWithLastMessage);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
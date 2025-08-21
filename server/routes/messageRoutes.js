const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Message = require('../models/Message');

const router = express.Router();

// @route   GET /api/messages/:otherUserId
// @desc    Get all messages between logged-in user and another user
// @access  Protected
router.get('/:otherUserId', protect, async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: loggedInUserId, recipient: otherUserId },
        { sender: otherUserId, recipient: loggedInUserId },
      ],
    }).sort({ createdAt: 'asc' }); // Sort by oldest first

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
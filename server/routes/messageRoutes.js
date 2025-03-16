const express = require('express');
const router = express.Router();
const {
  getConversations,
  getConversation,
  sendMessage,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getConversations).post(protect, sendMessage);
router.get('/unread', protect, getUnreadCount);
router.get('/:userId/:listingId', protect, getConversation);

module.exports = router; 
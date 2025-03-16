const asyncHandler = require('express-async-handler');
const Message = require('../models/messageModel');
const Listing = require('../models/listingModel');

// @desc    Get all conversations for a user
// @route   GET /api/messages
// @access  Private
const getConversations = asyncHandler(async (req, res) => {
  // Find all messages where the user is either sender or recipient
  const messages = await Message.find({
    $or: [{ sender: req.user._id }, { recipient: req.user._id }],
  })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .populate('listing', 'title imageFilename')
    .sort({ createdAt: -1 });

  // Group messages by conversation (unique combination of other user and listing)
  const conversations = [];
  const conversationMap = new Map();

  messages.forEach((message) => {
    const otherUser =
      message.sender._id.toString() === req.user._id.toString()
        ? message.recipient
        : message.sender;
    
    const key = `${otherUser._id}-${message.listing._id}`;
    
    if (!conversationMap.has(key)) {
      // Count unread messages in this conversation
      const unreadCount = messages.filter(
        (m) =>
          m.recipient._id.toString() === req.user._id.toString() &&
          m.sender._id.toString() === otherUser._id.toString() &&
          m.listing._id.toString() === message.listing._id.toString() &&
          !m.read
      ).length;

      conversationMap.set(key, true);
      conversations.push({
        otherUser,
        listing: message.listing,
        latestMessage: message,
        unreadCount,
      });
    }
  });

  res.json(conversations);
});

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/:userId/:listingId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const { userId, listingId } = req.params;

  // Get all messages between the current user and the other user for this listing
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, recipient: userId },
      { sender: userId, recipient: req.user._id },
    ],
    listing: listingId,
  })
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .populate('listing', 'title')
    .sort({ createdAt: 1 });

  // Mark unread messages as read
  const unreadMessages = await Message.updateMany(
    {
      sender: userId,
      recipient: req.user._id,
      listing: listingId,
      read: false,
    },
    { read: true }
  );

  res.json(messages);
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { content, recipientId, listingId, isPurchaseRequest, purchasePrice } = req.body;

  if (!content || !recipientId || !listingId) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if listing exists
  const listing = await Listing.findById(listingId);
  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Create message
  const message = await Message.create({
    content,
    sender: req.user._id,
    recipient: recipientId,
    listing: listingId,
    isPurchaseRequest: isPurchaseRequest || false,
    purchasePrice: purchasePrice || null,
    status: isPurchaseRequest ? 'pending' : null,
  });

  const populatedMessage = await Message.findById(message._id)
    .populate('sender', 'username')
    .populate('recipient', 'username')
    .populate('listing', 'title');

  res.status(201).json(populatedMessage);
});

// @desc    Get unread message count
// @route   GET /api/messages/unread
// @access  Private
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await Message.countDocuments({
    recipient: req.user._id,
    read: false,
  });

  res.json({ unreadCount: count });
});

module.exports = {
  getConversations,
  getConversation,
  sendMessage,
  getUnreadCount,
}; 
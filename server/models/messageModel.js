const mongoose = require('mongoose');

const messageSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please add a message content'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Listing',
    },
    read: {
      type: Boolean,
      default: false,
    },
    isPurchaseRequest: {
      type: Boolean,
      default: false,
    },
    purchasePrice: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'declined', null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Message', messageSchema); 
const asyncHandler = require('express-async-handler');
const Listing = require('../models/listingModel');
const Message = require('../models/messageModel');

// @desc    Get all listings
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { title: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};

  const categoryFilter = req.query.category ? { category: req.query.category } : {};
  const typeFilter = req.query.listingType ? { listingType: req.query.listingType } : {};
  const statusFilter = { status: { $ne: 'inactive' } };

  const count = await Listing.countDocuments({
    ...keyword,
    ...categoryFilter,
    ...typeFilter,
    ...statusFilter,
  });

  const listings = await Listing.find({
    ...keyword,
    ...categoryFilter,
    ...typeFilter,
    ...statusFilter,
  })
    .populate('user', 'username')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    listings,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get recent listings
// @route   GET /api/listings/recent
// @access  Public
const getRecentListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ status: { $ne: 'inactive' } })
    .populate('user', 'username')
    .populate('category', 'name')
    .sort({ createdAt: -1 })
    .limit(6);

  res.json(listings);
});

// @desc    Get listing by ID
// @route   GET /api/listings/:id
// @access  Public
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id)
    .populate('user', 'username')
    .populate('category', 'name')
    .populate('buyer', 'username');

  if (listing) {
    res.json(listing);
  } else {
    res.status(404);
    throw new Error('Listing not found');
  }
});

// @desc    Create a listing
// @route   POST /api/listings
// @access  Private
const createListing = asyncHandler(async (req, res) => {
  const { title, description, price, listingType, category } = req.body;

  if (!title || !description || !price || !listingType || !category) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  const listing = await Listing.create({
    user: req.user._id,
    title,
    description,
    price,
    listingType,
    category,
    imageFilename: req.file ? req.file.filename : null,
  });

  if (listing) {
    res.status(201).json(listing);
  } else {
    res.status(400);
    throw new Error('Invalid listing data');
  }
});

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private
const updateListing = asyncHandler(async (req, res) => {
  const { title, description, price, listingType, category } = req.body;

  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user is the owner of the listing
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this listing');
  }

  listing.title = title || listing.title;
  listing.description = description || listing.description;
  listing.price = price || listing.price;
  listing.listingType = listingType || listing.listingType;
  listing.category = category || listing.category;

  if (req.file) {
    listing.imageFilename = req.file.filename;
  }

  const updatedListing = await listing.save();
  res.json(updatedListing);
});

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user is the owner of the listing
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this listing');
  }

  await listing.deleteOne();
  res.json({ message: 'Listing removed' });
});

// @desc    Get listings by user
// @route   GET /api/listings/user
// @access  Private
const getUserListings = asyncHandler(async (req, res) => {
  const activeListings = await Listing.find({
    user: req.user._id,
    status: 'active',
  })
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  const inactiveListings = await Listing.find({
    user: req.user._id,
    status: 'inactive',
  })
    .populate('category', 'name')
    .populate('buyer', 'username')
    .sort({ createdAt: -1 });

  // Get listings with pending purchase requests
  const listingsWithRequests = await Message.find({
    recipient: req.user._id,
    isPurchaseRequest: true,
    status: 'pending',
  })
    .populate({
      path: 'listing',
      match: { status: 'active', user: req.user._id },
      populate: { path: 'category', select: 'name' },
    })
    .populate('sender', 'username')
    .sort({ createdAt: -1 });

  // Filter out null listings (in case a listing was deleted)
  const validListingsWithRequests = listingsWithRequests.filter(
    (msg) => msg.listing !== null
  );

  // Get purchase requests made by the user
  const userPurchaseRequests = await Message.find({
    sender: req.user._id,
    isPurchaseRequest: true,
  })
    .populate({
      path: 'listing',
      populate: [
        { path: 'category', select: 'name' },
        { path: 'user', select: 'username' },
      ],
    })
    .sort({ createdAt: -1 });

  res.json({
    activeListings,
    inactiveListings,
    listingsWithRequests: validListingsWithRequests,
    userPurchaseRequests,
  });
});

// @desc    Send purchase request
// @route   POST /api/listings/:id/buy
// @access  Private
const buyListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if the listing is still active
  if (listing.status !== 'active') {
    res.status(400);
    throw new Error('This listing is no longer available');
  }

  // Prevent the seller from buying their own listing
  if (listing.user.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot buy your own listing');
  }

  // Check if the user already has a pending purchase request for this listing
  const existingRequest = await Message.findOne({
    sender: req.user._id,
    listing: listing._id,
    isPurchaseRequest: true,
    status: 'pending',
  });

  if (existingRequest) {
    res.status(400);
    throw new Error('You already have a pending purchase request for this listing');
  }

  // Create a purchase request message
  const purchasePrice = req.body.purchasePrice || listing.price;
  
  const message = await Message.create({
    content: `I would like to buy your listing "${listing.title}" for $${purchasePrice.toFixed(2)}.`,
    sender: req.user._id,
    recipient: listing.user,
    listing: listing._id,
    isPurchaseRequest: true,
    purchasePrice,
    status: 'pending',
  });

  if (message) {
    res.status(201).json(message);
  } else {
    res.status(400);
    throw new Error('Failed to create purchase request');
  }
});

// @desc    Approve purchase request
// @route   PUT /api/listings/:id/approve/:userId
// @access  Private
const approvePurchase = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const buyerId = req.params.userId;

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user is the owner of the listing
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to approve this purchase');
  }

  // Find the purchase request
  const purchaseRequest = await Message.findOne({
    sender: buyerId,
    recipient: req.user._id,
    listing: listing._id,
    isPurchaseRequest: true,
    status: 'pending',
  });

  if (!purchaseRequest) {
    res.status(404);
    throw new Error('Purchase request not found');
  }

  // Update the purchase request status
  purchaseRequest.status = 'approved';
  purchaseRequest.read = true;
  await purchaseRequest.save();

  // Mark the listing as sold and set the buyer
  listing.status = 'inactive';
  listing.buyer = buyerId;
  await listing.save();

  // Decline all other purchase requests for this listing
  const otherRequests = await Message.find({
    listing: listing._id,
    isPurchaseRequest: true,
    status: 'pending',
    sender: { $ne: buyerId },
  });

  for (const request of otherRequests) {
    request.status = 'declined';
    await request.save();

    // Send a notification message to the declined buyers
    await Message.create({
      content: `Your purchase request for "${listing.title}" has been declined as the item has been sold to another buyer.`,
      sender: req.user._id,
      recipient: request.sender,
      listing: listing._id,
      isPurchaseRequest: false,
    });
  }

  // Send a confirmation message to the buyer
  await Message.create({
    content: `Your purchase request for "${listing.title}" has been approved! Please contact the seller to arrange payment and delivery.`,
    sender: req.user._id,
    recipient: buyerId,
    listing: listing._id,
    isPurchaseRequest: false,
  });

  res.json({ message: 'Purchase approved' });
});

// @desc    Decline purchase request
// @route   PUT /api/listings/:id/decline/:userId
// @access  Private
const declinePurchase = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const buyerId = req.params.userId;

  if (!listing) {
    res.status(404);
    throw new Error('Listing not found');
  }

  // Check if user is the owner of the listing
  if (listing.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to decline this purchase');
  }

  // Find the purchase request
  const purchaseRequest = await Message.findOne({
    sender: buyerId,
    recipient: req.user._id,
    listing: listing._id,
    isPurchaseRequest: true,
    status: 'pending',
  });

  if (!purchaseRequest) {
    res.status(404);
    throw new Error('Purchase request not found');
  }

  // Update the purchase request status
  purchaseRequest.status = 'declined';
  purchaseRequest.read = true;
  await purchaseRequest.save();

  // Send a notification message to the buyer
  await Message.create({
    content: `Your purchase request for "${listing.title}" has been declined by the seller.`,
    sender: req.user._id,
    recipient: buyerId,
    listing: listing._id,
    isPurchaseRequest: false,
  });

  res.json({ message: 'Purchase request declined' });
});

// @desc    Search listings
// @route   GET /api/listings/search
// @access  Public
const searchListings = asyncHandler(async (req, res) => {
  const query = req.query.q;
  
  if (!query) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const listings = await Listing.find({
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ],
    status: { $ne: 'inactive' }
  })
    .populate('user', 'username')
    .populate('category', 'name')
    .sort({ createdAt: -1 });

  res.json(listings);
});

module.exports = {
  getListings,
  getRecentListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
  getUserListings,
  buyListing,
  approvePurchase,
  declinePurchase,
  searchListings,
}; 
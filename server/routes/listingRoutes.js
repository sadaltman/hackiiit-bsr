const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/').get(getListings).post(protect, upload.single('image'), createListing);
router.get('/recent', getRecentListings);
router.get('/user', protect, getUserListings);
router.get('/search', searchListings);
router
  .route('/:id')
  .get(getListingById)
  .put(protect, upload.single('image'), updateListing)
  .delete(protect, deleteListing);
router.post('/:id/buy', protect, buyListing);
router.put('/:id/approve/:userId', protect, approvePurchase);
router.put('/:id/decline/:userId', protect, declinePurchase);

module.exports = router; 
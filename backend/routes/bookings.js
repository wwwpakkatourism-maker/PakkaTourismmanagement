const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getBookings, createBooking, getBooking, updateBooking, addPayment } = require('../controllers/bookingController');

router.get('/',             protect, getBookings);
router.post('/',            protect, createBooking);
router.get('/:id',          protect, getBooking);
router.put('/:id',          protect, updateBooking);
router.post('/:id/payment', protect, addPayment);

module.exports = router;

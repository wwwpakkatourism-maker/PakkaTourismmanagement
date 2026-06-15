const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getOverview } = require('../controllers/analyticsController');
router.get('/overview', protect, adminOnly, getOverview);
module.exports = router;

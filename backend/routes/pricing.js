const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getConfig, updateConfig, getMatrix, calculate } = require('../controllers/pricingController');

router.get('/config',         protect, getConfig);
router.put('/config',         protect, adminOnly, updateConfig);
router.get('/matrix/:days',   protect, getMatrix);
router.post('/calculate',     protect, calculate);

module.exports = router;

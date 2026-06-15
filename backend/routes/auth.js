const router = require('express').Router();
const {
  login, getMe, logout, register, getUsers, updateUser,
  resetPassword, toggleStatus, faceRegister
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public
router.post('/login',    login);

// Protected
router.post('/logout',   protect, logout);
router.get('/me',        protect, getMe);

// Admin-only employee management
router.post('/register',                  protect, adminOnly, register);
router.get('/users',                      protect, adminOnly, getUsers);
router.put('/users/:id',                  protect, adminOnly, updateUser);
router.put('/users/:id/reset-password',   protect, adminOnly, resetPassword);
router.put('/users/:id/toggle-status',    protect, adminOnly, toggleStatus);
router.put('/users/:id/face-register',    protect, adminOnly, faceRegister);

module.exports = router;

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// @desc   Login user (Admin or Employee)
// @route  POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password, role, workMode, geoLocation } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Login ID and password required' });

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive)
      return res.status(401).json({ success: false, message: 'Invalid credentials or account disabled' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // ── Role validation ──
    // If client sends role hint, verify it matches the user's actual role
    if (role && user.role !== role) {
      return res.status(403).json({
        success: false,
        message: role === 'admin'
          ? 'This account does not have admin access'
          : 'This account is not registered as an employee. Contact Admin.'
      });
    }

    // ── Employee-specific: validate biometric + geo requirements ──
    if (user.role === 'employee') {
      // Face ID verification would be validated here in production
      // For now we trust the client-side Face ID scan completion

      // Store work mode and geo location for attendance
      if (workMode) user.workMode = workMode;
      if (geoLocation) {
        user.geoLocation = geoLocation;

        // In-Office geo-fence validation
        if (workMode === 'office' && user.officeLocation) {
          const distance = getDistance(
            geoLocation.lat, geoLocation.lng,
            user.officeLocation.lat, user.officeLocation.lng
          );
          if (distance > (user.officeLocation.radius || 500)) {
            return res.status(403).json({
              success: false,
              message: `You are ${Math.round(distance)}m away from office. Must be within ${user.officeLocation.radius || 500}m for In-Office attendance.`
            });
          }
        }
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({ success: true, token, user: user.toJSON() });
  } catch (err) { next(err); }
};

// Haversine distance (meters)
function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// @desc   Get current user
// @route  GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @desc   Logout
// @route  POST /api/auth/logout
const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

// @desc   Register employee (Admin only)
// @route  POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password, department, phone, destination } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });

    // Employees can only be created by admin — role is always 'employee'
    const user = await User.create({
      name, email, password,
      role: 'employee',
      department, phone, destination,
      faceRegistered: false,
    });
    res.status(201).json({ success: true, data: user.toJSON() });
  } catch (err) { next(err); }
};

// @desc   Get all employees (admin)
// @route  GET /api/auth/users
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'employee' }).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (err) { next(err); }
};

// @desc   Update employee (admin only)
// @route  PUT /api/auth/users/:id
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

// @desc   Reset employee password (admin only)
// @route  PUT /api/auth/users/:id/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ success: false, message: 'Password required' });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.password = password;
    await user.save();
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) { next(err); }
};

// @desc   Toggle employee active status (admin only)
// @route  PUT /api/auth/users/:id/toggle-status
const toggleStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: user, message: `Employee ${user.isActive ? 'enabled' : 'disabled'}` });
  } catch (err) { next(err); }
};

// @desc   Register Face ID for employee (admin only)
// @route  PUT /api/auth/users/:id/face-register
const faceRegister = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.faceRegistered = true;
    user.faceRegisteredAt = new Date();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: user, message: 'Face ID registered successfully' });
  } catch (err) { next(err); }
};

module.exports = { login, getMe, logout, register, getUsers, updateUser, resetPassword, toggleStatus, faceRegister };

const User = require('../models/User');
const CompanySettings = require('../models/CompanySettings');

// ─── GET /api/settings/office-locations ─────────────────────────────────────
// Returns all saved office locations from the admin's profile
const getOfficeLocations = async (req, res, next) => {
  try {
    const admin = await User.findById(req.user._id);
    const locations = admin?.officeLocations || [];
    res.json({ success: true, data: locations });
  } catch (err) { next(err); }
};

// ─── POST /api/settings/office-location ─────────────────────────────────────
// Save a new or update an existing office location on admin's profile
const saveOfficeLocation = async (req, res, next) => {
  try {
    const { name, lat, lng, radius, _id } = req.body;

    if (!name || lat == null || lng == null) {
      return res.status(400).json({ success: false, message: 'Name, latitude and longitude are required' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin.officeLocations) admin.officeLocations = [];

    if (_id) {
      // Update existing
      const idx = admin.officeLocations.findIndex(l => l._id?.toString() === _id);
      if (idx !== -1) {
        admin.officeLocations[idx] = { ...admin.officeLocations[idx], name, lat, lng, radius: radius || 50 };
      }
    } else {
      // Add new
      admin.officeLocations.push({ name, lat, lng, radius: radius || 50 });
    }

    admin.markModified('officeLocations');
    await admin.save();

    res.json({ success: true, data: admin.officeLocations });
  } catch (err) { next(err); }
};

// ─── DELETE /api/settings/office-location/:id ────────────────────────────────
const deleteOfficeLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const admin = await User.findById(req.user._id);
    if (!admin.officeLocations) return res.json({ success: true, data: [] });

    admin.officeLocations = admin.officeLocations.filter(l => l._id?.toString() !== id);
    admin.markModified('officeLocations');
    await admin.save();

    res.json({ success: true, data: admin.officeLocations });
  } catch (err) { next(err); }
};

// ─── GET /api/settings/primary-location ─────────────────────────────────────
// Returns the first (primary) office location — used by attendance controller
const getPrimaryLocation = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: 'admin', isActive: true });
    const primary = admin?.officeLocations?.[0] || null;
    res.json({ success: true, data: primary });
  } catch (err) { next(err); }
};

// ─── GET /api/settings/company ──────────────────────────────────────────────
const getCompanySettings = async (req, res, next) => {
  try {
    const settings = await CompanySettings.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings/company ──────────────────────────────────────────────
const updateCompanySettings = async (req, res, next) => {
  try {
    const { companyName, companyPhone, companyEmail, companyAddress, companyWebsite, gstNumber, panNumber } = req.body;
    let settings = await CompanySettings.getSettings();
    
    settings.companyName = companyName !== undefined ? companyName : settings.companyName;
    settings.companyPhone = companyPhone !== undefined ? companyPhone : settings.companyPhone;
    settings.companyEmail = companyEmail !== undefined ? companyEmail : settings.companyEmail;
    settings.companyAddress = companyAddress !== undefined ? companyAddress : settings.companyAddress;
    settings.companyWebsite = companyWebsite !== undefined ? companyWebsite : settings.companyWebsite;
    settings.gstNumber = gstNumber !== undefined ? gstNumber : settings.gstNumber;
    settings.panNumber = panNumber !== undefined ? panNumber : settings.panNumber;
    
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings/whatsapp ─────────────────────────────────────────────
const updateWhatsappConfig = async (req, res, next) => {
  try {
    const { apiToken, phoneNumberId, businessAccountId, webhookToken, isConfigured } = req.body;
    let settings = await CompanySettings.getSettings();
    
    if (!settings.whatsapp) settings.whatsapp = {};
    settings.whatsapp.apiToken = apiToken !== undefined ? apiToken : settings.whatsapp.apiToken;
    settings.whatsapp.phoneNumberId = phoneNumberId !== undefined ? phoneNumberId : settings.whatsapp.phoneNumberId;
    settings.whatsapp.businessAccountId = businessAccountId !== undefined ? businessAccountId : settings.whatsapp.businessAccountId;
    settings.whatsapp.webhookToken = webhookToken !== undefined ? webhookToken : settings.whatsapp.webhookToken;
    settings.whatsapp.isConfigured = isConfigured !== undefined ? isConfigured : settings.whatsapp.isConfigured;
    
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ─── PUT /api/settings/reminders ────────────────────────────────────────────
const updateReminders = async (req, res, next) => {
  try {
    const { followUpEnabled, followUpBeforeHrs, paymentEnabled, paymentBeforeDays, travelEnabled, travelBeforeDays, dailyDigest } = req.body;
    let settings = await CompanySettings.getSettings();
    
    if (!settings.reminders) settings.reminders = {};
    settings.reminders.followUpEnabled = followUpEnabled !== undefined ? followUpEnabled : settings.reminders.followUpEnabled;
    settings.reminders.followUpBeforeHrs = followUpBeforeHrs !== undefined ? followUpBeforeHrs : settings.reminders.followUpBeforeHrs;
    settings.reminders.paymentEnabled = paymentEnabled !== undefined ? paymentEnabled : settings.reminders.paymentEnabled;
    settings.reminders.paymentBeforeDays = paymentBeforeDays !== undefined ? paymentBeforeDays : settings.reminders.paymentBeforeDays;
    settings.reminders.travelEnabled = travelEnabled !== undefined ? travelEnabled : settings.reminders.travelEnabled;
    settings.reminders.travelBeforeDays = travelBeforeDays !== undefined ? travelBeforeDays : settings.reminders.travelBeforeDays;
    settings.reminders.dailyDigest = dailyDigest !== undefined ? dailyDigest : settings.reminders.dailyDigest;
    
    await settings.save();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

module.exports = { 
  getOfficeLocations, saveOfficeLocation, deleteOfficeLocation, getPrimaryLocation,
  getCompanySettings, updateCompanySettings, updateWhatsappConfig, updateReminders
};

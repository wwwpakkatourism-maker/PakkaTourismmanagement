const mongoose = require('mongoose');

const CompanySettingsSchema = new mongoose.Schema({
  // Singleton — only one document in this collection
  singleton:      { type: String, default: 'main', unique: true },

  // Company Info
  companyName:    { type: String, default: 'Pakka Tourism Pvt. Ltd.' },
  companyLogo:    { type: String },  // URL to uploaded logo
  companyPhone:   { type: String, default: '+91 98765 43210' },
  companyEmail:   { type: String, default: 'info@pakkatourism.com' },
  companyAddress: { type: String, default: 'Mall Road, Manali, HP 175131' },
  companyWebsite: { type: String, default: 'https://www.pakkatourism.com' },
  gstNumber:      { type: String },
  panNumber:      { type: String },

  // WhatsApp Business API Config
  whatsapp: {
    apiToken:          { type: String },
    phoneNumberId:     { type: String },
    businessAccountId: { type: String },
    webhookToken:      { type: String },
    isConfigured:      { type: Boolean, default: false }
  },

  // Reminder Settings
  reminders: {
    followUpEnabled:    { type: Boolean, default: true },
    followUpBeforeHrs:  { type: Number, default: 2 },
    paymentEnabled:     { type: Boolean, default: true },
    paymentBeforeDays:  { type: Number, default: 3 },
    travelEnabled:      { type: Boolean, default: true },
    travelBeforeDays:   { type: Number, default: 2 },
    dailyDigest:        { type: Boolean, default: false }
  },

  // Attendance Settings
  attendance: {
    lateThreshold:   { type: String, default: '09:30' },   // HH:MM
    halfDayThreshold:{ type: String, default: '13:00' },
    maxLeavesPerMonth:{ type: Number, default: 2 },
  }
}, { timestamps: true });

// Helper: get or create the singleton settings doc
CompanySettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne({ singleton: 'main' });
  if (!settings) {
    settings = await this.create({ singleton: 'main' });
  }
  return settings;
};

module.exports = mongoose.model('CompanySettings', CompanySettingsSchema);

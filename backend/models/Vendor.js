const mongoose = require('mongoose');

const VendorSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  type:         { type: String, enum: ['hotel', 'transport', 'guide', 'activity', 'food', 'other'], required: true },
  phone:        { type: String, required: true },
  email:        { type: String },
  address:      { type: String },
  destination:  { type: String },
  gstNumber:    { type: String },
  panNumber:    { type: String },

  // Pricing agreement
  rates: [{
    service:   { type: String },
    rateType:  { type: String, enum: ['per_day', 'per_night', 'per_pax', 'fixed'] },
    amount:    { type: Number },
    currency:  { type: String, default: 'INR' },
  }],

  // Financial tracking
  totalPayable:   { type: Number, default: 0 },
  totalPaid:      { type: Number, default: 0 },
  outstandingDue: { type: Number, default: 0 },

  payments: [{
    amount:    { type: Number },
    date:      { type: Date },
    method:    { type: String },
    reference: { type: String },
    booking:   { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    notes:     { type: String },
  }],

  rating:   { type: Number, min: 1, max: 5, default: 3 },
  isActive: { type: Boolean, default: true },
  notes:    { type: String },
  tags:     [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Vendor', VendorSchema);

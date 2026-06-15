const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  // Basic Info
  clientName:   { type: String, required: true, trim: true },
  phone:        { type: String, required: true },
  email:        { type: String, lowercase: true },
  source:       { type: String, enum: ['website', 'whatsapp', 'phone', 'referral', 'indiamart', 'google', 'social', 'walk_in', 'other'], default: 'phone' },

  // Trip Details
  destination:  { type: String, required: true },
  travelDate:   { type: Date },
  returnDate:   { type: Date },
  pax:          { type: Number, default: 1 },
  nights:       { type: Number, default: 1 },
  budget:       { type: Number },

  // Pipeline
  stage: {
    type: String,
    enum: ['new_inquiry', 'in_progress', 'quote_sent', 'advance_pending', 'confirmed', 'finished', 'lost'],
    default: 'new_inquiry'
  },
  priority:    { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  aiScore:     { type: Number, min: 0, max: 100, default: 50 }, // AI lead score

  // Assignment
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  // Follow-up
  nextFollowUp:    { type: Date },
  followUpNotes:   [{ note: String, date: Date, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],

  // WhatsApp
  whatsappSent:    { type: Boolean, default: false },
  lastWhatsappAt:  { type: Date },

  // Linked Documents
  quotes:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quote' }],
  booking:     { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },

  // Loss reason
  lostReason:  { type: String },
  lostAt:      { type: Date },

  tags:        [{ type: String }],
  notes:       { type: String },
}, { timestamps: true });

LeadSchema.index({ stage: 1, assignedTo: 1, travelDate: 1 });

module.exports = mongoose.model('Lead', LeadSchema);

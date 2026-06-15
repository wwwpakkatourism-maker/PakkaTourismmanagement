const mongoose = require('mongoose');

const WhatsappTemplateSchema = new mongoose.Schema({
  name:     { type: String, required: true, unique: true },
  type:     { type: String, enum: ['lead_followup', 'quote_send', 'booking_confirm', 'payment_reminder', 'trip_reminder', 'custom'] },
  message:  { type: String, required: true }, // supports {{clientName}}, {{destination}}, {{amount}} placeholders
  mediaUrl: { type: String },
  isActive: { type: Boolean, default: true },
  sentCount:{ type: Number, default: 0 },

  // Automation triggers
  triggerOn: { type: String, enum: ['lead_created', 'quote_sent', 'booking_confirmed', 'payment_received', 'manual', 'none'], default: 'manual' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const WhatsappLogSchema = new mongoose.Schema({
  template:   { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsappTemplate' },
  lead:       { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  phone:      { type: String, required: true },
  message:    { type: String },
  status:     { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  sentBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sentAt:     { type: Date, default: Date.now },
}, { timestamps: true });

const WhatsappTemplate = mongoose.model('WhatsappTemplate', WhatsappTemplateSchema);
const WhatsappLog = mongoose.model('WhatsappLog', WhatsappLogSchema);

module.exports = { WhatsappTemplate, WhatsappLog };

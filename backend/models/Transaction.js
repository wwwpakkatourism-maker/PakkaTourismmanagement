const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  type:       { type: String, enum: ['income', 'expense', 'vendor_payment', 'refund'], required: true },
  category:   { type: String, enum: ['booking_payment', 'advance', 'balance', 'vendor_cost', 'salary', 'office', 'marketing', 'other'] },
  amount:     { type: Number, required: true },
  date:       { type: Date, default: Date.now },
  method:     { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque'] },
  reference:  { type: String },

  // Relations
  booking:    { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
  vendor:     { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

  description: { type: String },
  attachments: [{ type: String }],
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

TransactionSchema.index({ date: -1, type: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);

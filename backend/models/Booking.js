const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: { type: String, unique: true }, // BK-2025-0001
  lead:          { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  quote:         { type: mongoose.Schema.Types.ObjectId, ref: 'Quote' },

  // Client
  clientName:  { type: String, required: true },
  clientPhone: { type: String, required: true },
  clientEmail: { type: String },

  // Trip
  destination:  { type: String, required: true },
  travelDate:   { type: Date, required: true },
  returnDate:   { type: Date },
  days:         { type: Number },
  nights:       { type: Number },
  pax:          { type: Number, required: true },

  // Financials
  totalAmount:    { type: Number, required: true },
  advancePaid:    { type: Number, default: 0 },
  balanceDue:     { type: Number },
  totalCost:      { type: Number },
  profitAmount:   { type: Number },

  // Installments
  installments: [{
    amount:     { type: Number },
    dueDate:    { type: Date },
    paidDate:   { type: Date },
    status:     { type: String, enum: ['pending', 'paid', 'overdue'], default: 'pending' },
    method:     { type: String, enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque'] },
    reference:  { type: String },
    notes:      { type: String },
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded'],
    default: 'confirmed'
  },

  // Vendors assigned
  vendors: [{
    vendor:   { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor' },
    service:  { type: String },
    amount:   { type: Number },
    paid:     { type: Boolean, default: false },
  }],

  // Documents
  itinerary:    { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  invoiceUrl:   { type: String },

  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes:        { type: String },
  tags:         [{ type: String }],
}, { timestamps: true });

BookingSchema.pre('save', async function(next) {
  if (!this.bookingNumber) {
    const count = await mongoose.model('Booking').countDocuments();
    const year = new Date().getFullYear();
    this.bookingNumber = `BK-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  this.balanceDue = this.totalAmount - this.advancePaid;
  next();
});

BookingSchema.index({ status: 1, travelDate: 1, assignedTo: 1 });

module.exports = mongoose.model('Booking', BookingSchema);

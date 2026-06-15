const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  quoteNumber:  { type: String, unique: true }, // QT-2025-0001
  lead:         { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  clientName:   { type: String, required: true },
  clientPhone:  { type: String },

  // Trip Config
  destination:  { type: String, required: true },
  days:         { type: Number, required: true },
  nights:       { type: Number, required: true },
  pax:          { type: Number, required: true },
  travelDate:   { type: Date },

  // Pricing (uses CONFIG logic)
  pricingMode:  { type: String, enum: ['custom', 'standard'], default: 'custom' },
  components: {
    rooms:    { count: Number, costPerNight: Number, sellPerNight: Number, totalCost: Number, totalSell: Number },
    jeeps:    { count: Number, costPerDay: Number, sellPerDay: Number, totalCost: Number, totalSell: Number },
    food:     { costPerPaxPerDay: Number, sellPerPaxPerDay: Number, totalCost: Number, totalSell: Number },
    extras:   [{ name: String, cost: Number, sell: Number }],
  },

  // Totals
  totalBaseCost:  { type: Number },
  totalSellPrice: { type: Number },
  profitAmount:   { type: Number },
  profitMargin:   { type: Number }, // percentage
  perHeadPrice:   { type: Number },

  // Standard package comparison
  standardPerHead: { type: Number },
  standardTotal:   { type: Number },

  status:      { type: String, enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'], default: 'draft' },
  validTill:   { type: Date },
  notes:       { type: String },
  pdfUrl:      { type: String },

  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate quote number
QuoteSchema.pre('save', async function(next) {
  if (!this.quoteNumber) {
    const count = await mongoose.model('Quote').countDocuments();
    const year = new Date().getFullYear();
    this.quoteNumber = `QT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Quote', QuoteSchema);

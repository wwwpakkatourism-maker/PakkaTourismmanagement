const mongoose = require('mongoose');

// The authoritative pricing CONFIG — mirrors the existing front-end logic
const PricingConfigSchema = new mongoose.Schema({
  // Custom pricing components
  room: {
    cost: { type: Number, default: 2000 },  // base cost per room per night
    sell: { type: Number, default: 3000 },  // sell price per room per night
    cap:  { type: Number, default: 3 },     // max pax per room
  },
  jeep: {
    cost: { type: Number, default: 3500 },  // base cost per jeep per day
    sell: { type: Number, default: 4500 },  // sell price per jeep per day
    cap:  { type: Number, default: 8 },     // max pax per jeep
  },
  food: {
    cost: { type: Number, default: 100 },   // cost per pax per day
    sell: { type: Number, default: 150 },   // sell per pax per day
  },
  // Standard package config
  std: {
    base:    { type: Number, default: 1250 }, // per pax per day base price
    min_pax: { type: Number, default: 8 },    // minimum pax threshold
    inc:     { type: Number, default: 150 },  // penalty per missing pax per day
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('PricingConfig', PricingConfigSchema);

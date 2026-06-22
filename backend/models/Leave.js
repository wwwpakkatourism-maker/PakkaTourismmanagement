const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employeeId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeName: { type: String, required: true },
  startDate:    { type: String, required: true }, // YYYY-MM-DD
  endDate:      { type: String, required: true }, // YYYY-MM-DD
  days:         { type: Number, required: true },
  type:         { type: String, enum: ['sick', 'casual', 'earned', 'unpaid'], default: 'casual' },
  reason:       { type: String, required: true },
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes:   { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Leave', LeaveSchema);

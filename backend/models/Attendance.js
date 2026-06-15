const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  user:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date:       { type: String, required: true }, // YYYY-MM-DD
  checkIn:    { type: Date },
  checkOut:   { type: Date },
  workMode:   { type: String, enum: ['office', 'wfh'], required: true },
  status:     { type: String, enum: ['present', 'absent', 'half_day', 'late', 'on_leave'], default: 'present' },
  geoFence: {
    verified:   { type: Boolean, default: false },
    lat:        { type: Number },
    lng:        { type: Number },
    distance:   { type: Number }, // meters from office
  },
  faceVerified: { type: Boolean, default: false },
  hoursWorked:  { type: Number, default: 0 },
  notes:        { type: String },
}, { timestamps: true });

// Compound unique index: one record per user per day
AttendanceSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);

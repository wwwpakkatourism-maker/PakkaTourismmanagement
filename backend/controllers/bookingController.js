const Booking = require('../models/Booking');
const Transaction = require('../models/Transaction');

// @route  GET /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, search, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role === 'sales') filter.assignedTo = req.user._id;
    if (status) filter.status = status;
    if (from || to) {
      filter.travelDate = {};
      if (from) filter.travelDate.$gte = new Date(from);
      if (to)   filter.travelDate.$lte = new Date(to);
    }
    if (search) filter.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { bookingNumber: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];

    const total = await Booking.countDocuments(filter);
    const bookings = await Booking.find(filter)
      .populate('assignedTo', 'name')
      .populate('lead', 'clientName phone')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, data: bookings });
  } catch (err) { next(err); }
};

// @route  POST /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const booking = await Booking.create({ ...req.body, createdBy: req.user._id, assignedTo: req.user._id });
    res.status(201).json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @route  GET /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('lead')
      .populate('quote')
      .populate('vendors.vendor', 'name phone type')
      .populate('itinerary');
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @route  PUT /api/bookings/:id
const updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

// @route  POST /api/bookings/:id/payment
const addPayment = async (req, res, next) => {
  try {
    const { installmentIndex, paidDate, method, reference, notes } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    const inst = booking.installments[installmentIndex];
    if (!inst) return res.status(400).json({ success: false, message: 'Installment not found' });

    inst.status = 'paid';
    inst.paidDate = paidDate || new Date();
    inst.method = method;
    inst.reference = reference;
    inst.notes = notes;
    booking.advancePaid += inst.amount;
    booking.balanceDue = booking.totalAmount - booking.advancePaid;
    await booking.save();

    // Create transaction record
    await Transaction.create({
      type: 'income', category: 'booking_payment',
      amount: inst.amount, date: inst.paidDate,
      method, reference, booking: booking._id,
      description: `Payment for ${booking.bookingNumber}`,
      createdBy: req.user._id,
    });

    res.json({ success: true, data: booking });
  } catch (err) { next(err); }
};

module.exports = { getBookings, createBooking, getBooking, updateBooking, addPayment };

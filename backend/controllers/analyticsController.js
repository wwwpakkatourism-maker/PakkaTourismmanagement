const Booking = require('../models/Booking');
const Lead = require('../models/Lead');
const Transaction = require('../models/Transaction');
const Attendance = require('../models/Attendance');
const User = require('../models/User');

// @route  GET /api/analytics/overview
const getOverview = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue this month
    const revenueThisMonth = await Transaction.aggregate([
      { $match: { type: 'income', date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Revenue last month
    const revenueLastMonth = await Transaction.aggregate([
      { $match: { type: 'income', date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Bookings
    const totalBookings = await Booking.countDocuments({ status: 'confirmed' });
    const bookingsThisMonth = await Booking.countDocuments({ status: 'confirmed', createdAt: { $gte: startOfMonth } });

    // Leads funnel
    const leadStages = await Lead.aggregate([
      { $group: { _id: '$stage', count: { $sum: 1 } } }
    ]);

    // Monthly revenue trend (last 6 months)
    const trend = await Transaction.aggregate([
      { $match: { type: 'income', date: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
      { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Pending payments
    const pendingPayments = await Booking.aggregate([
      { $match: { status: 'confirmed', balanceDue: { $gt: 0 } } },
      { $group: { _id: null, total: { $sum: '$balanceDue' }, count: { $sum: 1 } } }
    ]);

    // Destination analytics
    const destinations = await Booking.aggregate([
      { $group: { _id: '$destination', count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      { $sort: { revenue: -1 } },
      { $limit: 10 }
    ]);

    // Employee performance
    const performance = await Lead.aggregate([
      { $match: { stage: 'confirmed' } },
      { $group: { _id: '$assignedTo', conversions: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { name: '$user.name', conversions: 1, _id: 0 } },
      { $sort: { conversions: -1 } },
      { $limit: 5 }
    ]);

    const gross = revenueThisMonth[0]?.total || 0;
    const lastMonthGross = revenueLastMonth[0]?.total || 0;
    const growth = lastMonthGross > 0 ? (((gross - lastMonthGross) / lastMonthGross) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        revenue: { thisMonth: gross, lastMonth: lastMonthGross, growth },
        bookings: { total: totalBookings, thisMonth: bookingsThisMonth },
        leadStages,
        trend,
        pendingPayments: pendingPayments[0] || { total: 0, count: 0 },
        destinations,
        performance,
      }
    });
  } catch (err) { next(err); }
};

module.exports = { getOverview };

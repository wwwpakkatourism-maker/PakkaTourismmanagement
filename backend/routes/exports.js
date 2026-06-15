const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const XLSX = require('xlsx');
const Booking = require('../models/Booking');
const Lead = require('../models/Lead');

router.get('/bookings', protect, async(req,res,next)=>{
  try {
    const bookings = await Booking.find().populate('assignedTo','name').lean();
    const data = bookings.map(b=>({ 'Booking#':b.bookingNumber, Client:b.clientName, Phone:b.clientPhone, Destination:b.destination, Date:b.travelDate?.toDateString(), Pax:b.pax, Amount:b.totalAmount, Paid:b.advancePaid, Balance:b.balanceDue, Status:b.status }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');
    const buf = XLSX.write(wb, {type:'buffer', bookType:'xlsx'});
    res.setHeader('Content-Disposition','attachment; filename=PakkaTourism_Bookings.xlsx');
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  }catch(err){next(err);}
});

router.get('/leads', protect, async(req,res,next)=>{
  try {
    const leads = await Lead.find().populate('assignedTo','name').lean();
    const data = leads.map(l=>({ Client:l.clientName, Phone:l.phone, Destination:l.destination, Stage:l.stage, Priority:l.priority, Pax:l.pax, Budget:l.budget, Source:l.source, 'Travel Date':l.travelDate?.toDateString(), 'Assigned To':l.assignedTo?.name }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    const buf = XLSX.write(wb, {type:'buffer', bookType:'xlsx'});
    res.setHeader('Content-Disposition','attachment; filename=PakkaTourism_Leads.xlsx');
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buf);
  }catch(err){next(err);}
});

module.exports = router;

const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Transaction = require('../models/Transaction');
router.get('/', protect, adminOnly, async(req,res,next)=>{ try{ const txns=await Transaction.find().populate('booking','bookingNumber').populate('vendor','name').sort({date:-1}).limit(100); res.json({success:true,data:txns}); }catch(err){next(err);} });
router.post('/', protect, adminOnly, async(req,res,next)=>{ try{ const t=await Transaction.create({...req.body,createdBy:req.user._id}); res.status(201).json({success:true,data:t}); }catch(err){next(err);} });
module.exports = router;

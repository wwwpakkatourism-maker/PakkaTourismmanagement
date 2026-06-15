const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Attendance = require('../models/Attendance');

router.get('/', protect, async (req,res,next)=>{ try{ const records = await Attendance.find({user:req.user._id}).sort({date:-1}).limit(30); res.json({success:true,data:records}); }catch(err){next(err);} });
router.post('/checkin', protect, async (req,res,next)=>{ try{ const {workMode,geoFence,faceVerified,date}=req.body; const today=date||new Date().toISOString().split('T')[0]; let rec=await Attendance.findOne({user:req.user._id,date:today}); if(rec){ rec.checkIn=new Date();rec.workMode=workMode;rec.geoFence=geoFence;rec.faceVerified=faceVerified;rec.status='present';await rec.save(); }else{ rec=await Attendance.create({user:req.user._id,date:today,checkIn:new Date(),workMode,geoFence,faceVerified,status:'present'}); } res.json({success:true,data:rec}); }catch(err){next(err);} });
router.post('/checkout', protect, async (req,res,next)=>{ try{ const today=new Date().toISOString().split('T')[0]; const rec=await Attendance.findOne({user:req.user._id,date:today}); if(!rec) return res.status(404).json({success:false,message:'No check-in found'}); rec.checkOut=new Date(); const ms=rec.checkOut-rec.checkIn; rec.hoursWorked=parseFloat((ms/3600000).toFixed(2)); await rec.save(); res.json({success:true,data:rec}); }catch(err){next(err);} });

module.exports = router;

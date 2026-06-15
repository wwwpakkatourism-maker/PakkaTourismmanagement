const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { WhatsappTemplate, WhatsappLog } = require('../models/WhatsappTemplate');
router.get('/templates', protect, async(req,res,next)=>{ try{ const t=await WhatsappTemplate.find({isActive:true}); res.json({success:true,data:t}); }catch(err){next(err);} });
router.post('/templates', protect, async(req,res,next)=>{ try{ const t=await WhatsappTemplate.create({...req.body,createdBy:req.user._id}); res.status(201).json({success:true,data:t}); }catch(err){next(err);} });
router.post('/send', protect, async(req,res,next)=>{ try{ const log=await WhatsappLog.create({...req.body,sentBy:req.user._id}); res.json({success:true,data:log,message:'Message queued'}); }catch(err){next(err);} });
router.get('/logs', protect, async(req,res,next)=>{ try{ const logs=await WhatsappLog.find().sort({sentAt:-1}).limit(50); res.json({success:true,data:logs}); }catch(err){next(err);} });
module.exports = router;

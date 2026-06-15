const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Itinerary = require('../models/Itinerary');
router.get('/', protect, async(req,res,next)=>{ try{ const items=await Itinerary.find().sort({createdAt:-1}); res.json({success:true,data:items}); }catch(err){next(err);} });
router.post('/', protect, async(req,res,next)=>{ try{ const it=await Itinerary.create({...req.body,createdBy:req.user._id}); res.status(201).json({success:true,data:it}); }catch(err){next(err);} });
router.get('/:id', protect, async(req,res,next)=>{ try{ const it=await Itinerary.findById(req.params.id); if(!it) return res.status(404).json({success:false,message:'Not found'}); res.json({success:true,data:it}); }catch(err){next(err);} });
router.put('/:id', protect, async(req,res,next)=>{ try{ const it=await Itinerary.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:it}); }catch(err){next(err);} });
module.exports = router;

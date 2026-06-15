const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const Quote = require('../models/Quote');
router.get('/', protect, async(req,res,next)=>{ try{ const quotes=await Quote.find().populate('lead','clientName').sort({createdAt:-1}); res.json({success:true,data:quotes}); }catch(err){next(err);} });
router.post('/', protect, async(req,res,next)=>{ try{ const q=await Quote.create({...req.body,createdBy:req.user._id}); res.status(201).json({success:true,data:q}); }catch(err){next(err);} });
router.get('/:id', protect, async(req,res,next)=>{ try{ const q=await Quote.findById(req.params.id).populate('lead').populate('createdBy','name'); if(!q) return res.status(404).json({success:false,message:'Quote not found'}); res.json({success:true,data:q}); }catch(err){next(err);} });
router.put('/:id', protect, async(req,res,next)=>{ try{ const q=await Quote.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:q}); }catch(err){next(err);} });
module.exports = router;

const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Vendor = require('../models/Vendor');
router.get('/', protect, async(req,res,next)=>{ try{ const vendors=await Vendor.find({isActive:true}).sort({name:1}); res.json({success:true,data:vendors}); }catch(err){next(err);} });
router.post('/', protect, async(req,res,next)=>{ try{ const v=await Vendor.create(req.body); res.status(201).json({success:true,data:v}); }catch(err){next(err);} });
router.put('/:id', protect, adminOnly, async(req,res,next)=>{ try{ const v=await Vendor.findByIdAndUpdate(req.params.id,req.body,{new:true}); res.json({success:true,data:v}); }catch(err){next(err);} });
module.exports = router;

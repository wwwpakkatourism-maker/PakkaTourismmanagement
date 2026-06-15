const router = require('express').Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
router.get('/', protect, adminOnly, (req,res)=>res.json({success:true,message:'Settings endpoint'}));
module.exports = router;

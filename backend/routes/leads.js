const router = require('express').Router();
const { protect } = require('../middleware/authMiddleware');
const { getLeads, createLead, getLead, updateLead, updateStage, addFollowup, deleteLead, getKanban } = require('../controllers/leadController');

router.get('/kanban',        protect, getKanban);
router.get('/',              protect, getLeads);
router.post('/',             protect, createLead);
router.get('/:id',           protect, getLead);
router.put('/:id',           protect, updateLead);
router.patch('/:id/stage',   protect, updateStage);
router.post('/:id/followup', protect, addFollowup);
router.delete('/:id',        protect, deleteLead);

module.exports = router;

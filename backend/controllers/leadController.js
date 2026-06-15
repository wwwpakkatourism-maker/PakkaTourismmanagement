const Lead = require('../models/Lead');

// @route  GET /api/leads
const getLeads = async (req, res, next) => {
  try {
    const { stage, assignedTo, priority, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    // Employees only see their own leads
    if (req.user.role === 'sales') filter.assignedTo = req.user._id;
    if (stage)      filter.stage = stage;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (priority)   filter.priority = priority;
    if (search)     filter.$or = [
      { clientName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { destination: { $regex: search, $options: 'i' } },
    ];

    const total = await Lead.countDocuments(filter);
    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name avatar')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, total, data: leads });
  } catch (err) { next(err); }
};

// @route  POST /api/leads
const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: lead });
  } catch (err) { next(err); }
};

// @route  GET /api/leads/:id
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('quotes')
      .populate('booking');
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

// @route  PUT /api/leads/:id
const updateLead = async (req, res, next) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

// @route  PATCH /api/leads/:id/stage
const updateStage = async (req, res, next) => {
  try {
    const { stage, lostReason } = req.body;
    const update = { stage };
    if (stage === 'lost') { update.lostReason = lostReason; update.lostAt = new Date(); }
    const lead = await Lead.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

// @route  POST /api/leads/:id/followup
const addFollowup = async (req, res, next) => {
  try {
    const { note, nextFollowUp } = req.body;
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ success: false, message: 'Lead not found' });

    lead.followUpNotes.push({ note, date: new Date(), by: req.user._id });
    if (nextFollowUp) lead.nextFollowUp = nextFollowUp;
    await lead.save();
    res.json({ success: true, data: lead });
  } catch (err) { next(err); }
};

// @route  DELETE /api/leads/:id
const deleteLead = async (req, res, next) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Lead deleted' });
  } catch (err) { next(err); }
};

// @route  GET /api/leads/kanban
const getKanban = async (req, res, next) => {
  try {
    const filter = req.user.role === 'sales' ? { assignedTo: req.user._id } : {};
    const stages = ['new_inquiry','in_progress','quote_sent','advance_pending','confirmed','finished','lost'];
    const kanban = {};
    for (const stage of stages) {
      kanban[stage] = await Lead.find({ ...filter, stage })
        .populate('assignedTo', 'name avatar')
        .sort({ updatedAt: -1 })
        .limit(30);
    }
    res.json({ success: true, data: kanban });
  } catch (err) { next(err); }
};

module.exports = { getLeads, createLead, getLead, updateLead, updateStage, addFollowup, deleteLead, getKanban };

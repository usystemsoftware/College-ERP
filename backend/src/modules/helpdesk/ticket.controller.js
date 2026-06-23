const Ticket = require('./ticket.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// CREATE a ticket
const createTicket = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    
    const ticket = await Ticket.create({
      title,
      description,
      category,
      priority,
      createdBy: req.user._id,
      collegeId: req.user.collegeId
    });

    return res.status(201).json(new ApiResponse(201, ticket, 'Ticket created successfully'));
  } catch (error) { next(error); }
};

// GET my tickets
const getMyTickets = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 });
      
    return res.json(new ApiResponse(200, tickets, 'Your tickets fetched'));
  } catch (error) { next(error); }
};

// GET all tickets (Admin view)
const getAllTickets = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') {
      filter.collegeId = req.user.collegeId;
    }

    const { status, category, priority } = req.query;
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'firstName lastName email role')
      .populate('assignedTo', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return res.json(new ApiResponse(200, tickets, 'All tickets fetched'));
  } catch (error) { next(error); }
};

// UPDATE ticket status
const updateTicketStatus = async (req, res, next) => {
  try {
    const { status, assignedTo } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    
    if (!ticket) throw new ApiError(404, 'Ticket not found');
    
    // Authorization check
    if (req.user.collegeId && ticket.collegeId.toString() !== req.user.collegeId.toString() && req.user.role.name !== 'Super Admin') {
       throw new ApiError(403, 'Not authorized to update this ticket');
    }

    if (status) ticket.status = status;
    if (assignedTo) ticket.assignedTo = assignedTo;

    await ticket.save();
    
    return res.json(new ApiResponse(200, ticket, 'Ticket updated successfully'));
  } catch (error) { next(error); }
};

module.exports = { createTicket, getMyTickets, getAllTickets, updateTicketStatus };

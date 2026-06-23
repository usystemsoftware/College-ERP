const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const ticketController = require('./ticket.controller');

// Anyone logged in can create and view their own tickets
router.post('/', protect, ticketController.createTicket);
router.get('/my', protect, ticketController.getMyTickets);

// Only admins/staff can view all and update
router.get('/all', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), ticketController.getAllTickets);
router.put('/:id', protect, authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), ticketController.updateTicketStatus);

module.exports = router;

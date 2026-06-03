const Invoice = require('./fees.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// Create an invoice
const createInvoice = async (req, res, next) => {
  try {
    const { studentId, title, description, totalAmount, dueDate, feeType } = req.body;

    const invoice = await Invoice.create({
      studentId, title, description, totalAmount, dueDate, feeType
    });

    return res.status(201).json(new ApiResponse(201, { invoice }, 'Invoice generated successfully'));
  } catch (error) {
    next(error);
  }
};

// Get invoices with filters
const getInvoices = async (req, res, next) => {
  try {
    const { studentId, status, feeType } = req.query;
    let filter = {};

    if (studentId) filter.studentId = studentId;
    if (status) filter.status = status;
    if (feeType) filter.feeType = feeType;

    // Students can only see their own
    if (req.user && req.user.role && req.user.role.name === 'Student') {
       // Logic to map req.user._id to studentId would go here.
       // filter.studentId = mappedStudentId;
    }

    const invoices = await Invoice.find(filter)
      .populate('studentId', 'fullName rollNumber enrollmentNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, { invoices }, 'Invoices fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Record a payment against an invoice
const recordPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amount, paymentMethod, transactionId } = req.body;

    const invoice = await Invoice.findById(id);
    if (!invoice) throw new ApiError(404, 'Invoice not found');

    if (invoice.status === 'Paid') {
      throw new ApiError(400, 'Invoice is already fully paid');
    }

    if (amount > (invoice.totalAmount - invoice.paidAmount)) {
      throw new ApiError(400, 'Payment amount exceeds pending dues');
    }

    invoice.payments.push({
      amount,
      paymentMethod,
      transactionId,
      recordedBy: req.user._id
    });

    invoice.paidAmount += amount;

    await invoice.save(); // The pre-save hook handles status updates

    return res.status(200).json(new ApiResponse(200, { invoice }, 'Payment recorded successfully'));
  } catch (error) {
    next(error);
  }
};

// Get financial summary
const getFinancialSummary = async (req, res, next) => {
  try {
    const summary = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          pendingDues: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } }
        }
      }
    ]);

    const stats = summary.length > 0 ? summary[0] : { totalBilled: 0, totalCollected: 0, pendingDues: 0 };
    return res.status(200).json(new ApiResponse(200, { stats }, 'Financial summary fetched successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInvoice,
  getInvoices,
  recordPayment,
  getFinancialSummary
};

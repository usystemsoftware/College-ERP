const Fee = require('./fee.model');
const Payment = require('./payment.model');
const Student = require('../students/student.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET fees for a student
const getStudentFees = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || (await Student.findOne({ user: req.user._id }))?._id;
    if (!studentId) throw new ApiError(404, 'Student not found');
    const fees = await Fee.find({ student: studentId })
      .populate('semester', 'name')
      .populate('academicYear', 'name')
      .sort({ dueDate: 1 });
    return res.json(new ApiResponse(200, fees, 'Fees fetched'));
  } catch (error) { next(error); }
};

// GET all fees (admin view with filters)
const getAllFees = async (req, res, next) => {
  try {
    const { status, semester, feeType, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (status) filter.status = status;
    if (semester) filter.semester = semester;
    if (feeType) filter.feeType = feeType;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .populate('student', 'rollNumber personalDetails.fullName')
        .populate('semester', 'name')
        .sort({ dueDate: 1 }).skip(skip).limit(parseInt(limit)),
      Fee.countDocuments(filter)
    ]);

    return res.json(new ApiResponse(200, {
      fees, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    }, 'Fees fetched'));
  } catch (error) { next(error); }
};

// CREATE fee
const createFee = async (req, res, next) => {
  try {
    let collegeId = req.user.collegeId;
    if (!collegeId) {
      const student = await Student.findById(req.body.student);
      if (student) collegeId = student.collegeId;
    }
    
    const fee = await Fee.create({ ...req.body, generatedBy: req.user._id, collegeId });

    const Notification = require('../notifications/notification.model');
    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Fee Generated',
      message: `A new fee of ₹${fee.totalAmount} has been generated.`,
      type: 'System',
      category: 'Fee',
      collegeId: req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(201).json(new ApiResponse(201, fee, 'Fee created'));
  } catch (error) { next(error); }
};

// BULK create fees (for whole class/department)
const bulkCreateFees = async (req, res, next) => {
  try {
    const { studentIds, semester, academicYear, feeType, totalAmount, dueDate } = req.body;
    if (!studentIds?.length) throw new ApiError(400, 'Student IDs required');
    
    let collegeId = req.user.collegeId;
    if (!collegeId) {
      const student = await Student.findById(studentIds[0]);
      if (student) collegeId = student.collegeId;
    }

    const feeRecords = studentIds.map(studentId => ({
      student: studentId, semester, academicYear, feeType, totalAmount, dueDate,
      generatedBy: req.user._id, collegeId
    }));
    const fees = await Fee.insertMany(feeRecords, { ordered: false });
    return res.status(201).json(new ApiResponse(201, { created: fees.length }, `${fees.length} fee records created`));
  } catch (error) { next(error); }
};

// RECORD payment
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId } = req.body;
    const fee = await Fee.findById(req.params.feeId);
    if (!fee) throw new ApiError(404, 'Fee record not found');
    if (!amount || !paymentMethod || !transactionId) throw new ApiError(400, 'Amount, method, transactionId required');

    const payment = await Payment.create({
      fee: fee._id, student: fee.student, amount, paymentMethod, transactionId,
      status: 'Success', paymentDate: new Date(),
      collectedBy: req.user._id, collegeId: req.user.collegeId,
      receiptNumber: `RCP-${Date.now()}`
    });

    // Update fee paid amount and status
    fee.paidAmount += amount;
    if (fee.paidAmount >= fee.totalAmount) fee.status = 'Paid';
    else if (fee.paidAmount > 0) fee.status = 'Partial';
    await fee.save();

    const Notification = require('../notifications/notification.model');
    const notification = await Notification.create({
      recipient: req.user._id,
      title: 'Payment Recorded',
      message: `A payment of ₹${amount} has been successfully recorded for receipt ${payment.receiptNumber}.`,
      type: 'System',
      category: 'Fee',
      collegeId: req.user.collegeId
    });

    const io = req.app.get('io');
    if (io) {
      io.to(req.user._id.toString()).emit('notification', notification);
    }

    return res.status(201).json(new ApiResponse(201, { payment, fee }, 'Payment recorded'));
  } catch (error) { next(error); }
};

// GET payments for a student
const getPayments = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || (await Student.findOne({ user: req.user._id }))?._id;
    const payments = await Payment.find({ student: studentId })
      .populate('fee', 'feeType totalAmount')
      .sort({ paymentDate: -1 });
    return res.json(new ApiResponse(200, payments, 'Payments fetched'));
  } catch (error) { next(error); }
};

// GET fee stats (dashboard)
const getFeeStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    
    const [totalFees, paidFees, unpaidFees, partialFees] = await Promise.all([
      Fee.countDocuments(filter),
      Fee.countDocuments({ ...filter, status: 'Paid' }),
      Fee.countDocuments({ ...filter, status: 'Unpaid' }),
      Fee.countDocuments({ ...filter, status: 'Partial' })
    ]);
    const totalRevenue = await Payment.aggregate([
      { $match: { ...filter, status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return res.json(new ApiResponse(200, {
      totalFees, paidFees, unpaidFees, partialFees,
      totalRevenue: totalRevenue[0]?.total || 0
    }, 'Fee stats fetched'));
  } catch (error) { next(error); }
};

const getFeeDashboardStats = async (req, res, next) => {
  try {
    const isStudent = req.user.role.name === 'Student';
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    let stats = {};

    if (isStudent) {
      let studentId = req.user._id;
      try {
        const Student = require('../students/student.model');
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) {}

      const invoices = await Fee.find({ student: studentId }).sort({ dueDate: 1 }).lean();
      
      let totalFees = 0;
      let totalPaid = 0;
      let formattedInvoices = [];

      for (let inv of invoices) {
        totalFees += inv.totalAmount;
        totalPaid += inv.paidAmount;
        
        let status = inv.status;
        if (status !== 'Paid' && new Date(inv.dueDate) < new Date()) {
          status = 'Overdue';
        }

        formattedInvoices.push({
          id: inv._id,
          title: `${inv.feeType} Fee`,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          dueDate: new Date(inv.dueDate).toLocaleDateString(),
          status: status,
          feeType: inv.feeType
        });
      }

      stats = {
        invoices: formattedInvoices,
        summary: {
          totalFees,
          totalPaid,
          outstandingBalance: totalFees - totalPaid
        }
      };
    } else {
      const fees = await Fee.aggregate([
        { $match: filter },
        { $group: {
            _id: null,
            totalBilled: { $sum: '$totalAmount' },
            totalCollected: { $sum: '$paidAmount' }
        }}
      ]);
      
      const totalBilled = fees.length > 0 ? fees[0].totalBilled : 0;
      const totalCollected = fees.length > 0 ? fees[0].totalCollected : 0;
      const pendingDues = totalBilled - totalCollected;

      stats = {
        totalBilled,
        totalCollected,
        pendingDues
      };
    }

    return res.json(new ApiResponse(200, stats, 'Fee dashboard stats fetched'));
  } catch (error) { next(error); }
};

module.exports = { getStudentFees, getAllFees, createFee, bulkCreateFees, recordPayment, getPayments, getFeeStats, getFeeDashboardStats };

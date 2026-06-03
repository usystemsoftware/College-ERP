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
    const filter = { collegeId: req.user.collegeId };
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
    const fee = await Fee.create({ ...req.body, generatedBy: req.user._id, collegeId: req.user.collegeId });
    return res.status(201).json(new ApiResponse(201, fee, 'Fee created'));
  } catch (error) { next(error); }
};

// BULK create fees (for whole class/department)
const bulkCreateFees = async (req, res, next) => {
  try {
    const { studentIds, semester, academicYear, feeType, totalAmount, dueDate } = req.body;
    if (!studentIds?.length) throw new ApiError(400, 'Student IDs required');
    const feeRecords = studentIds.map(studentId => ({
      student: studentId, semester, academicYear, feeType, totalAmount, dueDate,
      generatedBy: req.user._id, collegeId: req.user.collegeId
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
    const [totalFees, paidFees, unpaidFees, partialFees] = await Promise.all([
      Fee.countDocuments({ collegeId: req.user.collegeId }),
      Fee.countDocuments({ collegeId: req.user.collegeId, status: 'Paid' }),
      Fee.countDocuments({ collegeId: req.user.collegeId, status: 'Unpaid' }),
      Fee.countDocuments({ collegeId: req.user.collegeId, status: 'Partial' })
    ]);
    const totalRevenue = await Payment.aggregate([
      { $match: { collegeId: req.user.collegeId, status: 'Success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return res.json(new ApiResponse(200, {
      totalFees, paidFees, unpaidFees, partialFees,
      totalRevenue: totalRevenue[0]?.total || 0
    }, 'Fee stats fetched'));
  } catch (error) { next(error); }
};

module.exports = { getStudentFees, getAllFees, createFee, bulkCreateFees, recordPayment, getPayments, getFeeStats };

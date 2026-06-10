const Fee = require('./fee.model');
const FeeStructure = require('./feeStructure.model');
const Payment = require('./payment.model');
const Student = require('../students/student.model');
const Parent = require('../parents/parent.model');
const ApiError = require('../../utils/apiError');
const ApiResponse = require('../../utils/apiResponse');

// GET fees for a student
const getStudentFees = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || (await Student.findOne({ user: req.user._id }))?._id;
    if (!studentId) throw new ApiError(404, 'Student not found');
    const fees = await Fee.find({ student: studentId })
      .populate('academicYear', 'name')
      .populate({
        path: 'feeStructure',
        populate: {
          path: 'heads.category',
          select: 'name isOptional'
        }
      })
      .sort({ createdAt: -1 });
    return res.json(new ApiResponse(200, fees, 'Fees fetched'));
  } catch (error) { next(error); }
};

// GET all fees (admin view with filters)
const getAllFees = async (req, res, next) => {
  try {
    const { status, academicYear, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;
    if (status) filter.status = status;
    if (academicYear) filter.academicYear = academicYear;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [fees, total] = await Promise.all([
      Fee.find(filter)
        .populate('student', 'rollNumber personalDetails.fullName')
        .populate('academicYear', 'name')
        .populate('feeStructure', 'name totalAmount')
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Fee.countDocuments(filter)
    ]);

    return res.json(new ApiResponse(200, {
      fees, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) }
    }, 'Fees fetched'));
  } catch (error) { next(error); }
};

// BULK assign fees using FeeStructure
const bulkCreateFees = async (req, res, next) => {
  try {
    const { studentIds, feeStructureId, installmentsBreakdown, discountAmount = 0, discountRemarks } = req.body;
    
    if (!studentIds?.length) throw new ApiError(400, 'Student IDs required');
    if (!feeStructureId) throw new ApiError(400, 'Fee Structure ID required');
    
    let collegeId = req.user.collegeId;
    if (!collegeId) {
      const student = await Student.findById(studentIds[0]);
      if (student) collegeId = student.collegeId;
    }

    const structure = await FeeStructure.findById(feeStructureId);
    if (!structure) throw new ApiError(404, 'Fee Structure not found');

    // Calculate installments based on the breakdown, or default to 1 installment
    let installments = [];
    const finalTotal = structure.totalAmount - discountAmount;
    
    if (installmentsBreakdown && installmentsBreakdown.length > 0) {
      installments = installmentsBreakdown.map(inst => ({
        amount: inst.amount,
        dueDate: new Date(inst.dueDate),
        status: 'Unpaid',
        paidAmount: 0
      }));
    } else {
      installments = [{
        amount: finalTotal,
        dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // default due date 1 month from now
        status: 'Unpaid',
        paidAmount: 0
      }];
    }

    const feeRecords = studentIds.map(studentId => ({
      student: studentId,
      feeStructure: feeStructureId,
      academicYear: structure.academicYear,
      installments: installments,
      totalAmount: finalTotal,
      paidAmount: 0,
      discountAmount,
      discountRemarks,
      status: 'Unpaid',
      generatedBy: req.user._id,
      collegeId
    }));

    const fees = await Fee.insertMany(feeRecords, { ordered: false });
    return res.status(201).json(new ApiResponse(201, { created: fees.length }, `${fees.length} fee records created`));
  } catch (error) { next(error); }
};

// CREATE ad-hoc fee
const createFee = async (req, res, next) => {
  try {
    let collegeId = req.user.collegeId;
    if (!collegeId) {
      const student = await Student.findById(req.body.student);
      if (student) collegeId = student.collegeId;
    }
    
    const fee = await Fee.create({ ...req.body, generatedBy: req.user._id, collegeId });
    return res.status(201).json(new ApiResponse(201, fee, 'Ad-hoc fee created'));
  } catch (error) { next(error); }
};

// RECORD payment (updated for installments)
const recordPayment = async (req, res, next) => {
  try {
    const { amount, paymentMethod, transactionId, installmentId } = req.body;
    const fee = await Fee.findById(req.params.feeId);
    if (!fee) throw new ApiError(404, 'Fee record not found');
    if (!amount || !paymentMethod || !transactionId) throw new ApiError(400, 'Amount, method, transactionId required');

    // Handle installment specific payment
    if (installmentId) {
      const inst = fee.installments.id(installmentId);
      if (inst) {
        inst.paidAmount += amount;
        if (inst.paidAmount >= inst.amount) inst.status = 'Paid';
        else if (inst.paidAmount > 0) inst.status = 'Partial';
      }
    }

    const payment = await Payment.create({
      fee: fee._id, student: fee.student, amount, paymentMethod, transactionId,
      status: 'Success', paymentDate: new Date(),
      collectedBy: req.user._id, collegeId: req.user.collegeId,
      receiptNumber: `RCP-${Date.now()}`
    });

    // Update overall fee paid amount and status
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
      .populate({ path: 'fee', select: 'title totalAmount feeStructure', populate: { path: 'feeStructure', select: 'name' }})
      .sort({ paymentDate: -1 });
    return res.json(new ApiResponse(200, payments, 'Payments fetched'));
  } catch (error) { next(error); }
};

// GET fee stats (admin dashboard)
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
        const student = await Student.findOne({ user: req.user._id });
        if (student) studentId = student._id;
      } catch (e) {}

      const invoices = await Fee.find({ student: studentId }).populate('feeStructure', 'name').sort({ createdAt: -1 }).lean();
      
      let totalFees = 0;
      let totalPaid = 0;
      let formattedInvoices = [];

      for (let inv of invoices) {
        totalFees += inv.totalAmount;
        totalPaid += inv.paidAmount;
        
        let status = inv.status;
        const title = inv.feeStructure ? inv.feeStructure.name : (inv.title || 'General Fee');

        formattedInvoices.push({
          id: inv._id,
          title: title,
          totalAmount: inv.totalAmount,
          paidAmount: inv.paidAmount,
          status: status,
          installments: inv.installments
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

// GET fees for all students linked to the logged-in parent
const getFeesForParent = async (req, res, next) => {
  try {
    const parent = await Parent.findOne({ user: req.user._id }).select('students fullName');
    if (!parent) throw new ApiError(404, 'Parent profile not found');

    if (!parent.students || parent.students.length === 0) {
      return res.json(new ApiResponse(200, { fees: [], students: [] }, 'No students linked to this parent'));
    }

    // Fetch student details and fees for all linked students
    const students = await Student.find({ _id: { $in: parent.students } })
      .select('rollNumber personalDetails.fullName course department semester')
      .populate('course', 'name code')
      .populate('department', 'name code')
      .lean();

    const feesData = await Promise.all(
      parent.students.map(async (studentId) => {
        const fees = await Fee.find({ student: studentId })
          .populate('academicYear', 'name')
          .populate({
            path: 'feeStructure',
            populate: { path: 'heads.category', select: 'name isOptional' }
          })
          .sort({ createdAt: -1 })
          .lean();

        const student = students.find(s => s._id.toString() === studentId.toString());
        const totalFees = fees.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
        const totalPaid = fees.reduce((sum, f) => sum + (f.paidAmount || 0), 0);

        return {
          student,
          fees,
          summary: {
            totalFees,
            totalPaid,
            outstandingBalance: totalFees - totalPaid
          }
        };
      })
    );

    return res.json(new ApiResponse(200, { feesData }, 'Parent fees fetched successfully'));
  } catch (error) { next(error); }
};

module.exports = { getStudentFees, getAllFees, createFee, bulkCreateFees, recordPayment, getPayments, getFeeStats, getFeeDashboardStats, getFeesForParent };

const Payment = require('../fees/payment.model');
const User = require('../users/user.model');
const ApiResponse = require('../../utils/apiResponse');

const Student = require('../students/student.model');
const Faculty = require('../faculty/faculty.model');
const Application = require('../admission/application.model');

// A dedicated analytics controller that aggregates data from various modules
const getDashboardStats = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role.name !== 'Super Admin') filter.collegeId = req.user.collegeId;

    // 1. Basic Counts
    const totalStudents = await Student.countDocuments(filter);
    const totalFaculty = await Faculty.countDocuments(filter);
    const pendingApprovals = await Application.countDocuments({ ...filter, status: 'Pending' });
    const Department = require('../departments/department.model');
    const Course = require('../courses/course.model');
    const totalDepartments = await Department.countDocuments(filter);
    const totalCourses = await Course.countDocuments(filter);
    
    // 2. Financial Overview
    const feeStats = await Payment.aggregate([
      { $match: { ...filter, status: 'Success' } },
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$amount' }
        }
      }
    ]);

    const stats = {
      totalStudents: totalStudents,
      totalFaculty: totalFaculty,
      totalDepartments: totalDepartments,
      totalCourses: totalCourses,
      pendingApprovals: pendingApprovals,
      revenue: feeStats.length > 0 ? feeStats[0].totalCollected : 0,
      activeCourses: totalCourses,
      revenueData: [
        { name: 'Jan', value: 400000 },
        { name: 'Feb', value: 300000 },
        { name: 'Mar', value: 200000 },
        { name: 'Apr', value: 278000 },
        { name: 'May', value: 189000 },
        { name: 'Jun', value: 239000 },
      ]
    };

    return res.status(200).json(new ApiResponse(200, { stats }, 'Dashboard stats fetched successfully'));
  } catch (error) {
    next(error);
  }
};

// Helper function to resolve role IDs
const getRoleId = async (roleName) => {
  const Role = require('../users/role.model');
  const role = await Role.findOne({ name: roleName });
  return role ? role._id : null;
}

module.exports = {
  getDashboardStats
};

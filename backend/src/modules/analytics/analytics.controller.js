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


    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    
    const monthlyRevenue = await Payment.aggregate([
      { 
        $match: { 
          ...filter, 
          status: 'Success',
          paymentDate: { $gte: startOfYear }
        } 
      },
      {
        $group: {
          _id: { $month: "$paymentDate" },
          revenue: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueData = monthNames.map((month, index) => {
      const monthData = monthlyRevenue.find(item => item._id === index + 1);
      const revenue = monthData ? monthData.revenue : 0;
      return {
        name: month,
        revenue: revenue,
        expenses: Math.floor(revenue * 0.4) // Simulating expenses as 40% of revenue
      };
    });

    // Admission Trends: Applications by week (last 4 weeks)
    const admissionAgg = await Application.aggregate([
      { $match: filter },
      {
        $group: {
          _id: { $week: "$createdAt" },
          students: { $sum: 1 }
        }
      },
      { $sort: { "_id": -1 } },
      { $limit: 4 }
    ]);
    
    const admissionDataRaw = admissionAgg.reverse().map((item, index) => ({
      name: `Week ${index + 1}`,
      students: item.students
    }));
    
    const admissionData = [];
    for(let i = 1; i <= 4; i++) {
      if (i <= admissionDataRaw.length) {
        admissionData.push({ name: `Week ${i}`, students: admissionDataRaw[i - 1].students });
      } else {
        admissionData.push({ name: `Week ${i}`, students: 0 });
      }
    }

    const stats = {
      totalStudents: totalStudents,
      totalFaculty: totalFaculty,
      totalDepartments: totalDepartments,
      totalCourses: totalCourses,
      pendingApprovals: pendingApprovals,
      revenue: feeStats.length > 0 ? feeStats[0].totalCollected : 0,
      activeCourses: totalCourses,
      revenueData: revenueData,
      admissionData: admissionData
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

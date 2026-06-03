const Invoice = require('../fees/fees.model');
const User = require('../users/user.model');
const ApiResponse = require('../../utils/apiResponse');

// A dedicated analytics controller that aggregates data from various modules
const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Basic Counts
    const totalStudents = await User.countDocuments({ role: await getRoleId('Student') });
    const totalFaculty = await User.countDocuments({ role: await getRoleId('Faculty') });
    
    // 2. Financial Overview
    const feeStats = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalCollected: { $sum: '$paidAmount' },
          totalExpected: { $sum: '$totalAmount' }
        }
      }
    ]);

    const stats = {
      totalStudents: totalStudents || 1250, // Fallbacks for mock data UI if DB empty
      totalFaculty: totalFaculty || 85,
      revenue: feeStats.length > 0 ? feeStats[0].totalCollected : 2500000,
      activeCourses: 24, // Static mock for now
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

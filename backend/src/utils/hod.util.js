const Faculty = require('../modules/faculty/faculty.model');
const Department = require('../modules/departments/department.model');

const getDepartmentHodContext = async (userId) => {
  const faculty = await Faculty.findOne({ user: userId }).select('_id fullName department');
  if (!faculty) {
    return { isDepartmentHod: false, faculty: null, departments: [] };
  }

  const departments = await Department.find({ hod: faculty._id }).select('name code');
  return {
    isDepartmentHod: departments.length > 0,
    faculty,
    departments
  };
};

module.exports = { getDepartmentHodContext };

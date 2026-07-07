const { getDepartmentHodContext } = require('./hod.util');
const Student = require('../modules/students/student.model');
const Faculty = require('../modules/faculty/faculty.model');

const buildUserPayload = async (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;

  const roleName = user.role?.name || userObj.role?.name || userObj.role;
  const { isDepartmentHod, departments } = await getDepartmentHodContext(user._id);

  let extraDetails = {
    name: userObj.name,
    phone: userObj.phone,
    address: userObj.address
  };

  try {
    if (roleName === 'Student') {
      const student = await Student.findOne({ user: user._id });
      if (student && student.personalDetails) {
        extraDetails.name = extraDetails.name || student.personalDetails.fullName;
        extraDetails.phone = extraDetails.phone || student.personalDetails.phone;
        extraDetails.address = extraDetails.address || student.personalDetails.address;
      }
    } else if (['Faculty', 'HOD', 'Principal', 'Vice Principal'].includes(roleName)) {
      const faculty = await Faculty.findOne({ user: user._id });
      if (faculty && faculty.personalDetails) {
        extraDetails.name = extraDetails.name || faculty.personalDetails.fullName;
        extraDetails.phone = extraDetails.phone || faculty.personalDetails.phone;
        extraDetails.address = extraDetails.address || faculty.personalDetails.address;
      }
    }
  } catch (err) {
    console.error('Error fetching extra details in payload:', err);
  }

  return {
    ...userObj,
    ...extraDetails,
    role: roleName,
    isDepartmentHod,
    hodDepartments: departments.map((d) => ({ _id: d._id, name: d.name, code: d.code }))
  };
};

module.exports = { buildUserPayload };

const { getDepartmentHodContext } = require('./hod.util');

const buildUserPayload = async (user) => {
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.refreshToken;

  const roleName = user.role?.name || userObj.role?.name || userObj.role;
  const { isDepartmentHod, departments } = await getDepartmentHodContext(user._id);

  return {
    ...userObj,
    role: roleName,
    isDepartmentHod,
    hodDepartments: departments.map((d) => ({ _id: d._id, name: d.name, code: d.code }))
  };
};

module.exports = { buildUserPayload };

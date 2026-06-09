require('dotenv').config();
const mongoose = require('./src/config/db');
const User = require('./src/modules/users/user.model');
const Role = require('./src/modules/roles/role.model');
const Faculty = require('./src/modules/faculty/faculty.model');

const testQuery = async () => {
  await mongoose();
  console.log("DB Connected");
  
  const targetRoles = await Role.find({ name: { $in: ['HOD', 'College Admin', 'Super Admin'] } });
  const targetRoleIds = targetRoles.map(r => r._id);
  
  const adminsAndHods = await User.find({ role: { $in: targetRoleIds } }).populate('role', 'name');
  console.log(`Found ${adminsAndHods.length} target users`);
  
  for (let admin of adminsAndHods) {
    console.log(`Admin: ${admin.email}, Role: ${admin.role?.name}`);
    if (admin.role?.name === 'HOD') {
      const hodProfile = await Faculty.findOne({ user: admin._id }).populate('department', 'name code');
      if (hodProfile) {
        console.log(`  HOD Profile found: Dept = ${hodProfile.department?.name || 'none'}`);
      } else {
        console.log(`  NO HOD Profile found for ${admin.email}`);
      }
    }
  }
  
  process.exit(0);
};

testQuery();

require('dotenv').config();
const mongoose = require('./src/config/db');
const User = require('./src/modules/users/user.model');
const Role = require('./src/modules/roles/role.model');

const fixRoles = async () => {
  try {
    await mongoose();
    console.log("Connected to DB");
    const hodRole = await Role.findOne({ name: 'HOD' });
    if (!hodRole) {
      console.log("HOD role not found");
      return;
    }
    
    // Fix specific users who were supposed to be HOD
    const result = await User.updateMany(
      { email: { $in: ['shubham21@gmail.com', 'nancy@gmail.com'] } },
      { $set: { role: hodRole._id } }
    );
    
    console.log(`Updated ${result.modifiedCount} users to HOD role`);
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

fixRoles();

require('dotenv').config();
const mongoose = require('./src/config/db');
const User = require('./src/modules/users/user.model');
const Role = require('./src/modules/roles/role.model');

const testQuery = async () => {
  await mongoose();
  console.log("DB Connected");
  
  const users = await User.find({ email: { $in: ['sakshi@gmail.com', 'shubham@gmail.com', 'superadmin@erp.com'] } }).populate('role', 'name');
  console.log("Users found:", users.length);
  for (let u of users) {
    console.log(`Email: ${u.email}, Role: ${u.role?.name}, Password: ${u.password}`);
  }
  
  process.exit(0);
};

testQuery();

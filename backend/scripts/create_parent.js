const mongoose = require('mongoose');
const User = require('./src/modules/users/user.model');
const Role = require('./src/modules/roles/role.model');
const Parent = require('./src/modules/parents/parent.model');
const Student = require('./src/modules/students/student.model');
const College = require('./src/modules/colleges/college.model');
require('dotenv').config();

const createTestParent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let parentRole = await Role.findOne({ name: 'Parent' });
    if (!parentRole) {
      parentRole = await Role.create({
        name: 'Parent',
        description: 'Parent / Guardian role',
        permissions: ['read_own_child_data']
      });
      console.log('Created Parent role');
    }

    const college = await College.findOne();
    if (!college) {
      console.log('No college found. Cannot create parent.');
      process.exit(1);
    }

    const student = await Student.findOne();
    if (!student) {
      console.log('No student found in DB. Please create a student first.');
      process.exit(1);
    }

    const parentEmail = 'parent@example.com';
    let parentUser = await User.findOne({ email: parentEmail });
    
    if (parentUser) {
      console.log('Parent user already exists:', parentEmail);
    } else {
      parentUser = await User.create({
        email: parentEmail,
        password: 'password123',
        role: parentRole._id,
        collegeId: college._id,
        status: 'Active',
        isVerified: true
      });
      console.log('Created Parent user account');
    }

    let parentProfile = await Parent.findOne({ user: parentUser._id });
    if (parentProfile) {
      console.log('Parent profile already exists');
    } else {
      parentProfile = await Parent.create({
        user: parentUser._id,
        fullName: 'John Doe (Parent)',
        phone: '9876543210',
        email: parentEmail,
        occupation: 'Software Engineer',
        relation: 'Father',
        students: [student._id],
        collegeId: college._id
      });
      
      await Student.findByIdAndUpdate(student._id, { parent: parentProfile._id });
      
      console.log('Created Parent profile and linked to student');
    }

    console.log('\n--- SUCCESS! ---');
    console.log('You can now log in to the Parent Portal with:');
    console.log(`Email:    ${parentEmail}`);
    console.log(`Password: password123`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

createTestParent();

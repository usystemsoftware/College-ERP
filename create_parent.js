const mongoose = require('mongoose');
const User = require('./backend/src/modules/users/user.model');
const Role = require('./backend/src/modules/roles/role.model');
const Parent = require('./backend/src/modules/parents/parent.model');
const Student = require('./backend/src/modules/students/student.model');
const College = require('./backend/src/modules/colleges/college.model');
require('dotenv').config({ path: './backend/.env' });

const createTestParent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Get or Create Parent Role
    let parentRole = await Role.findOne({ name: 'Parent' });
    if (!parentRole) {
      parentRole = await Role.create({
        name: 'Parent',
        description: 'Parent / Guardian role',
        permissions: ['read_own_child_data']
      });
      console.log('Created Parent role');
    }

    // 2. Find a College
    const college = await College.findOne();
    if (!college) {
      console.log('No college found. Cannot create parent.');
      process.exit(1);
    }

    // 3. Find a Student to link
    const student = await Student.findOne();
    if (!student) {
      console.log('No student found in DB. Please create a student first.');
      process.exit(1);
    }

    // 4. Create User Account for Parent
    const parentEmail = 'parent@example.com';
    let parentUser = await User.findOne({ email: parentEmail });
    
    if (parentUser) {
      console.log('Parent user already exists:', parentEmail);
    } else {
      parentUser = await User.create({
        email: parentEmail,
        password: 'password123', // Will be hashed by pre-save hook
        role: parentRole._id,
        collegeId: college._id,
        status: 'Active',
        isVerified: true
      });
      console.log('Created Parent user account');
    }

    // 5. Create Parent Profile
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
        students: [student._id], // Link to student
        collegeId: college._id
      });
      
      // Also update the student document to link back to the parent
      await Student.findByIdAndUpdate(student._id, { parent: parentProfile._id });
      
      console.log('Created Parent profile and linked to student:', student.personalDetails?.fullName || student._id);
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

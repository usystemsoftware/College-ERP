require('dotenv').config();
const mongoose = require('mongoose');
const Role = require('../modules/roles/role.model');
const User = require('../modules/users/user.model');
const College = require('../modules/colleges/college.model');

const rolesToSeed = [
  { name: 'Super Admin', description: 'Root admin with access to all modules and multi-college scopes', permissions: ['*'] },
  { name: 'College Admin', description: 'Administrative manager for a single college branch', permissions: ['admin:*'] },
  { name: 'Principal', description: 'Academic head of college', permissions: ['academic:read', 'academic:write', 'reports:read'] },
  { name: 'Vice Principal', description: 'Assistant academic head of college', permissions: ['academic:read', 'academic:write'] },
  { name: 'HOD', description: 'Head of Department', permissions: ['department:read', 'department:write'] },
  { name: 'Faculty', description: 'Professor/Teacher allocating subjects and grading', permissions: ['lms:write', 'attendance:write', 'marks:write'] },
  { name: 'Class Coordinator', description: 'Manages a class division timetable and student roster', permissions: ['timetable:write', 'student:read'] },
  { name: 'Admission Officer', description: 'Handles verification and onboarding for students', permissions: ['admission:write'] },
  { name: 'Accountant', description: 'Processes fee collections, ledger balances, and expense vouchers', permissions: ['finance:write'] },
  { name: 'Librarian', description: 'Issues, returns, and tracks books and catalogs', permissions: ['library:write'] },
  { name: 'Transport Manager', description: 'Coordinates routes and vehicles', permissions: ['transport:write'] },
  { name: 'Hostel Manager', description: 'Allocates rooms and monitors visitor records', permissions: ['hostel:write'] },
  { name: 'Exam Controller', description: 'Schedules exams and processes hall tickets', permissions: ['exams:write'] },
  { name: 'Placement Officer', description: 'Invites companies and updates student placement details', permissions: ['placements:write'] },
  { name: 'Event Coordinator', description: 'Approves and organizes campus festivals and workshops', permissions: ['events:write'] },
  { name: 'Security Officer', description: 'Checks visitors and validates gate passes', permissions: ['gatepass:write'] },
  { name: 'Student', description: 'Enrolled learner accessing courses, notes, and profile details', permissions: ['profile:read', 'lms:read', 'attendance:read'] },
  { name: 'Parent', description: 'Parent map receiving attendance status and fees due reminders', permissions: ['student:read'] },
  { name: 'Alumni', description: 'Graduated students updating academic histories', permissions: ['alumni:read'] },
  { name: 'Recruiter', description: 'Company HR scanning candidates', permissions: ['placements:read'] }
];

const seedDatabase = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to Database.');

    // 1. Seed Roles
    console.log('Cleaning existing roles...');
    await Role.deleteMany({});
    console.log('Seeding roles...');
    const seededRoles = await Role.insertMany(rolesToSeed);
    console.log(`Seeded ${seededRoles.length} roles.`);

    // 2. Seed default College
    console.log('Cleaning existing colleges...');
    await College.deleteMany({});
    const defaultCollege = await College.create({
      name: 'State Institute of Technology',
      code: 'SIT001',
      address: 'Educational Campus, Tech Zone 1',
      status: 'Active'
    });
    console.log(`Seeded college: ${defaultCollege.name} [Code: ${defaultCollege.code}]`);

    // 3. Seed Super Admin
    console.log('Cleaning existing superadmin users...');
    const superAdminRole = seededRoles.find(r => r.name === 'Super Admin');
    await User.deleteMany({ email: 'superadmin@erp.com' });

    const superAdminUser = await User.create({
      email: 'superadmin@erp.com',
      password: 'admin123', // will be hashed by pre-save schema middleware
      role: superAdminRole._id,
      collegeId: defaultCollege._id,
      isVerified: true,
      status: 'Active'
    });
    console.log(`Seeded Super Admin: ${superAdminUser.email} / admin123`);

    console.log('Database Seeding Completed Successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();

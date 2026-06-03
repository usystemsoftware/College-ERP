require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./src/app');
const connectDB = async () => {
  const conn = require('./src/config/db');
  await conn();
};

const PORT = process.env.PORT || 5000;

const seedDatabaseIfEmpty = async () => {
  try {
    const Role = require('./src/modules/roles/role.model');
    const User = require('./src/modules/users/user.model');
    const College = require('./src/modules/colleges/college.model');

    const roleCount = await Role.countDocuments();
    if (roleCount > 0) {
      console.log('[Self-Seeder] Database already contains roles. Skipping auto-seed.');
      return;
    }

    console.log('[Self-Seeder] Database empty. Starting auto-seed...');

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

    const seededRoles = await Role.insertMany(rolesToSeed);
    console.log(`[Self-Seeder] Seeded ${seededRoles.length} roles.`);

    const defaultCollege = await College.create({
      name: 'State Institute of Technology',
      code: 'SIT001',
      address: 'Educational Campus, Tech Zone 1',
      status: 'Active'
    });
    console.log(`[Self-Seeder] Seeded default college: ${defaultCollege.name}`);

    const superAdminRole = seededRoles.find(r => r.name === 'Super Admin');
    const superAdminUser = await User.create({
      email: 'superadmin@erp.com',
      password: 'admin123',
      role: superAdminRole._id,
      collegeId: defaultCollege._id,
      isVerified: true,
      status: 'Active'
    });
    console.log(`[Self-Seeder] Seeded default Super Admin user: ${superAdminUser.email}`);
    console.log('[Self-Seeder] Auto-seeding completed successfully.');
  } catch (error) {
    console.error('[Self-Seeder] Auto-seeding failed:', error);
  }
};

// Connect to MongoDB
connectDB().then(async () => {
  const server = http.createServer(app);

  // Auto seed database if empty
  await seedDatabaseIfEmpty();

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true
    }
  });

  // Socket connection handler
  io.on('connection', (socket) => {
    console.log(`[Socket.io] User connected: ${socket.id}`);

    // Handle user joining their specific workspace/role room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`[Socket.io] User ${socket.id} joined room ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] User disconnected: ${socket.id}`);
    });
  });

  // Attach io to app context for controllers to broadcast events
  app.set('io', io);

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to start server due to DB connection failure:', err);
  process.exit(1);
});


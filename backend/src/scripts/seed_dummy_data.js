require('dotenv').config();
const mongoose = require('mongoose');

// Load Models
const Role = require('../modules/roles/role.model');
const College = require('../modules/colleges/college.model');
const Department = require('../modules/departments/department.model');
const Course = require('../modules/courses/course.model');
const AcademicYear = require('../modules/academicYears/academicYear.model');
const Semester = require('../modules/semesters/semester.model');
const Subject = require('../modules/subjects/subject.model');
const User = require('../modules/users/user.model');
const Faculty = require('../modules/faculty/faculty.model');
const Student = require('../modules/students/student.model');
const { Book } = require('../modules/library/library.model');
const { Hostel } = require('../modules/hostel/hostel.model');

// Connect to DB
const connectDB = require('../config/db');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Dummy Seeder] Connected to database.');

    const college = await College.findOne();
    if (!college) throw new Error('No college found. Run main server.js first to auto-seed superadmin and college.');

    const facultyRole = await Role.findOne({ name: 'Faculty' });
    const studentRole = await Role.findOne({ name: 'Student' });

    if (!facultyRole || !studentRole) throw new Error('Roles not found.');

    console.log('[Dummy Seeder] Fetching or Creating Academic Year...');
    let academicYear = await AcademicYear.findOne({ isCurrent: true });
    if (!academicYear) {
      academicYear = await AcademicYear.create({
        name: '2023-2024',
        startDate: new Date('2023-08-01'),
        endDate: new Date('2024-05-31'),
        isCurrent: true
      });
    }

    console.log('[Dummy Seeder] Creating Departments...');
    const deptsData = [
      { name: 'Computer Science and Engineering', code: 'CSE', collegeId: college._id },
      { name: 'Mechanical Engineering', code: 'ME', collegeId: college._id },
      { name: 'Electrical Engineering', code: 'EE', collegeId: college._id },
      { name: 'Civil Engineering', code: 'CE', collegeId: college._id }
    ];
    const departments = [];
    for (const d of deptsData) {
      const dept = await Department.findOneAndUpdate({ code: d.code }, d, { upsert: true, new: true });
      departments.push(dept);
    }

    console.log('[Dummy Seeder] Creating Courses...');
    const cseDept = departments.find(d => d.code === 'CSE');
    const meDept = departments.find(d => d.code === 'ME');

    const courseData = [
      { name: 'B.Tech Computer Science', code: 'BTECH-CSE', department: cseDept._id, durationSemesters: 8, collegeId: college._id },
      { name: 'B.Tech Mechanical', code: 'BTECH-ME', department: meDept._id, durationSemesters: 8, collegeId: college._id }
    ];
    const courses = [];
    for (const c of courseData) {
      const crs = await Course.findOneAndUpdate({ code: c.code }, c, { upsert: true, new: true });
      courses.push(crs);
    }

    console.log('[Dummy Seeder] Creating Semesters...');
    const semesters = [];
    for (let i = 1; i <= 8; i++) {
      const sem = await Semester.findOneAndUpdate(
        { name: `Semester ${i}`, academicYear: academicYear._id },
        { 
          name: `Semester ${i}`, 
          academicYear: academicYear._id,
          startDate: new Date('2023-08-01'),
          endDate: new Date('2023-12-15'),
          isCurrent: i === 1
        },
        { upsert: true, new: true }
      );
      semesters.push(sem);
    }

    console.log('[Dummy Seeder] Creating Subjects...');
    const subjectsData = [
      { name: 'Data Structures and Algorithms', code: 'CS201', course: courses[0]._id, semester: semesters[0]._id, department: cseDept._id, collegeId: college._id, credits: 4 },
      { name: 'Database Management Systems', code: 'CS301', course: courses[0]._id, semester: semesters[0]._id, department: cseDept._id, collegeId: college._id, credits: 3 },
      { name: 'Engineering Mechanics', code: 'ME101', course: courses[1]._id, semester: semesters[0]._id, department: meDept._id, collegeId: college._id, credits: 4 }
    ];
    for (const s of subjectsData) {
      await Subject.findOneAndUpdate({ code: s.code }, s, { upsert: true });
    }

    console.log('[Dummy Seeder] Creating Faculty...');
    const facultyNames = ['John Doe', 'Jane Smith', 'Alan Turing', 'Grace Hopper'];
    for (let i = 0; i < facultyNames.length; i++) {
      const email = `faculty${i+1}@erp.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, password: 'password123', role: facultyRole._id, collegeId: college._id, isVerified: true });
      }
      await Faculty.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id, employeeId: `EMP00${i+1}`, fullName: facultyNames[i], designation: 'Assistant Professor',
          department: i < 2 ? cseDept._id : meDept._id, joiningDate: new Date('2020-01-15'), collegeId: college._id,
          phone: '9876543210'
        },
        { upsert: true }
      );
    }

    console.log('[Dummy Seeder] Creating Students...');
    for (let i = 1; i <= 20; i++) {
      const email = `student${i}@erp.com`;
      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({ email, password: 'password123', role: studentRole._id, collegeId: college._id, isVerified: true });
      }
      await Student.findOneAndUpdate(
        { user: user._id },
        {
          user: user._id, rollNumber: `ROLL10${i}`, enrollmentNumber: `ENR202310${i}`,
          department: i <= 10 ? cseDept._id : meDept._id, course: i <= 10 ? courses[0]._id : courses[1]._id,
          semester: semesters[0]._id, division: 'A', batch: '2023', collegeId: college._id,
          personalDetails: { fullName: `Student ${i}`, dob: new Date('2003-05-10'), gender: i % 2 === 0 ? 'Female' : 'Male', phone: '1234567890', address: 'Campus Hostel' }
        },
        { upsert: true }
      );
    }

    console.log('[Dummy Seeder] Creating Library Books...');
    const books = [
      { title: 'Introduction to Algorithms', author: 'Cormen', isbn: '9780262033848', totalCopies: 10, availableCopies: 10, collegeId: college._id },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', totalCopies: 5, availableCopies: 5, collegeId: college._id },
      { title: 'Design of Machine Elements', author: 'V.B. Bhandari', isbn: '9780070681798', totalCopies: 8, availableCopies: 8, collegeId: college._id }
    ];
    for (const b of books) {
      await Book.findOneAndUpdate({ isbn: b.isbn }, b, { upsert: true });
    }

    console.log('[Dummy Seeder] Creating Hostels...');
    const hostels = [
      { name: 'Boys Hostel A', type: 'Boys', capacity: 200, collegeId: college._id },
      { name: 'Girls Hostel A', type: 'Girls', capacity: 150, collegeId: college._id }
    ];
    for (const h of hostels) {
      await Hostel.findOneAndUpdate({ name: h.name }, h, { upsert: true });
    }

    console.log('[Dummy Seeder] Dummy data seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Dummy Seeder] Error:', err);
    process.exit(1);
  }
};

seedData();

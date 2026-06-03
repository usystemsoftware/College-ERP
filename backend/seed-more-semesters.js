require('dotenv').config();
const mongoose = require('mongoose');
const AcademicYear = require('./src/modules/academicYears/academicYear.model.js');
const Semester = require('./src/modules/semesters/semester.model.js');

const seedSemesters = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    let year = await AcademicYear.findOne({ name: '2024-2025' });
    if (!year) {
      year = await AcademicYear.create({ name: '2024-2025', startDate: new Date('2024-08-01'), endDate: new Date('2025-05-31'), isCurrent: true });
    }

    const semesterNames = [
      'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4',
      'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'
    ];

    for (let i = 0; i < semesterNames.length; i++) {
      const name = semesterNames[i];
      const exists = await Semester.findOne({ name });
      if (!exists) {
        await Semester.create({
          name,
          academicYear: year._id,
          startDate: new Date('2024-08-01'),
          endDate: new Date('2025-05-31'),
          isCurrent: i === 0
        });
        console.log(`Created ${name}`);
      }
    }
    
    console.log('Seed completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedSemesters();

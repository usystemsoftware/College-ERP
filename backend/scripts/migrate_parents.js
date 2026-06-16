const mongoose = require('mongoose');
const Student = require('./src/modules/students/student.model');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.mongodb.net/college-erp?retryWrites=true&w=majority');
    console.log('Connected to MongoDB');
    
    const students = await Student.find({ parent: { $exists: true, $ne: null } });
    console.log(`Found ${students.length} students to migrate`);
    
    let count = 0;
    for (const student of students) {
      if (!student.parents) student.parents = [];
      if (student.parents.length === 0) {
        student.parents.push(student.parent);
        await student.save();
        count++;
      }
    }
    
    console.log(`Successfully migrated ${count} students.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

migrate();

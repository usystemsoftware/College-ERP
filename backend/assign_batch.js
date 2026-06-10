const mongoose = require('mongoose');
const Student = require('./src/modules/students/student.model');
const Batch = require('./src/modules/batches/batch.model');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  console.log('Connected to DB');
  
  // Find the 2024-2026 batch
  const batch = await Batch.findOne({ name: '2024-2026' });
  if (!batch) {
    console.log('Batch 2024-2026 not found!');
    process.exit(1);
  }

  // Assign this batch to all students
  const result = await Student.updateMany({}, { $set: { batch: batch._id } });
  
  console.log(`Successfully assigned batch 2024-2026 to ${result.modifiedCount} students!`);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});

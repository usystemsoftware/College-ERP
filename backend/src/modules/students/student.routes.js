const express = require('express');
const router = express.Router();
const studentController = require('./student.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Admission Officer'), studentController.getStudents);
router.get('/:id', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), studentController.getStudentById);
router.post('/', authorize('Super Admin', 'College Admin', 'Admission Officer'), studentController.createStudent);

module.exports = router;

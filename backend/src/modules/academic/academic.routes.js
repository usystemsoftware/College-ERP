const express = require('express');
const router = express.Router();
const academicController = require('./academic.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// Departments
router.get('/departments', academicController.getDepartments);
router.post('/departments', authorize('Super Admin', 'College Admin', 'Principal'), academicController.createDepartment);

// Courses
router.get('/courses', academicController.getCourses);
router.post('/courses', authorize('Super Admin', 'College Admin', 'Principal'), academicController.createCourse);

// Batches
router.get('/batches', academicController.getBatches);
router.post('/batches', authorize('Super Admin', 'College Admin', 'Principal'), academicController.createBatch);

module.exports = router;

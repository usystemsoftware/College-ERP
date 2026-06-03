const express = require('express');
const router = express.Router();
const facultyController = require('./faculty.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Admission Officer', 'Student'), facultyController.getFacultyList);
router.get('/:id', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), facultyController.getFacultyById);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), facultyController.createFaculty);

module.exports = router;

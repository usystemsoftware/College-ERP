const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getCourses, getCourse, createCourse, updateCourse, deleteCourse } = require('./course.controller');

const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal', 'HOD'];

router.get('/', protect, getCourses);
router.get('/:id', protect, getCourse);
router.post('/', protect, authorize(...ADMIN_ROLES), createCourse);
router.put('/:id', protect, authorize(...ADMIN_ROLES), updateCourse);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteCourse);

module.exports = router;

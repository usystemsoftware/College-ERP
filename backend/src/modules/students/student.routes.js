const express = require('express');
const router = express.Router();

const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMyProfile } = require('./student.controller');

const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal', 'HOD', 'Admission Officer'];
const VIEW_ROLES = [...ADMIN_ROLES, 'Faculty', 'Class Coordinator', 'Accountant'];

router.get('/me', protect, getMyProfile);
router.get('/', protect, authorize(...VIEW_ROLES), getStudents);
router.get('/:id', protect, authorize(...VIEW_ROLES), getStudent);
router.post('/', protect, authorize(...ADMIN_ROLES), createStudent);
router.put('/:id', protect, authorize(...ADMIN_ROLES), updateStudent);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteStudent);


module.exports = router;

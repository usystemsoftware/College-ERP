const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const studentController = require('./student.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Admission Officer'), studentController.getStudents);
router.get('/:id', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), studentController.getStudentById);
router.post('/', authorize('Super Admin', 'College Admin', 'Admission Officer'), studentController.createStudent);
=======
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
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af

module.exports = router;

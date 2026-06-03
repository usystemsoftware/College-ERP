const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const facultyController = require('./faculty.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

router.get('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Admission Officer', 'Student'), facultyController.getFacultyList);
router.get('/:id', authorize('Super Admin', 'College Admin', 'Principal', 'HOD', 'Faculty', 'Student'), facultyController.getFacultyById);
router.post('/', authorize('Super Admin', 'College Admin', 'Principal', 'HOD'), facultyController.createFaculty);
=======
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getFaculty, getFacultyMember, createFaculty, updateFaculty, deleteFaculty, getMyFacultyProfile } = require('./faculty.controller');

const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal'];

router.get('/me', protect, getMyFacultyProfile);
router.get('/', protect, authorize(...ADMIN_ROLES, 'HOD', 'Faculty', 'Class Coordinator'), getFaculty);
router.get('/:id', protect, getFacultyMember);
router.post('/', protect, authorize(...ADMIN_ROLES), createFaculty);
router.put('/:id', protect, authorize(...ADMIN_ROLES, 'HOD'), updateFaculty);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteFaculty);
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af

module.exports = router;

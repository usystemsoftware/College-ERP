const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getFaculty, getFacultyMember, createFaculty, updateFaculty, deleteFaculty, getMyFacultyProfile, getFacultyDashboardStats } = require('./faculty.controller');

const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal'];

router.get('/dashboard', protect, getFacultyDashboardStats);
router.get('/me', protect, getMyFacultyProfile);
router.get('/', protect, authorize(...ADMIN_ROLES, 'HOD', 'Faculty', 'Class Coordinator', 'HR'), getFaculty);
router.get('/:id', protect, getFacultyMember);
router.post('/', protect, authorize(...ADMIN_ROLES), createFaculty);
router.put('/:id', protect, authorize(...ADMIN_ROLES, 'HOD'), updateFaculty);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteFaculty);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const {
  getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment
} = require('./department.controller');

const ADMIN_ROLES = ['Super Admin', 'College Admin', 'Principal'];

router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartment);
router.post('/', protect, authorize(...ADMIN_ROLES), createDepartment);
router.put('/:id', protect, authorize(...ADMIN_ROLES), updateDepartment);
router.delete('/:id', protect, authorize('Super Admin', 'College Admin'), deleteDepartment);

module.exports = router;

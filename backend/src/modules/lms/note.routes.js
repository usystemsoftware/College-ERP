const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getNotes, createNote, updateNote, deleteNote, incrementDownload } = require('./note.controller');

router.get('/', protect, getNotes);
router.post('/', protect, authorize('Faculty', 'HOD', 'Principal', 'College Admin', 'Super Admin'), createNote);
router.put('/:id', protect, authorize('Faculty', 'HOD', 'Principal', 'College Admin', 'Super Admin'), updateNote);
router.delete('/:id', protect, authorize('Faculty', 'HOD', 'College Admin', 'Super Admin'), deleteNote);
router.patch('/:id/download', protect, incrementDownload);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getBooks, createBook, updateBook, issueBook, returnBook, getMyIssues } = require('./library.controller');

router.get('/books', protect, getBooks);
router.post('/books', protect, authorize('Librarian', 'College Admin', 'Super Admin'), createBook);
router.put('/books/:id', protect, authorize('Librarian', 'College Admin', 'Super Admin'), updateBook);
router.post('/books/:bookId/issue', protect, authorize('Librarian', 'College Admin', 'Super Admin'), issueBook);
router.patch('/issues/:issueId/return', protect, authorize('Librarian', 'College Admin', 'Super Admin'), returnBook);
router.get('/my-issues', protect, getMyIssues);

module.exports = router;

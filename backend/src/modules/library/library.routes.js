const express = require('express');
const router = express.Router();
<<<<<<< HEAD
const libraryController = require('./library.controller');
const { protect, authorize } = require('../../middleware/authMiddleware');

router.use(protect);

// Books Catalog
router.post('/books', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.addBook);
router.get('/books', libraryController.getBooks); // All logged in users can view catalog

// Circulation
router.post('/issue', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.issueBook);
router.put('/return/:id', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.returnBook);
router.get('/circulation', libraryController.getCirculationHistory); // Admins can query by userId, Students see own
=======
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');
const { getBooks, createBook, updateBook, issueBook, returnBook, getMyIssues } = require('./library.controller');

router.get('/books', protect, getBooks);
router.post('/books', protect, authorize('Librarian', 'College Admin', 'Super Admin'), createBook);
router.put('/books/:id', protect, authorize('Librarian', 'College Admin', 'Super Admin'), updateBook);
router.post('/books/:bookId/issue', protect, authorize('Librarian', 'College Admin', 'Super Admin'), issueBook);
router.patch('/issues/:issueId/return', protect, authorize('Librarian', 'College Admin', 'Super Admin'), returnBook);
router.get('/my-issues', protect, getMyIssues);
>>>>>>> 7b4a3a7751aa63252c46edeef69f5e1c88a642af

module.exports = router;

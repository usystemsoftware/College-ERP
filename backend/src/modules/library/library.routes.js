const express = require('express');
const router = express.Router();
const libraryController = require('./library.controller');
const { protect } = require('../../middleware/authMiddleware');
const { authorize } = require('../../middleware/roleMiddleware');

router.use(protect);

// Dashboard
router.get('/dashboard', libraryController.getLibraryDashboardStats);

// Books Catalog
router.post('/books', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.addBook);
router.get('/books', libraryController.getBooks); // All logged in users can view catalog

// Circulation
router.post('/issue', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.issueBook);
router.put('/return/:id', authorize('Super Admin', 'College Admin', 'Librarian'), libraryController.returnBook);
router.get('/circulation', libraryController.getCirculationHistory); // Admins can query by userId, Students see own

module.exports = router;

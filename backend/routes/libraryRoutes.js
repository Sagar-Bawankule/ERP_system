const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
    getBooks,
    addBook,
    updateBook,
    deleteBook,
    getEligibleUsers,
    issueBook,
    returnBook,
    getIssuedBooks,
    getLibraryDashboard,
} = require('../controllers/libraryController');

// All routes require authentication
router.use(protect);
router.use(authorize('librarian', 'super_admin', 'admin'));

// Dashboard
router.get('/dashboard', getLibraryDashboard);

// Books CRUD
router.get('/books', getBooks);
router.post('/books', addBook);
router.put('/books/:id', updateBook);
router.delete('/books/:id', deleteBook);

// Eligible borrowers
router.get('/eligible-users', getEligibleUsers);

// Issue / Return
router.get('/issues', getIssuedBooks);
router.post('/issue', issueBook);
router.put('/return/:issueId', returnBook);

module.exports = router;

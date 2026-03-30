const express = require('express');
const router = express.Router();
const {
    uploadNote,
    getNotes,
    getNote,
    downloadNote,
    updateNote,
    deleteNote,
    getNotesBySubject,
    getMyNotes,
    getMyAssignedNotes,
    getNoteStats,
} = require('../controllers/noteController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Teacher routes
router.post('/', authorize('teacher'), uploadMiddleware('noteFile'), uploadNote);
router.get('/my-notes', authorize('teacher'), getMyNotes);
router.get('/:id/stats', authorize('teacher', 'admin'), getNoteStats);
router.put('/:id', authorize('teacher', 'admin'), uploadMiddleware('noteFile'), updateNote);
router.delete('/:id', authorize('teacher', 'admin'), deleteNote);

// Student routes
router.get('/my-assigned', authorize('student'), getMyAssignedNotes);

// All authenticated users
router.get('/', getNotes);
router.get('/:id', getNote);
router.get('/:id/download', downloadNote);
router.get('/subject/:subjectId', getNotesBySubject);

module.exports = router;

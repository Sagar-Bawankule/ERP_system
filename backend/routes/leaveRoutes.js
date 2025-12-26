const express = require('express');
const router = express.Router();
const {
    applyLeave,
    getMyLeaves,
    getAllLeaves,
    getPendingLeaves,
    reviewLeave,
    cancelLeave,
    getLeaveAnalytics,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Student and Teacher can apply
router.post('/', authorize('student', 'teacher'), uploadMiddleware('multipleDocuments'), applyLeave);
router.get('/my-leaves', getMyLeaves);
router.put('/:id/cancel', cancelLeave);

// Admin only routes
router.get('/', authorize('admin'), getAllLeaves);
router.get('/pending', authorize('admin'), getPendingLeaves);
router.put('/:id/review', authorize('admin'), reviewLeave);
router.get('/analytics', authorize('admin'), getLeaveAnalytics);

module.exports = router;

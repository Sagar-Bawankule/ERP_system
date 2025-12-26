const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getClassAttendance,
    getStudentAttendance,
    getAttendanceSummary,
    getAttendanceAnalytics,
    updateAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Teacher routes
router.post('/mark', authorize('teacher'), markAttendance);
router.put('/:id', authorize('teacher', 'admin'), updateAttendance);

// Teacher and Admin routes
router.get('/class', authorize('teacher', 'admin'), getClassAttendance);
router.get('/analytics', authorize('teacher', 'admin'), getAttendanceAnalytics);

// All authenticated users (students can see their own)
router.get('/student/:studentId', getStudentAttendance);
router.get('/summary/:studentId', getAttendanceSummary);

module.exports = router;

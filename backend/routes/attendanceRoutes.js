const express = require('express');
const router = express.Router();
const {
    markAttendance,
    getClassAttendance,
    getStudentAttendance,
    getAttendanceSummary,
    getAttendanceAnalytics,
    updateAttendance,
    selfMarkAttendance,
    selfMarkFaceAttendance,
    getFingerprintSensorStatus,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

// All routes are protected
router.use(protect);

// Teacher routes
router.post('/mark', authorize('teacher'), markAttendance);
router.put('/:id', authorize('teacher', 'admin'), updateAttendance);

// Student routes
router.post('/self-mark', authorize('student'), selfMarkAttendance);
router.post('/self-mark-face', authorize('student'), uploadMiddleware('faceCapture'), selfMarkFaceAttendance);
router.get('/sensor-status', authorize('student'), getFingerprintSensorStatus);

// Teacher and Admin routes
router.get('/class', authorize('teacher', 'admin'), getClassAttendance);
router.get('/analytics', authorize('teacher', 'admin'), getAttendanceAnalytics);

// All authenticated users (students can see their own)
router.get('/student/:studentId', getStudentAttendance);
router.get('/summary/:studentId', getAttendanceSummary);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
    createMeeting,
    getAllMeetings,
    getMyMeetings,
    getUpcomingMeetings,
    getMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting,
    getMeetingAnalytics
} = require('../controllers/meetingController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Admin & Teacher routes
router.post('/', authorize('admin', 'teacher'), createMeeting);

// Admin routes
router.get('/', authorize('admin'), getAllMeetings);
router.get('/analytics', authorize('admin'), getMeetingAnalytics);

// Teacher routes
router.get('/my-meetings', authorize('teacher'), getMyMeetings);

// Student routes
router.get('/upcoming', authorize('student'), getUpcomingMeetings);

// Common routes
router.get('/:id', getMeeting);
router.put('/:id', authorize('admin', 'teacher'), updateMeeting);
router.delete('/:id', authorize('admin', 'teacher'), deleteMeeting);
router.post('/:id/join', joinMeeting);

module.exports = router;

const VirtualMeeting = require('../models/VirtualMeeting');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Create virtual meeting
// @route   POST /api/meetings
// @access  Private (Admin, Teacher)
const createMeeting = asyncHandler(async (req, res) => {
    const {
        title, description, meetingLink, platform,
        scheduledDate, scheduledTime, duration,
        targetingType, classDetails, departments, roles, individuals,
        subject, host, isRecurring, recurringPattern
    } = req.body;

    // Create meeting
    const meeting = await VirtualMeeting.create({
        title,
        description,
        meetingLink,
        platform,
        scheduledDate,
        scheduledTime,
        duration,
        createdBy: req.user.id,
        host: host || (req.user.role === 'teacher' ? req.user.teacherProfile : null),
        targetingType,
        classDetails,
        departments,
        roles,
        individuals,
        subject,
        isRecurring,
        recurringPattern
    });

    // Calculate total targeted users
    let targetedCount = 0;
    
    if (targetingType === 'class' && classDetails) {
        targetedCount = await Student.countDocuments({
            department: classDetails.department,
            semester: classDetails.semester,
            section: classDetails.section,
            isActive: true
        });
    } else if (targetingType === 'department') {
        targetedCount = await Student.countDocuments({
            department: { $in: departments },
            isActive: true
        });
    } else if (targetingType === 'role') {
        targetedCount = await User.countDocuments({
            role: { $in: roles },
            isActive: true
        });
    } else if (targetingType === 'individuals') {
        targetedCount = individuals.length;
    }

    meeting.totalTargeted = targetedCount;
    await meeting.save();

    res.status(201).json({
        success: true,
        message: 'Meeting created successfully',
        data: meeting
    });
});

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private (Admin)
const getAllMeetings = asyncHandler(async (req, res) => {
    const { status, department, startDate, endDate } = req.query;

    const query = { isActive: true };

    if (status) query.status = status;
    if (department) query['classDetails.department'] = department;
    if (startDate && endDate) {
        query.scheduledDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    const meetings = await VirtualMeeting.find(query)
        .populate('createdBy', 'firstName lastName role')
        .populate('host', 'employeeId')
        .populate({
            path: 'host',
            populate: { path: 'user', select: 'firstName lastName' }
        })
        .populate('subject', 'name code')
        .sort({ scheduledDate: -1, scheduledTime: -1 });

    res.json({
        success: true,
        count: meetings.length,
        data: meetings
    });
});

// @desc    Get my meetings (Teacher)
// @route   GET /api/meetings/my-meetings
// @access  Private (Teacher)
const getMyMeetings = asyncHandler(async (req, res) => {
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher profile not found'
        });
    }

    const meetings = await VirtualMeeting.find({
        $or: [
            { host: teacher._id },
            { createdBy: req.user.id }
        ],
        isActive: true
    })
        .populate('subject', 'name code')
        .sort({ scheduledDate: -1, scheduledTime: -1 });

    res.json({
        success: true,
        count: meetings.length,
        data: meetings
    });
});

// @desc    Get upcoming meetings for student
// @route   GET /api/meetings/upcoming
// @access  Private (Student)
const getUpcomingMeetings = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user.id });

    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found'
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find meetings targeted to this student
    const meetings = await VirtualMeeting.find({
        scheduledDate: { $gte: today },
        status: { $in: ['Scheduled', 'Ongoing'] },
        isActive: true,
        $or: [
            // Class-specific
            {
                targetingType: 'class',
                'classDetails.department': student.department,
                'classDetails.semester': student.semester,
                'classDetails.section': student.section
            },
            // Department-wide
            {
                targetingType: 'department',
                departments: student.department
            },
            // Role-based (all students)
            {
                targetingType: 'role',
                roles: 'student'
            },
            // Individual targeting
            {
                targetingType: 'individuals',
                individuals: req.user.id
            }
        ]
    })
        .populate('subject', 'name code')
        .populate({
            path: 'host',
            populate: { path: 'user', select: 'firstName lastName' }
        })
        .sort({ scheduledDate: 1, scheduledTime: 1 });

    res.json({
        success: true,
        count: meetings.length,
        data: meetings
    });
});

// @desc    Get meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
const getMeeting = asyncHandler(async (req, res) => {
    const meeting = await VirtualMeeting.findById(req.params.id)
        .populate('createdBy', 'firstName lastName role')
        .populate({
            path: 'host',
            populate: { path: 'user', select: 'firstName lastName' }
        })
        .populate('subject', 'name code')
        .populate('attendees.user', 'firstName lastName role');

    if (!meeting) {
        return res.status(404).json({
            success: false,
            message: 'Meeting not found'
        });
    }

    res.json({
        success: true,
        data: meeting
    });
});

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private (Admin, Teacher-own)
const updateMeeting = asyncHandler(async (req, res) => {
    let meeting = await VirtualMeeting.findById(req.params.id);

    if (!meeting) {
        return res.status(404).json({
            success: false,
            message: 'Meeting not found'
        });
    }

    // Check authorization
    if (req.user.role === 'teacher') {
        const teacher = await Teacher.findOne({ user: req.user.id });
        if (!teacher || meeting.host.toString() !== teacher._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this meeting'
            });
        }
    }

    meeting = await VirtualMeeting.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
    );

    res.json({
        success: true,
        message: 'Meeting updated successfully',
        data: meeting
    });
});

// @desc    Delete/Cancel meeting
// @route   DELETE /api/meetings/:id
// @access  Private (Admin, Teacher-own)
const deleteMeeting = asyncHandler(async (req, res) => {
    const meeting = await VirtualMeeting.findById(req.params.id);

    if (!meeting) {
        return res.status(404).json({
            success: false,
            message: 'Meeting not found'
        });
    }

    // Check authorization
    if (req.user.role === 'teacher') {
        const teacher = await Teacher.findOne({ user: req.user.id });
        if (!teacher || meeting.host.toString() !== teacher._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this meeting'
            });
        }
    }

    meeting.status = 'Cancelled';
    meeting.isActive = false;
    await meeting.save();

    res.json({
        success: true,
        message: 'Meeting cancelled successfully'
    });
});

// @desc    Join meeting (Track attendance)
// @route   POST /api/meetings/:id/join
// @access  Private
const joinMeeting = asyncHandler(async (req, res) => {
    const meeting = await VirtualMeeting.findById(req.params.id);

    if (!meeting) {
        return res.status(404).json({
            success: false,
            message: 'Meeting not found'
        });
    }

    // Check if already joined
    const alreadyJoined = meeting.attendees.find(
        a => a.user.toString() === req.user.id
    );

    if (alreadyJoined) {
        return res.json({
            success: true,
            message: 'Already marked as joined',
            meetingLink: meeting.meetingLink
        });
    }

    // Add to attendees
    meeting.attendees.push({
        user: req.user.id,
        joinedAt: new Date()
    });
    meeting.totalAttended = meeting.attendees.length;

    // Update status to Ongoing if first join
    if (meeting.status === 'Scheduled') {
        meeting.status = 'Ongoing';
    }

    await meeting.save();

    res.json({
        success: true,
        message: 'Attendance marked successfully',
        meetingLink: meeting.meetingLink
    });
});

// @desc    Get meeting analytics
// @route   GET /api/meetings/analytics
// @access  Private (Admin)
const getMeetingAnalytics = asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const matchQuery = { isActive: true };
    if (startDate && endDate) {
        matchQuery.scheduledDate = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
    }

    // Status distribution
    const statusDistribution = await VirtualMeeting.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        }
    ]);

    // Department-wise meetings
    const departmentWise = await VirtualMeeting.aggregate([
        { $match: { ...matchQuery, targetingType: 'class' } },
        {
            $group: {
                _id: '$classDetails.department',
                count: { $sum: 1 },
                avgAttendance: {
                    $avg: {
                        $cond: [
                            { $gt: ['$totalTargeted', 0] },
                            { $multiply: [{ $divide: ['$totalAttended', '$totalTargeted'] }, 100] },
                            0
                        ]
                    }
                }
            }
        }
    ]);

    // Platform usage
    const platformUsage = await VirtualMeeting.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$platform',
                count: { $sum: 1 }
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            statusDistribution,
            departmentWise,
            platformUsage
        }
    });
});

module.exports = {
    createMeeting,
    getAllMeetings,
    getMyMeetings,
    getUpcomingMeetings,
    getMeeting,
    updateMeeting,
    deleteMeeting,
    joinMeeting,
    getMeetingAnalytics
};

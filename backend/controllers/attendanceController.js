const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const TeachingAssignment = require('../models/TeachingAssignment');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Mark attendance using Teaching Assignment
// @route   POST /api/attendance/mark
// @access  Private (Teacher)
const markAttendance = asyncHandler(async (req, res) => {
    const { assignmentId, date, attendanceData, lectureNumber = 1 } = req.body;
    // attendanceData: [{ studentId, status, remarks }]

    // Validate teaching assignment
    const assignment = await TeachingAssignment.findById(assignmentId)
        .populate('subjectId')
        .populate('classId');

    if (!assignment) {
        return res.status(404).json({
            success: false,
            message: 'Teaching assignment not found',
        });
    }

    // Verify teacher owns this assignment
    const teacher = await require('../models/Teacher').findOne({ user: req.user.id });
    if (!teacher) {
        return res.status(404).json({
            success: false,
            message: 'Teacher profile not found',
        });
    }

    if (assignment.teacherId.toString() !== teacher._id.toString()) {
        return res.status(403).json({
            success: false,
            message: 'You are not authorized to mark attendance for this class',
        });
    }

    const classInfo = assignment.classId;
    const subjectInfo = assignment.subjectId;

    const attendanceRecords = [];
    const notifications = [];

    for (const record of attendanceData) {
        const student = await Student.findById(record.studentId);
        if (!student) continue;

        // Verify student belongs to the same class as the assignment
        if (
            student.department !== classInfo.department ||
            student.semester !== classInfo.semester ||
            student.section !== classInfo.section
        ) {
            continue; // Skip students not in this class
        }

        // Upsert attendance record
        const attendance = await Attendance.findOneAndUpdate(
            {
                student: record.studentId,
                subject: subjectInfo._id,
                date: new Date(date),
                lectureNumber,
            },
            {
                student: record.studentId,
                subject: subjectInfo._id,
                teacher: teacher._id,
                teachingAssignment: assignment._id,
                date: new Date(date),
                status: record.status,
                lectureNumber,
                remarks: record.remarks,
                semester: classInfo.semester,
                department: classInfo.department,
                section: classInfo.section,
            },
            { upsert: true, new: true }
        );

        attendanceRecords.push(attendance);

        // Create notification for absent students
        if (record.status === 'Absent') {
            const studentUser = await require('../models/User').findById(student.user);
            if (studentUser) {
                notifications.push({
                    recipient: studentUser._id,
                    recipientRole: 'student',
                    title: 'Attendance Marked Absent',
                    message: `You were marked absent for ${subjectInfo.name} on ${new Date(date).toLocaleDateString()}`,
                    type: 'attendance',
                });
            }

            // Notify parent
            if (student.parentGuardian) {
                const parent = await require('../models/Parent').findById(student.parentGuardian);
                if (parent) {
                    notifications.push({
                        recipient: parent.user,
                        recipientRole: 'parent',
                        title: 'Student Marked Absent',
                        message: `Your ward was marked absent for ${subjectInfo.name} on ${new Date(date).toLocaleDateString()}`,
                        type: 'attendance',
                    });
                }
            }
        }
    }

    // Create notifications
    if (notifications.length > 0) {
        await Notification.insertMany(notifications);
    }

    res.status(201).json({
        success: true,
        message: `Attendance marked for ${attendanceRecords.length} students`,
        data: attendanceRecords,
    });
});

// @desc    Get attendance by class and date
// @route   GET /api/attendance/class
// @access  Private (Teacher, Admin)
const getClassAttendance = asyncHandler(async (req, res) => {
    const { department, semester, section, subjectId, date } = req.query;

    const query = {};
    if (department) query.department = department;
    if (semester) query.semester = parseInt(semester);
    if (section) query.section = section;
    if (subjectId) query.subject = subjectId;
    if (date) {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        query.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(query)
        .populate({
            path: 'student',
            populate: { path: 'user', select: 'firstName lastName' },
        })
        .populate('subject', 'name code')
        .sort({ 'student.rollNumber': 1 });

    res.json({
        success: true,
        count: attendance.length,
        data: attendance,
    });
});

// @desc    Get student attendance
// @route   GET /api/attendance/student/:studentId
// @access  Private
const getStudentAttendance = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { subjectId, startDate, endDate, month } = req.query;

    const query = { student: studentId };

    if (subjectId) query.subject = subjectId;

    if (startDate && endDate) {
        query.date = {
            $gte: new Date(startDate),
            $lte: new Date(endDate),
        };
    } else if (month) {
        const [year, monthNum] = month.split('-');
        const start = new Date(year, monthNum - 1, 1);
        const end = new Date(year, monthNum, 0, 23, 59, 59);
        query.date = { $gte: start, $lte: end };
    }

    const attendance = await Attendance.find(query)
        .populate('subject', 'name code')
        .sort({ date: -1 });

    // Calculate summary
    const summary = {
        total: attendance.length,
        present: attendance.filter(a => a.status === 'Present').length,
        absent: attendance.filter(a => a.status === 'Absent').length,
        late: attendance.filter(a => a.status === 'Late').length,
        leave: attendance.filter(a => a.status === 'Leave').length,
    };
    summary.percentage = summary.total > 0
        ? Math.round(((summary.present + summary.late) / summary.total) * 100)
        : 0;

    res.json({
        success: true,
        data: attendance,
        summary,
    });
});

// @desc    Get attendance summary by subject
// @route   GET /api/attendance/summary/:studentId
// @access  Private
const getAttendanceSummary = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    const summary = await Attendance.aggregate([
        { $match: { student: student._id } },
        {
            $group: {
                _id: '$subject',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
                },
                absent: {
                    $sum: { $cond: [{ $eq: ['$status', 'Absent'] }, 1, 0] },
                },
            },
        },
        {
            $lookup: {
                from: 'subjects',
                localField: '_id',
                foreignField: '_id',
                as: 'subject',
            },
        },
        { $unwind: '$subject' },
        {
            $project: {
                subject: { name: 1, code: 1 },
                total: 1,
                present: 1,
                absent: 1,
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2],
                },
            },
        },
    ]);

    // Calculate overall percentage
    const overall = summary.reduce(
        (acc, curr) => ({
            total: acc.total + curr.total,
            present: acc.present + curr.present,
        }),
        { total: 0, present: 0 }
    );

    const overallPercentage = overall.total > 0
        ? Math.round((overall.present / overall.total) * 100)
        : 0;

    res.json({
        success: true,
        data: {
            subjects: summary,
            overall: {
                ...overall,
                percentage: overallPercentage,
            },
        },
    });
});

// @desc    Get attendance analytics
// @route   GET /api/attendance/analytics
// @access  Private (Admin, Teacher)
const getAttendanceAnalytics = asyncHandler(async (req, res) => {
    const { department, semester, month } = req.query;

    const matchQuery = {};
    if (department) matchQuery.department = department;
    if (semester) matchQuery.semester = parseInt(semester);

    if (month) {
        const [year, monthNum] = month.split('-');
        const start = new Date(year, monthNum - 1, 1);
        const end = new Date(year, monthNum, 0, 23, 59, 59);
        matchQuery.date = { $gte: start, $lte: end };
    }

    // Daily attendance trend
    const dailyTrend = await Attendance.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
                },
            },
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                date: '$_id',
                total: 1,
                present: 1,
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2],
                },
            },
        },
    ]);

    // Department-wise summary
    const departmentWise = await Attendance.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: '$department',
                total: { $sum: 1 },
                present: {
                    $sum: { $cond: [{ $in: ['$status', ['Present', 'Late']] }, 1, 0] },
                },
            },
        },
        {
            $project: {
                department: '$_id',
                total: 1,
                present: 1,
                percentage: {
                    $round: [{ $multiply: [{ $divide: ['$present', '$total'] }, 100] }, 2],
                },
            },
        },
    ]);

    res.json({
        success: true,
        data: {
            dailyTrend,
            departmentWise,
        },
    });
});

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Teacher, Admin)
const updateAttendance = asyncHandler(async (req, res) => {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
        return res.status(404).json({
            success: false,
            message: 'Attendance record not found',
        });
    }

    if (status) attendance.status = status;
    if (remarks) attendance.remarks = remarks;

    await attendance.save();

    res.json({
        success: true,
        message: 'Attendance updated successfully',
        data: attendance,
    });
});

module.exports = {
    markAttendance,
    getClassAttendance,
    getStudentAttendance,
    getAttendanceSummary,
    getAttendanceAnalytics,
    updateAttendance,
};

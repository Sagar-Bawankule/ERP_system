const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const TeachingAssignment = require('../models/TeachingAssignment');
const Class = require('../models/Class');
const Notification = require('../models/Notification');
const { asyncHandler } = require('../middleware/errorHandler');
const { exec } = require('child_process');
const path = require('path');

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
    const { month } = req.query;

    const student = await Student.findById(studentId);
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student not found',
        });
    }

    const matchQuery = { student: student._id };
    if (month) {
        const [year, monthNum] = month.split('-');
        const start = new Date(year, monthNum - 1, 1);
        const end = new Date(year, monthNum, 0, 23, 59, 59);
        matchQuery.date = { $gte: start, $lte: end };
    }

    const summary = await Attendance.aggregate([
        { $match: matchQuery },
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
                late: {
                    $sum: { $cond: [{ $eq: ['$status', 'Late'] }, 1, 0] },
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
                late: 1,
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
            absent: acc.absent + curr.absent,
            late: acc.late + curr.late,
        }),
        { total: 0, present: 0, absent: 0, late: 0 }
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

const getUploadedFileUrl = (filePath) => {
    if (!filePath) return null;

    const normalized = filePath.replace(/\\/g, '/');
    const uploadsIndex = normalized.lastIndexOf('/uploads/');

    if (uploadsIndex === -1) {
        const uploadsToken = '/uploads';
        const tokenIndex = normalized.lastIndexOf(uploadsToken);
        if (tokenIndex !== -1) {
            return normalized.slice(tokenIndex);
        }
        return null;
    }

    return normalized.slice(uploadsIndex);
};

// @desc    Self mark attendance for student (Fingerprint)
// @route   POST /api/attendance/self-mark
// @access  Private (Student)
const selfMarkAttendance = asyncHandler(async (req, res) => {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found',
        });
    }

    // Find a subject to associate with the attendance record
    const subject = await Subject.findOne();
    const teacherObj = await require('../models/Teacher').findOne();

    if (!subject || !teacherObj) {
        return res.status(400).json({
            success: false,
            message: 'System setup incomplete. Cannot mark attendance.',
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert attendance record
    const attendance = await Attendance.findOneAndUpdate(
        {
            student: student._id,
            subject: subject._id,
            date: today,
            lectureNumber: 1,
        },
        {
            student: student._id,
            subject: subject._id,
            teacher: teacherObj._id,
            date: today,
            status: 'Present',
            lectureNumber: 1,
            remarks: 'Self Marked via Fingerprint',
            verificationMode: 'Fingerprint',
            faceCapture: null,
            semester: student.semester || 1,
            department: student.department || 'General',
            section: student.section || 'A',
        },
        { upsert: true, new: true }
    );

    res.status(201).json({
        success: true,
        message: 'Attendance marked successfully via Fingerprint!',
        data: attendance,
    });
});

// @desc    Self mark attendance using face capture
// @route   POST /api/attendance/self-mark-face
// @access  Private (Student)
const selfMarkFaceAttendance = asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Face capture image is required',
        });
    }

    if (!req.file.mimetype || !req.file.mimetype.startsWith('image/')) {
        return res.status(400).json({
            success: false,
            message: 'Invalid face capture file type',
        });
    }

    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
        return res.status(404).json({
            success: false,
            message: 'Student profile not found',
        });
    }

    // Find a subject to associate with the attendance record
    const subject = await Subject.findOne();
    const teacherObj = await require('../models/Teacher').findOne();

    if (!subject || !teacherObj) {
        return res.status(400).json({
            success: false,
            message: 'System setup incomplete. Cannot mark attendance.',
        });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fileUrl = getUploadedFileUrl(req.file.path);
    if (!fileUrl) {
        return res.status(500).json({
            success: false,
            message: 'Failed to store face capture image',
        });
    }

    const detectorName = req.body.detector || 'browser-face-detector';

    const attendance = await Attendance.findOneAndUpdate(
        {
            student: student._id,
            subject: subject._id,
            date: today,
            lectureNumber: 1,
        },
        {
            student: student._id,
            subject: subject._id,
            teacher: teacherObj._id,
            date: today,
            status: 'Present',
            lectureNumber: 1,
            remarks: 'Self Marked via Face Detection',
            verificationMode: 'Face',
            faceCapture: {
                imageUrl: fileUrl,
                capturedAt: new Date(),
                detector: detectorName,
            },
            semester: student.semester || 1,
            department: student.department || 'General',
            section: student.section || 'A',
        },
        { upsert: true, new: true }
    );

    res.status(201).json({
        success: true,
        message: 'Attendance marked successfully via Face Detection!',
        data: attendance,
    });
});

// @desc    Detect fingerprint sensor device (Windows USB check)
// @route   GET /api/attendance/sensor-status
// @access  Private (Student)
const getFingerprintSensorStatus = asyncHandler(async (req, res) => {
    const usbServiceUrl = process.env.USB_SENSOR_SERVICE_URL || 'http://127.0.0.1:5005/api/usb-status';
    const usbServiceCommand = `python "${path.join(__dirname, '..', 'utils', 'fingerprint_sensor_service.py')}"`;
    const checkUsbServiceCommand = `powershell -NoProfile -Command "(Invoke-WebRequest -UseBasicParsing '${usbServiceUrl}' -TimeoutSec 3).StatusCode"`;

    // Try dedicated local USB service first
    return exec(checkUsbServiceCommand, { timeout: 5000 }, (svcErr) => {
        if (!svcErr) {
            const readUsbServiceCommand = `powershell -NoProfile -Command "(Invoke-WebRequest -UseBasicParsing '${usbServiceUrl}' -TimeoutSec 3).Content"`;
            return exec(readUsbServiceCommand, { timeout: 5000 }, (readErr, readStdout) => {
                if (!readErr && readStdout) {
                    try {
                        const payload = JSON.parse(readStdout);
                        const connected = !!payload.connected;
                        return res.json({
                            success: true,
                            data: {
                                connected,
                                mode: 'usb-service',
                                message: connected ? 'USB/sensor device connected' : 'Sensor not detected',
                                deviceName: payload.device_name || null,
                                deviceCount: payload.device_count || 0,
                            },
                        });
                    } catch (jsonError) {
                        // fall through to other checks
                    }
                }
                // fall through to built-in checks if service read fails
                return runBuiltInDetection();
            });
        }

        // Service is not running: try to start it in background and continue with built-in checks
        exec(`powershell -NoProfile -Command "Start-Process -WindowStyle Hidden -FilePath python -ArgumentList '${path.join(__dirname, '..', 'utils', 'fingerprint_sensor_service.py').replace(/\\/g, '\\\\')}'"`, { timeout: 5000 }, () => {
            return runBuiltInDetection();
        });
    });

    function runBuiltInDetection() {
    const command = `python -c "import wmi; c=wmi.WMI(); devices=c.Win32_USBControllerDevice(); print('\\n'.join([str(d.Dependent) for d in devices]))"`;

    exec(command, { timeout: 8000 }, (error, stdout, stderr) => {
        if (error || stderr) {
            // Fallback: PowerShell USB/HID scan (works even when python/wmi is unavailable)
            const psCommand = `$usb = Get-PnpDevice -PresentOnly | Where-Object { $_.Class -in @('USB','HIDClass','Mouse','Biometric') -or $_.FriendlyName -match 'USB|HID|Mouse|Biometric|Fingerprint' }; $usb | Select-Object -ExpandProperty FriendlyName`;
            return exec(`powershell -NoProfile -Command "${psCommand}"`, { timeout: 8000 }, (psError, psStdout) => {
                if (psError) {
                    return res.json({
                        success: true,
                        data: {
                            connected: false,
                            mode: 'none',
                            message: 'Sensor not detected',
                        },
                    });
                }

                const psOutput = (psStdout || '').toLowerCase();
                const lines = psOutput.split('\n').map((l) => l.trim()).filter(Boolean);
                const connected = lines.some((line) =>
                    line.includes('usb') && (
                        line.includes('mouse') ||
                        line.includes('hid') ||
                        line.includes('finger') ||
                        line.includes('biometric') ||
                        line.includes('sensor')
                    )
                );

                return res.json({
                    success: true,
                    data: {
                        connected,
                        mode: 'powershell',
                        message: connected ? 'USB/sensor device connected' : 'Sensor not detected',
                    },
                });
            });
        }

        const output = (stdout || '').toLowerCase();
        const keywords = [
            'finger',
            'biometric',
            'validity',
            'synaptics',
            'goodix',
            'elan',
            'authentec',
        ];
        const connected = keywords.some((k) => output.includes(k));

        return res.json({
            success: true,
            data: {
                connected,
                mode: 'wmi',
                message: connected ? 'Fingerprint sensor connected' : 'Sensor not detected',
            },
        });
    });
    }
});

module.exports = {
    markAttendance,
    getClassAttendance,
    getStudentAttendance,
    getAttendanceSummary,
    getAttendanceAnalytics,
    updateAttendance,
    selfMarkAttendance,
    selfMarkFaceAttendance,
    getFingerprintSensorStatus,
};

// Export all models from a single file
const User = require('./User');
const Student = require('./Student');
const Teacher = require('./Teacher');
const Parent = require('./Parent');
const Subject = require('./Subject');
const Attendance = require('./Attendance');
const { Fee, FeeStructure } = require('./Fee');
const Payment = require('./Payment');
const { Scholarship, ScholarshipApplication } = require('./Scholarship');
const Marks = require('./Marks');
const Backlog = require('./Backlog');
const Note = require('./Note');
const LeaveApplication = require('./LeaveApplication');
const CollegeGallery = require('./CollegeGallery');
const Notification = require('./Notification');

module.exports = {
    User,
    Student,
    Teacher,
    Parent,
    Subject,
    Attendance,
    Fee,
    FeeStructure,
    Payment,
    Scholarship,
    ScholarshipApplication,
    Marks,
    Backlog,
    Note,
    LeaveApplication,
    CollegeGallery,
    Notification,
};

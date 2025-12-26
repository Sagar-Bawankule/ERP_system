require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Parent = require('../models/Parent');
const Subject = require('../models/Subject');
const Attendance = require('../models/Attendance');
const { Fee, FeeStructure } = require('../models/Fee');
const { Scholarship } = require('../models/Scholarship');
const Marks = require('../models/Marks');
const Note = require('../models/Note');
const CollegeGallery = require('../models/CollegeGallery');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ERP_System';

// Seed data
const seedData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Student.deleteMany({});
        await Teacher.deleteMany({});
        await Parent.deleteMany({});
        await Subject.deleteMany({});
        await Attendance.deleteMany({});
        await Fee.deleteMany({});
        await FeeStructure.deleteMany({});
        await Scholarship.deleteMany({});
        await Marks.deleteMany({});
        await Note.deleteMany({});
        await CollegeGallery.deleteMany({});

        // Create Admin User
        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            email: 'admin@samarthcollege.edu.in',
            password: 'admin123',
            role: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            phone: '9876543210',
            isActive: true,
        });

        // Create Subjects
        console.log('📚 Creating subjects...');
        const subjects = await Subject.insertMany([
            { code: 'CS301', name: 'Database Management Systems', department: 'Computer Engineering', semester: 5, credits: 4, type: 'Theory + Practical' },
            { code: 'CS302', name: 'Operating Systems', department: 'Computer Engineering', semester: 5, credits: 4, type: 'Theory' },
            { code: 'CS303', name: 'Computer Networks', department: 'Computer Engineering', semester: 5, credits: 3, type: 'Theory + Practical' },
            { code: 'CS201', name: 'Data Structures', department: 'Computer Engineering', semester: 3, credits: 4, type: 'Theory + Practical' },
            { code: 'CS202', name: 'Object Oriented Programming', department: 'Computer Engineering', semester: 3, credits: 4, type: 'Theory + Practical' },
            { code: 'CS401', name: 'Machine Learning', department: 'Computer Engineering', semester: 7, credits: 4, type: 'Theory + Practical' },
            { code: 'ME301', name: 'Fluid Mechanics', department: 'Mechanical Engineering', semester: 5, credits: 4, type: 'Theory + Practical' },
        ]);
        console.log(`   Created ${subjects.length} subjects`);

        // Create Teachers
        console.log('👨‍🏫 Creating teachers...');
        const teacherUsers = await User.insertMany([
            { email: 'teacher1@samarthcollege.edu.in', password: await bcrypt.hash('teacher123', 12), role: 'teacher', firstName: 'Dr. Rajesh', lastName: 'Sharma', phone: '9876543211' },
            { email: 'teacher2@samarthcollege.edu.in', password: await bcrypt.hash('teacher123', 12), role: 'teacher', firstName: 'Prof. Sunita', lastName: 'Deshmukh', phone: '9876543212' },
        ]);

        const teachers = await Teacher.insertMany([
            { user: teacherUsers[0]._id, employeeId: 'EMP001', department: 'Computer Engineering', designation: 'HOD', qualification: 'Ph.D. Computer Science', experience: 15, specialization: 'Machine Learning', subjects: [subjects[0]._id, subjects[1]._id], assignedClasses: [{ department: 'Computer Engineering', semester: 5, section: 'A', subject: subjects[0]._id }] },
            { user: teacherUsers[1]._id, employeeId: 'EMP002', department: 'Computer Engineering', designation: 'Associate Professor', qualification: 'M.Tech', experience: 10, specialization: 'Database Systems', subjects: [subjects[2]._id], assignedClasses: [{ department: 'Computer Engineering', semester: 5, section: 'A', subject: subjects[2]._id }] },
        ]);

        for (let i = 0; i < teacherUsers.length; i++) {
            await User.findByIdAndUpdate(teacherUsers[i]._id, { teacherProfile: teachers[i]._id });
        }
        console.log(`   Created ${teachers.length} teachers`);

        // Create Students
        console.log('🎓 Creating students...');
        const studentUsers = await User.insertMany([
            { email: 'student1@samarthcollege.edu.in', password: await bcrypt.hash('student123', 12), role: 'student', firstName: 'Rahul', lastName: 'Kumar', phone: '9876543221' },
            { email: 'student2@samarthcollege.edu.in', password: await bcrypt.hash('student123', 12), role: 'student', firstName: 'Priya', lastName: 'Singh', phone: '9876543222' },
            { email: 'student3@samarthcollege.edu.in', password: await bcrypt.hash('student123', 12), role: 'student', firstName: 'Amit', lastName: 'Jadhav', phone: '9876543223' },
        ]);

        const students = await Student.insertMany([
            { user: studentUsers[0]._id, rollNumber: 'CE2024001', department: 'Computer Engineering', course: 'B.E.', semester: 5, section: 'A', batch: '2024', dateOfBirth: new Date('2002-05-15'), gender: 'Male', category: 'General', enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id] },
            { user: studentUsers[1]._id, rollNumber: 'CE2024002', department: 'Computer Engineering', course: 'B.E.', semester: 5, section: 'A', batch: '2024', dateOfBirth: new Date('2002-08-22'), gender: 'Female', category: 'OBC', enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id] },
            { user: studentUsers[2]._id, rollNumber: 'CE2024003', department: 'Computer Engineering', course: 'B.E.', semester: 5, section: 'A', batch: '2025', dateOfBirth: new Date('2003-02-10'), gender: 'Male', category: 'General', enrolledSubjects: [subjects[0]._id, subjects[1]._id, subjects[2]._id] },
        ]);

        for (let i = 0; i < studentUsers.length; i++) {
            await User.findByIdAndUpdate(studentUsers[i]._id, { studentProfile: students[i]._id });
        }
        console.log(`   Created ${students.length} students`);

        // Create Parents
        console.log('👨‍👩‍👧 Creating parents...');
        const parentUsers = await User.insertMany([
            { email: 'parent1@gmail.com', password: await bcrypt.hash('parent123', 12), role: 'parent', firstName: 'Suresh', lastName: 'Kumar', phone: '9876543231' },
        ]);

        const parents = await Parent.insertMany([
            { user: parentUsers[0]._id, relation: 'Father', occupation: 'Business', annualIncome: 800000, students: [students[0]._id] },
        ]);

        await User.findByIdAndUpdate(parentUsers[0]._id, { parentProfile: parents[0]._id });
        await Student.findByIdAndUpdate(students[0]._id, { parentGuardian: parents[0]._id });
        console.log(`   Created ${parents.length} parents`);

        // Create Attendance Records
        console.log('📅 Creating attendance records...');
        const attendanceRecords = [];
        const today = new Date();

        for (let dayOffset = 30; dayOffset >= 1; dayOffset--) {
            const date = new Date(today);
            date.setDate(date.getDate() - dayOffset);

            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            for (const student of students) {
                for (const subject of subjects.slice(0, 3)) { // First 3 subjects for semester 5
                    const status = Math.random() > 0.15 ? 'Present' : (Math.random() > 0.5 ? 'Absent' : 'Late');
                    attendanceRecords.push({
                        student: student._id,
                        subject: subject._id,
                        teacher: teachers[0]._id,
                        date: date,
                        status: status,
                        semester: 5,
                        department: 'Computer Engineering',
                        section: 'A',
                        lectureNumber: 1,
                    });
                }
            }
        }
        await Attendance.insertMany(attendanceRecords);
        console.log(`   Created ${attendanceRecords.length} attendance records`);

        // Create Fee Structures
        console.log('💰 Creating fee structures...');
        const feeStructures = await FeeStructure.insertMany([
            {
                name: 'Tuition Fee - Odd Semester 2024-25',
                department: 'All',
                course: 'B.E.',
                academicYear: '2024-25',
                components: [
                    { name: 'Tuition Fee', amount: 45000, isOptional: false },
                    { name: 'Library Fee', amount: 2000, isOptional: false },
                    { name: 'Laboratory Fee', amount: 5000, isOptional: false },
                    { name: 'Development Fee', amount: 3000, isOptional: false },
                ],
                totalAmount: 55000,
                dueDate: new Date('2024-12-31'),
                lateFee: 500,
                lateFeePerDay: 50,
            },
        ]);

        // Assign fees to students
        const feeAssignments = [];
        for (const student of students) {
            feeAssignments.push({
                student: student._id,
                feeStructure: feeStructures[0]._id,
                academicYear: '2024-25',
                semester: 5,
                totalAmount: 55000,
                paidAmount: student._id.equals(students[0]._id) ? 55000 : 0, // First student paid
                dueAmount: student._id.equals(students[0]._id) ? 0 : 55000,
                status: student._id.equals(students[0]._id) ? 'Paid' : 'Pending',
                dueDate: new Date('2024-12-31'),
            });
        }
        await Fee.insertMany(feeAssignments);
        console.log(`   Created fee structures and ${feeAssignments.length} fee assignments`);

        // Create Marks with grade calculation
        console.log('📊 Creating marks...');

        // Grade calculation function (same logic as Marks model)
        const calculateGrade = (obtained, max) => {
            const percentage = (obtained / max) * 100;
            if (percentage >= 90) return { grade: 'O', status: 'Pass' };
            if (percentage >= 80) return { grade: 'A+', status: 'Pass' };
            if (percentage >= 70) return { grade: 'A', status: 'Pass' };
            if (percentage >= 60) return { grade: 'B+', status: 'Pass' };
            if (percentage >= 50) return { grade: 'B', status: 'Pass' };
            if (percentage >= 40) return { grade: 'C', status: 'Pass' };
            if (percentage >= 33) return { grade: 'D', status: 'Pass' };
            return { grade: 'F', status: 'Fail' };
        };

        const marksRecords = [];
        for (const student of students) {
            for (const subject of subjects.slice(0, 3)) {
                const internalMarks = Math.floor(Math.random() * 30) + 60; // 60-90
                const endTermMarks = Math.floor(Math.random() * 35) + 55; // 55-90

                const internalGrade = calculateGrade(internalMarks, 100);
                const endTermGrade = calculateGrade(endTermMarks, 100);

                marksRecords.push({
                    student: student._id,
                    subject: subject._id,
                    enteredBy: teachers[0]._id,
                    examType: 'Internal',
                    obtainedMarks: internalMarks,
                    maxMarks: 100,
                    semester: 5,
                    academicYear: '2024-25',
                    grade: internalGrade.grade,
                    status: internalGrade.status,
                });
                marksRecords.push({
                    student: student._id,
                    subject: subject._id,
                    enteredBy: teachers[0]._id,
                    examType: 'End-Term',
                    obtainedMarks: endTermMarks,
                    maxMarks: 100,
                    semester: 5,
                    academicYear: '2024-25',
                    grade: endTermGrade.grade,
                    status: endTermGrade.status,
                });
            }
        }
        await Marks.insertMany(marksRecords);
        console.log(`   Created ${marksRecords.length} marks records`);

        // Create Notes
        console.log('📝 Creating study notes...');
        const notes = await Note.insertMany([
            { title: 'DBMS Unit 1 - Introduction', description: 'Introduction to Database Management Systems', type: 'Notes', subject: subjects[0]._id, teacher: teachers[0]._id, semester: 5, department: 'Computer Engineering', file: { name: 'dbms_unit1.pdf', url: '/uploads/notes/dbms_unit1.pdf' } },
            { title: 'OS Process Management', description: 'Process and Thread Management in Operating Systems', type: 'Notes', subject: subjects[1]._id, teacher: teachers[0]._id, semester: 5, department: 'Computer Engineering', file: { name: 'os_process.pdf', url: '/uploads/notes/os_process.pdf' } },
            { title: 'CN Assignment 1', description: 'Assignment on OSI Model', type: 'Assignment', subject: subjects[2]._id, teacher: teachers[1]._id, semester: 5, department: 'Computer Engineering', file: { name: 'cn_assignment1.pdf', url: '/uploads/notes/cn_assignment1.pdf' } },
        ]);
        console.log(`   Created ${notes.length} study notes`);

        // Create Scholarships
        console.log('🏆 Creating scholarships...');
        await Scholarship.insertMany([
            {
                name: 'Merit Scholarship',
                description: 'For students with excellent academic performance',
                type: 'Merit',
                amount: 25000,
                eligibility: { minPercentage: 75, categories: ['General', 'OBC', 'SC', 'ST', 'EWS'] },
                deadline: new Date('2025-02-28'),
                documentsRequired: ['Marksheet', 'Income Certificate'],
                maxRecipients: 50,
                academicYear: '2024-25',
            },
            {
                name: 'Government EBC Scholarship',
                description: 'For economically backward class students',
                type: 'Government',
                amount: 30000,
                eligibility: { maxFamilyIncome: 800000, categories: ['General', 'OBC'] },
                deadline: new Date('2025-01-31'),
                documentsRequired: ['Income Certificate', 'Domicile Certificate'],
                academicYear: '2024-25',
            },
        ]);
        console.log('   Created scholarships');

        // Create Gallery Images
        console.log('🖼️  Creating gallery entries...');
        await CollegeGallery.insertMany([
            { title: 'College Main Entrance', description: 'The grand entrance of Samarth College', category: 'Campus', image: { name: 'clg_maindoor.jpg', url: '/clg_maindoor.jpg' }, showOnHomePage: true, displayOrder: 1 },
            { title: 'Computer Laboratory', description: 'State-of-the-art computer lab', category: 'Laboratory', image: { name: 'computer_lab.jpg', url: '/computer_lab.jpg' }, showOnHomePage: true, displayOrder: 2 },
            { title: 'Computer Center', description: 'Central computing facility', category: 'Laboratory', image: { name: 'computer_center.jpg', url: '/computer_center.jpg' }, showOnHomePage: true, displayOrder: 3 },
        ]);
        console.log('   Created gallery entries');

        console.log('');
        console.log('╔══════════════════════════════════════════════════════════╗');
        console.log('║                                                          ║');
        console.log('║   ✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!            ║');
        console.log('║                                                          ║');
        console.log('║   Login Credentials:                                     ║');
        console.log('║   ─────────────────                                      ║');
        console.log('║   Admin:   admin@samarthcollege.edu.in / admin123        ║');
        console.log('║   Teacher: teacher1@samarthcollege.edu.in / teacher123   ║');
        console.log('║   Student: student1@samarthcollege.edu.in / student123   ║');
        console.log('║   Parent:  parent1@gmail.com / parent123                 ║');
        console.log('║                                                          ║');
        console.log('║   Sample Data Created:                                   ║');
        console.log('║   - ' + attendanceRecords.length + ' attendance records                            ║');
        console.log('║   - ' + marksRecords.length + ' marks records                                  ║');
        console.log('║   - ' + feeAssignments.length + ' fee assignments                                ║');
        console.log('║   - ' + notes.length + ' study notes                                    ║');
        console.log('║                                                          ║');
        console.log('╚══════════════════════════════════════════════════════════╝');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();

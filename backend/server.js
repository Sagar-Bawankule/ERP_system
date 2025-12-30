require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const connectDB = require('./config/db');
const { configureCloudinary } = require('./config/cloudinary');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const scholarshipRoutes = require('./routes/scholarshipRoutes');
const marksRoutes = require('./routes/marksRoutes');
const noteRoutes = require('./routes/noteRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const parentRoutes = require('./routes/parentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const classRoutes = require('./routes/classRoutes');
const teachingAssignmentRoutes = require('./routes/teachingAssignmentRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Configure Cloudinary (optional)
configureCloudinary();

// Security middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/teaching-assignments', teachingAssignmentRoutes);

// Root endpoint - API information
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'College ERP System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            auth: '/api/auth/login',
            users: '/api/users',
            students: '/api/students',
            teachers: '/api/teachers',
            subjects: '/api/subjects',
            classes: '/api/classes',
            teachingAssignments: '/api/teaching-assignments',
            attendance: '/api/attendance',
            marks: '/api/marks',
            fees: '/api/fees',
            scholarships: '/api/scholarships',
            leaves: '/api/leave',
            notes: '/api/notes',
            gallery: '/api/gallery',
            parents: '/api/parents',
        },
        documentation: 'https://github.com/Sagar-Bawankule/ERP_system',
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Samarth College ERP System API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});

// College info endpoint
app.get('/api/college-info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Samarth Rural Educational Institute',
            collegeName: 'SAMARTH COLLEGE OF ENGINEERING & MANAGEMENT',
            location: 'Belhe, Pune',
            established: 2010,
            affiliation: 'Savitribai Phule Pune University',
            departments: [
                'Computer Engineering',
                'Mechanical Engineering',
                'Civil Engineering',
                'Electrical Engineering',
                'Electronics Engineering',
                'Information Technology',
            ],
            courses: ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'Diploma'],
            contact: {
                phone: '+91-1234567890',
                email: 'info@samarthcollege.edu.in',
                website: 'www.samarthcollege.edu.in',
            },
        },
    });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('');
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║                                                          ║');
    console.log('║   🎓 SAMARTH COLLEGE ERP SYSTEM - Backend Server         ║');
    console.log('║                                                          ║');
    console.log(`║   🚀 Server running on port ${PORT}                         ║`);
    console.log(`║   📍 Environment: ${(process.env.NODE_ENV || 'development').padEnd(30)}  ║`);
    console.log('║   📚 API Base URL: http://localhost:' + PORT + '/api            ║');
    console.log('║                                                          ║');
    console.log('╚══════════════════════════════════════════════════════════╝');
    console.log('');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err.message);
    // Close server & exit process
    // server.close(() => process.exit(1));
});

module.exports = app;

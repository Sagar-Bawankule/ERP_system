import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context Provider
import { AuthProvider } from './context/AuthContext';

// Layout Components
import MainLayout from './components/Layout/MainLayout';
import DashboardLayout from './components/Layout/DashboardLayout';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';

// Student Pages - Individual Components
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentFees from './pages/student/StudentFees';
import StudentMarks from './pages/student/StudentMarks';
import StudentNotes from './pages/student/StudentNotes';
import StudentLeave from './pages/student/StudentLeave';
import StudentScholarship from './pages/student/StudentScholarship';
import StudentProfile from './pages/student/StudentProfile';

// Teacher Pages
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherAttendance from './pages/teacher/TeacherAttendance';
import TeacherMarks from './pages/teacher/TeacherMarks';
import TeacherNotes from './pages/teacher/TeacherNotes';
import TeacherStudents from './pages/teacher/TeacherStudents';

// Parent Pages
import {
    ParentDashboard,
    ParentAttendance,
    ParentMarks,
    ParentFees,
    ParentNotifications,
    ParentLeave
} from './pages/parent';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminLeaves from './pages/admin/AdminLeaves';
import AdminStudents from './pages/admin/AdminStudents';
import AdminTeachers from './pages/admin/AdminTeachers';
import AdminParents from './pages/admin/AdminParents';
import AdminFees from './pages/admin/AdminFees';
import AdminScholarships from './pages/admin/AdminScholarships';
import AdminGallery from './pages/admin/AdminGallery';
import AdminReports from './pages/admin/AdminReports';
import AdminSubjects from './pages/admin/AdminSubjects';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="App">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/" element={<MainLayout />}>
                            <Route index element={<LandingPage />} />
                            <Route path="about" element={<AboutPage />} />
                            <Route path="gallery" element={<GalleryPage />} />
                            <Route path="contact" element={<ContactPage />} />
                        </Route>

                        {/* Auth Routes */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<Navigate to="/login" replace />} />

                        {/* Student Dashboard Routes */}
                        <Route path="/student" element={
                            <ProtectedRoute allowedRoles={['student']}>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<StudentDashboard />} />
                            <Route path="attendance" element={<StudentAttendance />} />
                            <Route path="fees" element={<StudentFees />} />
                            <Route path="marks" element={<StudentMarks />} />
                            <Route path="notes" element={<StudentNotes />} />
                            <Route path="leave" element={<StudentLeave />} />
                            <Route path="scholarship" element={<StudentScholarship />} />
                            <Route path="profile" element={<StudentProfile />} />
                        </Route>

                        {/* Teacher Dashboard Routes */}
                        <Route path="/teacher" element={
                            <ProtectedRoute allowedRoles={['teacher']}>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<TeacherDashboard />} />
                            <Route path="attendance" element={<TeacherAttendance />} />
                            <Route path="marks" element={<TeacherMarks />} />
                            <Route path="notes" element={<TeacherNotes />} />
                            <Route path="students" element={<TeacherStudents />} />
                            <Route path="profile" element={<StudentProfile />} />
                        </Route>

                        {/* Parent Dashboard Routes */}
                        <Route path="/parent" element={
                            <ProtectedRoute allowedRoles={['parent']}>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<ParentDashboard />} />
                            <Route path="attendance" element={<ParentAttendance />} />
                            <Route path="marks" element={<ParentMarks />} />
                            <Route path="fees" element={<ParentFees />} />
                            <Route path="notifications" element={<ParentNotifications />} />
                            <Route path="leave" element={<ParentLeave />} />
                            <Route path="profile" element={<StudentProfile />} />
                        </Route>

                        {/* Admin Dashboard Routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <DashboardLayout />
                            </ProtectedRoute>
                        }>
                            <Route index element={<Navigate to="dashboard" replace />} />
                            <Route path="dashboard" element={<AdminDashboard />} />
                            <Route path="students" element={<AdminStudents />} />
                            <Route path="teachers" element={<AdminTeachers />} />
                            <Route path="parents" element={<AdminParents />} />
                            <Route path="fees" element={<AdminFees />} />
                            <Route path="scholarships" element={<AdminScholarships />} />
                            <Route path="leaves" element={<AdminLeaves />} />
                            <Route path="gallery" element={<AdminGallery />} />
                            <Route path="reports" element={<AdminReports />} />
                            <Route path="subjects" element={<AdminSubjects />} />
                            <Route path="profile" element={<StudentProfile />} />
                        </Route>

                        {/* Catch all - 404 */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>

                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;

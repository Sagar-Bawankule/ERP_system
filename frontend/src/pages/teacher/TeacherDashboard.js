import React, { useState, useEffect } from 'react';
import { FiUsers, FiCalendar, FiBook, FiFileText, FiBell } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherDashboard = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        todayAttendance: 0,
        assignedSubjects: 0,
        pendingMarks: 0,
    });
    const [recentActivity, setRecentActivity] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Try to get teacher-specific data
            const studentCount = profile?.assignedClasses?.length * 30 || 60;
            const subjectCount = profile?.subjects?.length || 3;

            setStats({
                totalStudents: studentCount,
                todayAttendance: Math.floor(studentCount * 0.9),
                assignedSubjects: subjectCount,
                pendingMarks: 2,
            });

            setRecentActivity([
                { id: 1, type: 'attendance', message: 'Marked attendance for CS301', time: 'Today, 10:00 AM' },
                { id: 2, type: 'marks', message: 'Entered Internal marks for CS302', time: 'Yesterday' },
                { id: 3, type: 'notes', message: 'Uploaded DBMS Unit 1 notes', time: '2 days ago' },
                { id: 4, type: 'leave', message: 'Student leave request pending', time: '3 days ago' },
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            {/* Welcome Header */}
            <div className="page-header">
                <div>
                    <h1>Welcome, {user?.firstName || 'Teacher'}!</h1>
                    <p>Manage your classes, attendance, and student performance</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiUsers />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCalendar />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.todayAttendance}</h3>
                        <p>Today's Attendance</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon percentage">
                        <FiBook />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.assignedSubjects}</h3>
                        <p>Assigned Subjects</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiFileText />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.pendingMarks}</h3>
                        <p>Pending Marks Entry</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Quick Actions</h2>
                </div>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <a href="/teacher/attendance" className="btn btn-primary">
                        <FiCalendar /> Mark Attendance
                    </a>
                    <a href="/teacher/marks" className="btn btn-secondary">
                        <FiFileText /> Enter Marks
                    </a>
                    <a href="/teacher/notes" className="btn btn-secondary">
                        <FiBook /> Upload Notes
                    </a>
                    <a href="/teacher/students" className="btn btn-secondary">
                        <FiUsers /> View Students
                    </a>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="section-card">
                <div className="section-header">
                    <h2><FiBell style={{ marginRight: 8 }} /> Recent Activity</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Activity</th>
                                <th>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentActivity.map((activity) => (
                                <tr key={activity.id}>
                                    <td>{activity.message}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{activity.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Assigned Classes */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Your Classes</h2>
                </div>
                <div style={{ padding: 'var(--spacing-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-4)' }}>
                        {(profile?.assignedClasses || [{ department: 'Computer Engineering', semester: 5, section: 'A' }]).map((cls, idx) => (
                            <div key={idx} className="card" style={{ padding: 'var(--spacing-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                                <h4>{cls.department || 'Computer Engineering'}</h4>
                                <p style={{ color: 'var(--text-muted)' }}>Semester {cls.semester || 5} - Section {cls.section || 'A'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;

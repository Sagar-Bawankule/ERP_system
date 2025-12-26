import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiCalendar, FiDollarSign, FiBook, FiFileText,
    FiAward, FiClock, FiTrendingUp, FiAlertCircle
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { attendanceService, feeService, marksService } from '../../services/api';
import './DashboardPages.css';

const StudentDashboard = () => {
    const { user, profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState({
        attendance: { percentage: 0, total: 0, present: 0 },
        fees: { total: 0, paid: 0, due: 0 },
        recentMarks: [],
        backlogs: 0,
    });

    useEffect(() => {
        fetchDashboardData();
    }, [profile]);

    const fetchDashboardData = async () => {
        if (!profile?._id) {
            setLoading(false);
            return;
        }

        try {
            // Fetch attendance summary
            const attendanceRes = await attendanceService.getSummary(profile._id);

            // Fetch fee summary
            const feeRes = await feeService.getStudentFees(profile._id);

            // Fetch backlogs
            const backlogRes = await marksService.getBacklogs(profile._id, { status: 'Open' });

            setDashboardData({
                attendance: attendanceRes.data.data?.overall || { percentage: 0, total: 0, present: 0 },
                fees: feeRes.data.summary || { total: 0, paid: 0, due: 0 },
                recentMarks: [],
                backlogs: backlogRes.data.summary?.open || 0,
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        }
        setLoading(false);
    };

    const quickActions = [
        { icon: FiCalendar, label: 'View Attendance', path: '/student/attendance', color: 'primary' },
        { icon: FiDollarSign, label: 'Pay Fees', path: '/student/fees', color: 'success' },
        { icon: FiBook, label: 'View Marks', path: '/student/marks', color: 'warning' },
        { icon: FiFileText, label: 'Study Materials', path: '/student/notes', color: 'info' },
        { icon: FiClock, label: 'Apply Leave', path: '/student/leave', color: 'secondary' },
        { icon: FiAward, label: 'Scholarships', path: '/student/scholarship', color: 'accent' },
    ];

    const statsCards = [
        {
            icon: FiCalendar,
            label: 'Attendance',
            value: `${dashboardData.attendance.percentage}%`,
            subtitle: `${dashboardData.attendance.present}/${dashboardData.attendance.total} days`,
            color: dashboardData.attendance.percentage >= 75 ? 'success' : 'warning'
        },
        {
            icon: FiDollarSign,
            label: 'Fee Status',
            value: `₹${(dashboardData.fees.due || 0).toLocaleString()}`,
            subtitle: dashboardData.fees.due > 0 ? 'Pending' : 'All Clear',
            color: dashboardData.fees.due > 0 ? 'error' : 'success'
        },
        {
            icon: FiAlertCircle,
            label: 'Backlogs',
            value: dashboardData.backlogs,
            subtitle: dashboardData.backlogs > 0 ? 'Subjects pending' : 'None',
            color: dashboardData.backlogs > 0 ? 'error' : 'success'
        },
        {
            icon: FiTrendingUp,
            label: 'Semester',
            value: profile?.semester || '-',
            subtitle: profile?.department?.split(' ')[0] || '-',
            color: 'primary'
        },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-page animate-fade-in">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>Welcome back, {user?.firstName}! 👋</h1>
                    <p>Here's an overview of your academic progress</p>
                </div>
                <div className="welcome-info">
                    <span className="badge badge-primary">{profile?.rollNumber}</span>
                    <span className="badge badge-info">{profile?.department}</span>
                    <span className="badge badge-success">Semester {profile?.semester}</span>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                {statsCards.map((stat, index) => (
                    <div key={index} className={`stat-card ${stat.color}`}>
                        <div className="stat-icon">
                            <stat.icon />
                        </div>
                        <div className="stat-content">
                            <h3 className="stat-value">{stat.value}</h3>
                            <p className="stat-label">{stat.label}</p>
                            <span className="stat-subtitle">{stat.subtitle}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Quick Actions</h2>
                </div>
                <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                        <Link key={index} to={action.path} className={`quick-action-card ${action.color}`}>
                            <div className="action-icon">
                                <action.icon />
                            </div>
                            <span className="action-label">{action.label}</span>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="dashboard-grid-2">
                {/* Recent Activity */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Recent Activity</h2>
                    </div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon success">
                                <FiCalendar />
                            </div>
                            <div className="activity-content">
                                <p className="activity-title">Attendance Marked</p>
                                <p className="activity-subtitle">Present in Database Management Systems</p>
                                <p className="activity-time">Today, 10:30 AM</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon warning">
                                <FiDollarSign />
                            </div>
                            <div className="activity-content">
                                <p className="activity-title">Fee Reminder</p>
                                <p className="activity-subtitle">Semester fee due date approaching</p>
                                <p className="activity-time">Yesterday</p>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon info">
                                <FiFileText />
                            </div>
                            <div className="activity-content">
                                <p className="activity-title">New Study Material</p>
                                <p className="activity-subtitle">Unit 3 notes uploaded by Prof. Sharma</p>
                                <p className="activity-time">2 days ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upcoming */}
                <div className="section-card">
                    <div className="section-header">
                        <h2>Upcoming</h2>
                    </div>
                    <div className="upcoming-list">
                        <div className="upcoming-item">
                            <div className="upcoming-date">
                                <span className="date-day">25</span>
                                <span className="date-month">Dec</span>
                            </div>
                            <div className="upcoming-content">
                                <p className="upcoming-title">Internal Exam</p>
                                <p className="upcoming-subtitle">Data Structures</p>
                            </div>
                        </div>
                        <div className="upcoming-item">
                            <div className="upcoming-date">
                                <span className="date-day">31</span>
                                <span className="date-month">Dec</span>
                            </div>
                            <div className="upcoming-content">
                                <p className="upcoming-title">Fee Due Date</p>
                                <p className="upcoming-subtitle">Semester 5 Fees</p>
                            </div>
                        </div>
                        <div className="upcoming-item">
                            <div className="upcoming-date">
                                <span className="date-day">05</span>
                                <span className="date-month">Jan</span>
                            </div>
                            <div className="upcoming-content">
                                <p className="upcoming-title">Project Submission</p>
                                <p className="upcoming-subtitle">Web Development Project</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

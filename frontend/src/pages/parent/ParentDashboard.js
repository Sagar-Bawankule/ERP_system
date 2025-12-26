import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    FiUsers, FiCalendar, FiBookOpen, FiDollarSign,
    FiBell, FiFileText, FiCheck, FiX, FiClock,
    FiTrendingUp, FiPieChart, FiChevronRight
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { parentService } from '../../services/api';
import './ParentPages.css';

const ParentDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [wardsData, setWardsData] = useState([]);
    const [selectedWard, setSelectedWard] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [dashboardRes, notificationsRes] = await Promise.all([
                parentService.getWardDashboard(),
                parentService.getNotifications()
            ]);

            const wards = dashboardRes.data.data || [];
            setWardsData(wards);
            if (wards.length > 0) {
                setSelectedWard(wards[0]);
            }
            setNotifications(notificationsRes.data.data || []);
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            setDemoData();
        }
        setLoading(false);
    };

    const setDemoData = () => {
        const demoWards = [
            {
                student: {
                    id: 'demo-1',
                    name: 'John Smith',
                    rollNumber: 'CS2021001',
                    department: 'Computer Science',
                    semester: 5,
                },
                attendance: {
                    summary: { total: 45, present: 42, percentage: 93 },
                    recent: [
                        { _id: '1', date: new Date(), status: 'Present', subject: { name: 'Database Management' } },
                        { _id: '2', date: new Date(Date.now() - 86400000), status: 'Present', subject: { name: 'Operating Systems' } },
                    ]
                },
                fees: { total: 75000, paid: 55000, due: 20000 },
                marks: [
                    { _id: '1', subject: { name: 'DBMS', code: 'CS301' }, examType: 'Mid Semester', marksObtained: 42, maxMarks: 50 },
                    { _id: '2', subject: { name: 'OS', code: 'CS302' }, examType: 'Mid Semester', marksObtained: 38, maxMarks: 50 },
                ],
                pendingLeaves: 1,
            }
        ];
        setWardsData(demoWards);
        setSelectedWard(demoWards[0]);

        setNotifications([
            { _id: '1', title: 'Fee Payment Reminder', message: 'Exam fee payment due by Dec 31', type: 'fees', createdAt: new Date(), isRead: false },
            { _id: '2', title: 'Leave Approved', message: 'Your ward\'s leave application has been approved', type: 'leave', createdAt: new Date(Date.now() - 86400000), isRead: true },
            { _id: '3', title: 'PTM Meeting', message: 'Parent-Teacher meeting scheduled for Jan 5', type: 'general', createdAt: new Date(Date.now() - 172800000), isRead: false },
        ]);
    };

    const getAttendanceStatus = (percentage) => {
        if (percentage >= 75) return { class: 'good', label: 'Good Standing' };
        if (percentage >= 60) return { class: 'warning', label: 'Needs Improvement' };
        return { class: 'danger', label: 'Critical' };
    };

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    if (wardsData.length === 0) {
        return (
            <div className="parent-page animate-fade-in">
                <div className="empty-state-large">
                    <FiUsers size={64} />
                    <h2>No Wards Linked</h2>
                    <p>No students are currently linked to your account. Please contact the administration to link your ward.</p>
                </div>
            </div>
        );
    }

    const attendanceStatus = getAttendanceStatus(selectedWard?.attendance?.summary?.percentage || 0);
    const unreadNotifications = notifications.filter(n => !n.isRead).length;

    return (
        <div className="parent-page animate-fade-in">
            {/* Header with Ward Selector */}
            <div className="dashboard-header">
                <div className="header-info">
                    <h1>Welcome, {user?.firstName}!</h1>
                    <p>Monitor your ward's academic progress and activities</p>
                </div>
                {wardsData.length > 1 && (
                    <div className="ward-selector">
                        <label>Select Ward:</label>
                        <select
                            value={selectedWard?.student?.id || ''}
                            onChange={(e) => {
                                const ward = wardsData.find(w => w.student.id === e.target.value);
                                setSelectedWard(ward);
                            }}
                            className="form-select"
                        >
                            {wardsData.map(ward => (
                                <option key={ward.student.id} value={ward.student.id}>
                                    {ward.student.name} - {ward.student.rollNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Ward Info Card */}
            <div className="ward-info-card">
                <div className="ward-avatar">
                    <FiUsers size={32} />
                </div>
                <div className="ward-details">
                    <h2>{selectedWard?.student?.name}</h2>
                    <div className="ward-meta">
                        <span><strong>Roll No:</strong> {selectedWard?.student?.rollNumber}</span>
                        <span><strong>Department:</strong> {selectedWard?.student?.department}</span>
                        <span><strong>Semester:</strong> {selectedWard?.student?.semester}</span>
                    </div>
                </div>
                <div className="ward-attendance-badge">
                    <div className={`attendance-circle ${attendanceStatus.class}`}>
                        <span className="percentage">{selectedWard?.attendance?.summary?.percentage || 0}%</span>
                        <span className="label">Attendance</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="quick-stats-grid">
                <Link to="/parent/attendance" className="quick-stat-card">
                    <div className="stat-icon attendance">
                        <FiCalendar />
                    </div>
                    <div className="stat-content">
                        <h3>{selectedWard?.attendance?.summary?.present || 0}/{selectedWard?.attendance?.summary?.total || 0}</h3>
                        <p>Classes Attended</p>
                    </div>
                    <FiChevronRight className="stat-arrow" />
                </Link>

                <Link to="/parent/marks" className="quick-stat-card">
                    <div className="stat-icon marks">
                        <FiBookOpen />
                    </div>
                    <div className="stat-content">
                        <h3>{selectedWard?.marks?.length || 0}</h3>
                        <p>Recent Results</p>
                    </div>
                    <FiChevronRight className="stat-arrow" />
                </Link>

                <Link to="/parent/fees" className="quick-stat-card">
                    <div className="stat-icon fees">
                        <FiDollarSign />
                    </div>
                    <div className="stat-content">
                        <h3>₹{(selectedWard?.fees?.due || 0).toLocaleString()}</h3>
                        <p>Fees Due</p>
                    </div>
                    <FiChevronRight className="stat-arrow" />
                </Link>

                <Link to="/parent/leave" className="quick-stat-card">
                    <div className="stat-icon leave">
                        <FiFileText />
                    </div>
                    <div className="stat-content">
                        <h3>{selectedWard?.pendingLeaves || 0}</h3>
                        <p>Pending Leaves</p>
                    </div>
                    <FiChevronRight className="stat-arrow" />
                </Link>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Attendance Overview */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3><FiPieChart /> Attendance Summary</h3>
                        <Link to="/parent/attendance" className="view-all">View Details</Link>
                    </div>
                    <div className="card-body">
                        <div className="attendance-chart">
                            <div className="donut-chart">
                                <svg viewBox="0 0 36 36">
                                    <path
                                        className="circle-bg"
                                        d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                    <path
                                        className={`circle ${attendanceStatus.class}`}
                                        strokeDasharray={`${selectedWard?.attendance?.summary?.percentage || 0}, 100`}
                                        d="M18 2.0845
                                            a 15.9155 15.9155 0 0 1 0 31.831
                                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                    />
                                </svg>
                                <div className="chart-center">
                                    <span className="value">{selectedWard?.attendance?.summary?.percentage || 0}%</span>
                                </div>
                            </div>
                            <div className="chart-legend">
                                <div className="legend-item">
                                    <span className="dot present"></span>
                                    <span>Present: {selectedWard?.attendance?.summary?.present || 0}</span>
                                </div>
                                <div className="legend-item">
                                    <span className="dot absent"></span>
                                    <span>Absent: {(selectedWard?.attendance?.summary?.total || 0) - (selectedWard?.attendance?.summary?.present || 0)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={`attendance-status ${attendanceStatus.class}`}>
                            {attendanceStatus.label}
                        </div>
                    </div>
                </div>

                {/* Fee Summary */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3><FiDollarSign /> Fee Summary</h3>
                        <Link to="/parent/fees" className="view-all">View Details</Link>
                    </div>
                    <div className="card-body">
                        <div className="fee-summary">
                            <div className="fee-item total">
                                <span className="label">Total Fees</span>
                                <span className="amount">₹{(selectedWard?.fees?.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="fee-item paid">
                                <span className="label">Paid Amount</span>
                                <span className="amount">₹{(selectedWard?.fees?.paid || 0).toLocaleString()}</span>
                            </div>
                            <div className="fee-item due">
                                <span className="label">Due Amount</span>
                                <span className="amount">₹{(selectedWard?.fees?.due || 0).toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="fee-progress">
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${selectedWard?.fees?.total ? (selectedWard.fees.paid / selectedWard.fees.total * 100) : 0}%`
                                    }}
                                ></div>
                            </div>
                            <span className="progress-text">
                                {selectedWard?.fees?.total ? Math.round(selectedWard.fees.paid / selectedWard.fees.total * 100) : 0}% Paid
                            </span>
                        </div>
                    </div>
                </div>

                {/* Recent Marks */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3><FiTrendingUp /> Recent Academic Performance</h3>
                        <Link to="/parent/marks" className="view-all">View All</Link>
                    </div>
                    <div className="card-body">
                        {selectedWard?.marks?.length > 0 ? (
                            <div className="recent-marks-list">
                                {selectedWard.marks.slice(0, 4).map((mark) => (
                                    <div key={mark._id} className="mark-item">
                                        <div className="mark-info">
                                            <span className="subject">{mark.subject?.name}</span>
                                            <span className="exam-type">{mark.examType}</span>
                                        </div>
                                        <div className="mark-score">
                                            <span className="obtained">{mark.obtainedMarks || mark.marksObtained}</span>
                                            <span className="max">/{mark.maxMarks}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-mini">
                                <p>No recent marks available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>
                            <FiBell />
                            Notifications
                            {unreadNotifications > 0 && (
                                <span className="notification-badge">{unreadNotifications}</span>
                            )}
                        </h3>
                        <Link to="/parent/notifications" className="view-all">View All</Link>
                    </div>
                    <div className="card-body">
                        {notifications.length > 0 ? (
                            <div className="notifications-list">
                                {notifications.slice(0, 4).map((notification) => (
                                    <div key={notification._id} className={`notification-item ${!notification.isRead ? 'unread' : ''}`}>
                                        <div className={`notification-icon ${notification.type}`}>
                                            {notification.type === 'fees' && <FiDollarSign />}
                                            {notification.type === 'leave' && <FiFileText />}
                                            {notification.type === 'attendance' && <FiCalendar />}
                                            {notification.type === 'marks' && <FiBookOpen />}
                                            {notification.type === 'general' && <FiBell />}
                                        </div>
                                        <div className="notification-content">
                                            <h4>{notification.title}</h4>
                                            <p>{notification.message}</p>
                                            <span className="time">
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-mini">
                                <p>No notifications</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;

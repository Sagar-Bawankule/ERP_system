import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiDollarSign, FiCalendar, FiFileText, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import '../student/StudentPages.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalTeachers: 0,
        feeCollected: 0,
        pendingLeaves: 0,
    });
    const [recentActivities, setRecentActivities] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            if (res.data.success) {
                const data = res.data.data;
                setStats({
                    totalStudents: data.counts?.students || 0,
                    totalTeachers: data.counts?.teachers || 0,
                    feeCollected: data.feeStats?.collected || 0,
                    pendingLeaves: data.counts?.pendingLeaves || 0,
                });
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
            // Set demo data
            setStats({
                totalStudents: 3,
                totalTeachers: 2,
                feeCollected: 55000,
                pendingLeaves: 1,
            });
        }

        setRecentActivities([
            { id: 1, type: 'student', message: 'New student registration: Rahul Kumar', time: '1 hour ago' },
            { id: 2, type: 'fee', message: 'Fee payment received: ₹55,000', time: '2 hours ago' },
            { id: 3, type: 'leave', message: 'Leave application pending approval', time: '3 hours ago' },
            { id: 4, type: 'marks', message: 'Semester marks uploaded for CS301', time: 'Yesterday' },
        ]);

        setLoading(false);
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) {
            return `₹${(amount / 100000).toFixed(1)}L`;
        }
        return `₹${amount.toLocaleString()}`;
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
                    <h1>Admin Dashboard</h1>
                    <p>Welcome back, {user?.firstName || 'Admin'}! Here's your overview.</p>
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
                    <div className="summary-icon percentage">
                        <FiUsers />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.totalTeachers}</h3>
                        <p>Total Teachers</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiDollarSign />
                    </div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.feeCollected)}</h3>
                        <p>Fee Collected</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiAlertTriangle />
                    </div>
                    <div className="summary-content">
                        <h3>{stats.pendingLeaves}</h3>
                        <p>Pending Leaves</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Quick Actions</h2>
                </div>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <Link to="/admin/students" className="btn btn-primary">
                        <FiUsers /> Manage Students
                    </Link>
                    <Link to="/admin/teachers" className="btn btn-secondary">
                        <FiUsers /> Manage Teachers
                    </Link>
                    <Link to="/admin/fees" className="btn btn-secondary">
                        <FiDollarSign /> Fee Management
                    </Link>
                    <Link to="/admin/leaves" className="btn btn-secondary">
                        <FiCalendar /> Leave Approval
                    </Link>
                    <Link to="/admin/reports" className="btn btn-secondary">
                        <FiFileText /> Reports
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="section-card">
                <div className="section-header">
                    <h2><FiTrendingUp style={{ marginRight: 8 }} /> Recent Activity</h2>
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
                            {recentActivities.map((activity) => (
                                <tr key={activity.id}>
                                    <td>{activity.message}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{activity.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Department Overview */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Department Overview</h2>
                </div>
                <div style={{ padding: 'var(--spacing-6)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                        {[
                            { name: 'Computer Engineering', students: 120, teachers: 8 },
                            { name: 'Mechanical Engineering', students: 90, teachers: 6 },
                            { name: 'Civil Engineering', students: 85, teachers: 5 },
                            { name: 'Electrical Engineering', students: 75, teachers: 5 },
                        ].map((dept, idx) => (
                            <div key={idx} style={{ padding: 'var(--spacing-4)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: 'var(--spacing-2)' }}>{dept.name}</h4>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {dept.students} Students • {dept.teachers} Teachers
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

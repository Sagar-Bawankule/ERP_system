import React, { useState, useEffect } from 'react';
import {
    FiBell, FiCalendar, FiDollarSign, FiBookOpen,
    FiFileText, FiCheck, FiChevronLeft, FiFilter,
    FiCheckCircle
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { parentService } from '../../services/api';
import './ParentPages.css';

const ParentNotifications = () => {
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await parentService.getNotifications();
            setNotifications(res.data.data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setDemoData();
        }
        setLoading(false);
    };

    const setDemoData = () => {
        setNotifications([
            {
                _id: '1',
                title: 'Fee Payment Reminder',
                message: 'Exam fee payment of ₹2,700 is due by December 31, 2024. Please ensure timely payment to avoid late fees.',
                type: 'fees',
                createdAt: new Date(),
                isRead: false
            },
            {
                _id: '2',
                title: 'Leave Application Approved',
                message: 'Your ward\'s leave application from Dec 10-11 has been approved by the class teacher.',
                type: 'leave',
                createdAt: new Date(Date.now() - 86400000),
                isRead: true
            },
            {
                _id: '3',
                title: 'Parent-Teacher Meeting',
                message: 'PTM scheduled for January 5, 2025 at 10:00 AM. Your presence is requested to discuss your ward\'s progress.',
                type: 'general',
                createdAt: new Date(Date.now() - 172800000),
                isRead: false
            },
            {
                _id: '4',
                title: 'Mid-Semester Results Published',
                message: 'Mid-semester examination results for Semester 5 have been published. Check the marks section for details.',
                type: 'marks',
                createdAt: new Date(Date.now() - 259200000),
                isRead: true
            },
            {
                _id: '5',
                title: 'Attendance Alert',
                message: 'Your ward\'s attendance has dropped below 75% in Operating Systems. Please ensure regular attendance.',
                type: 'attendance',
                createdAt: new Date(Date.now() - 345600000),
                isRead: false
            },
            {
                _id: '6',
                title: 'Holiday Announcement',
                message: 'College will remain closed on December 25-26 for Christmas holidays. Classes resume on December 27.',
                type: 'general',
                createdAt: new Date(Date.now() - 432000000),
                isRead: true
            },
            {
                _id: '7',
                title: 'New Study Material Uploaded',
                message: 'New notes for Database Management Systems Chapter 8 have been uploaded by Prof. Sharma.',
                type: 'general',
                createdAt: new Date(Date.now() - 518400000),
                isRead: true
            },
            {
                _id: '8',
                title: 'Fee Receipt Available',
                message: 'Payment receipt for Tuition Fee (₹55,000) is now available for download.',
                type: 'fees',
                createdAt: new Date(Date.now() - 604800000),
                isRead: true
            },
        ]);
    };

    const markAsRead = async (notificationId) => {
        try {
            // Call API to mark as read
            // await parentService.markNotificationRead(notificationId);

            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
            );
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'fees': return <FiDollarSign />;
            case 'leave': return <FiFileText />;
            case 'attendance': return <FiCalendar />;
            case 'marks': return <FiBookOpen />;
            default: return <FiBell />;
        }
    };

    const getNotificationTypeLabel = (type) => {
        switch (type) {
            case 'fees': return 'Fees';
            case 'leave': return 'Leave';
            case 'attendance': return 'Attendance';
            case 'marks': return 'Marks';
            default: return 'General';
        }
    };

    const formatTimeAgo = (date) => {
        const now = new Date();
        const diff = now - new Date(date);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        if (days < 7) return `${days} days ago`;
        return new Date(date).toLocaleDateString();
    };

    const filteredNotifications = notifications
        .filter(n => filter === 'all' || n.type === filter)
        .sort((a, b) => {
            if (sortOrder === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            }
            return new Date(a.createdAt) - new Date(b.createdAt);
        });

    const unreadCount = notifications.filter(n => !n.isRead).length;
    const notificationTypes = ['all', 'fees', 'leave', 'attendance', 'marks', 'general'];

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading notifications...</p>
            </div>
        );
    }

    return (
        <div className="parent-page animate-fade-in">
            <div className="page-header">
                <div className="header-left">
                    <Link to="/parent/dashboard" className="back-link">
                        <FiChevronLeft /> Back to Dashboard
                    </Link>
                    <h1>
                        Notifications
                        {unreadCount > 0 && (
                            <span className="unread-badge">{unreadCount} new</span>
                        )}
                    </h1>
                    <p>Stay updated with announcements and alerts</p>
                </div>
                <div className="header-actions">
                    {unreadCount > 0 && (
                        <button className="btn btn-secondary" onClick={markAllAsRead}>
                            <FiCheckCircle /> Mark All Read
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="notifications-filters">
                <div className="filter-group">
                    <FiFilter />
                    <span>Filter:</span>
                    {notificationTypes.map(type => (
                        <button
                            key={type}
                            className={`filter-btn ${filter === type ? 'active' : ''}`}
                            onClick={() => setFilter(type)}
                        >
                            {type === 'all' ? 'All' : getNotificationTypeLabel(type)}
                        </button>
                    ))}
                </div>
                <div className="sort-group">
                    <select
                        className="form-select"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                    </select>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="notification-stats">
                <div className="stat-item">
                    <span className="stat-value">{notifications.length}</span>
                    <span className="stat-label">Total</span>
                </div>
                <div className="stat-item unread">
                    <span className="stat-value">{unreadCount}</span>
                    <span className="stat-label">Unread</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{notifications.filter(n => n.type === 'fees').length}</span>
                    <span className="stat-label">Fees</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{notifications.filter(n => n.type === 'leave').length}</span>
                    <span className="stat-label">Leave</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{notifications.filter(n => n.type === 'attendance').length}</span>
                    <span className="stat-label">Attendance</span>
                </div>
            </div>

            {/* Notifications List */}
            <div className="notifications-container">
                {filteredNotifications.length > 0 ? (
                    <div className="notifications-list-full">
                        {filteredNotifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`notification-card ${!notification.isRead ? 'unread' : ''}`}
                                onClick={() => !notification.isRead && markAsRead(notification._id)}
                            >
                                <div className={`notification-icon-large ${notification.type}`}>
                                    {getNotificationIcon(notification.type)}
                                </div>
                                <div className="notification-body">
                                    <div className="notification-header">
                                        <h3>{notification.title}</h3>
                                        <span className={`type-badge ${notification.type}`}>
                                            {getNotificationTypeLabel(notification.type)}
                                        </span>
                                    </div>
                                    <p className="notification-message">{notification.message}</p>
                                    <div className="notification-footer">
                                        <span className="notification-time">
                                            <FiCalendar />
                                            {formatTimeAgo(notification.createdAt)}
                                        </span>
                                        {!notification.isRead && (
                                            <span className="unread-indicator">
                                                <span className="dot"></span>
                                                New
                                            </span>
                                        )}
                                        {notification.isRead && (
                                            <span className="read-indicator">
                                                <FiCheck /> Read
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiBell size={48} />
                        <h3>No notifications</h3>
                        <p>
                            {filter !== 'all'
                                ? `No ${getNotificationTypeLabel(filter)} notifications found`
                                : 'You\'re all caught up! No new notifications.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentNotifications;

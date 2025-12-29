import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
    FiHome, FiUsers, FiBook, FiCalendar, FiDollarSign,
    FiFileText, FiAward, FiImage, FiBarChart2, FiSettings,
    FiLogOut, FiMenu, FiX, FiBell, FiUser, FiChevronDown
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Navigation items based on user role
    const getNavItems = () => {
        const baseRoute = `/${user?.role}`;

        const studentNav = [
            { path: `${baseRoute}/dashboard`, icon: FiHome, label: 'Dashboard' },
            { path: `${baseRoute}/attendance`, icon: FiCalendar, label: 'Attendance' },
            { path: `${baseRoute}/fees`, icon: FiDollarSign, label: 'Fees' },
            { path: `${baseRoute}/marks`, icon: FiBook, label: 'Marks & Results' },
            { path: `${baseRoute}/notes`, icon: FiFileText, label: 'Study Materials' },
            { path: `${baseRoute}/leave`, icon: FiCalendar, label: 'Leave' },
            { path: `${baseRoute}/scholarship`, icon: FiAward, label: 'Scholarships' },
            { path: `${baseRoute}/profile`, icon: FiUser, label: 'Profile' },
        ];

        const teacherNav = [
            { path: `${baseRoute}/dashboard`, icon: FiHome, label: 'Dashboard' },
            { path: `${baseRoute}/students`, icon: FiUsers, label: 'Students' },
            { path: `${baseRoute}/attendance`, icon: FiCalendar, label: 'Attendance' },
            { path: `${baseRoute}/marks`, icon: FiBook, label: 'Marks Entry' },
            { path: `${baseRoute}/notes`, icon: FiFileText, label: 'Upload Notes' },
            { path: `${baseRoute}/profile`, icon: FiUser, label: 'Profile' },
        ];

        const parentNav = [
            { path: `${baseRoute}/dashboard`, icon: FiHome, label: 'Dashboard' },
            { path: `${baseRoute}/profile`, icon: FiUser, label: 'Profile' },
        ];

        const adminNav = [
            { path: `${baseRoute}/dashboard`, icon: FiHome, label: 'Dashboard' },
            { path: `${baseRoute}/students`, icon: FiUsers, label: 'Students' },
            { path: `${baseRoute}/teachers`, icon: FiUsers, label: 'Teachers' },
            { path: `${baseRoute}/parents`, icon: FiUsers, label: 'Parents' },
            { path: `${baseRoute}/subjects`, icon: FiBook, label: 'Subjects' },
            { path: `${baseRoute}/classes`, icon: FiCalendar, label: 'Classes' },
            { path: `${baseRoute}/teaching-assignments`, icon: FiBook, label: 'Teaching Assignments' },
            { path: `${baseRoute}/fees`, icon: FiDollarSign, label: 'Fees' },
            { path: `${baseRoute}/scholarships`, icon: FiAward, label: 'Scholarships' },
            { path: `${baseRoute}/leaves`, icon: FiCalendar, label: 'Leave Applications' },
            { path: `${baseRoute}/gallery`, icon: FiImage, label: 'Gallery' },
            { path: `${baseRoute}/reports`, icon: FiBarChart2, label: 'Reports' },
            { path: `${baseRoute}/profile`, icon: FiUser, label: 'Profile' },
        ];

        switch (user?.role) {
            case 'student': return studentNav;
            case 'teacher': return teacherNav;
            case 'parent': return parentNav;
            case 'admin': return adminNav;
            default: return [];
        }
    };

    const navItems = getNavItems();

    const getRoleLabel = () => {
        switch (user?.role) {
            case 'student': return 'Student Portal';
            case 'teacher': return 'Teacher Portal';
            case 'parent': return 'Parent Portal';
            case 'admin': return 'Admin Portal';
            default: return 'Dashboard';
        }
    };

    return (
        <div className={`dashboard-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* Sidebar */}
            <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/" className="sidebar-logo">
                        <img src="/logo2.jpg" alt="Logo" />
                        {sidebarOpen && <span>Samarth ERP</span>}
                    </Link>
                    <button
                        className="sidebar-close-mobile"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <FiX />
                    </button>
                </div>

                <div className="sidebar-role-badge">
                    {getRoleLabel()}
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            {sidebarOpen && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-nav-item logout-btn" onClick={handleLogout}>
                        <FiLogOut className="nav-icon" />
                        {sidebarOpen && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="dashboard-main">
                {/* Top Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <button
                            className="menu-toggle"
                            onClick={() => {
                                if (window.innerWidth <= 768) {
                                    setMobileMenuOpen(!mobileMenuOpen);
                                } else {
                                    setSidebarOpen(!sidebarOpen);
                                }
                            }}
                        >
                            <FiMenu />
                        </button>
                        <div className="breadcrumb">
                            <span className="breadcrumb-role">{getRoleLabel()}</span>
                            <span className="breadcrumb-separator">/</span>
                            <span className="breadcrumb-page">
                                {navItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
                            </span>
                        </div>
                    </div>

                    <div className="header-right">
                        {/* Notifications */}
                        <button className="header-icon-btn">
                            <FiBell />
                            <span className="notification-badge">3</span>
                        </button>

                        {/* Profile Dropdown */}
                        <div className="profile-dropdown">
                            <button
                                className="profile-btn"
                                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                            >
                                <div className="profile-avatar">
                                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                                </div>
                                <div className="profile-info">
                                    <span className="profile-name">{user?.firstName} {user?.lastName}</span>
                                    <span className="profile-role">{user?.role}</span>
                                </div>
                                <FiChevronDown className={`dropdown-icon ${profileDropdownOpen ? 'open' : ''}`} />
                            </button>

                            {profileDropdownOpen && (
                                <div className="dropdown-menu">
                                    <Link to={`/${user?.role}/profile`} className="dropdown-item">
                                        <FiUser /> Profile
                                    </Link>
                                    <Link to={`/${user?.role}/profile`} className="dropdown-item">
                                        <FiSettings /> Settings
                                    </Link>
                                    <hr />
                                    <button className="dropdown-item logout" onClick={handleLogout}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="dashboard-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;

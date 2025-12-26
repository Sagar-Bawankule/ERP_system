import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);
    const { login, getDashboardRoute } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            toast.success('Login successful!');
            const from = location.state?.from?.pathname || getDashboardRoute();
            navigate(from, { replace: true });
        } else {
            toast.error(result.message);
        }

        setLoading(false);
    };

    const demoCredentials = [
        { role: 'Admin', email: 'admin@samarthcollege.edu.in', password: 'admin123' },
        { role: 'Teacher', email: 'teacher1@samarthcollege.edu.in', password: 'teacher123' },
        { role: 'Student', email: 'student1@samarthcollege.edu.in', password: 'student123' },
        { role: 'Parent', email: 'parent1@gmail.com', password: 'parent123' },
    ];

    const fillDemo = (role, email, password) => {
        setFormData({ email, password });
        setSelectedRole(role);
    };

    const getWelcomeMessage = () => {
        if (selectedRole) {
            switch (selectedRole) {
                case 'Admin':
                    return 'Welcome Back, Administrator';
                case 'Teacher':
                    return 'Welcome Back, Teacher';
                case 'Student':
                    return 'Welcome Back, Student';
                case 'Parent':
                    return 'Welcome Back, Parent';
                default:
                    return 'Welcome Back';
            }
        }
        return 'Welcome Back';
    };

    const getSubtitle = () => {
        if (selectedRole) {
            switch (selectedRole) {
                case 'Admin':
                    return 'Sign in to manage the college system';
                case 'Teacher':
                    return 'Sign in to access your teaching dashboard';
                case 'Student':
                    return 'Sign in to access your student portal';
                case 'Parent':
                    return 'Sign in to monitor your ward\'s progress';
                default:
                    return 'Sign in to access your dashboard';
            }
        }
        return 'Sign in to access your dashboard';
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                {/* Left Side - Image/Branding */}
                <div className="auth-branding">
                    <div className="branding-content">
                        <Link to="/" className="auth-logo">
                            <img src="/logo2.jpg" alt="Samarth College" />
                        </Link>
                        <h1>Samarth College</h1>
                        <p>of Engineering & Management</p>
                        <div className="branding-tagline">
                            Empowering Education Through Technology
                        </div>
                    </div>
                    <div className="branding-decoration">
                        <div className="circle circle-1"></div>
                        <div className="circle circle-2"></div>
                        <div className="circle circle-3"></div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="auth-form-container">
                    <div className="auth-form-wrapper">
                        <div className="auth-header">
                            <h2 className={selectedRole ? 'animate-text' : ''}>{getWelcomeMessage()}</h2>
                            <p>{getSubtitle()}</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <div className="input-icon-wrapper">
                                    <FiMail className="input-icon" />
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-input with-icon"
                                        placeholder="Enter your email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Password</label>
                                <div className="input-icon-wrapper">
                                    <FiLock className="input-icon" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="form-input with-icon"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-options">
                                <label className="checkbox-wrapper">
                                    <input type="checkbox" />
                                    <span className="checkmark"></span>
                                    Remember me
                                </label>
                                <a href="#" className="forgot-link">Forgot Password?</a>
                            </div>

                            <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                                {loading ? (
                                    <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                                ) : (
                                    <>
                                        Sign In
                                        <FiArrowRight />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-divider">
                            <span>Demo Credentials</span>
                        </div>

                        <div className="demo-credentials">
                            {demoCredentials.map((cred, index) => (
                                <button
                                    key={index}
                                    className={`demo-btn ${selectedRole === cred.role ? 'active' : ''}`}
                                    onClick={() => fillDemo(cred.role, cred.email, cred.password)}
                                >
                                    {cred.role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;


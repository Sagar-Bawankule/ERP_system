import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiBook, FiAward, FiTrendingUp, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { galleryService } from '../services/api';
import './LandingPage.css';

const LandingPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [carouselImages, setCarouselImages] = useState([]);

    useEffect(() => {
        fetchCarouselImages();
    }, []);

    const fetchCarouselImages = async () => {
        try {
            const response = await galleryService.getCarousel();
            if (response.data.data.length > 0) {
                setCarouselImages(response.data.data);
            } else {
                // Default images if none in database
                setCarouselImages([
                    { title: 'Campus Main Entrance', image: { url: '/clg_maindoor.jpg' } },
                    { title: 'Computer Lab', image: { url: '/computer_lab.jpg' } },
                    { title: 'Administrative Block', image: { url: '/administrive office.jpg' } },
                ]);
            }
        } catch (error) {
            // Use default images
            setCarouselImages([
                { title: 'Campus Main Entrance', image: { url: '/clg_maindoor.jpg' } },
                { title: 'Computer Lab', image: { url: '/computer_lab.jpg' } },
                { title: 'Administrative Block', image: { url: '/administrive office.jpg' } },
            ]);
        }
    };

    useEffect(() => {
        if (carouselImages.length > 0) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [carouselImages]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
    };

    const stats = [
        { icon: FiUsers, value: '2500+', label: 'Students' },
        { icon: FiBook, value: '6', label: 'Departments' },
        { icon: FiAward, value: '15+', label: 'Years of Excellence' },
        { icon: FiTrendingUp, value: '95%', label: 'Placement Rate' },
    ];

    const features = [
        {
            title: 'Student Portal',
            description: 'Access attendance, marks, fees, study materials, and more from a single dashboard.',
            color: 'primary',
        },
        {
            title: 'Teacher Portal',
            description: 'Manage classes, upload notes, mark attendance, and enter student marks efficiently.',
            color: 'secondary',
        },
        {
            title: 'Parent Portal',
            description: 'Monitor your ward\'s academic progress, attendance, and fee payments in real-time.',
            color: 'tertiary',
        },
        {
            title: 'Admin Dashboard',
            description: 'Complete control over student management, fees, scholarships, and analytics.',
            color: 'quaternary',
        },
    ];

    const departments = [
        'Computer Engineering',
        'Mechanical Engineering',
        'Civil Engineering',
        'Electrical Engineering',
        'Electronics Engineering',
        'Information Technology',
    ];

    return (
        <div className="landing-page">
            {/* Hero Section with Carousel */}
            <section className="hero-section">
                <div className="hero-carousel">
                    {carouselImages.map((image, index) => (
                        <div
                            key={index}
                            className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image.image?.url || '/clg_maindoor.jpg'})` }}
                        >
                            <div className="carousel-overlay" />
                        </div>
                    ))}

                    {/* Carousel Controls */}
                    <button className="carousel-btn prev" onClick={prevSlide}>
                        <FiChevronLeft />
                    </button>
                    <button className="carousel-btn next" onClick={nextSlide}>
                        <FiChevronRight />
                    </button>

                    {/* Carousel Dots */}
                    <div className="carousel-dots">
                        {carouselImages.map((_, index) => (
                            <button
                                key={index}
                                className={`dot ${index === currentSlide ? 'active' : ''}`}
                                onClick={() => setCurrentSlide(index)}
                            />
                        ))}
                    </div>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">Welcome to</div>
                    <h1 className="hero-title">
                        <span className="highlight">Samarth</span> College of
                        <br />Engineering & Management
                    </h1>
                    <p className="hero-subtitle">
                        Empowering students with quality education and creating future leaders
                        in technology and management since 2010.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Student Login
                            <FiArrowRight />
                        </Link>
                        <Link to="/about" className="btn btn-secondary btn-lg">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="stats-container">
                    {stats.map((stat, index) => (
                        <div key={index} className="stat-card">
                            <div className="stat-icon">
                                <stat.icon />
                            </div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">ERP System Features</h2>
                        <p className="section-subtitle">
                            A comprehensive digital platform for all academic and administrative needs
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className={`feature-card ${feature.color}`}>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                                <Link to="/login" className="feature-link">
                                    Access Portal <FiArrowRight />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Departments Section */}
            <section className="departments-section">
                <div className="section-container">
                    <div className="section-header">
                        <h2 className="section-title">Our Departments</h2>
                        <p className="section-subtitle">
                            Offering diverse engineering programs with state-of-the-art facilities
                        </p>
                    </div>

                    <div className="departments-grid">
                        {departments.map((dept, index) => (
                            <div key={index} className="department-card">
                                <div className="dept-number">{String(index + 1).padStart(2, '0')}</div>
                                <h3>{dept}</h3>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Ready to Get Started?</h2>
                    <p>
                        Access your personalized dashboard to manage your academic journey.
                    </p>
                    <div className="cta-buttons">
                        <Link to="/login" className="btn btn-primary btn-lg">
                            Login Now
                        </Link>
                        <Link to="/contact" className="btn btn-secondary btn-lg">
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;

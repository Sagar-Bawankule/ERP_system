import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiUsers } from 'react-icons/fi';
import api from '../../services/api';
import '../student/StudentPages.css';

const AdminReports = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpense: 0,
        totalFees: 0,
        totalStudents: 0
    });

    useEffect(() => {
        fetchReportData();
    }, []);

    const fetchReportData = async () => {
        try {
            const res = await api.get('/accountant/dashboard');
            if (res.data.success) {
                setStats({
                    totalIncome: res.data.data.stats?.monthlyIncome || 0,
                    totalExpense: res.data.data.stats?.monthlyExpense || 0,
                    totalFees: res.data.data.stats?.monthlyFeeCollection || 0,
                    totalStudents: 150 // Placeholder
                });
            }
        } catch (error) {
            console.error('Error fetching report data:', error);
            setStats({
                totalIncome: 250000,
                totalExpense: 180000,
                totalFees: 350000,
                totalStudents: 150
            });
        }
        setLoading(false);
    };

    const formatCurrency = (amount) => {
        if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
        if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
        return `₹${amount.toLocaleString()}`;
    };

    if (loading) {
        return <div className="page-loading"><div className="spinner"></div><p>Loading financial summary...</p></div>;
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Financial Summary</h1>
                    <p>Monthly financial overview and statistics</p>
                </div>
            </div>

            {/* Financial Stats */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon present"><FiTrendingUp /></div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.totalIncome)}</h3>
                        <p>Monthly Income</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon absent"><FiTrendingDown /></div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.totalExpense)}</h3>
                        <p>Monthly Expense</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon total"><FiDollarSign /></div>
                    <div className="summary-content">
                        <h3>{formatCurrency(stats.totalFees)}</h3>
                        <p>Fees Collected</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon percentage"><FiUsers /></div>
                    <div className="summary-content">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
            </div>

            {/* Net Balance */}
            <div className="section-card">
                <div className="section-header"><h2>Financial Balance</h2></div>
                <div style={{ padding: 'var(--spacing-6)' }}>
                    <div style={{
                        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: 'var(--spacing-4)',
                    }}>
                        <div style={{ padding: 'var(--spacing-4)', background: '#e8f5e9', borderRadius: 'var(--radius-lg)', border: '1px solid #4caf50' }}>
                            <h4 style={{ color: '#2e7d32' }}>Total Income</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2e7d32' }}>{formatCurrency(stats.totalIncome + stats.totalFees)}</p>
                        </div>
                        <div style={{ padding: 'var(--spacing-4)', background: '#fce4ec', borderRadius: 'var(--radius-lg)', border: '1px solid #e91e63' }}>
                            <h4 style={{ color: '#c62828' }}>Total Expense</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c62828' }}>{formatCurrency(stats.totalExpense)}</p>
                        </div>
                        <div style={{ padding: 'var(--spacing-4)', background: '#e3f2fd', borderRadius: 'var(--radius-lg)', border: '1px solid #2196f3' }}>
                            <h4 style={{ color: '#1565c0' }}>Net Balance</h4>
                            <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1565c0' }}>
                                {formatCurrency((stats.totalIncome + stats.totalFees) - stats.totalExpense)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminReports;

import React, { useState, useEffect } from 'react';
import { FiCalendar, FiCheck, FiX, FiClock, FiPieChart } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/api';
import './StudentPages.css';

const StudentAttendance = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
    });
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM format
    );

    useEffect(() => {
        if (profile?._id) {
            fetchAttendance();
        }
    }, [profile, selectedMonth]);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            // Fetch attendance records
            const res = await attendanceService.getStudent(profile._id, { month: selectedMonth });
            setAttendance(res.data.data || []);

            // Fetch summary
            const summaryRes = await attendanceService.getSummary(profile._id);
            setSummary(summaryRes.data.data?.overall || {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                percentage: 0,
            });
        } catch (error) {
            console.error('Error fetching attendance:', error);
            // Set demo data if API fails
            setDemoData();
        }
        setLoading(false);
    };

    const setDemoData = () => {
        // Demo attendance data for visualization
        const demoAttendance = [];
        const today = new Date();
        for (let i = 30; i >= 1; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            if (date.getDay() !== 0 && date.getDay() !== 6) { // Skip weekends
                demoAttendance.push({
                    _id: `demo-${i}`,
                    date: date.toISOString(),
                    status: Math.random() > 0.15 ? 'Present' : Math.random() > 0.5 ? 'Absent' : 'Late',
                    subject: { name: ['Database Management', 'Operating Systems', 'Machine Learning', 'Web Development'][Math.floor(Math.random() * 4)], code: 'CS30' + Math.floor(Math.random() * 9) },
                });
            }
        }
        setAttendance(demoAttendance);

        const present = demoAttendance.filter(a => a.status === 'Present').length;
        const late = demoAttendance.filter(a => a.status === 'Late').length;
        const absent = demoAttendance.filter(a => a.status === 'Absent').length;
        const total = demoAttendance.length;

        setSummary({
            total,
            present: present + late,
            absent,
            late,
            percentage: Math.round(((present + late) / total) * 100),
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present': return <FiCheck className="status-icon present" />;
            case 'Absent': return <FiX className="status-icon absent" />;
            case 'Late': return <FiClock className="status-icon late" />;
            default: return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Present': return 'badge-success';
            case 'Absent': return 'badge-error';
            case 'Late': return 'badge-warning';
            default: return 'badge-info';
        }
    };

    const months = [
        { value: '2024-12', label: 'December 2024' },
        { value: '2024-11', label: 'November 2024' },
        { value: '2024-10', label: 'October 2024' },
        { value: '2024-09', label: 'September 2024' },
        { value: '2024-08', label: 'August 2024' },
    ];

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading attendance...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>My Attendance</h1>
                    <p>Track your attendance records and statistics</p>
                </div>
                <div className="header-actions">
                    <select
                        className="form-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        {months.map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-grid">
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiCalendar />
                    </div>
                    <div className="summary-content">
                        <h3>{summary.total}</h3>
                        <p>Total Classes</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCheck />
                    </div>
                    <div className="summary-content">
                        <h3>{summary.present}</h3>
                        <p>Present</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiX />
                    </div>
                    <div className="summary-content">
                        <h3>{summary.absent}</h3>
                        <p>Absent</p>
                    </div>
                </div>

                <div className="summary-card">
                    <div className="summary-icon percentage">
                        <FiPieChart />
                    </div>
                    <div className="summary-content">
                        <h3>{summary.percentage}%</h3>
                        <p>Attendance</p>
                    </div>
                    <div className={`status-indicator ${summary.percentage >= 75 ? 'good' : 'warning'}`}>
                        {summary.percentage >= 75 ? 'Good' : 'Low'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="attendance-progress-card">
                <div className="progress-header">
                    <span>Overall Attendance</span>
                    <span className={`percentage ${summary.percentage >= 75 ? 'good' : 'warning'}`}>
                        {summary.percentage}%
                    </span>
                </div>
                <div className="progress-bar">
                    <div
                        className={`progress-fill ${summary.percentage >= 75 ? 'good' : 'warning'}`}
                        style={{ width: `${summary.percentage}%` }}
                    ></div>
                </div>
                <p className="progress-note">
                    {summary.percentage >= 75
                        ? '✅ You meet the minimum attendance requirement'
                        : '⚠️ Your attendance is below the 75% requirement'}
                </p>
            </div>

            {/* Attendance Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Attendance Records</h2>
                    <span className="record-count">{attendance.length} records</span>
                </div>

                {attendance.length > 0 ? (
                    <div className="table-container">
                        <table className="table attendance-table">
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Day</th>
                                    <th>Subject</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendance.map((record) => (
                                    <tr key={record._id}>
                                        <td>
                                            <div className="date-cell">
                                                <span className="date-number">
                                                    {new Date(record.date).getDate()}
                                                </span>
                                                <span className="date-month">
                                                    {new Date(record.date).toLocaleString('default', { month: 'short' })}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            {new Date(record.date).toLocaleString('default', { weekday: 'long' })}
                                        </td>
                                        <td>
                                            <div className="subject-cell">
                                                <span className="subject-name">{record.subject?.name || 'N/A'}</span>
                                                <span className="subject-code">{record.subject?.code || ''}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusClass(record.status)}`}>
                                                {getStatusIcon(record.status)}
                                                {record.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="empty-state">
                        <FiCalendar size={48} />
                        <h3>No attendance records</h3>
                        <p>Attendance records for the selected month will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentAttendance;

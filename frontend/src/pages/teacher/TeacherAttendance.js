import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSave, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/api';
import '../student/StudentPages.css';

const TeacherAttendance = () => {
    const { profile } = useAuth();
    const [loading, setLoading] = useState(true);
    const [students, setStudents] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        loadDemoData();
    }, []);

    const loadDemoData = () => {
        // Demo students for attendance marking
        setStudents([
            { _id: '1', rollNumber: 'CE2024001', name: 'Rahul Kumar', department: 'Computer Engineering', semester: 5 },
            { _id: '2', rollNumber: 'CE2024002', name: 'Priya Singh', department: 'Computer Engineering', semester: 5 },
            { _id: '3', rollNumber: 'CE2024003', name: 'Amit Jadhav', department: 'Computer Engineering', semester: 5 },
            { _id: '4', rollNumber: 'CE2024004', name: 'Sneha Patil', department: 'Computer Engineering', semester: 5 },
            { _id: '5', rollNumber: 'CE2024005', name: 'Vikram Sharma', department: 'Computer Engineering', semester: 5 },
        ]);

        // Initialize all as present by default
        const initialAttendance = {};
        ['1', '2', '3', '4', '5'].forEach(id => {
            initialAttendance[id] = 'Present';
        });
        setAttendanceData(initialAttendance);
        setLoading(false);
    };

    const toggleAttendance = (studentId) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: prev[studentId] === 'Present' ? 'Absent' : 'Present',
        }));
    };

    const markAllPresent = () => {
        const newData = {};
        students.forEach(s => { newData[s._id] = 'Present'; });
        setAttendanceData(newData);
        toast.success('All students marked present');
    };

    const markAllAbsent = () => {
        const newData = {};
        students.forEach(s => { newData[s._id] = 'Absent'; });
        setAttendanceData(newData);
        toast.info('All students marked absent');
    };

    const handleSubmit = async () => {
        try {
            // In real implementation, this would call the API
            toast.success('Attendance submitted successfully!');
        } catch (error) {
            toast.error('Failed to submit attendance');
        }
    };

    const presentCount = Object.values(attendanceData).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(s => s === 'Absent').length;

    if (loading) {
        return (
            <div className="page-loading">
                <div className="spinner"></div>
                <p>Loading students...</p>
            </div>
        );
    }

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Mark Attendance</h1>
                    <p>Mark daily attendance for your classes</p>
                </div>
                <button className="btn btn-primary" onClick={handleSubmit}>
                    <FiSave /> Submit Attendance
                </button>
            </div>

            {/* Filters */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
                    <div className="form-group">
                        <label className="form-label">Date</label>
                        <input
                            type="date"
                            className="form-input"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Class</label>
                        <select className="form-select" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                            <option value="">Select Class</option>
                            <option value="CE-5-A">Computer Engineering - Sem 5 - A</option>
                            <option value="CE-5-B">Computer Engineering - Sem 5 - B</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject</label>
                        <select className="form-select" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                            <option value="">Select Subject</option>
                            <option value="CS301">CS301 - DBMS</option>
                            <option value="CS302">CS302 - Operating Systems</option>
                            <option value="CS303">CS303 - Computer Networks</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="summary-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiCalendar />
                    </div>
                    <div className="summary-content">
                        <h3>{students.length}</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon present">
                        <FiCheck />
                    </div>
                    <div className="summary-content">
                        <h3>{presentCount}</h3>
                        <p>Present</p>
                    </div>
                </div>
                <div className="summary-card">
                    <div className="summary-icon absent">
                        <FiX />
                    </div>
                    <div className="summary-content">
                        <h3>{absentCount}</h3>
                        <p>Absent</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)' }}>
                <button className="btn btn-secondary btn-sm" onClick={markAllPresent}>
                    <FiCheck /> Mark All Present
                </button>
                <button className="btn btn-secondary btn-sm" onClick={markAllAbsent}>
                    <FiX /> Mark All Absent
                </button>
            </div>

            {/* Attendance List */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Student List</h2>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Roll No</th>
                                <th>Name</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td><strong>{student.rollNumber}</strong></td>
                                    <td>{student.name}</td>
                                    <td>
                                        <span className={`badge ${attendanceData[student._id] === 'Present' ? 'badge-success' : 'badge-error'}`}>
                                            {attendanceData[student._id]}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`btn btn-sm ${attendanceData[student._id] === 'Present' ? 'btn-secondary' : 'btn-primary'}`}
                                            onClick={() => toggleAttendance(student._id)}
                                        >
                                            {attendanceData[student._id] === 'Present' ? (
                                                <><FiX /> Mark Absent</>
                                            ) : (
                                                <><FiCheck /> Mark Present</>
                                            )}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;

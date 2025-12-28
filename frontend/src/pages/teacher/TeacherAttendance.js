import React, { useState, useEffect } from 'react';
import { FiCheck, FiX, FiSave, FiCalendar, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherAttendance = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState({});

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchStudents();
        }
    }, [selectedClass, selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        }
    };

    const fetchStudents = async () => {
        setLoading(true);
        try {
            // Parse selected class (e.g., "Computer Engineering-5-A")
            const [department, semester, section] = selectedClass.split('-');

            const res = await api.get('/students', {
                params: {
                    department: department.trim(),
                    semester: parseInt(semester),
                    section: section?.trim() || 'A'
                }
            });

            const studentList = res.data.data || [];
            setStudents(studentList);

            // Initialize all as present by default
            const initialAttendance = {};
            studentList.forEach(student => {
                initialAttendance[student._id] = 'Present';
            });
            setAttendanceData(initialAttendance);

            // Check if attendance already marked for this date
            if (studentList.length > 0) {
                await checkExistingAttendance();
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to load students');
            setStudents([]);
        }
        setLoading(false);
    };

    const checkExistingAttendance = async () => {
        try {
            const [department, semester, section] = selectedClass.split('-');
            const res = await api.get('/attendance/class', {
                params: {
                    department: department.trim(),
                    semester: parseInt(semester),
                    section: section?.trim(),
                    subjectId: selectedSubject,
                    date: selectedDate
                }
            });

            if (res.data.data && res.data.data.length > 0) {
                // Load existing attendance
                const existing = {};
                res.data.data.forEach(record => {
                    existing[record.student._id] = record.status;
                });
                setAttendanceData(prev => ({ ...prev, ...existing }));
                toast.info('Existing attendance loaded for this date');
            }
        } catch (error) {
            console.error('Error checking existing attendance:', error);
        }
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
        if (!selectedClass || !selectedSubject) {
            toast.error('Please select class and subject');
            return;
        }

        if (students.length === 0) {
            toast.error('No students to mark attendance');
            return;
        }

        setSubmitting(true);
        try {
            const attendanceList = students.map(student => ({
                studentId: student._id,
                status: attendanceData[student._id] || 'Present',
                remarks: ''
            }));

            await api.post('/attendance/mark', {
                subjectId: selectedSubject,
                date: selectedDate,
                attendanceData: attendanceList,
                lectureNumber: 1
            });

            toast.success('Attendance submitted successfully!');
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error(error.response?.data?.message || 'Failed to submit attendance');
        }
        setSubmitting(false);
    };

    const presentCount = Object.values(attendanceData).filter(s => s === 'Present').length;
    const absentCount = Object.values(attendanceData).filter(s => s === 'Absent').length;

    // Generate class options from subjects
    const classOptions = [...new Set(subjects.map(s => `${s.department}-${s.semester}-A`))];

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Mark Attendance</h1>
                    <p>Mark daily attendance for your classes</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={handleSubmit}
                    disabled={submitting || students.length === 0}
                >
                    <FiSave /> {submitting ? 'Saving...' : 'Submit Attendance'}
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
                        <label className="form-label">Class *</label>
                        <select
                            className="form-select"
                            value={selectedClass}
                            onChange={(e) => setSelectedClass(e.target.value)}
                        >
                            <option value="">Select Class</option>
                            {classOptions.length > 0 ? (
                                classOptions.map((cls, idx) => (
                                    <option key={idx} value={cls}>{cls.replace(/-/g, ' - Sem ')}</option>
                                ))
                            ) : (
                                <>
                                    <option value="Computer Engineering-5-A">Computer Engineering - Sem 5 - A</option>
                                    <option value="Computer Engineering-5-B">Computer Engineering - Sem 5 - B</option>
                                    <option value="Computer Engineering-3-A">Computer Engineering - Sem 3 - A</option>
                                    <option value="Mechanical Engineering-5-A">Mechanical Engineering - Sem 5 - A</option>
                                </>
                            )}
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <select
                            className="form-select"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                        >
                            <option value="">Select Subject</option>
                            {subjects.filter(s => {
                                if (!selectedClass) return true;
                                const [dept, sem] = selectedClass.split('-');
                                return s.department === dept && s.semester === parseInt(sem);
                            }).map(subject => (
                                <option key={subject._id} value={subject._id}>
                                    {subject.code} - {subject.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary */}
            <div className="summary-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div className="summary-card">
                    <div className="summary-icon total">
                        <FiUsers />
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
            {students.length > 0 && (
                <div style={{ marginBottom: 'var(--spacing-4)', display: 'flex', gap: 'var(--spacing-3)' }}>
                    <button className="btn btn-secondary btn-sm" onClick={markAllPresent}>
                        <FiCheck /> Mark All Present
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={markAllAbsent}>
                        <FiX /> Mark All Absent
                    </button>
                </div>
            )}

            {/* Attendance List */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Student List</h2>
                </div>
                <div className="table-container">
                    {loading ? (
                        <div className="page-loading" style={{ padding: 'var(--spacing-8)' }}>
                            <div className="spinner"></div>
                            <p>Loading students...</p>
                        </div>
                    ) : students.length > 0 ? (
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
                                        <td>{student.user?.firstName} {student.user?.lastName}</td>
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
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-12)' }}>
                            <FiCalendar size={48} />
                            <h3>No Students Found</h3>
                            <p>{selectedClass && selectedSubject
                                ? 'No students enrolled in this class.'
                                : 'Please select a class and subject to load students.'}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherAttendance;

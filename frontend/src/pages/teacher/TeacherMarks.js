import React, { useState, useEffect } from 'react';
import { FiSave, FiEdit2, FiCheck, FiX, FiUsers } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../student/StudentPages.css';

const TeacherMarks = () => {
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedExam, setSelectedExam] = useState('Internal 1');
    const [marksData, setMarksData] = useState({});
    const [editMode, setEditMode] = useState(false);
    const [maxMarks, setMaxMarks] = useState(40);

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedClass && selectedSubject) {
            fetchStudentsAndMarks();
        } else {
            setStudents([]);
            setMarksData({});
        }
    }, [selectedClass, selectedSubject, selectedExam]);

    const fetchSubjects = async () => {
        try {
            const res = await api.get('/subjects');
            setSubjects(res.data.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        }
    };

    const fetchStudentsAndMarks = async () => {
        setLoading(true);
        try {
            // Parse selected class
            const [department, semester, section] = selectedClass.split('-');

            // Fetch students
            const studentsRes = await api.get('/students', {
                params: {
                    department: department.trim(),
                    semester: parseInt(semester),
                    section: section?.trim() || 'A'
                }
            });

            const studentList = studentsRes.data.data || [];
            setStudents(studentList);

            // Initialize marks for all students
            const initialMarks = {};
            studentList.forEach(s => {
                initialMarks[s._id] = { obtained: 0, max: maxMarks };
            });

            // Try to fetch existing marks
            try {
                const marksRes = await api.get('/marks', {
                    params: {
                        subjectId: selectedSubject,
                        examType: selectedExam,
                        department: department.trim(),
                        semester: parseInt(semester)
                    }
                });

                if (marksRes.data.data && marksRes.data.data.length > 0) {
                    marksRes.data.data.forEach(mark => {
                        const studentId = mark.student?._id || mark.student;
                        if (initialMarks[studentId]) {
                            initialMarks[studentId] = {
                                obtained: mark.marksObtained || 0,
                                max: mark.maxMarks || maxMarks,
                                markId: mark._id
                            };
                        }
                    });
                    toast.info('Existing marks loaded');
                }
            } catch (err) {
                console.log('No existing marks found');
            }

            setMarksData(initialMarks);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load students');
            setStudents([]);
        }
        setLoading(false);
    };

    const handleMarksChange = (studentId, value) => {
        const numValue = parseInt(value) || 0;
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                obtained: Math.min(Math.max(0, numValue), prev[studentId]?.max || maxMarks)
            }
        }));
    };

    const calculateGrade = (obtained, max) => {
        const percentage = (obtained / max) * 100;
        if (percentage >= 90) return { grade: 'A+', color: 'var(--success-color)' };
        if (percentage >= 80) return { grade: 'A', color: 'var(--success-color)' };
        if (percentage >= 70) return { grade: 'B+', color: 'var(--primary-color)' };
        if (percentage >= 60) return { grade: 'B', color: 'var(--primary-color)' };
        if (percentage >= 50) return { grade: 'C', color: 'var(--warning-color)' };
        if (percentage >= 40) return { grade: 'D', color: 'var(--warning-color)' };
        return { grade: 'F', color: 'var(--error-color)' };
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedSubject) {
            toast.error('Please select class and subject');
            return;
        }

        if (students.length === 0) {
            toast.error('No students to save marks');
            return;
        }

        setSubmitting(true);
        try {
            const marksToSave = students.map(student => ({
                studentId: student._id,
                subjectId: selectedSubject,
                examType: selectedExam,
                marksObtained: marksData[student._id]?.obtained || 0,
                maxMarks: marksData[student._id]?.max || maxMarks,
                semester: student.semester
            }));

            await api.post('/marks/bulk', { marks: marksToSave });

            toast.success('Marks saved successfully!');
            setEditMode(false);
        } catch (error) {
            console.error('Error saving marks:', error);
            toast.error(error.response?.data?.message || 'Failed to save marks');
        }
        setSubmitting(false);
    };

    // Generate class options from subjects
    const classOptions = [...new Set(subjects.map(s => `${s.department}-${s.semester}-A`))];

    // Update max marks based on exam type
    useEffect(() => {
        switch (selectedExam) {
            case 'Internal 1':
            case 'Internal 2':
                setMaxMarks(40);
                break;
            case 'Mid Term':
                setMaxMarks(50);
                break;
            case 'End Term':
                setMaxMarks(100);
                break;
            default:
                setMaxMarks(40);
        }
    }, [selectedExam]);

    return (
        <div className="student-page animate-fade-in">
            <div className="page-header">
                <div>
                    <h1>Enter Marks</h1>
                    <p>Enter and manage student marks for your subjects</p>
                </div>
                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    {editMode ? (
                        <>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={submitting}
                            >
                                <FiCheck /> {submitting ? 'Saving...' : 'Save Marks'}
                            </button>
                            <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                                <FiX /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={() => setEditMode(true)}
                            disabled={students.length === 0}
                        >
                            <FiEdit2 /> Edit Marks
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="section-card" style={{ marginBottom: 'var(--spacing-6)' }}>
                <div style={{ padding: 'var(--spacing-6)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-4)' }}>
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
                    <div className="form-group">
                        <label className="form-label">Exam Type</label>
                        <select
                            className="form-select"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                        >
                            <option value="Internal 1">Internal 1 (Max: 40)</option>
                            <option value="Internal 2">Internal 2 (Max: 40)</option>
                            <option value="Mid Term">Mid Term (Max: 50)</option>
                            <option value="End Term">End Term (Max: 100)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Marks Table */}
            <div className="section-card">
                <div className="section-header">
                    <h2>Student Marks - {selectedExam}</h2>
                    <span className="badge badge-info">Max Marks: {maxMarks}</span>
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
                                    <th>Marks Obtained</th>
                                    <th>Percentage</th>
                                    <th>Grade</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map((student) => {
                                    const marks = marksData[student._id] || { obtained: 0, max: maxMarks };
                                    const percentage = marks.max > 0 ? ((marks.obtained / marks.max) * 100).toFixed(1) : '0.0';
                                    const gradeInfo = calculateGrade(marks.obtained, marks.max);
                                    return (
                                        <tr key={student._id}>
                                            <td><strong>{student.rollNumber}</strong></td>
                                            <td>{student.user?.firstName} {student.user?.lastName}</td>
                                            <td>
                                                {editMode ? (
                                                    <input
                                                        type="number"
                                                        className="form-input"
                                                        style={{ width: 80 }}
                                                        value={marks.obtained}
                                                        min={0}
                                                        max={marks.max}
                                                        onChange={(e) => handleMarksChange(student._id, e.target.value)}
                                                    />
                                                ) : (
                                                    <span>{marks.obtained} / {marks.max}</span>
                                                )}
                                            </td>
                                            <td>{percentage}%</td>
                                            <td>
                                                <span className="badge" style={{ background: gradeInfo.color, color: 'white' }}>
                                                    {gradeInfo.grade}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state" style={{ padding: 'var(--spacing-12)' }}>
                            <FiUsers size={48} />
                            <h3>No Students Found</h3>
                            <p>{selectedClass && selectedSubject
                                ? 'No students enrolled in this class.'
                                : 'Please select a class and subject to load students.'}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Statistics */}
            {students.length > 0 && (
                <div className="summary-grid" style={{ marginTop: 'var(--spacing-6)' }}>
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
                            <h3>{students.filter(s => (marksData[s._id]?.obtained || 0) >= (maxMarks * 0.4)).length}</h3>
                            <p>Passed (≥40%)</p>
                        </div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-icon absent">
                            <FiX />
                        </div>
                        <div className="summary-content">
                            <h3>{students.filter(s => (marksData[s._id]?.obtained || 0) < (maxMarks * 0.4)).length}</h3>
                            <p>Failed (&lt;40%)</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeacherMarks;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FiCalendar, FiCheck, FiX, FiClock, FiPieChart, FiCamera } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { attendanceService } from '../../services/api';
import './StudentPages.css';

const StudentAttendance = () => {
    const { profile } = useAuth();
    const getCurrentMonthValue = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
    });
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue());
    const [sensorCheckModal, setSensorCheckModal] = useState(false);
    const [sensorStatus, setSensorStatus] = useState('idle'); // idle | searching | connected | not_found
    const [fingerprintModal, setFingerprintModal] = useState({ show: false, status: 'idle' });
    const [faceModal, setFaceModal] = useState({ show: false, status: 'idle', message: '' });
    const faceVideoRef = useRef(null);
    const faceStreamRef = useRef(null);
    const faceDetectIntervalRef = useRef(null);
    const faceDetectTimeoutRef = useRef(null);
    const faceStableCountRef = useRef(0);
    const faceBoundingBoxRef = useRef(null);
    const faceDetectorEngineRef = useRef(null);
    const faceModalOpenRef = useRef(false);
    const faceAttendanceTriggeredRef = useRef(false);
    const studentDisplayName = profile?.name
        || profile?.fullName
        || [profile?.firstName, profile?.lastName].filter(Boolean).join(' ')
        || 'Deshmukh Sangram';

    const getRecentMonths = () => {
        const result = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            result.push({ value, label });
        }
        return result;
    };

    const months = getRecentMonths();

    const fetchAttendance = useCallback(async ({ silent = false, monthOverride } = {}) => {
        if (!profile?._id) {
            return;
        }

        if (!silent) {
            setLoading(true);
        }

        const targetMonth = monthOverride || selectedMonth;

        try {
            const cacheBuster = Date.now();
            const [res, summaryRes] = await Promise.all([
                attendanceService.getStudent(profile._id, { month: targetMonth, t: cacheBuster }),
                attendanceService.getSummary(profile._id, { month: targetMonth, t: cacheBuster }),
            ]);
            setAttendance(res.data.data || []);
            setSummary(summaryRes.data.data?.overall || {
                total: 0,
                present: 0,
                absent: 0,
                late: 0,
                percentage: 0,
            });
        } catch (error) {
            console.error('Error fetching attendance:', error);
            if (!silent) {
                setAttendance([]);
                setSummary({
                    total: 0,
                    present: 0,
                    absent: 0,
                    late: 0,
                    percentage: 0,
                });
            }
        }

        if (!silent) {
            setLoading(false);
        }
    }, [profile, selectedMonth]);

    const refreshAttendanceAfterMark = useCallback(async () => {
        const currentMonth = getCurrentMonthValue();
        if (selectedMonth !== currentMonth) {
            setSelectedMonth(currentMonth);
        }
        await fetchAttendance({ silent: true, monthOverride: currentMonth });
    }, [fetchAttendance, selectedMonth]);

    useEffect(() => {
        if (profile?._id) {
            fetchAttendance();
        }
    }, [profile, selectedMonth, fetchAttendance]);

    const stopFaceDetection = useCallback(() => {
        if (faceDetectIntervalRef.current) {
            clearInterval(faceDetectIntervalRef.current);
            faceDetectIntervalRef.current = null;
        }
        if (faceDetectTimeoutRef.current) {
            clearTimeout(faceDetectTimeoutRef.current);
            faceDetectTimeoutRef.current = null;
        }
        faceStableCountRef.current = 0;
        faceBoundingBoxRef.current = null;
    }, []);

    const toPoint = (point) => {
        if (Array.isArray(point)) {
            return point;
        }
        if (point && typeof point.dataSync === 'function') {
            return Array.from(point.dataSync());
        }
        return [0, 0];
    };

    const getFaceDetectorEngine = useCallback(async () => {
        if (faceDetectorEngineRef.current) {
            return faceDetectorEngineRef.current;
        }

        if ('FaceDetector' in window && typeof window.FaceDetector === 'function') {
            const nativeDetector = new window.FaceDetector({ fastMode: false, maxDetectedFaces: 1 });
            const nativeEngine = {
                source: 'native-face-detector',
                detect: async (video) => nativeDetector.detect(video),
            };
            faceDetectorEngineRef.current = nativeEngine;
            return nativeEngine;
        }

        setFaceModal((prev) => {
            if (!prev.show) return prev;
            return {
                ...prev,
                status: 'starting',
                message: 'Loading AI face model...',
            };
        });

        const tfModule = await import('@tensorflow/tfjs');
        const blazeModule = await import('@tensorflow-models/blazeface');

        await tfModule.ready();
        try {
            await tfModule.setBackend('webgl');
        } catch (backendError) {
            await tfModule.setBackend('cpu');
        }

        const model = await blazeModule.load();
        const blazeEngine = {
            source: 'tfjs-blazeface',
            detect: async (video) => {
                const predictions = await model.estimateFaces(video, false);

                return (predictions || []).map((prediction) => {
                    const topLeft = toPoint(prediction.topLeft);
                    const bottomRight = toPoint(prediction.bottomRight);

                    return {
                        boundingBox: {
                            x: Math.max(0, topLeft[0] || 0),
                            y: Math.max(0, topLeft[1] || 0),
                            width: Math.max(0, (bottomRight[0] || 0) - (topLeft[0] || 0)),
                            height: Math.max(0, (bottomRight[1] || 0) - (topLeft[1] || 0)),
                        },
                    };
                });
            },
        };

        faceDetectorEngineRef.current = blazeEngine;
        return blazeEngine;
    }, []);

    const stopFaceStream = useCallback(() => {
        if (faceStreamRef.current) {
            faceStreamRef.current.getTracks().forEach((track) => track.stop());
            faceStreamRef.current = null;
        }
        if (faceVideoRef.current) {
            faceVideoRef.current.srcObject = null;
        }
    }, []);

    const closeFaceModal = useCallback(() => {
        stopFaceDetection();
        stopFaceStream();
        faceModalOpenRef.current = false;
        faceAttendanceTriggeredRef.current = false;
        setFaceModal({ show: false, status: 'idle', message: '' });
    }, [stopFaceDetection, stopFaceStream]);

    const captureFaceFrameBlob = useCallback(async () => {
        const video = faceVideoRef.current;
        if (!video) {
            throw new Error('Camera stream is not available');
        }

        const width = video.videoWidth || 320;
        const height = video.videoHeight || 240;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            throw new Error('Unable to capture face image');
        }

        ctx.drawImage(video, 0, 0, width, height);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Face image capture failed'));
                }
            }, 'image/jpeg', 0.92);
        });
    }, []);

    const verifyFaceStillPresent = useCallback(async () => {
        const video = faceVideoRef.current;
        if (!video || video.readyState < 2) {
            throw new Error('Face is not visible in camera. Keep your face in frame.');
        }

        const detectorEngine = faceDetectorEngineRef.current;
        if (!detectorEngine) {
            throw new Error('Face detector is not ready. Please try again.');
        }

        const faces = await detectorEngine.detect(video);

        if (!faces.length) {
            throw new Error('Face left the frame. Keep your face in camera and try again.');
        }

        const box = faces[0]?.boundingBox;
        faceBoundingBoxRef.current = box
            ? {
                x: Math.round(box.x),
                y: Math.round(box.y),
                width: Math.round(box.width),
                height: Math.round(box.height),
            }
            : null;
    }, []);

    const handleFaceDetected = useCallback(async () => {
        if (!faceModalOpenRef.current || faceAttendanceTriggeredRef.current) {
            return;
        }

        faceAttendanceTriggeredRef.current = true;
        stopFaceDetection();
        setFaceModal((prev) => ({
            ...prev,
            status: 'processing',
            message: 'Face detected. Keep still while verifying identity...',
        }));

        try {
            await new Promise((resolve) => setTimeout(resolve, 1200));
            await verifyFaceStillPresent();

            const faceBlob = await captureFaceFrameBlob();
            const form = new FormData();
            form.append('faceCapture', faceBlob, `face-${Date.now()}.jpg`);
            form.append('detector', 'browser-face-detector');
            if (faceBoundingBoxRef.current) {
                form.append('faceBox', JSON.stringify(faceBoundingBoxRef.current));
            }

            await attendanceService.markSelfFace(form);
            stopFaceStream();

            setFaceModal((prev) => ({
                ...prev,
                status: 'success',
                message: `✅ ${studentDisplayName} - Face Attendance Marked Successfully!`,
            }));

            await refreshAttendanceAfterMark();

            setTimeout(() => {
                closeFaceModal();
            }, 2600);
        } catch (error) {
            console.error('Error marking face attendance:', error);
            stopFaceStream();
            setFaceModal((prev) => ({
                ...prev,
                status: 'error',
                message: error.response?.data?.message || error.message || 'Face detected, but attendance marking failed. Try again.',
            }));
            faceAttendanceTriggeredRef.current = false;
        }
    }, [captureFaceFrameBlob, closeFaceModal, refreshAttendanceAfterMark, stopFaceDetection, stopFaceStream, studentDisplayName, verifyFaceStillPresent]);

    const initializeFaceAttendance = useCallback(async () => {
        try {
            if (!navigator.mediaDevices?.getUserMedia) {
                throw new Error('Camera is not supported in this browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 320 },
                    height: { ideal: 240 },
                    facingMode: 'user',
                },
                audio: false,
            });

            faceStreamRef.current = stream;

            if (faceVideoRef.current) {
                faceVideoRef.current.srcObject = stream;
                await faceVideoRef.current.play();
            }

            setFaceModal((prev) => ({
                ...prev,
                status: 'scanning',
                message: 'Camera active. Keep your face clearly inside the frame.',
            }));

            const detectorEngine = await getFaceDetectorEngine();
            setFaceModal((prev) => ({
                ...prev,
                status: 'scanning',
                message: detectorEngine.source === 'native-face-detector'
                    ? 'Face detector ready. Keep your face steady.'
                    : 'AI face detector ready. Keep your face steady.',
            }));

            faceDetectIntervalRef.current = setInterval(async () => {
                if (faceAttendanceTriggeredRef.current || !faceVideoRef.current || faceVideoRef.current.readyState < 2) {
                    return;
                }

                try {
                    const faces = await detectorEngine.detect(faceVideoRef.current);
                    if (faces.length === 0) {
                        faceStableCountRef.current = 0;
                        faceBoundingBoxRef.current = null;
                        setFaceModal((prev) => {
                            if (prev.status !== 'scanning' || prev.message === 'No face detected. Keep your face in the frame.') {
                                return prev;
                            }
                            return { ...prev, message: 'No face detected. Keep your face in the frame.' };
                        });
                        return;
                    }

                    faceStableCountRef.current += 1;
                    const box = faces[0]?.boundingBox;
                    faceBoundingBoxRef.current = box
                        ? {
                            x: Math.round(box.x),
                            y: Math.round(box.y),
                            width: Math.round(box.width),
                            height: Math.round(box.height),
                        }
                        : null;

                    if (faceStableCountRef.current < 3) {
                        const holdMessage = `Face detected. Hold still (${faceStableCountRef.current}/3)...`;
                        setFaceModal((prev) => {
                            if (prev.status !== 'scanning' || prev.message === holdMessage) {
                                return prev;
                            }
                            return { ...prev, message: holdMessage };
                        });
                        return;
                    }

                    void handleFaceDetected();
                } catch (detectError) {
                    faceStableCountRef.current = 0;
                    setFaceModal((prev) => {
                        if (prev.status !== 'scanning' || prev.message === 'Face detection error. Adjust lighting and keep face steady.') {
                            return prev;
                        }
                        return {
                            ...prev,
                            message: 'Face detection error. Adjust lighting and keep face steady.',
                        };
                    });
                }
            }, 500);
        } catch (error) {
            console.error('Error opening face attendance camera:', error);
            stopFaceStream();
            setFaceModal((prev) => ({
                ...prev,
                status: 'error',
                message: error.message || 'Unable to start face detection. Please allow camera and reload.',
            }));
        }
    }, [getFaceDetectorEngine, handleFaceDetected, stopFaceStream]);

    const handleFaceAttendanceClick = () => {
        faceModalOpenRef.current = true;
        faceAttendanceTriggeredRef.current = false;
        faceStableCountRef.current = 0;
        faceBoundingBoxRef.current = null;
        setFaceModal({ show: true, status: 'starting', message: 'Opening camera...' });
    };

    useEffect(() => {
        if (!faceModal.show) {
            return undefined;
        }

        initializeFaceAttendance();

        return () => {
            faceModalOpenRef.current = false;
            stopFaceDetection();
            stopFaceStream();
        };
    }, [faceModal.show, initializeFaceAttendance, stopFaceDetection, stopFaceStream]);

    useEffect(() => {
        return () => {
            faceModalOpenRef.current = false;
            stopFaceDetection();
            stopFaceStream();
        };
    }, [stopFaceDetection, stopFaceStream]);

    const handleFingerprintClick = () => {
        // Step 1: Show sensor connection check popup
        setSensorCheckModal(true);
        setSensorStatus('idle');
    };

    const startFingerprintScanFlow = () => {
        setSensorCheckModal(false);
        setFingerprintModal({ show: true, status: 'scanning' });

        // Simulate scan duration (45 seconds as requested)
        setTimeout(async () => {
            try {
                await attendanceService.markSelf();
                setFingerprintModal(prev => ({ ...prev, status: 'success' }));
                await new Promise(resolve => setTimeout(resolve, 300));
                await refreshAttendanceAfterMark(); // Real-time refresh for overall attendance and list

                setTimeout(() => {
                    setFingerprintModal({ show: false, status: 'idle' });
                }, 2000);
            } catch (error) {
                console.error('Error marking self attendance:', error);
                setFingerprintModal(prev => ({ ...prev, status: 'error' }));
                setTimeout(() => {
                    setFingerprintModal(prev => ({ ...prev, status: 'idle' }));
                }, 2500);
            }
        }, 45000);
    };

    const handleSensorConnected = async () => {
        setSensorStatus('searching');
        try {
            const res = await attendanceService.getSensorStatus();
            const connected = !!res.data?.data?.connected;
            if (connected) {
                setSensorStatus('connected');
                setTimeout(() => {
                    startFingerprintScanFlow();
                }, 1000);
            } else {
                setSensorStatus('not_found');
            }
        } catch (error) {
            console.error('Sensor detection error:', error);
            setSensorStatus('not_found');
        }
    };

    const handleSensorNotConnected = () => {
        // User clicked No - sensor not connected
        setSensorCheckModal(false);
        // Show alert to connect sensor
        alert('Please connect the fingerprint sensor and try again.');
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
                    <button 
                        className="btn btn-primary" 
                        onClick={handleFingerprintClick} 
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiCheck /> Fingerprint Attendance
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleFaceAttendanceClick}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <FiCamera /> Face Attendance
                    </button>
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

            {/* Sensor Connection Check Modal */}
            {sensorCheckModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '450px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2 style={{ width: '100%' }}>🔌 Sensor Connection</h2>
                            <button 
                                className="modal-close" 
                                onClick={() => setSensorCheckModal(false)}
                            >
                                <FiX />
                            </button>
                        </div>
                        
                        <div style={{ padding: '1.5rem 0' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👆</div>
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                                Connect fingerprint sensor and search device
                            </p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                                {sensorStatus === 'idle' && 'Click Yes to start searching sensor'}
                                {sensorStatus === 'searching' && 'Searching for fingerprint sensor...'}
                                {sensorStatus === 'connected' && 'Fingerprint sensor connected successfully'}
                                {sensorStatus === 'not_found' && 'Sensor not detected. Please connect device and try again'}
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', padding: '1rem 0' }}>
                            <button 
                                className="btn btn-success" 
                                onClick={handleSensorConnected}
                                disabled={sensorStatus === 'searching'}
                                style={{ minWidth: '120px', fontSize: '1.05rem' }}
                            >
                                {sensorStatus === 'searching' ? 'Searching...' : '✅ Yes'}
                            </button>
                            <button 
                                className="btn btn-error" 
                                onClick={handleSensorNotConnected}
                                style={{ minWidth: '120px', fontSize: '1.05rem' }}
                            >
                                ❌ No
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fingerprint Modal */}
            {fingerprintModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px', textAlign: 'center' }}>
                        <div className="modal-header">
                            <h2 style={{ width: '100%' }}>Biometric Attendance</h2>
                            <button 
                                className="modal-close" 
                                onClick={() => setFingerprintModal({ show: false, status: 'idle' })}
                            >
                                <FiX />
                            </button>
                        </div>
                        
                        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                            Place your finger on the sensor below to mark your attendance for today.
                        </p>

                        <div className="fingerprint-container">
                            <div 
                                className={`fingerprint-sensor ${fingerprintModal.status}`} 
                                onClick={undefined}
                            >
                                {fingerprintModal.status === 'success' ? (
                                    <FiCheck size={48} className="success-icon" />
                                ) : fingerprintModal.status === 'error' ? (
                                    <FiX size={48} className="error-icon" />
                                ) : (
                                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="fp-svg">
                                        <path d="M2 12C2 6.5 6.5 2 12 2a10 10 0 0 1 8 4" />
                                        <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 11.4-2.5" />
                                        <path d="M8 14v1.5" />
                                        <path d="M16 14v1.5" />
                                        <path d="M12 20.5V22" />
                                        <path d="M12 9a3 3 0 0 0-3 3v2" />
                                        <path d="M15 12a3 3 0 0 0-3-3" />
                                    </svg>
                                )}
                                {fingerprintModal.status === 'scanning' && <div className="scan-line"></div>}
                            </div>
                            
                            <div className="fingerprint-status-text">
                                {fingerprintModal.status === 'idle' && "Tap the sensor to scan"}
                                {fingerprintModal.status === 'scanning' && "Scanning biometric data..."}
                                {fingerprintModal.status === 'success' && <span style={{ color: 'var(--success)' }}>✅ Deshmukh Sangram - Attendance Marked!</span>}
                                {fingerprintModal.status === 'error' && <span style={{ color: 'var(--error)' }}>Verification Failed. Try Again.</span>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Face Attendance Modal */}
            {faceModal.show && (
                <div className="modal-overlay">
                    <div className="modal-content face-attendance-modal">
                        <div className="modal-header">
                            <h2 style={{ width: '100%' }}>Face Attendance</h2>
                            <button
                                className="modal-close"
                                onClick={closeFaceModal}
                            >
                                <FiX />
                            </button>
                        </div>

                        <p className="face-attendance-note">
                            Attendance is marked only after real face detection and live face capture.
                        </p>

                        <div className={`face-camera-frame ${faceModal.status}`}>
                            <video
                                ref={faceVideoRef}
                                className="face-camera-preview"
                                autoPlay
                                playsInline
                                muted
                            />
                            {(faceModal.status === 'starting' || faceModal.status === 'scanning') && (
                                <div className="face-scan-overlay">
                                    <span className="face-scan-line"></span>
                                </div>
                            )}
                        </div>

                        <div className="face-status-text">
                            {(faceModal.status === 'starting' || faceModal.status === 'scanning' || faceModal.status === 'processing') && (faceModal.message || 'Processing...')}
                            {faceModal.status === 'success' && <span style={{ color: 'var(--success)' }}>{faceModal.message}</span>}
                            {faceModal.status === 'error' && <span style={{ color: 'var(--error)' }}>{faceModal.message}</span>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAttendance;

import React, { useState, useRef, useCallback, useEffect } from 'react';

const CAMERA_API = process.env.REACT_APP_CAMERA_URL || 'http://localhost:5001';

// Fallback: browser-side measurement using canvas
function browserMeasure(dataUrl) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            // Simple heuristic based on image dimensions
            const ratio = img.height / img.width;
            const isFullBody = ratio > 1.5;
            resolve({
                chest: isFullBody ? 95 : 92,
                waist: isFullBody ? 82 : 78,
                length: isFullBody ? 76 : 72,
                armLength: isFullBody ? 62 : 58,
                shoulder: 45,
                bodyType: isFullBody ? 'full' : 'half',
                confidence: 30
            });
        };
        img.onerror = () => resolve(null);
        img.src = dataUrl;
    });
}

function MeasurementEstimator({ onMeasurementsDetected }) {
    const [status, setStatus] = useState('');
    const [preview, setPreview] = useState(null);
    const [annotated, setAnnotated] = useState(null);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState('upload');
    const [cameraActive, setCameraActive] = useState(false);
    const [measurements, setMeasurements] = useState(null);
    const [stream, setStream] = useState(null);
    const videoRef = useRef(null);

    // Attach stream to video element
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !stream) return;
        
        video.srcObject = stream;
        
        const playVideo = async () => {
            try {
                await video.play();
                console.log('Camera playing:', video.videoWidth, 'x', video.videoHeight);
            } catch (err) {
                console.error('Video play failed:', err);
            }
        };
        
        if (video.readyState >= 2) {
            playVideo();
        } else {
            video.addEventListener('loadeddata', playVideo, { once: true });
        }
        
        return () => {
            video.removeEventListener('loadeddata', playVideo);
        };
    }, [stream]);

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, [stream]);

    const analyzeWithPython = useCallback(async (imageData) => {
        setLoading(true);
        setStatus('🔍 Analyzing body landmarks with AI...');
        setAnnotated(null);
        setMeasurements(null);

        try {
            const res = await fetch(`${CAMERA_API}/measure`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });
            const data = await res.json();
            if (data.error) {
                setStatus(`❌ ${data.error}`);
            } else if (data.measurements) {
                setMeasurements(data.measurements);
                setAnnotated(data.annotatedImage);
                setStatus(`✅ Measurements detected! (${data.measurements.confidence}% confidence, ${data.measurements.bodyType} body)`);
                onMeasurementsDetected(data.measurements);
            }
        } catch (err) {
            console.error('Camera service error:', err);
            // Fallback to browser-side estimation
            setStatus('⚠️ Python service unavailable. Using browser estimation...');
            const fallback = await browserMeasure(imageData);
            if (fallback) {
                setMeasurements(fallback);
                setStatus(`✅ Estimated (browser fallback, ${fallback.confidence}% confidence)`);
                onMeasurementsDetected(fallback);
            } else {
                setStatus('❌ Analysis failed. Try a clearer photo.');
            }
        }
        setLoading(false);
    }, [onMeasurementsDetected]);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            setPreview(ev.target.result);
            await analyzeWithPython(ev.target.result);
        };
        reader.readAsDataURL(file);
    };

    const startCamera = async () => {
        setStatus('📷 Requesting camera access...');
        setPreview(null);
        setAnnotated(null);
        setMeasurements(null);
        try {
            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment', width: 640, height: 480 }
                });
            } catch {
                mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: true
                });
            }
            console.log('Got stream:', mediaStream.getTracks().map(t => t.label));
            setStream(mediaStream);
            setCameraActive(true);
            setStatus('');
        } catch (err) {
            console.error('Camera error:', err);
            setStatus(`❌ Camera error: ${err.message}. Check browser permissions.`);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(t => t.stop());
            setStream(null);
        }
        setCameraActive(false);
    };

    const capturePhoto = async () => {
        if (!videoRef.current) return;
        const v = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = v.videoWidth || 640;
        canvas.height = v.videoHeight || 480;
        canvas.getContext('2d').drawImage(v, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setPreview(dataUrl);
        stopCamera();
        await analyzeWithPython(dataUrl);
    };

    const cardStyle = {
        background: 'color-mix(in srgb, var(--accent) 5%, var(--bg-card))',
        border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)',
        borderRadius: 'var(--card-radius, 12px)',
        padding: 16, marginBottom: 16
    };

    const tabStyle = (active) => ({
        flex: 1, padding: '8px 0',
        background: active ? 'color-mix(in srgb, var(--accent) 15%, transparent)' : 'transparent',
        border: active ? '1px solid var(--accent)' : '1px solid color-mix(in srgb, var(--accent) 10%, transparent)',
        borderRadius: 8, color: active ? 'var(--accent)' : 'var(--text-muted, #6b6355)',
        fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
    });

    return (
        <div style={cardStyle}>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text, #f0ead6)', marginBottom: 6 }}>📸 AI Body Measurement</div>
            <p style={{ color: 'var(--text-secondary, #a09880)', fontSize: 11, marginBottom: 12 }}>
                Powered by OpenCV + MediaPipe · Stand straight, arms slightly away
            </p>

            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button style={tabStyle(mode === 'upload')} onClick={() => { setMode('upload'); stopCamera(); }}>📁 Upload Photo</button>
                <button style={tabStyle(mode === 'camera')} onClick={() => setMode('camera')}>📷 Live Camera</button>
            </div>

            {mode === 'upload' && (
                <input type="file" accept="image/*" className="form-control"
                    style={{ background: 'var(--bg-input, #1e1e1e)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: 12, padding: 8 }}
                    onChange={handleFileUpload} />
            )}

            {mode === 'camera' && (
                <div>
                    {!cameraActive ? (
                        <button onClick={startCamera} style={{
                            width: '100%', padding: 14,
                            background: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                            borderRadius: 10, color: 'var(--accent)', fontWeight: 600, fontSize: 13, cursor: 'pointer'
                        }}>🎥 Start Camera</button>
                    ) : (
                        <div>
                            <video
                                ref={videoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    borderRadius: 10,
                                    minHeight: 200,
                                    maxHeight: 280,
                                    border: '2px solid var(--accent)',
                                    objectFit: 'cover',
                                    background: '#000',
                                    display: 'block'
                                }}
                            />
                            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                <button onClick={capturePhoto} style={{
                                    flex: 1, padding: 12,
                                    background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
                                    border: 'none', borderRadius: 8, color: 'var(--bg, #0d0d0d)', fontWeight: 700, fontSize: 13, cursor: 'pointer'
                                }}>📸 Capture & Analyze</button>
                                <button onClick={stopCamera} style={{
                                    padding: '12px 16px', background: 'rgba(220,53,69,0.15)',
                                    border: '1px solid rgba(220,53,69,0.3)', borderRadius: 8, color: '#ff6b6b', fontSize: 13, cursor: 'pointer'
                                }}>✕</button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {loading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, color: 'var(--accent)', fontSize: 12 }}>
                    <div className="spinner-border spinner-border-sm" role="status" style={{ color: 'var(--accent)' }} />
                    {status}
                </div>
            )}

            {status && !loading && (
                <div style={{ marginTop: 10, fontSize: 12, color: status.startsWith('✅') ? '#4ade80' : '#ff6b6b' }}>{status}</div>
            )}

            {annotated && (
                <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>AI Detected Landmarks:</div>
                    <img src={annotated} alt="annotated" style={{
                        width: '100%', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--accent) 20%, transparent)'
                    }} />
                </div>
            )}

            {preview && !annotated && !cameraActive && (
                <img src={preview} alt="uploaded" style={{
                    maxHeight: 100, maxWidth: '100%', borderRadius: 8, marginTop: 10, objectFit: 'contain',
                    border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)'
                }} />
            )}

            {measurements && (
                <div style={{ marginTop: 12, padding: 12, background: 'var(--bg, #0d0d0d)', borderRadius: 10, border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)' }}>
                    <div style={{ fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Detected Measurements</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
                        {Object.entries(measurements).filter(([k]) => !['bodyType', 'confidence'].includes(k)).map(([key, val]) => (
                            <div key={key} style={{ textAlign: 'center', padding: 6, background: 'var(--bg-card, #151515)', borderRadius: 6 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{val}cm</div>
                                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default MeasurementEstimator;

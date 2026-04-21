import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../../../services/api';

function ResetPassword() {
    const { token } = useParams();
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!newPassword || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await apiFetch('/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token,
                    newPassword,
                    confirmPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || 'Error resetting password');
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError('Failed to reset password. Please try again.');
            setLoading(false);
            console.error('Reset password error:', err);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius, 20px)', padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                {!success ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔐</div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 6px' }}>Reset Password</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enter your new password</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>New Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        disabled={loading}
                                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--btn-radius, 10px)', padding: '13px 16px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        {showPassword ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Confirm Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        disabled={loading}
                                        style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--btn-radius, 10px)', padding: '13px 16px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                                    >
                                        {showConfirmPassword ? <i className="fa-solid fa-eye"></i> : <i className="fa-solid fa-eye-slash"></i>}
                                    </button>
                                </div>
                            </div>

                            {error && <p style={{ color: 'red', fontSize: 13, marginBottom: 15 }}>{error}</p>}

                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{
                                    width: '100%', 
                                    padding: 14,
                                    background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 70%, black))',
                                    border: 'none', 
                                    borderRadius: 'var(--btn-radius, 10px)', 
                                    color: 'var(--bg)', 
                                    fontSize: 15, 
                                    fontWeight: 700, 
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.6 : 1
                                }}
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Back to Login</Link>
                        </p>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text)', margin: '0 0 10px' }}>Password Reset Successful</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ResetPassword;

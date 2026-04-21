import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../../../services/api';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        setError('');

        try {
            const response = await apiFetch('/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.msg || 'Error sending reset link');
                setLoading(false);
                return;
            }

            setSent(true);
            setLoading(false);
        } catch (err) {
            setError('Failed to send reset link. Please try again.');
            setLoading(false);
            console.error('Forgot password error:', err);
        }
    };

    return (
        <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--card-radius, 20px)', padding: '40px 36px', boxShadow: '0 24px 64px rgba(0,0,0,0.4)' }}>
                {!sent ? (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: 28 }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🔑</div>
                            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', color: 'var(--text)', margin: '0 0 6px' }}>Forgot Password?</h2>
                            <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Enter your email and we'll send you a reset link</p>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, display: 'block', marginBottom: 8 }}>Email Address</label>
                                <input 
                                    type="email" 
                                    value={email} 
                                    onChange={e => setEmail(e.target.value)} 
                                    placeholder="you@example.com" 
                                    required
                                    disabled={loading}
                                    style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid color-mix(in srgb, var(--accent) 15%, transparent)', borderRadius: 'var(--btn-radius, 10px)', padding: '13px 16px', color: 'var(--text)', fontSize: 14, outline: 'none', boxSizing: 'border-box', opacity: loading ? 0.6 : 1 }} 
                                />
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
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                        </form>

                        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
                            Remember your password? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign in</Link>
                        </p>
                    </>
                ) : (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📧</div>
                        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', color: 'var(--text)', margin: '0 0 10px' }}>Check Your Email</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 24 }}>
                            We've sent a password reset link to <strong style={{ color: 'var(--accent)' }}>{email}</strong>. Click the link in the email to reset your password.
                        </p>
                        <Link to="/login" style={{
                            display: 'inline-block', padding: '12px 28px',
                            background: 'var(--accent)', borderRadius: 'var(--btn-radius, 10px)',
                            color: 'var(--bg)', fontWeight: 700, fontSize: 14, textDecoration: 'none'
                        }}>Back to Login</Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ForgotPassword;

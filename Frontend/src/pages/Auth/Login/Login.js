import React, { useState } from 'react';
import "./Login.css"
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../../firebase';
import { signInWithPopup } from 'firebase/auth';

const Login = () => {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		setError(''); setLoading(true);
		try {
		const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
			const res = await fetch(`${API}/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
				body: JSON.stringify({ username, password })
			});
			const data = await res.json();
			if (!res.ok) { setError(data.msg || 'Login failed'); return; }
			const token = data.token;
			localStorage.setItem('user_id', data.userID);
			localStorage.setItem('token', token);
			navigate("/");
			window.location.reload();
		} catch(err) { console.error(err); setError('Cannot reach server. Check your connection.'); }
		finally { setLoading(false); }
	};

	const handleGoogleLogin = async () => {
		if (!auth) return setError('Google Sign-In is not configured yet. Please use username/password login.');
		setError(''); setLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const idToken = await result.user.getIdToken();
			const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
			
			console.log('Firebase auth successful. Token:', idToken.substring(0, 20) + '...');
			console.log('Sending token to backend at:', `${API}/auth/firebase`);
			
			const res = await fetch(`${API}/auth/firebase`, {
				method: 'POST',
				headers: { 
					'Content-Type': 'application/json', 
					'ngrok-skip-browser-warning': 'true' 
				},
				body: JSON.stringify({ idToken })
			});
			
			console.log('Backend response status:', res.status);
			
			if (!res.ok) { 
				const d = await res.json(); 
				console.error('Backend error:', d);
				setError(d.msg || `Backend error: ${res.status} ${res.statusText}`); 
				return; 
			}
			
			const data = await res.json();
			console.log('Login successful:', data);
			
			const token = data.token;
			localStorage.setItem('user_id', data.userID);
			localStorage.setItem('token', token);
			navigate('/');
			window.location.reload();
		} catch (err) {
			console.error('Google login error:', err);
			if (err.code === 'auth/popup-closed-by-user') setError('Google popup was closed. Try again.');
			else if (err.code === 'auth/unauthorized-domain') setError('This domain is not authorized for Google Sign-In. Add it in Firebase Console → Authentication → Settings → Authorized domains.');
			else if (err.code === 'auth/operation-not-allowed') setError('Google Sign-In is not enabled. Enable it in Firebase Console → Authentication → Sign-in method → Google.');
			else if (err instanceof TypeError && err.message === 'Failed to fetch') setError(`Cannot reach server. Is backend running at ${process.env.REACT_APP_API_URL || 'http://localhost:5000'}?`);
			else setError(`Google sign-in failed: ${err.message || err.code || 'Unknown error'}`);
		}
		finally { setLoading(false); }
	};

	return (
		<div className="login-page">
			{/* Left Panel */}
			<div className="login-left">
				<div className="login-brand">
					<div className="login-brand-title">MZ Tailor</div>
					<div className="login-brand-sub">Bespoke Suits, Crafted for You</div>
				</div>
				<ul className="login-features">
					<li><span className="icon">✂️</span> Custom-tailored suits to your measurements</li>
					<li><span className="icon">🎨</span> 150+ premium fabrics to choose from</li>
					<li><span className="icon">📦</span> Real-time order tracking</li>
					<li><span className="icon">🎁</span> Gift a suit to someone special</li>
					<li><span className="icon">🔒</span> Secure payments via Stripe</li>
				</ul>
			</div>

			{/* Right Panel */}
			<div className="login-right">
				<div className="login-form-box">
					<h2>Welcome Back</h2>
					<p className="subtitle">Sign in to your MZ Tailor account</p>

					{error && <div className="error-msg">⚠️ {error}</div>}

					<form onSubmit={handleLogin}>
						<div className="form-group">
							<label>Username</label>
							<div className="input-wrapper">
								<i className="fa-regular fa-user input-icon"></i>
								<input type="text" placeholder="Enter your username" value={username}
									onChange={e => setUsername(e.target.value)} required />
							</div>
						</div>

						<div className="form-group">
							<label>Password</label>
							<div className="input-wrapper">
								<i className="fa-solid fa-lock input-icon"></i>
								<input type={showPassword ? "text" : "password"} placeholder="Enter your password"
									value={password} onChange={e => setPassword(e.target.value)} required />
								<button type="button" className="toggle-password-login" onClick={() => setShowPassword(!showPassword)}>
									<i className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
								</button>
							</div>
						</div>

						<Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>

						<button type="submit" className="btn-login-submit" disabled={loading}>
							{loading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Signing in...</span> : 'Sign In'}
						</button>
					</form>

					<div className="divider">or continue with</div>

					<button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
						<img src="/google.svg" className="google-icon" alt="Google" />
						Sign in with Google
					</button>

					<p className="login-footer-text">
						Don't have an account? <Link to="/register">Create one free</Link>
					</p>
				</div>
			</div>
		</div>
	);
};

export default Login;

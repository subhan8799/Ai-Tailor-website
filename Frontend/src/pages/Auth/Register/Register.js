import React, { useState } from 'react';
import "./Register.css"
import { Link, useNavigate } from 'react-router-dom';
import { auth, googleProvider } from '../../../firebase';
import { signInWithPopup } from 'firebase/auth';

function Register() {
  const [form, setForm] = useState({ username:'', name:'', email:'', password:'', confirmPassword:'', gender:'male', dob:'', address:'', phone:'' });
  const [showPassword, setShowPassword] = useState(false);
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    setError(''); setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'confirmPassword') fd.append(k, v); });
      if (image) fd.append('image', image);
      const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API}/auth/register`, { method: "POST", body: fd, headers: { "ngrok-skip-browser-warning": "true" } });
      const data = await res.json();
      console.log('Register response status:', res.status, 'data:', data);
      if (!res.ok) return setError(data.msg || 'Registration failed');
      const token = data.token;
      if (!token) return setError('Registration succeeded but login failed. Please login manually.');
      localStorage.setItem('user_id', data.userID);
      localStorage.setItem('token', token);
      navigate('/');
      window.location.reload();
    } catch(err) { console.error(err); setError('Cannot reach server. Check your connection.'); }
    finally { setLoading(false); }
  };

  const handleGoogleSignup = async () => {
    if (!auth) return alert('Google Sign-In is not configured yet. Please register with email/password.');
    setError(''); setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const API = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const res = await fetch(`${API}/auth/firebase`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ idToken })
      });
      if (!res.ok) { const d = await res.json(); return setError(d.msg || 'Google sign-up failed'); }
      const data = await res.json();
      const token = data.token;
      localStorage.setItem('user_id', data.userID);
      localStorage.setItem('token', token);
      navigate('/'); window.location.reload();
    } catch { setError('Google sign-up failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const passwordsMatch = form.password && form.confirmPassword;

  return (
    <div className="register-page">
      <div className="register-box">
        <div className="register-header">
          <h2>Create Account</h2>
          <p>Join MZ Tailor and get your perfect bespoke suit</p>
        </div>

        {error && <div className="error-msg">⚠️ {error}</div>}

        <form onSubmit={handleRegister}>
          <div className="register-grid">

            <div className="form-group">
              <label>Username <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-regular fa-user input-icon"></i>
                <input type="text" placeholder="username" value={form.username} onChange={set('username')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Full Name <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-solid fa-id-card input-icon"></i>
                <input type="text" placeholder="John Doe" value={form.name} onChange={set('name')} required />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Email <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-regular fa-envelope input-icon"></i>
                <input type="email" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Password <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={form.password} onChange={set('password')} required />
                <button type="button" className="toggle-password-reg" onClick={() => setShowPassword(!showPassword)}>
                  <i className={`fa-solid ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Confirm Password <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-solid fa-lock input-icon"></i>
                <input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={set('confirmPassword')} required />
              </div>
              {passwordsMatch && (
                <div className={`password-match ${form.password === form.confirmPassword ? 'password-success' : 'password-error'}`}>
                  {form.password === form.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <div className="input-wrapper">
                <i className="fa-solid fa-venus-mars input-icon"></i>
                <select value={form.gender} onChange={set('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="others">Others</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Date of Birth</label>
              <div className="input-wrapper">
                <i className="fa-regular fa-calendar input-icon"></i>
                <input type="date" value={form.dob} onChange={set('dob')} />
              </div>
            </div>

            <div className="form-group full-width">
              <label>Address <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-solid fa-location-dot input-icon"></i>
                <input type="text" placeholder="123 Main St, City" value={form.address} onChange={set('address')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Phone <span className="req">*</span></label>
              <div className="input-wrapper">
                <i className="fa-solid fa-phone input-icon"></i>
                <input type="tel" placeholder="+1 234 567 8900" value={form.phone} onChange={set('phone')} required />
              </div>
            </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <input
                type="file"
                accept="image/*"
                className="form-control"
                style={{background:'var(--bg-input)', border:'1px solid rgba(201,168,76,0.15)', color:'var(--text-secondary)', borderRadius:10, padding:10, fontSize:13}}
                onChange={e => setImage(e.target.files[0])}
              />
              {image && <div style={{fontSize:12, color:'var(--accent)', marginTop:6}}>✓ {image.name}</div>}
            </div>

          </div>

          <button type="submit" className="btn-register-submit" disabled={loading} style={{marginTop: 24}}>
            {loading ? <span><i className="fa-solid fa-spinner fa-spin"></i> Creating account...</span> : 'Create Account'}
          </button>
        </form>

        <div className="divider">or sign up with</div>
        <button className="btn-google" onClick={handleGoogleSignup} disabled={loading}>
          <img src="/google.svg" className="google-icon" alt="Google" />
          Continue with Google
        </button>

        <p className="register-footer">Already have an account? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}

export default Register;

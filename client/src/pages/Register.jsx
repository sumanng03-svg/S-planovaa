import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(er => ({ ...er, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (form.name.trim().length < 2)  errs.name     = 'Name must be at least 2 characters.';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email.';
    if (form.password.length < 8)     errs.password  = 'Password must be at least 8 characters.';
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setApiError(''); setLoading(true);
    try {
      await register(form.name.trim(), form.email, form.password);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page page-wrapper">
      <div className="auth-bg-glow" />
      <div className="auth-bg-glow-secondary" />

      {/* Decorative Background Shapes */}
      <div className="auth-shapes-container" aria-hidden="true">
        <div className="auth-shape shape-ring shape-ring-1" />
        <div className="auth-shape shape-ring shape-ring-2" />
        <div className="auth-shape shape-diamond shape-diamond-1" />
        <div className="auth-shape shape-diamond shape-diamond-2" />
        <div className="auth-shape shape-pill shape-pill-1" />
        <div className="auth-shape shape-pill shape-pill-2" />
        <div className="auth-shape shape-floating-badge badge-music">✨ Exclusive Passes</div>
        <div className="auth-shape shape-floating-badge badge-ticket">🚀 Instant Booking</div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <span className="brand-icon">◈</span> PLANOVA
          </Link>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-subtitle">Start discovering amazing events today</p>
        </div>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">Full Name</label>
            <input id="reg-name" name="name" type="text" className="form-input"
              placeholder="John Doe" value={form.name} onChange={handleChange} required />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" name="email" type="email" className="form-input"
              placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" name="password" type="password" className="form-input"
              placeholder="Min 8 characters" value={form.password} onChange={handleChange} required />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">Confirm Password</label>
            <input id="reg-confirm" name="confirm" type="password" className="form-input"
              placeholder="Repeat password" value={form.confirm} onChange={handleChange} required />
            {errors.confirm && <span className="form-error">{errors.confirm}</span>}
          </div>

          <button type="submit" id="register-submit" className="btn btn-primary btn-xl auth-submit" disabled={loading}>
            {loading ? '⏳ Creating account...' : 'Create Account →'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}

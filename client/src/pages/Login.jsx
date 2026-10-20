import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { user } = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo login helper
  const fillDemo = (type) => {
    setForm(type === 'admin'
      ? { email: 'admin@planova.com', password: 'Admin@1234' }
      : { email: 'user@planova.com',  password: 'Admin@1234' }
    );
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
        <div className="auth-shape shape-floating-badge badge-music">🎵 Live Events</div>
        <div className="auth-shape shape-floating-badge badge-ticket">🎟️ Verified Tickets</div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-brand">
            <span className="brand-icon">◈</span> PLANOVA
          </Link>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Demo Credentials */}
        <div className="demo-creds">
          <span className="demo-label">🎮 Quick demo:</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('user')}>User</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fillDemo('admin')}>Admin</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              name="email" type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              id="login-password"
              name="password" type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" id="login-submit" className="btn btn-primary btn-xl auth-submit" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In →'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one free</Link>
        </p>
      </div>
    </main>
  );
}

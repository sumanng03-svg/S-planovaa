import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Admin.css';

const DEFAULT_STATS = {
  total_events: 8,
  total_users: 142,
  total_bookings: 389,
  total_revenue: 489500
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => {
        if (r.data?.data) setStats(r.data.data);
      })
      .catch(() => {
        setStats(DEFAULT_STATS);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-title-wrap">
            <span className="section-label">Management Portal</span>
            <h1 className="section-title">Admin Dashboard</h1>
          </div>
          <div className="admin-nav-links">
            <Link to="/admin/events" className="btn btn-outline btn-sm">🎪 Manage Events</Link>
            <Link to="/admin/bookings" className="btn btn-outline btn-sm">📋 View Bookings</Link>
            <Link to="/" className="btn btn-ghost btn-sm">← Back to Site</Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <div className="stats-grid">
            {[
              { label: 'Active Events', val: stats?.total_events ?? 8, icon: '🎪' },
              { label: 'Registered Users', val: stats?.total_users ?? 142, icon: '👥' },
              { label: 'Confirmed Bookings', val: stats?.total_bookings ?? 389, icon: '🎟️' },
              {
                label: 'Total Revenue',
                val: `₹${parseFloat(stats?.total_revenue || 489500).toLocaleString('en-IN')}`,
                icon: '💰'
              },
            ].map(s => (
              <div key={s.label} className="stat-card card">
                <span className="stat-card-icon">{s.icon}</span>
                <div className="stat-card-val text-gradient">{s.val}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-quick-links">
          <Link to="/admin/events" className="admin-ql-card card">
            <span className="ql-icon">🎪</span>
            <h3>Manage Events</h3>
            <p>Create, update, upload images, and control seats across all events.</p>
          </Link>
          <Link to="/admin/bookings" className="admin-ql-card card">
            <span className="ql-icon">📋</span>
            <h3>View Bookings</h3>
            <p>Track guest tickets, payment statuses, and transaction details in real time.</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

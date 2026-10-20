import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Admin.css';

export default function AdminDashboard() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(r => setStats(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="section-label">Admin</span>
            <h1 className="section-title">Dashboard</h1>
          </div>
          <div className="admin-nav-links">
            <Link to="/admin/events"   className="btn btn-outline btn-sm">Manage Events</Link>
            <Link to="/admin/bookings" className="btn btn-outline btn-sm">View Bookings</Link>
            <Link to="/"              className="btn btn-ghost btn-sm">← Back to Site</Link>
          </div>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"/></div>
        ) : (
          <div className="stats-grid">
            {[
              { label:'Active Events',      val: stats?.total_events,   icon:'🎪', color:'#a855f7' },
              { label:'Registered Users',   val: stats?.total_users,    icon:'👥', color:'#06b6d4' },
              { label:'Confirmed Bookings', val: stats?.total_bookings, icon:'🎟️', color:'#10b981' },
              { label:'Total Revenue (₹)',  val: `₹${parseFloat(stats?.total_revenue||0).toLocaleString('en-IN')}`, icon:'💰', color:'#f59e0b' },
            ].map(s => (
              <div key={s.label} className="stat-card card">
                <span className="stat-card-icon" style={{color:s.color}}>{s.icon}</span>
                <div className="stat-card-val" style={{color:s.color}}>{s.val ?? '—'}</div>
                <div className="stat-card-label">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-quick-links">
          <Link to="/admin/events"   className="admin-ql-card card">
            <span className="ql-icon">🎪</span>
            <h3>Manage Events</h3>
            <p>Create, edit, and remove events</p>
          </Link>
          <Link to="/admin/bookings" className="admin-ql-card card">
            <span className="ql-icon">📋</span>
            <h3>View Bookings</h3>
            <p>Monitor all bookings and payments</p>
          </Link>
        </div>
      </div>
    </main>
  );
}

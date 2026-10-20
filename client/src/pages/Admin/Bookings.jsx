import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Admin.css';

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [total, setTotal]       = useState(0);
  const [filter, setFilter]     = useState('all');

  useEffect(() => { fetchBookings(); }, []);

  const fetchBookings = () => {
    setLoading(true);
    api.get('/admin/bookings?limit=50')
      .then(r => { setBookings(r.data.data||[]); setTotal(r.data.total||0); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const statusBadge = (s) => ({ confirmed:'badge-green', pending:'badge-yellow', failed:'badge-red', cancelled:'badge-red', success:'badge-green' })[s]||'badge-gray';

  const filtered = filter==='all' ? bookings : bookings.filter(b=>b.status===filter);

  return (
    <main className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="section-label">Admin</span>
            <h1 className="section-title">All Bookings</h1>
            <p style={{color:'var(--color-text-muted)',fontSize:'0.9rem',marginTop:'4px'}}>{total} total bookings</p>
          </div>
          <div className="admin-nav-links">
            <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        {/* Filter */}
        <div className="filter-tabs">
          {['all','pending','confirmed','failed','cancelled'].map(s => (
            <button key={s} className={`tab-btn ${filter===s?'active':''}`} onClick={()=>setFilter(s)}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
              {s==='all' && ` (${total})`}
            </button>
          ))}
        </div>

        {loading ? <div className="loading-container"><div className="spinner"/></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th><th>User</th><th>Event</th><th>Date</th>
                  <th>Qty</th><th>Amount</th><th>Status</th><th>Payment</th><th>Ticket</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td style={{fontFamily:'monospace',fontSize:'0.8rem',color:'var(--color-text-faint)'}}>#{b.id}</td>
                    <td>
                      <div>{b.user_name}</div>
                      <div style={{fontSize:'0.75rem',color:'var(--color-text-faint)'}}>{b.user_email}</div>
                    </td>
                    <td className="td-event-title">{b.event_title}</td>
                    <td style={{fontSize:'0.82rem'}}>{b.event_date?.split('T')[0]}</td>
                    <td>{b.quantity}</td>
                    <td>₹{parseFloat(b.total_amount||0).toLocaleString('en-IN')}</td>
                    <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                    <td><span className={`badge ${statusBadge(b.payment_status)}`}>{b.payment_status||'—'}</span></td>
                    <td>{b.ticket_ref ? <span style={{fontFamily:'monospace',fontSize:'0.72rem',color:'var(--color-success)'}}>✓ Issued</span> : '—'}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan="9" style={{textAlign:'center',padding:'2rem',color:'var(--color-text-faint)'}}>No bookings found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

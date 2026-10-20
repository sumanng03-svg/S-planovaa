import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import './MyTickets.css';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' });
}

function statusBadge(status) {
  const map = {
    confirmed: 'badge-green', pending: 'badge-yellow', failed: 'badge-red', cancelled: 'badge-red'
  };
  return map[status] || 'badge-gray';
}

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]  = useState(true);
  const [error, setError]      = useState('');
  const [activeTab, setActiveTab] = useState('tickets');

  useEffect(() => {
    Promise.all([
      api.get('/tickets').catch(() => ({ data: { data: [] } })),
      api.get('/bookings').catch(() => ({ data: { data: [] } })),
    ]).then(([ticketRes, bookingRes]) => {
      setTickets(ticketRes.data.data || []);
      setBookings(bookingRes.data.data || []);
    }).catch(() => setError('Failed to load your data.')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <main className="page-wrapper">
      <div className="loading-container" style={{minHeight:'70vh'}}>
        <div className="spinner"/><span>Loading your tickets...</span>
      </div>
    </main>
  );

  return (
    <main className="page-wrapper">
      <div className="container my-tickets-page">
        <div className="section-header">
          <span className="section-label">Your account</span>
          <h1 className="section-title">My Tickets & Bookings</h1>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Tabs */}
        <div className="tabs-bar">
          <button className={`tab-btn ${activeTab==='tickets'?'active':''}`} onClick={()=>setActiveTab('tickets')}>
            🎟️ Confirmed Tickets ({tickets.length})
          </button>
          <button className={`tab-btn ${activeTab==='bookings'?'active':''}`} onClick={()=>setActiveTab('bookings')}>
            📋 All Bookings ({bookings.length})
          </button>
        </div>

        {/* Tickets Tab */}
        {activeTab === 'tickets' && (
          tickets.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎟️</span>
              <h3>No tickets yet</h3>
              <p>Book an event and complete payment to receive your ticket here.</p>
              <Link to="/explore" className="btn btn-primary" style={{marginTop:'1.5rem'}}>Explore Events</Link>
            </div>
          ) : (
            <div className="tickets-list">
              {tickets.map(t => (
                <div key={t.ticket_ref} className="my-ticket-card card">
                  <div className="mt-event-img-wrap">
                    <img src={t.image_url} alt={t.event_title}
                      onError={e=>e.target.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'} />
                  </div>
                  <div className="mt-info">
                    <div className="mt-header">
                      <span className={`badge ${statusBadge(t.booking_status)}`}>{t.booking_status?.toUpperCase()}</span>
                      <span className="mt-category">{t.category}</span>
                    </div>
                    <h3 className="mt-event-name">{t.event_title}</h3>
                    <div className="mt-meta">
                      <span>📅 {formatDate(t.event_date)}</span>
                      <span>📍 {t.venue}</span>
                      <span>🎟️ {t.quantity} ticket{t.quantity>1?'s':''}</span>
                      <span>💰 ₹{parseFloat(t.total_amount||0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="mt-ref">Ref: {t.ticket_ref?.slice(0,16)}...</div>
                  </div>
                  <div className="mt-qr-wrap">
                    <QRCodeSVG
                      value={`${window.location.origin}/verify/${t.ticket_ref}`}
                      size={80} level="H" fgColor="#f1f5f9" bgColor="transparent"
                    />
                  </div>
                  <div className="mt-actions">
                    <Link to={`/ticket/${t.booking_id}`} className="btn btn-primary btn-sm">View Ticket</Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          bookings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">📋</span>
              <h3>No bookings yet</h3>
              <Link to="/explore" className="btn btn-primary" style={{marginTop:'1.5rem'}}>Browse Events</Link>
            </div>
          ) : (
            <div className="bookings-table-wrap">
              <table className="bookings-table">
                <thead>
                  <tr>
                    <th>Event</th><th>Date</th><th>Qty</th><th>Amount</th>
                    <th>Status</th><th>Payment</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td className="td-event">
                        <span>{b.event_title}</span>
                      </td>
                      <td>{formatDate(b.event_date)}</td>
                      <td>{b.quantity}</td>
                      <td>₹{parseFloat(b.total_amount||0).toLocaleString('en-IN')}</td>
                      <td><span className={`badge ${statusBadge(b.status)}`}>{b.status}</span></td>
                      <td><span className={`badge ${statusBadge(b.payment_status)}`}>{b.payment_status}</span></td>
                      <td>
                        {b.status === 'confirmed' && b.ticket_ref
                          ? <Link to={`/ticket/${b.id}`} className="btn btn-primary btn-sm">View</Link>
                          : b.status === 'pending'
                          ? <Link to={`/payment/${b.id}`} className="btn btn-outline btn-sm">Pay</Link>
                          : <span className="text-faint">—</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </main>
  );
}

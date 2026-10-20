import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import api from '../services/api';
import './TicketPage.css';

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
}
function formatTime(t) {
  if (!t) return '';
  const [h,m] = t.split(':');
  const hr = parseInt(h);
  return `${hr%12||12}:${m} ${hr>=12?'PM':'AM'}`;
}

export default function TicketPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const ticketRef = useRef(null);

  const [ticket, setTicket] = useState(location.state?.ticket || null);
  const [loading, setLoading] = useState(!location.state?.ticket);
  const [error, setError]     = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!ticket) {
      api.get(`/tickets/booking/${bookingId}`)
        .then(r => setTicket(r.data.data))
        .catch(() => setError('Ticket not found. This booking may not be confirmed yet.'))
        .finally(() => setLoading(false));
    }
  }, []);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#080c14',
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `PLANOVA-Ticket-${ticket.ticket_ref?.slice(0,8)}.png`;
      link.href = url;
      link.click();
    } catch {
      alert('Download failed. Try using Print instead.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => window.print();

  if (loading) return (
    <main className="page-wrapper">
      <div className="loading-container" style={{minHeight:'70vh'}}>
        <div className="spinner" /><span>Loading your ticket...</span>
      </div>
    </main>
  );

  if (error || !ticket) return (
    <main className="page-wrapper">
      <div className="container" style={{paddingTop:'5rem', textAlign:'center'}}>
        <div className="alert alert-error">{error || 'Ticket unavailable.'}</div>
        <Link to="/my-tickets" className="btn btn-outline" style={{marginTop:'1.5rem'}}>My Tickets</Link>
      </div>
    </main>
  );

  const qrValue = ticket.qr_data || `${window.location.origin}/verify/${ticket.ticket_ref}`;

  return (
    <main className="page-wrapper ticket-wrapper">
      <div className="container">
        {/* Success banner */}
        <div className="ticket-success-banner anim-fade-up">
          <span className="success-emoji">🎉</span>
          <div>
            <h1>Your ticket is confirmed!</h1>
            <p>Booking reference: <strong>{ticket.transaction_ref || `#${bookingId}`}</strong></p>
          </div>
        </div>

        {/* Actions */}
        <div className="ticket-actions no-print">
          <button className="btn btn-primary" onClick={handleDownload} disabled={downloading}>
            {downloading ? '⏳ Generating...' : '⬇️ Download Ticket'}
          </button>
          <button className="btn btn-outline" onClick={handlePrint}>🖨️ Print Ticket</button>
          <Link to="/my-tickets" className="btn btn-ghost">📋 All Tickets</Link>
          <Link to="/explore"    className="btn btn-ghost">🔍 More Events</Link>
        </div>

        {/* The Ticket Card */}
        <div className="ticket-card-outer anim-fade-up" ref={ticketRef}>
          <div className="ticket-card">
            {/* Left: Ticket Info */}
            <div className="ticket-left">
              {/* Header */}
              <div className="ticket-brand-row">
                <span className="ticket-brand-icon">◈</span>
                <span className="ticket-brand-name">PLANOVA</span>
                <span className="ticket-type-badge">E-TICKET</span>
              </div>

              {/* Event Image */}
              {ticket.image_url && (
                <div className="ticket-event-img-wrap">
                  <img src={ticket.image_url} alt={ticket.event_title} className="ticket-event-img"
                    onError={e => e.target.style.display='none'} />
                  <div className="ticket-img-overlay" />
                </div>
              )}

              {/* Event Info */}
              <div className="ticket-event-name">{ticket.event_title}</div>

              <div className="ticket-meta-grid">
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">📅 Date</span>
                  <span className="ticket-meta-val">{formatDate(ticket.event_date)}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">⏰ Time</span>
                  <span className="ticket-meta-val">{formatTime(ticket.event_time)}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">📍 Venue</span>
                  <span className="ticket-meta-val">{ticket.venue}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">🎟️ Tickets</span>
                  <span className="ticket-meta-val">{ticket.quantity} seat{ticket.quantity>1?'s':''}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">👤 Attendee</span>
                  <span className="ticket-meta-val">{ticket.attendee_name}</span>
                </div>
                <div className="ticket-meta-block">
                  <span className="ticket-meta-label">💰 Amount Paid</span>
                  <span className="ticket-meta-val">₹{parseFloat(ticket.total_amount||0).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="ticket-status-row">
                <span className="ticket-status confirmed">✓ CONFIRMED</span>
                <span className="ticket-issued">Issued: {new Date(ticket.issued_at||Date.now()).toLocaleDateString('en-IN')}</span>
              </div>
            </div>

            {/* Perforation */}
            <div className="ticket-perforation">
              <div className="perf-circle top" />
              <div className="perf-line" />
              <div className="perf-circle bottom" />
            </div>

            {/* Right: QR Stub */}
            <div className="ticket-right">
              <div className="ticket-qr-wrap">
                <QRCodeSVG
                  value={qrValue}
                  size={160}
                  level="H"
                  fgColor="#f1f5f9"
                  bgColor="transparent"
                  className="ticket-qr"
                />
              </div>
              <div className="ticket-ref-label">Booking Ref</div>
              <div className="ticket-ref">#{String(bookingId).padStart(6,'0')}</div>
              <div className="ticket-ref-label" style={{marginTop:'8px'}}>Ticket ID</div>
              <div className="ticket-uid">{ticket.ticket_ref?.slice(0,13)}...</div>
              <div className="ticket-scan-hint">Scan QR to verify</div>
              <div className="ticket-planova-tag">◈ PLANOVA · Plan less. Experience more.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

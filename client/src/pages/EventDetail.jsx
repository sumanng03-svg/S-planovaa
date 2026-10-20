import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

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

const CATEGORY_ICONS = {
  'Music':'🎵','Technology':'💻','Workshops':'🛠️','College Events':'🎓','Art':'🎨','Sports':'⚽'
};

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [event, setEvent]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [qty, setQty]         = useState(1);
  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState('');

  useEffect(() => {
    api.get(`/events/${id}`)
      .then(r => setEvent(r.data.data))
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBook = async () => {
    if (!user) { navigate('/login'); return; }
    setBooking(true); setBookError('');
    try {
      const { data } = await api.post('/bookings', { event_id: Number(id), quantity: qty });
      navigate(`/payment/${data.data.booking_id}`, { state: { booking: data.data } });
    } catch (err) {
      setBookError(err.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return (
    <main className="page-wrapper">
      <div className="loading-container" style={{minHeight:'60vh'}}>
        <div className="spinner" />
        <span>Loading event...</span>
      </div>
    </main>
  );

  if (error) return (
    <main className="page-wrapper">
      <div className="container" style={{paddingTop:'4rem', textAlign:'center'}}>
        <p className="alert alert-error" style={{display:'inline-block'}}>{error}</p>
        <div style={{marginTop:'1.5rem'}}><Link to="/explore" className="btn btn-outline">← Back to Events</Link></div>
      </div>
    </main>
  );

  const isFree   = parseFloat(event.price) === 0;
  const isSoldOut= event.seats_available === 0;
  const maxQty   = Math.min(10, event.seats_available);
  const total    = parseFloat(event.price) * qty;

  return (
    <main className="page-wrapper">
      {/* Hero Image */}
      <div className="event-hero-img-wrap">
        <img src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'}
          alt={event.title} className="event-hero-img"
          onError={e => e.target.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200'} />
        <div className="event-hero-overlay" />
      </div>

      <div className="container event-detail-layout">
        {/* Left: Info */}
        <div className="event-detail-info">
          <div className="event-detail-cats">
            <span className={`badge badge-purple`}>
              {CATEGORY_ICONS[event.category]} {event.category}
            </span>
          </div>
          <h1 className="event-detail-title">{event.title}</h1>

          <div className="event-detail-meta-grid">
            <div className="detail-meta-item">
              <span className="detail-meta-icon">📅</span>
              <div>
                <div className="detail-meta-label">Date & Time</div>
                <div className="detail-meta-val">{formatDate(event.event_date)}</div>
                <div className="detail-meta-sub">{formatTime(event.event_time)}</div>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-icon">📍</span>
              <div>
                <div className="detail-meta-label">Venue</div>
                <div className="detail-meta-val">{event.venue}</div>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-icon">🎟️</span>
              <div>
                <div className="detail-meta-label">Availability</div>
                <div className="detail-meta-val" style={{color: isSoldOut ? 'var(--color-error)' : 'var(--color-success)'}}>
                  {isSoldOut ? 'Sold Out' : `${event.seats_available} seats left`}
                </div>
                <div className="detail-meta-sub">{event.capacity} total capacity</div>
              </div>
            </div>
            <div className="detail-meta-item">
              <span className="detail-meta-icon">💰</span>
              <div>
                <div className="detail-meta-label">Price per ticket</div>
                <div className="detail-meta-val">
                  {isFree ? 'FREE' : `₹${parseFloat(event.price).toLocaleString('en-IN')}`}
                </div>
              </div>
            </div>
          </div>

          <div className="event-description">
            <h2>About this event</h2>
            <p>{event.description}</p>
          </div>
        </div>

        {/* Right: Booking Card */}
        <aside className="booking-widget">
          <div className="booking-widget-price">
            {isFree ? (
              <span className="bw-price-free">FREE Entry</span>
            ) : (
              <>
                <span className="bw-price-val">₹{parseFloat(event.price).toLocaleString('en-IN')}</span>
                <span className="bw-price-label">per ticket</span>
              </>
            )}
          </div>

          {!isSoldOut ? (
            <>
              <div className="bw-qty-row">
                <label className="form-label">Tickets</label>
                <div className="qty-control">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q-1))} disabled={qty<=1}>−</button>
                  <span className="qty-val">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(maxQty, q+1))} disabled={qty>=maxQty}>+</button>
                </div>
              </div>

              {!isFree && (
                <div className="bw-total">
                  <span>Total</span>
                  <span className="bw-total-val">₹{total.toLocaleString('en-IN')}</span>
                </div>
              )}

              {bookError && <div className="alert alert-error" style={{fontSize:'0.85rem'}}>{bookError}</div>}

              <button
                id="book-now-btn"
                className="btn btn-primary btn-xl"
                style={{width:'100%', marginTop:'var(--space-md)'}}
                onClick={handleBook}
                disabled={booking}
              >
                {booking ? '⏳ Processing...' : user ? `Book Now ${!isFree ? `· ₹${total.toLocaleString('en-IN')}` : '(Free)'}` : 'Log in to Book'}
              </button>

              {!user && (
                <p style={{textAlign:'center', fontSize:'0.82rem', color:'var(--color-text-muted)', marginTop:'0.5rem'}}>
                  <Link to="/register" style={{color:'var(--color-accent)'}}>Create a free account</Link> to book tickets.
                </p>
              )}
            </>
          ) : (
            <div className="alert alert-error" style={{textAlign:'center'}}>
              <strong>This event is sold out.</strong><br/>
              <Link to="/explore" style={{color:'var(--color-accent)', marginTop:'8px', display:'inline-block'}}>Explore other events →</Link>
            </div>
          )}

          <div className="bw-footer">
            <span>🔒 Secure checkout</span>
            <span>·</span>
            <span>Instant confirmation</span>
          </div>
        </aside>
      </div>
    </main>
  );
}

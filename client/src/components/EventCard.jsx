import { Link } from 'react-router-dom';
import './EventCard.css';

const CATEGORY_ICONS = {
  'Music': '🎵', 'Technology': '💻', 'Workshops': '🛠️',
  'College Events': '🎓', 'Art': '🎨', 'Sports': '⚽'
};

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${m} ${ampm}`;
}

export default function EventCard({ event }) {
  const catClass = `cat-${event.category?.replace(' ', '\\ ')}`;
  const icon = CATEGORY_ICONS[event.category] || '🎪';
  const isFree = parseFloat(event.price) === 0;
  const isSoldOut = event.seats_available === 0;

  return (
    <article className="event-card card">
      {/* Image */}
      <div className="event-card-img-wrap">
        <img
          src={event.image_url || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=75'}
          alt={event.title}
          className="event-card-img"
          loading="lazy"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&q=75'; }}
        />
        <div className="event-card-overlay" />
        <span className={`badge event-card-cat ${catClass}`}>{icon} {event.category}</span>
        {isSoldOut ? (
          <span className="sold-out-badge">Sold Out</span>
        ) : (
          <span className="ticket-badge-pill">PASS #{String(event.id || 1).padStart(4, '0')}</span>
        )}
      </div>

      {/* Content */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-meta">
          <span className="meta-item">
            <span className="meta-icon">📅</span>
            {formatDate(event.event_date)}
            {event.event_time && ` · ${formatTime(event.event_time)}`}
          </span>
          <span className="meta-item">
            <span className="meta-icon">📍</span>
            {event.venue}
          </span>
          {event.seats_available !== undefined && (
            <span className="meta-item">
              <span className="meta-icon">🎟️</span>
              {isSoldOut ? 'No seats left' : `${event.seats_available} seats remaining`}
            </span>
          )}
        </div>

        {/* Perforated Ticket Divider */}
        <div className="ticket-stub-perforation" aria-hidden="true">
          <span className="notch notch-left" />
          <div className="dashed-line" />
          <span className="notch notch-right" />
        </div>

        <div className="event-card-footer">
          <div className="event-card-price">
            {isFree ? (
              <span className="price-free">COMPLIMENTARY</span>
            ) : (
              <>
                <span className="price-label">ENTRY PASS</span>
                <span className="price-value">₹{parseFloat(event.price).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>
          <Link
            to={`/events/${event.id}`}
            className={`btn btn-primary btn-sm ${isSoldOut ? 'btn-disabled' : ''}`}
            aria-label={`View details for ${event.title}`}
          >
            {isSoldOut ? 'Sold Out' : 'Get Pass →'}
          </Link>
        </div>
      </div>
    </article>
  );
}

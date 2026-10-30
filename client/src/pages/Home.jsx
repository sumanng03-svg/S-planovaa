import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { MOCK_EVENTS } from '../services/mockData';
import './Home.css';

const CATEGORIES = ['Music', 'Technology', 'Workshops', 'College Events', 'Art', 'Sports'];

const CAT_ICONS = {
  'Music': '🎵', 'Technology': '💻', 'Workshops': '🛠️',
  'College Events': '🎓', 'Art': '🎨', 'Sports': '⚽'
};

export default function Home() {
  const [events, setEvents] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events?limit=8');
      const loaded = (data.data && data.data.length > 0) ? data.data : MOCK_EVENTS;
      setEvents(loaded);
      setFeatured(loaded.slice(0, 3));
    } catch {
      setEvents(MOCK_EVENTS);
      setFeatured(MOCK_EVENTS.slice(0, 3));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    navigate(`/explore?${params.toString()}`);
  };

  const handleCategoryClick = (cat) => {
    navigate(`/explore?category=${encodeURIComponent(cat)}`);
  };

  const filteredEvents = activeCategory
    ? events.filter(e => e.category === activeCategory)
    : events;

  return (
    <main className="page-wrapper">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg-glow" />
        <div className="container hero-content">
          <div className="hero-badge anim-fade-up">✨ Discover · Book · Experience</div>
          <h1 className="hero-title anim-fade-up">
            Find Events That<br />
            <span className="text-gradient">Move Your World</span>
          </h1>
          <p className="hero-subtitle anim-fade-up">
            From sold-out concerts to college hackathons — PLANOVA is your gateway
            to unforgettable experiences. Plan less. Experience more.
          </p>

          {/* Search */}
          <form className="hero-search anim-fade-up" onSubmit={handleSearch}>
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                id="hero-search-input"
                type="text"
                className="search-input"
                placeholder="Search events, venues, artists..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                Search
              </button>
            </div>
          </form>

          <div className="hero-stats anim-fade">
            <div className="stat"><span className="stat-num">500+</span><span className="stat-label">Events</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">50K+</span><span className="stat-label">Attendees</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">6</span><span className="stat-label">Categories</span></div>
          </div>
        </div>

        {/* Hero Event Mosaic */}
        {!loading && featured.length > 0 && (
          <div className="hero-mosaic container">
            {featured.map((ev, i) => (
              <Link key={ev.id} to={`/events/${ev.id}`} className={`mosaic-card mosaic-${i}`}>
                <img src={ev.image_url} alt={ev.title} loading="lazy"
                  onError={e => e.target.src='https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400'} />
                <div className="mosaic-overlay">
                  <span className="mosaic-title">{ev.title}</span>
                  <span className="mosaic-price">₹{parseFloat(ev.price).toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* ── Categories ── */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Browse by type</span>
            <h2 className="section-title">Explore Categories</h2>
          </div>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <span className="cat-pill-icon">{CAT_ICONS[cat]}</span>
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Upcoming Events ── */}
      <section className="events-section">
        <div className="container">
          <div className="section-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <span className="section-label">Don't miss out</span>
              <h2 className="section-title">Upcoming Events</h2>
            </div>
            <Link to="/explore" className="btn btn-outline">View all →</Link>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner" />
              <span>Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🎪</span>
              <h3>No events yet</h3>
              <p>Check back soon — exciting events are being added!</p>
            </div>
          ) : (
            <div className="events-grid">
              {filteredEvents.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-glow" />
            <h2 className="cta-title">Ready to explore more?</h2>
            <p className="cta-text">Discover hundreds of events across India — from electrifying concerts to career-boosting workshops.</p>
            <div className="cta-actions">
              <Link to="/explore" className="btn btn-primary btn-xl">Explore All Events</Link>
              <Link to="/register" className="btn btn-outline btn-xl">Create Account</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

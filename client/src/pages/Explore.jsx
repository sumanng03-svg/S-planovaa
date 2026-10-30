import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import EventCard from '../components/EventCard';
import { MOCK_EVENTS } from '../services/mockData';
import './Explore.css';

const CATEGORIES = ['', 'Music', 'Technology', 'Workshops', 'College Events', 'Art', 'Sports'];

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [total, setTotal]     = useState(0);

  const search   = searchParams.get('search')   || '';
  const category = searchParams.get('category') || '';
  const date     = searchParams.get('date')     || '';

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => { fetchEvents(); }, [search, category, date]);

  const fetchEvents = async () => {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (search)   params.set('search', search);
      if (category) params.set('category', category);
      if (date)     params.set('date', date);
      params.set('limit', '24');

      const { data } = await api.get(`/events?${params}`);
      const loaded = (data.data && data.data.length > 0) ? data.data : MOCK_EVENTS;
      setEvents(loaded);
      setTotal(data.pagination?.total || loaded.length);
    } catch {
      let filtered = [...MOCK_EVENTS];
      if (search) filtered = filtered.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase()));
      if (category) filtered = filtered.filter(e => e.category === category);
      setEvents(filtered);
      setTotal(filtered.length);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value);
    else p.delete(key);
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilter('search', searchInput.trim());
  };

  const clearAll = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const hasFilters = search || category || date;

  return (
    <main className="page-wrapper">
      <div className="explore-hero">
        <div className="container">
          <span className="section-label">Explore</span>
          <h1 className="explore-title">Find Your Next Experience</h1>
          <p className="explore-subtitle">Browse {total > 0 ? `${total} events` : 'events'} across India</p>
        </div>
      </div>

      <div className="container explore-body">
        {/* Filters Bar */}
        <div className="filters-bar">
          {/* Search */}
          <form className="filter-search" onSubmit={handleSearch}>
            <span className="search-icon">🔍</span>
            <input
              id="explore-search"
              type="text"
              className="filter-input"
              placeholder="Search events..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" className="clear-btn" onClick={() => { setSearchInput(''); applyFilter('search',''); }}>✕</button>
            )}
          </form>

          {/* Category */}
          <select
            id="category-filter"
            className="filter-select"
            value={category}
            onChange={e => applyFilter('category', e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Date */}
          <input
            id="date-filter"
            type="date"
            className="filter-input filter-date"
            value={date}
            onChange={e => applyFilter('date', e.target.value)}
          />

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearAll}>Clear all</button>
          )}
        </div>

        {/* Active Filters */}
        {hasFilters && (
          <div className="active-filters">
            {search   && <span className="filter-chip">🔍 {search} <button onClick={() => { setSearchInput(''); applyFilter('search',''); }}>✕</button></span>}
            {category && <span className="filter-chip">🏷️ {category} <button onClick={() => applyFilter('category','')}>✕</button></span>}
            {date     && <span className="filter-chip">📅 {date} <button onClick={() => applyFilter('date','')}>✕</button></span>}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <span>Searching events...</span>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : events.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🔎</span>
            <h3>No events found</h3>
            <p>Try adjusting your filters or clearing the search.</p>
            {hasFilters && <button className="btn btn-outline" style={{marginTop:'1rem'}} onClick={clearAll}>Clear Filters</button>}
          </div>
        ) : (
          <>
            <p className="results-count">{total} event{total !== 1 ? 's' : ''} found</p>
            <div className="events-grid">
              {events.map(event => <EventCard key={event.id} event={event} />)}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

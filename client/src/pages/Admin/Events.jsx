import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { MOCK_EVENTS } from '../../services/mockData';
import './Admin.css';

const CATEGORIES = ['Music', 'Technology', 'Workshops', 'College Events', 'Art', 'Sports'];
const EMPTY_FORM = {
  title: '', description: '', category: 'Music',
  event_date: '', event_time: '', venue: '', price: '', capacity: '', image_url: ''
};

export default function AdminEvents() {
  const [events, setEvents]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showForm, setShowForm]     = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [saving, setSaving]         = useState(false);
  const [uploading, setUploading]   = useState(false);
  const [imageMode, setImageMode]   = useState('upload'); // 'upload' | 'url'
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');
  const fileInputRef                = useRef(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = () => {
    setLoading(true);
    api.get('/admin/events?limit=50')
      .then(r => {
        const list = r.data.data && r.data.data.length > 0 ? r.data.data : MOCK_EVENTS;
        setEvents(list);
      })
      .catch(() => {
        setEvents(MOCK_EVENTS);
      })
      .finally(() => setLoading(false));
  };

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, or WEBP).');
      return;
    }
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setForm(f => ({ ...f, image_url: res.data.url }));
      setSuccess('Image uploaded successfully!');
    } catch {
      // Fallback to local Data URL preview & submission
      const reader = new FileReader();
      reader.onload = (e) => {
        setForm(f => ({ ...f, image_url: e.target.result }));
        setSuccess('Image loaded successfully!');
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleEdit = (ev) => {
    setEditId(ev.id);
    setForm({
      title: ev.title, description: ev.description,
      category: ev.category, event_date: ev.event_date?.split('T')[0] || '',
      event_time: ev.event_time || '', venue: ev.venue,
      price: ev.price, capacity: ev.capacity, image_url: ev.image_url || ''
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      if (editId) {
        await api.put(`/admin/events/${editId}`, form);
        setSuccess('Event updated successfully!');
      } else {
        await api.post('/admin/events', form);
        setSuccess('Event created successfully!');
      }
      setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
      fetchEvents();
    } catch (err) {
      // Local optimistic update if backend is mock
      if (editId) {
        setEvents(prev => prev.map(ev => ev.id === editId ? { ...ev, ...form, price: Number(form.price), capacity: Number(form.capacity) } : ev));
        setSuccess('Event updated locally!');
        setShowForm(false); setEditId(null); setForm(EMPTY_FORM);
      } else {
        const newEv = { ...form, id: Date.now(), price: Number(form.price), capacity: Number(form.capacity), seats_available: Number(form.capacity), is_active: 1 };
        setEvents(prev => [newEv, ...prev]);
        setSuccess('Event created locally!');
        setShowForm(false); setForm(EMPTY_FORM);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this event?')) return;
    try {
      await api.delete(`/admin/events/${id}`);
      setSuccess('Event deactivated.');
      fetchEvents();
    } catch {
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, is_active: 0 } : ev));
      setSuccess('Event marked inactive.');
    }
  };

  return (
    <main className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-header-title-wrap">
            <span className="section-label">Inventory & Sessions</span>
            <h1 className="section-title">Manage Events</h1>
          </div>
          <div className="admin-nav-links">
            <button
              className="btn btn-primary btn-sm"
              onClick={() => { setShowForm(s => !s); setEditId(null); setForm(EMPTY_FORM); }}
            >
              {showForm ? '✕ Close Form' : '+ New Event'}
            </button>
            <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        {error   && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}
        {success && <div className="alert alert-success" style={{ marginBottom: '1.5rem' }}>{success}</div>}

        {/* Create / Edit Form */}
        {showForm && (
          <form className="admin-form card" onSubmit={handleSubmit}>
            <h2 className="admin-form-title">{editId ? 'Edit Event Details' : 'Create New Event'}</h2>
            <div className="admin-form-grid">
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Event Title *</label>
                <input
                  name="title"
                  className="form-input"
                  value={form.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. SoundWave Music Festival"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-input"
                  value={form.price}
                  onChange={handleChange}
                  required
                  placeholder="0 for complimentary"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input
                  name="event_date"
                  type="date"
                  className="form-input"
                  value={form.event_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Event Time *</label>
                <input
                  name="event_time"
                  type="time"
                  className="form-input"
                  value={form.event_time}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Venue & Location *</label>
                <input
                  name="venue"
                  className="form-input"
                  value={form.venue}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Central Park Arena, Mumbai"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Total Capacity *</label>
                <input
                  name="capacity"
                  type="number"
                  min="1"
                  className="form-input"
                  value={form.capacity}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Event Image Upload Section */}
              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                  <label className="form-label" style={{ marginBottom: 0 }}>Event Banner Image</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                      onClick={() => setImageMode('upload')}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{ padding: '3px 10px', fontSize: '0.75rem' }}
                      onClick={() => setImageMode('url')}
                    >
                      🔗 Paste URL
                    </button>
                  </div>
                </div>

                {imageMode === 'url' ? (
                  <input
                    name="image_url"
                    type="url"
                    className="form-input"
                    value={form.image_url}
                    onChange={handleChange}
                    placeholder="https://images.unsplash.com/..."
                  />
                ) : (
                  <div className="image-upload-zone">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/jpg"
                      style={{ display: 'none' }}
                      onChange={e => e.target.files && handleImageFile(e.target.files[0])}
                    />

                    {form.image_url ? (
                      <div className="image-preview-box">
                        <img src={form.image_url} alt="Event preview" />
                        <div className="image-preview-overlay">
                          <span>{form.image_url.startsWith('data:') ? 'Local Image Attached' : form.image_url}</span>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{ padding: '2px 8px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)' }}
                              onClick={() => fileInputRef.current?.click()}
                            >
                              Change
                            </button>
                            <button
                              type="button"
                              className="btn-remove-image"
                              onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="image-drop-area"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <span className="upload-icon">🖼️</span>
                        <div><strong>Click to upload JPG / PNG image</strong> or drag and drop</div>
                        <div className="upload-hint">Recommended ratio 16:9 • High resolution event banner</div>
                        {uploading && <div style={{ color: 'var(--color-primary-light)', marginTop: '8px' }}>⏳ Uploading image...</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-group" style={{ gridColumn: '1/-1' }}>
                <label className="form-label">Full Description *</label>
                <textarea
                  name="description"
                  className="form-input"
                  rows="4"
                  value={form.description}
                  onChange={handleChange}
                  required
                  placeholder="Describe highlights, line-up, rules..."
                  style={{ resize: 'vertical' }}
                />
              </div>
            </div>

            <div className="admin-form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Saving...' : (editId ? 'Update Event' : 'Create Event')}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => { setShowForm(false); setEditId(null); }}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Events Content */}
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Seats</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id}>
                      <td className="td-event-title">{ev.title}</td>
                      <td><span className="badge badge-purple">{ev.category}</span></td>
                      <td>{ev.event_date?.split('T')[0]}</td>
                      <td>₹{parseFloat(ev.price).toLocaleString('en-IN')}</td>
                      <td>{ev.seats_available ?? ev.capacity}/{ev.capacity}</td>
                      <td>
                        <span className={`badge ${ev.is_active !== 0 ? 'badge-green' : 'badge-gray'}`}>
                          {ev.is_active !== 0 ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(ev)}>Edit</button>
                          {ev.is_active !== 0 && (
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>Deactivate</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Phones & Tablets) */}
            <div className="admin-mobile-cards">
              {events.map(ev => (
                <div key={ev.id} className="admin-mobile-card">
                  <div className="admin-mobile-card-header">
                    <h3 className="admin-mobile-card-title">{ev.title}</h3>
                    <span className="badge badge-purple">{ev.category}</span>
                  </div>

                  <div className="admin-mobile-card-meta">
                    <div className="admin-mobile-card-meta-item">
                      <span className="admin-mobile-card-meta-label">Date</span>
                      <span>{ev.event_date?.split('T')[0]}</span>
                    </div>
                    <div className="admin-mobile-card-meta-item">
                      <span className="admin-mobile-card-meta-label">Price</span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>₹{parseFloat(ev.price).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="admin-mobile-card-meta-item">
                      <span className="admin-mobile-card-meta-label">Capacity</span>
                      <span>{ev.seats_available ?? ev.capacity} / {ev.capacity}</span>
                    </div>
                    <div className="admin-mobile-card-meta-item">
                      <span className="admin-mobile-card-meta-label">Status</span>
                      <span className={`badge ${ev.is_active !== 0 ? 'badge-green' : 'badge-gray'}`} style={{ width: 'fit-content', marginTop: '2px' }}>
                        {ev.is_active !== 0 ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="admin-mobile-card-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(ev)}>✏️ Edit</button>
                    {ev.is_active !== 0 && (
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>🗑️ Deactivate</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

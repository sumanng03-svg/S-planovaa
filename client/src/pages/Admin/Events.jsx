import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Admin.css';

const CATEGORIES = ['Music','Technology','Workshops','College Events','Art','Sports'];
const EMPTY_FORM = {
  title:'', description:'', category:'Music',
  event_date:'', event_time:'', venue:'', price:'', capacity:'', image_url:''
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
      .then(r => setEvents(r.data.data || []))
      .catch(() => setError('Failed to load events.'))
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
    } catch (err) {
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
    window.scrollTo(0,0);
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
      const msgs = err.response?.data?.errors?.map(e=>e.msg).join(', ') || err.response?.data?.message || 'Save failed.';
      setError(msgs);
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
    } catch { setError('Failed to delete event.'); }
  };

  return (
    <main className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <span className="section-label">Admin</span>
            <h1 className="section-title">Manage Events</h1>
          </div>
          <div className="admin-nav-links">
            <button className="btn btn-primary" onClick={() => { setShowForm(s=>!s); setEditId(null); setForm(EMPTY_FORM); }}>
              {showForm ? '✕ Cancel' : '+ New Event'}
            </button>
            <Link to="/admin" className="btn btn-ghost btn-sm">← Dashboard</Link>
          </div>
        </div>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Form */}
        {showForm && (
          <form className="admin-form card" onSubmit={handleSubmit}>
            <h2 className="admin-form-title">{editId ? 'Edit Event' : 'Create New Event'}</h2>
            <div className="admin-form-grid">
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Event Title *</label>
                <input name="title" className="form-input" value={form.title} onChange={handleChange} required placeholder="e.g. SoundWave Music Festival" />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select name="category" className="form-input" value={form.category} onChange={handleChange}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input name="price" type="number" min="0" step="0.01" className="form-input" value={form.price} onChange={handleChange} required placeholder="0 for free" />
              </div>
              <div className="form-group">
                <label className="form-label">Event Date *</label>
                <input name="event_date" type="date" className="form-input" value={form.event_date} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Event Time *</label>
                <input name="event_time" type="time" className="form-input" value={form.event_time} onChange={handleChange} required />
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Venue *</label>
                <input name="venue" className="form-input" value={form.venue} onChange={handleChange} required placeholder="Venue name, City" />
              </div>
              <div className="form-group">
                <label className="form-label">Capacity *</label>
                <input name="capacity" type="number" min="1" className="form-input" value={form.capacity} onChange={handleChange} required />
              </div>
              {/* Event Image Upload Section */}
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px'}}>
                  <label className="form-label" style={{marginBottom:0}}>Event Image (JPG, PNG, WEBP)</label>
                  <div style={{display:'flex', gap:'8px'}}>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'upload' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{padding:'2px 8px', fontSize:'0.75rem'}}
                      onClick={() => setImageMode('upload')}
                    >
                      📁 Upload File
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm ${imageMode === 'url' ? 'btn-primary' : 'btn-ghost'}`}
                      style={{padding:'2px 8px', fontSize:'0.75rem'}}
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
                      style={{display:'none'}}
                      onChange={e => e.target.files && handleImageFile(e.target.files[0])}
                    />

                    {form.image_url ? (
                      <div className="image-preview-box">
                        <img src={form.image_url} alt="Event preview" />
                        <div className="image-preview-overlay">
                          <span>{form.image_url.startsWith('data:') ? 'Local Image Attached' : form.image_url}</span>
                          <div style={{display:'flex', gap:'6px'}}>
                            <button
                              type="button"
                              className="btn btn-sm btn-ghost"
                              style={{padding:'2px 8px', fontSize:'0.75rem', background:'rgba(255,255,255,0.2)'}}
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
                        <div className="upload-hint">Recommended ratio 16:9 • High quality event banner</div>
                        {uploading && <div style={{color:'var(--color-primary-light)', marginTop:'8px'}}>⏳ Uploading image...</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="form-group" style={{gridColumn:'1/-1'}}>
                <label className="form-label">Description *</label>
                <textarea name="description" className="form-input" rows="4" value={form.description} onChange={handleChange} required placeholder="Describe the event..." style={{resize:'vertical'}} />
              </div>
            </div>
            <div style={{display:'flex', gap:'var(--space-sm)', marginTop:'var(--space-lg)'}}>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Saving...' : (editId ? 'Update Event' : 'Create Event')}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</button>
            </div>
          </form>
        )}

        {/* Events Table */}
        {loading ? <div className="loading-container"><div className="spinner"/></div> : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Event</th><th>Category</th><th>Date</th><th>Price</th><th>Seats</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {events.map(ev => (
                  <tr key={ev.id}>
                    <td className="td-event-title">{ev.title}</td>
                    <td><span className="badge badge-purple">{ev.category}</span></td>
                    <td>{ev.event_date?.split('T')[0]}</td>
                    <td>₹{parseFloat(ev.price).toLocaleString('en-IN')}</td>
                    <td>{ev.seats_available}/{ev.capacity}</td>
                    <td>
                      <span className={`badge ${ev.is_active ? 'badge-green' : 'badge-gray'}`}>
                        {ev.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{display:'flex', gap:'6px'}}>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(ev)}>Edit</button>
                        {ev.is_active && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev.id)}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

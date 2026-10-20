const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();
router.use(authenticate, requireAdmin);

// ─── GET /api/admin/events ────────────────────────────────────────────────────
router.get('/events', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [events] = await db.execute(
      `SELECT id, title, category, event_date, event_time, venue, price,
              capacity, seats_available, is_active, image_url, created_at
       FROM events ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM events');

    res.json({ success: true, data: events, total });
  } catch (err) {
    console.error('[Admin Events]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, WEBP images are supported!'), false);
    }
  }
});

// ─── POST /api/admin/upload ───────────────────────────────────────────────────
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please select an image file to upload.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: fileUrl, filename: req.file.filename });
});

// ─── POST /api/admin/events ───────────────────────────────────────────────────
router.post(
  '/events',
  [
    body('title').trim().isLength({ min: 3, max: 255 }).withMessage('Title is required (3–255 chars)'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description required (min 10 chars)'),
    body('category').isIn(['Music','Technology','Workshops','College Events','Art','Sports']).withMessage('Invalid category'),
    body('event_date').isDate().withMessage('Valid date required (YYYY-MM-DD)'),
    body('event_time').matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Valid time required (HH:MM)'),
    body('venue').trim().isLength({ min: 3, max: 255 }).withMessage('Venue required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be >= 0'),
    body('capacity').isInt({ min: 1 }).withMessage('Capacity must be >= 1'),
    body('image_url').optional({ nullable: true }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { title, description, category, event_date, event_time, venue, price, capacity, image_url } = req.body;
    try {
      const [result] = await db.execute(
        `INSERT INTO events (title, description, category, event_date, event_time, venue, price, capacity, seats_available, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, event_date, event_time, venue, price, capacity, capacity, image_url || null]
      );
      res.status(201).json({ success: true, message: 'Event created.', data: { id: result.insertId } });
    } catch (err) {
      console.error('[Admin Create Event]', err.message);
      res.status(500).json({ success: false, message: 'Failed to create event.' });
    }
  }
);

// ─── PUT /api/admin/events/:id ────────────────────────────────────────────────
router.put(
  '/events/:id',
  [
    body('title').optional().trim().isLength({ min: 3, max: 255 }),
    body('description').optional().trim().isLength({ min: 10 }),
    body('category').optional().isIn(['Music','Technology','Workshops','College Events','Art','Sports']),
    body('event_date').optional().isDate(),
    body('event_time').optional().matches(/^\d{2}:\d{2}(:\d{2})?$/),
    body('venue').optional().trim().isLength({ min: 3, max: 255 }),
    body('price').optional().isFloat({ min: 0 }),
    body('capacity').optional().isInt({ min: 1 }),
    body('is_active').optional().isBoolean(),
    body('image_url').optional({ nullable: true }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const allowed = ['title','description','category','event_date','event_time','venue','price','capacity','is_active','image_url'];
    const updates = [];
    const values  = [];

    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates.push(`${key} = ?`);
        values.push(req.body[key]);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update.' });
    }

    values.push(req.params.id);
    try {
      const [result] = await db.execute(
        `UPDATE events SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }
      res.json({ success: true, message: 'Event updated.' });
    } catch (err) {
      console.error('[Admin Update Event]', err.message);
      res.status(500).json({ success: false, message: 'Failed to update event.' });
    }
  }
);

// ─── DELETE /api/admin/events/:id ────────────────────────────────────────────
router.delete('/events/:id', async (req, res) => {
  try {
    // Soft delete — mark inactive
    const [result] = await db.execute(
      "UPDATE events SET is_active = 0 WHERE id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, message: 'Event deactivated.' });
  } catch (err) {
    console.error('[Admin Delete Event]', err.message);
    res.status(500).json({ success: false, message: 'Failed to delete event.' });
  }
});

// ─── GET /api/admin/bookings ──────────────────────────────────────────────────
router.get('/bookings', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [bookings] = await db.execute(
      `SELECT b.id, b.quantity, b.total_amount, b.status, b.created_at,
              u.name as user_name, u.email as user_email,
              e.title as event_title, e.event_date,
              p.status as payment_status, p.transaction_ref,
              t.ticket_ref
       FROM bookings b
       JOIN users u    ON u.id = b.user_id
       JOIN events e   ON e.id = b.event_id
       LEFT JOIN payments p ON p.booking_id = b.id
       LEFT JOIN tickets  t ON t.booking_id = b.id
       ORDER BY b.created_at DESC LIMIT ? OFFSET ?`,
      [parseInt(limit), offset]
    );
    const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM bookings');
    res.json({ success: true, data: bookings, total });
  } catch (err) {
    console.error('[Admin Bookings]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [[{ total_events }]]   = await db.execute("SELECT COUNT(*) as total_events FROM events WHERE is_active = 1");
    const [[{ total_users }]]    = await db.execute("SELECT COUNT(*) as total_users FROM users WHERE role = 'user'");
    const [[{ total_bookings }]] = await db.execute("SELECT COUNT(*) as total_bookings FROM bookings WHERE status = 'confirmed'");
    const [[{ total_revenue }]]  = await db.execute("SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM bookings WHERE status = 'confirmed'");

    res.json({
      success: true,
      data: { total_events, total_users, total_bookings, total_revenue },
    });
  } catch (err) {
    console.error('[Admin Stats]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
});

module.exports = router;

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const db = require('../config/db');

const router = express.Router();

// ─── GET /api/events ──────────────────────────────────────────────────────────
// Query params: ?search=&category=&date=&page=1&limit=12
router.get('/', async (req, res) => {
  try {
    const { search = '', category = '', date = '', page = 1, limit = 12 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where = 'WHERE e.is_active = 1';
    const params = [];

    if (search) {
      where += ' AND (e.title LIKE ? OR e.venue LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    if (category) {
      where += ' AND e.category = ?';
      params.push(category);
    }
    if (date) {
      where += ' AND DATE(e.event_date) = ?';
      params.push(date);
    }

    const countQuery = `SELECT COUNT(*) as total FROM events e ${where}`;
    const dataQuery  = `
      SELECT e.id, e.title, e.category, e.event_date, e.event_time,
             e.venue, e.price, e.capacity, e.seats_available, e.image_url
      FROM events e ${where}
      ORDER BY e.event_date ASC
      LIMIT ? OFFSET ?
    `;

    const [countRows] = await db.execute(countQuery, params);
    const [events]    = await db.execute(dataQuery, [...params, parseInt(limit), offset]);

    res.json({
      success: true,
      data: events,
      pagination: {
        total: countRows[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(countRows[0].total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Events List]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
});

// ─── GET /api/events/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id, title, description, category, event_date, event_time,
              venue, price, capacity, seats_available, image_url, created_at
       FROM events WHERE id = ? AND is_active = 1`,
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Event Detail]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
});

module.exports = router;

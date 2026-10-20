const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All booking routes require authentication
router.use(authenticate);

// ─── POST /api/bookings ───────────────────────────────────────────────────────
// Create a pending booking (seats are held in a transaction)
router.post(
  '/',
  [
    body('event_id').isInt({ min: 1 }).withMessage('Valid event ID required'),
    body('quantity').isInt({ min: 1, max: 10 }).withMessage('Quantity must be 1–10'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { event_id, quantity } = req.body;
    const user_id = req.user.id;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lock the event row
      const [events] = await conn.execute(
        'SELECT id, title, price, seats_available FROM events WHERE id = ? AND is_active = 1 FOR UPDATE',
        [event_id]
      );
      if (events.length === 0) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: 'Event not found.' });
      }

      const event = events[0];

      // Check seat availability
      if (event.seats_available < quantity) {
        await conn.rollback();
        return res.status(409).json({
          success: false,
          message: `Only ${event.seats_available} seat(s) available. Please reduce quantity.`,
        });
      }

      // Prices are calculated server-side — never trust the frontend
      const unit_price   = parseFloat(event.price);
      const total_amount = unit_price * quantity;

      // Decrement seats
      await conn.execute(
        'UPDATE events SET seats_available = seats_available - ? WHERE id = ?',
        [quantity, event_id]
      );

      // Create booking
      const [result] = await conn.execute(
        `INSERT INTO bookings (user_id, event_id, quantity, unit_price, total_amount, status)
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [user_id, event_id, quantity, unit_price, total_amount]
      );

      // Create associated payment record
      await conn.execute(
        `INSERT INTO payments (booking_id, amount, status, gateway) VALUES (?, ?, 'pending', 'demo')`,
        [result.insertId, total_amount]
      );

      await conn.commit();

      res.status(201).json({
        success: true,
        message: 'Booking created. Please complete payment.',
        data: {
          booking_id:   result.insertId,
          event_id,
          event_title:  event.title,
          quantity,
          unit_price,
          total_amount,
          status:       'pending',
        },
      });
    } catch (err) {
      await conn.rollback();
      console.error('[Booking Create]', err.message);
      res.status(500).json({ success: false, message: 'Booking failed. Please try again.' });
    } finally {
      conn.release();
    }
  }
);

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT b.id, b.user_id, b.event_id, b.quantity, b.unit_price, b.total_amount, b.status, b.created_at,
              e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url,
              p.status as payment_status, p.transaction_ref
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       LEFT JOIN payments p ON p.booking_id = b.id
       WHERE b.id = ? AND b.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[Booking Detail]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch booking.' });
  }
});

// ─── GET /api/bookings (my bookings) ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT b.id, b.quantity, b.total_amount, b.status, b.created_at,
              e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url, e.category,
              p.status as payment_status,
              t.ticket_ref
       FROM bookings b
       JOIN events e ON e.id = b.event_id
       LEFT JOIN payments p ON p.booking_id = b.id
       LEFT JOIN tickets  t ON t.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[My Bookings]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings.' });
  }
});

module.exports = router;

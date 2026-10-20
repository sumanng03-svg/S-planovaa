const express = require('express');
const QRCode = require('qrcode');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/tickets/verify/:ticketRef (public) ──────────────────────────────
router.get('/verify/:ticketRef', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.ticket_ref, t.issued_at,
              b.quantity, b.total_amount,
              u.name as attendee_name,
              e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url
       FROM tickets t
       JOIN bookings b ON b.id = t.booking_id
       JOIN users u    ON u.id = b.user_id
       JOIN events e   ON e.id = b.event_id
       WHERE t.ticket_ref = ?`,
      [req.params.ticketRef]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found or invalid.' });
    }

    res.json({ success: true, message: 'Valid ticket ✓', data: rows[0] });
  } catch (err) {
    console.error('[Ticket Verify]', err.message);
    res.status(500).json({ success: false, message: 'Failed to verify ticket.' });
  }
});

// ─── GET /api/tickets/booking/:bookingId (authenticated) ─────────────────────
router.get('/booking/:bookingId', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.id, t.ticket_ref, t.qr_data, t.issued_at,
              b.id as booking_id, b.quantity, b.total_amount, b.unit_price, b.status as booking_status,
              u.name as attendee_name, u.email as attendee_email,
              e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url, e.category,
              p.transaction_ref, p.paid_at, p.status as payment_status
       FROM tickets t
       JOIN bookings b ON b.id = t.booking_id
       JOIN users u    ON u.id = b.user_id
       JOIN events e   ON e.id = b.event_id
       JOIN payments p ON p.booking_id = b.id
       WHERE t.booking_id = ? AND b.user_id = ?`,
      [req.params.bookingId, req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Ticket not found for this booking.' });
    }

    // Re-generate QR code data URL on demand
    const ticket = rows[0];
    const qrDataUrl = await QRCode.toDataURL(ticket.qr_data, { errorCorrectionLevel: 'H', width: 300 });
    ticket.qr_code = qrDataUrl;

    res.json({ success: true, data: ticket });
  } catch (err) {
    console.error('[Ticket By Booking]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch ticket.' });
  }
});

// ─── GET /api/tickets (my tickets) ───────────────────────────────────────────
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT t.ticket_ref, t.issued_at,
              b.id as booking_id, b.quantity, b.total_amount, b.status as booking_status,
              e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url, e.category,
              p.transaction_ref, p.status as payment_status
       FROM tickets t
       JOIN bookings b ON b.id = t.booking_id
       JOIN events e   ON e.id = b.event_id
       JOIN payments p ON p.booking_id = b.id
       WHERE b.user_id = ?
       ORDER BY t.issued_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('[My Tickets]', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
});

module.exports = router;

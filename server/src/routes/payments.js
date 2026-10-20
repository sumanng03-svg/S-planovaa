const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const db = require('../config/db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// ─── POST /api/payments/initiate ─────────────────────────────────────────────
// Returns a demo payment session (in production, call your payment gateway here)
router.post(
  '/initiate',
  [body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID required')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { booking_id } = req.body;
    try {
      // Verify booking belongs to this user and is still pending
      const [bookings] = await db.execute(
        `SELECT b.id, b.total_amount, b.status, p.status as payment_status
         FROM bookings b JOIN payments p ON p.booking_id = b.id
         WHERE b.id = ? AND b.user_id = ?`,
        [booking_id, req.user.id]
      );

      if (bookings.length === 0) {
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }
      const booking = bookings[0];

      if (booking.status !== 'pending') {
        return res.status(400).json({ success: false, message: `Booking is already ${booking.status}.` });
      }

      // Demo: generate a one-time session token for this payment
      const sessionToken = uuidv4();

      res.json({
        success: true,
        message: 'Demo payment session initiated.',
        data: {
          booking_id,
          amount:        booking.total_amount,
          currency:      'INR',
          session_token: sessionToken, // used to confirm payment
          gateway:       'demo',
          note:          'This is a simulated payment. No real money is charged.',
        },
      });
    } catch (err) {
      console.error('[Payment Initiate]', err.message);
      res.status(500).json({ success: false, message: 'Failed to initiate payment.' });
    }
  }
);

// ─── POST /api/payments/confirm ───────────────────────────────────────────────
// Backend validates and confirms payment; generates ticket ONLY on success
router.post(
  '/confirm',
  [
    body('booking_id').isInt({ min: 1 }).withMessage('Valid booking ID required'),
    body('session_token').isUUID().withMessage('Valid session token required'),
    body('payment_method').optional().isString(),
    body('simulate').optional().isIn(['success', 'failure']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(422).json({ success: false, errors: errors.array() });

    const { booking_id, session_token, payment_method = 'UPI', simulate = 'success' } = req.body;

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Lock booking and payment rows
      const [bookings] = await conn.execute(
        `SELECT b.id, b.user_id, b.event_id, b.quantity, b.total_amount, b.status,
                p.id as payment_id, p.status as payment_status,
                u.name as user_name,
                e.title as event_title, e.event_date, e.event_time, e.venue, e.image_url
         FROM bookings b
         JOIN payments p ON p.booking_id = b.id
         JOIN users u    ON u.id = b.user_id
         JOIN events e   ON e.id = b.event_id
         WHERE b.id = ? AND b.user_id = ?
         FOR UPDATE`,
        [booking_id, req.user.id]
      );

      if (bookings.length === 0) {
        await conn.rollback();
        return res.status(404).json({ success: false, message: 'Booking not found.' });
      }

      const booking = bookings[0];

      // Idempotency: if already confirmed, return the existing ticket
      if (booking.status === 'confirmed') {
        const [tickets] = await conn.execute(
          'SELECT ticket_ref FROM tickets WHERE booking_id = ?',
          [booking_id]
        );
        await conn.rollback(); // no changes needed
        return res.json({
          success: true,
          message: 'Booking already confirmed.',
          data: { booking_id, ticket_ref: tickets[0]?.ticket_ref },
        });
      }

      if (booking.status !== 'pending') {
        await conn.rollback();
        return res.status(400).json({ success: false, message: `Booking is ${booking.status} and cannot be confirmed.` });
      }

      // Payment processing
      const paymentSucceeded = simulate !== 'failure';
      const cleanMethod = (payment_method || 'ONLINE').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const transactionRef = `PLNV-${cleanMethod}-${Date.now().toString().slice(-6)}${Math.floor(1000 + Math.random() * 9000)}`;

      if (!paymentSucceeded) {
        // Payment failed — restore seats and update statuses
        await conn.execute(
          'UPDATE events SET seats_available = seats_available + ? WHERE id = ?',
          [booking.quantity, booking.event_id]
        );
        await conn.execute(
          "UPDATE bookings SET status = 'failed' WHERE id = ?",
          [booking_id]
        );
        await conn.execute(
          "UPDATE payments SET status = 'failed', transaction_ref = ?, gateway = ? WHERE id = ?",
          [transactionRef, payment_method, booking.payment_id]
        );
        await conn.commit();
        return res.status(402).json({
          success: false,
          message: 'Payment was declined by the bank or gateway. Your booking has been cancelled and seats released.',
          data: { booking_id, status: 'failed' },
        });
      }

      // ── Payment succeeded ──────────────────────────────────────────────────
      await conn.execute(
        "UPDATE bookings SET status = 'confirmed' WHERE id = ?",
        [booking_id]
      );
      await conn.execute(
        "UPDATE payments SET status = 'success', transaction_ref = ?, gateway = ?, paid_at = NOW() WHERE id = ?",
        [transactionRef, payment_method, booking.payment_id]
      );

      // Issue ticket
      const ticketRef = uuidv4();
      const qrData    = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify/${ticketRef}`;
      const qrCodeUrl = await QRCode.toDataURL(qrData, { errorCorrectionLevel: 'H', width: 300 });

      await conn.execute(
        'INSERT INTO tickets (booking_id, ticket_ref, qr_data) VALUES (?, ?, ?)',
        [booking_id, ticketRef, qrData]
      );

      await conn.commit();

      res.json({
        success: true,
        message: 'Payment confirmed! Your ticket has been issued.',
        data: {
          booking_id,
          ticket_ref:      ticketRef,
          transaction_ref: transactionRef,
          qr_code:         qrCodeUrl,
          event_title:     booking.event_title,
          event_date:      booking.event_date,
          event_time:      booking.event_time,
          venue:           booking.venue,
          image_url:       booking.image_url,
          user_name:       booking.user_name,
          quantity:        booking.quantity,
          total_amount:    booking.total_amount,
        },
      });
    } catch (err) {
      await conn.rollback();
      console.error('[Payment Confirm]', err.message);
      res.status(500).json({ success: false, message: 'Payment confirmation failed.' });
    } finally {
      conn.release();
    }
  }
);

module.exports = router;

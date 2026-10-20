# PLANOVA — Event Management & Ticket Booking System

> **Plan less. Experience more.**

A full-stack event management web application built as a college mini-project. Users can discover events, book tickets, complete a demo payment, and receive a beautiful digital ticket card with QR verification.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite 5 |
| Styling | Vanilla CSS (design system) |
| Backend | Node.js + Express 4 |
| Database | MySQL 8+ |
| Auth | JWT + bcrypt |
| QR Code | qrcode (server), qrcode.react (client) |

---

## 📂 Project Structure

```
planova/
├── client/          # React + Vite frontend
├── server/          # Express backend API
└── database/        # SQL schema and seed data
```

---

## ⚙️ Prerequisites

- Node.js v18+
- MySQL 8+ running locally
- npm

---

## 🛠️ Setup Instructions

### Step 1 — Database

1. Open MySQL shell or MySQL Workbench.
2. Run the schema file:
   ```sql
   source /path/to/planova/database/schema.sql;
   ```
3. Run the seed file (sample events + demo users):
   ```sql
   source /path/to/planova/database/seed.sql;
   ```

### Step 2 — Backend Setup

```bash
cd server

# Copy environment variables
copy .env.example .env
# Edit .env with your MySQL password and a secret JWT key
notepad .env

# Install dependencies (already done if you followed Phase 1)
npm install

# Start the backend
npm run dev
```

The server runs on **http://localhost:5000**

### Step 3 — Frontend Setup

```bash
cd client

# Copy environment variables
copy .env.example .env

# Install dependencies (already done)
npm install

# Start the frontend
npm run dev
```

The frontend runs on **http://localhost:5173**

---

## 🔐 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| User | user@planova.com | Admin@1234 |
| Admin | admin@planova.com | Admin@1234 |

> These are seeded by `seed.sql`. Change them for production!

---

## 🧪 Testing the Complete Flow

1. **Browse** → Go to http://localhost:5173 → Explore events
2. **Event Detail** → Click "View Details" on any event
3. **Login** → Click "Log in to Book" → use demo credentials
4. **Book** → Select quantity → Click "Book Now"
5. **Payment** → Choose "✅ Success" simulation → Click Pay
6. **Ticket** → Your digital ticket appears with QR code
7. **Verify** → Scan QR or visit the verify URL directly
8. **Admin** → Login as admin → Go to /admin

### Test Edge Cases

| Scenario | How to test |
|----------|-------------|
| Failed payment | Select ❌ Failure on payment page |
| Sold-out event | Admin: set capacity to 0 or book all seats |
| Unauthorized admin | Log in as regular user, visit /admin |
| Duplicate confirmation | Try paying for an already-confirmed booking |

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | — | Register user |
| POST | /api/auth/login | — | Login, receive JWT |
| GET | /api/auth/me | User | Get current user |
| GET | /api/events | — | List events (search/filter/paginate) |
| GET | /api/events/:id | — | Event details |
| POST | /api/bookings | User | Create pending booking |
| GET | /api/bookings | User | My bookings |
| GET | /api/bookings/:id | User | Booking detail |
| POST | /api/payments/initiate | User | Start demo payment session |
| POST | /api/payments/confirm | User | Confirm payment (issues ticket) |
| GET | /api/tickets | User | My tickets |
| GET | /api/tickets/booking/:id | User | Ticket for booking |
| GET | /api/tickets/verify/:ref | — | Verify ticket (public, for QR) |
| GET | /api/admin/stats | Admin | Dashboard stats |
| GET | /api/admin/events | Admin | List all events |
| POST | /api/admin/events | Admin | Create event |
| PUT | /api/admin/events/:id | Admin | Update event |
| DELETE | /api/admin/events/:id | Admin | Deactivate event |
| GET | /api/admin/bookings | Admin | All bookings |

---

## 🔒 Security Notes

- Passwords hashed with **bcrypt** (cost factor 12)
- JWT tokens expire in 7 days
- Prices **always calculated server-side** — never from frontend
- Tickets issued **only after backend confirms payment**
- Database queries use **parameterized statements** (mysql2 prepared statements)
- Admin endpoints protected by role check middleware
- Ticket references are **UUID v4** (cryptographically unguessable)

---

## ✅ Completed Features

- [x] Home page with hero, search, categories, events
- [x] Explore page with search/filter/date filters
- [x] Event detail page with booking widget
- [x] User registration and login (JWT)
- [x] Transactional seat reservation (no overbooking)
- [x] Demo payment with success/failure simulation
- [x] Server-side payment confirmation
- [x] Digital ticket with QR code
- [x] Download ticket as image
- [x] Print ticket
- [x] QR ticket verification (public URL)
- [x] My Tickets page (confirmed tickets + all bookings)
- [x] Admin dashboard with stats
- [x] Admin event CRUD
- [x] Admin bookings view
- [x] Responsive design (desktop + mobile)

## ⚠️ Limitations (for production)

- Payment is simulated — integrate a real gateway (Razorpay/Stripe) and verify webhooks
- No email notifications (add Nodemailer for booking confirmations)
- No rate limiting (add express-rate-limit)
- Sessions are stateless JWTs (no server-side logout blacklist)

---

## 📖 Viva Explanation Points

1. **Why bcrypt?** It's a slow hashing algorithm specifically designed for passwords — makes brute-force attacks impractical.
2. **Why server-side price?** Prevents users from manipulating request prices in browser dev tools.
3. **Why transactions for booking?** Ensures seats_available and booking creation are atomic — prevents race conditions and overbooking.
4. **Why UUID for ticket_ref?** 128-bit random IDs are statistically impossible to guess, unlike sequential integers.
5. **Why issue ticket only after payment confirmation?** The backend independently verifies the payment state — the frontend cannot forge a successful payment.

---

*Built with ♥ as a CSE college mini-project — PLANOVA*

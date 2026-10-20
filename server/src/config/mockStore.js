/**
 * In-memory Mock Data Store for PLANOVA
 * Activated when MySQL is not available or credentials are not yet configured.
 * This guarantees the application runs out-of-the-box for project viva/evaluations
 * without requiring instant MySQL database setup.
 */

const INITIAL_USERS = [
  {
    id: 1,
    name: 'PLANOVA Admin',
    email: 'admin@planova.com',
    password_hash: '$2b$10$HW8BLHPQPUmWJFAQYS/RhOJusS3Z0bRm0PQwSRtkmkOSZpQCgYWxW', // Admin@1234
    role: 'admin',
    created_at: new Date('2026-01-01T00:00:00Z')
  },
  {
    id: 2,
    name: 'Demo User',
    email: 'user@planova.com',
    password_hash: '$2b$10$HW8BLHPQPUmWJFAQYS/RhOJusS3Z0bRm0PQwSRtkmkOSZpQCgYWxW', // Admin@1234
    role: 'user',
    created_at: new Date('2026-01-01T00:00:00Z')
  }
];

const INITIAL_EVENTS = [
  {
    id: 1,
    title: 'SoundWave Music Festival 2026',
    description: 'Experience three days of electrifying live performances from top indie, electronic, and pop artists. SoundWave brings together 40+ artists across 5 stages in a breathtaking outdoor venue. Featuring food stalls, art installations, and after-parties that will keep the energy going all night long.',
    category: 'Music',
    event_date: '2026-11-15',
    event_time: '18:00:00',
    venue: 'Central Park Arena, Mumbai',
    price: 999.00,
    capacity: 500,
    seats_available: 500,
    image_url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-01T00:00:00Z')
  },
  {
    id: 2,
    title: 'TechHorizon Conference 2026',
    description: 'Join industry leaders, startup founders, and engineers for a full-day deep dive into AI, cloud computing, and the future of software development. Keynotes, workshops, and networking sessions with 200+ tech professionals. Gain insights, build connections, and discover tools that will accelerate your career.',
    category: 'Technology',
    event_date: '2026-11-20',
    event_time: '09:00:00',
    venue: 'Convention Centre, Bengaluru',
    price: 1499.00,
    capacity: 300,
    seats_available: 300,
    image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-02T00:00:00Z')
  },
  {
    id: 3,
    title: 'Creative Code: Full-Stack Workshop',
    description: 'A hands-on two-day workshop where you will build a complete web application from scratch using React, Node.js, and PostgreSQL. Led by senior engineers from top product companies. Perfect for students and junior developers looking to level up their practical skills.',
    category: 'Workshops',
    event_date: '2026-11-25',
    event_time: '10:00:00',
    venue: 'Innovation Hub, Pune',
    price: 799.00,
    capacity: 60,
    seats_available: 60,
    image_url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-03T00:00:00Z')
  },
  {
    id: 4,
    title: 'Inter-College Hackathon 2026',
    description: 'A 24-hour hackathon open to all college students. Solve real-world challenges in tracks including Healthcare, FinTech, EdTech, and Sustainability. Prizes worth ₹3 lakhs, mentorship from industry experts, and recruiters from 15 top companies on the lookout for talent.',
    category: 'College Events',
    event_date: '2026-12-01',
    event_time: '08:00:00',
    venue: 'NIT Auditorium, Chennai',
    price: 199.00,
    capacity: 200,
    seats_available: 200,
    image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-04T00:00:00Z')
  },
  {
    id: 5,
    title: 'Canvas & Code: Digital Art Expo',
    description: 'An immersive exhibition celebrating the intersection of technology and visual art. Experience generative art, interactive installations, AI-generated masterpieces, and live digital painting sessions. Artists from 12 countries showcase work that challenges the boundaries of creativity.',
    category: 'Art',
    event_date: '2026-12-10',
    event_time: '11:00:00',
    venue: 'The Gallery, Delhi',
    price: 349.00,
    capacity: 150,
    seats_available: 150,
    image_url: 'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-05T00:00:00Z')
  },
  {
    id: 6,
    title: 'Annual College Sports Meet',
    description: 'Cheer for your college at the biggest inter-college sports extravaganza of the year. Events include cricket, football, basketball, athletics, and esports. Open to participants and spectators. Come support your team and witness record-breaking performances.',
    category: 'Sports',
    event_date: '2026-12-20',
    event_time: '07:30:00',
    venue: 'University Sports Complex, Hyderabad',
    price: 149.00,
    capacity: 1000,
    seats_available: 1000,
    image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-06T00:00:00Z')
  },
  {
    id: 7,
    title: 'Electronic Dreams: Night Concert',
    description: 'A premium night concert featuring internationally acclaimed electronic music producers. Stunning visuals, laser shows, and an unmatched sound system create an otherworldly experience. Limited capacity for an exclusive atmosphere you will remember forever.',
    category: 'Music',
    event_date: '2026-11-30',
    event_time: '20:00:00',
    venue: 'The Dome, Goa',
    price: 1999.00,
    capacity: 250,
    seats_available: 250,
    image_url: 'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-07T00:00:00Z')
  },
  {
    id: 8,
    title: 'AI & Machine Learning Bootcamp',
    description: 'An intensive 3-day bootcamp covering Python for ML, neural networks, NLP, and deploying models to production. Includes hands-on projects, real datasets, and guidance from AI researchers. Get a verified certificate upon completion. Beginner to intermediate level.',
    category: 'Workshops',
    event_date: '2026-12-05',
    event_time: '09:30:00',
    venue: 'Tech Park, Bengaluru',
    price: 2499.00,
    capacity: 80,
    seats_available: 80,
    image_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80',
    is_active: 1,
    created_at: new Date('2026-01-08T00:00:00Z')
  }
];

class MockDatabase {
  constructor() {
    this.users = JSON.parse(JSON.stringify(INITIAL_USERS));
    this.events = JSON.parse(JSON.stringify(INITIAL_EVENTS));
    this.bookings = [];
    this.payments = [];
    this.tickets = [];
    this.nextUserId = 3;
    this.nextEventId = 9;
    this.nextBookingId = 1;
    this.nextPaymentId = 1;
    this.nextTicketId = 1;
  }

  async execute(sql, params = []) {
    const s = sql.trim().replace(/\s+/g, ' ');
    const lower = s.toLowerCase();

    // ── USERS ─────────────────────────────────────────────────────────────
    if (lower.includes('select id from users where email = ?')) {
      const email = params[0]?.toLowerCase();
      const found = this.users.filter(u => u.email.toLowerCase() === email);
      return [found.map(u => ({ id: u.id })), []];
    }

    if (lower.includes('insert into users')) {
      const [name, email, password_hash, role] = params;
      const newUser = {
        id: this.nextUserId++,
        name,
        email,
        password_hash,
        role: role || 'user',
        created_at: new Date()
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id, affectedRows: 1 }, []];
    }

    if (lower.includes('select id, name, email, password_hash, role from users where email = ?')) {
      const email = params[0]?.toLowerCase();
      const found = this.users.filter(u => u.email.toLowerCase() === email);
      return [found, []];
    }

    if (lower.includes('select id, name, email, role, created_at from users where id = ?')) {
      const id = parseInt(params[0]);
      const found = this.users.filter(u => u.id === id);
      return [found, []];
    }

    // ── EVENTS ────────────────────────────────────────────────────────────
    if (lower.startsWith('select count(*) as total from events')) {
      let filtered = this.events.filter(e => e.is_active === 1);
      if (lower.includes('e.title like ?')) {
        const term = (params[0] || '').replace(/%/g, '').toLowerCase();
        filtered = filtered.filter(e => e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term));
      }
      if (lower.includes('e.category = ?')) {
        const cat = params[params.length - (lower.includes('date(') ? 2 : 1)];
        filtered = filtered.filter(e => e.category === cat);
      }
      return [[{ total: filtered.length }], []];
    }

    if (lower.includes('from events') && lower.includes('limit ? offset ?')) {
      let filtered = this.events.filter(e => e.is_active === 1);
      let pIdx = 0;
      if (lower.includes('e.title like ?')) {
        const term = (params[pIdx++] || '').replace(/%/g, '').toLowerCase();
        pIdx++; // venue param
        filtered = filtered.filter(e => e.title.toLowerCase().includes(term) || e.venue.toLowerCase().includes(term));
      }
      if (lower.includes('e.category = ?')) {
        const cat = params[pIdx++];
        filtered = filtered.filter(e => e.category === cat);
      }
      if (lower.includes('date(e.event_date) = ?')) {
        const dateStr = params[pIdx++];
        filtered = filtered.filter(e => e.event_date === dateStr);
      }
      filtered.sort((a, b) => new Date(a.event_date) - new Date(b.event_date));
      const limit = parseInt(params[params.length - 2]);
      const offset = parseInt(params[params.length - 1]);
      const paginated = filtered.slice(offset, offset + limit);
      return [paginated, []];
    }

    if (lower.includes('from events where id = ?')) {
      const id = parseInt(params[0]);
      const found = this.events.filter(e => e.id === id && e.is_active === 1);
      return [found, []];
    }

    if (lower.includes('update events set seats_available = seats_available - ? where id = ?')) {
      const [qty, id] = params.map(p => parseInt(p));
      const ev = this.events.find(e => e.id === id);
      if (ev) ev.seats_available -= qty;
      return [{ affectedRows: ev ? 1 : 0 }, []];
    }

    if (lower.includes('update events set seats_available = seats_available + ? where id = ?')) {
      const [qty, id] = params.map(p => parseInt(p));
      const ev = this.events.find(e => e.id === id);
      if (ev) ev.seats_available += qty;
      return [{ affectedRows: ev ? 1 : 0 }, []];
    }

    // ── BOOKINGS ──────────────────────────────────────────────────────────
    if (lower.startsWith('insert into bookings')) {
      const [user_id, event_id, quantity, unit_price, total_amount] = params;
      const newBooking = {
        id: this.nextBookingId++,
        user_id: parseInt(user_id),
        event_id: parseInt(event_id),
        quantity: parseInt(quantity),
        unit_price: parseFloat(unit_price),
        total_amount: parseFloat(total_amount),
        status: 'pending',
        created_at: new Date(),
        updated_at: new Date()
      };
      this.bookings.push(newBooking);
      return [{ insertId: newBooking.id, affectedRows: 1 }, []];
    }

    if (lower.startsWith('insert into payments')) {
      const [booking_id, amount] = params;
      const newPayment = {
        id: this.nextPaymentId++,
        booking_id: parseInt(booking_id),
        amount: parseFloat(amount),
        status: 'pending',
        transaction_ref: null,
        gateway: 'demo',
        paid_at: null,
        created_at: new Date()
      };
      this.payments.push(newPayment);
      return [{ insertId: newPayment.id, affectedRows: 1 }, []];
    }

    if (lower.includes('from bookings b join payments p') && lower.includes('where b.id = ? and b.user_id = ?')) {
      const bookingId = parseInt(params[0]);
      const userId = parseInt(params[1]);
      const b = this.bookings.find(item => item.id === bookingId && item.user_id === userId);
      if (!b) return [[], []];
      const p = this.payments.find(item => item.booking_id === b.id) || {};
      const u = this.users.find(item => item.id === b.user_id) || {};
      const e = this.events.find(item => item.id === b.event_id) || {};
      return [[{
        ...b,
        payment_id: p.id,
        payment_status: p.status,
        transaction_ref: p.transaction_ref,
        user_name: u.name,
        user_email: u.email,
        event_title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        venue: e.venue,
        image_url: e.image_url
      }], []];
    }

    if (lower.includes('from bookings b join events e') && lower.includes('where b.id = ? and b.user_id = ?')) {
      const bookingId = parseInt(params[0]);
      const userId = parseInt(params[1]);
      const b = this.bookings.find(item => item.id === bookingId && item.user_id === userId);
      if (!b) return [[], []];
      const p = this.payments.find(item => item.booking_id === b.id) || {};
      const e = this.events.find(item => item.id === b.event_id) || {};
      return [[{
        ...b,
        event_title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        venue: e.venue,
        image_url: e.image_url,
        payment_status: p.status,
        transaction_ref: p.transaction_ref
      }], []];
    }

    if (lower.includes('from bookings b join events e') && lower.includes('where b.user_id = ?')) {
      const userId = parseInt(params[0]);
      const list = this.bookings
        .filter(b => b.user_id === userId)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(b => {
          const e = this.events.find(item => item.id === b.event_id) || {};
          const p = this.payments.find(item => item.booking_id === b.id) || {};
          const t = this.tickets.find(item => item.booking_id === b.id);
          return {
            ...b,
            event_title: e.title,
            event_date: e.event_date,
            event_time: e.event_time,
            venue: e.venue,
            image_url: e.image_url,
            category: e.category,
            payment_status: p.status,
            ticket_ref: t ? t.ticket_ref : null
          };
        });
      return [list, []];
    }

    // ── PAYMENTS & TICKETS UPDATE ──────────────────────────────────────────
    if (lower.includes("update bookings set status = 'confirmed' where id = ?")) {
      const bId = parseInt(params[0]);
      const b = this.bookings.find(item => item.id === bId);
      if (b) b.status = 'confirmed';
      return [{ affectedRows: b ? 1 : 0 }, []];
    }

    if (lower.includes("update payments set status = 'success'")) {
      const txRef = params[0];
      const gateway = params.length > 2 ? params[1] : 'demo';
      const pId = parseInt(params[params.length - 1]);
      const p = this.payments.find(item => item.id === pId);
      if (p) {
        p.status = 'success';
        p.transaction_ref = txRef;
        p.gateway = gateway;
        p.paid_at = new Date();
      }
      return [{ affectedRows: p ? 1 : 0 }, []];
    }

    if (lower.includes("update bookings set status = 'failed' where id = ?")) {
      const bId = parseInt(params[0]);
      const b = this.bookings.find(item => item.id === bId);
      if (b) b.status = 'failed';
      return [{ affectedRows: b ? 1 : 0 }, []];
    }

    if (lower.includes("update payments set status = 'failed'")) {
      const txRef = params[0];
      const pId = parseInt(params[1]);
      const p = this.payments.find(item => item.id === pId);
      if (p) {
        p.status = 'failed';
        p.transaction_ref = txRef;
      }
      return [{ affectedRows: p ? 1 : 0 }, []];
    }

    if (lower.startsWith('insert into tickets')) {
      const [booking_id, ticket_ref, qr_data] = params;
      const newTicket = {
        id: this.nextTicketId++,
        booking_id: parseInt(booking_id),
        ticket_ref,
        qr_data,
        issued_at: new Date()
      };
      this.tickets.push(newTicket);
      return [{ insertId: newTicket.id, affectedRows: 1 }, []];
    }

    if (lower.includes('from tickets where booking_id = ?')) {
      const bId = parseInt(params[0]);
      const found = this.tickets.filter(t => t.booking_id === bId);
      return [found, []];
    }

    if (lower.includes('from tickets t') && lower.includes('where t.ticket_ref = ?')) {
      const ref = params[0];
      const t = this.tickets.find(item => item.ticket_ref === ref);
      if (!t) return [[], []];
      const b = this.bookings.find(item => item.id === t.booking_id) || {};
      const u = this.users.find(item => item.id === b.user_id) || {};
      const e = this.events.find(item => item.id === b.event_id) || {};
      return [[{
        ticket_ref: t.ticket_ref,
        issued_at: t.issued_at,
        quantity: b.quantity,
        total_amount: b.total_amount,
        attendee_name: u.name,
        event_title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        venue: e.venue,
        image_url: e.image_url
      }], []];
    }

    if (lower.includes('from tickets t') && lower.includes('where t.booking_id = ? and b.user_id = ?')) {
      const bId = parseInt(params[0]);
      const uId = parseInt(params[1]);
      const t = this.tickets.find(item => item.booking_id === bId);
      if (!t) return [[], []];
      const b = this.bookings.find(item => item.id === bId && item.user_id === uId);
      if (!b) return [[], []];
      const u = this.users.find(item => item.id === b.user_id) || {};
      const e = this.events.find(item => item.id === b.event_id) || {};
      const p = this.payments.find(item => item.booking_id === b.id) || {};
      return [[{
        ...t,
        booking_id: b.id,
        quantity: b.quantity,
        total_amount: b.total_amount,
        unit_price: b.unit_price,
        booking_status: b.status,
        attendee_name: u.name,
        attendee_email: u.email,
        event_title: e.title,
        event_date: e.event_date,
        event_time: e.event_time,
        venue: e.venue,
        image_url: e.image_url,
        category: e.category,
        transaction_ref: p.transaction_ref,
        paid_at: p.paid_at,
        payment_status: p.status
      }], []];
    }

    if (lower.includes('from tickets t') && lower.includes('where b.user_id = ?')) {
      const uId = parseInt(params[0]);
      const res = [];
      for (const t of this.tickets) {
        const b = this.bookings.find(item => item.id === t.booking_id && item.user_id === uId);
        if (!b) continue;
        const e = this.events.find(item => item.id === b.event_id) || {};
        const p = this.payments.find(item => item.booking_id === b.id) || {};
        res.push({
          ticket_ref: t.ticket_ref,
          issued_at: t.issued_at,
          booking_id: b.id,
          quantity: b.quantity,
          total_amount: b.total_amount,
          booking_status: b.status,
          event_title: e.title,
          event_date: e.event_date,
          event_time: e.event_time,
          venue: e.venue,
          image_url: e.image_url,
          category: e.category,
          transaction_ref: p.transaction_ref,
          payment_status: p.status
        });
      }
      return [res, []];
    }

    // ── ADMIN ROUTES ───────────────────────────────────────────────────────
    if (lower.includes('count(*) as total_events')) {
      const cnt = this.events.filter(e => e.is_active === 1).length;
      return [[{ total_events: cnt }], []];
    }
    if (lower.includes('count(*) as total_users')) {
      const cnt = this.users.filter(u => u.role === 'user').length;
      return [[{ total_users: cnt }], []];
    }
    if (lower.includes('count(*) as total_bookings')) {
      const cnt = this.bookings.filter(b => b.status === 'confirmed').length;
      return [[{ total_bookings: cnt }], []];
    }
    if (lower.includes('total_revenue')) {
      const sum = this.bookings
        .filter(b => b.status === 'confirmed')
        .reduce((acc, b) => acc + (b.total_amount || 0), 0);
      return [[{ total_revenue: sum }], []];
    }
    if (lower.startsWith('select count(*) as total from bookings')) {
      return [[{ total: this.bookings.length }], []];
    }
    if (lower.startsWith('select count(*) as total from events')) {
      return [[{ total: this.events.length }], []];
    }
    if (lower.includes('from events order by created_at desc limit ? offset ?')) {
      const limit = parseInt(params[0]);
      const offset = parseInt(params[1]);
      const sorted = [...this.events].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      return [sorted.slice(offset, offset + limit), []];
    }
    if (lower.includes('from bookings b') && lower.includes('order by b.created_at desc limit ? offset ?')) {
      const limit = parseInt(params[0]);
      const offset = parseInt(params[1]);
      const sorted = [...this.bookings]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .map(b => {
          const u = this.users.find(item => item.id === b.user_id) || {};
          const e = this.events.find(item => item.id === b.event_id) || {};
          const p = this.payments.find(item => item.booking_id === b.id) || {};
          const t = this.tickets.find(item => item.booking_id === b.id);
          return {
            id: b.id,
            quantity: b.quantity,
            total_amount: b.total_amount,
            status: b.status,
            created_at: b.created_at,
            user_name: u.name,
            user_email: u.email,
            event_title: e.title,
            event_date: e.event_date,
            payment_status: p.status,
            transaction_ref: p.transaction_ref,
            ticket_ref: t ? t.ticket_ref : null
          };
        });
      return [sorted.slice(offset, offset + limit), []];
    }
    if (lower.startsWith('insert into events')) {
      const [title, description, category, event_date, event_time, venue, price, capacity, seats_available, image_url] = params;
      const newEvent = {
        id: this.nextEventId++,
        title,
        description,
        category,
        event_date,
        event_time,
        venue,
        price: parseFloat(price),
        capacity: parseInt(capacity),
        seats_available: parseInt(seats_available),
        image_url,
        is_active: 1,
        created_at: new Date()
      };
      this.events.unshift(newEvent);
      return [{ insertId: newEvent.id, affectedRows: 1 }, []];
    }
    if (lower.startsWith('update events set is_active = 0 where id = ?')) {
      const id = parseInt(params[0]);
      const ev = this.events.find(e => e.id === id);
      if (ev) ev.is_active = 0;
      return [{ affectedRows: ev ? 1 : 0 }, []];
    }
    if (lower.startsWith('update events set')) {
      const id = parseInt(params[params.length - 1]);
      const ev = this.events.find(e => e.id === id);
      if (ev) {
        // extract field updates
        const setClause = s.substring(s.indexOf('SET ') + 4, s.indexOf(' WHERE'));
        const fields = setClause.split(',').map(f => f.trim().split(' =')[0]);
        for (let i = 0; i < fields.length; i++) {
          ev[fields[i]] = params[i];
        }
        return [{ affectedRows: 1 }, []];
      }
      return [{ affectedRows: 0 }, []];
    }

    console.warn('[MockDB] Unhandled SQL query:', sql, params);
    return [[], []];
  }

  async getConnection() {
    const self = this;
    return {
      async beginTransaction() {},
      async commit() {},
      async rollback() {},
      async execute(sql, params) {
        return self.execute(sql, params);
      },
      release() {}
    };
  }
}

module.exports = new MockDatabase();

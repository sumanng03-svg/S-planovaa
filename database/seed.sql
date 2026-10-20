-- PLANOVA Seed Data
-- Run AFTER schema.sql
-- Admin password is: Admin@1234 (bcrypt hash below)

USE planova;

-- Admin user (password: Admin@1234)
INSERT INTO users (name, email, password_hash, role) VALUES
('PLANOVA Admin', 'admin@planova.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGGOERRss/oi4dVpI2.2kHpJa3W', 'admin'),
('Demo User', 'user@planova.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGGOERRss/oi4dVpI2.2kHpJa3W', 'user')
ON DUPLICATE KEY UPDATE id=id;

-- Sample Events
INSERT INTO events (title, description, category, event_date, event_time, venue, price, capacity, seats_available, image_url) VALUES
(
  'SoundWave Music Festival 2026',
  'Experience three days of electrifying live performances from top indie, electronic, and pop artists. SoundWave brings together 40+ artists across 5 stages in a breathtaking outdoor venue. Featuring food stalls, art installations, and after-parties that will keep the energy going all night long.',
  'Music',
  '2026-11-15',
  '18:00:00',
  'Central Park Arena, Mumbai',
  999.00,
  500,
  500,
  'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&q=80'
),
(
  'TechHorizon Conference 2026',
  'Join industry leaders, startup founders, and engineers for a full-day deep dive into AI, cloud computing, and the future of software development. Keynotes, workshops, and networking sessions with 200+ tech professionals. Gain insights, build connections, and discover tools that will accelerate your career.',
  'Technology',
  '2026-11-20',
  '09:00:00',
  'Convention Centre, Bengaluru',
  1499.00,
  300,
  300,
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80'
),
(
  'Creative Code: Full-Stack Workshop',
  'A hands-on two-day workshop where you will build a complete web application from scratch using React, Node.js, and PostgreSQL. Led by senior engineers from top product companies. Perfect for students and junior developers looking to level up their practical skills.',
  'Workshops',
  '2026-11-25',
  '10:00:00',
  'Innovation Hub, Pune',
  799.00,
  60,
  60,
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80'
),
(
  'Inter-College Hackathon 2026',
  'A 24-hour hackathon open to all college students. Solve real-world challenges in tracks including Healthcare, FinTech, EdTech, and Sustainability. Prizes worth ₹3 lakhs, mentorship from industry experts, and recruiters from 15 top companies on the lookout for talent.',
  'College Events',
  '2026-12-01',
  '08:00:00',
  'NIT Auditorium, Chennai',
  199.00,
  200,
  200,
  'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&q=80'
),
(
  'Canvas & Code: Digital Art Expo',
  'An immersive exhibition celebrating the intersection of technology and visual art. Experience generative art, interactive installations, AI-generated masterpieces, and live digital painting sessions. Artists from 12 countries showcase work that challenges the boundaries of creativity.',
  'Art',
  '2026-12-10',
  '11:00:00',
  'The Gallery, Delhi',
  349.00,
  150,
  150,
  'https://images.unsplash.com/photo-1541367777708-7905fe3296c0?w=800&q=80'
),
(
  'Annual College Sports Meet',
  'Cheer for your college at the biggest inter-college sports extravaganza of the year. Events include cricket, football, basketball, athletics, and esports. Open to participants and spectators. Come support your team and witness record-breaking performances.',
  'Sports',
  '2026-12-20',
  '07:30:00',
  'University Sports Complex, Hyderabad',
  149.00,
  1000,
  1000,
  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80'
),
(
  'Electronic Dreams: Night Concert',
  'A premium night concert featuring internationally acclaimed electronic music producers. Stunning visuals, laser shows, and an unmatched sound system create an otherworldly experience. Limited capacity for an exclusive atmosphere you will remember forever.',
  'Music',
  '2026-11-30',
  '20:00:00',
  'The Dome, Goa',
  1999.00,
  250,
  250,
  'https://images.unsplash.com/photo-1574015974293-817f0ebebb74?w=800&q=80'
),
(
  'AI & Machine Learning Bootcamp',
  'An intensive 3-day bootcamp covering Python for ML, neural networks, NLP, and deploying models to production. Includes hands-on projects, real datasets, and guidance from AI researchers. Get a verified certificate upon completion. Beginner to intermediate level.',
  'Workshops',
  '2026-12-05',
  '09:30:00',
  'Tech Park, Bengaluru',
  2499.00,
  80,
  80,
  'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80'
);

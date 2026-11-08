bookings-- PLANOVA Database Schema
-- Run this file first, then seed.sql

CREATE DATABASE IF NOT EXISTS planova CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE planova;

-- ─────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120)  NOT NULL,
  email         VARCHAR(191)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          ENUM('user','admin') NOT NULL DEFAULT 'user',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- EVENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255)  NOT NULL,
  description     TEXT          NOT NULL,
  category        ENUM('Music','Technology','Workshops','College Events','Art','Sports') NOT NULL,
  event_date      DATE          NOT NULL,
  event_time      TIME          NOT NULL,
  venue           VARCHAR(255)  NOT NULL,
  price           DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  capacity        INT UNSIGNED  NOT NULL,
  seats_available INT UNSIGNED  NOT NULL,
  image_url       VARCHAR(500)  NULL,
  is_active       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category  (category),
  INDEX idx_event_date (event_date),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bookings (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT UNSIGNED  NOT NULL,
  event_id     INT UNSIGNED  NOT NULL,
  quantity     INT UNSIGNED  NOT NULL DEFAULT 1,
  unit_price   DECIMAL(10,2) NOT NULL,   -- price locked at booking time
  total_amount DECIMAL(10,2) NOT NULL,
  status       ENUM('pending','confirmed','cancelled','failed') NOT NULL DEFAULT 'pending',
  created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE RESTRICT,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT,
  INDEX idx_user_id  (user_id),
  INDEX idx_event_id (event_id),
  INDEX idx_status   (status)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- PAYMENTS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id      INT UNSIGNED  NOT NULL UNIQUE,   -- one payment per booking
  amount          DECIMAL(10,2) NOT NULL,
  status          ENUM('pending','success','failed','refunded') NOT NULL DEFAULT 'pending',
  transaction_ref VARCHAR(100)  NULL UNIQUE,       -- gateway reference / demo ref
  gateway         VARCHAR(50)   NOT NULL DEFAULT 'demo',
  paid_at         DATETIME      NULL,
  created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
  INDEX idx_booking_id     (booking_id),
  INDEX idx_transaction_ref (transaction_ref)
) ENGINE=InnoDB;

-- ─────────────────────────────────────────
-- TICKETS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tickets (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id  INT UNSIGNED  NOT NULL UNIQUE,       -- one ticket per confirmed booking
  ticket_ref  CHAR(36)      NOT NULL UNIQUE,        -- UUID v4
  qr_data     VARCHAR(500)  NOT NULL,               -- verification URL stored in QR
  issued_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
  INDEX idx_ticket_ref (ticket_ref)
) ENGINE=InnoDB;

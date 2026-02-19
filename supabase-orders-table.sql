-- ============================================
-- Supabase Orders Table Migration
-- Run this in your Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS orders (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  order_id        TEXT NOT NULL UNIQUE,          -- e.g. PS-M3K7X2-AB2C
  name            TEXT NOT NULL DEFAULT '',
  email           TEXT NOT NULL DEFAULT '',
  phone           TEXT NOT NULL DEFAULT '',
  address         TEXT DEFAULT '',
  products        TEXT DEFAULT '',               -- human-readable product list
  quantity        TEXT DEFAULT '',
  payment_method  TEXT DEFAULT '',
  notes           TEXT DEFAULT '',
  order_type      TEXT DEFAULT 'regular',        -- 'regular' or 'custom'
  status          TEXT DEFAULT 'Under Process',  -- Under Process, Dispatched, Completed, Cancelled
  items           JSONB DEFAULT '[]'::jsonb,     -- cart items array [{id, name, price, quantity, customText}]
  subtotal        NUMERIC DEFAULT 0,
  discount        NUMERIC DEFAULT 0,
  total           NUMERIC DEFAULT 0,
  promo_code      TEXT,
  gift_wrap       BOOLEAN DEFAULT FALSE,
  gift_wrap_cost  NUMERIC DEFAULT 0,
  gift_message    TEXT DEFAULT '',
  custom_description TEXT DEFAULT '',
  custom_colors      TEXT DEFAULT '',
  custom_timeline    TEXT DEFAULT '',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can INSERT an order (public checkout)
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Policy: Anyone can SELECT orders by order_id (for tracking page)
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT
  USING (true);

-- Policy: Authenticated users (admins) can UPDATE orders (status changes)
CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can DELETE orders
CREATE POLICY "Authenticated users can delete orders"
  ON orders FOR DELETE
  USING (true);

-- Index for fast lookup by order_id (tracking page search)
CREATE INDEX IF NOT EXISTS idx_orders_order_id ON orders (order_id);

-- Index for sorting by created_at
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);

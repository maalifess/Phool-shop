-- Performance optimization indexes for Phool Shop
-- Run this in Supabase SQL Editor

-- Products table indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_products_id ON products(id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- Reviews table indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(approved);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at);

-- Composite index for approved reviews by product (most common query)
CREATE INDEX IF NOT EXISTS idx_reviews_product_approved ON reviews(product_id, approved);

-- Cards table indexes
CREATE INDEX IF NOT EXISTS idx_cards_id ON cards(id);
CREATE INDEX IF NOT EXISTS idx_cards_category ON cards(category);

-- Fundraisers table indexes
CREATE INDEX IF NOT EXISTS idx_fundraisers_id ON fundraisers(id);
CREATE INDEX IF NOT EXISTS idx_fundraisers_product_id ON fundraisers(product_id);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_id ON orders(id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Analyze tables to update query planner statistics
ANALYZE products;
ANALYZE reviews;
ANALYZE cards;
ANALYZE fundraisers;
ANALYZE orders;

COMMENT ON INDEX idx_products_id IS 'Primary lookup for product details';
COMMENT ON INDEX idx_reviews_product_approved IS 'Optimized query for approved reviews by product';

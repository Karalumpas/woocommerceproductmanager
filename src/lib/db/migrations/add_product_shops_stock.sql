-- Add stock columns to product_shops
ALTER TABLE product_shops ADD COLUMN IF NOT EXISTS stock_quantity INTEGER;
ALTER TABLE product_shops ADD COLUMN IF NOT EXISTS stock_status VARCHAR(20) DEFAULT 'instock';

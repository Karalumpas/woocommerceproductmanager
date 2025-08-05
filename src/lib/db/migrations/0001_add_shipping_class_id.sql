ALTER TABLE products   ADD COLUMN IF NOT EXISTS shipping_class_id INTEGER;
ALTER TABLE variations ADD COLUMN IF NOT EXISTS shipping_class_id INTEGER;


-- Add additional missing columns to the products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS permalink varchar(500);
ALTER TABLE products ADD COLUMN IF NOT EXISTS downloads jsonb;

-- For variations table, add missing columns
ALTER TABLE variations ADD COLUMN IF NOT EXISTS downloads jsonb;

-- This handles any issues with the shipping_class_id column that was causing errors
-- First check if it exists (it was in the schema but not in the DB)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'products' AND column_name = 'shipping_class_id'
    ) THEN
        -- If it exists, leave it alone
        RAISE NOTICE 'shipping_class_id column already exists';
    ELSE
        -- If not, create it
        ALTER TABLE products ADD COLUMN shipping_class_id INTEGER;
        RAISE NOTICE 'Added shipping_class_id column to products table';
    END IF;
END$$;

-- Do the same for variations table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'variations' AND column_name = 'shipping_class_id'
    ) THEN
        -- If it exists, leave it alone
        RAISE NOTICE 'shipping_class_id column already exists in variations';
    ELSE
        -- If not, create it
        ALTER TABLE variations ADD COLUMN shipping_class_id INTEGER;
        RAISE NOTICE 'Added shipping_class_id column to variations table';
    END IF;
END$$;

-- Create missing master_products table if it doesn't exist
CREATE TABLE IF NOT EXISTS master_products (
    id SERIAL PRIMARY KEY NOT NULL,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for master_products if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'master_products_sku_idx'
    ) THEN
        CREATE UNIQUE INDEX master_products_sku_idx ON master_products(sku);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'master_products_name_idx'
    ) THEN
        CREATE INDEX master_products_name_idx ON master_products(name);
    END IF;
END$$;

-- Create missing product_shops table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_shops (
    id SERIAL PRIMARY KEY NOT NULL,
    master_product_id INTEGER NOT NULL REFERENCES master_products(id) ON DELETE CASCADE,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    price DECIMAL(10, 2),
    category VARCHAR(255),
    stock_quantity INTEGER,
    stock_status VARCHAR(20) DEFAULT 'instock',
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for product_shops if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'product_shops_master_shop_idx'
    ) THEN
        CREATE UNIQUE INDEX product_shops_master_shop_idx ON product_shops(master_product_id, shop_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'product_shops_shop_idx'
    ) THEN
        CREATE INDEX product_shops_shop_idx ON product_shops(shop_id);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'product_shops_category_idx'
    ) THEN
        CREATE INDEX product_shops_category_idx ON product_shops(category);
    END IF;
END$$;

-- Create missing product_shop_variants table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_shop_variants (
    product_shop_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variation_id INTEGER NOT NULL REFERENCES variations(id) ON DELETE CASCADE,
    PRIMARY KEY (product_shop_id, variation_id)
);

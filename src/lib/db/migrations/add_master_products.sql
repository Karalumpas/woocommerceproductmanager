CREATE TABLE IF NOT EXISTS master_products (
    id SERIAL PRIMARY KEY,
    sku VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS product_shops (
    id SERIAL PRIMARY KEY,
    master_product_id INTEGER NOT NULL REFERENCES master_products(id) ON DELETE CASCADE,
    shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    price NUMERIC(10,2),
    category VARCHAR(255),
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP DEFAULT now() NOT NULL,
    updated_at TIMESTAMP DEFAULT now() NOT NULL,
    CONSTRAINT product_shops_master_shop_idx UNIQUE (master_product_id, shop_id)
);

CREATE INDEX product_shops_shop_idx ON product_shops (shop_id);
CREATE INDEX product_shops_category_idx ON product_shops (category);
CREATE UNIQUE INDEX master_products_sku_idx ON master_products (sku);
CREATE INDEX master_products_name_idx ON master_products (name);

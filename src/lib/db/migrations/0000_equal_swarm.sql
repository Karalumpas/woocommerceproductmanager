-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE IF NOT EXISTS "variations" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"woo_id" integer NOT NULL,
	"woo_parent_id" integer NOT NULL,
	"sku" varchar(100),
	"status" varchar(20) DEFAULT 'publish'::character varying,
	"description" text,
	"price" numeric(10, 2),
	"regular_price" numeric(10, 2),
	"sale_price" numeric(10, 2),
	"stock_quantity" integer,
	"stock_status" varchar(20) DEFAULT 'instock'::character varying,
	"manage_stock" boolean DEFAULT false,
	"weight" varchar(20),
	"dimensions" jsonb,
	"shipping_class" varchar(100),
	"image" jsonb,
	"attributes" jsonb,
	"meta_data" jsonb,
	"date_created" timestamp,
	"date_modified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "shops" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"base_url" varchar(255) NOT NULL,
	"consumer_key" varchar(255) NOT NULL,
	"consumer_secret" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_ping" timestamp,
	"status" varchar(20) DEFAULT 'unknown'::character varying,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"woo_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"parent_id" integer,
	"description" text,
	"image" text,
	"count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"woo_id" integer NOT NULL,
	"name" varchar(500) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"type" varchar(50) DEFAULT 'simple'::character varying,
	"status" varchar(20) DEFAULT 'publish'::character varying,
	"featured" boolean DEFAULT false,
	"catalog_visibility" varchar(20) DEFAULT 'visible'::character varying,
	"description" text,
	"short_description" text,
	"sku" varchar(100),
	"price" numeric(10, 2),
	"regular_price" numeric(10, 2),
	"sale_price" numeric(10, 2),
	"stock_quantity" integer,
	"stock_status" varchar(20) DEFAULT 'instock'::character varying,
	"manage_stock" boolean DEFAULT false,
	"weight" varchar(20),
	"dimensions" jsonb,
	"shipping_class" varchar(100),
	"categories" jsonb,
	"tags" jsonb,
	"images" jsonb,
	"attributes" jsonb,
	"default_attributes" jsonb,
	"variations" jsonb,
	"menu_order" integer DEFAULT 0,
	"meta_data" jsonb,
	"date_created" timestamp,
	"date_modified" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"shop_id" integer NOT NULL,
	"filename" varchar(255) NOT NULL,
	"file_size" integer,
	"type" varchar(20) NOT NULL,
	"status" varchar(20) DEFAULT 'pending'::character varying,
	"total_rows" integer DEFAULT 0,
	"processed_rows" integer DEFAULT 0,
	"successful_rows" integer DEFAULT 0,
	"error_rows" integer DEFAULT 0,
	"errors" jsonb,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "import_errors" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"row_number" integer NOT NULL,
	"sku" varchar(100),
	"error_type" varchar(50) NOT NULL,
	"error_message" text NOT NULL,
	"row_data" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variations" ADD CONSTRAINT "variations_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "variations" ADD CONSTRAINT "variations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "products" ADD CONSTRAINT "products_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_batches" ADD CONSTRAINT "import_batches_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "public"."shops"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "import_errors" ADD CONSTRAINT "import_errors_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "public"."import_batches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variations_attributes_idx" ON "variations" USING gin ("attributes" jsonb_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variations_product_idx" ON "variations" USING btree ("product_id" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "variations_shop_woo_idx" ON "variations" USING btree ("shop_id" int4_ops,"woo_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variations_sku_idx" ON "variations" USING btree ("sku" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variations_status_idx" ON "variations" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "variations_stock_status_idx" ON "variations" USING btree ("stock_status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shops_base_url_idx" ON "shops" USING btree ("base_url" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "shops_status_idx" ON "shops" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_name_idx" ON "product_categories" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "categories_shop_woo_idx" ON "product_categories" USING btree ("shop_id" int4_ops,"woo_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "categories_slug_idx" ON "product_categories" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_attributes_idx" ON "products" USING gin ("attributes" jsonb_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_categories_idx" ON "products" USING gin ("categories" jsonb_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_name_idx" ON "products" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "products_shop_woo_idx" ON "products" USING btree ("shop_id" int4_ops,"woo_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_sku_idx" ON "products" USING btree ("sku" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_status_idx" ON "products" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_stock_status_idx" ON "products" USING btree ("stock_status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "products_type_idx" ON "products" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batches_created_at_idx" ON "import_batches" USING btree ("created_at" timestamp_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batches_shop_idx" ON "import_batches" USING btree ("shop_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batches_status_idx" ON "import_batches" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_batches_type_idx" ON "import_batches" USING btree ("type" text_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_errors_batch_idx" ON "import_errors" USING btree ("batch_id" int4_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "import_errors_type_idx" ON "import_errors" USING btree ("error_type" text_ops);
*/
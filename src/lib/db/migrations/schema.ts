import { pgTable, index, uniqueIndex, foreignKey, serial, integer, varchar, text, numeric, boolean, jsonb, timestamp } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"



export const variations = pgTable("variations", {
	id: serial("id").primaryKey().notNull(),
	shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" } ),
	productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" } ),
	wooId: integer("woo_id").notNull(),
	wooParentId: integer("woo_parent_id").notNull(),
	sku: varchar("sku", { length: 100 }),
	status: varchar("status", { length: 20 }).default('publish'::character varying),
	description: text("description"),
	price: numeric("price", { precision: 10, scale:  2 }),
	regularPrice: numeric("regular_price", { precision: 10, scale:  2 }),
	salePrice: numeric("sale_price", { precision: 10, scale:  2 }),
	stockQuantity: integer("stock_quantity"),
	stockStatus: varchar("stock_status", { length: 20 }).default('instock'::character varying),
	manageStock: boolean("manage_stock").default(false),
	weight: varchar("weight", { length: 20 }),
	dimensions: jsonb("dimensions"),
	shippingClass: varchar("shipping_class", { length: 100 }),
	image: jsonb("image"),
	attributes: jsonb("attributes"),
	metaData: jsonb("meta_data"),
	dateCreated: timestamp("date_created", { mode: 'string' }),
	dateModified: timestamp("date_modified", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		attributesIdx: index("variations_attributes_idx").using("gin", table.attributes),
		productIdx: index("variations_product_idx").using("btree", table.productId),
		shopWooIdx: uniqueIndex("variations_shop_woo_idx").using("btree", table.shopId, table.wooId),
		skuIdx: index("variations_sku_idx").using("btree", table.sku),
		statusIdx: index("variations_status_idx").using("btree", table.status),
		stockStatusIdx: index("variations_stock_status_idx").using("btree", table.stockStatus),
	}
});

export const shops = pgTable("shops", {
	id: serial("id").primaryKey().notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	baseUrl: varchar("base_url", { length: 255 }).notNull(),
	consumerKey: varchar("consumer_key", { length: 255 }).notNull(),
	consumerSecret: varchar("consumer_secret", { length: 255 }).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastPing: timestamp("last_ping", { mode: 'string' }),
	status: varchar("status", { length: 20 }).default('unknown'::character varying),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		baseUrlIdx: index("shops_base_url_idx").using("btree", table.baseUrl),
		statusIdx: index("shops_status_idx").using("btree", table.status),
	}
});

export const productCategories = pgTable("product_categories", {
	id: serial("id").primaryKey().notNull(),
	shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" } ),
	wooId: integer("woo_id").notNull(),
	name: varchar("name", { length: 255 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull(),
	parentId: integer("parent_id"),
	description: text("description"),
	image: text("image"),
	count: integer("count").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		categoriesNameIdx: index("categories_name_idx").using("btree", table.name),
		categoriesShopWooIdx: uniqueIndex("categories_shop_woo_idx").using("btree", table.shopId, table.wooId),
		categoriesSlugIdx: index("categories_slug_idx").using("btree", table.slug),
	}
});

export const products = pgTable("products", {
	id: serial("id").primaryKey().notNull(),
	shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" } ),
	wooId: integer("woo_id").notNull(),
	name: varchar("name", { length: 500 }).notNull(),
	slug: varchar("slug", { length: 255 }).notNull(),
	type: varchar("type", { length: 50 }).default('simple'::character varying),
	status: varchar("status", { length: 20 }).default('publish'::character varying),
	featured: boolean("featured").default(false),
	catalogVisibility: varchar("catalog_visibility", { length: 20 }).default('visible'::character varying),
	description: text("description"),
	shortDescription: text("short_description"),
	sku: varchar("sku", { length: 100 }),
	price: numeric("price", { precision: 10, scale:  2 }),
	regularPrice: numeric("regular_price", { precision: 10, scale:  2 }),
	salePrice: numeric("sale_price", { precision: 10, scale:  2 }),
	stockQuantity: integer("stock_quantity"),
	stockStatus: varchar("stock_status", { length: 20 }).default('instock'::character varying),
	manageStock: boolean("manage_stock").default(false),
	weight: varchar("weight", { length: 20 }),
	dimensions: jsonb("dimensions"),
	shippingClass: varchar("shipping_class", { length: 100 }),
	categories: jsonb("categories"),
	tags: jsonb("tags"),
	images: jsonb("images"),
	attributes: jsonb("attributes"),
	defaultAttributes: jsonb("default_attributes"),
	variations: jsonb("variations"),
	menuOrder: integer("menu_order").default(0),
	metaData: jsonb("meta_data"),
	dateCreated: timestamp("date_created", { mode: 'string' }),
	dateModified: timestamp("date_modified", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		attributesIdx: index("products_attributes_idx").using("gin", table.attributes),
		categoriesIdx: index("products_categories_idx").using("gin", table.categories),
		nameIdx: index("products_name_idx").using("btree", table.name),
		shopWooIdx: uniqueIndex("products_shop_woo_idx").using("btree", table.shopId, table.wooId),
		skuIdx: index("products_sku_idx").using("btree", table.sku),
		statusIdx: index("products_status_idx").using("btree", table.status),
		stockStatusIdx: index("products_stock_status_idx").using("btree", table.stockStatus),
		typeIdx: index("products_type_idx").using("btree", table.type),
	}
});

export const importBatches = pgTable("import_batches", {
	id: serial("id").primaryKey().notNull(),
	shopId: integer("shop_id").notNull().references(() => shops.id, { onDelete: "cascade" } ),
	filename: varchar("filename", { length: 255 }).notNull(),
	fileSize: integer("file_size"),
	type: varchar("type", { length: 20 }).notNull(),
	status: varchar("status", { length: 20 }).default('pending'::character varying),
	totalRows: integer("total_rows").default(0),
	processedRows: integer("processed_rows").default(0),
	successfulRows: integer("successful_rows").default(0),
	errorRows: integer("error_rows").default(0),
	errors: jsonb("errors"),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		createdAtIdx: index("import_batches_created_at_idx").using("btree", table.createdAt),
		shopIdx: index("import_batches_shop_idx").using("btree", table.shopId),
		statusIdx: index("import_batches_status_idx").using("btree", table.status),
		typeIdx: index("import_batches_type_idx").using("btree", table.type),
	}
});

export const importErrors = pgTable("import_errors", {
	id: serial("id").primaryKey().notNull(),
	batchId: integer("batch_id").notNull().references(() => importBatches.id, { onDelete: "cascade" } ),
	rowNumber: integer("row_number").notNull(),
	sku: varchar("sku", { length: 100 }),
	errorType: varchar("error_type", { length: 50 }).notNull(),
	errorMessage: text("error_message").notNull(),
	rowData: jsonb("row_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		batchIdx: index("import_errors_batch_idx").using("btree", table.batchId),
		typeIdx: index("import_errors_type_idx").using("btree", table.errorType),
	}
});
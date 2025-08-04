import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * WooCommerce shop connections
 */
export const shops = pgTable(
  'shops',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    baseUrl: varchar('base_url', { length: 255 }).notNull(),
    consumerKey: varchar('consumer_key', { length: 255 }).notNull(),
    consumerSecret: varchar('consumer_secret', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastPing: timestamp('last_ping'),
    status: varchar('status', { length: 20 }).default('unknown'), // 'online', 'offline', 'error'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    baseUrlIdx: index('shops_base_url_idx').on(table.baseUrl),
    statusIdx: index('shops_status_idx').on(table.status),
  })
)

/**
 * Product categories
 */
export const productCategories = pgTable(
  'product_categories',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id').references(() => shops.id, { onDelete: 'cascade' }).notNull(),
    wooId: integer('woo_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    parentId: integer('parent_id'),
    description: text('description'),
    image: text('image'),
    count: integer('count').default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    shopWooIdx: uniqueIndex('categories_shop_woo_idx').on(table.shopId, table.wooId),
    nameIdx: index('categories_name_idx').on(table.name),
    slugIdx: index('categories_slug_idx').on(table.slug),
  })
)

/**
 * Products (parent products)
 */
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id').references(() => shops.id, { onDelete: 'cascade' }).notNull(),
    wooId: integer('woo_id').notNull(),
    name: varchar('name', { length: 500 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).default('simple'), // 'simple', 'variable', 'grouped'
    status: varchar('status', { length: 20 }).default('publish'), // 'publish', 'draft', 'private'
    featured: boolean('featured').default(false),
    catalogVisibility: varchar('catalog_visibility', { length: 20 }).default('visible'),
    description: text('description'),
    shortDescription: text('short_description'),
    sku: varchar('sku', { length: 100 }),
    price: decimal('price', { precision: 10, scale: 2 }),
    regularPrice: decimal('regular_price', { precision: 10, scale: 2 }),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    stockQuantity: integer('stock_quantity'),
    stockStatus: varchar('stock_status', { length: 20 }).default('instock'), // 'instock', 'outofstock', 'onbackorder'
    manageStock: boolean('manage_stock').default(false),
    weight: varchar('weight', { length: 20 }),
    dimensions: jsonb('dimensions'), // {length, width, height}
    shippingClass: varchar('shipping_class', { length: 100 }),
    categories: jsonb('categories'), // Array of category IDs
    tags: jsonb('tags'), // Array of tag names
    images: jsonb('images'), // Array of image objects
    attributes: jsonb('attributes'), // Product attributes
    defaultAttributes: jsonb('default_attributes'), // Default variation attributes
    variations: jsonb('variations'), // Array of variation IDs
    menuOrder: integer('menu_order').default(0),
    metaData: jsonb('meta_data'), // Additional WooCommerce meta
    dateCreated: timestamp('date_created'),
    dateModified: timestamp('date_modified'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    shopWooIdx: uniqueIndex('products_shop_woo_idx').on(table.shopId, table.wooId),
    skuIdx: index('products_sku_idx').on(table.sku),
    nameIdx: index('products_name_idx').on(table.name),
    statusIdx: index('products_status_idx').on(table.status),
    stockStatusIdx: index('products_stock_status_idx').on(table.stockStatus),
    typeIdx: index('products_type_idx').on(table.type),
    categoriesIdx: index('products_categories_idx').using('gin', table.categories),
    attributesIdx: index('products_attributes_idx').using('gin', table.attributes),
  })
)

/**
 * Product variations
 */
export const variations = pgTable(
  'variations',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id').references(() => shops.id, { onDelete: 'cascade' }).notNull(),
    productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
    wooId: integer('woo_id').notNull(),
    wooParentId: integer('woo_parent_id').notNull(),
    sku: varchar('sku', { length: 100 }),
    status: varchar('status', { length: 20 }).default('publish'),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }),
    regularPrice: decimal('regular_price', { precision: 10, scale: 2 }),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    stockQuantity: integer('stock_quantity'),
    stockStatus: varchar('stock_status', { length: 20 }).default('instock'),
    manageStock: boolean('manage_stock').default(false),
    weight: varchar('weight', { length: 20 }),
    dimensions: jsonb('dimensions'),
    shippingClass: varchar('shipping_class', { length: 100 }),
    image: jsonb('image'), // Single image object
    attributes: jsonb('attributes'), // Variation attributes (color, size, etc.)
    metaData: jsonb('meta_data'),
    dateCreated: timestamp('date_created'),
    dateModified: timestamp('date_modified'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    shopWooIdx: uniqueIndex('variations_shop_woo_idx').on(table.shopId, table.wooId),
    productIdx: index('variations_product_idx').on(table.productId),
    skuIdx: index('variations_sku_idx').on(table.sku),
    statusIdx: index('variations_status_idx').on(table.status),
    stockStatusIdx: index('variations_stock_status_idx').on(table.stockStatus),
    attributesIdx: index('variations_attributes_idx').using('gin', table.attributes),
  })
)

/**
 * Import batches for tracking CSV imports
 */
export const importBatches = pgTable(
  'import_batches',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id').references(() => shops.id, { onDelete: 'cascade' }).notNull(),
    filename: varchar('filename', { length: 255 }).notNull(),
    fileSize: integer('file_size'),
    type: varchar('type', { length: 20 }).notNull(), // 'parent', 'variations'
    status: varchar('status', { length: 20 }).default('pending'), // 'pending', 'processing', 'completed', 'failed'
    totalRows: integer('total_rows').default(0),
    processedRows: integer('processed_rows').default(0),
    successfulRows: integer('successful_rows').default(0),
    errorRows: integer('error_rows').default(0),
    errors: jsonb('errors'), // Array of error objects
    startedAt: timestamp('started_at'),
    completedAt: timestamp('completed_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    shopIdx: index('import_batches_shop_idx').on(table.shopId),
    statusIdx: index('import_batches_status_idx').on(table.status),
    typeIdx: index('import_batches_type_idx').on(table.type),
    createdAtIdx: index('import_batches_created_at_idx').on(table.createdAt),
  })
)

/**
 * Import errors for detailed error tracking
 */
export const importErrors = pgTable(
  'import_errors',
  {
    id: serial('id').primaryKey(),
    batchId: integer('batch_id').references(() => importBatches.id, { onDelete: 'cascade' }).notNull(),
    rowNumber: integer('row_number').notNull(),
    sku: varchar('sku', { length: 100 }),
    errorType: varchar('error_type', { length: 50 }).notNull(), // 'validation', 'woocommerce', 'network'
    errorMessage: text('error_message').notNull(),
    rowData: jsonb('row_data'), // Original CSV row data
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    batchIdx: index('import_errors_batch_idx').on(table.batchId),
    errorTypeIdx: index('import_errors_type_idx').on(table.errorType),
  })
)

// Relations
export const shopsRelations = relations(shops, ({ many }) => ({
  products: many(products),
  variations: many(variations),
  categories: many(productCategories),
  importBatches: many(importBatches),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  shop: one(shops, {
    fields: [products.shopId],
    references: [shops.id],
  }),
  variations: many(variations),
}))

export const variationsRelations = relations(variations, ({ one }) => ({
  shop: one(shops, {
    fields: [variations.shopId],
    references: [shops.id],
  }),
  product: one(products, {
    fields: [variations.productId],
    references: [products.id],
  }),
}))

export const productCategoriesRelations = relations(productCategories, ({ one }) => ({
  shop: one(shops, {
    fields: [productCategories.shopId],
    references: [shops.id],
  }),
}))

export const importBatchesRelations = relations(importBatches, ({ one, many }) => ({
  shop: one(shops, {
    fields: [importBatches.shopId],
    references: [shops.id],
  }),
  errors: many(importErrors),
}))

export const importErrorsRelations = relations(importErrors, ({ one }) => ({
  batch: one(importBatches, {
    fields: [importErrors.batchId],
    references: [importBatches.id],
  }),
}))

// Types
export type Shop = typeof shops.$inferSelect
export type NewShop = typeof shops.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Variation = typeof variations.$inferSelect
export type NewVariation = typeof variations.$inferInsert
export type ProductCategory = typeof productCategories.$inferSelect
export type NewProductCategory = typeof productCategories.$inferInsert
export type ImportBatch = typeof importBatches.$inferSelect
export type NewImportBatch = typeof importBatches.$inferInsert
export type ImportError = typeof importErrors.$inferSelect
export type NewImportError = typeof importErrors.$inferInsert

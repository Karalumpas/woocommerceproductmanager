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
  primaryKey,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/**
 * Users for authentication
 */
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    username: varchar('username', { length: 100 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    autoSync: boolean('auto_sync').default(true).notNull(), // Auto sync products on login
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
  })
)

/**
 * User sessions for authentication
 */
export const sessions = pgTable(
  'sessions',
  {
    id: varchar('id', { length: 255 }).primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('sessions_user_id_idx').on(table.userId),
    expiresAtIdx: index('sessions_expires_at_idx').on(table.expiresAt),
  })
)

/**
 * WooCommerce shop connections
 */
export const shops = pgTable(
  'shops',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    baseUrl: varchar('base_url', { length: 255 }).notNull(),
    consumerKey: varchar('consumer_key', { length: 255 }).notNull(),
    consumerSecret: varchar('consumer_secret', { length: 255 }).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    isDefault: boolean('is_default').default(false).notNull(),
    lastPing: timestamp('last_ping'),
    status: varchar('status', { length: 20 }).default('unknown'), // 'online', 'offline', 'error'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('shops_user_id_idx').on(table.userId),
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
 * Products table
 */
export const products = pgTable(
  'products',
  {
    id: serial('id').primaryKey(),
    shopId: integer('shop_id').references(() => shops.id, { onDelete: 'cascade' }).notNull(),
    wooId: integer('woo_id').notNull(),
    sku: varchar('sku', { length: 100 }),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).default('simple'), // 'simple', 'variable', 'grouped', 'external'
    status: varchar('status', { length: 20 }).default('publish'), // 'draft', 'pending', 'private', 'publish'
    featured: boolean('featured').default(false),
    catalogVisibility: varchar('catalog_visibility', { length: 20 }).default('visible'), // 'visible', 'catalog', 'search', 'hidden'
    description: text('description'),
    shortDescription: text('short_description'),
    price: decimal('price', { precision: 10, scale: 2 }),
    regularPrice: decimal('regular_price', { precision: 10, scale: 2 }),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    onSale: boolean('on_sale').default(false),
    purchasable: boolean('purchasable').default(true),
    totalSales: integer('total_sales').default(0),
    virtual: boolean('virtual').default(false),
    downloadable: boolean('downloadable').default(false),
    downloadLimit: integer('download_limit'),
    downloadExpiry: integer('download_expiry'),
    externalUrl: text('external_url'),
    buttonText: varchar('button_text', { length: 100 }),
    taxStatus: varchar('tax_status', { length: 20 }).default('taxable'), // 'taxable', 'shipping', 'none'
    taxClass: varchar('tax_class', { length: 50 }),
    manageStock: boolean('manage_stock').default(false),
    stockQuantity: integer('stock_quantity'),
    stockStatus: varchar('stock_status', { length: 20 }).default('instock'), // 'instock', 'outofstock', 'onbackorder'
    backorders: varchar('backorders', { length: 20 }).default('no'), // 'no', 'notify', 'yes'
    backordersAllowed: boolean('backorders_allowed').default(false),
    backordered: boolean('backordered').default(false),
    lowStockAmount: integer('low_stock_amount'),
    soldIndividually: boolean('sold_individually').default(false),
    weight: decimal('weight', { precision: 8, scale: 2 }),
    length: decimal('length', { precision: 8, scale: 2 }),
    width: decimal('width', { precision: 8, scale: 2 }),
    height: decimal('height', { precision: 8, scale: 2 }),
    shippingRequired: boolean('shipping_required').default(true),
    shippingTaxable: boolean('shipping_taxable').default(true),
    shippingClass: varchar('shipping_class', { length: 100 }),
    shippingClassId: integer('shipping_class_id'),
    reviewsAllowed: boolean('reviews_allowed').default(true),
    averageRating: decimal('average_rating', { precision: 3, scale: 2 }).default('0'),
    ratingCount: integer('rating_count').default(0),
    relatedIds: jsonb('related_ids'), // Array of product IDs
    upsellIds: jsonb('upsell_ids'), // Array of product IDs
    crossSellIds: jsonb('cross_sell_ids'), // Array of product IDs
    parentId: integer('parent_id'),
    purchaseNote: text('purchase_note'),
    categories: jsonb('categories'), // Array of category objects
    tags: jsonb('tags'), // Array of tag objects
    images: jsonb('images'), // Array of image objects
    attributes: jsonb('attributes'), // Array of attribute objects
    defaultAttributes: jsonb('default_attributes'), // Array of default attribute objects
    variations: jsonb('variations'), // Array of variation IDs
    groupedProducts: jsonb('grouped_products'), // Array of product IDs
    menuOrder: integer('menu_order').default(0),
    metaData: jsonb('meta_data'), // Array of meta data objects
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    dateCreated: timestamp('date_created'),
    dateModified: timestamp('date_modified'),
    dateOnSaleFrom: timestamp('date_on_sale_from'),
    dateOnSaleTo: timestamp('date_on_sale_to'),
  },
  (table) => ({
    shopWooIdx: uniqueIndex('products_shop_woo_idx').on(table.shopId, table.wooId),
    skuIdx: index('products_sku_idx').on(table.sku),
    nameIdx: index('products_name_idx').on(table.name),
    typeIdx: index('products_type_idx').on(table.type),
    statusIdx: index('products_status_idx').on(table.status),
    priceIdx: index('products_price_idx').on(table.price),
    stockStatusIdx: index('products_stock_status_idx').on(table.stockStatus),
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
    name: varchar('name', { length: 255 }),
    slug: varchar('slug', { length: 255 }),
    sku: varchar('sku', { length: 100 }),
    status: varchar('status', { length: 20 }).default('publish'),
    description: text('description'),
    price: decimal('price', { precision: 10, scale: 2 }),
    regularPrice: decimal('regular_price', { precision: 10, scale: 2 }),
    salePrice: decimal('sale_price', { precision: 10, scale: 2 }),
    onSale: boolean('on_sale').default(false),
    purchasable: boolean('purchasable').default(true),
    virtual: boolean('virtual').default(false),
    downloadable: boolean('downloadable').default(false),
    downloadLimit: integer('download_limit'),
    downloadExpiry: integer('download_expiry'),
    taxStatus: varchar('tax_status', { length: 20 }).default('taxable'),
    taxClass: varchar('tax_class', { length: 50 }),
    manageStock: boolean('manage_stock').default(false),
    stockQuantity: integer('stock_quantity'),
    stockStatus: varchar('stock_status', { length: 20 }).default('instock'),
    backorders: varchar('backorders', { length: 20 }).default('no'),
    backordersAllowed: boolean('backorders_allowed').default(false),
    backordered: boolean('backordered').default(false),
    weight: decimal('weight', { precision: 8, scale: 2 }),
    dimensions: jsonb('dimensions'), // Dimensions object
    length: decimal('length', { precision: 8, scale: 2 }),
    width: decimal('width', { precision: 8, scale: 2 }),
    height: decimal('height', { precision: 8, scale: 2 }),
    shippingClass: varchar('shipping_class', { length: 100 }),
    shippingClassId: integer('shipping_class_id'),
    image: jsonb('image'), // Image object
    attributes: jsonb('attributes'), // Array of attribute objects
    menuOrder: integer('menu_order').default(0),
    metaData: jsonb('meta_data'), // Array of meta data objects
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    dateCreated: timestamp('date_created'),
    dateModified: timestamp('date_modified'),
    dateOnSaleFrom: timestamp('date_on_sale_from'),
    dateOnSaleTo: timestamp('date_on_sale_to'),
  },
  (table) => ({
    shopWooIdx: uniqueIndex('variations_shop_woo_idx').on(table.shopId, table.wooId),
    productIdIdx: index('variations_product_id_idx').on(table.productId),
    skuIdx: index('variations_sku_idx').on(table.sku),
    statusIdx: index('variations_status_idx').on(table.status),
    priceIdx: index('variations_price_idx').on(table.price),
    stockStatusIdx: index('variations_stock_status_idx').on(table.stockStatus),
  })
)

/**
 * Selected product variations for shop transfers
 */
export const productShopVariants = pgTable(
  'product_shop_variants',
  {
    productShopId: integer('product_shop_id')
      .references(() => products.id, { onDelete: 'cascade' })
      .notNull(),
    variationId: integer('variation_id')
      .references(() => variations.id, { onDelete: 'cascade' })
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productShopId, table.variationId] }),
  })
)

/**
 * CSV import batches for tracking bulk operations
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
export const usersRelations = relations(users, ({ many }) => ({
  shops: many(shops),
  sessions: many(sessions),
}))

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}))

export const shopsRelations = relations(shops, ({ one, many }) => ({
  user: one(users, {
    fields: [shops.userId],
    references: [users.id],
  }),
  products: many(products),
  categories: many(productCategories),
  variations: many(variations),
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

export const productShopVariantsRelations = relations(productShopVariants, ({ one }) => ({
  product: one(products, {
    fields: [productShopVariants.productShopId],
    references: [products.id],
  }),
  variation: one(variations, {
    fields: [productShopVariants.variationId],
    references: [variations.id],
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
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type Shop = typeof shops.$inferSelect
export type NewShop = typeof shops.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type Variation = typeof variations.$inferSelect
export type NewVariation = typeof variations.$inferInsert
export type ProductShopVariant = typeof productShopVariants.$inferSelect
export type NewProductShopVariant = typeof productShopVariants.$inferInsert
export type ProductCategory = typeof productCategories.$inferSelect
export type NewProductCategory = typeof productCategories.$inferInsert
export type ImportBatch = typeof importBatches.$inferSelect
export type NewImportBatch = typeof importBatches.$inferInsert
export type ImportError = typeof importErrors.$inferSelect
export type NewImportError = typeof importErrors.$inferInsert

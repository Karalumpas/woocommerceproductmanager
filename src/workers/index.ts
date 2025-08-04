import { Worker, Queue } from 'bullmq'
import Redis from 'ioredis'
import { db } from '../lib/db'
import { importBatches, importErrors, products, variations, shops } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import Papa from 'papaparse'
import { readFile } from 'fs/promises'
import { WooCommerceClient } from '../lib/woocommerce'
import type { WooProduct, WooVariation } from '../lib/woocommerce'

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
})

// Job queues
export const csvImportQueue = new Queue('csv-import', { connection: redis })

interface CSVImportJob {
  batchId: number
  shopId: number
  filePath: string
  type: 'parent' | 'variations'
}

interface ProductRow {
  post_title?: string
  post_name?: string
  post_content?: string
  post_excerpt?: string
  post_status?: string
  sku?: string
  stock_status?: string
  images?: string
  tax_product_type?: string
  tax_product_cat?: string
  regular_price?: string
  [key: string]: any
}

interface VariationRow {
  parent_sku?: string
  sku?: string
  stock_status?: string
  regular_price?: string
  meta_attribute_Colour?: string
  meta_attribute_Size?: string
  images?: string
  [key: string]: any
}

/**
 * Process CSV import job
 */
async function processCsvImport(job: any) {
  const { batchId, shopId, filePath, type }: CSVImportJob = job.data
  
  console.log(`Processing CSV import job: ${batchId}, type: ${type}`)
  
  try {
    // Update batch status to processing
    await db
      .update(importBatches)
      .set({
        status: 'processing',
        startedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId))

    // Get shop details
    const [shop] = await db
      .select()
      .from(shops)
      .where(eq(shops.id, shopId))
      .limit(1)

    if (!shop) {
      throw new Error(`Shop not found: ${shopId}`)
    }

    const wooClient = new WooCommerceClient(shop)

    // Read and parse CSV file
    const csvContent = await readFile(filePath, 'utf-8')
    const parseResult = Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().replace(/"/g, ''),
    })

    if (parseResult.errors.length > 0) {
      throw new Error(`CSV parsing errors: ${parseResult.errors.map(e => e.message).join(', ')}`)
    }

    const rows = parseResult.data as any[]
    const totalRows = rows.length

    // Update total rows count
    await db
      .update(importBatches)
      .set({
        totalRows,
        updatedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId))

    let processedRows = 0
    let successfulRows = 0
    let errorRows = 0
    const errors: any[] = []

    // Process in chunks
    const chunkSize = 100
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize)
      
      if (type === 'parent') {
        await processParentProductsChunk(chunk, shop, wooClient, batchId, i, errors)
      } else {
        await processVariationsChunk(chunk, shop, wooClient, batchId, i, errors)
      }

      processedRows = Math.min(i + chunkSize, rows.length)
      successfulRows = processedRows - errors.length
      errorRows = errors.length

      // Update progress
      await db
        .update(importBatches)
        .set({
          processedRows,
          successfulRows,
          errorRows,
          updatedAt: new Date(),
        })
        .where(eq(importBatches.id, batchId))

      // Update job progress
      job.updateProgress(Math.round((processedRows / totalRows) * 100))

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Mark batch as completed
    await db
      .update(importBatches)
      .set({
        status: 'completed',
        completedAt: new Date(),
        errors: errors.length > 0 ? errors : null,
        updatedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId))

    console.log(`CSV import completed: ${successfulRows}/${totalRows} successful`)
    
  } catch (error) {
    console.error('CSV import failed:', error)
    
    // Mark batch as failed
    await db
      .update(importBatches)
      .set({
        status: 'failed',
        completedAt: new Date(),
        errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
        updatedAt: new Date(),
      })
      .where(eq(importBatches.id, batchId))

    throw error
  }
}

/**
 * Process chunk of parent products
 */
async function processParentProductsChunk(
  chunk: ProductRow[],
  shop: any,
  wooClient: WooCommerceClient,
  batchId: number,
  startIndex: number,
  errors: any[]
) {
  for (let i = 0; i < chunk.length; i++) {
    const row = chunk[i]
    const rowNumber = startIndex + i + 1

    try {
      // Validate required fields
      if (!row.sku) {
        throw new Error('SKU is required')
      }

      // Check if product already exists
      const existingProduct = await db
        .select()
        .from(products)
        .where(eq(products.sku, row.sku))
        .limit(1)

      const productData: Partial<WooProduct> = {
        name: row.post_title || '',
        slug: row.post_name || '',
        description: row.post_content || '',
        short_description: row.post_excerpt || '',
        status: (row.post_status as any) || 'publish',
        sku: row.sku,
        regular_price: row.regular_price || '',
        stock_status: (row.stock_status as any) || 'instock',
        type: (row.tax_product_type as any) || 'simple',
        categories: row.tax_product_cat ? parseCSVValues(row.tax_product_cat).map((name, idx) => ({ 
          id: idx + 1,
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        })) : [],
        images: row.images ? [{
          id: 1,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
          src: row.images,
          name: '',
          alt: ''
        }] : [],
      }

      let wooProduct: WooProduct

      if (existingProduct.length > 0) {
        // Update existing product
        wooProduct = await wooClient.updateProduct(existingProduct[0].wooId!, productData)
      } else {
        // Create new product
        wooProduct = await wooClient.createProduct(productData)
      }

      // Save to database
      await db
        .insert(products)
        .values({
          shopId: shop.id,
          wooId: wooProduct.id,
          name: wooProduct.name,
          slug: wooProduct.slug,
          type: wooProduct.type,
          status: wooProduct.status,
          sku: wooProduct.sku,
          price: wooProduct.price || null,
          regularPrice: wooProduct.regular_price || null,
          salePrice: wooProduct.sale_price || null,
          stockStatus: wooProduct.stock_status,
          description: wooProduct.description,
          shortDescription: wooProduct.short_description,
          categories: wooProduct.categories,
          images: wooProduct.images,
          attributes: wooProduct.attributes,
          variations: wooProduct.variations,
          dateCreated: new Date(wooProduct.date_created),
          dateModified: new Date(wooProduct.date_modified),
        })
        .onConflictDoUpdate({
          target: [products.shopId, products.wooId],
          set: {
            name: wooProduct.name,
            slug: wooProduct.slug,
            type: wooProduct.type,
            status: wooProduct.status,
            sku: wooProduct.sku,
            price: wooProduct.price || null,
            regularPrice: wooProduct.regular_price || null,
            salePrice: wooProduct.sale_price || null,
            stockStatus: wooProduct.stock_status,
            description: wooProduct.description,
            shortDescription: wooProduct.short_description,
            categories: wooProduct.categories,
            images: wooProduct.images,
            attributes: wooProduct.attributes,
            variations: wooProduct.variations,
            dateModified: new Date(wooProduct.date_modified),
            updatedAt: new Date(),
          },
        })

    } catch (error) {
      console.error(`Error processing row ${rowNumber}:`, error)
      
      errors.push({
        rowNumber,
        sku: row.sku,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Save error to database
      await db.insert(importErrors).values({
        batchId,
        rowNumber,
        sku: row.sku,
        errorType: 'woocommerce',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rowData: row,
      })
    }
  }
}

/**
 * Process chunk of variations
 */
async function processVariationsChunk(
  chunk: VariationRow[],
  shop: any,
  wooClient: WooCommerceClient,
  batchId: number,
  startIndex: number,
  errors: any[]
) {
  for (let i = 0; i < chunk.length; i++) {
    const row = chunk[i]
    const rowNumber = startIndex + i + 1

    try {
      // Validate required fields
      if (!row.parent_sku || !row.sku) {
        throw new Error('Parent SKU and SKU are required')
      }

      // Find parent product
      const [parentProduct] = await db
        .select()
        .from(products)
        .where(eq(products.sku, row.parent_sku))
        .limit(1)

      if (!parentProduct) {
        throw new Error(`Parent product not found: ${row.parent_sku}`)
      }

      // Check if variation already exists
      const existingVariation = await db
        .select()
        .from(variations)
        .where(eq(variations.sku, row.sku))
        .limit(1)

      const variationData: Partial<WooVariation> = {
        sku: row.sku,
        regular_price: row.regular_price || '',
        stock_status: (row.stock_status as any) || 'instock',
        attributes: [
          ...(row.meta_attribute_Colour ? [{ 
            id: 1, 
            name: 'Colour', 
            option: row.meta_attribute_Colour 
          }] : []),
          ...(row.meta_attribute_Size ? [{ 
            id: 2, 
            name: 'Size', 
            option: row.meta_attribute_Size 
          }] : []),
        ],
        image: row.images ? {
          id: 1,
          date_created: new Date().toISOString(),
          date_modified: new Date().toISOString(),
          src: row.images,
          name: '',
          alt: ''
        } : null,
      }

      let wooVariation: WooVariation

      if (existingVariation.length > 0) {
        // Update existing variation
        wooVariation = await wooClient.updateVariation(
          parentProduct.wooId!,
          existingVariation[0].wooId!,
          variationData
        )
      } else {
        // Create new variation would require WooCommerce API extension
        // For now, we'll skip creation and log an error
        throw new Error('Creating new variations not supported in this implementation')
      }

      // Save to database
      await db
        .insert(variations)
        .values({
          shopId: shop.id,
          productId: parentProduct.id,
          wooId: wooVariation.id,
          wooParentId: parentProduct.wooId!,
          sku: wooVariation.sku,
          price: wooVariation.price || null,
          regularPrice: wooVariation.regular_price || null,
          salePrice: wooVariation.sale_price || null,
          stockStatus: wooVariation.stock_status,
          attributes: wooVariation.attributes,
          image: wooVariation.image,
          dateCreated: new Date(wooVariation.date_created),
          dateModified: new Date(wooVariation.date_modified),
        })
        .onConflictDoUpdate({
          target: [variations.shopId, variations.wooId],
          set: {
            sku: wooVariation.sku,
            price: wooVariation.price || null,
            regularPrice: wooVariation.regular_price || null,
            salePrice: wooVariation.sale_price || null,
            stockStatus: wooVariation.stock_status,
            attributes: wooVariation.attributes,
            image: wooVariation.image,
            dateModified: new Date(wooVariation.date_modified),
            updatedAt: new Date(),
          },
        })

    } catch (error) {
      console.error(`Error processing variation row ${rowNumber}:`, error)
      
      errors.push({
        rowNumber,
        sku: row.sku,
        parentSku: row.parent_sku,
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      // Save error to database
      await db.insert(importErrors).values({
        batchId,
        rowNumber,
        sku: row.sku,
        errorType: 'woocommerce',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        rowData: row,
      })
    }
  }
}

/**
 * Parse CSV pipe-separated values
 */
function parseCSVValues(value: string): string[] {
  if (!value) return []
  return value.split('|').map(v => v.trim()).filter(v => v.length > 0)
}

// Create worker
const csvImportWorker = new Worker(
  'csv-import',
  processCsvImport,
  {
    connection: redis,
    concurrency: 2,
    removeOnComplete: { count: 10 },
    removeOnFail: { count: 50 },
  }
)

csvImportWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

csvImportWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

csvImportWorker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('CSV import worker started')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down worker...')
  await csvImportWorker.close()
  await redis.quit()
  process.exit(0)
})

export { csvImportWorker }

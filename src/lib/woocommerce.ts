import type { Shop } from '@/lib/db/schema'

export interface WooCommerceConfig {
  baseURL: string
  consumerKey: string
  consumerSecret: string
  version?: string
  timeout?: number
}

export interface WooProduct {
  id: number
  name: string
  slug: string
  permalink: string
  date_created: string
  date_modified: string
  type: 'simple' | 'grouped' | 'external' | 'variable'
  status: 'draft' | 'pending' | 'private' | 'publish'
  featured: boolean
  catalog_visibility: 'visible' | 'catalog' | 'search' | 'hidden'
  description: string
  short_description: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  date_on_sale_from?: string
  date_on_sale_to?: string
  price_html: string
  on_sale: boolean
  purchasable: boolean
  total_sales: number
  virtual: boolean
  downloadable: boolean
  external_url: string
  button_text: string
  tax_status: 'taxable' | 'shipping' | 'none'
  tax_class: string
  manage_stock: boolean
  stock_quantity?: number
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  backordered: boolean
  sold_individually: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_required: boolean
  shipping_taxable: boolean
  shipping_class: string
  shipping_class_id: number
  reviews_allowed: boolean
  average_rating: string
  rating_count: number
  related_ids: number[]
  upsell_ids: number[]
  cross_sell_ids: number[]
  parent_id: number
  purchase_note: string
  categories: Array<{
    id: number
    name: string
    slug: string
  }>
  tags: Array<{
    id: number
    name: string
    slug: string
  }>
  images: Array<{
    id: number
    date_created: string
    date_modified: string
    src: string
    name: string
    alt: string
  }>
  attributes: Array<{
    id: number
    name: string
    position: number
    visible: boolean
    variation: boolean
    options: string[]
  }>
  default_attributes: Array<{
    id: number
    name: string
    option: string
  }>
  variations: number[]
  grouped_products: number[]
  menu_order: number
  meta_data: Array<{
    id: number
    key: string
    value: any
  }>
}

export interface WooVariation {
  id: number
  date_created: string
  date_modified: string
  description: string
  permalink: string
  sku: string
  price: string
  regular_price: string
  sale_price: string
  date_on_sale_from?: string
  date_on_sale_to?: string
  on_sale: boolean
  status: 'draft' | 'pending' | 'private' | 'publish'
  purchasable: boolean
  virtual: boolean
  downloadable: boolean
  manage_stock: boolean
  stock_quantity?: number
  stock_status: 'instock' | 'outofstock' | 'onbackorder'
  backorders: 'no' | 'notify' | 'yes'
  backorders_allowed: boolean
  backordered: boolean
  weight: string
  dimensions: {
    length: string
    width: string
    height: string
  }
  shipping_class: string
  shipping_class_id: number
  image: {
    id: number
    date_created: string
    date_modified: string
    src: string
    name: string
    alt: string
  } | null
  attributes: Array<{
    id: number
    name: string
    option: string
  }>
  menu_order: number
  meta_data: Array<{
    id: number
    key: string
    value: any
  }>
}

export interface WooCategory {
  id: number
  name: string
  slug: string
  parent: number
  description: string
  display: 'default' | 'products' | 'subcategories' | 'both'
  image: {
    id: number
    date_created: string
    date_modified: string
    src: string
    name: string
    alt: string
  } | null
  menu_order: number
  count: number
}

export class WooCommerceClient {
  private config: WooCommerceConfig
  private baseURL: string
  private auth: string

  constructor(shop: Shop) {
    this.config = {
      baseURL: shop.baseUrl,
      consumerKey: shop.consumerKey,
      consumerSecret: shop.consumerSecret,
      version: 'v3',
      timeout: 30000,
    }
    
    this.baseURL = `${this.config.baseURL}/wp-json/wc/${this.config.version}`
    this.auth = Buffer.from(
      `${this.config.consumerKey}:${this.config.consumerSecret}`
    ).toString('base64')
  }

  /**
   * Generic API request method with retry logic
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const maxRetries = 3
    let attempt = 0

    while (attempt <= maxRetries) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout)
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Basic ${this.auth}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
          signal: controller.signal,
        })
        
        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        attempt++
        if (attempt > maxRetries) {
          throw error
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw new Error('Maximum retries exceeded')
  }

  /**
   * Test connection to WooCommerce API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/system_status')
      return true
    } catch {
      return false
    }
  }

  /**
   * Get products with pagination
   */
  async getProducts(params: {
    page?: number
    per_page?: number
    search?: string
    status?: string
    category?: number
    sku?: string
    featured?: boolean
    on_sale?: boolean
    min_price?: string
    max_price?: string
    stock_status?: string
    orderby?: string
    order?: 'asc' | 'desc'
  } = {}): Promise<{ products: WooProduct[], totalPages: number, totalCount: number }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    const response = await fetch(`${this.baseURL}/products?${searchParams}`, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`)
    }

    const products = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const totalCount = parseInt(response.headers.get('X-WP-Total') || '0')

    return { products, totalPages, totalCount }
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: number): Promise<WooProduct> {
    return this.request<WooProduct>(`/products/${id}`)
  }

  /**
   * Create new product
   */
  async createProduct(product: Partial<WooProduct>): Promise<WooProduct> {
    return this.request<WooProduct>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    })
  }

  /**
   * Update product
   */
  async updateProduct(id: number, product: Partial<WooProduct>): Promise<WooProduct> {
    return this.request<WooProduct>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    })
  }

  /**
   * Delete product
   */
  async deleteProduct(id: number, force = false): Promise<WooProduct> {
    return this.request<WooProduct>(`/products/${id}?force=${force}`, {
      method: 'DELETE',
    })
  }

  /**
   * Batch update products
   */
  async batchUpdateProducts(data: {
    create?: Partial<WooProduct>[]
    update?: Array<{ id: number } & Partial<WooProduct>>
    delete?: number[]
  }): Promise<{
    create: WooProduct[]
    update: WooProduct[]
    delete: WooProduct[]
  }> {
    return this.request('/products/batch', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get product variations
   */
  async getVariations(productId: number, params: {
    page?: number
    per_page?: number
    search?: string
    sku?: string
    status?: string
    stock_status?: string
  } = {}): Promise<{ variations: WooVariation[], totalPages: number, totalCount: number }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    const response = await fetch(`${this.baseURL}/products/${productId}/variations?${searchParams}`, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch variations: ${response.statusText}`)
    }

    const variations = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const totalCount = parseInt(response.headers.get('X-WP-Total') || '0')

    return { variations, totalPages, totalCount }
  }

  /**
   * Update variation
   */
  async updateVariation(productId: number, variationId: number, variation: Partial<WooVariation>): Promise<WooVariation> {
    return this.request<WooVariation>(`/products/${productId}/variations/${variationId}`, {
      method: 'PUT',
      body: JSON.stringify(variation),
    })
  }

  /**
   * Get categories
   */
  async getCategories(params: {
    page?: number
    per_page?: number
    search?: string
    parent?: number
    orderby?: string
    order?: 'asc' | 'desc'
  } = {}): Promise<{ categories: WooCategory[], totalPages: number, totalCount: number }> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value))
      }
    })

    const response = await fetch(`${this.baseURL}/products/categories?${searchParams}`, {
      headers: {
        'Authorization': `Basic ${this.auth}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.statusText}`)
    }

    const categories = await response.json()
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1')
    const totalCount = parseInt(response.headers.get('X-WP-Total') || '0')

    return { categories, totalPages, totalCount }
  }
}

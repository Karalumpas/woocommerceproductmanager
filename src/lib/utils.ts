import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format price for display
 */
export function formatPrice(price: string | number | null | undefined): string {
  if (!price || price === '') return 'N/A'
  const numPrice = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(numPrice)) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numPrice)
}

/**
 * Format price range for variable products
 */
export function formatPriceRange(minPrice?: string | number, maxPrice?: string | number): string {
  if (!minPrice && !maxPrice) return 'N/A'
  
  const min = typeof minPrice === 'string' ? parseFloat(minPrice) : minPrice
  const max = typeof maxPrice === 'string' ? parseFloat(maxPrice) : maxPrice
  
  if (!min && !max) return 'N/A'
  if (min === max) return formatPrice(min)
  
  return `${formatPrice(min)} - ${formatPrice(max)}`
}

/**
 * Format stock status for display
 */
export function formatStockStatus(status: string): { label: string; color: string } {
  switch (status) {
    case 'instock':
      return { label: 'In Stock', color: 'text-green-600' }
    case 'outofstock':
      return { label: 'Out of Stock', color: 'text-red-600' }
    case 'onbackorder':
      return { label: 'On Backorder', color: 'text-yellow-600' }
    default:
      return { label: 'Unknown', color: 'text-gray-600' }
  }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch {
    return 'Invalid Date'
  }
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Generate slug from string
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Validate SKU format
 */
export function validateSKU(sku: string): boolean {
  if (!sku || sku.length === 0) return false
  // SKU should be alphanumeric with optional hyphens and underscores
  return /^[a-zA-Z0-9\-_]+$/.test(sku)
}

/**
 * Extract numeric value from string
 */
export function extractNumber(value: string | number | null | undefined): number | null {
  if (typeof value === 'number') return value
  if (!value || typeof value !== 'string') return null
  
  const match = value.match(/[\d.]+/)
  return match ? parseFloat(match[0]) : null
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in production, use a proper library like DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

/**
 * Truncate text
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.substr(0, length) + '...'
}

/**
 * Convert object to query string
 */
export function objectToQueryString(obj: Record<string, any>): string {
  return Object.entries(obj)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

/**
 * Parse CSV-like values (for attributes)
 */
export function parseCSVValues(value: string): string[] {
  if (!value) return []
  return value.split('|').map(v => v.trim()).filter(v => v.length > 0)
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let attempt = 0
  
  while (attempt <= maxRetries) {
    try {
      return await fn()
    } catch (error) {
      attempt++
      if (attempt > maxRetries) {
        throw error
      }
      
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await sleep(delay)
    }
  }
  
  throw new Error('Max retries exceeded')
}

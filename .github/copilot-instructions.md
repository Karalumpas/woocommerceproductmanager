# WooCommerce Product Manager - AI Development Guide

This guide provides essential information for AI coding agents working with the WooCommerce Product Manager application.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14 App Router with React and TypeScript
- **UI**: Tailwind CSS with Radix UI primitive components
- **State Management**: React Context API with custom hooks
- **Authentication**: Custom authentication with bcrypt and session cookies
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Background Processing**: BullMQ workers with Redis for async tasks
- **External API**: WooCommerce REST API integration

## 🔄 Key Data Flows

1. **Product Synchronization**: 
   - Local database ↔️ WooCommerce API via `src/lib/woocommerce.ts`
   - Background job processing through `src/workers/index.ts`

2. **Authentication Flow**:
   - User credentials → bcrypt verification → Session creation → Cookie storage
   - Implementation in `src/lib/auth.ts` and `src/components/auth/auth-provider.tsx`

3. **CSV Import/Export Pipeline**:
   - File upload → CSV parsing → Database storage → Background sync to WooCommerce
   - See `src/components/products/import-products.tsx` for the UI flow

## 🛠️ Development Workflows

### Common Commands

```bash
# Development server on port 3010
npm run dev

# Build for production
npm run build

# Database operations
npm run db:generate  # Generate migration files from schema
npm run db:migrate   # Apply migrations
npm run db:seed      # Seed database with initial data

# Start background worker processes
npm run worker:start

# Type checking
npm run type-check
```

### Database Workflow

1. Update schema in `src/lib/db/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Run `npm run db:migrate` to apply changes

## 📋 Project-Specific Patterns

### Database Access

- **Always use Drizzle queries** instead of raw SQL for type safety
- Access the database through the `db` instance from `src/lib/db/index.ts`
- Example:
  ```typescript
  import { db } from '@/lib/db'
  import { products } from '@/lib/db/schema'
  import { eq } from 'drizzle-orm'
  
  const result = await db.select().from(products).where(eq(products.id, productId))
  ```

### API Structure

- API routes use Next.js App Router pattern in `src/app/api/`
- All endpoints follow RESTful conventions
- Error responses use consistent format: `{ error: string, details?: any }`

### Component Organization

- UI components in `src/components/ui/` follow shadcn/ui pattern
- Business logic components are organized by feature in `src/components/`
- Pages in `src/app/` are kept minimal, delegating to components

### WooCommerce Integration

- Use the `WooCommerceClient` class from `src/lib/woocommerce.ts`
- All WooCommerce data types are defined with TypeScript interfaces
- API responses are mapped to internal data models before storage

## ⚠️ Gotchas and Special Considerations

1. **Background Worker**: 
   - Requires Redis connection (see docker-compose.yml)
   - Must be started separately with `npm run worker:start`

2. **Authentication**:
   - Session-based with cookies, not JWT
   - Protected routes are wrapped with `AuthGuard` component

3. **Data Modeling**:
   - Products can belong to multiple shops (many-to-many)
   - Local product IDs differ from WooCommerce IDs (tracked in `productShops` table)

4. **Error Handling**:
   - Use try/catch with specific error types
   - User-facing errors should be handled with toast notifications

## 📁 Key Files Reference

- **Database Schema**: `src/lib/db/schema.ts`
- **Auth Logic**: `src/lib/auth.ts`
- **WooCommerce Client**: `src/lib/woocommerce.ts`
- **API Routes**: `src/app/api/`
- **Worker Logic**: `src/workers/index.ts`
- **Main UI Components**: `src/components/products/`

## 🚀 Contribution Guidelines

- Follow TypeScript best practices with proper typing
- Use functional components with hooks (no class components)
- Write unit tests for business logic
- Keep components small and focused on a single responsibility
- Use Tailwind for styling, following the established design system

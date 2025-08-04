# Migration Guide

Dette dokument guider dig gennem migration mellem forskellige versioner af WooCommerce Product Manager.

## 📋 Indholdsfortegnelse

- [Fra 1.x til 2.0](#fra-1x-til-20)
- [Database Migrationer](#database-migrationer)
- [Konfiguration Ændringer](#konfiguration-ændringer)
- [API Ændringer](#api-ændringer)
- [Troubleshooting](#troubleshooting)

## Fra 1.x til 2.0

### Oversigt
Version 2.0 introducerer betydelige forbedringer til filtrering, pagination og performance, men kræver nogle migration steps.

### Vigtige Ændringer
- 🔄 Ny database schema med optimerede indices
- 📄 Ændret pagination API fra offset til cursor-based
- 🔍 Forbedret filter API med nye parametre
- 🏗️ Refaktoreret komponent struktur

### Migration Steps

#### 1. Backup din nuværende installation
```bash
# Backup database
pg_dump your_database_name > backup_v1.sql

# Backup konfiguration
cp .env.local .env.local.backup
```

#### 2. Opdater dependencies
```bash
# Installer nye dependencies
npm install

# Fjern forældede packages
npm uninstall deprecated-package-name
```

#### 3. Database Migration
```bash
# Kør migration scripts
npm run db:migrate

# Verificer migration
npm run db:verify
```

#### 4. Opdater konfiguration
```env
# Nye miljøvariabler i .env.local
ENABLE_ADVANCED_FILTERING=true
PAGINATION_TYPE=cursor # eller 'offset' for legacy
MAX_FILTER_COMPLEXITY=10

# Fjern forældede variabler
# LEGACY_API_MODE=true (ikke længere understøttet)
```

#### 5. Test din installation
```bash
# Kør alle tests
npm run test

# Test API endpoints
npm run test:api

# Test UI komponenter
npm run test:e2e
```

## Database Migrationer

### Schema Ændringer

#### Nye Tabeller
- `product_filters` - Cache tabel for hurtigere filtrering
- `pagination_cursors` - Cursor state for pagination

#### Modificerede Tabeller
- `products` - Tilføjet indices for performance
- `shops` - Nye kolonner for advanced sync options

#### SQL Migration Script
```sql
-- Tilføj nye indices
CREATE INDEX CONCURRENTLY idx_products_category_status 
ON products (category, status) WHERE status = 'publish';

CREATE INDEX CONCURRENTLY idx_products_search 
ON products USING gin(to_tsvector('danish', name || ' ' || description));

-- Opdater eksisterende data
UPDATE products SET search_vector = to_tsvector('danish', name || ' ' || description);
```

### Data Migration

#### Produktdata
```typescript
// Eksempel på data transformation
interface LegacyProduct {
  id: number
  name: string
  categories: string // JSON string
}

interface NewProduct {
  id: number
  name: string
  categories: Category[] // Parsed object
  searchVector: string
}

// Migration logic
async function migrateProducts() {
  const legacyProducts = await db.select().from(legacyProductsTable)
  
  for (const product of legacyProducts) {
    const categories = JSON.parse(product.categories || '[]')
    const searchVector = generateSearchVector(product.name, product.description)
    
    await db.update(products)
      .set({ 
        categories,
        searchVector
      })
      .where(eq(products.id, product.id))
  }
}
```

## Konfiguration Ændringer

### API Configuration

#### Før (v1.x)
```typescript
// Legacy API configuration
const apiConfig = {
  pageSize: 25,
  sortBy: 'date',
  enableFilters: false
}
```

#### Efter (v2.0)
```typescript
// New API configuration
const apiConfig = {
  pagination: {
    type: 'cursor', // eller 'offset'
    pageSize: 25,
    maxPageSize: 100
  },
  sorting: {
    defaultSort: 'dateModified',
    allowedSorts: ['name', 'price', 'dateCreated', 'dateModified', 'sku']
  },
  filtering: {
    enabled: true,
    maxComplexity: 10,
    enableTextSearch: true
  }
}
```

### Environment Variables

#### Nye Variabler
```env
# Performance tuning
DATABASE_POOL_SIZE=20
QUERY_TIMEOUT=30000
ENABLE_QUERY_CACHE=true

# Feature flags
ENABLE_ADVANCED_FILTERING=true
ENABLE_BULK_OPERATIONS=true
ENABLE_REAL_TIME_SYNC=true

# UI Configuration
DEFAULT_VIEW_MODE=grid
ENABLE_INFINITE_SCROLL=true
PRODUCTS_PER_PAGE=25
```

#### Fjernede Variabler
```env
# Disse er ikke længere nødvendige
# LEGACY_PAGINATION=true
# OLD_FILTER_API=true
# SIMPLE_MODE=true
```

## API Ændringer

### Endpoint Ændringer

#### Products API

**Før (v1.x)**
```http
GET /api/products?page=1&limit=25&search=laptop
```

**Efter (v2.0)**
```http
GET /api/products?cursor=eyJ9&limit=25&search=laptop&sortBy=dateModified&sortOrder=desc
```

#### Nye Query Parametre
- `cursor` - For cursor-based pagination
- `sortBy` - Specificér sorteringskolonne
- `sortOrder` - asc eller desc
- `category` - Filtrer efter kategori
- `brand` - Filtrer efter brand
- `status` - Filtrer efter status
- `stockStatus` - Filtrer efter lagerstatus
- `type` - Filtrer efter produkttype

#### Response Format Ændringer

**Før (v1.x)**
```json
{
  "products": [...],
  "totalCount": 150,
  "currentPage": 1,
  "totalPages": 6
}
```

**Efter (v2.0)**
```json
{
  "products": [...],
  "hasMore": true,
  "nextCursor": "eyJ9",
  "total": 150,
  "page": 1,
  "limit": 25,
  "totalPages": 6
}
```

### Breaking Changes

#### 1. Pagination Response
- `currentPage` → `page`
- Tilføjet `hasMore` boolean
- Tilføjet `nextCursor` for cursor pagination

#### 2. Filter Parameters
- Nye filter parametre kræver opdateret frontend kode
- `category` parameter forventer nu eksakt match

#### 3. Sort Parameters
- `sort` → `sortBy` + `sortOrder`
- Nye tilladte værdier for sortering

## Troubleshooting

### Almindelige Problemer

#### Database Connection Issues
```bash
# Verificer database forbindelse
npm run db:check

# Reset database forbindelse
npm run db:reset-connection
```

#### Migration Fejl
```bash
# Rollback til tidligere version
npm run db:rollback

# Genopret fra backup
psql your_database_name < backup_v1.sql
```

#### Performance Problemer
```bash
# Analyser query performance
npm run db:analyze

# Regenerer database indices
npm run db:reindex
```

### Error Codes

| Code | Beskrivelse | Løsning |
|------|-------------|---------|
| MIG001 | Database schema version mismatch | Kør `npm run db:migrate` |
| MIG002 | Missing required environment variables | Opdater `.env.local` |
| MIG003 | Incompatible data format | Kør data migration script |
| MIG004 | Index creation failed | Tjek database tilladelser |

### Rollback Plan

Hvis migration fejler:

1. **Stop applikationen**
   ```bash
   npm run stop
   ```

2. **Genopret database backup**
   ```bash
   psql your_database_name < backup_v1.sql
   ```

3. **Genopret konfiguration**
   ```bash
   cp .env.local.backup .env.local
   ```

4. **Downgrade til v1.x**
   ```bash
   git checkout v1.x.x
   npm install
   npm run start
   ```

### Support

Hvis du støder på problemer under migration:

1. Tjek [GitHub Issues](https://github.com/Karalumpas/woocommerceproductmanager/issues)
2. Opret en ny issue med:
   - Migration step hvor fejlen opstod
   - Error logs
   - System information
   - Database version

### Migration Checklist

- [ ] Backup database og konfiguration
- [ ] Læs changelog for breaking changes
- [ ] Test migration på staging miljø
- [ ] Opdater dependencies
- [ ] Kør database migration
- [ ] Opdater miljøvariabler
- [ ] Test alle kritiske funktioner
- [ ] Opdater dokumentation
- [ ] Train team på nye features
- [ ] Monitor performance efter migration

---

*For assistance med migration, opret venligst en [GitHub issue](https://github.com/Karalumpas/woocommerceproductmanager/issues) eller kontakt support.*

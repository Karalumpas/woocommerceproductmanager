# WooCommerce Product Manager Application Guide

Dette er en omfattende guide til WooCommerce Product Manager applikationen, som kan bruges af automatiserede agenter til at forstå og arbejde med kodebasen.

## 🌐 Overblik over Applikationen

WooCommerce Product Manager er en avanceret webapplikation designet til at forenkle administration af produkter på WooCommerce-drevne webshops. Applikationen tillader brugere at:
- Administrere produkter på tværs af flere WooCommerce butikker
- Importere og eksportere produktdata via CSV
- Synchronisere produkter mellem butikker
- Overvåge lagerstatus og salgsdata
- Udføre batch-operationer på produkter

## 🏗️ Teknisk Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI Komponenter**: Tailwind CSS, Radix UI
- **State Management**: React Context/Hooks
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL 
- **ORM**: Drizzle ORM
- **API Integration**: WooCommerce REST API
- **Autentifikation**: Custom auth med bcrypt
- **Job Processing**: BullMQ for baggrundsopgaver
- **Deployment**: Docker, Nginx

## 🗄️ Database Struktur

### Centrale Tabeller:

1. **users**: Brugerkonti for adgang til systemet
   - Felter: id, email, username, passwordHash, isActive, autoSync, lastLogin

2. **shops**: WooCommerce butiksforbindelser
   - Felter: id, userId, name, baseUrl, consumerKey, consumerSecret, isActive, isDefault, status

3. **products**: Lokalt gemte produkter
   - Felter: id, wooId, name, slug, type, status, sku, price, stockStatus, description

4. **productShops**: Mange-til-mange relation mellem produkter og butikker
   - Felter: id, productId, shopId, wooId, priceOverride, syncEnabled

5. **imports**: Historik over CSV importeringer
   - Felter: id, userId, shopId, filename, totalRows, processedRows, status

6. **syncJobs**: Log over synkroniseringsopgaver
   - Felter: id, productId, shopId, status, startedAt, completedAt, error

## 📁 Kodebase Struktur

### Kernekomponenter:

1. **/src/app**: Next.js App Router pages
   - `/dashboard`: Administrativ oversigt
   - `/products`: Produktliste og -detaljer
   - `/connections`: Butiksforbindelser
   - `/api`: Backend API endpoints

2. **/src/components**: React komponenter
   - `/products`: Produktrelaterede komponenter (liste, kort, filtre)
   - `/ui`: Genbrugelige UI komponenter (knapper, modaler, inputs)
   - `/auth`: Autentificeringskomponenter
   - `/dashboard`: Dashboard widgets

3. **/src/lib**: Hjælpefunktioner og konfiguration
   - `/db`: Database schema og migrations
   - `/woocommerce.ts`: WooCommerce API integration
   - `/auth.ts`: Autentificeringslogik
   - `/utils.ts`: Hjælpefunktioner

4. **/src/workers**: Baggrundsjobs
   - `index.ts`: Job queue manager
   - Forskellige job processorer

## ⚙️ Centrale Features og Implementeringsdetaljer

### Autentifikation
- Custom autentifikation baseret på bcrypt til password hashing
- Sessions håndteres via server-side cookies
- Beskyttede routes via auth middleware

### WooCommerce Integration
- RESTful API integration med WooCommerce API
- Håndterer CRUD operationer for produkter
- Understøtter både simple og variable produkter
- Håndterer produkt attributter, kategorier og billeder

### Produktadministration
- Grid og liste visning af produkter
- Avanceret filtrering og sortering
- Understøttelse for variable produkter og varianter
- Bulk edit og batch operationer

### Import/Export
- CSV import med validering og fejlhåndtering
- Mapping af CSV kolonner til produktfelter
- Progressbar for at vise importstatus
- Export af filtrerede produkter til CSV

### Synkronisering
- Real-time synkronisering mellem lokale data og WooCommerce
- Baggrundsjobs for at håndtere store datamængder
- Fejlhåndtering og genoptagelse af synkronisering
- Synkroniseringsstatus for hvert produkt

## 🔄 Arbejdsgange

### Produktimport
1. Bruger uploader CSV fil
2. Systemet validerer og parser data
3. Produkter oprettes i databasen
4. Baggrundsjob synkroniserer med WooCommerce
5. Status opdateres i UI'en

### Produktsynkronisering
1. Bruger vælger produkter at synkronisere
2. Systemet starter synkroniseringsjob
3. Produkter opdateres i WooCommerce API
4. Status og resultater rapporteres tilbage
5. Eventuelt fejlede synkroniseringer kan genoptages

### Bruger Onboarding
1. Bruger registrerer konto
2. Tilføjer WooCommerce shop forbindelse
3. Tester forbindelsen til API
4. Importerer eksisterende produkter
5. Kan begynde at administrere produkter

## 🛠️ API Endpoints

### Autentifikation
- `POST /api/auth/login`: Bruger login
- `POST /api/auth/register`: Bruger registrering
- `POST /api/auth/change-password`: Skift password

### Produkter
- `GET /api/products`: Hent produktliste
- `GET /api/products/:id`: Hent enkelt produkt
- `POST /api/products`: Opret produkt
- `PUT /api/products/:id`: Opdater produkt
- `DELETE /api/products/:id`: Slet produkt

### Butikker
- `GET /api/shops`: Hent butiksliste
- `POST /api/shops`: Opret butiksforbindelse
- `PUT /api/shops/:id`: Opdater butiksforbindelse
- `DELETE /api/shops/:id`: Slet butiksforbindelse

### Import/Export
- `POST /api/imports`: Start import
- `GET /api/imports/:id`: Hent importstatus
- `POST /api/exports`: Generer eksport

## 📋 Kodekonventioner

### TypeScript Interfaces
Projektet anvender TypeScript interfaces til at definere datastrukturer, f.eks.:
- `Product`, `ProductVariant`, `Shop`, `User`, etc.

### State Management
React Context og custom hooks anvendes til state management, f.eks.:
- `useProducts`, `useShops`, `useDashboard`, etc.

### Error Handling
Konsistent fejlhåndtering med specifikke fejltyper og feedback til brugeren.

### Async Operationer
Asynkrone operationer håndteres med async/await pattern og try/catch blokke.

## 🧪 Test og Kvalitetssikring

- Jest for unit tests
- Playwright for end-to-end tests
- TypeScript for type safety
- ESLint for code linting

## 🚀 Deployment Proces

1. Docker containerization med docker-compose
2. PostgreSQL database i separat container
3. Nginx som reverse proxy med SSL support
4. Environment variables for konfiguration

## 👨‍💻 Udvikling og Udvidelse

### Nye Features
Når der udvikles nye features, følg disse retningslinjer:
1. Opret TypeScript interfaces for nye datastrukturer
2. Implementer database schema ændringer i Drizzle ORM
3. Udvikl API endpoints med korrekt validering
4. Byg UI komponenter med Tailwind og Radix UI
5. Skriv tests for nye funktioner

### Best Practices
- Følg TypeScript best practices med korrekt typning
- Anvend React hooks pattern for state og side effects
- Optimer database queries med indekser
- Håndter store datamængder asynkront med baggrundsjobs
- Implementer optimistic UI updates for bedre brugeroplevelse

## 📊 Datamodeller

### Product
```typescript
interface Product {
  id: number;
  wooId: number;
  name: string;
  slug: string;
  type: 'simple' | 'variable' | 'grouped' | 'external';
  status: 'draft' | 'pending' | 'private' | 'publish';
  sku: string;
  price: string | null;
  regularPrice: string | null;
  salePrice: string | null;
  stockStatus: 'instock' | 'outofstock' | 'onbackorder';
  stockQuantity: number | null;
  description: string;
  shortDescription: string;
  categories: Category[];
  images: ProductImage[];
  attributes: ProductAttribute[];
  variations: ProductVariation[];
}
```

### Shop
```typescript
interface Shop {
  id: number;
  userId: number;
  name: string;
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  isActive: boolean;
  isDefault: boolean;
  status: 'online' | 'offline' | 'error';
}
```

### Import
```typescript
interface Import {
  id: number;
  userId: number;
  shopId: number;
  filename: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  completedAt: Date | null;
}
```

## 🔒 Sikkerhed

- Brugerpasswords hashes med bcrypt
- API nøgler gemmes krypteret
- Input validering på alle API endpoints
- CSRF beskyttelse
- Rate limiting på autentifikations-endpoints

## 🔧 Konfiguration

Applikationen konfigureres primært via environment variables:
- `DATABASE_URL`: PostgreSQL forbindelsesstreng
- `NEXTAUTH_SECRET`: Secret for auth cookies
- `NEXTAUTH_URL`: Base URL for applikationen
- `REDIS_URL`: Redis forbindelsesstreng (for job queue)

## 📡 Integration med Eksterne Systemer

### WooCommerce API
- Applikationen integrerer med WooCommerce REST API
- Autentifikation via consumer key og secret
- Håndterer API rate limits
- Understøtter forskellige WooCommerce versioner

## 🌟 Tips til Effektiv Brug

- Brug batch operationer til at håndtere mange produkter på én gang
- Opsæt regelmæssig synkronisering for at holde data opdateret
- Anvend avanceret filtrering til at finde specifikke produkter
- Udnyt CSV import/export til masseadministration
- Brug dashboard widgets til at overvåge butiksstatus

---

Dette dokument giver et omfattende overblik over WooCommerce Product Manager applikationen og kan bruges som reference for automatiserede agenter til at forstå systemets opbygning og funktionalitet.

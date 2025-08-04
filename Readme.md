# WooCommerce Product Manager

En moderne og brugervenlig applikation til administration af WooCommerce produkter med avancerede funktioner til filtrering, sortering og batch-operationer.

## 🚀 Funktioner

### Produktadministration
- **Produktliste** med grid og liste visning
- **Avanceret søgning** i produktnavn, SKU og beskrivelse
- **Sideinddeling** med traditionel pagination eller "load more" funktionalitet
- **Sortering** efter navn, pris, SKU, oprettelsesdato og ændringsdato
- **Omfattende filtrering**:
  - Kategori
  - Brand/mærke
  - Status (Published, Draft, Private)
  - Lagerstatus (På lager, Udsolgt, Restordre)
  - Produkttype (Simple, Variable, Grouped)

### Import/Export
- **CSV import** af produkter
- **CSV export** af filtrerede produkter
- **Bulk operationer** på udvalgte produkter

### Synkronisering
- **Real-time synkronisering** med WooCommerce
- **Automatisk opdatering** af produktdata
- **Synkroniseringsstatus** med progress tracking

### Dashboard
- **Oversigt** over produkter og statistikker
- **Seneste imports** og aktiviteter
- **Lagergraf** og trends

## 🛠 Teknisk Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI
- **Database**: PostgreSQL med Drizzle ORM
- **API**: WooCommerce REST API integration
- **Deployment**: Docker support

## 📦 Installation

### Forudsætninger
- Node.js 18+
- PostgreSQL database
- WooCommerce shop med API adgang

### Opsætning

1. **Klon repository**
```bash
git clone https://github.com/Karalumpas/woocommerceproductmanager.git
cd woocommerceproductmanager
```

2. **Installer dependencies**
```bash
npm install
```

3. **Konfigurer miljøvariabler**
Opret `.env.local` fil:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/woocommerce_manager"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:6000"
```

4. **Konfigurer database**
```bash
npm run db:migrate
```

5. **Start udviklingsserver**
```bash
npm run dev
```

Applikationen kører nu på `http://localhost:6000`

## 🐳 Docker Deployment

```bash
# Byg og start containere
docker-compose up -d

# Se logs
docker-compose logs -f

# Stop containere
docker-compose down
```

## 📖 Brugsanvisning

### Tilslutning af WooCommerce Shop
1. Gå til **Connections** siden
2. Tilføj din shop URL og API nøgler
3. Test forbindelsen
4. Start synkronisering af produkter

### Produktadministration
1. **Søgning**: Brug søgefeltet til at finde specifikke produkter
2. **Filtrering**: Klik "Filters" og vælg kriterier
3. **Sortering**: Vælg sorteringstype og retning i filter menuen
4. **Navigation**: Vælg mellem "Pages" (sideinddeling) eller "Load More"
5. **Visning**: Skift mellem liste og grid visning

### Import/Export
- **Import**: Klik "Import" og upload CSV fil
- **Export**: Klik "Export" for at downloade filtrerede produkter

## 🔧 Konfiguration

### API Endpoints
- `/api/products` - Produkter med filtrering og pagination
- `/api/products/filters` - Tilgængelige filtreringsmuligheder
- `/api/products/sync` - Synkronisering med WooCommerce
- `/api/shops` - Shop administration
- `/api/imports` - Import administration

### Database Schema
Se `src/lib/db/schema.ts` for komplet database struktur.

## 🤝 Bidrag

1. Fork projektet
2. Opret feature branch (`git checkout -b feature/amazing-feature`)
3. Commit ændringer (`git commit -m 'Add amazing feature'`)
4. Push til branch (`git push origin feature/amazing-feature`)
5. Åbn Pull Request

## 📝 Licens

Dette projekt er licenseret under MIT License - se [LICENSE](LICENSE) filen for detaljer.

## 🆘 Support

For hjælp og support:
- Opret et [issue](https://github.com/Karalumpas/woocommerceproductmanager/issues)
- Se [dokumentation](PRODUCT_FEATURES.md) for detaljerede funktionsbeskrivelser

## 🔄 Seneste Opdateringer

### Version 2.0 (August 2025)
- ✅ Avanceret filtrering og sortering
- ✅ Sideinddeling med pagination og load more
- ✅ Forbedret performance med optimerede database queries
- ✅ Responsive design til alle skærmstørrelser
- ✅ Real-time synkronisering med WooCommerce
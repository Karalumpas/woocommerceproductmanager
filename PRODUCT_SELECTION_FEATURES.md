# Product Selection and Management Features

Denne implementering tilføjer omfattende funktionalitet til produktlisten for at vælge og administrere produkter på tværs af webshops.

## Nye Funktioner

### 1. Produktudvælgelse med Flueben
- **Bulk Actions Header**: En header med handlinger vises øverst i produktlisten når selection er aktiveret
- **"Select All" Knap**: Vælger/fravælger alle produkter på den aktuelle side
- **Individual Checkboxes**: Hver produkt kan vælges individuelt med et flueben
- **Selection Counter**: Viser antallet af valgte produkter

### 2. Send Produkter til Andre Webshops
- **"Send to Shop" Dropdown**: Viser alle tilgængelige webshops (undtagen den aktuelle)
- **API Integration**: Opretter eller opdaterer produkter i målwebshoppen via WooCommerce API
- **CSV Support**: Produkter fra CSV-filer kan sendes til enhver webshop
- **Existing Product Check**: Tjekker om produktet allerede findes (via SKU) og opdaterer i stedet for at oprette dubletter

### 3. Produktredigering og Synkronisering
- **Original Shop Updates**: Når du redigerer et produkt, opdateres det automatisk i den webshop hvor det kommer fra
- **WooCommerce Sync**: Ændringer synkroniseres direkte til WooCommerce via API
- **Local Fallback**: Hvis WooCommerce-opdatering fejler, gemmes ændringerne lokalt
- **CSV Product Creation**: Produkter fra CSV kan oprettes i den valgte webshop når de redigeres

## Teknisk Implementering

### Frontend Komponenter

#### ProductList Component (`src/components/products/product-list.tsx`)
- Tilføjet support for multiple selection
- Bulk actions header med "Select All" og "Send to Shop" functionality
- Checkboxes på både grid og list view
- Integration med shop selector dropdown

#### ProductCard Component (`src/components/products/product-card.tsx`)
- Opdateret med PUT API kald for produktopdateringer
- Forbedret error handling og toast notifications
- Support for både WooCommerce og lokale opdateringer

### Backend API Endpoints

#### Transfer API (`src/app/api/products/transfer/route.ts`)
- **POST** endpoint til at overføre produkter mellem webshops
- Håndterer både CSV produkter og eksisterende WooCommerce produkter
- Tjekker for duplikater via SKU
- Batch processing med detaljerede error reports

#### Product Update API (`src/app/api/products/[id]/route.ts`)
- **PUT** endpoint til produktopdateringer
- **DELETE** endpoint til produktsletning
- WooCommerce synkronisering med fallback til lokal opdatering
- Support for både WooCommerce og CSV produkter

### Database Integration
- Bruger eksisterende Drizzle ORM schema
- Opretter produkter med korrekt shop tilknytning
- Vedligeholder data integritet mellem lokale og WooCommerce data

## Brugsanvisning

### Sådan Vælger du Produkter
1. Gå til produktsiden
2. Vælg en webshop fra dropdown (hvis ikke allerede valgt)
3. Brug checkboxes til at vælge individuelle produkter
4. Eller brug "Select All" knappen til at vælge alle produkter på siden

### Sådan Sender du Produkter til En Anden Webshop
1. Vælg de ønskede produkter med checkboxes
2. Klik på "Send to Shop" knappen i bulk actions header
3. Vælg målwebshoppen fra dropdown menuen
4. Produkterne vil blive overført og en bekræftelse vises

### Sådan Redigerer du Produkter
1. Klik på et produkt for at åbne detalje visningen
2. Klik på "Edit" knappen for at aktivere redigeringstilstand
3. Foretag ønskede ændringer
4. Klik "Save" for at gemme ændringerne
5. Produktet vil blive opdateret i den originale webshop (eller oprettet hvis det kommer fra CSV)

## Fejlhåndtering
- Detaljerede fejlmeddelelser ved transfer fejl
- Fallback til lokal opdatering hvis WooCommerce API fejler
- Toast notifikationer for bruger feedback
- Console logging for debugging
- **Numerisk felt validering**: Tomme strenge konverteres automatisk til null for numeriske felter som priser og lagerantal
- **Database compatibility**: Sikrer kompatibilitet mellem WooCommerce API response og PostgreSQL database

## Tekniske Detaljer

### State Management
- Bruger React useState til selection state
- Integration med eksisterende useShops og useProducts hooks
- Prop drilling for selection callbacks

### API Integration
- WooCommerceClient klasse til API kald
- Retry logik med exponential backoff
- Proper error handling og timeout håndtering

### UI/UX Forbedringer
- Responsive design for både grid og list view
- Accessible checkboxes med proper keyboard navigation
- Loading states og feedback for alle handlinger
- Consistent styling med eksisterende UI komponenter

Denne implementering giver en komplet løsning til produktadministration på tværs af flere WooCommerce webshops med robust fejlhåndtering og en intuitiv brugeroplevelse.

## Troubleshooting

### Almindelige Fejl og Løsninger

#### "invalid input syntax for type numeric" fejl
**Problem**: PostgreSQL modtager tomme strenge ("") til numeriske felter som priser eller lagerantal.
**Løsning**: Implementeret automatisk konvertering af tomme strenge til null værdier i API endpoints.

#### Produktopdatering fejler
**Problem**: WooCommerce API forbindelse fejler eller returnerer ugyldige data.
**Løsning**: Fallback til kun lokal database opdatering. Tjek shop forbindelses indstillinger.

#### Produkter dubleres ved transfer
**Problem**: Samme produkt oprettes flere gange i målwebshoppen.
**Løsning**: Systemet tjekker automatisk for eksisterende produkter via SKU før oprettelse.

### Debug Tips
1. Tjek browser console for JavaScript fejl
2. Tjek server terminal for API fejl
3. Verificer shop forbindelser på shop siden
4. Test WooCommerce API adgang separat

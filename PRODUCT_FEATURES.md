# Produktliste - Sideinddeling og Filtrering

Jeg har tilføjet de ønskede funktioner til produktlisten:

## 🔍 Nye funktioner tilføjet:

### 1. Sideinddeling (Pagination)
- **Traditionel sideinddeling**: Bladre mellem sider med side-numre
- **Load More funktionalitet**: Indlæs flere produkter uden at navigere til nye sider
- Viser antallet af produkter og totalt antal
- Understøtter op til mange tusinde produkter

### 2. Sortering
- **Sorter efter**: Navn, Pris, SKU, Oprettelsesdato, Ændringsdato
- **Sortér retning**: Stigende (↑) eller faldende (↓)
- Standard sortering er efter ændringsdato (nyeste først)

### 3. Filtrering
- **Kategori filter**: Vælg produkter fra specifikke kategorier
- **Brand filter**: Filtrer efter mærke/brand (fra produkt attributter)
- **Status filter**: Published, Draft, Private
- **Lager status**: På lager, Udsolgt, Restordre
- **Produkttype**: Simple, Variable, Grouped

### 4. Forbedret brugeroplevelse
- **Søgning**: Søg i produktnavn, SKU og beskrivelse
- **To visningstyper**: Liste og grid visning
- **To navigation typer**: Sideinddeling eller Load More
- **Aktive filtreringer**: Se antal aktive filtre med badges
- **Produktstatistikker**: Viser hvor mange produkter der vises af total

## 🛠 Teknisk implementering:

### API ændringer
- **Ny `/api/products/filters` endpoint**: Henter tilgængelige kategorier og brands
- **Udvidet `/api/products` endpoint**: Understøtter filtrering, sortering og pagination
- **Database queries**: Optimeret med proper indexing og pagination

### Hook ændringer  
- **useProducts hook**: Understøtter nu filtrering, pagination og load more
- **Automatisk cache management**: SWR håndterer caching intelligent

### UI komponenter
- **ProductFilters**: Ny dropdown med alle filtreringsmuligheder
- **Pagination**: Komplet pagination komponent med dots navigation
- **ProductList**: Understøtter både pagination og load more modes

## 📊 Performance:

- **Lazy loading**: Kun 25 produkter indlæses ad gangen som standard
- **Optimal database queries**: Undgår N+1 problemer
- **Client-side caching**: SWR cache optimering
- **Effektiv filtrering**: Database-niveau filtrering frem for client-side

## 🎯 Brugervejledning:

1. **Søg produkter**: Brug søgefeltet øverst
2. **Anvend filtre**: Klik på "Filters" knappen og vælg ønskede kriterier
3. **Skift sortering**: I filter dropdown, vælg sortering efter felt og retning
4. **Navigation**: 
   - Vælg "Pages" for traditionel sideinddeling
   - Vælg "Load More" for kontinuerlig indlæsning
5. **Visning**: Skift mellem liste og grid visning

## 🔧 Konfiguration:

- **Standard sidestørrelse**: 25 produkter per side/indlæsning
- **Kan tilpasses** i useProducts hook kaldet
- **Performance optimeret** for store produktkataloger

Alle funktionerne er nu fuldt implementeret og klar til brug!

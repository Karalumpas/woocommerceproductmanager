# Contributing til WooCommerce Product Manager

Tak for din interesse i at bidrage til WooCommerce Product Manager! Vi værdsætter alle former for bidrag, fra fejlrapporter til nye funktioner.

## 📋 Indholdsfortegnelse

- [Code of Conduct](#code-of-conduct)
- [Hvordan kan jeg bidrage?](#hvordan-kan-jeg-bidrage)
- [Fejlrapporter](#fejlrapporter)
- [Feature Requests](#feature-requests)
- [Development Setup](#development-setup)
- [Pull Requests](#pull-requests)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

## Code of Conduct

Dette projekt følger vores [Code of Conduct](CODE_OF_CONDUCT.md). Ved at deltage forventes du at overholde denne kode.

## Hvordan kan jeg bidrage?

### 🐛 Fejlrapporter

Før du rapporterer en fejl:
- Tjek om fejlen allerede er rapporteret i [Issues](https://github.com/Karalumpas/woocommerceproductmanager/issues)
- Sørg for at du bruger den seneste version

Når du rapporterer en fejl, inkluder venligst:
- En klar beskrivelse af problemet
- Trin til at reproducere fejlen
- Forventet vs. faktisk adfærd
- Screenshots hvis relevant
- Din miljøinformation (OS, browser, Node.js version)

### 💡 Feature Requests

Vi er altid interesserede i nye ideer! Før du foreslår en ny funktion:
- Tjek om det allerede er foreslået
- Overvej om funktionen passer til projektets omfang
- Vær så detaljeret som muligt i din beskrivelse

### 🔧 Development Setup

1. **Fork repository**
```bash
git clone https://github.com/[dit-brugernavn]/woocommerceproductmanager.git
cd woocommerceproductmanager
```

2. **Installer dependencies**
```bash
npm install
```

3. **Opsæt miljøvariabler**
Kopier `.env.example` til `.env.local` og udfyld værdierne.

4. **Opsæt database**
```bash
npm run db:migrate
```

5. **Start development server**
```bash
npm run dev
```

### 📝 Pull Requests

1. **Opret en branch**
```bash
git checkout -b feature/din-feature-navn
# eller
git checkout -b fix/din-fix-navn
```

2. **Commit guidelines**
- Brug klare og beskrivende commit beskeder
- Start commit beskeder med et action verb (Add, Fix, Update, Remove)
- Referencer issues hvor relevant: `Fixes #123`

3. **Før du submitter**
- Kør tests: `npm test`
- Kør linting: `npm run lint`
- Kør type checking: `npm run type-check`
- Test i forskellige browsere

4. **Submit Pull Request**
- Giv en klar titel og beskrivelse
- Beskriv hvad der er ændret og hvorfor
- Inkluder screenshots for UI ændringer
- Marker som draft hvis ikke færdig

## 🎨 Coding Standards

### TypeScript/JavaScript
- Brug TypeScript til alle nye filer
- Følg ESLint konfigurationen
- Brug beskrivende variabel- og funktionsnavne
- Kommentér kompleks logik

### React/Next.js
- Brug funktionelle komponenter med hooks
- Følg React naming conventions
- Brug Server Components hvor muligt
- Optimér for performance

### CSS/Styling
- Brug Tailwind CSS classes
- Følg mobile-first design
- Sørg for accessibility (a11y)
- Test på forskellige skærmstørrelser

### Database
- Brug Drizzle ORM queries
- Optimér for performance
- Brug transactions ved komplekse operationer
- Dokumentér schema ændringer

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
npm run test:e2e
```

### Manuel Testing
- Test i Chrome, Firefox, Safari
- Test på mobile enheder
- Verificér accessibility med screen readers
- Test performance med store datasæt

## 📚 Ressourcer

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Drizzle ORM](https://orm.drizzle.team/)

## 🤝 Community

- Join vores [Discord](https://discord.gg/woocommerce-pm) (hvis relevant)
- Følg os på [Twitter](https://twitter.com/woocommerce-pm) (hvis relevant)

## 🙏 Anerkendelser

Alle bidragydere vil blive nævnt i vores [Contributors](https://github.com/Karalumpas/woocommerceproductmanager/graphs/contributors) sektion.

## 📞 Kontakt

Har du spørgsmål? Opret venligst et [issue](https://github.com/Karalumpas/woocommerceproductmanager/issues) eller kontakt maintainers direkte.

---

Tak for at bidrage til WooCommerce Product Manager! 🎉

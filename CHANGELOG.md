# Changelog

Alle væsentlige ændringer til dette projekt vil blive dokumenteret i denne fil.

Formatet er baseret på [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
og dette projekt følger [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Ny funktionalitet der er under udvikling

### Changed
- Ændringer til eksisterende funktionalitet

### Deprecated
- Funktionalitet der snart vil blive fjernet

### Removed
- Funktionalitet der er blevet fjernet

### Fixed
- Fejlrettelser

### Security
- Sikkerhedsopdateringer

## [2.0.0] - 2025-08-04

### Added
- ✨ Avanceret filtrering og sortering af produkter
- 📄 Sideinddeling med både traditionel pagination og "load more" funktionalitet
- 🔍 Forbedret søgefunktionalitet på tværs af produktnavn, SKU og beskrivelse
- 📊 Dashboard med produktstatistikker og trends
- 🔄 Real-time synkronisering med WooCommerce
- 📤 CSV import/export funktionalitet
- 🎨 Responsivt design der fungerer på alle skærmstørrelser
- 🏪 Understøttelse af flere WooCommerce shops
- 📈 Performance optimering med effektive database queries
- 🎯 Batch operationer på udvalgte produkter

### Changed
- 🔧 Forbedret database schema med optimerede relationer
- 🚀 Opdateret til Next.js 14 og seneste React funktioner
- 💅 Moderniseret UI med Radix UI komponenter
- 🏗️ Refaktoreret API endpoints for bedre performance

### Security
- 🔒 Forbedret API nøgle håndtering
- 🛡️ Input validering og sanitization
- 🔐 SQL injection beskyttelse via parameterized queries

## [1.0.0] - 2024-12-15

### Added
- 🎉 Initial version af WooCommerce Product Manager
- 📝 Grundlæggende produktliste funktionalitet
- 🔗 WooCommerce API integration
- 💾 PostgreSQL database med Drizzle ORM
- 🐳 Docker support for let deployment
- 📱 Responsivt design med Tailwind CSS

### Technical Improvements
- ⚡ Optimerede database queries for hurtigere produktindlæsning
- 🧪 Forbedret test coverage
- 📚 Udvidet dokumentation
- 🛠️ Developer experience forbedringer

---

## Versioning Guide

### Major (X.0.0)
- Breaking changes der kræver migration
- Store arkitektur ændringer
- Fjernelse af deprecated funktionalitet

### Minor (0.X.0)
- Nye funktioner der er bagudkompatible
- Forbedringer til eksisterende funktioner
- Nye API endpoints

### Patch (0.0.X)
- Fejlrettelser
- Sikkerhedsopdateringer
- Performance forbedringer
- Dokumentation opdateringer

## Migration Guides

### Fra 1.x til 2.0
Se [MIGRATION.md](MIGRATION.md) for detaljeret migration guide.

## Support

- **Aktuelle versioner**: 2.0.x, 1.0.x modtager sikkerhedsopdateringer
- **Legacy versioner**: < 1.0 modtager ikke længere opdateringer
- **LTS Support**: Version 2.0 vil have udvidet support til december 2026

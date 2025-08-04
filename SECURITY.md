# Security Policy

## Supported Versions

Vi understøtter sikkerhedsopdateringer for følgende versioner af WooCommerce Product Manager:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Vi tager sikkerheden i WooCommerce Product Manager meget seriøst. Hvis du opdager en sikkerhedssårbarhed, beder vi dig om at rapportere den ansvarligt.

### Hvordan rapporterer jeg en sårbarhed?

**RAPPORTÉR IKKE sikkerhedsproblemer offentligt via GitHub Issues.**

I stedet, send venligst en email til: **[INDSÆT SIKKERHEDSEMAIL]**

### Hvad skal inkluderes i rapporten?

Inkluder venligst så mange af følgende detaljer som muligt:

- **Beskrivelse** af sårbarheden
- **Trin til at reproducere** problemet
- **Potentiel impact** af sårbarheden
- **Foreslåede løsninger** hvis du har nogen
- **Kontaktinformation** så vi kan følge op

### Hvad kan du forvente?

- **Bekræftelse**: Vi vil bekræfte modtagelse af din rapport inden for 48 timer
- **Initial vurdering**: Vi vil give en initial vurdering af sårbarheden inden for 7 dage
- **Regelmæssige opdateringer**: Vi vil holde dig informeret om fremskridt i løsning af problemet
- **Kredit**: Med din tilladelse vil vi kreditere dig for opdagelsen når sårbarheden er løst

### Vores engagement

- Vi vil besvare din rapport så hurtigt som muligt
- Vi vil arbejde med dig for at forstå og løse problemet
- Vi vil holde dig informeret om fremskridt
- Vi vil anerkende din ansvarlige rapportering

### Tidsramme for løsning

- **Kritiske sårbarheder**: Løses inden for 7 dage
- **Høje sårbarheder**: Løses inden for 30 dage
- **Medium/lave sårbarheder**: Løses inden for 90 dage

### Sikkerhedspraksis

Vores projekt følger disse sikkerhedspraksis:

#### Code Security
- Regelmæssige sikkerhedsaudit af kode
- Automatiserede sikkerhedsscans via GitHub Security
- Afhængighedsovervågning med automated updates

#### Data Security
- Krypterede forbindelser (HTTPS/TLS)
- Sikker håndtering af API nøgler
- Input validering og sanitization
- SQL injection beskyttelse via parameterized queries

#### Infrastructure Security
- Container sikkerhed med minimal base images
- Miljøvariabler til sensitive konfigurationer
- Rate limiting på API endpoints

### Sikkerhedsopdateringer

Sikkerhedsopdateringer vil blive:
- Udgivet så hurtigt som muligt
- Dokumenteret i release notes
- Kommunikeret via GitHub Security Advisories
- Tagget med `security` label

### Afhængigheder

Vi overvåger og opdaterer regelmæssigt vores afhængigheder:
- Automatiserede sikkerhedsscans af npm packages
- Ugentlige checks for nye sårbarheder
- Hurtig respons på critical security updates

### Kontakt

For sikkerhedsrelaterede spørgsmål:
- **Email**: [INDSÆT SIKKERHEDSEMAIL]
- **PGP Key**: [INDSÆT PGP KEY HVIS RELEVANT]

For generelle spørgsmål, brug GitHub Issues.

---

**Tak for at hjælpe med at holde WooCommerce Product Manager sikkert!** 🔒

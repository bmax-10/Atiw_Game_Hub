# Game Hub

Unsere Plattform für selbst programmierte Browser-Games.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS v4
- **Datenbank:** Neon PostgreSQL + Drizzle ORM (Phase 4)
- **Auth:** Better Auth (Phase 5)
- **Hosting:** Vercel
- **Package Manager:** npm

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) im Browser.

## Befehle

| Befehl | Beschreibung |
|--------|-------------|
| `npm run dev` | Startet den Entwicklungsserver |
| `npm run build` | Erstellt den Production Build |
| `npm run start` | Startet den Production Server |
| `npm run lint` | Prüft den Code mit ESLint |

## Projektstruktur

```
game-hub/
├── src/
│   ├── app/          # Next.js App Router Seiten
│   ├── components/   # React Komponenten
│   ├── lib/          # Hilfsfunktionen & Konfiguration
│   └── types/        # TypeScript Typen
├── games/            # Browser-Games (HTML/JS/CSS)
├── db/               # Datenbankschema & Migrations
├── public/           # Statische Dateien (Bilder, Icons)
└── .env.example      # Environment Variables Vorlage
```

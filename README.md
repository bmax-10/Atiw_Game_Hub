# Game Hub

Eine kleine Plattform für unsere selbst programmierten Browser-Games. Neue Spiele werden ausschließlich per Code und Registry ergänzt – es gibt keinen öffentlichen Upload, keine Suche, keine Kategorien und keine Bewertungen.

## Bereits enthalten

- Startseite und Spieleübersicht
- Game Overview vor dem Spielstart
- Spielbarer Snake-Prototyp mit Tastatur- und Touchsteuerung
- Responsive Player mit Vollbildmodus
- Zentrale Game-Registry in `src/lib/games.ts`
- Eigenes Leaderboard pro Spiel
- Drizzle-Schema und Migrationen für Neon PostgreSQL
- Better Auth für E-Mail/Passwort-Accounts
- Serverseitig signierte Spiel-Sessions, Score-Validierung und Rate Limit
- Tests für Registry und Score-Regeln

## Lokaler Start

```bash
npm install
npm run dev
```

Die App ist danach unter [http://localhost:3000](http://localhost:3000) erreichbar. Die Spieleoberfläche und Snake funktionieren ohne Datenbank. Für echte Accounts und gespeicherte Scores ist die folgende Einrichtung notwendig.

## Neon einrichten

1. `.env.example` nach `.env.local` kopieren.
2. In Neon eine PostgreSQL-Datenbank erstellen und deren Verbindungszeichenfolge als `DATABASE_URL` eintragen.
3. Für `BETTER_AUTH_SECRET` und `GAME_SCORE_SECRET` jeweils eigene lange Zufallswerte setzen.
4. Die Datenbanktabellen anlegen:

```bash
npm run db:migrate
```

Danach sind Registrierung, Login, Session, Score-Speicherung und die echten Leaderboards aktiv. Für Details zu Backups und dem lokalen Betrieb siehe [docs/operations.md](docs/operations.md).

## Wichtige Befehle

| Befehl | Zweck |
| --- | --- |
| `npm run dev` | Entwicklungsserver starten |
| `npm run lint` | Code prüfen |
| `npm test` | Registry- und Score-Tests ausführen |
| `npm run build` | Production Build erzeugen |
| `npm run db:generate` | Migration aus Schemaänderungen erzeugen |
| `npm run db:migrate` | Migrationen auf Neon anwenden |

## Neues Spiel ergänzen

1. Dateien unter `public/games/<game-id>/` anlegen.
2. Das Spiel in `src/lib/games.ts` registrieren.
3. Die Game-UI kann mit `postMessage` das Ereignis `GAME_OVER` inklusive `gameId`, `version` und `score` an den Player schicken.
4. Bei neuen Score-Regeln die serverseitige Plausibilitätsprüfung und die Tests anpassen.

## Projektstruktur

```text
src/
  app/                 Seiten und API-Endpunkte
  components/          UI und Game Player
  lib/                 Registry, Auth, Datenbank und Score-Regeln
  types/               Gemeinsame Typen
public/games/          Eigene Browser-Games
db/migrations/         Drizzle-Migrationen
docs/                  Betrieb und Backup-Hinweise
```

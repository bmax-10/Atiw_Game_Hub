# Betrieb ohne Vercel

## Lokaler Start

```bash
npm install
npm run dev
```

Die App läuft dann unter `http://localhost:3000`. Ohne `.env.local` ist die Spieleoberfläche voll nutzbar; Anmeldung und gespeicherte Scores zeigen bewusst den Einrichtungszustand statt erfundener Daten.

## Neon und lokale Datenbankmigration

1. In Neon eine PostgreSQL-Datenbank erstellen.
2. Die Verbindungszeichenfolge in `.env.local` als `DATABASE_URL` eintragen.
3. Je einen langen Zufallswert für `BETTER_AUTH_SECRET` und `GAME_SCORE_SECRET` setzen.
4. Die vorhandene Migration anwenden:

```bash
npm run db:migrate
```

Danach können sich Spieler registrieren, einloggen und Scores speichern.

## Backups

Backups sind eine Einstellung der Datenbank, nicht des Browser-Codes. Aktiviere für die Neon-Datenbank Point-in-Time Recovery bzw. die vom gewählten Neon-Tarif angebotenen Backups und teste mindestens monatlich eine Wiederherstellung in einer separaten Datenbank. Vor größeren Schemaänderungen sollte zusätzlich ein manueller Export erstellt werden.

## Grenzen des ersten Anti-Cheat-Schutzes

Jede Runde erhält nach erfolgreicher Anmeldung einen kurzlebigen, serverseitig signierten Token. Der Score-Endpunkt prüft Login, Spiel-ID, Version, Token, einmalige Nutzung, Wertebereich und ein lokales Rate Limit. Das erschwert einfache Manipulationen, kann bei einem reinen Browsergame aber keinen perfekten Cheat-Schutz garantieren. Für mehrere Server-Instanzen sollte das Rate Limit später durch Redis ersetzt werden.

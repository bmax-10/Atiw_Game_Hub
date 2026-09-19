import type { LeaderboardData } from "@/lib/scores";

export function Leaderboard({ data, scoreLabel }: { data: LeaderboardData; scoreLabel: string }) {
  if (data.mode === "unavailable") {
    return (
      <div className="notice notice--warning">
        <strong>Leaderboard noch nicht bereit.</strong>
        <p>Die Datenbank ist erreichbar, aber die Tabellen fehlen oder die Verbindung ist nicht gültig. Führe die Migration aus.</p>
      </div>
    );
  }

  return (
    <>
      {data.mode === "demo" && (
        <div className="notice">
          <strong>Demo-Leaderboard</strong>
          <p>Verbinde Neon und richte einen Account ein, um echte Scores zu speichern.</p>
        </div>
      )}
      <div className="leaderboard-table" role="region" aria-label="Bestenliste">
        <div className="leaderboard-row leaderboard-row--heading">
          <span>Rang</span><span>Spieler</span><span>{scoreLabel}</span><span>Version</span>
        </div>
        {data.entries.length ? data.entries.map((entry) => (
          <div className={`leaderboard-row ${entry.isCurrentUser ? "leaderboard-row--you" : ""}`} key={`${entry.rank}-${entry.player}-${entry.score}`}>
            <span>#{entry.rank}</span><strong>{entry.player}</strong><span>{entry.score.toLocaleString("de-DE")}</span><span>v{entry.gameVersion}</span>
          </div>
        )) : <p className="empty-state">Noch keine Scores. Spiele die erste Runde!</p>}
      </div>
      {data.personalEntry && data.personalEntry.rank > 10 && (
        <aside className="personal-rank">
          <p>Deine Position</p>
          <strong>#{data.personalEntry.rank}</strong>
          <span>{data.personalEntry.score.toLocaleString("de-DE")} {scoreLabel.toLowerCase()}</span>
        </aside>
      )}
    </>
  );
}

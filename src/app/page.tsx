import Link from "next/link";
import { GameCard } from "@/components/game-card";
import { GameArt } from "@/components/game-art";
import { games } from "@/lib/games";

export default function Home() {
  const featuredGame = games[0];

  return (
    <main>
      <section className="hero">
        <div className="shell hero__grid">
          <div className="hero__copy">
            <p className="eyebrow">Selbst gemacht. Direkt spielbar.</p>
            <h1>Spiele von uns,<br /><em>für euch.</em></h1>
            <p className="hero__lead">
              Game Hub ist die Heimat unserer selbst programmierten Browser-Games – ohne Werbung, Upload-Chaos oder unnötige Kategorien.
            </p>
            <div className="hero__actions">
              <Link className="button" href="/games">Spiele entdecken</Link>
              <Link className="button button--quiet" href={`/games/${featuredGame.id}`}>Aktuelles Spiel</Link>
            </div>
          </div>
          <GameArt game={featuredGame} className="hero__art" />
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Unsere Spiele</p>
            <h2>Eine kleine Sammlung,<br />mit Liebe gebaut.</h2>
          </div>
          <Link className="text-link" href="/games">Alle Spiele ansehen <span aria-hidden="true">→</span></Link>
        </div>
        <div className="game-grid">
          {games.map((game) => <GameCard game={game} key={game.id} />)}
        </div>
      </section>

      <section className="section shell feature-band">
        <div>
          <p className="eyebrow">Echte Bestleistungen</p>
          <h2>Spiel eine Runde.<br />Hol dir den Highscore.</h2>
        </div>
        <div className="feature-band__copy">
          <p>Jedes Spiel hat sein eigenes Leaderboard. Deine Scores werden erst nach Anmeldung und einer serverseitigen Prüfung gespeichert.</p>
          <Link className="button button--quiet" href="/leaderboard/snake">Zum Snake-Leaderboard</Link>
        </div>
      </section>
    </main>
  );
}

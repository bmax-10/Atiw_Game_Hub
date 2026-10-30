import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GameArt } from "@/components/game-art";
import { games, getGame } from "@/lib/games";

type GamePageProps = { params: Promise<{ gameId: string }> };

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const game = getGame((await params).gameId);
  return { title: game ? game.title : "Spiel nicht gefunden" };
}

export default async function GameOverviewPage({ params }: GamePageProps) {
  const game = getGame((await params).gameId);
  if (!game) notFound();

  return (
    <main className="shell page-section">
      <Link className="back-link" href="/games">← Alle Spiele</Link>
      <section className="game-overview">
        <GameArt game={game} className="game-overview__art" />
        <div className="game-overview__content">
          <p className="eyebrow">{game.developer}</p>
          <h1>{game.title}</h1>
          <p className="game-overview__description">{game.description}</p>
          <dl className="game-meta">
            <div><dt>Version</dt><dd>{game.version}</dd></div>
            <div><dt>Veröffentlicht</dt><dd>{game.releaseDate}</dd></div>
            <div><dt>Mobil</dt><dd>{game.mobile ? "Ja, mit Touch-Steuerung" : "Für Desktop optimiert"}</dd></div>
          </dl>
          <div className="hero__actions">
            <Link className="button" href={`/games/${game.id}/play`}>Spielen</Link>
            <Link className="button button--quiet" href={`/leaderboard/${game.id}`}>Leaderboard</Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GamePlayer } from "@/components/game-player";
import { getGame } from "@/lib/games";

type PlayPageProps = { params: Promise<{ gameId: string }> };

export async function generateMetadata({ params }: PlayPageProps): Promise<Metadata> {
  const game = getGame((await params).gameId);
  return { title: game ? `${game.title} spielen` : "Spiel nicht gefunden" };
}

export default async function PlayPage({ params }: PlayPageProps) {
  const game = getGame((await params).gameId);
  if (!game) notFound();

  return (
    <main className="shell page-section play-page">
      <div className="play-page__heading">
        <div>
          <Link className="back-link" href={`/games/${game.id}`}>← Zur Spielübersicht</Link>
          <h1>{game.title} spielen</h1>
        </div>
        <Link className="button button--quiet button--small" href={`/leaderboard/${game.id}`}>Leaderboard</Link>
      </div>
      <GamePlayer game={game} />
      <p className="player-hint">Steuerung: Pfeiltasten oder WASD. Auf Touchgeräten stehen die Tasten unter dem Spiel bereit.</p>
    </main>
  );
}

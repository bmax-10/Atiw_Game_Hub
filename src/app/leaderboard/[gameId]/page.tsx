import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { Leaderboard } from "@/components/leaderboard";
import { getGame } from "@/lib/games";
import { getLeaderboard } from "@/lib/scores";

type LeaderboardPageProps = { params: Promise<{ gameId: string }> };

export async function generateMetadata({ params }: LeaderboardPageProps): Promise<Metadata> {
  const game = getGame((await params).gameId);
  return { title: game ? `${game.title} Leaderboard` : "Spiel nicht gefunden" };
}

export default async function LeaderboardPage({ params }: LeaderboardPageProps) {
  const game = getGame((await params).gameId);
  if (!game) notFound();

  const session = auth ? await auth.api.getSession({ headers: await headers() }) : null;
  const data = await getLeaderboard(game.id, session?.user.id);

  return (
    <main className="shell page-section leaderboard-page">
      <Link className="back-link" href={`/games/${game.id}`}>← Zu {game.title}</Link>
      <p className="eyebrow">Bestenliste</p>
      <h1 className="page-title">{game.title} Leaderboard</h1>
      <p className="page-intro">Die zehn besten serverseitig gespeicherten Runden. Scores behalten immer ihre Spielversion.</p>
      <Leaderboard data={data} scoreLabel={game.scoreLabel} />
      <div className="leaderboard-page__cta">
        <Link className="button" href={`/games/${game.id}/play`}>Eigene Runde spielen</Link>
      </div>
    </main>
  );
}

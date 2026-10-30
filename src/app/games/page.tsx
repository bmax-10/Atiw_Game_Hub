import type { Metadata } from "next";
import { GameCard } from "@/components/game-card";
import { games } from "@/lib/games";

export const metadata: Metadata = { title: "Spiele" };

export default function GamesPage() {
  return (
    <main className="shell page-section">
      <p className="eyebrow">Die Sammlung</p>
      <h1 className="page-title">Unsere Spiele</h1>
      <p className="page-intro">Hier landet nur Code, den wir selbst schreiben. Wähle ein Spiel aus, lies kurz nach und starte dann deine Runde.</p>
      <div className="game-grid game-grid--spacious">
        {games.map((game) => <GameCard game={game} key={game.id} />)}
      </div>
    </main>
  );
}

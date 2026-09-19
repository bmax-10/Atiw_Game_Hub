import Link from "next/link";
import type { Game } from "@/types/game";
import { GameArt } from "./game-art";

export function GameCard({ game }: { game: Game }) {
  return (
    <article className="game-card">
      <GameArt game={game} className="game-card__art" />
      <div className="game-card__content">
        <div className="game-card__headline">
          <div>
            <p className="eyebrow">{game.developer}</p>
            <h3>{game.title}</h3>
          </div>
          <span className="version-badge">v{game.version}</span>
        </div>
        <p>{game.shortDescription}</p>
        <Link className="text-link" href={`/games/${game.id}`}>
          Spiel ansehen <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

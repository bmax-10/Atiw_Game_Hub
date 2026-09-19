import type { Game } from "@/types/game";

type GameArtProps = {
  game: Game;
  className?: string;
};

export function GameArt({ game, className = "" }: GameArtProps) {
  return (
    <div
      className={`game-art game-art--${game.accent} ${className}`}
      aria-label={`${game.title} Vorschau`}
      role="img"
    >
      <div className="game-art__grid" aria-hidden="true" />
      <div className="game-art__snake" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="game-art__apple" aria-hidden="true" />
      <p className="game-art__label">{game.title}</p>
      <p className="game-art__version">v{game.version}</p>
    </div>
  );
}

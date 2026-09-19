import type { Game } from "@/types/game";

export const games: Game[] = [
  {
    id: "snake",
    title: "Snake",
    shortDescription: "Der Arcade-Klassiker – neu gebaut für Game Hub.",
    description:
      "Steuere die Schlange, sammle Äpfel und überlebe so lange wie möglich. Jede Frucht macht die Schlange länger und das Spielfeld anspruchsvoller.",
    developer: "Max & Friends",
    version: "1.0.0",
    releaseDate: "19. September 2026",
    mobile: true,
    accent: "lime",
    scoreLabel: "Punkte",
  },
];

export function getGame(gameId: string) {
  return games.find((game) => game.id === gameId);
}

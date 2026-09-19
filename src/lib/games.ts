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
  {
    id: "blackjack",
    title: "Blackjack",
    shortDescription: "Der Casino-Klassiker gegen den Dealer.",
    description: "Versuche mit deinen Karten näher an 21 zu kommen als der Dealer, ohne dich zu überkaufen.",
    developer: "Game Hub",
    version: "1.0.0",
    releaseDate: "20. September 2026",
    mobile: true,
    accent: "blue",
    scoreLabel: "Chips",
  },
  {
    id: "keno",
    title: "Keno",
    shortDescription: "Wähle deine Glückszahlen und gewinne.",
    description: "Wähle bis zu 10 Zahlen aus 40. Je mehr Treffer bei der Ziehung, desto höher der Gewinn.",
    developer: "Game Hub",
    version: "1.0.0",
    releaseDate: "20. September 2026",
    mobile: true,
    accent: "purple",
    scoreLabel: "Chips",
  },
];

export function getGame(gameId: string) {
  return games.find((game) => game.id === gameId);
}

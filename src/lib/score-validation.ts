export function isPlausibleScore(gameId: string, score: number) {
  if (!Number.isInteger(score) || score < 0 || score > 100_000) return false;
  return gameId !== "snake" || score % 10 === 0;
}

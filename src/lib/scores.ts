import "server-only";
import { desc, eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db, isDatabaseConfigured } from "./db";
import { scores, user } from "./schema";

export type LeaderboardEntry = {
  rank: number;
  player: string;
  score: number;
  gameVersion: string;
  isCurrentUser: boolean;
};

export type LeaderboardData = {
  entries: LeaderboardEntry[];
  mode: "live" | "demo" | "unavailable";
  personalEntry?: LeaderboardEntry;
};

const demoEntries: Record<string, Omit<LeaderboardEntry, "rank" | "isCurrentUser">[]> = {
  snake: [
    { player: "Mira", score: 480, gameVersion: "1.0.0" },
    { player: "Alex", score: 390, gameVersion: "1.0.0" },
    { player: "Sami", score: 320, gameVersion: "1.0.0" },
    { player: "Noah", score: 270, gameVersion: "1.0.0" },
    { player: "Lea", score: 210, gameVersion: "1.0.0" },
  ],
};

export async function getLeaderboard(gameId: string, currentUserId?: string): Promise<LeaderboardData> {
  if (!isDatabaseConfigured || !db) {
    return {
      mode: "demo",
      entries: (demoEntries[gameId] ?? []).map((entry, index) => ({
        ...entry,
        rank: index + 1,
        isCurrentUser: false,
      })),
    };
  }

  try {
    const rows = await db
      .select({
        userId: scores.userId,
        player: user.name,
        score: scores.score,
        gameVersion: scores.gameVersion,
      })
      .from(scores)
      .innerJoin(user, eq(scores.userId, user.id))
      .where(eq(scores.gameId, gameId))
      .orderBy(desc(scores.score), desc(scores.createdAt));

    const entries = rows.slice(0, 10).map((row, index) => ({
      rank: index + 1,
      player: row.player,
      score: row.score,
      gameVersion: row.gameVersion,
      isCurrentUser: row.userId === currentUserId,
    }));
    const personalIndex = rows.findIndex((row) => row.userId === currentUserId);

    return {
      mode: "live",
      entries,
      personalEntry:
        personalIndex === -1
          ? undefined
          : {
              rank: personalIndex + 1,
              player: rows[personalIndex].player,
              score: rows[personalIndex].score,
              gameVersion: rows[personalIndex].gameVersion,
              isCurrentUser: true,
            },
    };
  } catch {
    return { mode: "unavailable", entries: [] };
  }
}

export async function saveScore(input: {
  gameId: string;
  gameVersion: string;
  score: number;
  userId: string;
}) {
  if (!db) throw new Error("Datenbank ist nicht konfiguriert.");
  await db.insert(scores).values({ id: randomUUID(), ...input });
}

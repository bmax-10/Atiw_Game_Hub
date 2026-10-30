import { auth } from "@/lib/auth";
import { getGame } from "@/lib/games";
import {
  consumeScoreSession,
  hasSessionBeenUsed,
  isRateLimited,
  readScoreSession,
} from "@/lib/score-security";
import { saveScore } from "@/lib/scores";
import { isPlausibleScore } from "@/lib/score-validation";
import { headers } from "next/headers";
import { z } from "zod";

export const runtime = "nodejs";

const scoreSchema = z.object({
  gameId: z.string().min(1),
  gameVersion: z.string().min(1),
  score: z.number().int().nonnegative(),
  sessionToken: z.string().min(1),
});

export async function POST(request: Request) {
  if (!auth) {
    return Response.json(
      { error: "Score-Speicherung ist noch nicht eingerichtet." },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Bitte melde dich an, um deinen Score zu speichern." }, { status: 401 });
  }

  const parsed = scoreSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Ungültige Score-Daten." }, { status: 400 });
  }

  const { gameId, gameVersion, score, sessionToken } = parsed.data;
  const game = getGame(gameId);
  if (!game || game.version !== gameVersion || !isPlausibleScore(gameId, score)) {
    return Response.json({ error: "Der Score konnte nicht validiert werden." }, { status: 422 });
  }

  const scoreSession = readScoreSession(sessionToken);
  if (
    !scoreSession ||
    scoreSession.userId !== session.user.id ||
    scoreSession.gameId !== gameId ||
    scoreSession.gameVersion !== gameVersion ||
    hasSessionBeenUsed(scoreSession.nonce)
  ) {
    return Response.json({ error: "Die Spiel-Session ist ungültig oder abgelaufen." }, { status: 403 });
  }

  if (isRateLimited(`${session.user.id}:${gameId}`)) {
    return Response.json(
      { error: "Zu viele Score-Anfragen. Bitte warte kurz und spiele eine neue Runde." },
      { status: 429 },
    );
  }

  try {
    consumeScoreSession(scoreSession.nonce);
    await saveScore({ gameId, gameVersion, score, userId: session.user.id });
    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json(
      { error: "Der Score konnte nicht gespeichert werden. Prüfe die Datenbankmigration." },
      { status: 503 },
    );
  }
}

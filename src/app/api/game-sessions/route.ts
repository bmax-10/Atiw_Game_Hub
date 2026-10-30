import { auth } from "@/lib/auth";
import { getGame } from "@/lib/games";
import { createScoreSession } from "@/lib/score-security";
import { z } from "zod";
import { headers } from "next/headers";

export const runtime = "nodejs";

const requestSchema = z.object({ gameId: z.string().min(1) });

export async function POST(request: Request) {
  if (!auth) {
    return Response.json(
      { error: "Anmeldung und Score-Sessions benötigen eine eingerichtete Datenbank." },
      { status: 503 },
    );
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return Response.json({ error: "Bitte melde dich an, um Scores zu speichern." }, { status: 401 });
  }

  const parsed = requestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Ungültige Spielanfrage." }, { status: 400 });
  }

  const game = getGame(parsed.data.gameId);
  if (!game) {
    return Response.json({ error: "Dieses Spiel existiert nicht." }, { status: 404 });
  }

  const token = createScoreSession({
    gameId: game.id,
    gameVersion: game.version,
    userId: session.user.id,
  });
  if (!token) {
    return Response.json(
      { error: "GAME_SCORE_SECRET fehlt in .env.local." },
      { status: 503 },
    );
  }

  return Response.json({ token, expiresInSeconds: 15 * 60 });
}

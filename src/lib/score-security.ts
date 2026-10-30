import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";

const SESSION_LIFETIME_MS = 15 * 60 * 1000;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_SCORE_SUBMISSIONS_PER_WINDOW = 5;

type ScoreSessionPayload = {
  gameId: string;
  gameVersion: string;
  userId: string;
  nonce: string;
  expiresAt: number;
};

const usedSessions = new Set<string>();
const submissionAttempts = new Map<string, number[]>();

function getSecret() {
  return process.env.GAME_SCORE_SECRET;
}

function sign(encodedPayload: string, secret: string) {
  return createHmac("sha256", secret).update(encodedPayload).digest("base64url");
}

export function createScoreSession(input: Omit<ScoreSessionPayload, "nonce" | "expiresAt">) {
  const secret = getSecret();
  if (!secret) return null;

  const payload: ScoreSessionPayload = {
    ...input,
    nonce: randomUUID(),
    expiresAt: Date.now() + SESSION_LIFETIME_MS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encodedPayload}.${sign(encodedPayload, secret)}`;
}

export function readScoreSession(token: string) {
  const secret = getSecret();
  const [encodedPayload, signature] = token.split(".");
  if (!secret || !encodedPayload || !signature) return null;

  const expected = sign(encodedPayload, secret);
  const suppliedBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (
    suppliedBytes.length !== expectedBytes.length ||
    !timingSafeEqual(suppliedBytes, expectedBytes)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as ScoreSessionPayload;
    if (
      !payload.gameId ||
      !payload.gameVersion ||
      !payload.userId ||
      !payload.nonce ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function hasSessionBeenUsed(nonce: string) {
  return usedSessions.has(nonce);
}

export function consumeScoreSession(nonce: string) {
  usedSessions.add(nonce);
}

export function isRateLimited(key: string) {
  const now = Date.now();
  const current = (submissionAttempts.get(key) ?? []).filter(
    (timestamp) => timestamp > now - RATE_WINDOW_MS,
  );
  if (current.length >= MAX_SCORE_SUBMISSIONS_PER_WINDOW) {
    submissionAttempts.set(key, current);
    return true;
  }
  current.push(now);
  submissionAttempts.set(key, current);
  return false;
}

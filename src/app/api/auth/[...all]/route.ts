import { auth, authSetupMessage } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

const handlers = auth ? toNextJsHandler(auth) : null;

function unavailable() {
  return Response.json({ error: authSetupMessage }, { status: 503 });
}

export async function GET(request: Request) {
  return handlers ? handlers.GET(request) : unavailable();
}

export async function POST(request: Request) {
  return handlers ? handlers.POST(request) : unavailable();
}

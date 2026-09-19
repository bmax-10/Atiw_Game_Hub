"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Game } from "@/types/game";

type GameMessage = {
  type: "GAME_OVER" | "GAME_STARTED";
  gameId: string;
  score?: number;
  version: string;
};

export function GamePlayer({ game }: { game: Game }) {
  const playerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [scoreStatus, setScoreStatus] = useState(
    "Du kannst sofort spielen. Melde dich an, um Scores zu speichern.",
  );

  const startScoreSession = useCallback(async () => {
    try {
      const response = await fetch("/api/game-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameId: game.id }),
      });
      const data = (await response.json()) as { token?: string; error?: string };
      if (response.ok && data.token) {
        setSessionToken(data.token);
        setScoreStatus("Score-Session bereit. Dein Ergebnis wird nach Game Over gespeichert.");
      } else if (data.error) {
        setSessionToken(null);
        setScoreStatus(data.error);
      }
    } catch {
      setSessionToken(null);
      setScoreStatus("Score-Service ist gerade nicht erreichbar.");
    }
  }, [game.id]);

  useEffect(() => {
    void startScoreSession();
  }, [startScoreSession]);

  const submitScore = useCallback(
    async (score: number, version: string) => {
      if (!sessionToken) {
        setScoreStatus("Score nicht gespeichert: Bitte anmelden und eine neue Runde starten.");
        return;
      }
      setScoreStatus("Score wird serverseitig geprüft …");
      try {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            gameId: game.id,
            gameVersion: version,
            score,
            sessionToken,
          }),
        });
        const data = (await response.json()) as { error?: string };
        setScoreStatus(
          response.ok
            ? `Dein Score von ${score} wurde gespeichert.`
            : data.error ?? "Der Score konnte nicht gespeichert werden.",
        );
      } catch {
        setScoreStatus("Der Score-Service ist gerade nicht erreichbar.");
      }
    },
    [game.id, sessionToken],
  );

  useEffect(() => {
    const onMessage = (event: MessageEvent<GameMessage>) => {
      if (
        event.origin !== window.location.origin ||
        event.source !== frameRef.current?.contentWindow ||
        event.data.gameId !== game.id ||
      ) {
        return;
      }
      if (event.data.type === "GAME_STARTED") {
        void startScoreSession();
      }
      if (event.data.type === "GAME_OVER" && Number.isInteger(event.data.score)) {
        void submitScore(event.data.score, event.data.version);
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [game.id, startScoreSession, submitScore]);

  function sendControl(control: "up" | "down" | "left" | "right" | "restart") {
    frameRef.current?.contentWindow?.postMessage(
      { type: "GAME_HUB_CONTROL", control },
      window.location.origin,
    );
  }

  async function enterFullscreen() {
    await playerRef.current?.requestFullscreen();
  }

  return (
    <section className="game-player" aria-label={`${game.title} Spielbereich`}>
      <div className="game-player__bar">
        <p><span className="status-dot" /> {scoreStatus}</p>
        <button className="button button--quiet button--small" onClick={enterFullscreen} type="button">
          Vollbild
        </button>
      </div>
      <div className="game-player__frame" ref={playerRef}>
        <iframe
          ref={frameRef}
          src={`/games/${game.id}/index.html`}
          title={`${game.title} spielen`}
          allowFullScreen
        />
      </div>
      {game.mobile && (
        <div className="touch-controls" aria-label="Spielsteuerung für Touchgeräte">
          <button aria-label="Nach oben" onClick={() => sendControl("up")} type="button">↑</button>
          <button aria-label="Nach links" onClick={() => sendControl("left")} type="button">←</button>
          <button aria-label="Neu starten" onClick={() => sendControl("restart")} type="button">↻</button>
          <button aria-label="Nach rechts" onClick={() => sendControl("right")} type="button">→</button>
          <button aria-label="Nach unten" onClick={() => sendControl("down")} type="button">↓</button>
        </div>
      )}
    </section>
  );
}

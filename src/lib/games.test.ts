import { describe, expect, it } from "vitest";
import { games, getGame } from "./games";

describe("game registry", () => {
  it("uses unique, routable game ids", () => {
    const ids = games.map((game) => game.id);
    expect(ids).toEqual([...new Set(ids)]);
    expect(ids).toContain("snake");
  });

  it("finds registered games and rejects unknown ids", () => {
    expect(getGame("snake")?.version).toBe("1.0.0");
    expect(getGame("not-a-game")).toBeUndefined();
  });
});

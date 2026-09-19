import { describe, expect, it } from "vitest";
import { isPlausibleScore } from "./score-validation";

describe("score validation", () => {
  it("accepts valid Snake point totals", () => {
    expect(isPlausibleScore("snake", 0)).toBe(true);
    expect(isPlausibleScore("snake", 480)).toBe(true);
  });

  it("rejects impossible or malformed score values", () => {
    expect(isPlausibleScore("snake", 17)).toBe(false);
    expect(isPlausibleScore("snake", -10)).toBe(false);
    expect(isPlausibleScore("snake", 100_010)).toBe(false);
  });
});

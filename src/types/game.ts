export type Game = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  developer: string;
  version: string;
  releaseDate: string;
  mobile: boolean;
  accent: "lime" | "amber" | "sky";
  scoreLabel: string;
};

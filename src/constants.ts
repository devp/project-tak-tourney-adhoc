import type { GameResultType } from "./playtak-api/types.ts";

export const GameResultTypes = {
  // Road wins
  WHITE_ROAD: "R-0",
  BLACK_ROAD: "0-R",

  // Flat wins
  WHITE_FLAT: "F-0",
  BLACK_FLAT: "0-F",

  // Other results
  DRAW: "1/2-1/2",
  WHITE_FORFEIT: "1-0",
  BLACK_FORFEIT: "0-1",
} as const satisfies Record<string, GameResultType>;

export const WINS_FOR_WHITE: GameResultType[] = [
  GameResultTypes.WHITE_ROAD,
  GameResultTypes.WHITE_FLAT,
  GameResultTypes.WHITE_FORFEIT,
] as const;

export const WINS_FOR_BLACK: GameResultType[] = [
  GameResultTypes.BLACK_ROAD,
  GameResultTypes.BLACK_FLAT,
  GameResultTypes.BLACK_FORFEIT,
] as const;

export const TIES: GameResultType[] = [GameResultTypes.DRAW] as const;

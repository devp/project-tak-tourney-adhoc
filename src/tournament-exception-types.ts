import type { GameResult } from "./playtak-api/types.ts";

export type TournamentExceptionBase = {
  /** ISO timestamp */
  timestamp: string;
  reason?: string;
};

export type OverrideGameCategory = "regular" | "blitz";

export type IgnoreGameException = TournamentExceptionBase & {
  type: "ignoreGame";
  gameId: number;
};

export type AddGameException = TournamentExceptionBase & {
  type: "addGame";
  gameId: number;
  category: OverrideGameCategory;
};

export type OverrideGameResultException = TournamentExceptionBase & {
  type: "overrideGameResult";
  gameId: number;
  category: OverrideGameCategory;
  result: GameResult;
};

export type ManualResultException = TournamentExceptionBase & {
  type: "manualResult";
  players: [string, string];
  category: OverrideGameCategory;
  result: GameResult;
};

export type TournamentException =
  | IgnoreGameException
  | AddGameException
  | OverrideGameResultException
  | ManualResultException;

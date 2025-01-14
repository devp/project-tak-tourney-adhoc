export type TournamentType = "groupStage" | "knockoutStage";

export type TournamentPlayer = {
  username: string;
  group: string;
  score?: number;
  games_played?: number;
};

/**
 * Note: "all-methods-exhausted" is used when all methods have been exhausted and no winner has been found.
 * In that case, expect multiple winners to be returned.
 */
export type WinnerMethod =
  | "score"
  | "head-to-head"
  | "sonneborn-berger"
  | "blitz"
  | "all-methods-exhausted";

export type TournamentGroup = {
  name: string;
  /** one player, multiple tied players, or null if no winner yet */
  winner: TournamentPlayer | TournamentPlayer[] | null;
  winner_method: WinnerMethod | null;
};

export type TournamentStatusBase = {
  tournamentType: unknown;
  players: Array<TournamentPlayer>;
};

export type GroupTournamentStatus = TournamentStatusBase & {
  tournamentType: "groupStage";
  groups: Array<TournamentGroup>;
};

export type KnockoutTournamentStatus = TournamentStatusBase & {
  tournamentType: "knockoutStage";
  // TODO: implement
};

export type TournamentStatus = GroupTournamentStatus | KnockoutTournamentStatus;

export type TournamentInfo = {
  name?: string;
  tournamentType: TournamentType;
  dateRange: {
    start: Date;
    end: Date;
  };
  players: Array<TournamentPlayer>;
  status?: TournamentStatus;
};

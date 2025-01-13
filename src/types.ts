export type TournamentType = "groupStage" | "knockoutStage";

export type TournamentPlayer = {
  username: string;
  group: string;
  score?: number;
  games_played?: number;
};

export type TournamentGroup = {
  name: string;
  /** one player, multiple tied players, or null if no winner yet */
  winner: TournamentPlayer | TournamentPlayer[] | null;
  winner_method: "score" | "head-to-head" | "sonneborn-berger" | "blitz" | null;
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

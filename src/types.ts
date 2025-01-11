export type TournamentPlayer = {
  username: string;
  group: string;
  score?: number;
};

export type TournamentStatus = {
  players: Array<TournamentPlayer>;
};

export type TournamentInfo = {
  // nothing else yet
} & TournamentStatus;

export type TournamentPlayer = {
  username: string;
  group: string;
  score?: number;
  games_played?: number;
};

export type TournamentStatus = {
  players: Array<TournamentPlayer>;
};

export type TournamentInfo = {
  name?: string;
  dateRange: {
    start: Date;
    end: Date;
  };
} & TournamentStatus;

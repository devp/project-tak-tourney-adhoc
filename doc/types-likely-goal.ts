// Player-related types
export type TournamentPlayer = {
  username: string;
  group: string;
  score?: number;
  gamesPlayed: number;
  matchesCompleted: number;
  matchesPerWeek: number;  // For tracking 2 matches/week requirement
  withdrawn?: {
    date: string;
    reason: string;
    by: string;
  };
  tiebreakers?: {
    headToHead: number;        // Points in games against tied players
    sonnebornBerger: number;   // Sum of scores of defeated opponents
    blitzGamesPlayed: number;  // In case needed for final tiebreak
    blitzScore?: number;
  };
};

// Match tracking
export type GameResult = {
  white: string;
  black: string;
  winner: string | "draw";
  date: string;
  timeControl: {
    main: number;
    increment: number;
  };
  override?: {
    originalResult: string | "draw";
    reason: string;
    by: string;
    date: string;
  };
};

export type MatchPairing = {
  player1: string;
  player2: string;
  games: GameResult[];
  scheduledWeek?: number;  // For tracking 2 matches/week requirement
  complete: boolean;
};

// Knockout stage specific
export type BracketMatch = MatchPairing & {
  round: number;
  matchNumber: number;
  winner?: string;
  nextMatchNumber?: number;  // For tracking progression
};

export type TournamentStage = "group" | "knockout";

export type TournamentStatus = {
  players: Array<TournamentPlayer>;
  currentStage: TournamentStage;
  groups: {
    [groupId: string]: {
      matches: MatchPairing[];
      complete: boolean;
      winner?: string;
    };
  };
  bracket?: {
    rounds: number;
    matches: BracketMatch[];
    currentRound: number;
  };
  errors?: Array<{
    type: "validation" | "scoring" | "override" | "withdrawal";
    message: string;
    context: any;
    timestamp: string;
  }>;
};

export type TournamentInfo = {
  id: string;
  name: string;
  dateRange: {
    start: string;
    end: string;
  };
  timeControls: {
    regular: {
      main: number;    // 15
      increment: number;  // 10
    };
    blitz: {
      main: number;    // 3
      increment: number;  // 5
    };
  };
  rules: {
    boardSize: number;  // 6
    matchesPerWeek: number;  // 2
    pointsPerWin: number;    // 2
    pointsPerDraw: number;   // 1
  };
} & TournamentStatus;
export type GameResultType = "R-0" | "0-R" | "F-0" | "0-F" | "1/2-1/2" | "1-0" | "0-1" | "0-0";

export type GameResult = {
  id: number;
  date: number;
  size: number;
  player_white: string;
  player_black: string;
  notation: string;
  result: GameResultType;
  timertime: number;
  timerinc: number;
  rating_white: number;
  rating_black: number;
  unrated: 0 | 1;
  tournament: 0 | 1 | 2;
  komi: number;
  pieces: number;
  capstones: number;
  rating_change_white: number;
  rating_change_black: number;
  extra_time_amount?: number;
  extra_time_trigger?: number;
};

export type GameListResponse = {
  items: GameResult[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
};

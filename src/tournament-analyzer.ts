import type { GameResult } from "PlaytakGamesApi";
import type { TournamentInfo, TournamentStatus } from "./types";

export function analyzeTournamentProgress({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  tournamentInfo,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  games,
}: {
  tournamentInfo: TournamentInfo;
  games: GameResult[];
}): TournamentStatus {
  const status: TournamentStatus = {};
  return status;
}

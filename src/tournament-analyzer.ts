import type { PlaytakGamesApi } from "./playtak-api/types";
import type { TournamentInfo, TournamentStatus } from "./types";

export function analyzeTournamentProgress({
    tournamentInfo,
    games
}: {
    tournamentInfo: TournamentInfo,
    games: PlaytakGamesApi.GameResult[]
}): TournamentStatus {
    let status: TournamentStatus = {};
    return status;
}
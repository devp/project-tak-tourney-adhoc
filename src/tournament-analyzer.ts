import { TIES, WINS_FOR_BLACK, WINS_FOR_WHITE } from "./constants.ts";
import type { GameResult } from "./playtak-api/types";
import type { TournamentInfo, TournamentStatus } from "./types";

export function analyzeTournamentProgress({
  tournamentInfo,

  games,
}: {
  tournamentInfo: TournamentInfo;
  games: GameResult[];
}): TournamentStatus {
  // initialize scores to zero
  const playerMapWithScores = Object.fromEntries(
    tournamentInfo.players.map((player) => [
      player.username,
      { ...player, score: 0, games_played: 0 },
    ])
  );

  // update scores based on game results
  for (const game of games) {
    const whitePlayer = playerMapWithScores[game.player_white];
    const blackPlayer = playerMapWithScores[game.player_black];
    if (!whitePlayer || !blackPlayer) {
      throw new Error("Player not found");
    } // TODO: handle this better

    // add 2 points to the winner and 1 point for a tie
    if (WINS_FOR_WHITE.includes(game.result)) {
      whitePlayer.score += 2;
    } else if (WINS_FOR_BLACK.includes(game.result)) {
      blackPlayer.score += 2;
    } else if (TIES.includes(game.result)) {
      whitePlayer.score += 1;
      blackPlayer.score += 1;
    } else {
      throw new Error(`Unknown game result: ${game.result}`); // TODO: handle this better
    }

    whitePlayer.games_played += 1;
    blackPlayer.games_played += 1;
  }

  const status: TournamentStatus = {
    players: Object.values(playerMapWithScores),
  };
  return status;
}

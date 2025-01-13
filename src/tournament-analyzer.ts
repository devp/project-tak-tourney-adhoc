import { TIES, WINS_FOR_BLACK, WINS_FOR_WHITE } from "./constants.ts";
import type { GameResult } from "./playtak-api/types";
import type {
  GroupTournamentStatus,
  TournamentGroup,
  TournamentInfo,
  TournamentStatus,
} from "./types";
import { groupBy } from "./utils.ts";

const UNGROUPED = "UNGROUPED";

function analyzeGroupTournamentProgress({
  tournamentInfo,
  games,
}: {
  tournamentInfo: TournamentInfo;
  games: GameResult[];
}): GroupTournamentStatus {
  // initialize scores to zero
  const playerMapWithScores = Object.fromEntries(
    tournamentInfo.players.map((player) => [
      player.username,
      { ...player, score: 0, games_played: 0 },
    ])
  );

  // update scores based on game results
  for (const game of games) {
    if (
      game.date < tournamentInfo.dateRange.start.getTime() ||
      game.date > tournamentInfo.dateRange.end.getTime()
    ) {
      continue;
    }

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

  const groupedPlayers = groupBy(Object.values(playerMapWithScores), (p) => p.group ?? UNGROUPED);

  const groups: TournamentGroup[] = Object.entries(groupedPlayers).map(([groupName, players]) => {
    const sortedPlayers = players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    return {
      name: groupName,
      players: sortedPlayers,
      winner: sortedPlayers[0],
      winner_method: "score",
    };
  });

  const status: GroupTournamentStatus = {
    tournamentType: "groupStage",
    players: Object.values(playerMapWithScores),
    groups,
  };
  return status;
}

export function analyzeTournamentProgress({
  tournamentInfo,
  games,
}: {
  tournamentInfo: TournamentInfo;
  games: GameResult[];
}): TournamentStatus {
  if (tournamentInfo.tournamentType === "groupStage") {
    return analyzeGroupTournamentProgress({ tournamentInfo, games });
  }
  throw new Error("Unsupported tournament type");
}

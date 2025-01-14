import { TIES, WINS_FOR_BLACK, WINS_FOR_WHITE } from "./constants.ts";
import type { GameResult } from "./playtak-api/types.ts";
import type {
  GroupTournamentStatus,
  TournamentGroup,
  TournamentInfo,
  TournamentPlayer,
  TournamentStatus,
} from "./types.ts";
import { groupBy } from "./utils.ts";

const UNGROUPED = "UNGROUPED";

function getHeadToHeadWinner(
  info: TournamentInfo,
  tiedPlayers: TournamentPlayer[],
  games: GameResult[]
): TournamentPlayer | null {
  const headToHeadScores = new Map<string, number>(
    tiedPlayers.map((player) => [player.username, 0])
  );

  // Calculate head-to-head scores among tied players
  for (const game of games) {
    if (game.date < info.dateRange.start.getTime() || game.date > info.dateRange.end.getTime()) {
      continue;
    }

    // Only consider games between tied players
    if (!headToHeadScores.has(game.player_white) || !headToHeadScores.has(game.player_black)) {
      continue;
    }

    if (WINS_FOR_WHITE.includes(game.result)) {
      headToHeadScores.set(game.player_white, (headToHeadScores.get(game.player_white) || 0) + 2);
    } else if (WINS_FOR_BLACK.includes(game.result)) {
      headToHeadScores.set(game.player_black, (headToHeadScores.get(game.player_black) || 0) + 2);
    } else if (TIES.includes(game.result)) {
      headToHeadScores.set(game.player_white, (headToHeadScores.get(game.player_white) || 0) + 1);
      headToHeadScores.set(game.player_black, (headToHeadScores.get(game.player_black) || 0) + 1);
    }
  }

  // Find players with highest head-to-head scores
  const maxScore = Math.max(...Array.from(headToHeadScores.values()));
  const winners = tiedPlayers.filter(
    (player) => headToHeadScores.get(player.username) === maxScore
  );
  // If there is a single winner, return them as the head-to-head winner
  return winners.length === 1 ? winners[0] : null;
}

function analyzeGroupTournamentProgress({
  tournamentInfo,
  games,
}: {
  tournamentInfo: TournamentInfo;
  games: GameResult[];
}): GroupTournamentStatus {
  // initialize scores to zero
  const playerMapWithScores: Record<string, TournamentPlayer> = Object.fromEntries(
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
      // TODO: log a warning, but for now, ignore these games;
      continue;
    }

    // Extra initialization check to satisfy type check.
    if (whitePlayer.score === undefined) {
      whitePlayer.score = 0;
    }
    if (blackPlayer.score === undefined) {
      blackPlayer.score = 0;
    }
    if (whitePlayer.games_played === undefined) {
      whitePlayer.games_played = 0;
    }
    if (blackPlayer.games_played === undefined) {
      blackPlayer.games_played = 0;
    }

    // add 2 points to the winner and 1 point for a tie
    if (WINS_FOR_WHITE.includes(game.result)) {
      whitePlayer.score += 2;
    } else if (WINS_FOR_BLACK.includes(game.result)) {
      blackPlayer.score += 2;
    } else if (TIES.includes(game.result)) {
      whitePlayer.score += 1;
      blackPlayer.score += 1;
    } else {
      throw new Error(`Unknown game result: ${game.result}`);
    }

    whitePlayer.games_played += 1;
    blackPlayer.games_played += 1;
  }

  const groupedPlayers = groupBy(Object.values(playerMapWithScores), (p) => p.group ?? UNGROUPED);

  const groups: TournamentGroup[] = Object.entries(groupedPlayers).map(([groupName, players]) => {
    const sortedPlayers = players.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

    // Check for ties
    const topScore = sortedPlayers[0].score;
    const tiedPlayers = sortedPlayers.filter((p) => p.score === topScore);

    if (tiedPlayers.length === 1) {
      return {
        name: groupName,
        players: sortedPlayers,
        winner: tiedPlayers[0],
        winner_method: "score",
      };
    }

    // Try head-to-head tiebreaker
    const headToHeadWinner = getHeadToHeadWinner(tournamentInfo, tiedPlayers, games);
    if (headToHeadWinner) {
      return {
        name: groupName,
        players: sortedPlayers,
        winner: headToHeadWinner,
        winner_method: "head-to-head",
      };
    }

    // TODO: Sonneborn-Berger and blitz tiebreakers

    // If no head-to-head winner, return all players.
    return {
      name: groupName,
      players: sortedPlayers,
      winner: tiedPlayers,
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

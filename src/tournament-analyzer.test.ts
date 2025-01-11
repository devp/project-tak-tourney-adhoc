import { describe, it } from "node:test";
import assert from "node:assert";

import { analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { GameResultTypes } from "./constants.ts";

import type { TournamentInfo, TournamentPlayer } from "./types.ts";
import type { GameResult } from "./playtak-api/types.ts";

let gameResultCounter = 1;

function getGameResultAtIndex(index: number) {
  return Object.values(GameResultTypes)[index % Object.values(GameResultTypes).length];
}

function makeGameResult(overrides: Partial<GameResult> = {}): GameResult {
  return {
    id: gameResultCounter++,
    date: 1732382649194,
    size: 6,
    player_white: "player1",
    player_black: "player2",
    notation: "",
    result: "R-0",
    timertime: 900,
    timerinc: 10,
    rating_white: 1500,
    rating_black: 1500,
    unrated: 0,
    tournament: 1,
    komi: 4,
    pieces: 30,
    capstones: 1,
    rating_change_white: 0,
    rating_change_black: 0,
    extra_time_amount: 0,
    extra_time_trigger: 0,
    ...overrides,
  };
}

function makeGroupedPlayers() {
  return Array.from({ length: 12 }, (_, index) => ({
    username: `player${index + 1}`,
    group: `Group ${(index % 3) + 1}`,
  }));
}

function makeGameResultsForPlayers(numGames: number, players: Array<TournamentPlayer>) {
  return Array.from({ length: numGames }, (_, index) =>
    makeGameResult({
      player_white: players[index % 12].username,
      player_black: players[(index + 1) % 12].username,
      result: getGameResultAtIndex(index),
    })
  );
}

describe("Given tournament with grouped players", () => {
  const players = makeGroupedPlayers();
  const tournamentInfo: TournamentInfo = {
    players,
  };
  const games = makeGameResultsForPlayers(10, players);

  describe("analyzeTournamentProgress()", () => {
    const status = analyzeTournamentProgress({ tournamentInfo, games });

    it("should return a valid tournament status object", () => {
      assert(status);
    });

    it("should return players with scores", () => {
      assert(
        status.players.every(
          (player: TournamentPlayer) => player.score !== undefined && player.score >= 0
        )
      );
    });

    it.todo("confirm we are using the correct score scheme");

    it.todo("reads in only records within the date range");
  });
});

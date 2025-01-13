import { describe, it } from "node:test";
import assert from "node:assert";

import { analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { GameResultTypes } from "./constants.ts";

import type { TournamentInfo, TournamentPlayer } from "./types.ts";
import type { GameResult } from "./playtak-api/types.ts";

// range of tournament
const today = new Date();
const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
// used for games in range
const oneDayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
// games outside range to ignore
const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

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

function makeGroupedPlayers(numPlayers: number) {
  return Array.from({ length: numPlayers }, (_, index) => ({
    username: `player${index + 1}`,
    group: `Group ${(index % 3) + 1}`,
  }));
}

function makeGameResultsForPlayers(numGames: number, players: Array<TournamentPlayer>, date: Date) {
  return Array.from({ length: numGames }, (_, index) =>
    makeGameResult({
      date: date.getTime(),
      player_white: players[index % 12].username,
      player_black: players[(index + 1) % 12].username,
      result: getGameResultAtIndex(index),
    })
  );
}

describe("Given tournament with 12 grouped players (played from last week to today)", () => {
  const players = makeGroupedPlayers(12);
  const tournamentInfo: TournamentInfo = {
    players,
    dateRange: {
      start: oneWeekAgo,
      end: today,
    },
  };

  describe("and 10 played games for the tournament", () => {
    const games = makeGameResultsForPlayers(10, players, oneDayAgo);
    const status = analyzeTournamentProgress({ tournamentInfo, games });

    it("should return a valid tournament status object", () => {
      assert(status);
    });

    it("calculates valid scores", () => {
      assert(
        status.players.every(
          (player: TournamentPlayer) => player.score !== undefined && player.score >= 0
        )
      );
    });

    it("calculates games_played, summing to 20", () => {
      assert(
        status.players.every(
          (player) => player.games_played !== undefined && player.games_played >= 0
        ),
        "Each player should have games_played count"
      );
      const totalGamesPlayed = status.players.reduce(
        (sum, player) => sum + (player.games_played || 0),
        0
      );
      assert.equal(
        totalGamesPlayed,
        20,
        "Total games played should be 20 (10 games * 2 players each)"
      );
    });
  });

  describe("and a combination from within and outside this tournament", () => {
    const games = [
      ...makeGameResultsForPlayers(10, players, oneMonthAgo),
      ...makeGameResultsForPlayers(10, players, oneDayAgo),
    ];
    const status = analyzeTournamentProgress({ tournamentInfo, games });

    it("filters for games within tournament date range", () => {
      const totalGamesPlayed = status.players.reduce(
        (sum, player) => sum + (player.games_played || 0),
        0
      );
      assert.equal(
        totalGamesPlayed,
        20,
        "Should only count 10 games (20 player-games) from within tournament dates"
      );
    });
  });
});

describe("[group stage]", () => {
  describe("Given minimal tournament of two players", () => {
    const players = makeGroupedPlayers(2);
    const tournamentInfo: TournamentInfo = {
      players,
      dateRange: {
        start: oneWeekAgo,
        end: today,
      },
    };
    describe("and results of 1 W 1 T", () => {
      const games = [
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: players[0].username,
          player_black: players[1].username,
          result: "0-R",
        }),
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: players[1].username,
          player_black: players[0].username,
          result: "1/2-1/2",
        }),
      ];
      it("calculates correct points (2 for win, 1 for draw)", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        assert.equal(status.players[0].score, 1);
        assert.equal(status.players[1].score, 3);
      });
    });
  });
});

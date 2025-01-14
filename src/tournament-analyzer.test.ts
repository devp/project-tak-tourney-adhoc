import { describe, it } from "node:test";
import assert from "node:assert";

import { analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { GameResultTypes } from "./constants.ts";

import type { TournamentInfo, TournamentPlayer, TournamentStatus } from "./types.ts";
import type { GameResult, GameResultType } from "./playtak-api/types.ts";

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

function makeGroupedPlayers(numPlayers: number, groupName?: string) {
  // Fill up groups before going to next group
  return Array.from({ length: numPlayers }, (_, index) => ({
    username: `player${index + 1}`,
    group: groupName ?? `Group ${Math.floor(index / 4) + 1}`,
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

function makeMatchup(
  player1: string,
  player2: string,
  results: GameResultType[],
  date: Date = oneDayAgo
): GameResult[] {
  return [
    makeGameResult({
      date: date.getTime(),
      player_white: player1,
      player_black: player2,
      result: results[0],
    }),
    makeGameResult({
      date: date.getTime(),
      player_white: player2,
      player_black: player1,
      result: results[1],
    }),
  ];
}

/** Useful for filling up group play with ties */
function makeMatchupTies(players: string[], date: Date = oneDayAgo) {
  const results: GameResult[] = [];
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      results.push(...makeMatchup(players[i], players[j], ["1/2-1/2", "1/2-1/2"], date));
    }
  }
  return results;
}

describe("Given tournament with 12 grouped players (played from last week to today)", () => {
  const players = makeGroupedPlayers(12);
  const tournamentInfo: TournamentInfo = {
    tournamentType: "groupStage",
    players,
    dateRange: {
      start: oneWeekAgo,
      end: today,
    },
  };

  describe("and 10 played games for the tournament", () => {
    const games = makeGameResultsForPlayers(10, players, oneDayAgo);
    const status = analyzeTournamentProgress({ tournamentInfo, games });

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
  describe("Given minimal tournament group of two players", () => {
    const players = makeGroupedPlayers(2, "Group A");
    const tournamentInfo: TournamentInfo = {
      tournamentType: "groupStage",
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

      it("should determine the winner based on score (despite being a small group)", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        assert(status.tournamentType === "groupStage");
        const group = status.groups[0];
        assert.equal(!Array.isArray(group?.winner) && group.winner?.username, "player2");
      });
    });
  });

  describe("Given tournament with 4 groups of 4 players", () => {
    const players = makeGroupedPlayers(16);
    const tournamentInfo: TournamentInfo = {
      tournamentType: "groupStage",
      players,
      dateRange: {
        start: oneWeekAgo,
        end: today,
      },
    };

    describe(`and given different group results
      (group 1: clear winner,
       group 2: head-to-head tiebreaker,
       group 3: Sonneborn-Berger tiebreaker,
       group 4: blitz tiebreaker)`, () => {
      function getGroup(status: TournamentStatus, groupName: string) {
        if (status.tournamentType === "groupStage") {
          return status.groups.find((g) => g.name === groupName);
        } else {
          assert.fail("Tournament type is not groupStage");
        }
      }

      // Group 1: Clear winner with highest score
      const group1Games = [
        ...makeMatchup("player2", "player1", ["R-0", "0-F"]),
        ...makeMatchup("player2", "player3", ["F-0", "0-R"]),
        ...makeMatchup("player2", "player4", ["1-0", "0-1"]),
        ...makeMatchupTies(["player1", "player3", "player4"]),
      ];
      // Group 2: Two players tied on points, but head-to-head determines winner
      const group2Games = [
        // player 6 wins and draws vs player 5 in their matchup
        // (+2 point differential of player 6 > player 5)
        ...makeMatchup("player5", "player6", ["0-1", "1/2-1/2"]),
        // player 5 wins and draws against player 7 and 8 (+6 points)
        ...makeMatchup("player5", "player7", ["1-0", "1/2-1/2"]),
        ...makeMatchup("player5", "player8", ["1-0", "1/2-1/2"]),
        // player 6 draws against player 7 and 8 (+4 points)
        ...makeMatchup("player6", "player7", ["1/2-1/2", "1/2-1/2"]),
        ...makeMatchup("player6", "player8", ["1/2-1/2", "1/2-1/2"]),
        // the rest is ties
        ...makeMatchupTies(["player7", "player8"]),
      ];

      // Group 3: Multiple players tied, even on head-to-head
      const group3Games = [
        ...makeMatchup("player9", "player10", ["1-0", "1-0"]),
        ...makeMatchup("player10", "player11", ["1-0", "1-0"]),
        ...makeMatchup("player11", "player9", ["1-0", "1-0"]),
        // Everyone beats player 12
        // TODO: change this to ensure player10 wins Sonneborn-Berger
        // The actual scores of all opponents a player has defeated
        // Half the scores of all opponents a player has drawn against
        ...makeMatchup("player9", "player12", ["1-0", "1-0"]),
        ...makeMatchup("player10", "player12", ["1-0", "1-0"]),
        ...makeMatchup("player11", "player12", ["1-0", "1-0"]),
      ];

      // Group 4: Complete tie, with deciding blitz games
      const group4Games = [
        ...makeMatchupTies(["player13", "player14", "player15", "player16"]),
        // TODO: add blitz games, with player15 as the winner
      ];

      const games = [...group1Games, ...group2Games, ...group3Games, ...group4Games];

      // Note: test a winner who is not the first in the group, to ensure
      // the winner is chosen based on score, not position in the group.

      it("should choose the group 1 winner based on score", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        const group = getGroup(status, "Group 1");
        assert(group?.winner && !Array.isArray(group.winner));
        assert.equal(group.winner.username, "player2");
        assert(group.winner_method === "score");
      });

      it("should choose the group 2 winner based on head-to-head tiebreaker", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        const group = getGroup(status, "Group 2");
        assert(group?.winner && !Array.isArray(group.winner));
        assert.equal(group.winner.username, "player6");
        assert(group.winner_method === "head-to-head");
      });

      // TODO: implement S-B scores
      it.skip("should choose the group 3 winner based on Sonneborn-Berger scores", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        const group = getGroup(status, "Group 3");
        assert(group?.winner && !Array.isArray(group.winner));
        assert.equal(group.winner.username, "player10"); // TODO: change this to ensure player10 wins
        assert(group.winner_method === "sonneborn-berger");
      });

      // TODO: implement blitz tiebreaker
      it.skip("should choose the group 4 winner based on blitz tiebreaker", () => {
        const status = analyzeTournamentProgress({ tournamentInfo, games });
        const group = getGroup(status, "Group 4");
        assert(group?.winner && !Array.isArray(group.winner));
        assert.equal(group.winner.username, "player15"); // TODO: change this to ensure player15 wins
        assert(group.winner_method === "blitz");
      });
    });
  });

  describe("Given tournament with 4 players in a group", () => {
    const groupName = "Group A";
    const players = makeGroupedPlayers(4, groupName);
    const tournamentInfo: TournamentInfo = {
      tournamentType: "groupStage",
      players,
      dateRange: {
        start: oneWeekAgo,
        end: today,
      },
    };

    it("should return multiple winners in a true tie", () => {
      // player 1 and player 2 beat everyone else. player 3 beats player 4.
      const games = [
        ...makeMatchup("player1", "player2", ["1/2-1/2", "1/2-1/2"]),
        ...makeMatchup("player1", "player3", ["R-0", "0-F"]),
        ...makeMatchup("player1", "player4", ["R-0", "0-F"]),
        ...makeMatchup("player2", "player3", ["R-0", "0-F"]),
        ...makeMatchup("player2", "player4", ["R-0", "0-F"]),
        ...makeMatchup("player3", "player4", ["R-0", "0-F"]),
      ];
      const status = analyzeTournamentProgress({ tournamentInfo, games });
      assert(status.tournamentType === "groupStage");
      assert(Array.isArray(status.groups[0].winner));
      assert.equal(status.groups[0].winner.length, 2);
      assert(status.groups[0].winner.some(({ username }) => username === "player1"));
      assert(status.groups[0].winner.some(({ username }) => username === "player2"));
    });

    // TODO: decide if we should hide the winner or not.
    // We could also always show the current winner.
    it.skip("should not choose a winner until all games are played", () => {
      // Only 2 complete matchups (4 games) out of required 6 matchups (12 games)
      const incompleteGames = [
        // player1 vs player2 matchup (complete)
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: "player1",
          player_black: "player2",
          result: "1-0",
        }),
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: "player2",
          player_black: "player1",
          result: "0-1",
        }),
        // player3 vs player4 matchup (complete)
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: "player3",
          player_black: "player4",
          result: "1-0",
        }),
        makeGameResult({
          date: oneDayAgo.getTime(),
          player_white: "player4",
          player_black: "player3",
          result: "1-0",
        }),
      ];

      const status = analyzeTournamentProgress({ tournamentInfo, games: incompleteGames });
      assert(status.tournamentType === "groupStage");
      assert.equal(status.groups.length, 1);
      assert(status.groups[0].winner === null);
    });
  });
});

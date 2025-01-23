import { describe, it } from "node:test";
import assert from "node:assert";
import type {
  IgnoreGameException,
  AddGameException,
  OverrideGameResultException,
  ManualResultException,
} from "./tournament-exception-types.ts";
import { GameResultTypes } from "./constants.ts";
import type { TournamentInfo } from "./types.ts";
import { additionalGameIdsToFetch, analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { makeGameResult, makeGameResultsForPlayers } from "./testUtil/gameUtil.ts";

describe("Tournament Exception Behavior in TournamentInfo", () => {
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  const baseTournamentInfo: TournamentInfo = {
    tournamentType: "groupStage",
    dateRange: {
      start: startDate,
      end: endDate,
    },
    players: [
      { username: "player1", group: "Group A" },
      { username: "player2", group: "Group A" },
      { username: "player3", group: "Group A" },
      { username: "player4", group: "Group A" },
    ],
  };
  const games = makeGameResultsForPlayers(4, baseTournamentInfo.players, startDate);

  describe("IgnoreGameException in TournamentInfo", () => {
    it("should filter out ignored game when calculating tournament status", () => {
      const gameId = games[0].id;
      const ignoreException: IgnoreGameException = {
        type: "ignoreGame",
        timestamp: new Date(),
        gameId,
      };

      const tournamentInfo = {
        ...baseTournamentInfo,
        exceptions: [ignoreException],
      };

      const status = analyzeTournamentProgress({ tournamentInfo, games });
      assert.equal(status.games?.length, 3, "Game should be ignored");
      assert(status.games?.every((game) => game.id !== gameId));
    });
  });

  describe("AddGameException in TournamentInfo", () => {
    it("should list additional gameIds to fetch", () => {
      const exceptions: AddGameException[] = [
        { type: "addGame", timestamp: new Date(), gameId: 1, category: "regular" },
        { type: "addGame", timestamp: new Date(), gameId: 2, category: "regular" },
      ];
      const tournamentInfo = {
        ...baseTournamentInfo,
        exceptions,
      };
      assert.deepEqual(additionalGameIdsToFetch(tournamentInfo), [1, 2]);
    });
    it("should include non-tournament games when specified in exceptions array", () => {
      const nonTournamentGame = makeGameResult({
        id: 31337,
        player_white: "player1",
        player_black: "player2",
        result: GameResultTypes.WHITE_ROAD,
        tournament: 0, // Non-tournament game
      });

      const addException: AddGameException = {
        type: "addGame",
        timestamp: new Date(),
        gameId: nonTournamentGame.id,
        category: "regular",
      };

      const tournamentInfo = {
        ...baseTournamentInfo,
        exceptions: [addException],
      };

      const status = analyzeTournamentProgress({
        tournamentInfo,
        games: [...games, nonTournamentGame],
      });
      assert.equal(status.games?.length, 5, "Non-tournament game should be included");
    });
  });

  describe("OverrideGameResultException in TournamentInfo", () => {
    it.skip("should use override result instead of original result in calculations", () => {
      // TODO: need to think more about how to test this
      const game = makeGameResult({
        id: 1,
        player_white: "player1",
        player_black: "player2",
        result: GameResultTypes.WHITE_ROAD, // Original result: player1 wins
      });

      const overrideException: OverrideGameResultException = {
        type: "overrideGameResult",
        timestamp: new Date(),
        gameId: 1,
        category: "regular",
        result: makeGameResult({
          result: GameResultTypes.BLACK_ROAD, // Override: player2 wins
        }),
      };

      const tournamentInfo = {
        ...baseTournamentInfo,
        exceptions: [overrideException],
      };

      const status = analyzeTournamentProgress({ tournamentInfo, games: [game] });
      assert.equal(status.players[0].score, 0, "Player1 should have 0 points after override");
      assert.equal(status.players[1].score, 2, "Player2 should have 2 points after override");
    });
  });

  describe("ManualResultException in TournamentInfo", () => {
    it.skip("should add manually specified games to tournament calculations", () => {
      // TODO: need to think more about how to test this
      const manualException: ManualResultException = {
        type: "manualResult",
        timestamp: new Date(),
        players: ["player1", "player2"],
        category: "regular",
        result: makeGameResult({
          result: GameResultTypes.WHITE_ROAD, // Manual win for player1
        }),
      };

      const tournamentInfo = {
        ...baseTournamentInfo,
        exceptions: [manualException],
      };

      const status = analyzeTournamentProgress({ tournamentInfo, games: [] });
      assert.equal(status.players[0].score, 2, "Player1 should have 2 points from manual result");
      assert.equal(status.players[1].score, 0, "Player2 should have 0 points from manual result");
      assert.equal(
        status.players[0].games_played,
        1,
        "Player1 should have one game from manual result"
      );
      assert.equal(
        status.players[1].games_played,
        1,
        "Player2 should have one game from manual result"
      );
    });
  });
});

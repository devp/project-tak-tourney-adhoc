import { GameResultTypes } from "../constants.ts";
import type { GameResult } from "../playtak-api/types.ts";
import type { TournamentPlayer } from "../types.ts";

let gameResultCounter = 1;

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

function getGameResultAtIndex(index: number) {
  return Object.values(GameResultTypes)[index % Object.values(GameResultTypes).length];
}

function makeGameResultsForPlayers(numGames: number, players: Array<TournamentPlayer>, date: Date) {
  return Array.from({ length: numGames }, (_, index) =>
    makeGameResult({
      date: date.getTime(),
      player_white: players[index % players.length].username,
      player_black: players[(index + 1) % players.length].username,
      result: getGameResultAtIndex(index),
    })
  );
}

export { makeGameResult, makeGameResultsForPlayers };

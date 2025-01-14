import { analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { readFile } from "node:fs/promises";
import { isGameListResponse } from "./playtak-api/types.guard.ts";
import { isTournamentInfoFromJson } from "./types.guard.ts";
import type { GameResult } from "./playtak-api/types.ts";
import type { TournamentInfo } from "./types.ts";

// TODO: deal with pagination

async function fetchGamesFromUrl(url: string): Promise<GameResult[]> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  if (!isGameListResponse(data)) {
    throw new Error("Invalid API response format");
  }
  return data.items;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf-8");
  return JSON.parse(content);
}

async function getTournamentInfoFromJsonFile(filename: string): Promise<TournamentInfo> {
  const response = await readJsonFile<unknown>(filename);
  if (isTournamentInfoFromJson(response)) {
    const info: TournamentInfo = {
      ...response,
      dateRange: {
        start: new Date(response.dateRange.start),
        end: new Date(response.dateRange.end),
      },
    };
    return info;
  } else {
    throw new Error("Invalid tournament info format");
  }
}

async function getGameResultsFromJsonFile(filename: string): Promise<GameResult[]> {
  const response = await readJsonFile<unknown>(filename);
  if (isGameListResponse(response)) {
    return response.items;
  } else {
    throw new Error("Invalid games API response format");
  }
}

async function main() {
  const args = process.argv.slice(2);
  let tournamentInfo: TournamentInfo | undefined;
  let games: GameResult[] | undefined;

  for (let i = 0; i < args.length; i += 2) {
    const flag = args[i];
    const value = args[i + 1];

    if (!value) {
      throw new Error(`Missing value for argument ${flag}`);
    }

    switch (flag) {
      case "--tournament":
        tournamentInfo = await getTournamentInfoFromJsonFile(value);
        break;
      case "--gamesApiResponse":
        games = await getGameResultsFromJsonFile(value);
        break;
      case "--gamesApiUrl":
        games = await fetchGamesFromUrl(value);
        break;
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }

  if (!tournamentInfo) {
    throw new Error("Tournament info is required (--tournament)");
  }

  if (!games) {
    throw new Error("Games data is required (either --gamesApiResponse or --gamesApiUrl)");
  }

  const status = analyzeTournamentProgress({
    tournamentInfo,
    games,
  });

  const playerNames = status.players.map(({ username }) => username);

  console.log(`Tournament: ${tournamentInfo.name}`);
  console.log(`Players: ${playerNames.join(", ")}`);
  if (status.tournamentType === "groupStage") {
    console.log(`Type: Group Stage (${status.groups.length} groups)`);
    for (const group of status.groups) {
      console.log(`- Group: ${group.name}`);
      let winnerText: string;
      if (group.winner) {
        if (Array.isArray(group.winner)) {
          winnerText = "Tie between " + group.winner.map(({ username }) => username).join(", ");
        } else {
          winnerText = `${group.winner.username} (via ${group.winner_method})`;
        }
      } else {
        winnerText = "None";
      }
      console.log(`  Winner: ${winnerText}`);
    }
  }
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

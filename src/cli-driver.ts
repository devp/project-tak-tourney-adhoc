import { analyzeTournamentProgress } from "./tournament-analyzer.ts";
import { readFile } from "node:fs/promises";
import { isGameListResponse } from "./playtak-api/types.guard.ts";
import { isTournamentInfo } from "./types.guard.ts";
import type { GameResult } from "./playtak-api/types.ts";
import type { TournamentInfo, TournamentPlayer, TournamentStatus } from "./types.ts";

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
  const info = await readJsonFile<unknown>(filename);
  if (isTournamentInfo(info)) {
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

async function readPlayersFromCsv(filename: string): Promise<TournamentPlayer[]> {
  const csvContent = await readFile(filename, "utf-8");
  const lines = csvContent
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const headers = lines[0].split(",").map((h) => h.trim());
  const usernameIndex = headers.indexOf("username");
  const groupIndex = headers.indexOf("groupname");

  if (usernameIndex === -1 || groupIndex === -1) {
    throw new Error("CSV must have username and groupname columns");
  }

  const result = lines.slice(1).map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return {
      username: values[usernameIndex],
      group: values[groupIndex],
    };
  });

  return result;
}

function outputTournamentStatus(status: TournamentStatus, tournamentInfo: TournamentInfo) {
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
      console.log("  Standings:");
      for (const player of status.players) {
        if (player.group === group.name) {
          console.log(
            `    ${player.username}: ${player.score} points (${player.games_played} games)`
          );
        }
      }
      console.log(`  Winner: ${winnerText}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  let tournamentInfo: TournamentInfo | undefined;
  let games: GameResult[] | undefined;
  let outputFormat: "text" | "json" = "text";
  let playersFromCsv: TournamentPlayer[] | undefined;

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
      case "--outputFormat":
        outputFormat = value as "text" | "json";
        break;
      case "--playersCsv":
        playersFromCsv = await readPlayersFromCsv(value);
        break;
      default:
        throw new Error(`Unknown argument: ${flag}`);
    }
  }

  if (tournamentInfo && playersFromCsv) {
    tournamentInfo.players = playersFromCsv;
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

  if (outputFormat === "json") {
    console.log(JSON.stringify(status, null, 2));
    return;
  }

  outputTournamentStatus(status, tournamentInfo);
}

main().catch((error) => {
  console.error("Error:", error.message);
  process.exit(1);
});

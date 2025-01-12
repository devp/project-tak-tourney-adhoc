import { TournamentStatus } from "./types-likely-goal";

  // Example usage:
  const exampleStatus: TournamentStatus = {
    currentStage: "group",
    players: [
      {
        username: "player1",
        group: "A",
        score: 6,
        gamesPlayed: 4,
        matchesCompleted: 2,
        matchesPerWeek: 2,
        tiebreakers: {
          headToHead: 2,
          sonnebornBerger: 8,
          blitzGamesPlayed: 0
        }
      }
    ],
    groups: {
      "A": {
        matches: [
          {
            player1: "player1",
            player2: "player2",
            games: [
              {
                white: "player1",
                black: "player2",
                winner: "player1",
                date: "2024-01-20T15:00:00Z",
                timeControl: { main: 15, increment: 10 }
              }
            ],
            scheduledWeek: 1,
            complete: false
          }
        ],
        complete: false
      }
    }
  };
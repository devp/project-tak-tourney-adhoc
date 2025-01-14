This is a standalone TypeScript library for accepting playtak.com API inputs and tournament information, and outputting tournament status.

The goal of this prototype is to generate code that could be used in other backends/frontends for Tak, and ultimately reduce the work required to run tournaments.

## CLI Usage

```
> npm run start -- --tournament doc/example-tournament-group-stage.json --gamesApiResponse doc/example-api-response-pretty.json

> npm run start -- --tournament doc/example-tournament-group-stage.json --gamesApiUrl 'https://api.playtak.com/v1/games-history?page=0&limit=100&type=Tournament&mirror=true'

> npm run start -- --tournament doc/example-tournament-group-stage.json --gamesApiResponse doc/example-api-response-pretty.json --outputFormat json > tournament-status-output.json
```

## Development

1. Clone the repository
2. Install the Node 22, as per the version defined in `.nvmrc` (e.g. via `nvm` or `fnm`).
3. Run `npm install`
4. Run `npm test` to run the tests, or `npm test:watch` during development iterations.
5. Run `npm run dev:all_checks` on code changes before committing.

## Implementation Details

### ts-auto-guard

When types are changed, rerun `npm run dev:recreate_auto_guard` to update the guard files.

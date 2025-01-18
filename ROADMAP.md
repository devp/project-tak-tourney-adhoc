# Roadmap for usage in January 2025

## Caveats

1. Currently the tournament info and player list has to be harder code (a JSON
   and CSV in a repo), that's ok-ish for this tourney as the list won't change
   once it starts

2. Group stages and knockout stages are currently handled like separate
   tournaments, and in some cases like the upcoming tournament where we might
   select a 4th player out of 3 groups for the knockout stage, it's going to be
   a manual selection.

3. General concern: Most of all that I just wrote this, and just be mentally
   ready for double checking (though its usually obvious who is proceeding
   forward at the group stage)

## Required for TOMORROW/ASAP for beginners tournament

1. Upload CSV of players/groups, since this is currently manual.

   (Or if its simple enough, make this database-driven.)

## Required for the group stage

1. [review] Connect the service to USTA's site.

   Options:
   - USTA HTML redirects to the site
   - USTA HTML has the results in an iframe

2. [done] Need to add caching to only hit the API every 5 minutes

3. [done] misc UI changes to have the same experience as the existing standings
   page.

4. [done] UI should give links to the individual games.

   The way we have it at the moment is that each group has it's own page and by
   clicking the player name you can see match-ups.

5. [done] Show players' matches, and what matches they have yet to play.

## Required before end of group stage / before the knockout stage

1. Allow setting exceptions (ignoring/overriding API results, invalid games,
   games that aren't in the DB for some reason, player withdrawals).

2. Implement the other tie-breakers - SB and especially blitz games since that
   is often what determines who wins the group stage.

3. Need to implement knockout stage tournments.

4. Get players/groups from database.

5. Admin UI (with simple password) for setting exceptions and modifying
   players/groups.

# Roadmap for future usage

1. Allow USTA to host this (or better yet, migrate into the rest of Playtak.com)

   - configure the library code to be a proper module, or just copy it over as a
     file

2. tournament management - creating tournaments, etc.

   - some sort of interface to take in controls and to set up the files needed
     and the seek templates

3. creation of game seeks in playtak.com API, avoiding validation issues

   - when creating a seek for the tournament, there should be an interface where
     the player selects the game to play and sets up a seek with the parameter

4. generating permanent endpoints (maintaining a historical record)

   - generating static HTML after the tournament is over?

"use client";

import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "./amplify-helpers";
import {
  randomLadderDescription,
  randomTeamName,
  randomAvatar,
  randomEmail,
  randomFirstName,
  randomLadderName,
  randomLastName,
  randomRating,
  randomRecentDate,
} from "./random";

// =================== ENTITY CREATION FUNCTIONS ===================

/**
 * Options for data generation
 */
interface GeneratorConfig {
  numPlayers?: number; // Number of players to generate
  numLadders?: number; // Number of ladders to create
  numTeams?: number; // Number of teams to create
  singlePlayerTeamRate?: number; // Percentage of teams with only one player (0.0 to 1.0)
  numMatches?: number; // Number of matches to generate
  matchWinRate?: number; // Percentage of matches with a recorded winner (0.0 to 1.0)
  deleteExisting?: boolean; // Whether to delete existing data before generating new
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: GeneratorConfig = {
  numPlayers: 20,
  numLadders: 2,
  numTeams: 8,
  numMatches: 15,
  singlePlayerTeamRate: 0.2, // 20% of teams have only 1 player
  matchWinRate: 0.8, // 80% of matches have a recorded winner
  deleteExisting: true,
};

/**
 * Delete all existing data from the database
 */
async function clearExistingData() {
  console.log("Clearing existing data...");

  try {
    // First delete matches to avoid foreign key constraints
    const { data: matches } = await matchClient().list();
    if (matches && matches.length > 0) {
      console.log(`Deleting ${matches.length} matches...`);
      const batchSize = 10;
      for (let i = 0; i < matches.length; i += batchSize) {
        const batch = matches.slice(i, i + batchSize);
        await Promise.all(
          batch.map((match) => matchClient().delete({ id: match.id }))
        );
        console.log(
          `Deleted ${Math.min(i + batchSize, matches.length)}/${
            matches.length
          } matches`
        );
      }
    }

    // Delete teams
    const { data: teams } = await teamClient().list();
    if (teams && teams.length > 0) {
      console.log(`Deleting ${teams.length} teams...`);
      const batchSize = 10;
      for (let i = 0; i < teams.length; i += batchSize) {
        const batch = teams.slice(i, i + batchSize);
        await Promise.all(
          batch.map((team) => teamClient().delete({ id: team.id }))
        );
        console.log(
          `Deleted ${Math.min(i + batchSize, teams.length)}/${
            teams.length
          } teams`
        );
      }
    }

    // Delete ladders
    const { data: ladders } = await ladderClient().list();
    if (ladders && ladders.length > 0) {
      console.log(`Deleting ${ladders.length} ladders...`);
      const batchSize = 10;
      for (let i = 0; i < ladders.length; i += batchSize) {
        const batch = ladders.slice(i, i + batchSize);
        await Promise.all(
          batch.map((ladder) => ladderClient().delete({ id: ladder.id }))
        );
        console.log(
          `Deleted ${Math.min(i + batchSize, ladders.length)}/${
            ladders.length
          } ladders`
        );
      }
    }

    // Delete players
    const { data: players } = await playerClient().list();
    if (players && players.length > 0) {
      console.log(`Deleting ${players.length} players...`);
      const batchSize = 10;
      for (let i = 0; i < players.length; i += batchSize) {
        const batch = players.slice(i, i + batchSize);
        await Promise.all(
          batch.map((player) => playerClient().delete({ id: player.id }))
        );
        console.log(
          `Deleted ${Math.min(i + batchSize, players.length)}/${
            players.length
          } players`
        );
      }
    }

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw new Error("Failed to clear database");
  }
}

/**
 * Generate random players with realistic data
 */
async function generatePlayers(count: number): Promise<Player[]> {
  console.log(`Generating ${count} players...`);
  const players: Player[] = [];
  const batchSize = 10;
  const batches = Math.ceil(count / batchSize);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, count);
    console.log(
      `Processing players batch ${batchIndex + 1}/${batches} (${
        start + 1
      }-${end})...`
    );
    const batchResults = await Promise.all(
      Array.from({ length: end - start }, () => {
        const givenName = randomFirstName();
        const familyName = randomLastName();
        const email = randomEmail(givenName, familyName);
        const avatar = randomAvatar();

        return playerClient().create({ givenName, familyName, email, avatar });
      })
    );
    const createdPlayers = batchResults
      .map((result) => result.data)
      .filter(Boolean) as Player[];
    players.push(...createdPlayers);
  }

  console.log(`Successfully created ${players.length} players`);
  return players;
}

/**
 * Generate ladders with realistic data
 */
async function generateLadders(count: number): Promise<Ladder[]> {
  console.log(`Generating ${count} ladders...`);
  const ladders: Ladder[] = [];
  const batchSize = 10;
  const batches = Math.ceil(count / batchSize);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, count);
    console.log(
      `Processing ladders batch ${batchIndex + 1}/${batches} (${
        start + 1
      }-${end})...`
    );
    const batchResults = await Promise.all(
      Array.from({ length: end - start }, () => {
        const name = randomLadderName();
        const description = randomLadderDescription();
        return ladderClient().create({ name, description });
      })
    );
    const createdLadders = batchResults
      .map((result) => result.data)
      .filter(Boolean) as Ladder[];
    ladders.push(...createdLadders);
  }
  console.log(`Successfully created ${ladders.length} ladders`);
  return ladders;
}

/**
 * Generate teams and assign to ladders
 */
async function generateTeams(
  count: number,
  ladders: Ladder[],
  players: Player[],
  singlePlayerRate: number
): Promise<Team[]> {
  console.log(`Generating ${count} teams...`);
  const teams: Team[] = [];

  // Make a copy of players that we can shuffle and assign
  const availablePlayers = [...players];

  // Shuffle the available players
  for (let i = availablePlayers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availablePlayers[i], availablePlayers[j]] = [
      availablePlayers[j],
      availablePlayers[i],
    ];
  }

  try {
    // Prepare team creation parameters
    const teamParams = Array.from({ length: count }, () => {
      // Randomly assign a ladder (or no ladder for some teams)
      const assignLadder = Math.random() < 0.85; // 85% of teams are in a ladder
      const ladderId =
        assignLadder && ladders.length > 0
          ? ladders[Math.floor(Math.random() * ladders.length)].id
          : undefined;

      // Generate a base rating between 1000 and 1600
      const rating = randomRating(1000, 1600);

      return {
        name: randomTeamName(),
        rating,
        ladderId,
      };
    });

    // Create teams in batches
    const batchSize = 10;
    const batches = Math.ceil(count / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, count);
      const batchParams = teamParams.slice(start, end);

      console.log(
        `Creating teams batch ${batchIndex + 1}/${batches} (${
          start + 1
        }-${end})...`
      );

      // Create teams in parallel
      const createdTeamsResults = await Promise.all(
        batchParams.map((params) => teamClient().create(params))
      );

      // Process created teams
      const createdTeams = createdTeamsResults
        .map((result) => result.data)
        .filter(Boolean) as Team[];

      // Now assign players to teams
      const teamsWithPlayersResults = await Promise.all(
        createdTeams.map((team) => {
          // Should this team have one or two players?
          const isSinglePlayerTeam = Math.random() < singlePlayerRate;

          // Check if we have enough players left
          if (availablePlayers.length === 0) {
            console.log(`Created team without players (ran out): ${team.name}`);
            return team;
          }

          // Assign player 1
          const player1 = availablePlayers.pop()!;

          // Assign player 2 if needed and available
          let player2 = null;
          if (!isSinglePlayerTeam && availablePlayers.length > 0) {
            player2 = availablePlayers.pop()!;
          }

          // Update team with players
          return teamClient()
            .update({
              id: team.id,
              player1Id: player1.id,
              player2Id: player2?.id,
            })
            .then((result) => {
              if (result.errors) {
                console.error(
                  `Error updating team ${team.name} with players:`,
                  result.errors
                );
                return team; // Return original team if update fails
              }
              return result.data;
            });
        })
      );

      // Add the updated teams to the result array
      const validTeams = teamsWithPlayersResults.filter(Boolean) as Team[];
      teams.push(...validTeams);

      console.log(`Created ${teams.length}/${count} teams`);
    }

    console.log(`Successfully created ${teams.length} teams`);
    return teams;
  } catch (error) {
    console.error("Error generating teams:", error);
    return teams; // Return any teams we managed to create
  }
}

/**
 * Generate matches between teams in ladders
 */
async function generateMatches(
  count: number,
  teams: Team[],
  winRate: number
): Promise<Match[]> {
  console.log(`Generating ${count} matches...`);
  const matches: Match[] = [];

  // Group teams by ladder
  const teamsByLadder: Record<string, Team[]> = {};
  for (const team of teams) {
    if (team.ladderId) {
      if (!teamsByLadder[team.ladderId]) {
        teamsByLadder[team.ladderId] = [];
      }
      teamsByLadder[team.ladderId].push(team);
    }
  }

  try {
    // For each ladder that has at least 2 teams
    for (const ladderId in teamsByLadder) {
      const ladderTeams = teamsByLadder[ladderId];

      if (ladderTeams.length < 2) {
        console.log(`Skipping ladder ${ladderId}: Not enough teams`);
        continue;
      }

      // Determine how many matches to generate for this ladder
      const ladderMatchCount = Math.min(
        Math.floor(count * (ladderTeams.length / teams.length)),
        Math.floor(ladderTeams.length * 3) // ~3 matches per team on average
      );

      // Generate all match parameters for this ladder
      const matchParams = Array.from({ length: ladderMatchCount }, () => {
        // Pick two random teams from this ladder
        const team1Index = Math.floor(Math.random() * ladderTeams.length);
        let team2Index;
        do {
          team2Index = Math.floor(Math.random() * ladderTeams.length);
        } while (team2Index === team1Index);

        const team1 = ladderTeams[team1Index];
        const team2 = ladderTeams[team2Index];

        // Determine if this match has a winner
        const hasWinner = Math.random() < winRate;

        // If there's a winner, determine who won based on rating
        let winnerId = undefined;
        if (hasWinner) {
          const team1Rating = team1.rating || 1200;
          const team2Rating = team2.rating || 1200;

          // Calculate win probability using Elo formula
          const ratingDiff = team1Rating - team2Rating;
          const team1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));

          // Determine winner based on probability
          winnerId = Math.random() < team1WinProbability ? team1.id : team2.id;
        }

        // Create match date within the last 30 days
        const matchDate = randomRecentDate(30);

        return {
          ladderId,
          team1Id: team1.id,
          team2Id: team2.id,
          winnerId,
          playedOn: matchDate.toISOString(),
        };
      });

      // Create matches in batches
      const batchSize = 10;
      const batches = Math.ceil(ladderMatchCount / batchSize);

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * batchSize;
        const end = Math.min(start + batchSize, ladderMatchCount);
        const batchParams = matchParams.slice(start, end);

        console.log(
          `Creating matches batch ${
            batchIndex + 1
          }/${batches} for ladder ${ladderId} (${start + 1}-${end})...`
        );

        // Create matches in parallel
        const createdMatchesResults = await Promise.all(
          batchParams.map((params) => matchClient().create(params))
        );

        // Process created matches
        const createdMatches = createdMatchesResults
          .map((result) => result.data)
          .filter(Boolean) as Match[];

        matches.push(...createdMatches);

        console.log(
          `Created ${matches.length} matches so far (${createdMatches.length} in this batch)`
        );
      }
    }

    console.log(`Successfully created ${matches.length} matches`);
    return matches;
  } catch (error) {
    console.error("Error generating matches:", error);
    return matches; // Return any matches we managed to create
  }
}

/**
 * Main function to add sample entities to the database
 */
export async function addSampleEntities(config: Partial<GeneratorConfig> = {}) {
  // Merge provided config with defaults
  const finalConfig: GeneratorConfig = { ...DEFAULT_CONFIG, ...config };

  console.log("Sample data configuration:", finalConfig);

  try {
    // Clear existing data if requested
    if (finalConfig.deleteExisting) {
      await clearExistingData();
    }

    // Generate data in order (players → ladders → teams → matches)
    const players = await generatePlayers(finalConfig.numPlayers!);
    const ladders = await generateLadders(finalConfig.numLadders!);
    const teams = await generateTeams(
      finalConfig.numTeams!,
      ladders,
      players,
      finalConfig.singlePlayerTeamRate!
    );

    // Generate matches between teams
    const matches = await generateMatches(
      finalConfig.numMatches!,
      teams,
      finalConfig.matchWinRate!
    );

    // Return the created entities for potential further use
    return {
      players,
      ladders,
      teams,
      matches,
    };
  } catch (error) {
    console.error("Error generating sample data:", error);
    throw new Error("Failed to generate sample data");
  } finally {
    console.log("Sample data loaded");
  }
}

/**
 * Generate a small number of entities for quick testing
 */
export async function addQuickSampleData() {
  return addSampleEntities({
    numPlayers: 10,
    numLadders: 2,
    numTeams: 6,
    numMatches: 8,
    singlePlayerTeamRate: 0.3,
    matchWinRate: 0.75,
  });
}

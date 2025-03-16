"use client";

import {
  BATCH_SIZE,
  randomAvatar,
  randomElement,
  randomEmail,
  randomFirstName,
  randomLadderDescription,
  randomLadderName,
  randomLastName,
  randomRating,
  randomRecentDate,
  randomTeamName,
} from "@/utils";
import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "@/utils/amplify-helpers";

/**
 * Configuration options for data generation.  All values are optional and will default to reasonable values if not provided.
 */
interface GeneratorConfig {
  numPlayers?: number; // Number of players to generate
  numLadders?: number; // Number of ladders to create
  numTeams?: number; // Number of teams to create
  singlePlayerTeamRate?: number; // Percentage of teams with only one player (0.0 to 1.0)
  numMatches?: number; // Number of matches to generate
  matchWinRate?: number; // Percentage of matches with a recorded winner (0.0 to 1.0)
  deleteExisting?: boolean; // Whether to delete existing data before generating new data
}

/**
 * Default configuration values for data generation.  These values will be used if not overridden in the `addSampleEntities` function.
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
 * Clears existing data from the database. Deletes matches, teams, ladders, and players in that order to handle foreign key constraints. Uses batch processing for efficiency.
 * @throws An error if any of the delete operations fail.  Provides detailed error information.
 */
async function clearExistingData() {
  console.log("Clearing existing data...");

  try {
    // Delete data in this order to avoid foreign key constraint issues
    await deleteData("matches", matchClient);
    await deleteData("teams", teamClient);
    await deleteData("ladders", ladderClient);
    await deleteData("players", playerClient);

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw new Error("Failed to clear database");
  }
}

/**
 * Helper function to delete data from a specific model in batches.
 * @param modelName - The name of the model (used for logging).
 * @param client - The Amplify client for the model.
 * @throws An error if there's a problem fetching or deleting data.
 */
async function deleteData(modelName: string, client: any) {
  const { data: dataToDelete, errors: listErrors } = await client().list();

  if (listErrors) {
    console.error(`Error fetching ${modelName}:`, listErrors);
    throw new Error(
      `Failed to fetch ${modelName}: ${listErrors
        .map((e) => e.message)
        .join(", ")}`
    );
  }

  if (dataToDelete && dataToDelete.length > 0) {
    console.log(`Deleting ${dataToDelete.length} ${modelName}...`);

    for (let i = 0; i < dataToDelete.length; i += BATCH_SIZE) {
      const batch = dataToDelete.slice(i, i + BATCH_SIZE);
      await Promise.all(batch.map((item) => client().delete({ id: item.id })));
      console.log(
        `Deleted ${Math.min(i + BATCH_SIZE, dataToDelete.length)}/${
          dataToDelete.length
        } ${modelName}`
      );
    }
  }
}

/**
 * Generates random players with realistic data. Uses batch processing for efficiency.
 * @param count - The number of players to generate.
 * @returns An array of generated Player objects.
 */
async function generatePlayers(count: number): Promise<Player[]> {
  console.log(`Generating ${count} players...`);
  const players: Player[] = [];
  const batches = Math.ceil(count / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, count);
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
 * Generates random ladders with realistic data. Uses batch processing for efficiency.
 * @param count - The number of ladders to generate.
 * @returns An array of generated Ladder objects.
 */
async function generateLadders(count: number): Promise<Ladder[]> {
  console.log(`Generating ${count} ladders...`);
  const ladders: Ladder[] = [];
  const batches = Math.ceil(count / BATCH_SIZE);

  for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
    const start = batchIndex * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, count);
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
 * Generates random teams and assigns them to ladders and players. Handles single-player teams based on the provided rate. Uses batch processing for efficiency.
 * @param count - The number of teams to generate.
 * @param ladders - An array of available Ladder objects.
 * @param players - An array of available Player objects.
 * @param singlePlayerRate - The probability of a team having only one player (0.0 to 1.0).
 * @returns An array of generated Team objects.
 */
async function generateTeams(
  count: number,
  ladders: Ladder[],
  players: Player[],
  singlePlayerRate: number
): Promise<Team[]> {
  console.log(`Generating ${count} teams...`);
  const teams: Team[] = [];

  // Create a copy of players to avoid modifying the original array
  const availablePlayers = [...players];

  // Shuffle the players array to randomize player assignments
  shuffleArray(availablePlayers);

  try {
    // Prepare team creation parameters
    const teamParams = Array.from({ length: count }, () => ({
      name: randomTeamName(),
      rating: randomRating(1000, 1600),
      ladderId: randomElement(ladders).id,
    }));

    // Create teams in batches
    const batches = Math.ceil(count / BATCH_SIZE);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, count);
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

      // Assign players to teams
      const teamsWithPlayersResults = await Promise.all(
        createdTeams.map(async (team) => {
          // Determine if this team should have one or two players
          const isSinglePlayerTeam = Math.random() < singlePlayerRate;

          // Assign player 1
          const player1 = availablePlayers.pop();
          if (!player1) {
            console.warn(`Not enough players to assign to team ${team.name}`);
            return team; // Return the team without players if not enough players are available
          }

          // Assign player 2 if needed and available
          const player2 =
            !isSinglePlayerTeam && availablePlayers.length > 0
              ? availablePlayers.pop()
              : null;

          // Update team with player IDs
          const updatedTeamResult = await teamClient().update({
            id: team.id,
            player1Id: player1.id,
            player2Id: player2?.id,
          });

          if (updatedTeamResult.errors) {
            console.error(
              `Error updating team ${team.name} with players:`,
              updatedTeamResult.errors
            );
            return team; // Return original team if update fails
          }
          return updatedTeamResult.data;
        })
      );

      // Add the updated teams to the result array
      teams.push(...(teamsWithPlayersResults.filter(Boolean) as Team[]));

      console.log(`Created ${teams.length}/${count} teams`);
    }

    console.log(`Successfully created ${teams.length} teams`);
    return teams;
  } catch (error) {
    console.error("Error generating teams:", error);
    return teams; // Return any teams that were successfully created
  }
}

/**
 * Generates random matches between teams in ladders.  Handles win probabilities based on team ratings. Uses batch processing for efficiency.
 * @param count - The number of matches to generate.
 * @param teams - An array of available Team objects.
 * @param winRate - The probability of a match having a recorded winner (0.0 to 1.0).
 * @returns An array of generated Match objects.
 */
async function generateMatches(
  count: number,
  teams: Team[],
  winRate: number
): Promise<Match[]> {
  console.log(`Generating ${count} matches...`);
  const matches: Match[] = [];

  // Group teams by ladder for efficient match generation
  const teamsByLadder: Record<string, Team[]> = {};
  for (const team of teams) {
    if (team.ladderId) {
      teamsByLadder[team.ladderId] = teamsByLadder[team.ladderId] || [];
      teamsByLadder[team.ladderId].push(team);
    }
  }

  try {
    // Generate matches for each ladder with at least two teams
    for (const ladderId in teamsByLadder) {
      const ladderTeams = teamsByLadder[ladderId];

      if (ladderTeams.length < 2) {
        console.log(`Skipping ladder ${ladderId}: Not enough teams`);
        continue;
      }

      // Determine the number of matches to generate for this ladder
      const ladderMatchCount = Math.min(
        Math.floor(count * (ladderTeams.length / teams.length)),
        Math.floor(ladderTeams.length * 3) // ~3 matches per team on average
      );

      // Generate match parameters for this ladder
      const matchParams = Array.from({ length: ladderMatchCount }, () => {
        // Select two different teams randomly
        let team1, team2;
        do {
          team1 = randomElement(ladderTeams);
          team2 = randomElement(ladderTeams);
        } while (team1 === team2);

        // Determine if there's a winner
        const hasWinner = Math.random() < winRate;

        // Determine the winner based on team ratings (simplified Elo-like calculation)
        let winnerId = undefined;
        if (hasWinner) {
          const team1Rating = team1.rating || 1200;
          const team2Rating = team2.rating || 1200;
          const ratingDiff = team1Rating - team2Rating;
          const team1WinProbability = 1 / (1 + Math.pow(10, -ratingDiff / 400));
          winnerId = Math.random() < team1WinProbability ? team1.id : team2.id;
        }

        // Create match date within the last 30 days
        const playedOn = randomRecentDate(30).toISOString();

        return {
          ladderId,
          team1Id: team1.id,
          team2Id: team2.id,
          winnerId,
          playedOn,
        };
      });

      // Create matches in batches
      const batches = Math.ceil(ladderMatchCount / BATCH_SIZE);

      for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
        const start = batchIndex * BATCH_SIZE;
        const end = Math.min(start + BATCH_SIZE, ladderMatchCount);
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

        // Add successfully created matches to the main array
        matches.push(
          ...(createdMatchesResults
            .map((result) => result.data)
            .filter(Boolean) as Match[])
        );

        console.log(
          `Created ${matches.length} matches so far (${createdMatchesResults.length} in this batch)`
        );
      }
    }

    console.log(`Successfully created ${matches.length} matches`);
    return matches;
  } catch (error) {
    console.error("Error generating matches:", error);
    return matches; // Return any matches that were successfully created
  }
}

/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array - The array to shuffle.
 */
function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * Main function to generate and add sample entities to the database.  Handles configuration, data generation, and error handling.
 * @param config - Optional configuration object to override default values.
 * @returns An object containing the generated players, ladders, teams, and matches.
 * @throws An error if any part of the data generation process fails.
 */
export async function addSampleEntities(config: Partial<GeneratorConfig> = {}) {
  // Merge user-provided config with default config
  const finalConfig: GeneratorConfig = { ...DEFAULT_CONFIG, ...config };

  console.log("Sample data configuration:", finalConfig);

  try {
    // Clear existing data if requested
    if (finalConfig.deleteExisting) {
      await clearExistingData();
    }

    // Generate data in a specific order to handle dependencies
    const players = await generatePlayers(finalConfig.numPlayers!);
    const ladders = await generateLadders(finalConfig.numLadders!);
    const teams = await generateTeams(
      finalConfig.numTeams!,
      ladders,
      players,
      finalConfig.singlePlayerTeamRate!
    );
    const matches = await generateMatches(
      finalConfig.numMatches!,
      teams,
      finalConfig.matchWinRate!
    );

    return { players, ladders, teams, matches };
  } catch (error) {
    console.error("Error generating sample data:", error);
    throw new Error("Failed to generate sample data");
  } finally {
    console.log("Sample data generation complete");
  }
}

/**
 * Generates a smaller dataset for quick testing.
 * @returns A promise that resolves to an object containing the generated data.
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

"use client";

import { faker } from "@faker-js/faker";
import * as changeCase from "change-case";
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

function ladderName() {
  return changeCase.capitalCase(
    `${faker.commerce.productAdjective()} ${faker.commerce.product()}`
  );
}

function teamName() {
  return changeCase.capitalCase(
    `${faker.food.adjective()} ${faker.food.dish()}`
  );
}

// =================== GENERIC ENTITY GENERATOR ===================

/**
 * Options for generating entities
 */
interface GenerateEntitiesOptions<T, CreateParamsType> {
  /** The number of entities to generate */
  count: number;

  /** The name of the entity type (for logging) */
  entityName: string;

  /** Function that generates parameters for the create function */
  generateParams: (index: number) => CreateParamsType;

  /** Function that creates a single entity */
  createOne: (
    params: CreateParamsType
  ) => Promise<{ data?: T | null; errors?: any[] }>;

  /** Function to run after each entity is created (optional) */
  onEntityCreated?: (entity: T, index: number) => Promise<void> | void;

  /** How often to log progress (e.g. log every 10 items) */
  logInterval?: number;

  /** Whether to continue on error */
  continueOnError?: boolean;
}

/**
 * Generic function to generate multiple entities
 */
async function generateEntities<T, CreateParamsType>({
  count,
  entityName,
  generateParams,
  createOne,
  onEntityCreated,
  logInterval = 10,
  continueOnError = true,
}: GenerateEntitiesOptions<T, CreateParamsType>): Promise<T[]> {
  console.log(`Generating ${count} ${entityName}s...`);
  const entities: T[] = [];

  try {
    // Generate all entity parameters upfront
    const allParams = Array.from({ length: count }, (_, i) =>
      generateParams(i)
    );

    // Create all entities in batches of 10 (or other appropriate batch size)
    const batchSize = 10;
    const batches = Math.ceil(count / batchSize);

    for (let batchIndex = 0; batchIndex < batches; batchIndex++) {
      const start = batchIndex * batchSize;
      const end = Math.min(start + batchSize, count);

      console.log(
        `Processing batch ${batchIndex + 1}/${batches} (${start + 1}-${end})...`
      );

      // Create entities in this batch concurrently
      const batchResults = await Promise.all(
        allParams.slice(start, end).map(async (params, localIndex) => {
          const i = start + localIndex;
          try {
            const { data, errors } = await createOne(params);

            if (errors) {
              console.error(`Error creating ${entityName} ${i + 1}:`, errors);
              if (!continueOnError) {
                throw new Error(`Failed to create ${entityName}`);
              }
              return null;
            }

            return data as T;
          } catch (err) {
            console.error(`Error creating ${entityName} ${i + 1}:`, err);
            if (!continueOnError) throw err;
            return null;
          }
        })
      );

      // Filter out nulls and add successful entities to the result array
      const validEntities = batchResults.filter(Boolean) as T[];
      entities.push(...validEntities);

      // Process callbacks for entities if needed
      if (onEntityCreated && validEntities.length > 0) {
        await Promise.all(
          validEntities.map((entity, localIndex) =>
            onEntityCreated(entity, start + localIndex)
          )
        );
      }

      console.log(`Created ${entities.length}/${count} ${entityName}s`);
    }

    console.log(`Successfully created ${entities.length} ${entityName}s`);
    return entities;
  } catch (error) {
    console.error(`Error generating ${entityName}s:`, error);
    return entities; // Return any entities we managed to create
  }
}

// =================== ENTITY CREATOR FACTORY ===================

/**
 * Options for creating a batch of entities
 */
interface EntityCreatorOptions<T, P, D = any> {
  /** The type of entity being created (for logging) */
  entityType: string;

  /** Function to generate the entity */
  generator: (count: number, dependencies?: D) => Promise<T[]>;

  /** Default number of entities to create */
  defaultCount: number;

  /** Optional transformation to apply to the entities before returning */
  transform?: (entities: T[]) => T[] | Promise<T[]>;
}

/**
 * Creates a function that can generate a batch of entities
 */
function createEntityBatchCreator<T, P, D = any>({
  entityType,
  generator,
  defaultCount,
  transform,
}: EntityCreatorOptions<T, P, D>) {
  return async (
    count: number = defaultCount,
    dependencies?: D
  ): Promise<T[]> => {
    console.log(`Creating ${count} ${entityType}s...`);
    try {
      let entities = await generator(count, dependencies);

      if (transform) {
        entities = await transform(entities);
      }

      console.log(`Successfully created ${entities.length} ${entityType}s`);
      return entities;
    } catch (error) {
      console.error(`Error creating ${entityType}s:`, error);
      throw error;
    }
  };
}

// =================== DATA GENERATION CONFIGURATION ===================

/**
 * Configuration for data generation
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

// =================== GENERATOR FUNCTIONS ===================

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
  return generateEntities<
    Player,
    { givenName: string; familyName: string; email: string }
  >({
    count,
    entityName: "player",
    generateParams: () => {
      const givenName = faker.person.firstName();
      const familyName = faker.person.lastName();
      const email = faker.internet
        .email({ firstName: givenName, lastName: familyName })
        .toLowerCase();

      return { givenName, familyName, email };
    },
    createOne: (params) => playerClient().create(params),
    logInterval: 10,
  });
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
      const rating = faker.number.int({ min: 1000, max: 1600 });

      return {
        name: teamName(),
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
        let team1Index = Math.floor(Math.random() * ladderTeams.length);
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
        const matchDate = faker.date.recent({ days: 30 });

        return {
          ladderId,
          team1Id: team1.id,
          team2Id: team2.id,
          winnerId,
          date: matchDate.toISOString(),
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
 * Generic function to generate an entity of a specific type
 */
export function createEntityGenerator<T, P>(
  entityType: string,
  client: any,
  paramGenerator: () => P
): (count: number) => Promise<T[]> {
  return (count: number) => {
    return generateEntities<T, P>({
      count,
      entityName: entityType,
      generateParams: () => paramGenerator(),
      createOne: (params) => client.create(params),
      logInterval: entityType === "ladder" ? 1 : 5,
    });
  };
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

    // Create reusable entity generators
    const createPlayers = createEntityGenerator<
      Player,
      { givenName: string; familyName: string; email: string; avatar: string }
    >("player", playerClient(), () => {
      const givenName = faker.person.firstName();
      const familyName = faker.person.lastName();

      return {
        givenName,
        familyName,
        email: faker.internet
          .email({ firstName: givenName, lastName: familyName })
          .toLowerCase(),
        avatar: faker.image.avatar(),
      };
    });

    const createLadders = createEntityGenerator<
      Ladder,
      { name: string; description: string }
    >("ladder", ladderClient(), () => ({
      name: ladderName(),
      description: faker.lorem.sentence(20),
    }));

    // Generate data in order (players → ladders → teams → matches)
    const players = await createPlayers(finalConfig.numPlayers!);
    const ladders = await createLadders(finalConfig.numLadders!);
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

/**
 * Create a single entity of a specific type with the given parameters
 */
export async function createEntity<T, P extends Record<string, any>>(
  entityType: "player" | "ladder" | "team" | "match",
  params: P
): Promise<T | null> {
  try {
    console.log(`Creating ${entityType} with params:`, params);

    let client;
    switch (entityType) {
      case "player":
        client = playerClient();
        break;
      case "ladder":
        client = ladderClient();
        break;
      case "team":
        client = teamClient();
        break;
      case "match":
        client = matchClient();
        break;
      default:
        throw new Error(`Unknown entity type: ${entityType}`);
    }

    const { data, errors } = await client.create(params);

    if (errors) {
      console.error(`Error creating ${entityType}:`, errors);
      throw new Error(`Failed to create ${entityType}`);
    }

    if (data) {
      console.log(`Successfully created ${entityType}:`, data);
      return data as T;
    }

    return null;
  } catch (error) {
    console.error(`Error creating ${entityType}:`, error);
    throw error;
  }
}

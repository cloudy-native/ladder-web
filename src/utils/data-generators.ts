"use client";

// TODO: Use faker for everything
//
import { faker } from "@faker-js/faker";
import {
  Ladder,
  LadderModel,
  Match,
  MatchModel,
  Player,
  PlayerModel,
  Team,
  TeamModel,
} from "./amplify-helpers";

// =================== DATA DEFINITIONS ===================

// Racket sports-inspired ladder divisions
const LADDER_DIVISIONS = [
  {
    name: "Pro Tour Elite",
    description:
      "The pinnacle of competitive racket sports - where champions are crowned",
  },
  {
    name: "Advanced Division",
    description:
      "High-level play for experienced competitors with refined technique",
  },
  {
    name: "Intermediate Power",
    description: "Solid players who've mastered the fundamentals of the game",
  },
  {
    name: "Challenger Circuit",
    description:
      "Developing players looking to test their skills against tougher competition",
  },
  {
    name: "Foundation League",
    description:
      "Building consistent play with an emphasis on technique development",
  },
  {
    name: "Recreational Plus",
    description:
      "Regular players with a competitive edge seeking organized matches",
  },
  {
    name: "Social Starters",
    description:
      "Introduction to competitive play in a friendly, supportive environment",
  },
];

// Clever/funny racket sports team names
const TEAM_NAMES = [
  // Racket sports puns - general
  "Net Profits",
  "Strings Attached",
  "Court Jesters",
  "Smash Hit",
  "Deuce & Associates",
  "The Racket-eers",
  "Serve-ivors",
  "Lob City",
  "Top Spinners",
  "Return Policy",
  "Just the Tip",
  "No Strings Attached",
  "Baseline Bandits",
  "Volley Llamas",
  "The Drop Shots",
  "Alley-Oops",
  "Slice & Dice",
  "Grip It & Rip It",
  "The Fault Finders",
  "Sweet Spot",
  "Tenacious Slice",
  "The Overhead Smashers",
  "Double Fault Coffee",
  "Hit & Giggle",
  "The Spin Doctors",
  "BackSpin Bandits",
  "Topspin Tyrants",
  "Rally Monkeys",

  // Tennis references
  "Grand Slammers",
  "Advantage Point",
  "Love-Forty Thieves",
  "The Break Points",
  "Deuce Bigalow",
  "New Balls Please",
  "Game, Set, Match",
  "You Got Served",
  "Federer Express",
  "Nadal's Biceps",
  "The Djokesters",
  "Serena's Sirens",
  "Wimble-Done",
  "Court of Appeals",
  "The Ballboys",
  "Hawkeye High Five",

  // Pickleball references
  "Dill With It",
  "The Pickleballers",
  "Kosher Dills",
  "Sweet Pickles",
  "Dinking Donuts",
  "Kitchen Sink",
  "Zero-Zero-Twos",
  "Picklenauts",
  "Gherkin Jerks",
  "In-A-Pickle",
  "Dinkable Feast",
  "No Dinking Way",

  // Squash references
  "Squash Goals",
  "Squash the Competition",
  "Wall Bangers",
  "Boast Masters",
  "Corner Pocket",
  "The Tin Men",
  "Nick Pick",
  "Squash Buckling Heroes",

  // Racquetball references
  "Blue Balls",
  "Kill Shot Crew",
  "Ceiling Service",
  "Wall Stars",
  "Off-The-Wall",
  "Drive-By Shooters",
  "Racquet Scientists",
  "Ball Busters",

  // Badminton references
  "Shuttle Runners",
  "Shuttlecocks",
  "Feather Friends",
  "The Clear Winners",
  "Smash Bros",
  "Birds of Play",
  "Shuttleworth It",
  "Cock A Hoop",
];

/**
 * Configuration for data generation
 */
interface GeneratorConfig {
  numPlayers?: number; // Number of players to generate
  numLadders?: number; // Number of ladders to create (max 7)
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
  numPlayers: 50,
  numLadders: 5,
  numTeams: 30,
  numMatches: 40,
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
    // First delete teams to avoid foreign key constraints
    const { data: teams } = await TeamModel.list();
    if (teams && teams.length > 0) {
      for (const team of teams) {
        await TeamModel.delete({ id: team.id });
      }
      console.log(`Deleted ${teams.length} teams`);
    }

    // Delete ladders
    const { data: ladders } = await LadderModel.list();
    if (ladders && ladders.length > 0) {
      for (const ladder of ladders) {
        await LadderModel.delete({ id: ladder.id });
      }
      console.log(`Deleted ${ladders.length} ladders`);
    }

    // Delete players
    const { data: players } = await PlayerModel.list();
    if (players && players.length > 0) {
      for (const player of players) {
        await PlayerModel.delete({ id: player.id });
      }
      console.log(`Deleted ${players.length} players`);
    }

    // Delete matches
    const { data: matches } = await MatchModel.list();
    if (matches && matches.length > 0) {
      for (const match of matches) {
        await MatchModel.delete({ id: match.id });
      }
      console.log(`Deleted ${matches.length} matches`);
    }

    console.log("Database cleared successfully");
  } catch (error) {
    console.error("Error clearing database:", error);
    throw new Error("Failed to clear database");
  }
}

// Popular racket sports clubs for player affiliation
const RACKET_CLUBS = [
  "Westside Racket Club",
  "River City Tennis Center",
  "Pickleball Paradise",
  "Smash & Dash Squash Club",
  "Courtside Athletic Village",
  "The Racket Factory",
  "Grand Slam Club",
  "Baseline Community Center",
  "Ace Athletics",
  "The Tennis Barn",
  "Metro Racket Sports",
  "Eagle Point Racquet Club",
  "Downtown Indoor Courts",
  "The Serve Bar & Grill",
  "University Racket Complex",
];

/**
 * Generate random players with realistic names, emails, and racket sports flair
 */
async function generatePlayers(count: number): Promise<Player[]> {
  console.log(`Generating ${count} players...`);
  const players: Player[] = [];

  // Occasionally create "famous" players with recognizable names from racket sports
  const racketSportStars = [
    { givenName: "Roger", familyName: "Federer", email: "roger@grandslam.com" },
    {
      givenName: "Serena",
      familyName: "Williams",
      email: "serena@champions.net",
    },
    { givenName: "Rafael", familyName: "Nadal", email: "rafa@claycourt.com" },
    { givenName: "Novak", familyName: "Djokovic", email: "nole@topspin.org" },
    {
      givenName: "Jahangir",
      familyName: "Khan",
      email: "khan@squashlegend.com",
    },
    { givenName: "Anna", familyName: "Nordqvist", email: "anna@paddel.se" },
    { givenName: "Ben", familyName: "Johns", email: "ben@pickleballpro.org" },
    {
      givenName: "Kane",
      familyName: "Waselenchuk",
      email: "kane@racquetball.net",
    },
  ];

  // Mix in the stars randomly with regular players
  const starCount = Math.min(racketSportStars.length, Math.floor(count * 0.1)); // Use up to 10% stars
  const usedStars: number[] = [];

  try {
    for (let i = 0; i < count; i++) {
      // Decide if this should be a star player (if any left)
      const createStar = usedStars.length < starCount && Math.random() < 0.5;

      let playerInfo;

      if (createStar) {
        // Pick a random unused star
        let starIndex;
        do {
          starIndex = Math.floor(Math.random() * racketSportStars.length);
        } while (usedStars.includes(starIndex));

        usedStars.push(starIndex);
        playerInfo = racketSportStars[starIndex];
      } else {
        // Create a regular player
        const givenName = faker.person.firstName();
        const familyName = faker.person.lastName();
        const email = faker.internet
          .email({ firstName: givenName, lastName: familyName })
          .toLowerCase();
        playerInfo = { givenName, familyName, email };
      }

      // Randomly assign a club affiliation to some players
      const hasClubAffiliation = Math.random() < 0.7; // 70% have a club
      const clubIndex = Math.floor(Math.random() * RACKET_CLUBS.length);

      // Create the player
      const { data, errors } = await PlayerModel.create({
        givenName: playerInfo.givenName,
        familyName: playerInfo.familyName,
        email: playerInfo.email,
      });

      if (errors) {
        console.error(`Error creating player ${i + 1}:`, errors);
        continue;
      }

      if (data) {
        players.push(data);
        if ((i + 1) % 10 === 0) {
          console.log(`Created ${i + 1}/${count} players`);
        }
      }
    }

    console.log(`Successfully created ${players.length} players`);
    return players;
  } catch (error) {
    console.error("Error generating players:", error);
    return players; // Return any players we managed to create
  }
}

/**
 * Generate ladder divisions
 */
async function generateLadders(count: number): Promise<Ladder[]> {
  console.log(`Generating ${count} ladders...`);
  const ladders: Ladder[] = [];

  // Limit count to available divisions
  const actualCount = Math.min(count, LADDER_DIVISIONS.length);

  try {
    for (let i = 0; i < actualCount; i++) {
      const division = LADDER_DIVISIONS[i];

      const { data, errors } = await LadderModel.create({
        name: division.name,
        description: division.description,
      });

      if (errors) {
        console.error(`Error creating ladder ${i + 1}:`, errors);
        continue;
      }

      if (data) {
        ladders.push(data);
        console.log(`Created ladder: ${division.name}`);
      }
    }

    console.log(`Successfully created ${ladders.length} ladders`);
    return ladders;
  } catch (error) {
    console.error("Error generating ladders:", error);
    return ladders; // Return any ladders we managed to create
  }
}

// Define racket sport types for categorization
const RACKET_SPORTS = [
  "Tennis",
  "Pickleball",
  "Squash",
  "Racquetball",
  "Badminton",
  "Platform Tennis",
  "Padel",
];

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

  // Calculate dates for matches (last 30 days)
  const now = new Date();
  const dates: Date[] = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(now.getDate() - i);
    dates.push(date);
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

      for (let i = 0; i < ladderMatchCount; i++) {
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
        // Higher rated teams have a better chance of winning, but upsets can happen
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

        // Use a random date from the last 30 days
        const createdAt =
          dates[Math.floor(Math.random() * dates.length)].toISOString();

        // Create the match
        const { data, errors } = await MatchModel.create({
          ladderId,
          team1Id: team1.id,
          team2Id: team2.id,
          winnerId,
        });

        if (errors) {
          console.error(`Error creating match ${i + 1}:`, errors);
          continue;
        }

        if (data) {
          matches.push(data);

          const winnerText = winnerId
            ? `Winner: ${winnerId === team1.id ? team1.name : team2.name}`
            : "No winner recorded";

          if ((i + 1) % 5 === 0 || i === ladderMatchCount - 1) {
            console.log(
              `Created ${
                i + 1
              }/${ladderMatchCount} matches for ladder ${ladderId}`
            );
          }
        }
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
 * Generate teams with funny racket sports names and assign to ladders
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

  // Shuffle and limit team names if needed
  const shuffledTeamNames = [...TEAM_NAMES]
    .sort(() => Math.random() - 0.5)
    .slice(0, count);

  try {
    for (let i = 0; i < Math.min(count, shuffledTeamNames.length); i++) {
      // Randomly assign a ladder (or no ladder for some teams)
      const assignLadder = Math.random() < 0.85; // 85% of teams are in a ladder
      const ladderId = assignLadder
        ? ladders[Math.floor(Math.random() * ladders.length)].id
        : undefined;

      // Generate a rating between 1000 and 1800 with a bell curve distribution
      const baseRating = 1400;
      const deviation = 200;
      // Sum 3 random numbers for a more bell-curve like distribution
      const rating =
        baseRating +
        Math.floor(
          (Math.random() + Math.random() + Math.random() - 1.5) * deviation
        );

      // Assign a racket sport type to this team
      const sportType =
        RACKET_SPORTS[Math.floor(Math.random() * RACKET_SPORTS.length)];

      // Add some flavor text based on the sportType
      let namePrefix = "";

      // 30% chance to add a sport type prefix to the name
      if (Math.random() < 0.3) {
        namePrefix = `[${sportType}] `;
      }

      // Create team
      const { data, errors } = await TeamModel.create({
        name: namePrefix + shuffledTeamNames[i],
        rating,
        ladderId,
      });

      if (errors) {
        console.error(`Error creating team ${i + 1}:`, errors);
        continue;
      }

      if (data) {
        // Should this team have one or two players?
        // For racquetball and squash, increase the likelihood of single player
        const sportBasedSingleRate =
          sportType === "Racquetball" || sportType === "Squash"
            ? Math.max(0.5, singlePlayerRate) // at least 50% for these sports
            : singlePlayerRate;

        const isSinglePlayerTeam = Math.random() < sportBasedSingleRate;

        // Check if we have enough players left
        if (availablePlayers.length === 0) {
          console.log(`Created team without players (ran out): ${data.name}`);
          teams.push(data);
          continue;
        }

        // Assign player 1
        const player1 = availablePlayers.pop()!;

        // Assign player 2 if needed and available
        let player2 = null;
        if (!isSinglePlayerTeam && availablePlayers.length > 0) {
          player2 = availablePlayers.pop()!;
        }

        // Update team with players
        const { data: updatedTeam, errors: updateErrors } =
          await TeamModel.update({
            id: data.id,
            player1Id: player1.id,
            player2Id: player2?.id,
          });

        if (updateErrors) {
          console.error(
            `Error updating team ${data.name} with players:`,
            updateErrors
          );
        }

        if (updatedTeam) {
          teams.push(updatedTeam);
          const ladderName = ladderId
            ? ladders.find((l) => l.id === ladderId)?.name
            : "None";
          const playerInfo = player2
            ? `${player1.givenName} ${player1.familyName} and ${player2.givenName} ${player2.familyName}`
            : `${player1.givenName} ${player1.familyName} (solo)`;

          console.log(
            `Created ${sportType} team: ${updatedTeam.name} - Ladder: ${ladderName} - Players: ${playerInfo}`
          );
        }
      }
    }

    console.log(`Successfully created ${teams.length} teams`);
    return teams;
  } catch (error) {
    console.error("Error generating teams:", error);
    return teams; // Return any teams we managed to create
  }
}

/**
 * Main function to add sample entities to the database
 */
export async function addSampleEntities(config: Partial<GeneratorConfig> = {}) {
  // Merge provided config with defaults
  const finalConfig: GeneratorConfig = { ...DEFAULT_CONFIG, ...config };

  console.log("=".repeat(50));
  console.log("GENERATING SAMPLE DATA");
  console.log("Configuration:", finalConfig);
  console.log("=".repeat(50));

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
    console.log("=".repeat(50));
    console.log("SAMPLE DATA GENERATION COMPLETE");
    console.log("=".repeat(50));
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

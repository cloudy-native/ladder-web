import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "../amplify-helpers";

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  rating: number = 1200,
  ladderId?: string,
  player1Id?: string,
  player2Id?: string
): Promise<Team> {
  try {
    const { data: createdTeam, errors } = await teamClient().create({
      name: name.trim(),
      rating,
      ladderId,
      player1Id,
      player2Id,
    });

    if (!createdTeam) {
      throw new Error("Failed to create team");
    }

    if (errors) {
      console.error("Error creating team:", errors);
      throw new Error("Failed to create team");
    }

    console.log("Team created successfully:", createdTeam);

    return createdTeam;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

/**
 * Create a new ladder
 */
export async function createLadder(
  name: string,
  description?: string
): Promise<Ladder> {
  try {
    const { data: createdLadder, errors } = await ladderClient().create({
      name: name.trim(),
      description: description?.trim() || "",
    });

    if (!createdLadder) {
      throw new Error("Failed to create ladder");
    }

    if (errors) {
      console.error("Error creating ladder:", errors);
      throw new Error("Failed to create ladder");
    }

    console.log("Ladder created successfully:", createdLadder);

    return createdLadder;
  } catch (error) {
    console.error("Exception creating ladder:", error);
    throw error;
  }
}

/**
 * Create a new player
 */
export async function createPlayer(
  givenName: string,
  familyName: string,
  email: string
): Promise<Player> {
  try {
    const { data: createdPlayer, errors } = await playerClient().create({
      givenName: givenName.trim(),
      familyName: familyName.trim(),
      email: email.trim(),
    });

    if (!createdPlayer) {
      throw new Error("Failed to create player");
    }

    if (errors) {
      console.error("Error creating player:", errors);
      throw new Error("Failed to create player");
    }

    console.log("Player created successfully:", createdPlayer);
    
    return createdPlayer;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
}

/**
 * Create a new match
 */
export async function createMatch(
  ladderId: string,
  team1Id: string,
  team2Id: string,
  winnerId?: string
): Promise<Match> {
  try {
    const { data: createdMatch, errors } = await matchClient().create({
      ladderId,
      team1Id,
      team2Id,
      winnerId,
    });

    if (!createdMatch) {
      throw new Error("Failed to create match");
    }

    if (errors) {
      console.error("Error creating match:", errors);
      throw new Error("Failed to create match");
    }

    console.log("Match created successfully:", createdMatch);

    return createdMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
}

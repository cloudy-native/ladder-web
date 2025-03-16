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
 * Create a new team
 *
 * @param name - The name of the team. Must not be empty after trimming.
 * @param rating - The initial rating of the team (default: 1200).
 * @param ladderId - The ID of the ladder the team belongs to (optional).
 * @param player1Id - The ID of the first player in the team (optional).
 * @param player2Id - The ID of the second player in the team (optional).
 * @returns A promise that resolves to the created Team object.
 * @throws Error if the team creation fails or if the name is empty after trimming.
 */
export async function createTeam(
  name: string,
  rating: number = 1200,
  ladderId?: string,
  player1Id?: string,
  player2Id?: string
): Promise<Team> {
  try {
    // Trim the name to remove leading/trailing whitespace
    const trimmedName = name.trim();

    // Check if the name is empty after trimming
    if (trimmedName === "") {
      throw new Error("Team name cannot be empty");
    }

    const { data: createdTeam, errors } = await teamClient().create({
      name: trimmedName, // Use the trimmed name
      rating,
      ladderId,
      player1Id,
      player2Id,
    });

    // Check if the team was created successfully
    if (!createdTeam) {
      throw new Error(
        "Failed to create team: No data returned from teamClient().create()"
      );
    }

    // Check for errors from the teamClient
    if (errors) {
      console.error("Error creating team:", errors);
      throw new Error(
        `Failed to create team: ${errors.map((e) => e.message).join(", ")}`
      ); // Provide more detail about the errors
    }

    console.log("Team created successfully:", createdTeam);

    return createdTeam;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Create a new ladder
 *
 * @param name - The name of the ladder. Must not be empty after trimming.
 * @param description - The description of the ladder (optional).
 * @returns A promise that resolves to the created Ladder object.
 * @throws Error if the ladder creation fails or if the name is empty after trimming.
 */
export async function createLadder(
  name: string,
  description?: string
): Promise<Ladder> {
  try {
    // Trim the name and description to remove leading/trailing whitespace
    const trimmedName = name.trim();
    const trimmedDescription = description?.trim() || "";

    // Check if the name is empty after trimming
    if (trimmedName === "") {
      throw new Error("Ladder name cannot be empty");
    }

    const { data: createdLadder, errors } = await ladderClient().create({
      name: trimmedName, // Use the trimmed name
      description: trimmedDescription, // Use the trimmed description
    });

    // Check if the ladder was created successfully
    if (!createdLadder) {
      throw new Error(
        "Failed to create ladder: No data returned from ladderClient().create()"
      );
    }

    // Check for errors from the ladderClient
    if (errors) {
      console.error("Error creating ladder:", errors);
      throw new Error(
        `Failed to create ladder: ${errors.map((e) => e.message).join(", ")}`
      ); // Provide more detail about the errors
    }

    console.log("Ladder created successfully:", createdLadder);

    return createdLadder;
  } catch (error) {
    console.error("Exception creating ladder:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Create a new player
 *
 * @param givenName - The given name of the player. Must not be empty after trimming.
 * @param familyName - The family name of the player. Must not be empty after trimming.
 * @param email - The email of the player. Must not be empty after trimming.
 * @returns A promise that resolves to the created Player object.
 * @throws Error if the player creation fails or if any of the input strings are empty after trimming.
 */
export async function createPlayer(
  givenName: string,
  familyName: string,
  email: string
): Promise<Player> {
  try {
    // Trim the input strings to remove leading/trailing whitespace
    const trimmedGivenName = givenName.trim();
    const trimmedFamilyName = familyName.trim();
    const trimmedEmail = email.trim();

    // Check if any of the input strings are empty after trimming
    if (trimmedGivenName === "") {
      throw new Error("Player given name cannot be empty");
    }
    if (trimmedFamilyName === "") {
      throw new Error("Player family name cannot be empty");
    }
    if (trimmedEmail === "") {
      throw new Error("Player email cannot be empty");
    }

    const { data: createdPlayer, errors } = await playerClient().create({
      givenName: trimmedGivenName, // Use the trimmed given name
      familyName: trimmedFamilyName, // Use the trimmed family name
      email: trimmedEmail, // Use the trimmed email
    });

    // Check if the player was created successfully
    if (!createdPlayer) {
      throw new Error(
        "Failed to create player: No data returned from playerClient().create()"
      );
    }

    // Check for errors from the playerClient
    if (errors) {
      console.error("Error creating player:", errors);
      throw new Error(
        `Failed to create player: ${errors.map((e) => e.message).join(", ")}`
      ); // Provide more detail about the errors
    }

    console.log("Player created successfully:", createdPlayer);

    return createdPlayer;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

/**
 * Create a new match
 *
 * @param ladderId - The ID of the ladder the match belongs to.
 * @param team1Id - The ID of the first team in the match.
 * @param team2Id - The ID of the second team in the match.
 * @param winnerId - The ID of the winning team (optional).
 * @returns A promise that resolves to the created Match object.
 * @throws Error if the match creation fails.
 */
export async function createMatch(
  ladderId: string,
  team1Id: string,
  team2Id: string,
  winnerId?: string
): Promise<Match> {
  try {
    // Basic validation to ensure required fields are present
    if (!ladderId) {
      throw new Error("ladderId is required to create a match");
    }
    if (!team1Id) {
      throw new Error("team1Id is required to create a match");
    }
    if (!team2Id) {
      throw new Error("team2Id is required to create a match");
    }

    const { data: createdMatch, errors } = await matchClient().create({
      ladderId,
      team1Id,
      team2Id,
      winnerId,
    });

    // Check if the match was created successfully
    if (!createdMatch) {
      throw new Error(
        "Failed to create match: No data returned from matchClient().create()"
      );
    }

    // Check for errors from the matchClient
    if (errors) {
      console.error("Error creating match:", errors);
      throw new Error(
        `Failed to create match: ${errors.map((e) => e.message).join(", ")}`
      ); // Provide more detail about the errors
    }

    console.log("Match created successfully:", createdMatch);

    return createdMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}

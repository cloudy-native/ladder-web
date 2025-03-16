import { Match, matchClient } from "@/utils/amplify-helpers";

/**
 * Creates a new match.
 * @param ladderId - The ID of the ladder the match belongs to.
 * @param team1Id - The ID of the first team.
 * @param team2Id - The ID of the second team.
 * @param winnerId - The ID of the winning team (optional).
 * @param playedOn - The date and time the match was played (optional, defaults to current time).
 * @returns A promise that resolves to the newly created Match object. Throws an error if the creation fails.
 */
export async function createMatch(
  ladderId: string,
  team1Id: string,
  team2Id: string,
  winnerId?: string,
  playedOn?: string
): Promise<Match> {
  try {
    const now = new Date().toISOString();
    const { data: createdMatch, errors } = await matchClient().create({
      ladderId,
      team1Id,
      team2Id,
      winnerId,
      playedOn: playedOn || now,
    });

    if (errors) {
      console.error("Error creating match:", errors);
      throw new Error(
        `Failed to create match: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Match created successfully:", createdMatch);
    return createdMatch;
  } catch (error) {
    console.error("Error creating match:", error);
    throw error;
  }
}

/**
 * Reads a match by its ID.
 * @param id - The ID of the match to read.
 * @returns A promise that resolves to the Match object. Returns null if the match is not found or if an error occurs.
 */
export async function getMatch(id: string): Promise<Match | null> {
  try {
    const { data: match, errors } = await matchClient().get({ id });

    if (errors) {
      console.error("Error fetching match:", errors);
      return null;
    }

    return match || null;
  } catch (error) {
    console.error("Error fetching match:", error);
    return null;
  }
}

/**
 * Updates an existing match.
 * @param id - The ID of the match to update.
 * @param ladderId - The new ladder ID (optional).
 * @param team1Id - The new team1 ID (optional).
 * @param team2Id - The new team2 ID (optional).
 * @param winnerId - The new winner ID (optional, null to remove winner).
 * @param playedOn - The new playedOn date (optional).
 * @returns A promise that resolves to the updated Match object. Throws an error if the update fails or if the match is not found.
 */
export async function updateMatch(
  id: string,
  ladderId?: string,
  team1Id?: string,
  team2Id?: string,
  winnerId?: string | null,
  playedOn?: string
): Promise<Match> {
  try {
    const { data: updatedMatch, errors } = await matchClient().update({
      id,
      ladderId,
      team1Id,
      team2Id,
      winnerId,
      playedOn,
    });

    if (errors) {
      console.error("Error updating match:", errors);
      throw new Error(
        `Failed to update match ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Match updated successfully:", updatedMatch);
    return updatedMatch;
  } catch (error) {
    console.error("Error updating match:", error);
    throw error;
  }
}

/**
 * Deletes a match by its ID.
 * @param id - The ID of the match to delete.
 * @returns A promise that resolves to true if the match was deleted successfully, false otherwise. Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deleteMatch(id: string): Promise<boolean> {
  try {
    const { errors } = await matchClient().delete({ id });

    if (errors) {
      console.error("Error deleting match:", errors);
      throw new Error(
        `Failed to delete match ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Match deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting match:", error);
    throw error;
  }
}

/**
 * Lists all matches.
 * @returns A promise that resolves to an array of Match objects. Returns an empty array if no matches are found or if an error occurs.
 */
export async function listMatches(): Promise<Match[]> {
  try {
    const { data: matches, errors } = await matchClient().list({});

    if (errors) {
      console.error("Error listing matches:", errors);
      return [];
    }

    return matches || [];
  } catch (error) {
    console.error("Error listing matches:", error);
    return [];
  }
}

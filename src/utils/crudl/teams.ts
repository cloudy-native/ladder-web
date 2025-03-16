import { Team, teamClient } from "@/utils/amplify-helpers";

/**
 * Creates a new team.
 * @param name - The name of the team.
 * @param rating - The team's rating (defaults to 1200).
 * @param ladderId - The ID of the ladder the team belongs to (optional).
 * @param player1Id - The ID of the first player (optional).
 * @param player2Id - The ID of the second player (optional).
 * @returns A promise that resolves to the newly created Team object. Throws an error if the creation fails.
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
      name,
      rating,
      ladderId,
      player1Id,
      player2Id,
    });

    if (errors) {
      console.error("Error creating team:", errors);
      throw new Error(
        `Failed to create team: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Team created successfully:", createdTeam);
    return createdTeam;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
}

/**
 * Reads a team by its ID.
 * @param id - The ID of the team to read.
 * @returns A promise that resolves to the Team object. Returns null if the team is not found or if an error occurs.
 */
export async function getTeam(id: string): Promise<Team | null> {
  try {
    const { data: team, errors } = await teamClient().get({ id });

    if (errors) {
      console.error("Error fetching team:", errors);
      return null;
    }

    return team || null;
  } catch (error) {
    console.error("Error fetching team:", error);
    return null;
  }
}

/**
 * Updates an existing team.
 * @param id - The ID of the team to update.
 * @param name - The new name of the team.
 * @param rating - The new rating of the team.
 * @param ladderId - The new ladder ID (optional, null to remove association).
 * @param player1Id - The new player1 ID (optional, null to remove player).
 * @param player2Id - The new player2 ID (optional, null to remove player).
 * @returns A promise that resolves to the updated Team object. Throws an error if the update fails or if the team is not found.
 */
export async function updateTeam(
  id: string,
  name: string,
  rating: number,
  ladderId?: string | null,
  player1Id?: string | null,
  player2Id?: string | null
): Promise<Team> {
  try {
    const { data: updatedTeam, errors } = await teamClient().update({
      id,
      name,
      rating,
      ladderId,
      player1Id,
      player2Id,
    });

    if (errors) {
      console.error("Error updating team:", errors);
      throw new Error(
        `Failed to update team ${id}: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Team updated successfully:", updatedTeam);
    return updatedTeam;
  } catch (error) {
    console.error("Error updating team:", error);
    throw error;
  }
}

/**
 * Deletes a team by its ID.
 * @param id - The ID of the team to delete.
 * @returns A promise that resolves to true if the team was deleted successfully, false otherwise. Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deleteTeam(id: string): Promise<boolean> {
  try {
    const { errors } = await teamClient().delete({ id });

    if (errors) {
      console.error("Error deleting team:", errors);
      throw new Error(
        `Failed to delete team ${id}: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Team deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
}

/**
 * Lists all teams.
 * @returns A promise that resolves to an array of Team objects. Returns an empty array if no teams are found or if an error occurs.
 */
export async function listTeams(): Promise<Team[]> {
  try {
    const { data: teams, errors } = await teamClient().list({});

    if (errors) {
      console.error("Error listing teams:", errors);
      return [];
    }

    return teams || [];
  } catch (error) {
    console.error("Error listing teams:", error);
    return [];
  }
}

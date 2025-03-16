import { Player, playerClient, teamClient } from "@/utils/amplify-helpers";
import { getPlayerWithTeam, getTeamWithPlayers } from "./read";

/**
 * Updates a team's ladder association.
 * @param teamId - The ID of the team to update.
 * @param ladderId - The ID of the new ladder, or null to remove the ladder association.
 * @returns The updated Team object. Throws an error if the update fails or if the team is not found.
 */
export async function updateTeamLadder(
  teamId: string,
  ladderId: string | null
): Promise<Team> {
  try {
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      ladderId: ladderId,
    });

    if (errors) {
      console.error("Error updating team's ladder:", errors);
      throw new Error(
        `Failed to update team's ladder for team ${teamId}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Team ladder updated successfully:", updatedTeam);
    return updatedTeam;
  } catch (error) {
    console.error("Error updating team's ladder:", error);
    throw error;
  }
}

/**
 * Adds a player to a team in either the `player1` or `player2` slot.
 * @param teamId - The ID of the team to update.
 * @param playerId - The ID of the player to add.
 * @param slot - The slot to add the player to ("player1" or "player2").
 * @returns The updated Team object. Throws an error if the update fails, the team is not found, the player is already on a team, or the slot is already filled.
 */
export async function addPlayerToTeam(
  teamId: string,
  playerId: string,
  slot: "player1" | "player2"
): Promise<Team> {
  try {
    // Check if the player is already on a team
    const player = await getPlayerWithTeam(playerId);
    if (
      player &&
      (player.teamAsPlayer1.length > 0 || player.teamAsPlayer2.length > 0)
    ) {
      throw new Error(`Player ${playerId} is already on a team`);
    }

    // Get the current team to check if the slot is already filled
    const team = await getTeamWithPlayers(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    if (slot === "player1" && team.player1) {
      throw new Error(`Player 1 slot on team ${teamId} is already filled`);
    }

    if (slot === "player2" && team.player2) {
      throw new Error(`Player 2 slot on team ${teamId} is already filled`);
    }

    // Update the team with the player ID
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      [slot === "player1" ? "player1Id" : "player2Id"]: playerId,
    });

    if (errors) {
      console.error("Error adding player to team:", errors);
      throw new Error(
        `Failed to add player ${playerId} to team ${teamId}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log(
      `Player ${playerId} added to team ${teamId} as ${slot}:`,
      updatedTeam
    );
    return updatedTeam;
  } catch (error) {
    console.error("Error adding player to team:", error);
    throw error;
  }
}

/**
 * Removes a player from a team.
 * @param teamId - The ID of the team to update.
 * @param slot - The slot to remove the player from ("player1" or "player2").
 * @returns The updated Team object. Throws an error if the update fails or if the team is not found.
 */
export async function removePlayerFromTeam(
  teamId: string,
  slot: "player1" | "player2"
): Promise<Team> {
  try {
    // Get the current team
    const team = await getTeamWithPlayers(teamId);
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }

    // Update the team to remove the player ID from the specified slot
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      [slot === "player1" ? "player1Id" : "player2Id"]: null,
    });

    if (errors) {
      console.error("Error removing player from team:", errors);
      throw new Error(
        `Failed to remove player from team ${teamId} slot ${slot}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log(
      `Player removed from team ${teamId} slot ${slot}:`,
      updatedTeam
    );
    return updatedTeam;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
}

/**
 * Updates player information.
 * @param playerId - The ID of the player to update.
 * @param data - An object containing the updated player data (givenName, familyName, email).  Optional fields.
 * @returns The updated Player object. Throws an error if the update fails or if the player is not found.
 */
export async function updatePlayer(
  playerId: string,
  data: { givenName?: string; familyName?: string; email?: string }
): Promise<Player> {
  try {
    const { data: updatedPlayer, errors } = await playerClient().update({
      id: playerId,
      ...data,
    });

    if (errors) {
      console.error("Error updating player:", errors);
      throw new Error(
        `Failed to update player ${playerId}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Player updated successfully:", updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error("Error updating player:", error);
    throw error;
  }
}

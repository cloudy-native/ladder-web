import { teamClient } from "../amplify-helpers";
import { getTeamWithPlayers } from "./read";

/**
 * Update a team's ladder
 */
export async function updateTeamLadder(
  teamId: string,
  ladderId: string | null
) {
  try {
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      ladderId: ladderId,
    });

    if (errors) {
      console.error("Error updating team's ladder:", errors);
      throw new Error("Failed to update team's ladder");
    }

    console.log("Team ladder updated successfully:", updatedTeam);
    return updatedTeam;
  } catch (error) {
    console.error("Error updating team's ladder:", error);
    throw error;
  }
}

/**
 * Add a player to a team in player1 or player2 slot
 */
export async function addPlayerToTeam(
  teamId: string,
  playerId: string,
  slot: "player1" | "player2"
) {
  try {
    // First check if the player is already on a team
    const player = await getPlayerById(playerId);
    if (player && (player.teamAsPlayer1 || player.teamAsPlayer2)) {
      throw new Error("Player is already on a team");
    }

    // Get current team to check if the slot is already filled
    const team = await getTeamWithPlayers(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    if (slot === "player1" && team.player1Id) {
      throw new Error("Player 1 slot is already filled");
    }

    if (slot === "player2" && team.player2Id) {
      throw new Error("Player 2 slot is already filled");
    }

    // Update the team with the player
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      [slot === "player1" ? "player1Id" : "player2Id"]: playerId,
    });

    if (errors) {
      console.error("Error adding player to team:", errors);
      throw new Error("Failed to add player to team");
    }

    console.log(`Player added to team as ${slot}:`, updatedTeam);
    return updatedTeam;
  } catch (error) {
    console.error("Error adding player to team:", error);
    throw error;
  }
}

/**
 * Remove a player from a team
 */
export async function removePlayerFromTeam(
  teamId: string,
  slot: "player1" | "player2"
) {
  try {
    // Get current team
    const team = await getTeamWithPlayers(teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Update the team to remove the player
    const { data: updatedTeam, errors } = await teamClient().update({
      id: teamId,
      [slot === "player1" ? "player1Id" : "player2Id"]: null,
    });

    if (errors) {
      console.error("Error removing player from team:", errors);
      throw new Error("Failed to remove player from team");
    }

    console.log(`Player removed from team ${slot}:`, updatedTeam);
    return updatedTeam;
  } catch (error) {
    console.error("Error removing player from team:", error);
    throw error;
  }
}

/**
 * Update player information
 */
export async function updatePlayer(
  playerId: string,
  data: {
    givenName?: string;
    familyName?: string;
    email?: string;
  }
) {
  try {
    const { data: updatedPlayer, errors } = await playerClient().update({
      id: playerId,
      ...data,
    });

    if (errors) {
      console.error("Error updating player:", errors);
      throw new Error("Failed to update player");
    }

    console.log("Player updated successfully:", updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error("Error updating player:", error);
    throw error;
  }
}
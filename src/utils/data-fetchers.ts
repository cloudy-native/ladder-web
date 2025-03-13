"use client";

import {
  getClient,
  ladderClient,
  matchClient,
  playerClient,
  teamClient,
} from "./amplify-helpers";

/**
 * Fetches all teams from the database
 */
export async function getTeams() {
  try {
    const { data: teamData, errors } = await teamClient().list({
      selectionSet: [
        "id",
        "name",
        "rating",
        "ladderId",
        "player1Id",
        "player2Id",
      ],
    });

    if (errors) {
      console.error("Error fetching teams:", errors);
    }

    // Ensure we only use valid team objects to prevent UI errors
    if (teamData && Array.isArray(teamData)) {
      const validTeams = teamData.filter(
        (team) =>
          team !== null && typeof team === "object" && team.id && team.name
      );

      console.log(`Fetched ${validTeams.length} teams`);
      return validTeams;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

/**
 * Fetch a team with its player details
 */
export async function getTeamWithPlayers(teamId: string) {
  try {
    const { data: team, errors } = await teamClient().get({
      id: teamId,
    });

    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null;
    }

    if (!team) {
      return null;
    }

    // Fetch player1 and player2 if they exist
    let player1 = null;
    let player2 = null;

    if (team.player1Id) {
      const player1Result = await playerClient().get({
        id: team.player1Id,
      });
      player1 = player1Result.data;
    }

    if (team.player2Id) {
      const player2Result = await playerClient().get({
        id: team.player2Id,
      });
      player2 = player2Result.data;
    }

    return {
      ...team,
      player1Details: player1,
      player2Details: player2,
    };
  } catch (error) {
    console.error(`Error fetching team with players ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetches teams for a specific ladder
 */
export async function getTeamsForLadder(ladderId: string) {
  try {
    const { data: teamData, errors } = await teamClient().list({
      filter: { ladderId: { eq: ladderId } },
      selectionSet: [
        "id",
        "name",
        "rating",
        "ladderId",
        "player1Id",
        "player2Id",
      ],
    });

    if (errors) {
      console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
    }

    // Ensure we only use valid team objects to prevent UI errors
    if (teamData && Array.isArray(teamData)) {
      const validTeams = teamData.filter(
        (team) =>
          team !== null && typeof team === "object" && team.id && team.name
      );

      // For each team, fetch player details
      const teamsWithPlayersPromises = validTeams.map(async (team) => {
        return await getTeamWithPlayers(team.id);
      });

      const teamsWithPlayers = await Promise.all(teamsWithPlayersPromises);
      const validTeamsWithPlayers = teamsWithPlayers.filter(
        (team) => team !== null
      );

      console.log(
        `Fetched ${validTeamsWithPlayers.length} teams for ladder ${ladderId}`
      );
      return validTeamsWithPlayers;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching teams for ladder ${ladderId}:`, error);
    return [];
  }
}

/**
 * Fetches all ladders from the database
 */
export async function getLadders() {
  try {
    const { data: ladderData, errors } = await ladderClient().list({
      selectionSet: ["id", "name", "description", "teams.*"],
    });

    if (errors) {
      console.error("Error fetching ladders:", errors);
    }

    // Ensure we only use valid ladder objects to prevent UI errors
    if (ladderData && Array.isArray(ladderData)) {
      const validLadders = ladderData.filter(
        (ladder) =>
          ladder !== null &&
          typeof ladder === "object" &&
          ladder.id &&
          ladder.name
      );

      // Sort by name for better user experience
      validLadders.sort((a, b) => a.name.localeCompare(b.name));

      return validLadders;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching ladders:", error);
    return [];
  }
}

/**
 * Fetch ladder by ID with teams
 */
export async function getLadderWithTeams(ladderId: string) {
  try {
    const { data: ladder, errors } = await ladderClient().get({
      id: ladderId,
    });

    if (errors) {
      console.error(`Error fetching ladder ${ladderId}:`, errors);
      return null;
    }

    if (ladder) {
      // Get teams for this ladder
      const teams = await getTeamsForLadder(ladderId);

      return {
        ...ladder,
        teamsList: teams,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ladder ${ladderId}:`, error);
    return null;
  }
}

/**
 * Get a team's ladder
 */
export async function getTeamLadder(teamId: string) {
  try {
    const { data: team, errors } = await teamClient().get({
      id: teamId,
    });

    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null;
    }

    if (team && team.ladderId) {
      const { data: ladder } = await ladderClient().get({
        id: team.ladderId,
      });

      return ladder;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ladder for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetches all players from the database
 */
export async function getAllPlayers() {
  try {
    const { data: playerData, errors } = await playerClient().list({
      selectionSet: [
        "id",
        "givenName",
        "familyName",
        "email",
        "teamAsPlayer1.*",
        "teamAsPlayer2.*",
      ],
    });

    if (errors) {
      console.error("Error fetching players:", errors);
    }

    // Ensure we only use valid player objects to prevent UI errors
    if (playerData && Array.isArray(playerData)) {
      const validPlayers = playerData.filter(
        (player) =>
          player !== null &&
          typeof player === "object" &&
          player.id &&
          player.givenName &&
          player.familyName
      );

      // Sort players by name for better readability
      validPlayers.sort((a, b) => {
        return `${a.givenName} ${a.familyName}`.localeCompare(
          `${b.givenName} ${b.familyName}`
        );
      });

      console.log(`Fetched ${validPlayers.length} players`);
      return validPlayers;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

/**
 * Fetch player by ID with team info
 */
export async function getPlayerById(playerId: string) {
  try {
    const { data: player, errors } = await playerClient().get({
      id: playerId,
    });

    if (errors) {
      console.error(`Error fetching player ${playerId}:`, errors);
      return null;
    }

    // Fetch the related team data if needed
    if (player) {
      // Get teams where this player is player1
      const player1TeamsResult = await teamClient().list({
        filter: { player1Id: { eq: playerId } },
        selectionSet: ["id", "name", "rating", "ladderId"],
      });

      // Get teams where this player is player2
      const player2TeamsResult = await teamClient().list({
        filter: { player2Id: { eq: playerId } },
        selectionSet: ["id", "name", "rating", "ladderId"],
      });

      return {
        ...player,
        teamAsPlayer1: player1TeamsResult.data || [],
        teamAsPlayer2: player2TeamsResult.data || [],
      };
    }

    return player;
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error);
    return null;
  }
}

/**
 * Get all players not assigned to any team
 */
export async function getUnassignedPlayers() {
  try {
    // Get all players
    const allPlayers = await getAllPlayers();

    // Filter to players that don't have teamAsPlayer1 or teamAsPlayer2
    const unassignedPlayers = allPlayers.filter(
      (player) =>
        (!player.teamAsPlayer1 || !player.teamAsPlayer2) &&
        (!player.teamAsPlayer2 || !player.teamAsPlayer2)
    );

    return unassignedPlayers;
  } catch (error) {
    console.error("Error fetching unassigned players:", error);
    return [];
  }
}

/**
 * Create a new team
 */
export async function createTeam(
  name: string,
  rating: number = 1200,
  ladderId?: string,
  player1Id?: string,
  player2Id?: string
) {
  try {
    const { data: createdTeam, errors } = await teamClient().create({
      name: name.trim(),
      rating: rating,
      ladderId: ladderId,
      player1Id: player1Id,
      player2Id: player2Id,
    });

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
 * Delete a team by id
 */
export async function deleteTeam(id: string) {
  try {
    const { errors } = await teamClient().delete({ id });

    if (errors) {
      console.error("Error deleting team:", errors);
      throw new Error("Failed to delete team");
    }

    console.log("Team deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting team:", error);
    throw error;
  }
}

/**
 * Create a new ladder
 */
export async function createLadder(name: string, description?: string) {
  try {
    const { data: createdLadder, errors } = await ladderClient().create({
      name: name.trim(),
      description: description?.trim() || undefined,
    });

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
 * Delete a ladder by id
 */
export async function deleteLadder(id: string) {
  try {
    const { errors } = await ladderClient().delete({ id });

    if (errors) {
      console.error("Error deleting ladder:", errors);
      throw new Error("Failed to delete ladder");
    }

    console.log("Ladder deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception deleting ladder:", error);
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
) {
  try {
    const { data: createdPlayer, errors } = await playerClient().create({
      givenName: givenName.trim(),
      familyName: familyName.trim(),
      email: email.trim(),
    });

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

/**
 * Check if a team can join a ladder
 * This includes checking if the team has at least one player
 */
export async function canTeamJoinLadder(teamId: string, ladderId: string) {
  try {
    // Get the team with players to check requirements
    const team = await getTeamWithPlayers(teamId);

    if (!team) {
      console.error(`Team ${teamId} not found`);
      return false;
    }

    // Check if the team is already on a ladder
    if (team.ladderId) {
      // If it's already on this ladder, it can technically "join" again (no change)
      if (team.ladderId === ladderId) {
        return true;
      }
      // Teams can only be on one ladder at a time
      return false;
    }

    // Check if the team has at least one player
    const hasAtLeastOnePlayer = team.player1Id || team.player2Id;
    if (!hasAtLeastOnePlayer) {
      console.log(`Team ${teamId} cannot join ladder: no players`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      `Error checking if team ${teamId} can join ladder ${ladderId}:`,
      error
    );
    return false;
  }
}

/**
 * Fetch matches for a ladder
 */
export async function getMatchesForLadder(ladderId: string) {
  try {
    const { data: matchData, errors } = await matchClient().list({
      filter: { ladderId: { eq: ladderId } },
      selectionSet: ["id", "ladderId", "team1Id", "team2Id", "winnerId"],
    });

    if (errors) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
      return [];
    }

    // Ensure we only use valid match objects to prevent UI errors
    if (matchData && Array.isArray(matchData)) {
      const validMatches = matchData.filter(
        (match) =>
          match !== null &&
          typeof match === "object" &&
          match.id &&
          match.team1Id &&
          match.team2Id
      );

      console.log(
        `Fetched ${validMatches.length} matches for ladder ${ladderId}`
      );
      return validMatches;
    } else {
      return [];
    }
  } catch (error) {
    console.error(`Error fetching matches for ladder ${ladderId}:`, error);
    return [];
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
) {
  try {
    const { data: createdMatch, errors } = await matchClient().create({
      ladderId,
      team1Id,
      team2Id,
      winnerId,
    });

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

/**
 * Generic function to delete all items of a specific type
 */
export async function deleteAllItems<T extends { id: string }>({
  items,
  modelName,
}: {
  items: T[];
  modelName: keyof ReturnType<typeof getClient>["models"];
}) {
  try {
    if (items.length === 0) {
      console.log(`No ${String(modelName)}s to delete`);
      return true;
    }

    // Get client models
    const models = getClient().models;

    // Handle type-safe model access
    const model = models[modelName];

    // Process in batches to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      console.log(
        `Deleting ${batch.length} ${String(modelName)}s (batch ${
          Math.floor(i / batchSize) + 1
        }/${Math.ceil(items.length / batchSize)})`
      );

      const deletePromises = batch.map(async (item) => {
        try {
          // Use the correct client based on the model name
          let client;
          switch (modelName) {
            case "Ladder":
              client = ladderClient();
              break;
            case "Match":
              client = matchClient();
              break;
            case "Player":
              client = playerClient();
              break;
            case "Team":
              client = teamClient();
              break;
            default:
              // Fallback to using the model directly
              client = model;
          }

          const response = await client.delete({ id: item.id });

          if (response.errors) {
            console.error(
              `Error deleting ${String(modelName)} ${item.id}:`,
              response.errors
            );
            throw new Error(`Failed to delete ${String(modelName)} ${item.id}`);
          }
        } catch (err) {
          console.error(`Error deleting ${String(modelName)} ${item.id}:`, err);
          // Continue with other deletions rather than throwing
        }
      });

      await Promise.all(deletePromises);
    }

    console.log(`All ${String(modelName)}s successfully deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${String(modelName)}s:`, error);
    throw error;
  }
}

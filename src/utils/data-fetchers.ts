import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];
type Match = Schema["Match"]["type"];

/**
 * Fetches all teams from the database
 */
export async function getTeams() {
  try {
    const { data: teamData, errors } = await client.models.Team.list({
      selectionSet: ["id", "name", "rating", "ladderId", "players.*"]
    });

    if (errors) {
      console.error("Error fetching teams:", errors);
    }

    // Ensure we only use valid team objects to prevent UI errors
    if (teamData && Array.isArray(teamData)) {
      const validTeams = teamData.filter(team => 
        team !== null && 
        typeof team === 'object' &&
        team.id &&
        team.name
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
 * Fetches teams for a specific ladder
 */
export async function getTeamsForLadder(ladderId: string) {
  try {
    const { data: teamData, errors } = await client.models.Team.list({
      filter: { ladderId: { eq: ladderId } },
      selectionSet: ["id", "name", "rating", "ladderId", "players.*"]
    });

    if (errors) {
      console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
    }

    // Ensure we only use valid team objects to prevent UI errors
    if (teamData && Array.isArray(teamData)) {
      const validTeams = teamData.filter(team => 
        team !== null && 
        typeof team === 'object' &&
        team.id &&
        team.name
      );
      
      console.log(`Fetched ${validTeams.length} teams for ladder ${ladderId}`);
      return validTeams;
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
    const { data: ladderData, errors } = await client.models.Ladder.list({
      selectionSet: ["id", "name", "description", "teams.*"]
    });

    if (errors) {
      console.error("Error fetching ladders:", errors);
    }

    // Ensure we only use valid ladder objects to prevent UI errors
    if (ladderData && Array.isArray(ladderData)) {
      const validLadders = ladderData.filter(ladder => 
        ladder !== null && 
        typeof ladder === 'object' &&
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
    const { data: ladder, errors } = await client.models.Ladder.get({
      id: ladderId,
      selectionSet: ["id", "name", "description"]
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
        teamsList: teams
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
    const { data: team, errors } = await client.models.Team.get({
      id: teamId,
      selectionSet: ["id", "name", "ladderId"]
    });

    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null;
    }

    if (team && team.ladderId) {
      const { data: ladder } = await client.models.Ladder.get({
        id: team.ladderId
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
    const { data: playerData, errors } = await client.models.Player.list();

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
 * Create a new team
 */
export async function createTeam(name: string, rating: number = 1200, ladderId?: string) {
  try {
    const { data: createdTeam, errors } = await client.models.Team.create({
      name: name.trim(),
      rating: rating,
      ladderId: ladderId
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
export async function updateTeamLadder(teamId: string, ladderId: string | null) {
  try {
    const { data: updatedTeam, errors } = await client.models.Team.update({
      id: teamId,
      ladderId: ladderId
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
 * Delete a team by id
 */
export async function deleteTeam(id: string) {
  try {
    const { errors } = await client.models.Team.delete({ id });
    
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
    const { data: createdLadder, errors } = await client.models.Ladder.create({
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
    const { errors } = await client.models.Ladder.delete({ id });

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
export async function createPlayer(givenName: string, familyName: string, email: string) {
  try {
    const { data: createdPlayer, errors } = await client.models.Player.create({
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
 * Update a player's team
 */
export async function updatePlayerTeam(playerId: string, teamId: string | null) {
  try {
    const { data: updatedPlayer, errors } = await client.models.Player.update({
      id: playerId,
      teamId: teamId,
    });

    if (errors) {
      console.error("Error updating player's team:", errors);
      throw new Error("Failed to update player's team");
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
 * This could include business logic like making sure the team has enough players
 */
export async function canTeamJoinLadder(teamId: string, ladderId: string) {
  try {
    // Get the team to check requirements
    const { data: team, errors } = await client.models.Team.get({
      id: teamId,
      selectionSet: ["id", "ladderId", "players.*"]
    });

    if (errors) {
      console.error(`Error getting team ${teamId}:`, errors);
      return false;
    }

    // Check if the team is already on a ladder
    if (team?.ladderId) {
      // If it's already on this ladder, it can technically "join" again (no change)
      if (team.ladderId === ladderId) {
        return true;
      }
      // Teams can only be on one ladder at a time
      return false;
    }

    // Add any other business logic checks here
    // For example, checking if the team has the minimum number of players
    // const minPlayers = 2;
    // if (!team.players || team.players.length < minPlayers) {
    //   return false;
    // }

    return true;
  } catch (error) {
    console.error(`Error checking if team ${teamId} can join ladder ${ladderId}:`, error);
    return false;
  }
}

/**
 * Fetch matches for a ladder
 */
export async function getMatchesForLadder(ladderId: string) {
  try {
    const { data: matchData, errors } = await client.models.Match.list({
      filter: { ladderId: { eq: ladderId } },
      selectionSet: ["id", "ladderId", "team1Id", "team2Id", "winnerId"]
    });

    if (errors) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
      return [];
    }

    // Ensure we only use valid match objects to prevent UI errors
    if (matchData && Array.isArray(matchData)) {
      const validMatches = matchData.filter(match => 
        match !== null && 
        typeof match === 'object' &&
        match.id &&
        match.team1Id &&
        match.team2Id
      );
      
      console.log(`Fetched ${validMatches.length} matches for ladder ${ladderId}`);
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
export async function createMatch(ladderId: string, team1Id: string, team2Id: string, winnerId?: string) {
  try {
    const { data: createdMatch, errors } = await client.models.Match.create({
      ladderId,
      team1Id,
      team2Id,
      winnerId
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
  modelName: keyof typeof client.models;
}) {
  try {
    // Handle type-safe model access
    const model = client.models[modelName];

    const deletePromises = items.map(async (item) => {
      try {
        // Use type assertion to handle dynamic method call
        const response = await (model as any).delete({ id: item.id });

        if (response.errors) {
          throw new Error(`Failed to delete ${String(modelName)} ${item.id}`);
        }

        console.log(`Deleted ${String(modelName)}`, item.id);
      } catch (err) {
        console.error(`Error deleting ${String(modelName)} ${item.id}:`, err);
        throw err;
      }
    });

    await Promise.all(deletePromises);
    console.log(`All ${String(modelName)}s successfully deleted`);
    return true;
  } catch (error) {
    console.error(`Error deleting ${String(modelName)}s:`, error);
    throw error;
  }
}
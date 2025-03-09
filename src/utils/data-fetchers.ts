import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

type Enrollment = Schema["Enrollment"]["type"];
type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

/**
 * Fetches all teams from the database
 */
export async function getTeams() {
  try {
    const { data: teamData, errors } = await client.models.Team.list({
      selectionSet: ["id", "name", "rating", "players.*"]
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
 * Fetches all ladders from the database
 */
export async function getLadders() {
  try {
    const { data: ladderData, errors } = await client.models.Ladder.list();

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
 * Fetches all enrollments from the database
 */
export async function getEnrollments() {
  try {
    const { data: enrollmentData, errors } = await client.models.Enrollment.list();

    if (errors) {
      console.error("Error fetching enrollments:", errors);
    }

    // Ensure we only use valid enrollment objects to prevent UI errors
    if (enrollmentData && Array.isArray(enrollmentData)) {
      const validEnrollments = enrollmentData.filter(enrollment => 
        enrollment !== null && 
        typeof enrollment === 'object' &&
        enrollment.id &&
        enrollment.teamId &&
        enrollment.ladderId
      );
      
      console.log(`Fetched ${validEnrollments.length} enrollments`);
      return validEnrollments;
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return [];
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
export async function createTeam(name: string, rating: number = 1200) {
  try {
    const { data: createdTeam, errors } = await client.models.Team.create({
      name: name.trim(),
      rating: rating
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
 * Enroll a team in a ladder
 */
export async function enrollTeamInLadder(teamId: string, ladderId: string) {
  try {
    const { data: createdEnrollment, errors } = await client.models.Enrollment.create({
      teamId: teamId,
      ladderId: ladderId,
    });

    if (errors) {
      console.error("Error enrolling team in ladder:", errors);
      throw new Error("Failed to enroll team in ladder");
    }

    console.log("Team enrolled successfully:", createdEnrollment);
    return createdEnrollment;
  } catch (error) {
    console.error("Error enrolling team:", error);
    throw error;
  }
}

/**
 * Unenroll a team from a ladder
 */
export async function unenrollTeamFromLadder(enrollmentId: string) {
  try {
    const { errors } = await client.models.Enrollment.delete({
      id: enrollmentId,
    });

    if (errors) {
      console.error("Error unenrolling team from ladder:", errors);
      throw new Error("Failed to unenroll team from ladder");
    }

    console.log("Team unenrolled successfully");
    return true;
  } catch (error) {
    console.error("Error unenrolling team:", error);
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
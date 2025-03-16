import { Player, playerClient } from "@/utils/amplify-helpers";

/**
 * Creates a new player.
 * @param givenName - The player's given name.
 * @param familyName - The player's family name.
 * @param email - The player's email address.
 * @param phone - The player's phone number (optional).
 * @param avatar - The URL of the player's avatar (optional).
 * @returns A promise that resolves to the newly created Player object. Throws an error if the creation fails.
 */
export async function createPlayer(
  givenName: string,
  familyName: string,
  email: string,
  phone?: string,
  avatar?: string
): Promise<Player> {
  try {
    const { data: createdPlayer, errors } = await playerClient().create({
      givenName,
      familyName,
      email,
      phone,
      avatar,
    });

    if (errors) {
      console.error("Error creating player:", errors);
      throw new Error(
        `Failed to create player: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Player created successfully:", createdPlayer);
    return createdPlayer;
  } catch (error) {
    console.error("Error creating player:", error);
    throw error;
  }
}

/**
 * Reads a player by its ID.
 * @param id - The ID of the player to read.
 * @returns A promise that resolves to the Player object. Returns null if the player is not found or if an error occurs.
 */
export async function getPlayer(id: string): Promise<Player | null> {
  try {
    const { data: player, errors } = await playerClient().get({ id });

    if (errors) {
      console.error("Error fetching player:", errors);
      return null;
    }

    return player || null;
  } catch (error) {
    console.error("Error fetching player:", error);
    return null;
  }
}

/**
 * Updates an existing player.
 * @param id - The ID of the player to update.
 * @param givenName - The player's given name.
 * @param familyName - The player's family name.
 * @param email - The player's email address.
 * @param phone - The player's phone number (optional).
 * @param avatar - The URL of the player's avatar (optional).
 * @returns A promise that resolves to the updated Player object. Throws an error if the update fails or if the player is not found.
 */
export async function updatePlayer(
  id: string,
  givenName: string,
  familyName: string,
  email: string,
  phone?: string,
  avatar?: string
): Promise<Player> {
  try {
    const { data: updatedPlayer, errors } = await playerClient().update({
      id,
      givenName,
      familyName,
      email,
      phone,
      avatar,
    });

    if (errors) {
      console.error("Error updating player:", errors);
      throw new Error(
        `Failed to update player ${id}: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Player updated successfully:", updatedPlayer);
    return updatedPlayer;
  } catch (error) {
    console.error("Error updating player:", error);
    throw error;
  }
}

/**
 * Deletes a player by its ID.
 * @param id - The ID of the player to delete.
 * @returns A promise that resolves to true if the player was deleted successfully, false otherwise. Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deletePlayer(id: string): Promise<boolean> {
  try {
    const { errors } = await playerClient().delete({ id });

    if (errors) {
      console.error("Error deleting player:", errors);
      throw new Error(
        `Failed to delete player ${id}: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Player deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting player:", error);
    throw error;
  }
}

/**
 * Lists all players.
 * @returns A promise that resolves to an array of Player objects. Returns an empty array if no players are found or if an error occurs.
 */
export async function listPlayers(): Promise<Player[]> {
  try {
    const { data: players, errors } = await playerClient().list({});

    if (errors) {
      console.error("Error listing players:", errors);
      return [];
    }

    return players || [];
  } catch (error) {
    console.error("Error listing players:", error);
    return [];
  }
}

import { Ladder, ladderClient } from "@/utils/amplify-helpers";

/**
 * Creates a new ladder.
 * @param name - The name of the ladder.
 * @param description - The description of the ladder (optional).
 * @returns A promise that resolves to the newly created Ladder object.  Throws an error if the creation fails.
 */
export async function createLadder(
  name: string,
  description?: string
): Promise<Ladder> {
  try {
    const { data: createdLadder, errors } = await ladderClient().create({
      name,
      description,
    });

    if (errors) {
      console.error("Error creating ladder:", errors);
      throw new Error(
        `Failed to create ladder: ${errors.map((e) => e.message).join(", ")}`
      );
    }

    console.log("Ladder created successfully:", createdLadder);
    return createdLadder;
  } catch (error) {
    console.error("Error creating ladder:", error);
    throw error;
  }
}

/**
 * Reads a ladder by its ID.
 * @param id - The ID of the ladder to read.
 * @returns A promise that resolves to the Ladder object. Returns null if the ladder is not found or if an error occurs.
 */
export async function getLadder(id: string): Promise<Ladder | null> {
  try {
    const { data: ladder, errors } = await ladderClient().get({ id });

    if (errors) {
      console.error("Error fetching ladder:", errors);
      return null;
    }

    return ladder || null;
  } catch (error) {
    console.error("Error fetching ladder:", error);
    return null;
  }
}

/**
 * Updates an existing ladder.
 * @param id - The ID of the ladder to update.
 * @param name - The new name of the ladder.
 * @param description - The new description of the ladder (optional).
 * @returns A promise that resolves to the updated Ladder object. Throws an error if the update fails or if the ladder is not found.
 */
export async function updateLadder(
  id: string,
  name: string,
  description?: string
): Promise<Ladder> {
  try {
    const { data: updatedLadder, errors } = await ladderClient().update({
      id,
      name,
      description,
    });

    if (errors) {
      console.error("Error updating ladder:", errors);
      throw new Error(
        `Failed to update ladder ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Ladder updated successfully:", updatedLadder);
    return updatedLadder;
  } catch (error) {
    console.error("Error updating ladder:", error);
    throw error;
  }
}

/**
 * Deletes a ladder by its ID.
 * @param id - The ID of the ladder to delete.
 * @returns A promise that resolves to true if the ladder was deleted successfully, false otherwise. Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deleteLadder(id: string): Promise<boolean> {
  try {
    const { errors } = await ladderClient().delete({ id });

    if (errors) {
      console.error("Error deleting ladder:", errors);
      throw new Error(
        `Failed to delete ladder ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Ladder deleted successfully");
    return true;
  } catch (error) {
    console.error("Error deleting ladder:", error);
    throw error;
  }
}

/**
 * Lists all ladders.
 * @returns A promise that resolves to an array of Ladder objects. Returns an empty array if no ladders are found or if an error occurs.
 */
export async function listLadders(): Promise<Ladder[]> {
  try {
    const { data: ladders, errors } = await ladderClient().list({});

    if (errors) {
      console.error("Error listing ladders:", errors);
      return [];
    }

    return ladders || [];
  } catch (error) {
    console.error("Error listing ladders:", error);
    return [];
  }
}

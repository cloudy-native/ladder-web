import {
  ladderClient,
  matchClient,
  playerClient,
  teamClient,
} from "@/utils/amplify-helpers"; // Import the Amplify clients
import { BATCH_SIZE } from "@/utils/constants"; // Import the batch size constant

/**
 * Deletes a single ladder by its ID.
 * @param id - The ID of the ladder to delete.
 * @returns A promise that resolves to `true` if the ladder was deleted successfully, `false` otherwise.  Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deleteLadder(id: string): Promise<boolean> {
  try {
    const { errors } = await ladderClient().delete({ id });

    if (errors) {
      // Log the error for debugging purposes
      console.error("Error deleting ladder:", errors);
      //More informative error message
      throw new Error(
        `Failed to delete ladder with ID ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    console.log("Ladder deleted successfully");
    return true;
  } catch (error) {
    console.error("Exception deleting ladder:", error);
    // Re-throw the error to be handled by the calling function
    throw error;
  }
}

/**
 * Deletes a single team by its ID.
 * @param id - The ID of the team to delete.
 * @returns A promise that resolves to `true` if the team was deleted successfully, `false` otherwise. Throws an error if there's a problem other than a simple failure to delete.
 */
export async function deleteTeam(id: string): Promise<boolean> {
  try {
    const { errors } = await teamClient().delete({ id });

    if (errors) {
      console.error("Error deleting team:", errors);
      throw new Error(
        `Failed to delete team with ID ${id}: ${errors
          .map((e) => e.message)
          .join(", ")}`
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
 * Deletes all ladders from the database in batches to avoid overwhelming the API.
 * @returns A promise that resolves to `true` if all ladders were deleted successfully, `false` otherwise.
 * @throws An error if there's a problem fetching or deleting ladders.  Individual ladder delete failures are logged but don't halt the process.
 */
export async function deleteAllLadders(): Promise<boolean> {
  try {
    const { data: ladders, errors: listErrors } = await ladderClient().list();

    if (listErrors) {
      console.error("Error fetching ladders:", listErrors);
      throw new Error(
        `Failed to fetch ladders: ${listErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    if (!ladders || ladders.length === 0) {
      console.log("No ladders to delete");
      return true;
    }

    console.log(`Deleting ${ladders.length} ladders...`);

    for (let i = 0; i < ladders.length; i += BATCH_SIZE) {
      const batch = ladders.slice(i, i + BATCH_SIZE);
      console.log(
        `Deleting ${batch.length} ladders (batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }/${Math.ceil(ladders.length / BATCH_SIZE)})`
      );

      const deletePromises = batch.map(async (ladder) => {
        try {
          const { errors: deleteErrors } = await ladderClient().delete({
            id: ladder.id,
          });
          if (deleteErrors) {
            console.error(`Error deleting ladder ${ladder.id}:`, deleteErrors);
            //More informative error message
            console.error(
              `Failed to delete ladder ${ladder.id}: ${deleteErrors
                .map((e) => e.message)
                .join(", ")}`
            );
          }
        } catch (err) {
          console.error(`Error deleting ladder ${ladder.id}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    console.log("All ladders successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting ladders:", error);
    throw error;
  }
}

/**
 * Deletes all players from the database in batches.
 * @returns A promise that resolves to `true` if all players were deleted successfully, `false` otherwise.
 * @throws An error if there's a problem fetching or deleting players. Individual player delete failures are logged but don't halt the process.
 */
export async function deleteAllPlayers(): Promise<boolean> {
  // ... (Identical structure to deleteAllLadders, just replace ladderClient with playerClient) ...
  try {
    const { data: players, errors: listErrors } = await playerClient().list();

    if (listErrors) {
      console.error("Error fetching players:", listErrors);
      throw new Error(
        `Failed to fetch players: ${listErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    if (!players || players.length === 0) {
      console.log("No players to delete");
      return true;
    }

    console.log(`Deleting ${players.length} players...`);

    for (let i = 0; i < players.length; i += BATCH_SIZE) {
      const batch = players.slice(i, i + BATCH_SIZE);
      console.log(
        `Deleting ${batch.length} players (batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }/${Math.ceil(players.length / BATCH_SIZE)})`
      );

      const deletePromises = batch.map(async (player) => {
        try {
          const { errors: deleteErrors } = await playerClient().delete({
            id: player.id,
          });
          if (deleteErrors) {
            console.error(`Error deleting player ${player.id}:`, deleteErrors);
            console.error(
              `Failed to delete player ${player.id}: ${deleteErrors
                .map((e) => e.message)
                .join(", ")}`
            );
          }
        } catch (err) {
          console.error(`Error deleting player ${player.id}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    console.log("All players successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting players:", error);
    throw error;
  }
}

/**
 * Deletes all teams from the database in batches.
 * @returns A promise that resolves to `true` if all teams were deleted successfully, `false` otherwise.
 * @throws An error if there's a problem fetching or deleting teams. Individual team delete failures are logged but don't halt the process.
 */
export async function deleteAllTeams(): Promise<boolean> {
  // ... (Identical structure to deleteAllLadders, just replace ladderClient with teamClient) ...
  try {
    const { data: teams, errors: listErrors } = await teamClient().list();

    if (listErrors) {
      console.error("Error fetching teams:", listErrors);
      throw new Error(
        `Failed to fetch teams: ${listErrors.map((e) => e.message).join(", ")}`
      );
    }

    if (!teams || teams.length === 0) {
      console.log("No teams to delete");
      return true;
    }

    console.log(`Deleting ${teams.length} teams...`);

    for (let i = 0; i < teams.length; i += BATCH_SIZE) {
      const batch = teams.slice(i, i + BATCH_SIZE);
      console.log(
        `Deleting ${batch.length} teams (batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }/${Math.ceil(teams.length / BATCH_SIZE)})`
      );

      const deletePromises = batch.map(async (team) => {
        try {
          const { errors: deleteErrors } = await teamClient().delete({
            id: team.id,
          });
          if (deleteErrors) {
            console.error(`Error deleting team ${team.id}:`, deleteErrors);
            console.error(
              `Failed to delete team ${team.id}: ${deleteErrors
                .map((e) => e.message)
                .join(", ")}`
            );
          }
        } catch (err) {
          console.error(`Error deleting team ${team.id}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    console.log("All teams successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting teams:", error);
    throw error;
  }
}

/**
 * Deletes all matches from the database in batches.
 * @returns A promise that resolves to `true` if all matches were deleted successfully, `false` otherwise.
 * @throws An error if there's a problem fetching or deleting matches. Individual match delete failures are logged but don't halt the process.
 */
export async function deleteAllMatches(): Promise<boolean> {
  // ... (Identical structure to deleteAllLadders, just replace ladderClient with matchClient) ...
  try {
    const { data: matches, errors: listErrors } = await matchClient().list();

    if (listErrors) {
      console.error("Error fetching matches:", listErrors);
      throw new Error(
        `Failed to fetch matches: ${listErrors
          .map((e) => e.message)
          .join(", ")}`
      );
    }

    if (!matches || matches.length === 0) {
      console.log("No matches to delete");
      return true;
    }

    console.log(`Deleting ${matches.length} matches...`);

    for (let i = 0; i < matches.length; i += BATCH_SIZE) {
      const batch = matches.slice(i, i + BATCH_SIZE);
      console.log(
        `Deleting ${batch.length} matches (batch ${
          Math.floor(i / BATCH_SIZE) + 1
        }/${Math.ceil(matches.length / BATCH_SIZE)})`
      );

      const deletePromises = batch.map(async (match) => {
        try {
          const { errors: deleteErrors } = await matchClient().delete({
            id: match.id,
          });
          if (deleteErrors) {
            console.error(`Error deleting match ${match.id}:`, deleteErrors);
            console.error(
              `Failed to delete match ${match.id}: ${deleteErrors
                .map((e) => e.message)
                .join(", ")}`
            );
          }
        } catch (err) {
          console.error(`Error deleting match ${match.id}:`, err);
        }
      });

      await Promise.all(deletePromises);
    }

    console.log("All matches successfully deleted");
    return true;
  } catch (error) {
    console.error("Error deleting matches:", error);
    throw error;
  }
}

/**
 * Deletes all data (matches, teams, ladders, players) from the database.  Deletes in the order: matches, teams, ladders, players.
 * @throws An error if any of the delete operations fail.
 */
export async function deleteAll() {
  try {
    await deleteAllMatches();
    await deleteAllTeams();
    await deleteAllLadders();
    await deleteAllPlayers();
  } catch (error) {
    console.error("Error deleting all data:", error);
    throw error;
  }
}

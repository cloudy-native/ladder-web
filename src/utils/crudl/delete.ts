import {
  ladderClient,
  matchClient,
  playerClient,
  teamClient,
} from "../amplify-helpers";
import { BATCH_SIZE } from "../constants";

/**
 * Delete a ladder by id
 */
export async function deleteLadder(id: string):Promise<boolean> {
  try {
    const { errors } = await ladderClient().delete({ id });

    if (errors) {
      console.error("Error deleting ladder:", errors);
      // TODO: is this right? or handle the error inline?
      //
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
 * Delete a team by id
 */
export async function deleteTeam(id: string):Promise<boolean> {
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
 * Deletes all ladders from the database.
 *
 * This function fetches all ladders and then deletes them in batches to avoid
 * overwhelming the API.
 *
 * @returns {Promise<boolean>} True if all ladders were deleted successfully, false otherwise.
 * @throws {Error} If there is an error fetching or deleting ladders.
 */
export async function deleteAllLadders(): Promise<boolean> {
  try {
    // Fetch all ladders
    const { data: ladders, errors: listErrors } = await ladderClient().list();

    if (listErrors) {
      console.error("Error fetching ladders:", listErrors);
      throw new Error("Failed to fetch ladders");
    }

    if (!ladders || ladders.length === 0) {
      console.log("No ladders to delete");
      return true;
    }

    console.log(`Deleting ${ladders.length} ladders...`);

    // Delete ladders in batches
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

            throw new Error(`Failed to delete ladder ${ladder.id}`);
          }
        } catch (err) {
          console.error(`Error deleting ladder ${ladder.id}:`, err);
          
          // Continue with other deletions rather than throwing
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
 * Deletes all players from the database.
 *
 * This function fetches all players and then deletes them in batches to avoid
 * overwhelming the API.
 *
 * @returns {Promise<boolean>} True if all players were deleted successfully, false otherwise.
 * @throws {Error} If there is an error fetching or deleting players.
 */
export async function deleteAllPlayers(): Promise<boolean> {
  try {
    // Fetch all players
    const { data: players, errors: listErrors } = await playerClient().list();

    if (listErrors) {
      console.error("Error fetching players:", listErrors);
      throw new Error("Failed to fetch players");
    }

    if (!players || players.length === 0) {
      console.log("No players to delete");
      return true;
    }

    console.log(`Deleting ${players.length} players...`);

    // Delete players in batches
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
            throw new Error(`Failed to delete player ${player.id}`);
          }
        } catch (err) {
          console.error(`Error deleting player ${player.id}:`, err);
          // Continue with other deletions rather than throwing
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
 * Deletes all teams from the database.
 *
 * This function fetches all teams and then deletes them in batches to avoid
 * overwhelming the API.
 *
 * @returns {Promise<boolean>} True if all teams were deleted successfully, false otherwise.
 * @throws {Error} If there is an error fetching or deleting teams.
 */
export async function deleteAllTeams(): Promise<boolean> {
  try {
    // Fetch all teams
    const { data: teams, errors: listErrors } = await teamClient().list();

    if (listErrors) {
      console.error("Error fetching teams:", listErrors);
      throw new Error("Failed to fetch teams");
    }

    if (!teams || teams.length === 0) {
      console.log("No teams to delete");
      return true;
    }

    console.log(`Deleting ${teams.length} teams...`);

    // Delete teams in batches
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
            throw new Error(`Failed to delete team ${team.id}`);
          }
        } catch (err) {
          console.error(`Error deleting team ${team.id}:`, err);
          // Continue with other deletions rather than throwing
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
 * Deletes all matches from the database.
 *
 * This function fetches all matches and then deletes them in batches to avoid
 * overwhelming the API.
 *
 * @returns {Promise<boolean>} True if all matches were deleted successfully, false otherwise.
 * @throws {Error} If there is an error fetching or deleting matches.
 */
export async function deleteAllMatches(): Promise<boolean> {
  try {
    // Fetch all matches
    const { data: matches, errors: listErrors } = await matchClient().list();

    if (listErrors) {
      console.error("Error fetching matches:", listErrors);
      throw new Error("Failed to fetch matches");
    }

    if (!matches || matches.length === 0) {
      console.log("No matches to delete");
      return true;
    }

    console.log(`Deleting ${matches.length} matches...`);

    // Delete matches in batches
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
            throw new Error(`Failed to delete match ${match.id}`);
          }
        } catch (err) {
          console.error(`Error deleting match ${match.id}:`, err);
          // Continue with other deletions rather than throwing
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

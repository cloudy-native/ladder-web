import { formatPlayerName } from "@/utils//data"; // Import function to format player names
import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "@/utils/amplify-helpers"; // Import Amplify clients for data access

/**
 * Fetch matches for a given ladder ID.
 * @param ladderId - The ID of the ladder whose matches are to be fetched.
 * @returns An array of Match objects. Returns an empty array if no matches are found or if an error occurs.
 */
export async function getMatchesForLadder(ladderId: string): Promise<Match[]> {
  try {
    const { data: matchData, errors } = await matchClient().list({
      filter: { ladderId: { eq: ladderId } }, // Filter matches by ladderId
    });

    // Handle errors during data fetching
    if (errors) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
      return []; // Return empty array on error
    }

    // Handle cases where no matches are found for the given ladderId
    if (!matchData || !Array.isArray(matchData)) {
      console.warn(`No matches found for ladder ${ladderId}`);
      return []; // Return empty array if no matches are found
    }

    console.log(`Fetched ${matchData.length} matches for ladder ${ladderId}`);
    return matchData; // Return the fetched match data
  } catch (error) {
    console.error(`Error fetching matches for ladder ${ladderId}:`, error);
    return []; // Return empty array on any other error
  }
}

/**
 * Fetches all teams from the database.
 * @returns An array of Team objects. Returns an empty array if no teams are found or if an error occurs.
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const { data: teamData, errors } = await teamClient().list(); // Fetch all teams

    // Handle errors during data fetching
    if (errors) {
      console.error("Error fetching teams:", errors);
      return []; // Return empty array on error
    }

    // Handle cases where no teams are found or the data is not an array
    if (!teamData || !Array.isArray(teamData)) {
      console.warn("Teams data is empty or not an array:", teamData);
      return []; // Return empty array if no teams are found or data is invalid
    }

    console.log(`Fetched ${teamData.length} teams`);
    return teamData; // Return the fetched team data
  } catch (error) {
    console.error("Error fetching teams:", error);
    return []; // Return empty array on any other error
  }
}

/**
 * Fetches player data for a given team.  Handles cases where one or both players might be missing.
 * @param team - The Team object for which to fetch player data.
 * @returns An object containing player1 and player2, each potentially null if the player data is not found.
 */
export async function getPlayersForTeam(
  team: Team
): Promise<{ player1: Player | null; player2: Player | null }> {
  try {
    const { data: player1, errors: player1Errors } = await team.player1(); // Fetch player 1
    const { data: player2, errors: player2Errors } = await team.player2(); // Fetch player 2

    // Handle errors during player data fetching
    if (player1Errors) {
      console.error(
        `Error fetching player 1 for team: ${team.id}`,
        player1Errors
      );
    }
    if (player2Errors) {
      console.error(
        `Error fetching player 2 for team: ${team.id}`,
        player2Errors
      );
    }

    return { player1, player2 }; // Return player data, allowing for null values
  } catch (error) {
    console.error("Error fetching players for team:", error);
    return { player1: null, player2: null }; // Return null for both players on error
  }
}

/**
 * Fetches teams associated with a specific ladder ID.
 * @param ladderId - The ID of the ladder whose teams are to be fetched.
 * @returns An array of Team objects. Returns an empty array if no teams are found or if an error occurs.
 */
export async function getTeamsForLadder(ladderId: string): Promise<Team[]> {
  try {
    const { data: teamsData, errors } = await teamClient().list({
      filter: { ladderId: { eq: ladderId } }, // Filter teams by ladderId
    });

    // Handle errors during data fetching
    if (errors) {
      console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
      return []; // Return empty array on error
    }

    // Handle cases where no teams are found for the given ladderId or data is not an array
    if (!teamsData || !Array.isArray(teamsData)) {
      console.warn(`Teams for ladder ${ladderId} is empty or not an array:`);
      return []; // Return empty array if no teams are found or data is invalid
    }

    console.log(`Fetched ${teamsData.length} teams for ladder ${ladderId}`);
    return teamsData; // Return the fetched team data
  } catch (error) {
    console.error(`Error fetching teams for ladder ${ladderId}:`, error);
    return []; // Return empty array on any other error
  }
}

/**
 * Fetches all players from the database.
 * @returns An array of Player objects, sorted alphabetically by name. Returns an empty array if no players are found or if an error occurs.
 */
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const { data: playerData, errors } = await playerClient().list(); // Fetch all players

    // Handle errors during data fetching
    if (errors) {
      console.error("Error fetching players:", errors);
      return []; // Return empty array on error
    }

    // Handle cases where no players are found or the data is not an array
    if (!playerData || !Array.isArray(playerData)) {
      return []; // Return empty array if no players are found or data is invalid
    }

    // Sort players alphabetically by formatted name
    playerData.sort((a, b) => {
      return formatPlayerName(a).localeCompare(formatPlayerName(b));
    });

    console.log(`Fetched ${playerData.length} players`);
    return playerData; // Return the fetched player data
  } catch (error) {
    console.error("Error fetching players:", error);
    return []; // Return empty array on any other error
  }
}

/**
 * Fetches all matches from the database.
 * @returns An array of Match objects. Returns an empty array if no matches are found or if an error occurs.
 */
export async function getAllMatches(): Promise<Match[]> {
  try {
    const { data: matchData, errors } = await matchClient().list(); // Fetch all matches

    // Handle errors during data fetching
    if (errors) {
      console.error("Error fetching matches:", errors);
      return []; // Return empty array on error
    }

    // Handle cases where no matches are found or the data is not an array
    if (!matchData || !Array.isArray(matchData)) {
      return []; // Return empty array if no matches are found or data is invalid
    }

    console.log(`Fetched ${matchData.length} matches`);
    return matchData; // Return the fetched match data
  } catch (error) {
    console.error("Error fetching matches:", error);
    return []; // Return empty array on any other error
  }
}

/**
 * Fetches all ladders from the database.
 * @returns An array of Ladder objects, sorted alphabetically by name. Returns an empty array if no ladders are found or if an error occurs.
 */
export async function getAllLadders(): Promise<Ladder[]> {
  try {
    const { data: ladderData, errors } = await ladderClient().list(); // Fetch all ladders

    // Handle errors during data fetching
    if (errors) {
      console.error("Error fetching ladders:", errors);
      return []; // Return empty array on error
    }

    // Handle cases where no ladders are found or the data is not an array
    if (!ladderData || !Array.isArray(ladderData)) {
      return []; // Return empty array if no ladders are found or data is invalid
    }

    // Sort ladders alphabetically by name
    ladderData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    console.log(`Fetched ${ladderData.length} ladders`);
    return ladderData; // Return the fetched ladder data
  } catch (error) {
    console.error("Error fetching ladders:", error);
    return []; // Return empty array on any other error
  }
}

/**
 * Retrieves all players who are not assigned to any team.
 * @returns An array of Player objects representing unassigned players. Returns an empty array if no unassigned players are found or if an error occurs.
 */
export async function getUnassignedPlayers(): Promise<Player[]> {
  try {
    const allPlayers = await getAllPlayers(); // Fetch all players

    // Filter players to only include those not assigned to any team
    const unassignedPlayers = allPlayers.filter(
      (player) => !player.teamAsPlayer1 && !player.teamAsPlayer2
    );

    return unassignedPlayers; // Return the array of unassigned players
  } catch (error) {
    console.error("Error fetching unassigned players:", error);
    return []; // Return empty array on error
  }
}

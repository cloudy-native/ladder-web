import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "../amplify-helpers";
import { formatPlayerName } from "../data";

/**
 * Fetch matches for a ladder
 */
export async function getMatchesForLadder(ladderId: string): Promise<Match[]> {
  try {
    const { data: matchData, errors } = await matchClient().list({
      filter: { ladderId: { eq: ladderId } },
    });

    if (errors) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
      return [];
    }

    if (!matchData) {
      console.warn(`No matches found for ladder ${ladderId}`);
      return [];
    }

    console.log(`Fetched ${matchData.length} matches for ladder ${ladderId}`);

    return matchData;
  } catch (error) {
    console.error(`Error fetching matches for ladder ${ladderId}:`, error);
    return [];
  }
}

/**
 * Fetches all teams from the database
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const { data: teamData, errors } = await teamClient().list();

    if (errors) {
      console.error("Error fetching teams:", errors);

      return [];
    }

    if (!teamData || !Array.isArray(teamData)) {
      console.warn("Teams is empty or not an array:", teamData);

      return [];
    }

    console.log(`Fetched ${teamData.length} teams`);

    return teamData;
  } catch (error) {
    console.error("Error fetching teams:", error);
    return [];
  }
}

export async function getPlayersForTeam(
  team: Team
): Promise<{ player1: Player | null; player2: Player | null }> {
  try {
    const { data: player1, errors: player1Errors } = await team.player1();
    const { data: player2, errors: player2Errors } = await team.player2();

    if (player1Errors) {
      console.error(
        `Error fetching player 1 for team: ${team.id}`,
        player1Errors
      );
    }
    if (player2Errors) {
      console.error(
        `Error fetching player 1 for team: ${team.id}`,
        player2Errors
      );
    }

    return { player1, player2 };
  } catch (error) {
    console.error("Error fetching players for team:", error);

    return { player1: null, player2: null };
  }
}

/**
 * Fetches teams for a specific ladder
 */
export async function getTeamsForLadder(ladderId: string): Promise<Team[]> {
  try {
    const { data: teamsData, errors } = await teamClient().list({
      filter: { ladderId: { eq: ladderId } },
    });

    if (errors) {
      console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
      return [];
    }

    if (!teamsData || !Array.isArray(teamsData)) {
      console.warn(`Teams for ladder ${ladderId} is empty or not an array:`);

      return [];
    }

    console.log(`Fetched ${teamsData.length} teams for ladder ${ladderId}`);

    return teamsData;
  } catch (error) {
    console.error(`Error fetching teams for ladder ${ladderId}:`, error);
    return [];
  }
}

/**
 * Fetches all players from the database
 */
export async function getAllPlayers(): Promise<Player[]> {
  try {
    const { data: playerData, errors } = await playerClient().list();

    if (errors) {
      console.error("Error fetching players:", errors);
    }

    // Ensure we only use valid player objects to prevent UI errors
    if (!playerData || !Array.isArray(playerData)) {
      return [];
    }

    // Sort players by name for better readability
    playerData.sort((a, b) => {
      return formatPlayerName(a).localeCompare(formatPlayerName(b));
    });

    console.log(`Fetched ${playerData.length} players`);

    return playerData;
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

/**
 * Fetches all matches from the database
 */
export async function getAllMatches(): Promise<Match[]> {
  try {
    const { data: matchData, errors } = await matchClient().list();

    if (errors) {
      console.error("Error fetching matches:", errors);
    }

    if (!matchData || !Array.isArray(matchData)) {
      return [];
    }

    console.log(`Fetched ${matchData.length} players`);

    return matchData;
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

/**
 * Fetches all ladders from the database
 */
export async function getAllLadders(): Promise<Ladder[]> {
  try {
    const { data: ladderData, errors } = await ladderClient().list();

    if (errors) {
      console.error("Error fetching ladders:", errors);
    }

    if (!ladderData || !Array.isArray(ladderData)) {
      return [];
    }

    // Sort ladders by name 
    ladderData.sort((a, b) => {
      return a.name.localeCompare(b.name);
    });

    console.log(`Fetched ${ladderData.length} players`);

    return ladderData;
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

/**
 * Get all players not assigned to any team
 */
export async function getUnassignedPlayers(): Promise<Player[]> {
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

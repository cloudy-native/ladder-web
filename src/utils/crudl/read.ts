import {
  Ladder,
  ladderClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "@/utils//amplify-helpers";

/**
 * Defines a type for a Team object including its associated players.  Allows for null players if a player isn't assigned.
 */
export type TeamWithPlayers = {
  team: Team;
  player1: Player | null;
  player2: Player | null;
};

/**
 * Fetches a team and its associated players by team ID.
 * @param teamId - The ID of the team to fetch.
 * @returns A TeamWithPlayers object containing the team and its players (which may be null if unassigned). Returns null if the team or players are not found or if an error occurs.
 */
export async function getTeamWithPlayers(
  teamId: string
): Promise<TeamWithPlayers | null> {
  try {
    const { data: team, errors } = await teamClient().get({ id: teamId });

    // Handle errors during team fetching
    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null; // Return null on error
    }

    // Handle case where team is not found
    if (!team) {
      console.warn(`Team with ID ${teamId} not found`);
      return null; // Return null if team not found
    }

    // Fetch player1 and player2.  Handle cases where player IDs might be missing.
    const player1 = team.player1Id
      ? (await playerClient().get({ id: team.player1Id })).data || null
      : null;
    const player2 = team.player2Id
      ? (await playerClient().get({ id: team.player2Id })).data || null
      : null;

    return { team, player1, player2 }; // Return team and player data
  } catch (error) {
    console.error(`Error fetching team with players ${teamId}:`, error);
    return null; // Return null on any other error
  }
}

/**
 * Fetches a ladder by ID, including its associated teams.
 * @param ladderId - The ID of the ladder to fetch.
 * @returns An object containing the ladder and an array of its teams. Returns null if the ladder or teams are not found or if an error occurs.  Uses a helper function to get teams.
 */
export async function getLadderWithTeams(
  ladderId: string
): Promise<{ ladder: Ladder | null; teamsList: Team[] } | null> {
  try {
    const { data: ladder, errors } = await ladderClient().get({ id: ladderId });

    // Handle errors during ladder fetching
    if (errors) {
      console.error(`Error fetching ladder ${ladderId}:`, errors);
      return null; // Return null on error
    }

    // Handle case where ladder is not found
    if (!ladder) {
      console.warn(`Ladder with ID ${ladderId} not found`);
      return null; // Return null if ladder not found
    }

    // Get teams for this ladder using a helper function (assumed to exist)
    const teams = await getTeamsForLadder(ladderId); //Helper function assumed to exist

    return { ladder, teamsList: teams }; // Return ladder and teams data
  } catch (error) {
    console.error(`Error fetching ladder ${ladderId}:`, error);
    return null; // Return null on any other error
  }
}

/**
 * Fetches the ladder associated with a given team.
 * @param teamId - The ID of the team whose ladder is to be fetched.
 * @returns The Ladder object associated with the team. Returns null if the team or ladder is not found or if an error occurs.
 */
export async function getTeamLadder(teamId: string): Promise<Ladder | null> {
  try {
    const { data: team, errors } = await teamClient().get({ id: teamId });

    // Handle errors during team fetching
    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null; // Return null on error
    }

    // Handle case where team is not found or doesn't have a ladderId
    if (!team || !team.ladderId) {
      console.warn(`Team ${teamId} not found or has no associated ladder`);
      return null; // Return null if team not found or no ladderId
    }

    const { data: ladder, errors: ladderErrors } = await ladderClient().get({
      id: team.ladderId,
    });

    // Handle errors during ladder fetching
    if (ladderErrors) {
      console.error(`Error fetching ladder for team ${teamId}:`, ladderErrors);
      return null; // Return null on error
    }

    return ladder; // Return the ladder data
  } catch (error) {
    console.error(`Error fetching ladder for team ${teamId}:`, error);
    return null; // Return null on any other error
  }
}

/**
 * Fetches a player by ID, including their associated teams (as player1 or player2).
 * @param playerId - The ID of the player to fetch.
 * @returns An object containing the player and arrays of teams where the player is player1 and player2 respectively. Returns null if the player is not found or if an error occurs.
 */
export async function getPlayerWithTeam(playerId: string): Promise<{
  player: Player | null;
  teamAsPlayer1: Team[];
  teamAsPlayer2: Team[];
} | null> {
  try {
    const { data: player, errors } = await playerClient().get({ id: playerId });

    // Handle errors during player fetching
    if (errors) {
      console.error(`Error fetching player ${playerId}:`, errors);
      return null; // Return null on error
    }

    // Handle case where player is not found
    if (!player) {
      console.warn(`Player with ID ${playerId} not found`);
      return null; // Return null if player not found
    }

    // Fetch teams where this player is player1
    const player1TeamsResult = await teamClient().list({
      filter: { player1Id: { eq: playerId } },
      selectionSet: ["id", "name", "rating", "ladderId"],
    });
    const teamAsPlayer1 = player1TeamsResult.data || [];

    // Fetch teams where this player is player2
    const player2TeamsResult = await teamClient().list({
      filter: { player2Id: { eq: playerId } },
      selectionSet: ["id", "name", "rating", "ladderId"],
    });
    const teamAsPlayer2 = player2TeamsResult.data || [];

    return { player, teamAsPlayer1, teamAsPlayer2 }; // Return player and team data
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error);
    return null; // Return null on any other error
  }
}

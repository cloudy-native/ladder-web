import { getTeamWithPlayers } from "./read";

/**
 * Checks if a team can join a ladder.  A team can join a ladder if:
 * 1. The team exists.
 * 2. The team is not already on a ladder (or is already on the specified ladder).
 * 3. The team has at least one player assigned.
 * @param teamId - The ID of the team.
 * @param ladderId - The ID of the ladder.
 * @returns `true` if the team can join the ladder, `false` otherwise.  Logs errors to the console.
 */
export async function canTeamJoinLadder(
  teamId: string,
  ladderId: string
): Promise<boolean> {
  try {
    // Fetch the team and its associated players
    const team = await getTeamWithPlayers(teamId);

    // Handle case where the team is not found
    if (!team) {
      console.error(`Team ${teamId} not found`);
      return false;
    }

    // Check if the team is already on a ladder
    if (team.team.ladderId) {
      // If the team is already on the specified ladder, it can "join" again (no change needed)
      if (team.team.ladderId === ladderId) {
        return true;
      }
      // Otherwise, teams can only be on one ladder at a time
      console.log(
        `Team ${team.team.id} is already on ladder ${team.team.ladderId}`
      );
      return false;
    }

    // Check if the team has at least one player
    const hasAtLeastOnePlayer = team.player1 || team.player2;
    if (!hasAtLeastOnePlayer) {
      console.log(`Team ${team.team.id} cannot join ladder: no players`);
      return false;
    }

    return true; // Team can join the ladder
  } catch (error) {
    console.error(
      `Error checking if team ${teamId} can join ladder ${ladderId}:`,
      error
    );
    return false; // Return false on any error
  }
}

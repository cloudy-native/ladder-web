import { getTeamWithPlayers } from "./read";

/**
 * Check if a team can join a ladder
 * This includes checking if the team has at least one player
 */
export async function canTeamJoinLadder(teamId: string, ladderId: string) {
    try {
      // Get the team with players to check requirements
      const team = await getTeamWithPlayers(teamId);
  
      if (!team) {
        console.error(`Team ${teamId} not found`);
        return false;
      }
  
      // Check if the team is already on a ladder
      if (team.ladderId) {
        // If it's already on this ladder, it can technically "join" again (no change)
        if (team.ladderId === ladderId) {
          return true;
        }
        // Teams can only be on one ladder at a time
        return false;
      }
  
      // Check if the team has at least one player
      const hasAtLeastOnePlayer = team.player1Id || team.player2Id;
      if (!hasAtLeastOnePlayer) {
        console.log(`Team ${teamId} cannot join ladder: no players`);
        return false;
      }
  
      return true;
    } catch (error) {
      console.error(
        `Error checking if team ${teamId} can join ladder ${ladderId}:`,
        error
      );
      return false;
    }
  }
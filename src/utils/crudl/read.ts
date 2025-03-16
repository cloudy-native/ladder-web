import { Player, playerClient, Team, teamClient } from "../amplify-helpers";

export type TeamWithPlayers = {
  team: Team;
  player1: Player | null;
  player2: Player | null;
};

/**
 * Fetch a team with its player details
 */
export async function getTeamWithPlayers(teamId: string): Promise<TeamWithPlayers | null> {
  try {
    const { data: team, errors } = await teamClient().get({
      id: teamId,
    });

    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null;
    }

    if (!team) {
      return null;
    }

    // Fetch player1 and player2 if they exist
    let player1 = null;
    let player2 = null;

    if (team.player1Id) {
      const player1Result = await playerClient().get({
        id: team.player1Id,
      });
      player1 = player1Result.data;
    }

    if (team.player2Id) {
      const player2Result = await playerClient().get({
        id: team.player2Id,
      });
      player2 = player2Result.data;
    }

    return {
      team,
      player1,
      player2,
    };
  } catch (error) {
    console.error(`Error fetching team with players ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetch ladder by ID with teams
 */
export async function getLadderWithTeams(ladderId: string) {
  try {
    const { data: ladder, errors } = await ladderClient().get({
      id: ladderId,
    });

    if (errors) {
      console.error(`Error fetching ladder ${ladderId}:`, errors);
      return null;
    }

    if (ladder) {
      // Get teams for this ladder
      const teams = await getTeamsForLadder(ladderId);

      return {
        ...ladder,
        teamsList: teams,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ladder ${ladderId}:`, error);
    return null;
  }
}

/**
 * Get a team's ladder
 */
export async function getTeamLadder(teamId: string) {
  try {
    const { data: team, errors } = await teamClient().get({
      id: teamId,
    });

    if (errors) {
      console.error(`Error fetching team ${teamId}:`, errors);
      return null;
    }

    if (team && team.ladderId) {
      const { data: ladder } = await ladderClient().get({
        id: team.ladderId,
      });

      return ladder;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ladder for team ${teamId}:`, error);
    return null;
  }
}

/**
 * Fetch player by ID with team info
 */
export async function getPlayerWithTeam(playerId: string) {
  try {
    const { data: player, errors } = await playerClient().get({
      id: playerId,
    });

    if (errors) {
      console.error(`Error fetching player ${playerId}:`, errors);
      return null;
    }

    // Fetch the related team data if needed
    if (player) {
      // Get teams where this player is player1
      const player1TeamsResult = await teamClient().list({
        filter: { player1Id: { eq: playerId } },
        selectionSet: ["id", "name", "rating", "ladderId"],
      });

      // Get teams where this player is player2
      const player2TeamsResult = await teamClient().list({
        filter: { player2Id: { eq: playerId } },
        selectionSet: ["id", "name", "rating", "ladderId"],
      });

      return {
        ...player,
        teamAsPlayer1: player1TeamsResult.data || [],
        teamAsPlayer2: player2TeamsResult.data || [],
      };
    }

    return player;
  } catch (error) {
    console.error(`Error fetching player ${playerId}:`, error);
    return null;
  }
}

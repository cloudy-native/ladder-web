"use client";

import {
  ladderClient,
  playerClient,
  teamClient,
} from "@/utils/amplify-helpers";
import { TeamWithPlayers } from "@/utils/crudl";
import { filterNotNull } from "@/utils/data";
import { useCallback, useEffect, useState } from "react";

/**
 * A custom hook to manage a list of teams, including fetching team data, handling loading states, and managing errors.  Fetches teams and their associated players and ladders.
 * @returns An object containing the list of teams, loading state, error state, and a refresh function.
 */
export function useTeamList() {
  const [teamsWithPlayers, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all teams and their associated player and ladder data.  Handles errors and updates the state accordingly.
   */
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: teamData, errors } = await teamClient().list({});

      if (errors) {
        console.error("Error fetching teams:", errors);
        setError("Failed to load teams");
        setTeams([]);
        return;
      }

      console.log(`Fetched ${teamData?.length} teams`); // Added optional chaining

      // Create an array of promises to fetch players and ladder for each team in parallel
      const teamsWithPlayersPromises =
        teamData?.map(async (team) => {
          try {
            // Fetch player1 and player2 using optional chaining and nullish coalescing
            const player1 = team.player1Id
              ? (await playerClient().get({ id: team.player1Id })).data || null
              : null;
            const player2 = team.player2Id
              ? (await playerClient().get({ id: team.player2Id })).data || null
              : null;

            // Fetch ladder using optional chaining and nullish coalescing
            const ladder = team.ladderId
              ? (await ladderClient().get({ id: team.ladderId })).data || null
              : null;

            return { team, player1, player2, ladder };
          } catch (err) {
            console.error(
              `Error fetching related data for team ${team.id}:`,
              err
            );
            return null;
          }
        }) || []; // Handle case where teamData is null

      // Wait for all fetches to complete
      const result = await Promise.all(teamsWithPlayersPromises);

      setTeams(filterNotNull(result));
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError("An unexpected error occurred while loading teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teamsWithPlayers,
    loading,
    error,
    refreshTeams: fetchTeams,
  };
}

/**
 * A custom hook for creating new teams. Handles input validation, loading state, and error handling.
 * @returns An object containing the createTeam function, loading state, and error state.
 */
export function useTeamCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /**
   * Creates a new team. Handles input validation, API calls, and error handling.
   * @param name - The name of the team.
   * @param rating - The initial rating of the team. Defaults to 1200.
   * @param player1Id - The ID of the first player in the team (optional).
   * @returns The created team object or null if an error occurs.
   */
  const createTeam = useCallback(
    async (
      name: string,
      rating: string = "1200",
      player1Id?: string
    ): Promise<any | null> => {
      setCreateError(null);

      if (!name.trim()) {
        setCreateError("Team name is required");
        return null;
      }

      const parsedRating = parseInt(rating);
      if (isNaN(parsedRating) || parsedRating < 0) {
        setCreateError("Rating must be a positive number");
        return null;
      }

      setIsCreating(true);

      try {
        const { data: createdTeam, errors } = await teamClient().create({
          name: name.trim(),
          rating: parsedRating || 1200, // Use default rating if parsing fails
          player1Id: player1Id,
        });

        if (errors) {
          console.error("Error creating team:", errors);
          setCreateError("Failed to create team. Please try again.");
          return null;
        }

        console.log("Team created successfully:", createdTeam);
        return createdTeam;
      } catch (error) {
        console.error("Error creating team:", error);
        setCreateError("An unexpected error occurred. Please try again.");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return { createTeam, isCreating, createError };
}

/**
 * A custom hook for managing team-ladder associations. Provides functions to add and remove teams from ladders, handles loading and error states.
 * @returns An object containing functions to add and remove teams from ladders, loading state, and error state.
 */
export function useTeamLadder() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Adds a team to a ladder. Handles API calls, error handling, and updates the state accordingly.
   * @param teamId - The ID of the team to add.
   * @param ladderId - The ID of the ladder to add the team to.
   * @returns A promise that resolves to `true` if the team was successfully added to the ladder, `false` otherwise.
   */
  const addTeamToLadder = useCallback(
    async (teamId: string, ladderId: string) => {
      setUpdateError(null);
      setIsUpdating(true);

      try {
        // Check if the team already has a ladder
        const { data: team } = await teamClient().get({ id: teamId });

        if (team?.ladderId === ladderId) {
          console.log("Team already in this ladder");
          return true; // Already on the ladder, no need to update
        }

        const { data: updatedTeam, errors } = await teamClient().update({
          id: teamId,
          ladderId: ladderId,
        });

        if (errors) {
          console.error("Error adding team to ladder:", errors);
          setUpdateError("Failed to add team to ladder");
          return false;
        }

        console.log("Team added to ladder successfully:", updatedTeam);
        return true;
      } catch (error) {
        console.error("Error adding team to ladder:", error);
        setUpdateError("An unexpected error occurred");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  /**
   * Removes a team from its associated ladder. Handles API calls, error handling, and updates the state accordingly.
   * @param teamId - The ID of the team to remove from the ladder.
   * @returns A promise that resolves to `true` if the team was successfully removed from the ladder, `false` otherwise.
   */
  const removeTeamFromLadder = useCallback(async (teamId: string) => {
    setUpdateError(null);
    setIsUpdating(true);

    try {
      const { errors } = await teamClient().update({
        id: teamId,
        ladderId: null, // Remove the ladder association
      });

      if (errors) {
        console.error("Error removing team from ladder:", errors);
        setUpdateError("Failed to remove team from ladder");
        return false;
      }

      console.log("Team removed from ladder successfully");
      return true;
    } catch (error) {
      console.error("Error removing team from ladder:", error);
      setUpdateError("An unexpected error occurred");
      return false;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  return {
    addTeamToLadder,
    removeTeamFromLadder,
    isUpdating,
    updateError,
  };
}

// export function useTeamDelete() {
//   const [deletingTeams, setDeletingTeams] = useState<Record<string, boolean>>(
//     {}
//   );
//   const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

//   const deleteTeam = useCallback(
//     async (id: string, teams: MatchWithPlayers[]) => {
//       // Reset any previous error for this team
//       setDeleteErrors((prev) => ({ ...prev, [id]: "" }));

//       // Set the deleting state for this specific team
//       setDeletingTeams((prev) => ({ ...prev, [id]: true }));

//       try {
//         // Check if team has players
//         const teamExists = teams.find((t) => t.id === id);
//         if (teamExists) {
//           // Check if the team has players before deletion
//           const hasPlayers = teamExists.player1Id || teamExists.player2Id;
//           if (hasPlayers) {
//             const playerCount =
//               (teamExists.player1Id ? 1 : 0) + (teamExists.player2Id ? 1 : 0);
//             setDeleteErrors((prev) => ({
//               ...prev,
//               [id]: `Cannot delete: team has ${playerCount} player(s). Remove players first.`,
//             }));
//             return false;
//           }

//           const { errors } = await teamClient().delete({ id });

//           if (errors) {
//             console.error("Error deleting team:", errors);
//             setDeleteErrors((prev) => ({
//               ...prev,
//               [id]: "Failed to delete team. It may have players or matches.",
//             }));
//             return false;
//           }

//           console.log("Team deleted successfully");
//           return true;
//         }
//         return false;
//       } catch (error) {
//         console.error("Error deleting team:", error);
//         setDeleteErrors((prev) => ({
//           ...prev,
//           [id]: "An unexpected error occurred during deletion.",
//         }));
//         return false;
//       } finally {
//         // Reset the deleting state
//         setDeletingTeams((prev) => ({ ...prev, [id]: false }));
//       }
//     },
//     []
//   );

//   return {
//     deleteTeam,
//     deletingTeams,
//     deleteErrors,
//   };
// }

// export function useTeamJoin() {
//   const [isJoining, setIsJoining] = useState(false);
//   const [joinError, setJoinError] = useState<string | null>(null);

//   const joinTeam = useCallback(
//     async (
//       teamId: string,
//       currentPlayer: Player,
//       teams: MatchWithPlayers[]
//     ) => {
//       // Reset error state
//       setJoinError(null);

//       if (!currentPlayer) {
//         setJoinError("You must be logged in to join a team");
//         return false;
//       }

//       setIsJoining(true);

//       try {
//         // Get current team to determine available slots
//         const team = teams.find((t) => t.id === teamId);
//         if (!team) {
//           setJoinError("Team not found");
//           return false;
//         }

//         // Check if player is already in this team
//         if (
//           team.player1Id === currentPlayer.id ||
//           team.player2Id === currentPlayer.id
//         ) {
//           setJoinError("You are already in this team");
//           return false;
//         }

//         // Determine which slot to use (player1 or player2)
//         let slot: "player1Id" | "player2Id" | null = null;

//         if (!team.player1Id) {
//           slot = "player1Id";
//         } else if (!team.player2Id) {
//           slot = "player2Id";
//         }

//         if (!slot) {
//           setJoinError("This team is already full");
//           return false;
//         }

//         // Check if player is already on another team
//         // First check if current player is already on a team as player1
//         const playerAsPlayer1Teams = await teamClient().list({
//           filter: { player1Id: { eq: currentPlayer.id } },
//         });

//         // Then check if current player is already on a team as player2
//         const playerAsPlayer2Teams = await teamClient().list({
//           filter: { player2Id: { eq: currentPlayer.id } },
//         });

//         const isOnTeam =
//           (playerAsPlayer1Teams.data && playerAsPlayer1Teams.data.length > 0) ||
//           (playerAsPlayer2Teams.data && playerAsPlayer2Teams.data.length > 0);

//         if (isOnTeam) {
//           // Need to leave current team first
//           // Find the team the player is on
//           let currentTeamId: string | null = null;
//           let currentSlot: "player1Id" | "player2Id" | null = null;

//           if (
//             playerAsPlayer1Teams.data &&
//             playerAsPlayer1Teams.data.length > 0
//           ) {
//             currentTeamId = playerAsPlayer1Teams.data[0].id;
//             currentSlot = "player1Id";
//           } else if (
//             playerAsPlayer2Teams.data &&
//             playerAsPlayer2Teams.data.length > 0
//           ) {
//             currentTeamId = playerAsPlayer2Teams.data[0].id;
//             currentSlot = "player2Id";
//           }

//           if (currentTeamId && currentSlot) {
//             // Remove from current team
//             const { errors: leaveErrors } = await teamClient().update({
//               id: currentTeamId,
//               [currentSlot]: null,
//             });

//             if (leaveErrors) {
//               console.error("Error leaving current team:", leaveErrors);
//               setJoinError("Failed to leave current team. Please try again.");
//               return false;
//             }
//           }
//         }

//         // Update the team to add the player
//         const { data: updatedTeam, errors } = await teamClient().update({
//           id: teamId,
//           [slot]: currentPlayer.id,
//         });

//         if (errors) {
//           console.error("Error joining team:", errors);
//           setJoinError("Failed to join team. Please try again.");
//           return false;
//         }

//         console.log("Joined team successfully:", updatedTeam);
//         return true;
//       } catch (error) {
//         console.error("Error joining team:", error);
//         setJoinError("An unexpected error occurred. Please try again.");
//         return false;
//       } finally {
//         setIsJoining(false);
//       }
//     },
//     []
//   );

//   const leaveTeam = useCallback(
//     async (teamId: string, currentPlayer: Player) => {
//       setJoinError(null);

//       if (!currentPlayer) {
//         setJoinError("No current player");
//         return false;
//       }

//       setIsJoining(true);

//       try {
//         // Check if player is in this team and which slot
//         const { data: team } = await teamClient().get({ id: teamId });

//         if (!team) {
//           setJoinError("Team not found");
//           return false;
//         }

//         // Check if player is in this team
//         let slot: "player1Id" | "player2Id" | null = null;

//         if (team.player1Id === currentPlayer.id) {
//           slot = "player1Id";
//         } else if (team.player2Id === currentPlayer.id) {
//           slot = "player2Id";
//         }

//         if (!slot) {
//           setJoinError("Player is not in this team");
//           return false;
//         }

//         // Update the team to remove the player
//         const { data: updatedTeam, errors } = await teamClient().update({
//           id: teamId,
//           [slot]: null,
//         });

//         if (errors) {
//           console.error("Error leaving team:", errors);
//           setJoinError("Failed to leave team");
//           return false;
//         }

//         console.log("Left team successfully:", updatedTeam);
//         return true;
//       } catch (error) {
//         console.error("Error leaving team:", error);
//         setJoinError("An unexpected error occurred");
//         return false;
//       } finally {
//         setIsJoining(false);
//       }
//     },
//     []
//   );

//   return {
//     joinTeam,
//     leaveTeam,
//     isJoining,
//     joinError,
//   };
// }

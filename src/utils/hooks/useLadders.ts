"use client";

import {
  Ladder,
  ladderClient,
  Player,
  playerClient,
  Team,
  teamClient,
} from "@/utils/amplify-helpers";
import { useCallback, useEffect, useState } from "react";
import {
  createLadder as createLadderApi,
  deleteLadder as deleteLadderApi,
  getAllLadders,
  TeamWithPlayers,
} from "@/utils/crudl";

/**
 * Hook for fetching a list of all ladders.
 *
 * @returns An object containing the ladders array, a loading state, an error state, and a function to refresh the list.
 */
export function useLadderList() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all ladders from the database.
   */
  const getLaddersData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setLadders(await getAllLadders());
    } catch (err) {
      console.error("Error fetching ladders:", err);
      setError("Failed to load ladders");
      setLadders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    getLaddersData();
  }, [getLaddersData]);

  /**
   * Refreshes the list of ladders by re-fetching the data.
   */
  const refreshLadders = useCallback(() => {
    return getLaddersData();
  }, [getLaddersData]);

  return {
    ladders,
    loading,
    error,
    refreshLadders,
  };
}

/**
 * Hook for managing ladders selection and related data.
 *
 * @returns An object containing ladders, loading state, error state, selected ladder, setter for selected ladder,
 *          a function to refresh ladders, a function to check if a team is in a ladder, and a function to get a ladder's name.
 */
export function useLadderSelect() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLadder, setSelectedLadder] = useState<Ladder | null>(null);

  /**
   * Fetches ladders from the database.
   */
  const fetchLadders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: ladderData, errors } = await ladderClient().list();

      if (errors) {
        console.error("Error fetching ladders:", errors);
        setError("Failed to load ladders");
        setLadders([]);
        return;
      }

      // Ensure we only use valid ladder objects to prevent UI errors
      if (ladderData && Array.isArray(ladderData)) {
        const validLadders = ladderData.filter(
          (ladder) =>
            ladder !== null &&
            typeof ladder === "object" &&
            ladder.id &&
            ladder.name
        ) as Ladder[];

        // Sort by name for better user experience
        validLadders.sort((a, b) => a.name.localeCompare(b.name));

        setLadders(validLadders);
      } else {
        setLadders([]);
      }
    } catch (error) {
      console.error("Error fetching ladders:", error);
      setError("An unexpected error occurred");
      setLadders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLadders();
  }, [fetchLadders]);

  /**
   * Checks if a team is in a specific ladder.
   *
   * @param teamId - The ID of the team to check.
   * @param ladderId - The ID of the ladder to check against.
   * @param teams - The list of teams to search.
   * @returns True if the team is in the ladder, false otherwise.
   */
  const isTeamInLadder = useCallback(
    (teamId: string, ladderId: string, teams: Team[]) => {
      const team = teams.find((team) => team.id === teamId);
      return team?.ladderId === ladderId;
    },
    []
  );

  /**
   * Gets the name of a ladder by its ID.
   *
   * @param ladderId - The ID of the ladder to find.
   * @returns The name of the ladder or "Unknown Ladder" if not found.
   */
  const getLadderName = useCallback(
    (ladderId: string) => {
      const ladder = ladders.find((ladder) => ladder.id === ladderId);
      return ladder ? ladder.name : "Unknown Ladder";
    },
    [ladders]
  );

  return {
    ladders,
    loading,
    error,
    selectedLadder,
    setSelectedLadder,
    refreshLadders: fetchLadders,
    isTeamInLadder,
    getLadderName,
  };
}

/**
 * Hook for creating a new ladder.
 *
 * @returns An object containing the createLadder function, a loading state, and an error state.
 */
export function useLadderCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /**
   * Creates a new ladder.
   *
   * @param name - The name of the new ladder.
   * @param description - An optional description for the ladder.
   * @returns The newly created Ladder object.
   */
  const createLadder = useCallback(
    async (name: string, description: string = "") => {
      setCreateError(null);

      // Validate input
      if (!name.trim()) {
        setCreateError("Ladder name is required");
        return null;
      }

      setIsCreating(true);

      try {
        return await createLadderApi(name, description);
      } catch (error) {
        console.error("Error creating ladder:", error);
        setCreateError("Failed to create ladder. Please try again.");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  return {
    createLadder,
    isCreating,
    createError,
  };
}

/**
 * Hook for deleting a ladder.
 *
 * @returns An object containing the deleteLadder function, a record of deleting states for each ladder, and a record of error messages for each ladder.
 */
export function useLadderDelete() {
  const [deletingLadders, setDeletingLadders] = useState<
    Record<string, boolean>
  >({});
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

  /**
   * Deletes a ladder by its ID.
   *
   * @param id - The ID of the ladder to delete.
   * @returns True if the ladder was successfully deleted, false otherwise.
   */
  const deleteLadder = useCallback(async (id: string) => {
    // Reset any previous error for this ladder
    setDeleteError((prev) => ({ ...prev, [id]: "" }));

    // Set the deleting state for this specific ladder
    setDeletingLadders((prev) => ({ ...prev, [id]: true }));

    try {
      await deleteLadderApi(id);
      return true;
    } catch (error) {
      console.error("Error deleting ladder:", error);
      setDeleteError((prev) => ({
        ...prev,
        [id]: "Failed to delete ladder. It may have teams or matches associated with it.",
      }));
      return false;
    } finally {
      // Reset the deleting state
      setDeletingLadders((prev) => ({ ...prev, [id]: false }));
    }
  }, []);

  return {
    deleteLadder,
    deletingLadders,
    deleteError,
  };
}

/**
 * Hook for fetching teams associated with a specific ladder.
 *
 * @param ladderId - The ID of the ladder to fetch teams for.
 * @returns An object containing the list of teams with players, a loading state, an error state, and a function to refresh the list.
 */
export function useTeamsForLadder(ladderId: string) {
  const [teamsWithPlayers, setTeamsWithPlayers] = useState<TeamWithPlayers[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  /**
   * Fetches teams and their associated players for the specified ladder.
   */
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Fetch teams for this ladder using filter
      const { data: teamsData, errors: teamsErrors } = await teamClient().list({
        filter: { ladderId: { eq: ladderId } },
      });

      if (teamsErrors) {
        console.error("Error fetching teams for ladder:", teamsErrors);
        setError(true);
        setTeamsWithPlayers([]);

        return;
      }

      if (!teamsData || !Array.isArray(teamsData)) {
        console.error("Invalid teams data:", teamsData);
        setError(true);
        setTeamsWithPlayers([]);

        return;
      }

      // Create an array of promises to fetch players for all teams in parallel
      const teamsWithPlayersPromises = teamsData.map(async (team) => {
        try {
          let player1: Player | null = null;
          let player2: Player | null = null;

          {
            if (team.player1Id) {
              const player1Result = await playerClient().get({
                id: team.player1Id,
              });
              if (player1Result.data) {
                player1 = player1Result.data;
              }
            }
          }

          {
            if (team.player2Id) {
              const player2Result = await playerClient().get({
                id: team.player2Id,
              });
              if (player2Result.data) {
                player2 = player2Result.data;
              }
            }
          }

          // Return the team with its players
          return {
            team,
            player1,
            player2,
          };
        } catch (err) {
          console.error("Error fetching players for team:", err);
          return null;
        }
      });

      // Wait for all team fetches to complete
      const result = await Promise.all(teamsWithPlayersPromises);

      const validTeams = result.filter(
        (teamWithPlayers) => teamWithPlayers !== null
      ) as unknown as TeamWithPlayers[];
      // Sort teams by rating in descending order
      validTeams.sort((a, b) => b.team.rating - a.team.rating);

      setTeamsWithPlayers(validTeams);
    } catch (err) {
      console.error("Exception fetching teams for ladder:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [ladderId]);

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

import { useState, useEffect, useCallback } from 'react';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../../amplify/data/resource';
import { getLadders, deleteLadder as deleteLadderApi, createLadder as createLadderApi } from '../data-fetchers';

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];

export function useLadderList() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLaddersData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ladderData = await getLadders();
      setLadders(ladderData);
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

  const refreshLadders = useCallback(() => {
    return getLaddersData();
  }, [getLaddersData]);

  return {
    ladders,
    loading,
    error,
    refreshLadders
  };
}

export function useLadderSelect() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLadder, setSelectedLadder] = useState<Ladder | null>(null);

  const fetchLadders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: ladderData, errors } = await client.models.Ladder.list();

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
        );

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

  // Helper functions for ladder operations
  const isTeamInLadder = useCallback((teamId: string, ladderId: string, teams: any[]) => {
    const team = teams.find((team) => team.id === teamId);
    return team?.ladderId === ladderId;
  }, []);

  const getLadderName = useCallback((ladderId: string) => {
    const ladder = ladders.find((ladder) => ladder.id === ladderId);
    return ladder ? ladder.name : "Unknown Ladder";
  }, [ladders]);

  return {
    ladders,
    loading,
    error,
    selectedLadder,
    setSelectedLadder,
    refreshLadders: fetchLadders,
    isTeamInLadder,
    getLadderName
  };
}

export function useLadderCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createLadder = useCallback(async (name: string, description: string = "") => {
    setCreateError(null);

    // Validate input
    if (!name.trim()) {
      setCreateError("Ladder name is required");
      return null;
    }

    setIsCreating(true);

    try {
      const createdLadder = await createLadderApi(name, description);
      return createdLadder;
    } catch (error) {
      console.error("Error creating ladder:", error);
      setCreateError("Failed to create ladder. Please try again.");
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  return {
    createLadder,
    isCreating,
    createError
  };
}

export function useLadderDelete() {
  const [deletingLadders, setDeletingLadders] = useState<Record<string, boolean>>({});
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});

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
        [id]: "Failed to delete ladder. It may have teams or matches associated with it."
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
    deleteError
  };
}

// Type definitions for team with players
type Team = Schema["Team"]["type"];
type Player = Schema["Player"]["type"];

export interface TeamWithPlayers extends Team {
  playersList?: Player[];
}

export function useTeamsForLadder(ladderId: string) {
  const [teamsWithPlayers, setTeamsWithPlayers] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      // Fetch teams for this ladder using filter
      const teamsResult = await client.models.Team.list({
        filter: { ladderId: { eq: ladderId } },
        selectionSet: ["id", "name", "rating", "ladderId", "player1Id", "player2Id"]
      });

      if (teamsResult.errors) {
        console.error("Error fetching teams for ladder:", teamsResult.errors);
        setError(true);
        return;
      }

      const teams = teamsResult.data || [];
      
      // If we have teams, fetch the players for each one
      if (teams.length > 0) {
        let teamsData: TeamWithPlayers[] = [];

        // Create an array of promises to fetch players for all teams in parallel
        const teamsWithPlayersPromises = teams.map(async (team) => {
          if (!team || !team.id) return null;
          
          try {
            const players: Player[] = [];
            
            // Fetch player1 if it exists
            if (team.player1Id) {
              const player1Result = await client.models.Player.get({
                id: team.player1Id
              });
              if (player1Result.data) {
                players.push(player1Result.data);
              }
            }
            
            // Fetch player2 if it exists
            if (team.player2Id) {
              const player2Result = await client.models.Player.get({
                id: team.player2Id
              });
              if (player2Result.data) {
                players.push(player2Result.data);
              }
            }

            // Return the team with its players
            return {
              ...team,
              playersList: players,
            } as TeamWithPlayers;
          } catch (err) {
            console.error("Error fetching players for team:", err);
            return null;
          }
        });

        // Wait for all team fetches to complete
        const results = await Promise.all(teamsWithPlayersPromises);
        
        // Filter out any null results from errors
        teamsData = results.filter(Boolean) as TeamWithPlayers[];
        
        // Sort teams by rating in descending order
        teamsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setTeamsWithPlayers(teamsData);
      } else {
        setTeamsWithPlayers([]);
      }
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
    refreshTeams: fetchTeams
  };
}
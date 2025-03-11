"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ladder,
  ladderClient,
  Match,
  matchClient,
  Team,
  teamClient
} from "../amplify-helpers";

export interface MatchWithDetails extends Match {
  team1Details?: Team | null;
  team2Details?: Team | null;
  winnerDetails?: Team | null;
  ladderDetails?: Ladder | null;
}

// Hook to fetch all matches with team details
export function useMatchList() {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data: matchData, errors } = await matchClient().list({
        selectionSet: [
          "id",
          "ladderId",
          "team1Id",
          "team2Id",
          "winnerId",
          "createdAt",
        ],
      });

      if (errors) {
        console.error("Error fetching matches:", errors);
        setError("Failed to load matches");
        setMatches([]);
        return;
      }

      // Ensure we only use valid match objects to prevent UI errors
      if (matchData && Array.isArray(matchData)) {
        const validMatches = matchData.filter(
          (match) =>
            match !== null &&
            typeof match === "object" &&
            match.id &&
            match.team1Id &&
            match.team2Id
        );

        console.log(`Fetched ${validMatches.length} matches`);

        // Create an array of promises to fetch related data for each match in parallel
        const matchesWithDetailsPromises = validMatches.map(async (match) => {
          try {
            // Fetch team1 details
            let team1 = null;
            if (match.team1Id) {
              const team1Result = await teamClient().get({
                id: match.team1Id,
              });
              team1 = team1Result.data;
            }

            // Fetch team2 details
            let team2 = null;
            if (match.team2Id) {
              const team2Result = await teamClient().get({
                id: match.team2Id,
              });
              team2 = team2Result.data;
            }

            // Fetch winner details
            let winner = null;
            if (match.winnerId) {
              const winnerResult = await teamClient().get({
                id: match.winnerId,
              });
              winner = winnerResult.data;
            }

            // Fetch ladder details
            let ladder = null;
            if (match.ladderId) {
              const ladderResult = await ladderClient().get({
                id: match.ladderId,
              });
              ladder = ladderResult.data;
            }

            return {
              ...match,
              team1Details: team1,
              team2Details: team2,
              winnerDetails: winner,
              ladderDetails: ladder,
            } as MatchWithDetails;
          } catch (err) {
            console.error(
              `Error fetching related data for match ${match.id}:`,
              err
            );
            return {
              ...match,
              team1Details: null,
              team2Details: null,
              winnerDetails: null,
              ladderDetails: null,
            } as MatchWithDetails;
          }
        });

        // Wait for all fetches to complete
        const matchesWithDetails = await Promise.all(
          matchesWithDetailsPromises
        );

        // Sort by creation date, newest first
        matchesWithDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setMatches(matchesWithDetails);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("An unexpected error occurred while loading matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    refreshMatches: fetchMatches,
  };
}

// Hook to fetch matches for a specific ladder
export function useMatchesForLadder(ladderId: string) {
  const [matches, setMatches] = useState<MatchWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    if (!ladderId) {
      setMatches([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: matchData, errors } = await matchClient().list({
        filter: { ladderId: { eq: ladderId } },
        selectionSet: [
          "id",
          "ladderId",
          "team1Id",
          "team2Id",
          "winnerId",
          "createdAt",
        ],
      });

      if (errors) {
        console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
        setError("Failed to load matches for this ladder");
        setMatches([]);
        return;
      }

      // Ensure we only use valid match objects to prevent UI errors
      if (matchData && Array.isArray(matchData)) {
        const validMatches = matchData.filter(
          (match) =>
            match !== null &&
            typeof match === "object" &&
            match.id &&
            match.team1Id &&
            match.team2Id
        );

        console.log(
          `Fetched ${validMatches.length} matches for ladder ${ladderId}`
        );

        // Create an array of promises to fetch related data for each match in parallel
        const matchesWithDetailsPromises = validMatches.map(async (match) => {
          try {
            // Fetch team1 details
            let team1 = null;
            if (match.team1Id) {
              const team1Result = await teamClient().get({
                id: match.team1Id,
              });
              team1 = team1Result.data;
            }

            // Fetch team2 details
            let team2 = null;
            if (match.team2Id) {
              const team2Result = await teamClient().get({
                id: match.team2Id,
              });
              team2 = team2Result.data;
            }

            // Fetch winner details
            let winner = null;
            if (match.winnerId) {
              const winnerResult = await teamClient().get({
                id: match.winnerId,
              });
              winner = winnerResult.data;
            }

            return {
              ...match,
              team1Details: team1,
              team2Details: team2,
              winnerDetails: winner,
              ladderDetails: null, // We already have the ladder ID
            } as MatchWithDetails;
          } catch (err) {
            console.error(
              `Error fetching related data for match ${match.id}:`,
              err
            );
            return {
              ...match,
              team1Details: null,
              team2Details: null,
              winnerDetails: null,
              ladderDetails: null,
            } as MatchWithDetails;
          }
        });

        // Wait for all fetches to complete
        const matchesWithDetails = await Promise.all(
          matchesWithDetailsPromises
        );

        // Sort by creation date, newest first
        matchesWithDetails.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setMatches(matchesWithDetails);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, error);
      setError("An unexpected error occurred while loading matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, [ladderId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    refreshMatches: fetchMatches,
  };
}

// Hook to create a match and update ratings
export function useMatchCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const createMatch = useCallback(
    async (
      ladderId: string,
      team1Id: string,
      team2Id: string,
      winnerId?: string
    ) => {
      // Reset error state
      setCreateError(null);

      // Validate input
      if (!ladderId || !team1Id || !team2Id) {
        setCreateError("Ladder and both teams are required");
        return null;
      }

      if (team1Id === team2Id) {
        setCreateError("Teams must be different");
        return null;
      }

      setIsCreating(true);

      try {
        const { data: createdMatch, errors } = await matchClient().create({
          ladderId,
          team1Id,
          team2Id,
          winnerId: winnerId || undefined,
        });

        if (errors) {
          console.error("Error creating match:", errors);
          setCreateError("Failed to create match. Please try again.");
          return null;
        }

        console.log("Match created successfully:", createdMatch);

        // If we have a winner, update ratings
        if (winnerId) {
          try {
            await updateRatings(team1Id, team2Id, winnerId);
          } catch (error) {
            console.error("Error updating ratings:", error);
            // We don't fail the match creation if rating update fails
          }
        }

        return createdMatch;
      } catch (error) {
        console.error("Error creating match:", error);
        setCreateError("An unexpected error occurred. Please try again.");
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  // Update team ratings based on match result
  const updateRatings = async (
    team1Id: string,
    team2Id: string,
    winnerId: string
  ) => {
    // Get current ratings
    const team1Result = await teamClient().get({ id: team1Id });
    const team2Result = await teamClient().get({ id: team2Id });

    if (!team1Result.data || !team2Result.data) {
      throw new Error("Could not find teams");
    }

    const team1 = team1Result.data;
    const team2 = team2Result.data;

    // Get current ratings with defaults
    const team1Rating = team1.rating || 1200;
    const team2Rating = team2.rating || 1200;

    // Determine winner and loser ratings
    let winnerRating, loserRating, winnerId2, loserId;
    if (winnerId === team1Id) {
      winnerId2 = team1Id;
      loserId = team2Id;
      winnerRating = team1Rating;
      loserRating = team2Rating;
    } else {
      winnerId2 = team2Id;
      loserId = team1Id;
      winnerRating = team2Rating;
      loserRating = team1Rating;
    }

    // Calculate new ratings (using Elo rating system)
    const K = 32; // K-factor determines how much ratings change

    // Calculate expected scores
    const expectedWinner =
      1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser =
      1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));

    // Calculate new ratings
    const newWinnerRating = Math.round(winnerRating + K * (1 - expectedWinner));
    const newLoserRating = Math.round(loserRating + K * (0 - expectedLoser));

    // Update ratings in database
    await teamClient().update({
      id: winnerId2,
      rating: newWinnerRating,
    });

    await teamClient().update({
      id: loserId,
      rating: newLoserRating,
    });

    console.log(
      `Updated ratings: ${winnerId2} ${winnerRating} -> ${newWinnerRating}, ${loserId} ${loserRating} -> ${newLoserRating}`
    );
  };

  return {
    createMatch,
    isCreating,
    createError,
  };
}

// Hook to get teams for a specific ladder
export function useTeamsForMatch(ladderId: string) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    if (!ladderId) {
      setTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: teamData, errors } = await teamClient().list({
        filter: { ladderId: { eq: ladderId } },
        selectionSet: ["id", "name", "rating", "player1Id", "player2Id"],
      });

      if (errors) {
        console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
        setError("Failed to load teams for this ladder");
        setTeams([]);
        return;
      }

      // Ensure we only use valid team objects to prevent UI errors
      if (teamData && Array.isArray(teamData)) {
        const validTeams = teamData.filter(
          (team) =>
            team !== null && typeof team === "object" && team.id && team.name
        );

        // Sort by rating
        validTeams.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        setTeams(validTeams);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error(`Error fetching teams for ladder ${ladderId}:`, error);
      setError("An unexpected error occurred while loading teams");
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }, [ladderId]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  return {
    teams,
    loading,
    error,
    refreshTeams: fetchTeams,
  };
}

"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Ladder,
  Match,
  matchClient,
  Team,
  teamClient,
} from "@/utils/amplify-helpers";
import { filterNotNull } from "../data";

/**
 * Represents a match with its associated ladder and teams.
 */
export interface MatchWithLadderAndTeams {
  match: Match;
  ladder: Ladder | null;
  team1: Team | null;
  team2: Team | null;
  winner?: Team | null;
}

/**
 * Hook to fetch all matches along with their associated ladder and team details.
 *
 * @returns An object containing:
 *   - matches: An array of matches with ladder and team details.
 *   - loading: A boolean indicating whether the data is currently being fetched.
 *   - error: A string containing an error message if an error occurred during fetching, or null if no error.
 *   - refreshMatches: A function to manually refresh the matches data.
 */
export function useMatchList() {
  const [matches, setMatches] = useState<MatchWithLadderAndTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches all matches from the database and populates them with their related ladder and team data.
   */
  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all matches
      const { data: matchData, errors: matchErrors } =
        await matchClient().list();

      if (matchErrors) {
        console.error("Error fetching matches:", matchErrors);
        setError("Failed to load matches");
        setMatches([]);
        return;
      }

      console.log(`Fetched ${matchData.length} matches`);

      // Create an array of promises to fetch related data for each match in parallel
      const promises = matchData.map(async (match) => {
        return {
          match,
          team1: await match.team1(), // Fetch team1 details
          team2: await match.team2(), // Fetch team2 details
          winner: await match.winner(), // Fetch winner details
          ladder: await match.ladder(), // Fetch ladder details
        } as unknown as MatchWithLadderAndTeams;
      });

      // Wait for all fetches to complete
      const matchesWithDetails = await Promise.all(promises);

      setMatches(matchesWithDetails);
    } catch (error) {
      console.error("Error fetching matches:", error);
      setError("An unexpected error occurred while loading matches");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch matches on component mount
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

/**
 * Represents a ladder with its associated matches and teams.
 */
export type MatchesWithTeams = {
  match: Match;
  team1: Team | null;
  team2: Team | null;
  winner: Team | null;
};

/**
 * Hook to fetch matches for a specific ladder along with their associated team details.
 *
 * @param ladderId - The ID of the ladder to fetch matches for.
 * @returns An object containing:
 *   - matches: An array of matches with team details for the specified ladder.
 *   - loading: A boolean indicating whether the data is currently being fetched.
 *   - error: A string containing an error message if an error occurred during fetching, or null if no error.
 *   - refreshMatches: A function to manually refresh the matches data.
 */
export function useMatchesForLadder(ladderId: string) {
  const [matchesWithTeams, setMatchesWithTeams] = useState<MatchesWithTeams[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetches matches for the specified ladder and populates them with their related team data.
   */
  const fetchMatches = useCallback(async () => {
    // If no ladder ID is provided, clear the matches and return
    if (!ladderId) {
      setMatchesWithTeams([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch matches for the specified ladder
      const { data: matchData, errors } = await matchClient().list({
        filter: { ladderId: { eq: ladderId } },
      });

      if (errors) {
        console.error(`Error fetching matches for ladder ${ladderId}:`, errors);
        setError("Failed to load matches for this ladder");
        setMatchesWithTeams([]);
        return;
      }

      console.log(`Fetched ${matchData.length} matches for ladder ${ladderId}`);

      // Create an array of promises to fetch related data for each match in parallel
      const promises = matchData.map(async (match) => {
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
            match,
            team1,
            team2,
            winner,
          } as unknown as MatchesWithTeams;
        } catch (err) {
          console.error(
            `Error fetching related data for match ${match.id}:`,
            err
          );
          return null;
        }
      });

      // Wait for all fetches to complete
      const result = await Promise.all(promises);

      // Filter out any null results (failed fetches)
      setMatchesWithTeams(filterNotNull(result));
    } catch (error) {
      console.error(`Error fetching matches for ladder ${ladderId}:`, error);
      setError("An unexpected error occurred while loading matches");
      setMatchesWithTeams([]);
    } finally {
      setLoading(false);
    }
  }, [ladderId]);

  // Fetch matches on component mount or when ladderId changes
  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  return {
    matchesWithTeams,
    loading,
    error,
    refreshMatches: fetchMatches,
  };
}

/**
 * Hook to create a new match and update team ratings based on the match result.
 *
 * @returns An object containing:
 *   - createMatch: A function to create a new match.
 *   - isCreating: A boolean indicating whether a match is currently being created.
 *   - createError: A string containing an error message if an error occurred during match creation, or null if no error.
 */
export function useMatchCreate() {
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  /**
   * Creates a new match and updates the ratings of the participating teams if a winner is specified.
   *
   * @param ladderId - The ID of the ladder the match belongs to.
   * @param team1Id - The ID of the first team.
   * @param team2Id - The ID of the second team.
   * @param winnerId - (Optional) The ID of the winning team.
   * @returns The newly created match object, or null if an error occurred.
   */
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
        console.error("Validation failed:", { ladderId, team1Id, team2Id });
        setCreateError("Ladder and both teams are required");
        return null;
      }

      if (team1Id === team2Id) {
        console.error("Teams are the same:", team1Id);
        setCreateError("Teams must be different");
        return null;
      }

      setIsCreating(true);
      console.log("Creating match with params:", {
        ladderId,
        team1Id,
        team2Id,
        winnerId,
      });

      try {
        console.log("About to call matchClient().create()");
        const createResult = await matchClient().create({
          ladderId,
          team1Id,
          team2Id,
          winnerId: winnerId || undefined,
        });
        console.log("matchClient().create() result:", createResult);

        const { data: createdMatch, errors } = createResult;

        if (errors) {
          console.error("Error creating match:", errors);
          setCreateError("Failed to create match. Please try again.");
          return null;
        }

        console.log("Match created successfully:", createdMatch);

        // If we have a winner, update ratings
        if (winnerId) {
          try {
            console.log("Updating ratings for winner:", winnerId);
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

  /**
   * Updates the ratings of the participating teams based on the match result using the Elo rating system.
   *
   * @param team1Id - The ID of the first team.
   * @param team2Id - The ID of the second team.
   * @param winnerId - The ID of the winning team.
   */
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

/**
 * TODO: this is "useTeamsForLadder", which we have already
 * Hook to get teams for a specific ladder.
 *
 * @param ladderId - The ID of the ladder to fetch teams for.
 * @returns An object containing:
 *   - teams: An array of teams in the specified ladder.
 *   - loading: A boolean indicating whether the data is currently being fetched.
 *   - error: A string containing an error message if an error occurred during fetching, or null if no error.
 *   - refreshTeams: A function to manually refresh the teams data.
 */
// export function useTeamsForMatch(ladderId: string) {
//   const [teams, setTeams] = useState<Team[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   /**
//    * Fetches teams for the specified ladder.
//    */
//   const fetchTeams = useCallback(async () => {
//     // If no ladder ID is provided, clear the teams and return
//     if (!ladderId) {
//       setTeams([]);
//       setLoading(false);
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       // Fetch teams for the specified ladder
//       const { data: teamData, errors } = await teamClient().list({
//         filter: { ladderId: { eq: ladderId } },
//         selectionSet: ["id", "name", "rating", "player1Id", "player2Id"],
//       });

//       if (errors) {
//         console.error(`Error fetching teams for ladder ${ladderId}:`, errors);
//         setError("Failed to load teams for this ladder");
//         setTeams([]);
//         return;
//       }

//       // Sort by rating
//       teamData.sort((a, b) => (b.rating || 0) - (a.rating || 0));

//       setTeams(teamData);
//     } catch (error) {
//       console.error(`Error fetching teams for ladder ${ladderId}:`, error);
//       setError("An unexpected error occurred while loading teams");
//       setTeams([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [ladderId]);

//   // Fetch teams on component mount or when ladderId changes
//   useEffect(() => {
//     fetchTeams();
//   }, [fetchTeams]);

//   return {
//     teams,
//     loading,
//     error,
//     refreshTeams: fetchTeams,
//   };
// }

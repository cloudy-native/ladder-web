import type { Schema } from "../../amplify/data/resource";

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];
type Match = Schema["Match"]["type"];

/**
 * Check if a value is a Promise
 */
export function isPromise(value: any): boolean {
  return value instanceof Promise;
}

/**
 * Check if a team is in a specific ladder
 */
export function isTeamInLadder(
  teamId: string, 
  ladderId: string, 
  teams: Team[]
): boolean {
  const team = teams.find(team => team.id === teamId);
  return team?.ladderId === ladderId;
}

/**
 * Find teams in a specific ladder
 */
export function findTeamsInLadder(
  ladderId: string, 
  teams: Team[]
): Team[] {
  return teams.filter(team => team.ladderId === ladderId);
}

/**
 * Get a team's ladder
 */
export function getTeamLadder(
  teamId: string,
  teams: Team[],
  ladders: Ladder[]
): Ladder | undefined {
  const team = teams.find(team => team.id === teamId);
  if (team?.ladderId) {
    return ladders.find(ladder => ladder.id === team.ladderId);
  }
  return undefined;
}

/**
 * Get a ladder name by ID from a list of ladders
 */
export function getLadderName(ladderId: string, ladders: Ladder[]): string {
  const ladder = ladders.find((ladder) => ladder.id === ladderId);
  return ladder ? ladder.name : "Unknown Ladder";
}

/**
 * Get a team name by ID from a list of teams
 */
export function getTeamName(teamId: string, teams: Team[]): string {
  const team = teams.find((team) => team.id === teamId);
  return team ? team.name : "Unknown Team";
}

/**
 * Format a list of players into a readable string
 */
export function formatPlayers(players?: Player[]): string {
  if (!players || players.length === 0) return "—";
  
  return players
    .map((player) => `${player.givenName} ${player.familyName}`)
    .join(", ");
}

/**
 * Format a full player name
 */
export function formatPlayerName(player: Player): string {
  return `${player.givenName} ${player.familyName}`;
}

/**
 * Check if a player is a member of the team
 */
export function isPlayerInTeam(playerId: string | undefined, teamId: string | undefined | null): boolean {
  if (!playerId || !teamId) return false;
  return true;
}

/**
 * Calculate pagination information
 */
export function getPaginationInfo(
  currentPage: number, 
  itemsPerPage: number, 
  totalItems: number
) {
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = Math.min(indexOfLastItem, totalItems) - indexOfFirstItem;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  return {
    indexOfFirstItem,
    indexOfLastItem: Math.min(indexOfLastItem, totalItems),
    currentItems,
    totalPages
  };
}

/**
 * Filter matches for a ladder
 */
export function getMatchesForLadder(
  ladderId: string,
  matches: Match[]
): Match[] {
  return matches.filter(match => match.ladderId === ladderId);
}

/**
 * Find matches for a team (either as team1 or team2)
 */
export function getMatchesForTeam(
  teamId: string,
  matches: Match[]
): Match[] {
  return matches.filter(match => 
    match.team1Id === teamId || match.team2Id === teamId
  );
}

/**
 * Get team's match record (wins, losses)
 */
export function getTeamMatchRecord(
  teamId: string,
  matches: Match[]
): { wins: number; losses: number } {
  const teamMatches = getMatchesForTeam(teamId, matches);
  
  // Only count matches with a winner
  const matchesWithWinner = teamMatches.filter(match => match.winnerId);
  
  const wins = matchesWithWinner.filter(match => match.winnerId === teamId).length;
  const losses = matchesWithWinner.length - wins;
  
  return { wins, losses };
}
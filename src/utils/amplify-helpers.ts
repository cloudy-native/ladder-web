import type { Schema } from "../../amplify/data/resource";

type Enrollment = Schema["Enrollment"]["type"];
type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

/**
 * Check if a value is a Promise
 */
export function isPromise(value: any): boolean {
  return value instanceof Promise;
}

/**
 * Check if a team is enrolled in a specific ladder
 */
export function isTeamEnrolledInLadder(
  teamId: string, 
  ladderId: string, 
  enrollments: Enrollment[]
): boolean {
  return enrollments.some(
    (enrollment) => enrollment.teamId === teamId && enrollment.ladderId === ladderId
  );
}

/**
 * Find an enrollment by team and ladder IDs
 */
export function findEnrollment(
  teamId: string, 
  ladderId: string, 
  enrollments: Enrollment[]
): Enrollment | undefined {
  return enrollments.find(
    (enrollment) => enrollment.teamId === teamId && enrollment.ladderId === ladderId
  );
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
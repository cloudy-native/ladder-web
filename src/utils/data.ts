import { Player } from "./amplify-helpers";

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

export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function filterNotNull<T>(value: (T | null)[]): T[] {
  return value.filter((v) => v !== null);
}

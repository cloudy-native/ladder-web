import { Player } from "./amplify-helpers";

/**
 * Formats a list of players into a comma-separated string of their full names.  Handles cases where the `players` array is null, undefined, or empty.
 * @param players - An array of Player objects.
 * @returns A string containing the formatted player names, or "—" if no players are provided.
 */
export function formatPlayers(players?: Player[]): string {
  if (!players || players.length === 0) {
    return "—"; // Return "—" if no players or an empty array is provided
  }

  return players.map(formatPlayerName).join(", "); // Join the names with commas
}

/**
 * Formats a player's full name from a Player object. Handles cases where `givenName` or `familyName` might be missing (though this shouldn't happen with a properly structured Player object).
 * @param player - A Player object.
 * @returns A string containing the player's full name.
 */
export function formatPlayerName(player: Player): string {
  // Handle potential missing names (though this shouldn't happen ideally)
  const givenName = player.givenName || "";
  const familyName = player.familyName || "";
  return `${givenName} ${familyName}`.trim(); // Trim any extra whitespace
}

/**
 * Type guard to check if a value is a Promise.
 * @param value - The value to check.
 * @returns `true` if the value is a Promise, `false` otherwise.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

/**
 * Filters an array to remove null values.
 * @param value - An array containing potentially null values.
 * @returns A new array containing only the non-null values from the input array.
 */
export function filterNotNull<T>(value: (T | null)[]): T[] {
  return value.filter((v) => v !== null) as T[]; // Type assertion is safe because filter ensures only T values remain
}

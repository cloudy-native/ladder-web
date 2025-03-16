export enum MatchResult {
  Win = 1,
  Loss = 0,
  Draw = 0.5,
}

/**
 * Calculates the expected score of player A against player B in an Elo rating system.
 *
 * @param ratingA - The Elo rating of player A.
 * @param ratingB - The Elo rating of player B.
 * @returns The expected score of player A (a value between 0 and 1).
 */
export function calculateExpectedScore(
  ratingA: number,
  ratingB: number
): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculates the new Elo ratings for two players after a match.
 *
 * @param ratingA - The current Elo rating of player A.
 * @param ratingB - The current Elo rating of player B.
 * @param scoreA - The score of player A (1 for a win, 0 for a loss, 0.5 for a draw).
 * @param K - The K-factor, which determines the sensitivity of the rating change.
 * @returns An object containing the new ratings for player A and player B.
 */
export function calculateNewRatings(
  ratingA: number,
  ratingB: number,
  result: MatchResult,
  K: number = 32
): { newRatingA: number; newRatingB: number } {
  const expectedA = calculateExpectedScore(ratingA, ratingB);
  const expectedB = calculateExpectedScore(ratingB, ratingA);

  const newRatingA = Math.round(ratingA + K * (result - expectedA));
  const newRatingB = Math.round(ratingB + K * (1 - result - expectedB));

  return { newRatingA, newRatingB };
}

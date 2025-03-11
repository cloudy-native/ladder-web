/**
 * Generate a random rating with a bell curve distribution
 * @returns Rating between 1000 and 1600
 */
export function getRandomRating() {
  // Sum multiple random numbers for a more normal distribution
  const baseRating = 1300;
  const deviation = 150;
  return Math.floor(baseRating + (Math.random() + Math.random() + Math.random() - 1.5) * deviation);
}

/**
 * Calculate Elo rating change for a match
 * @param winnerRating Current rating of the winning player/team
 * @param loserRating Current rating of the losing player/team
 * @param kFactor How much ratings can change (higher = more volatile)
 * @returns Object with new ratings for both winner and loser
 */
export function calculateEloRatingChange(winnerRating: number, loserRating: number, kFactor = 32) {
  // Calculate expected outcome
  const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  const expectedLoser = 1 - expectedWinner;
  
  // Calculate actual outcome (1 for winner, 0 for loser)
  const actualWinner = 1;
  const actualLoser = 0;
  
  // Calculate rating changes
  const winnerChange = Math.round(kFactor * (actualWinner - expectedWinner));
  const loserChange = Math.round(kFactor * (actualLoser - expectedLoser));
  
  return {
    newWinnerRating: winnerRating + winnerChange,
    newLoserRating: loserRating + loserChange,
    winnerChange,
    loserChange
  };
}

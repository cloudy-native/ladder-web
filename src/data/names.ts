import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];

// TODO: handle errors
//
export async function getCurrentPlayer() {
  try {
    const { sub: userId } = await fetchUserAttributes();

    if (!userId) {
      console.error("Cannot get user sub attribute");
      return null;
    }

    const { data: currentPlayer, errors } = await client.models.Player.get({
      id: userId
    });
    
    if (errors) {
      console.error("Error fetching current player:", errors);
      return null;
    }
    
    // If player doesn't exist, return null
    if (!currentPlayer) {
      return null;
    }
    
    // Fetch the related team data
    // Get teams where this player is player1
    const player1TeamsResult = await client.models.Team.list({
      filter: { player1Id: { eq: userId } },
      selectionSet: ["id", "name", "rating", "ladderId"]
    });
    
    // Get teams where this player is player2
    const player2TeamsResult = await client.models.Team.list({
      filter: { player2Id: { eq: userId } },
      selectionSet: ["id", "name", "rating", "ladderId"]
    });
    
    // Create an enhanced player object with team relationships
    return {
      ...currentPlayer,
      teamAsPlayer1: player1TeamsResult.data || [],
      teamAsPlayer2: player2TeamsResult.data || []
    };
  } catch (error) {
    console.error("Error in getCurrentPlayer:", error);
    return null;
  }
}

export async function createCurrentPlayerIfMissing() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.error("Cannot get current user");
      return null;
    }

    const userAttributes = await fetchUserAttributes();
    const { sub: userId } = userAttributes;

    if (!userId) {
      console.error("Cannot get user sub", userAttributes);
      return null;
    }

    // Try to find an existing player for this userId
    const { data: existingPlayer, errors: getPlayerErrors } =
      await client.models.Player.get({ id: userId });

    if (getPlayerErrors) {
      console.error("Error fetching player:", getPlayerErrors);
      return null;
    }

    if (existingPlayer) {
      return existingPlayer;
    }

    console.log("Creating new player for user:", userAttributes);

    const { data: createdPlayer, errors: createPlayerErrors } =
      await client.models.Player.create({
        id: userId,
        givenName: userAttributes.given_name || "unknown",
        familyName: userAttributes.family_name || "unknown",
        email: userAttributes.email || "unknown",
      });

    if (createPlayerErrors) {
      console.error("Error creating player:", createPlayerErrors);
      return null;
    }

    console.log("Successfully created player:", createdPlayer);

    return createdPlayer;
  } catch (error) {
    console.error("Unexpected error in getCurrentPlayer:", error);

    return null;
  }
}

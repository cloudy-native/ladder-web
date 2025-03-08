import { generateClient } from "aws-amplify/api";
import { fetchUserAttributes, getCurrentUser } from "aws-amplify/auth";
import { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];

// TODO: handle errors
//
export async function getCurrentPlayer() {
  const { sub: userId } = await fetchUserAttributes();

  if (!userId) {
    console.error("Cannot get user sub attribute");

    return null;
  }

  const { data: currentPlayer, errors } = await client.models.Player.get({
    id: userId,
  });

  return currentPlayer
}

export async function createCurrentPlayerIfMissing() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.error("Cannot get current user");
      return null;
    }

    const userAttributes = await fetchUserAttributes();
    const {
      sub: userId,
      given_name: givenName,
      family_name: familyName,
      email,
    } = userAttributes;

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
        givenName,
        familyName,
        email,
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

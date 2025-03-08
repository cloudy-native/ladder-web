import { Hub } from "aws-amplify/utils";
import { createCurrentPlayerIfMissing } from "../data";

type HandlerFunction = (data: any) => Promise<void>;

// The call to createCurrentPlayerIfMissing creates a player for the current user the very first time they log in
//
async function handleSignIn(data: any) {
  try {
    const player = await createCurrentPlayerIfMissing();

    console.log("Current player:", player);
  } catch (error) {
    console.error("Error getting current player:", error);
  }
}
async function handleSignOut(data: any) {
  console.log("User signed out:", data);
}

const handlers: { [key: string]: HandlerFunction } = {
  signedIn: handleSignIn,
  signedOut: handleSignOut,
};

export default function authListeners() {
  Hub.listen("auth", async (data) => {
    console.log("Auth event: ", data);

    const {
      payload: { event },
    } = data;

    await handlers[event]?.(data);
  });
}

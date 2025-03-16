"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

/**
 * Type definition for the Amplify client.  This is inferred from the Amplify schema.
 */
type AmplifyClient = ReturnType<typeof generateClient<Schema>>;

/**
 * A singleton instance of the Amplify DataStore client.  This ensures that only one client is created, preventing potential conflicts and improving performance.
 */
let clientInstance: AmplifyClient | null = null;

/**
 * A flag to indicate whether the Amplify client has been successfully initialized.
 */
let clientInitialized = false;

/**
 * Retrieves the Amplify DataStore client instance.  Creates the client if it doesn't already exist.  Handles errors during client creation.
 * @returns The Amplify DataStore client instance.
 * @throws An error if the client cannot be created.  Provides detailed error information.
 */
export function getClient(): AmplifyClient {
  if (!clientInstance) {
    try {
      console.log("Creating Amplify client instance...");
      clientInstance = generateClient<Schema>();
      clientInitialized = true;
      console.log("Amplify client created successfully.");
    } catch (error) {
      console.error("Error generating Amplify client:", error);
      // More detailed error information
      if (error instanceof Error) {
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      }
      throw new Error(
        "Failed to initialize Amplify client. Make sure Amplify is configured properly before using data methods."
      );
    }
  }
  return clientInstance;
}

/**
 * Returns a client for interacting with the `Ladder` model in the Amplify DataStore.
 * @returns The Amplify DataStore client for the `Ladder` model.
 */
export function ladderClient() {
  return getClient().models.Ladder;
}

/**
 * Returns a client for interacting with the `Match` model in the Amplify DataStore.
 * @returns The Amplify DataStore client for the `Match` model.
 */
export function matchClient() {
  return getClient().models.Match;
}

/**
 * Returns a client for interacting with the `Player` model in the Amplify DataStore.
 * @returns The Amplify DataStore client for the `Player` model.
 */
export function playerClient() {
  return getClient().models.Player;
}

/**
 * Returns a client for interacting with the `Team` model in the Amplify DataStore.
 * @returns The Amplify DataStore client for the `Team` model.
 */
export function teamClient() {
  return getClient().models.Team;
}

/**
 * Type definition for the `Ladder` model.  This is inferred from the Amplify schema.
 */
export type Ladder = Schema["Ladder"]["type"];

/**
 * Type definition for the `Match` model.  This is inferred from the Amplify schema.
 */
export type Match = Schema["Match"]["type"];

/**
 * Type definition for the `Player` model.  This is inferred from the Amplify schema.
 */
export type Player = Schema["Player"]["type"];

/**
 * Type definition for the `Team` model.  This is inferred from the Amplify schema.
 */
export type Team = Schema["Team"]["type"];

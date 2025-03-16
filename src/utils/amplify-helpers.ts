"use client";

import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

// Use a singleton pattern to ensure we only create one client
let clientInstance: ReturnType<typeof generateClient<Schema>> | null = null;
let clientInitialized = false;

// Encapsulate client
//
export function getClient() {
  if (!clientInstance) {
    try {
      console.log("Creating Amplify client instance");
      clientInstance = generateClient<Schema>();
      clientInitialized = true;
      console.log("Amplify client created successfully", clientInstance);
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
  } else if (clientInitialized) {
    // Skip logging on subsequent calls to avoid flooding console
  }

  return clientInstance;
}

export function ladderClient() {
  return getClient().models.Ladder;
}

export function matchClient() {
  return getClient().models.Match;
}

export function playerClient() {
  return getClient().models.Player;
}

export function teamClient() {
  return getClient().models.Team;
}

export type Ladder = Schema["Ladder"]["type"];
export type Match = Schema["Match"]["type"];
export type Player = Schema["Player"]["type"];
export type Team = Schema["Team"]["type"];

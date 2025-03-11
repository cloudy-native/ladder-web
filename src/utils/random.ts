"use client";

import { Player } from "./amplify-helpers";

interface NameObject {
  givenName: string;
  familyName: string;
}

export function randomName(): NameObject {
  const givenNames: string[] = [
    "Alice",
    "Benjamin",
    "Charlotte",
    "David",
    "Emma",
    "Frederick",
    "Grace",
    "Henry",
    "Isabella",
    "Jacob",
  ];

  const familyNames: string[] = [
    "Anderson",
    "Brown",
    "Chen",
    "Davis",
    "Evans",
    "Foster",
    "Garcia",
    "Huang",
    "Ivanov",
    "Johnson",
  ];

  // Get random indices for given name and family name
  const randomGivenNameIndex = Math.floor(Math.random() * givenNames.length);
  const randomFamilyNameIndex = Math.floor(Math.random() * familyNames.length);

  // Return the randomly selected name as an object
  return {
    givenName: givenNames[randomGivenNameIndex],
    familyName: familyNames[randomFamilyNameIndex],
  };
}

export function nameFor(player: Player) {
  return `${player.givenName} ${player.familyName}`;
}

// Assume < max possible
//
export function uniqueRandomNames(count: number): NameObject[] {
  const result: NameObject[] = [];
  const usedCombinations = new Set<string>();

  while (result.length < count) {
    const name = randomName();
    const combinationKey = JSON.stringify(name);

    if (!usedCombinations.has(combinationKey)) {
      usedCombinations.add(combinationKey);

      result.push(name);
    }
  }

  return result;
}

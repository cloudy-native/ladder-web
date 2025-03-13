import { faker } from "@faker-js/faker";
import * as changeCase from "change-case";
import { Player } from "./amplify-helpers";

export function getRandomElement<T>(array: T[]): T {
  if (array.length === 0) {
    throw new Error("Cannot get a random element from an empty array.");
  }
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
}

export function randomLadderName() {
  return changeCase.capitalCase(`${faker.commerce.productAdjective()} Ladder`);
}

export function randomLadderDescription() {
  return faker.lorem.sentence(20);
}

export function randomTeamName() {
  return changeCase.capitalCase(
    `${faker.food.adjective()} ${faker.food.dish()}`
  );
}

export function randomFirstName() {
  return faker.person.firstName();
}

export function randomLastName() {
  return faker.person.lastName();
}

export function randomEmail(firstName: string, lastName: string) {
  return faker.internet.email({ firstName, lastName }).toLowerCase();
}

export function randomAvatar() {
  return faker.image.avatar();
}

export function randomRating(min: number, max: number) {
  return faker.number.int({ min, max });
}

export function randomRecentDate(days: number) {
  return faker.date.recent({ days });
}

export function nameFor(player: Player) {
  return `${player.givenName} ${player.familyName}`;
}

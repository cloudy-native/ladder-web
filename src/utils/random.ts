import { faker } from "@faker-js/faker";
import * as changeCase from "change-case";

/**
 * Generates a random index within the bounds of a given array.  Throws an error if the array is empty.
 * @param array - The array to get a random index from.
 * @returns A random index within the array's bounds.
 * @throws An error if the input array is empty.
 */
export function randomIndex<T>(array: T[]): number {
  if (array.length === 0) {
    throw new Error("Cannot get a random index from an empty array.");
  }

  return Math.floor(Math.random() * array.length);
}

/**
 * Selects a random element from an array.  Throws an error if the array is empty.
 * @param array - The array to select from.
 * @returns A randomly selected element from the array.
 * @throws An error if the input array is empty.
 */
export function randomElement<T>(array: T[]): T {
  return array[randomIndex(array)];
}

/**
 * Generates a random ladder name using Faker.js.
 * @returns A randomly generated ladder name (e.g., "Elegant Ladder").
 */
export function randomLadderName() {
  return changeCase.capitalCase(`${faker.commerce.productAdjective()} Ladder`);
}

/**
 * Generates a random ladder description using Faker.js.
 * @returns A randomly generated ladder description (a sentence).
 */
export function randomLadderDescription() {
  return faker.lorem.sentence(20);
}

/**
 * Generates a random team name using Faker.js.
 * @returns A randomly generated team name (e.g., "Jazz Panda").
 */
export function randomTeamName() {
  return changeCase.capitalCase(
    `${faker.music.genre()} ${faker.animal.petName()}`
  );
}

/**
 * Generates a random first name using Faker.js.
 * @returns A randomly generated first name.
 */
export function randomFirstName() {
  return faker.person.firstName();
}

/**
 * Generates a random last name using Faker.js.
 * @returns A randomly generated last name.
 */
export function randomLastName() {
  return faker.person.lastName();
}

/**
 * Generates a random email address using Faker.js, based on provided first and last names.
 * @param firstName - The first name to use in the email address.
 * @param lastName - The last name to use in the email address.
 * @returns A randomly generated email address.
 */
export function randomEmail(firstName: string, lastName: string) {
  return faker.internet.email({ firstName, lastName }).toLowerCase();
}

/**
 * Generates a random avatar URL using Faker.js.
 * @returns A randomly generated avatar URL.
 */
export function randomAvatar() {
  return faker.image.avatar();
}

/**
 * Generates a random integer rating within a specified range.
 * @param min - The minimum value of the rating (inclusive).
 * @param max - The maximum value of the rating (inclusive).
 * @returns A randomly generated integer rating within the specified range.
 */
export function randomRating(min: number, max: number) {
  return faker.number.int({ min, max });
}

/**
 * Generates a random date in the recent past.
 * @param days - The maximum number of days in the past to generate a date from.
 * @returns A randomly generated Date object in the recent past.
 */
export function randomRecentDate(days: number) {
  return faker.date.recent({ days });
}

import { Player } from "../amplify-helpers";
import {
  nameFor,
  randomAvatar,
  randomEmail,
  randomFirstName,
  randomLadderDescription,
  randomLadderName,
  randomLastName,
  randomRating,
  randomRecentDate,
  randomTeamName,
} from "../random";

describe("random utility functions", () => {
  describe("randomFirstName", () => {
    it("should return a non-empty string", () => {
      const name = randomFirstName();
      expect(name).toBeTruthy(); // Check if the string is not empty or null
      expect(typeof name).toBe("string");
    });
  });

  describe("randomLastName", () => {
    it("should return a non-empty string", () => {
      const name = randomLastName();
      expect(name).toBeTruthy();
      expect(typeof name).toBe("string");
    });
  });

  describe("randomEmail", () => {
    it("should return an email containing first and last name", () => {
      const firstName = "Test";
      const lastName = "User";
      const email = randomEmail(firstName, lastName);
      expect(email).toContain(firstName.toLowerCase());
      expect(email).toContain(lastName.toLowerCase());
      expect(email).toContain("@");
      expect(email).toContain(".");
      expect(typeof email).toBe("string");
    });
  });

  describe("randomAvatar", () => {
    it("should return a non-empty string", () => {
      const avatarUrl = randomAvatar();
      expect(avatarUrl).toBeTruthy();
      expect(typeof avatarUrl).toBe("string");
    });
  });

  describe("randomLadderName", () => {
    it("should return a non-empty string", () => {
      const ladderName = randomLadderName();
      expect(ladderName).toBeTruthy();
      expect(typeof ladderName).toBe("string");
    });
  });

  describe("randomLadderDescription", () => {
    it("should return a non-empty string", () => {
      const description = randomLadderDescription();
      expect(description).toBeTruthy();
      expect(typeof description).toBe("string");
    });
  });

  describe("randomTeamName", () => {
    it("should return a non-empty string", () => {
      const teamName = randomTeamName();
      expect(teamName).toBeTruthy();
      expect(typeof teamName).toBe("string");
    });
  });

  describe("randomRecentDate", () => {
    it("should return a date within the specified number of days", () => {
      const days = 30;
      const recentDate = randomRecentDate(days);
      const now = new Date();
      const pastDate = new Date(now);
      pastDate.setDate(now.getDate() - days);

      expect(recentDate).toBeInstanceOf(Date);
      expect(recentDate.getTime()).toBeLessThanOrEqual(now.getTime());
      expect(recentDate.getTime()).toBeGreaterThanOrEqual(pastDate.getTime());
    });
  });

  describe("randomRating", () => {
    it("should return a number within the specified range", () => {
      const min = 1000;
      const max = 2000;
      const rating = randomRating(min, max);

      expect(typeof rating).toBe("number");
      expect(rating).toBeGreaterThanOrEqual(min);
      expect(rating).toBeLessThanOrEqual(max);
    });
  });

  describe("nameFor", () => {
    it("should return the correct name for a player", () => {
      const player: Partial<Player> = {
        id: "123",
        givenName: "John",
        familyName: "Doe",
        email: "john.doe@example.com",
        avatar: "url",
      };
      expect(nameFor(player)).toBe("John Doe");
    });

    it("should return Unknown Player if givenName or familyName is missing", () => {
      const playerWithoutGivenName: Partial<Player> = {
        id: "123",
        familyName: "Doe",
      };
      const playerWithoutFamilyName: Partial<Player> = {
        id: "123",
        givenName: "John",
      };

      expect(nameFor(playerWithoutGivenName as Player)).toBe("Unknown Player");
      expect(nameFor(playerWithoutFamilyName as Player)).toBe("Unknown Player");
    });
  });
});

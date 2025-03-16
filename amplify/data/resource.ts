import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
 *
 *                                      +-------+
 *                                      | Ladder|
 *                                      +-------+
 *                                          |
 *                                          | 1..n
 *                                          v
 *          +-----------------+      +-----------------+      +-----------------+
 *          |       Team      |------|       Team      |------|       Team      |
 *          +-----------------+      +-----------------+      +-----------------+
 *              |       |              |       |              |       |
 *              | 1..1  |              | 1..1  |              | 1..1  |
 *              v       v              v       v              v       v
 *     +---------+---------+    +---------+---------+    +---------+---------+
 *     |  Player |  Player |    |  Player |  Player |    |  Player |  Player |
 *     +---------+---------+    +---------+---------+    +---------+---------+
 *              ^       ^              ^       ^              ^       ^
 *              | 1..1  |              | 1..1  |              | 1..1  |
 *              |       |              |       |              |       |
 *          +-----------------+      +-----------------+      +-----------------+
 *          |       Match     |      |       Match     |      |       Match     |
 *          +-----------------+      +-----------------+      +-----------------+
 *
 */

/**
 * Data model schema for the ladder application.  Defines the relationships between Ladders, Teams, Players, and Matches.
 */
const schema = a
  .schema({
    /**
     * A Ladder has many Teams and Matches.
     */
    Ladder: a.model({
      name: a.string().required(), // Name of the ladder
      description: a.string(), // Description of the ladder
      teams: a.hasMany("Team", "ladderId"), // Teams associated with this ladder
      matches: a.hasMany("Match", "ladderId"), // Matches played on this ladder
    }),

    /**
     * A Team belongs to a Ladder and has two Player slots (player1 and player2).  A Team can be the winner of many Matches.
     */
    Team: a.model({
      name: a.string().required(), // Name of the team
      ladderId: a.id(), // ID of the ladder this team belongs to
      ladder: a.belongsTo("Ladder", "ladderId"), // Relationship to the Ladder model
      player1Id: a.id(), // ID of the first player
      player1: a.belongsTo("Player", "player1Id"), // Relationship to the Player model
      player2Id: a.id(), // ID of the second player
      player2: a.belongsTo("Player", "player2Id"), // Relationship to the Player model
      rating: a.integer().default(1200).required(), // Team's rating
      matchesAsTeam1: a.hasMany("Match", "team1Id"), // Matches where this team is team1
      matchesAsTeam2: a.hasMany("Match", "team2Id"), // Matches where this team is team2
      matchesAsWinner: a.hasMany("Match", "winnerId"), // Matches where this team is the winner
    }),

    /**
     * A Player can be in at most one Team (as either player1 or player2).
     */
    Player: a.model({
      givenName: a.string().required(), // Player's given name
      familyName: a.string().required(), // Player's family name
      email: a.email().required(), // Player's email address
      phone: a.phone(), // Player's phone number (optional)
      avatar: a.url(), // URL of the player's avatar (optional)
      teamAsPlayer1: a.hasOne("Team", "player1Id"), // Team where this player is player1 (one-to-one)
      teamAsPlayer2: a.hasOne("Team", "player2Id"), // Team where this player is player2 (one-to-one)
    }),

    /**
     * A Match belongs to a Ladder and has two Teams (team1 and team2).  A Match can have a winner (which is a Team).
     */
    Match: a.model({
      ladderId: a.id().required(), // ID of the ladder this match belongs to
      ladder: a.belongsTo("Ladder", "ladderId"), // Relationship to the Ladder model
      team1Id: a.id().required(), // ID of the first team
      team1: a.belongsTo("Team", "team1Id"), // Relationship to the Team model
      team2Id: a.id().required(), // ID of the second team
      team2: a.belongsTo("Team", "team2Id"), // Relationship to the Team model
      winnerId: a.id(), // ID of the winning team (optional)
      winner: a.belongsTo("Team", "winnerId"), // Relationship to the Team model
      playedOn: a.string(), // Date and time the match was played
    }),
  })
  .authorization((allow) => [allow.guest(), allow.authenticated()]);

/**
 * Type definition for the generated Amplify client schema.
 */
export type Schema = ClientSchema<typeof schema>;

/**
 * Defines the data model for the Amplify backend.
 */
export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

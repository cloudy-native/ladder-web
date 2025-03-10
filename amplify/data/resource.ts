import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
  +------------+          +-----------+
  |   Ladder   |          |   Team    |
  +------------+          +-----------+
  | name       |          | name      |
  | description|          | ladderId  | (1:1)
  +------------+          | player1Id | (1:1)
        |                 | player2Id | (1:1)
        |                 +-----------+
        |                      |
        +-1------many----------+
                              / \
                             /   \
                            /     \
               +-----------+       +-----------+
               |  Player1  |       |  Player2  |
               +-----------+       +-----------+
               | givenName |       | givenName |
               | familyName|       | familyName|
               | email     |       | email     |
               +-----------+       +-----------+
 */

const schema = a.schema({
  /* A ladder has many teams. */
  Ladder: a
    .model({
      name: a.string().required(),
      description: a.string(),
      teams: a.hasMany("Team", "ladderId"), 
      matches: a.hasMany("Match", "ladderId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* A team can only be on one ladder and has exactly 2 player slots. */
  Team: a
    .model({
      name: a.string().required(),
      ladderId: a.id(), 
      ladder: a.belongsTo("Ladder", "ladderId"),
      player1Id: a.id(), 
      player1: a.belongsTo("Player", "player1Id"),
      player2Id: a.id(), 
      player2: a.belongsTo("Player", "player2Id"),
      rating: a.integer().default(1200).required(),
      team1: a.hasMany("Match", "team1Id"),
      team2: a.hasMany("Match", "team2Id"),
      winner: a.hasMany("Match", "winnerId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* A player can only be in one team (as player1 or player2) */
  Player: a
    .model({
      givenName: a.string().required(),
      familyName: a.string().required(),
      email: a.email().required(),
      teamAsPlayer1: a.hasOne("Team", "player1Id"),
      teamAsPlayer2: a.hasOne("Team", "player2Id"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* A Match belongs to a ladder, and has 2 teams */
  Match: a
    .model({
      ladderId: a.id().required(),
      ladder: a.belongsTo("Ladder", "ladderId"),
      team1Id: a.id().required(),
      team1: a.belongsTo("Team", "team1Id"),
      team2Id: a.id().required(),
      team2: a.belongsTo("Team", "team2Id"),
      winnerId: a.id(),
      winner: a.belongsTo("Team", "winnerId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "userPool",
  },
});

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

/**
  +------------+       +-------------+       +-----------+
  |   Ladder   |       | Enrollment  |       |   Team    |
  +------------+       +-------------+       +-----------+
  | name       |       | ladderId    |       | name      |
  | description|       | teamId      |       |           |
  +------------+       +-------------+       +-----------+
        |                 |       |                |
        |                 |       |                |
        |                 |       |                |
        +-1------many-----+       +-----many--1---+
                                                   |
                                                   |
                                                   |
                                            +------+------+
                                            |   Player    |
                                            +-------------+
                                            | givenName   |
                                            | familyName  |
                                            | email       |
                                            | teamId      |
                                            +-------------+
 */

const schema = a.schema({
  /* A ladder has many enrollments. */
  Ladder: a
    .model({
      name: a.string().required(),
      description: a.string(),
      enrollments: a.hasMany("Enrollment", "ladderId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* A team can be enrolled in more than one ladder. And can have any number of players, which we enforce to max 2 in code. */
  Team: a
    .model({
      name: a.string().required(),
      enrollments: a.hasMany("Enrollment", "teamId"),
      players: a.hasMany("Player", "teamId"),
      rating: a.integer().default(1200).required(),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* A player may belong to more than one team (but we can enforce exactly 0 or 1 in code)*/
  Player: a
    .model({
      givenName: a.string().required(),
      familyName: a.string().required(),
      email: a.email().required(),
      teamId: a.id(),
      teams: a.belongsTo("Team", "teamId"),
      // rating field removed
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  /* An enrollment belongs to exactly one ladder and one team. */
  Enrollment: a
    .model({
      ladderId: a.id().required(),
      ladder: a.belongsTo("Ladder", "ladderId"),
      teamId: a.id().required(),
      team: a.belongsTo("Team", "teamId"),
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

import { type ClientSchema, a, defineData } from "@aws-amplify/backend";

const schema = a.schema({
  Ladder: a
    .model({
      name: a.string(),
      description: a.string(),
      enrolment: a.hasMany("Enrolment", "ladderId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  Enrolment: a
    .model({
      ladderId: a.id(),
      ladder: a.belongsTo("Ladder", "ladderId"),
      teamId: a.id(),
      team: a.belongsTo("Team", "teamId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  Team: a
    .model({
      name: a.string(),
      enrolments: a.hasMany("Enrolment", "teamId"),
      // Limit to 2 in code
      //
      players: a.hasMany("Player", "teamId"),
    })
    .authorization((allow) => [allow.guest(), allow.authenticated()]),

  Player: a
    .model({
      // Cognito ID
      userId: a.string(),
      name: a.string(),
      teamId: a.id(),
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

// src/utils/data-generators.ts
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { uniqueRandomNames } from "./random";

const client = generateClient<Schema>();

type Enrollment = Schema["Enrollment"]["type"];
type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

/**
 * Combinations of players, ladders, teams, enrollments.
 *
 * Ignores all errors and nulls
 */
export async function addSampleEntities() {
  console.log("Making sample data");

  const samplePlayers: Player[] = [];
  const sampleLadders: Ladder[] = [];
  const sampleTeams: Team[] = [];
  const sampleEnrollments: Enrollment[] = [];

  {
    const created = uniqueRandomNames(5).map(async (name) => {
      const { data } = await client.models.Player.create({
        email: `${name.givenName}@example.com`,
        ...name,
      });

      console.log("Add Player", data);

      samplePlayers.push(data!);
    });

    await Promise.all(created);
  }

  {
    const created = ["Premier", "Kid's"].map(async (name) => {
      const { data } = await client.models.Ladder.create({
        name: `${name} ladder`,
        description: `Description for ${name} ladder`,
      });

      console.log("Add Ladder", data);

      sampleLadders.push(data!);
    });

    await Promise.all(created);
  }

  {
    // Function to generate a random rating
    function getRandomRating() {
      return Math.floor(Math.random() * 400) + 1000; // Random rating between 1000 and 1400
    }

    const { data: team1 } = await client.models.Team.create({
      name: "The Limeys",
      rating: getRandomRating(),
    });

    console.log("Add Team", team1);

    sampleTeams.push(team1!);

    const { data: team2 } = await client.models.Team.create({
      name: "The Yanks",
      rating: getRandomRating(),
    });

    console.log("Add Team", team1);

    sampleTeams.push(team2!);

    const { data: player1 } = await client.models.Player.update({
      id: samplePlayers[0].id,
      teamId: team1?.id,
    });

    const { data: player2 } = await client.models.Player.update({
      id: samplePlayers[1].id,
      teamId: team1?.id,
    });

    const { data: player3 } = await client.models.Player.update({
      id: samplePlayers[2].id,
      teamId: team2?.id,
    });

    const { data: player4 } = await client.models.Player.update({
      id: samplePlayers[3].id,
      teamId: team2?.id,
    });

    await Promise.all([player1, player2, player3, player4]);
  }

  {
    const { data: enrollment1 } = await client.models.Enrollment.create({
      ladderId: sampleLadders[0].id,
      teamId: sampleTeams[0].id,
    });

    console.log("Add Enrollment", enrollment1);


    sampleEnrollments.push(enrollment1!);

    const { data: enrollment2 } = await client.models.Enrollment.create({
      ladderId: sampleLadders[0].id,
      teamId: sampleTeams[1].id,
    });

    console.log("Add Enrollment", enrollment2);

    sampleEnrollments.push(enrollment2!);

    await Promise.all([enrollment1, enrollment2]);
  }
}

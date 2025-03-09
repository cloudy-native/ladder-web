import {
  Box,
  Button,
  ButtonGroup,
  Card,
  Flex,
  Heading,
  Spacer,
  Table,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoBeaker, IoRefresh, IoTrash } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";
import { deleteAllItems } from "../../utils/data-fetchers";
import { nameFor, uniqueRandomNames } from "../../utils/random";
import { RelationCell } from "../shared/RelationCell";

const client = generateClient<Schema>();

type Enrollment = Schema["Enrollment"]["type"];
type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

export function AdminTab() {
  const [isLoading, setIsLoading] = useState({
    enrollments: false,
    ladders: false,
    players: false,
    teams: false,
  });

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  /**
   * Combinations of players, ladders, teams, enrollments.
   *
   * Ignores all errors and nulls
   */
  async function addSampleEntities() {
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
          // Rating removed
        });

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

      sampleTeams.push(team1!);

      const { data: team2 } = await client.models.Team.create({
        name: "The Yanks",
        rating: getRandomRating(),
      });

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

      sampleEnrollments.push(enrollment1!);

      const { data: enrollment2 } = await client.models.Enrollment.create({
        ladderId: sampleLadders[0].id,
        teamId: sampleTeams[1].id,
      });

      sampleEnrollments.push(enrollment2!);

      await Promise.all([enrollment1, enrollment2]);
    }

    await getAll();

    console.log("Sample entities added successfully");
  }

  async function getEnrollments() {
    try {
      const { data, errors } = await client.models.Enrollment.list();

      if (errors) {
        console.error("Enrollment list errors:", errors);
        // Don't throw here, just log and recover
        console.warn(
          "Continuing with available enrollment data despite errors"
        );
        const validEnrollments =
          data?.filter((enrollment) => enrollment !== null) || [];
        setEnrollments(validEnrollments);
        return;
      }

      setEnrollments(data || []);
    } catch (error) {
      console.error("Exception in getEnrollments:", error);
      setEnrollments([]);
      // Don't rethrow to prevent crashing the entire app
      console.warn("Recovering from enrollment fetch error");
    }
  }

  async function getLadders() {
    try {
      const { data, errors } = await client.models.Ladder.list();

      if (errors) {
        console.error("Ladder list errors:", errors);
        // Don't throw here, just log and recover
        console.warn("Continuing with available ladder data despite errors");
        const validLadders = data?.filter((ladder) => ladder !== null) || [];
        setLadders(validLadders);
        return;
      }

      setLadders(data || []);
    } catch (error) {
      console.error("Exception in getLadders:", error);
      setLadders([]);
      // Don't rethrow to prevent crashing the entire app
      console.warn("Recovering from ladder fetch error");
    }
  }

  async function getPlayers() {
    try {
      const { data, errors } = await client.models.Player.list();

      if (errors) {
        console.error("Player list errors:", errors);
        // Don't throw here, just log and recover
        console.warn("Continuing with available player data despite errors");
      }

      // Always filter the data to ensure we only work with valid player objects
      // This handles both error and non-error cases
      if (data && Array.isArray(data)) {
        const validPlayers = data.filter(
          (player) =>
            player !== null &&
            typeof player === "object" &&
            player.id &&
            player.givenName &&
            player.familyName
        );
        setPlayers(validPlayers);
      } else {
        setPlayers([]);
      }
    } catch (error) {
      console.error("Exception in getPlayers:", error);
      setPlayers([]);
      // Don't rethrow to prevent crashing the entire app
      console.warn("Recovering from player fetch error");
    }
  }

  async function getTeams() {
    try {
      const { data, errors } = await client.models.Team.list();

      if (errors) {
        console.error("Team list errors:", errors);
        // Don't throw here, just log and recover
        console.warn("Continuing with available team data despite errors");
      }

      // Always filter the data to ensure we only work with valid team objects
      // This handles both error and non-error cases
      if (data && Array.isArray(data)) {
        const validTeams = data.filter(
          (team) =>
            team !== null && typeof team === "object" && team.id && team.name
        );
        setTeams(validTeams);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error("Exception in getTeams:", error);
      // Set empty array to avoid undefined errors
      setTeams([]);
      // Don't rethrow to prevent crashing the entire app
      console.warn("Recovering from team fetch error");
    }
  }

  async function getAll() {
    // Use Promise.allSettled instead of Promise.all to prevent one failure from stopping all fetches
    const results = await Promise.allSettled([
      getEnrollments().catch((err) => {
        console.error("Error fetching enrollments:", err);
        setEnrollments([]);
      }),
      getLadders().catch((err) => {
        console.error("Error fetching ladders:", err);
        setLadders([]);
      }),
      getPlayers().catch((err) => {
        console.error("Error fetching players:", err);
        setPlayers([]);
      }),
      getTeams().catch((err) => {
        console.error("Error fetching teams:", err);
        setTeams([]);
      }),
    ]);

    // Log overall results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    console.log(`Data loading complete: ${successful}/4 successful`);

    if (successful < 4) {
      console.warn("Some data fetches failed. UI may be incomplete.");
    }
  }

  // Function to refresh data
  const refreshData = () => {
    getAll();
  };

  // Load data once on component mount
  useEffect(() => {
    refreshData();
  }, []);

  /**
   * Wrapper for the utility deleteAllItems function that handles loading state
   */
  async function deleteAllItemsWithLoading<T extends { id: string }>({
    items,
    modelName,
    entityType,
    refreshFunction,
  }: {
    items: T[];
    modelName: keyof typeof client.models;
    entityType: keyof typeof isLoading;
    refreshFunction: () => Promise<void>;
  }) {
    // Set loading state for this entity type
    setIsLoading((prev) => ({ ...prev, [entityType]: true }));

    try {
      // Use the utility function
      await deleteAllItems({ items, modelName });
    } catch (error) {
      console.error(`Error deleting ${String(modelName)}s:`, error);
    } finally {
      // Reset loading state
      setIsLoading((prev) => ({ ...prev, [entityType]: false }));
      // Refresh the list
      await refreshFunction();
    }
  }

  // Simplified delete functions using the wrapped deleteAllItems function
  const deleteAllEnrollments = () =>
    deleteAllItemsWithLoading({
      items: enrollments,
      modelName: "Enrollment",
      entityType: "enrollments",
      refreshFunction: getEnrollments,
    });

  const deleteAllLadders = () =>
    deleteAllItemsWithLoading({
      items: ladders,
      modelName: "Ladder",
      entityType: "ladders",
      refreshFunction: getLadders,
    });

  const deleteAllPlayers = () =>
    deleteAllItemsWithLoading({
      items: players,
      modelName: "Player",
      entityType: "players",
      refreshFunction: getPlayers,
    });

  const deleteAllTeams = () =>
    deleteAllItemsWithLoading({
      items: teams,
      modelName: "Team",
      entityType: "teams",
      refreshFunction: getTeams,
    });

  async function deleteAll() {
    // Set all loading states
    setIsLoading({
      enrollments: true,
      ladders: true,
      players: true,
      teams: true,
    });

    try {
      // Run all delete operations in parallel
      await Promise.all([
        deleteAllEnrollments(),
        deleteAllLadders(),
        deleteAllPlayers(),
        deleteAllTeams(),
      ]);

      console.log("All entities successfully deleted");
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      // Ensure loading states are reset in case of error
      setIsLoading({
        enrollments: false,
        ladders: false,
        players: false,
        teams: false,
      });
    }
  }

  function TeamsForPlayerTableCell({ player }: { player: Player }) {
    // Using the generic RelationCell component
    return (
      <RelationCell<Team>
        fetchRelation={() => player.teams()}
        renderData={(team) => (team?.name ? team.name : "—")}
      />
    );
  }

  function TeamForEnrollmentTableCell({
    enrollment,
  }: {
    enrollment: Enrollment;
  }) {
    return (
      <RelationCell<Team>
        fetchRelation={() => enrollment.team()}
        renderData={(team) => (team?.name ? team.name : "—")}
      />
    );
  }

  function LadderForEnrollmentTableCell({
    enrollment,
  }: {
    enrollment: Enrollment;
  }) {
    return (
      <RelationCell<Ladder>
        fetchRelation={() => enrollment.ladder()}
        renderData={(ladder) => (ladder?.name ? ladder.name : "—")}
      />
    );
  }

  function PlayersForTeamTableCell({ team }: { team: Team }) {
    return (
      <RelationCell<Player[]>
        fetchRelation={() => team.players()}
        renderData={(players) =>
          players && players.length > 0
            ? players.map((p) => nameFor(p)).join(", ")
            : "—"
        }
      />
    );
  }

  function EnrolledTeamsForLadderTableCell({ ladder }: { ladder: Ladder }) {
    return (
      <RelationCell<Enrollment[]>
        fetchRelation={() => ladder.enrollments()}
        renderData={async (enrollments) => {
          if (!enrollments || enrollments.length === 0) return "—";

          try {
            // Use Promise.all to fetch all teams in parallel
            const teamPromises = enrollments.map(async (enrollment) => {
              const teamResult = await enrollment.team();
              return teamResult.data?.name;
            });

            const names = (await Promise.all(teamPromises)).filter(
              (name): name is string => name !== null && name !== undefined
            );

            // Use Set to remove duplicates
            return [...new Set(names)].join(", ") || "—";
          } catch (error) {
            console.error("Error fetching teams for ladder:", error);
            return "Error loading teams";
          }
        }}
      />
    );
  }

  return (
    <Box>
      <VStack align="stretch">
        <Flex align={"stretch"}>
          <Spacer />
          <ButtonGroup>
            <Button onClick={deleteAll} variant={"outline"}>
              <IoTrash /> Delete everything
            </Button>
            <Button onClick={addSampleEntities} variant={"outline"}>
              <IoBeaker /> Load sample data
            </Button>
            <Button onClick={refreshData} variant={"outline"}>
              <IoRefresh /> Refresh
            </Button>
          </ButtonGroup>
        </Flex>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Ladders</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Id</Table.ColumnHeader>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Description</Table.ColumnHeader>
                  <Table.ColumnHeader>Enrolled Teams</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ladders.map((ladder) => (
                  <Table.Row key={ladder.id}>
                    <Table.Cell>{ladder.id}</Table.Cell>
                    <Table.Cell>{ladder.name}</Table.Cell>
                    <Table.Cell>{ladder.description}</Table.Cell>
                    <EnrolledTeamsForLadderTableCell ladder={ladder} />
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer>
            <Button
              loading={isLoading.ladders}
              onClick={deleteAllLadders}
              disabled={isLoading.ladders}
              variant={"outline"}
            >
              <IoTrash />
              Delete All Ladders
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Players</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Id</Table.ColumnHeader>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Team</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {players.map((player) => (
                  <Table.Row key={player.id}>
                    <Table.Cell>{player.id}</Table.Cell>
                    <Table.Cell>
                      {player.givenName} {player.familyName}
                    </Table.Cell>
                    <TeamsForPlayerTableCell player={player} />
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer>
            <Button
              loading={isLoading.players}
              onClick={deleteAllPlayers}
              disabled={isLoading.players}
              variant={"outline"}
            >
              <IoTrash />
              Delete All Players
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Teams</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Id</Table.ColumnHeader>
                  <Table.ColumnHeader>Name</Table.ColumnHeader>
                  <Table.ColumnHeader>Players</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {teams.map((team) => (
                  <Table.Row key={team.id}>
                    <Table.Cell>{team.id}</Table.Cell>
                    <Table.Cell>{team.name}</Table.Cell>
                    <PlayersForTeamTableCell team={team} />
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer>
            <Button
              loading={isLoading.teams}
              onClick={deleteAllTeams}
              disabled={isLoading.teams}
              variant={"outline"}
            >
              <IoTrash />
              Delete All Teams
            </Button>
          </Card.Footer>
        </Card.Root>

        <Card.Root>
          <Card.Header>
            <Heading size="md">Enrollments</Heading>
          </Card.Header>
          <Card.Body>
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Id</Table.ColumnHeader>
                  <Table.ColumnHeader>Ladder</Table.ColumnHeader>
                  <Table.ColumnHeader>Team</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {enrollments.map((enrollment) => (
                  <Table.Row key={enrollment.id}>
                    <Table.Cell>{enrollment.id}</Table.Cell>
                    <LadderForEnrollmentTableCell enrollment={enrollment} />
                    <TeamForEnrollmentTableCell enrollment={enrollment} />
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          </Card.Body>
          <Card.Footer>
            <Button
              loading={isLoading.enrollments}
              onClick={deleteAllEnrollments}
              disabled={isLoading.enrollments}
              variant={"outline"}
            >
              <IoTrash />
              Delete All Enrollments
            </Button>
          </Card.Footer>
        </Card.Root>
      </VStack>
    </Box>
  );
}

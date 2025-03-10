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
import { addSampleEntities } from "../../utils/data-generators";
import { nameFor } from "../../utils/random";
import { RelationCell } from "../shared/RelationCell";
import { deleteAllItems } from "../../utils/data-fetchers";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

export function AdminTab() {
  const [isLoading, setIsLoading] = useState({
    ladders: false,
    players: false,
    teams: false,
  });

  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  async function getLadders() {
    try {
      setIsLoading((prev) => ({ ...prev, ladders: true }));
      const { data, errors } = await client.models.Ladder.list();

      if (errors) {
        console.error("Ladder list errors:", errors);
        console.warn("Continuing with available ladder data despite errors");
        const validLadders = data?.filter((ladder) => ladder !== null) || [];
        setLadders(validLadders);
        return;
      }

      setLadders(data || []);
    } catch (error) {
      console.error("Exception in getLadders:", error);
      setLadders([]);
      console.warn("Recovering from ladder fetch error");
    } finally {
      setIsLoading((prev) => ({ ...prev, ladders: false }));
    }
  }

  async function getPlayers() {
    try {
      setIsLoading((prev) => ({ ...prev, players: true }));
      const { data, errors } = await client.models.Player.list();

      if (errors) {
        console.error("Player list errors:", errors);
        console.warn("Continuing with available player data despite errors");
      }

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
      console.warn("Recovering from player fetch error");
    } finally {
      setIsLoading((prev) => ({ ...prev, players: false }));
    }
  }

  async function getTeams() {
    try {
      setIsLoading((prev) => ({ ...prev, teams: true }));
      const { data, errors } = await client.models.Team.list();

      if (errors) {
        console.error("Team list errors:", errors);
        console.warn("Continuing with available team data despite errors");
      }

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
      setTeams([]);
      console.warn("Recovering from team fetch error");
    } finally {
      setIsLoading((prev) => ({ ...prev, teams: false }));
    }
  }

  async function getAll() {
    const results = await Promise.allSettled([
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

    const successful = results.filter((r) => r.status === "fulfilled").length;
    console.log(`Data loading complete: ${successful}/3 successful`);

    if (successful < 3) {
      console.warn("Some data fetches failed. UI may be incomplete.");
    }
  }

  const refreshData = () => {
    getAll();
  };

  useEffect(() => {
    refreshData();
  }, []);

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
    setIsLoading((prev) => ({ ...prev, [entityType]: true }));

    try {
      await deleteAllItems({ items, modelName });
    } catch (error) {
      console.error(`Error deleting ${String(modelName)}s:`, error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [entityType]: false }));
      await refreshFunction();
    }
  }

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
    setIsLoading({
      ladders: true,
      players: true,
      teams: true,
    });

    try {
      await Promise.all([
        deleteAllLadders(),
        deleteAllPlayers(),
        deleteAllTeams(),
      ]);

      console.log("All entities successfully deleted");
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      setIsLoading({
        ladders: false,
        players: false,
        teams: false,
      });
    }
  }

  function TeamsForPlayerTableCell({ player }: { player: Player }) {
    return (
      <RelationCell<Team>
        fetchRelation={() => player.teams()}
        renderData={(team) => (team?.name ? team.name : "—")}
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

  function TeamsForLadderTableCell({ ladder }: { ladder: Ladder }) {
    return (
      <RelationCell<Team[]>
        fetchRelation={() => ladder.teams()}
        renderData={(teams) =>
          teams && teams.length > 0
            ? teams.map((p) => p.name).join(", ")
            : "—"
        }
      />
    );
  }

  async function sampleData() {
    await addSampleEntities();
    refreshData();
  }

  return (
    <Box>
      <VStack align="stretch">
        <Flex align={"stretch"}>
          <Spacer />
          <ButtonGroup>
            <Button onClick={deleteAll}>
              <IoTrash /> Delete everything
            </Button>
            <Button onClick={sampleData}>
              <IoBeaker /> Load sample data
            </Button>
            <Button onClick={refreshData}>
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
                  <Table.ColumnHeader>Teams</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {ladders.map((ladder) => (
                  <Table.Row key={ladder.id}>
                    <Table.Cell>{ladder.id}</Table.Cell>
                    <Table.Cell>{ladder.name}</Table.Cell>
                    <Table.Cell>{ladder.description}</Table.Cell>
                    <TeamsForLadderTableCell ladder={ladder} />
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
                  <Table.ColumnHeader>Ladder</Table.ColumnHeader>
                  <Table.ColumnHeader>Players</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {teams.map((team) => (
                  <Table.Row key={team.id}>
                    <Table.Cell>{team.id}</Table.Cell>
                    <Table.Cell>{team.name}</Table.Cell>
                    <Table.Cell>
                      <RelationCell<Ladder>
                        fetchRelation={() => team.ladder()}
                        renderData={(ladder) => (ladder?.name ? ladder.name : "—")}
                      />
                    </Table.Cell>
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
            >
              <IoTrash />
              Delete All Teams
            </Button>
          </Card.Footer>
        </Card.Root>
      </VStack>
    </Box>
  );
}

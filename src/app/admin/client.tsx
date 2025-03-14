"use client";

import { formatFriendlyDate, formatFullDate } from "@/utils/dates";
import {
  Box,
  Button,
  ButtonGroup,
  Container,
  Flex,
  Heading,
  Icon,
  Spacer,
  Spinner,
  Table,
  Text,
  VStack,
  Tabs,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoBeaker, IoRefresh, IoTrash, IoTrophy } from "react-icons/io5";
import { EntityCard, IdCell } from "../../components/admin";
import {
  Ladder,
  Match,
  Player,
  Team,
  getClient,
  ladderClient,
  matchClient,
  playerClient,
  teamClient,
} from "../../utils/amplify-helpers";
import { deleteAllItems } from "../../utils/data-fetchers";
import { addSampleEntities } from "../../utils/data-generators";
import { nameFor } from "../../utils/random";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Settings
      </Heading>
      <AdminPage />
    </Container>
  );
}

function AdminPage() {
  const [isLoading, setIsLoading] = useState({
    ladders: false,
    matches: false,
    players: false,
    teams: false,
  });

  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  async function getLadders() {
    try {
      setIsLoading((prev) => ({ ...prev, ladders: true }));
      const { data, errors } = await ladderClient().list();

      if (errors) {
        console.error("Ladder list errors:", errors);
        console.warn("Continuing with available ladder data despite errors");
        const validLadders =
          data?.filter((ladder: Ladder) => ladder !== null) || [];
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
      const { data, errors } = await playerClient().list();

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
      const { data, errors } = await teamClient().list();

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

  async function getMatches() {
    try {
      setIsLoading((prev) => ({ ...prev, matches: true }));
      const { data, errors } = await matchClient().list({
        selectionSet: [
          "id",
          "ladderId",
          "team1Id",
          "team2Id",
          "winnerId",
          "playedOn",
        ],
      });

      if (errors) {
        console.error("Match list errors:", errors);
        console.warn("Continuing with available match data despite errors");
      }

      if (data && Array.isArray(data)) {
        const validMatches = data.filter(
          (match) =>
            match !== null &&
            typeof match === "object" &&
            match.id &&
            match.team1Id &&
            match.team2Id
        ) as Match[];
        // Sort by creation date, newest first
        validMatches.sort((a, b) => {
          // Sort by date played, unplayed at bottom of list
          // TODO: unplayed at top is better?
          //
          const dateA = a.playedOn ? new Date(a.playedOn).getTime() : 0;
          const dateB = b.playedOn ? new Date(b.playedOn).getTime() : 0;

          return dateB - dateA;
        });
        setMatches(validMatches);
      } else {
        setMatches([]);
      }
    } catch (error) {
      console.error("Exception in getMatches:", error);
      setMatches([]);
      console.warn("Recovering from match fetch error");
    } finally {
      setIsLoading((prev) => ({ ...prev, matches: false }));
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
      getMatches().catch((err) => {
        console.error("Error fetching matches:", err);
        setMatches([]);
      }),
    ]);

    const successful = results.filter((r) => r.status === "fulfilled").length;
    console.log(`Data loading complete: ${successful}/4 successful`);

    if (successful < 4) {
      console.warn("Some data fetches failed. UI may be incomplete.");
    }
  }

  const refreshData = () => {
    getAll();
  };

  useEffect(() => {
    refreshData();
  }, []);

  const models = getClient().models;

  async function deleteAllItemsWithLoading<T extends { id: string }>({
    items,
    modelName,
    entityType,
    refreshFunction,
  }: {
    items: T[];
    modelName: keyof typeof models;
    entityType: keyof typeof isLoading;
    refreshFunction: () => Promise<void>;
  }) {
    if (items.length === 0) {
      console.log(`No ${String(modelName)}s to delete`);
      return;
    }

    setIsLoading((prev) => ({ ...prev, [entityType]: true }));

    try {
      console.log(`Deleting ${items.length} ${String(modelName)}s...`);
      await deleteAllItems({ items, modelName });
      console.log(`Successfully deleted ${items.length} ${String(modelName)}s`);
    } catch (error) {
      console.error(`Error deleting ${String(modelName)}s:`, error);
    } finally {
      setIsLoading((prev) => ({ ...prev, [entityType]: false }));
      // Refresh the data after deletion
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

  const deleteAllMatches = () =>
    deleteAllItemsWithLoading({
      items: matches,
      modelName: "Match",
      entityType: "matches",
      refreshFunction: getMatches,
    });

  async function deleteAll() {
    setIsLoading({
      ladders: true,
      players: true,
      teams: true,
      matches: true,
    });

    try {
      // Need to delete in the correct order to avoid foreign key constraints
      // First delete matches, then teams, then players and ladders
      await deleteAllMatches();
      await deleteAllTeams();

      // These can be done in parallel
      await Promise.all([deleteAllLadders(), deleteAllPlayers()]);

      console.log("All entities successfully deleted");

      // Refresh data after deletion
      await refreshData();
    } catch (error) {
      console.error("Error during bulk delete:", error);
    } finally {
      setIsLoading({
        ladders: false,
        players: false,
        teams: false,
        matches: false,
      });
    }
  }

  function TeamsForPlayerTableCell({
    player,
    playerType,
  }: {
    player: Player;
    playerType: "player1Id" | "player2Id";
  }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchTeam = async () => {
        setLoading(true);
        setError(null);
        setTeam(null);

        try {
          const { data, errors } = await teamClient().list({
            filter: { [playerType]: { eq: player.id } }, // Use dynamic key
          });

          if (errors) {
            console.error(`Error fetching team for ${playerType}:`, errors);
            setError("Failed to load team");
            return;
          }

          // Check if there are any teams
          if (data && data.length > 0) {
            // A player can only be in one team as player 1 or 2
            setTeam(data[0]);
          } else {
            setTeam(null);
          }
        } catch (err) {
          console.error(
            `Unexpected error fetching team for ${playerType}:`,
            err
          );
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchTeam();
    }, [player.id, playerType]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return <Table.Cell>{team ? team.name : "—"}</Table.Cell>;
  }

  function PlayersForTeamTableCell({ team }: { team: Team }) {
    const [players, setPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchPlayers = async () => {
        setLoading(true);
        setError(null);
        setPlayers([]);

        try {
          const results = await Promise.all([
            // If player1Id exists, fetch player1
            team.player1Id
              ? playerClient().get({ id: team.player1Id })
              : Promise.resolve(null),

            // If player2Id exists, fetch player2
            team.player2Id
              ? playerClient().get({ id: team.player2Id })
              : Promise.resolve(null),
          ]);

          const fetchedPlayers: Player[] = [];

          if (results[0] && results[0].data) {
            fetchedPlayers.push(results[0].data);
          }

          if (results[1] && results[1].data) {
            fetchedPlayers.push(results[1].data);
          }

          setPlayers(fetchedPlayers);
        } catch (err) {
          console.error("Error fetching players for team:", err);
          setError("Failed to load players");
        } finally {
          setLoading(false);
        }
      };

      fetchPlayers();
    }, [team.id, team.player1Id, team.player2Id]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return (
      <Table.Cell>
        {players.length > 0 ? players.map((p) => nameFor(p)).join(", ") : "—"}
      </Table.Cell>
    );
  }

  function TeamsForLadderTableCell({ ladder }: { ladder: Ladder }) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchTeams = async () => {
        setLoading(true);
        setError(null);
        setTeams([]);

        try {
          const { data, errors } = await teamClient().list({
            filter: { ladderId: { eq: ladder.id } },
          });

          if (errors) {
            console.error("Error fetching teams for ladder:", errors);
            setError("Failed to load teams");
            return;
          }

          setTeams(data || []);
        } catch (err) {
          console.error("Unexpected error fetching teams for ladder:", err);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchTeams();
    }, [ladder.id]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return (
      <Table.Cell>
        {teams.length > 0 ? teams.map((team) => team.name).join(", ") : "—"}
      </Table.Cell>
    );
  }

  function LadderForTeamTableCell({ team }: { team: Team }) {
    const [ladder, setLadder] = useState<Ladder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchLadder = async () => {
        setLoading(true);
        setError(null);
        setLadder(null);

        if (!team.ladderId) {
          setLoading(false);
          return;
        }

        try {
          const { data, errors } = await ladderClient().get({
            id: team.ladderId,
          });

          if (errors) {
            console.error("Error fetching ladder for team:", errors);
            setError("Failed to load ladder");
            return;
          }

          setLadder(data || null);
        } catch (err) {
          console.error("Unexpected error fetching ladder for team:", err);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchLadder();
    }, [team.ladderId]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return <Table.Cell>{ladder ? ladder.name : "—"}</Table.Cell>;
  }

  function TeamNameTableCell({ teamId }: { teamId: string }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchTeam = async () => {
        setLoading(true);
        setError(null);
        setTeam(null);

        if (!teamId) {
          setLoading(false);
          return;
        }

        try {
          const { data, errors } = await teamClient().get({
            id: teamId,
          });

          if (errors) {
            console.error("Error fetching team:", errors);
            setError("Failed to load team");
            return;
          }

          setTeam(data || null);
        } catch (err) {
          console.error("Unexpected error fetching team:", err);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchTeam();
    }, [teamId]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return <Table.Cell>{team ? team.name : "—"}</Table.Cell>;
  }

  function LadderForMatchTableCell({ match }: { match: Match }) {
    const [ladder, setLadder] = useState<Ladder | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchLadder = async () => {
        setLoading(true);
        setError(null);
        setLadder(null);

        if (!match.ladderId) {
          setLoading(false);
          return;
        }

        try {
          const { data, errors } = await ladderClient().get({
            id: match.ladderId,
          });

          if (errors) {
            console.error("Error fetching ladder for match:", errors);
            setError("Failed to load ladder");
            return;
          }

          setLadder(data || null);
        } catch (err) {
          console.error("Unexpected error fetching ladder for match:", err);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchLadder();
    }, [match.ladderId]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return <Table.Cell>{ladder ? ladder.name : "—"}</Table.Cell>;
  }

  function WinnerTableCell({ match }: { match: Match }) {
    const [team, setTeam] = useState<Team | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      const fetchWinner = async () => {
        setLoading(true);
        setError(null);
        setTeam(null);

        if (!match.winnerId) {
          setLoading(false);
          return;
        }

        try {
          const { data, errors } = await teamClient().get({
            id: match.winnerId,
          });

          if (errors) {
            console.error("Error fetching winner team:", errors);
            setError("Failed to load winner team");
            return;
          }

          setTeam(data || null);
        } catch (err) {
          console.error("Unexpected error fetching winner team:", err);
          setError("An unexpected error occurred");
        } finally {
          setLoading(false);
        }
      };

      fetchWinner();
    }, [match.winnerId]);

    if (loading) {
      return (
        <Table.Cell>
          <Spinner size="sm" />
        </Table.Cell>
      );
    }

    if (error) {
      return (
        <Table.Cell color="red.500">
          <Text>{error}</Text>
        </Table.Cell>
      );
    }

    return (
      <Table.Cell>
        <Flex align="center">
          {team ? (
            <>
              <Icon as={IoTrophy} color="yellow.500" mr={2} />
              <Text>{team.name}</Text>
            </>
          ) : (
            <Text>Not recorded</Text>
          )}
        </Flex>
      </Table.Cell>
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
              <Icon as={IoTrash} mr={2} /> Delete everything
            </Button>
            <Button onClick={sampleData}>
              <Icon as={IoBeaker} mr={2} /> Load sample data
            </Button>
            <Button onClick={refreshData}>
              <Icon as={IoRefresh} mr={2} /> Refresh
            </Button>
          </ButtonGroup>
        </Flex>

        <Tabs.Root variant={"enclosed"} defaultValue={"ladders"}>
          <Tabs.List>
            <Tabs.Trigger value="ladders">Ladders</Tabs.Trigger>
            <Tabs.Trigger value="players">Players</Tabs.Trigger>
            <Tabs.Trigger value="teams">Teams</Tabs.Trigger>
            <Tabs.Trigger value="matches">Matches</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="ladders">
            <EntityCard
              title="Ladders"
              isLoading={isLoading.ladders}
              onDelete={deleteAllLadders}
              deleteButtonText="Delete All Ladders"
              columnHeaders={[
                { key: "id", label: "ID", width: "60px" },
                { key: "name", label: "Name" },
                { key: "description", label: "Description" },
                { key: "teams", label: "Teams" },
              ]}
            >
              {ladders.map((ladder) => (
                <Table.Row key={ladder.id}>
                  <IdCell id={ladder.id} />
                  <Table.Cell>{ladder.name}</Table.Cell>
                  <Table.Cell>{ladder.description}</Table.Cell>
                  <TeamsForLadderTableCell ladder={ladder} />
                </Table.Row>
              ))}
            </EntityCard>
          </Tabs.Content>

          <Tabs.Content value="players">
            <EntityCard
              title="Players"
              isLoading={isLoading.players}
              onDelete={deleteAllPlayers}
              deleteButtonText="Delete All Players"
              columnHeaders={[
                { key: "id", label: "ID", width: "60px" },
                { key: "name", label: "Name" },
                { key: "team1", label: "Team (Player 1)" },
                { key: "team2", label: "Team (Player 2)" },
              ]}
            >
              {players.map((player) => (
                <Table.Row key={player.id}>
                  <IdCell id={player.id} />
                  <Table.Cell>
                    {player.givenName} {player.familyName}
                  </Table.Cell>
                  <TeamsForPlayerTableCell
                    player={player}
                    playerType="player1Id"
                  />
                  <TeamsForPlayerTableCell
                    player={player}
                    playerType="player2Id"
                  />
                </Table.Row>
              ))}
            </EntityCard>
          </Tabs.Content>

          <Tabs.Content value="teams">
            <EntityCard
              title="Teams"
              isLoading={isLoading.teams}
              onDelete={deleteAllTeams}
              deleteButtonText="Delete All Teams"
              columnHeaders={[
                { key: "id", label: "ID", width: "60px" },
                { key: "name", label: "Name" },
                { key: "ladder", label: "Ladder" },
                { key: "players", label: "Players" },
              ]}
            >
              {teams.map((team) => (
                <Table.Row key={team.id}>
                  <IdCell id={team.id} />
                  <Table.Cell>{team.name}</Table.Cell>
                  <LadderForTeamTableCell team={team} />
                  <PlayersForTeamTableCell team={team} />
                </Table.Row>
              ))}
            </EntityCard>
          </Tabs.Content>

          <Tabs.Content value="matches">
            <EntityCard
              title="Matches"
              isLoading={isLoading.matches}
              onDelete={deleteAllMatches}
              deleteButtonText="Delete All Matches"
              columnHeaders={[
                { key: "id", label: "ID", width: "60px" },
                { key: "date", label: "Played On" },
                { key: "ladder", label: "Ladder" },
                { key: "team1", label: "Team 1" },
                { key: "team2", label: "Team 2" },
                { key: "winner", label: "Winner" },
              ]}
            >
              {matches.map((match) => (
                <Table.Row key={match.id}>
                  <IdCell id={match.id} />
                  <Table.Cell>
                    {match.playedOn
                      ? formatFriendlyDate(match.playedOn)
                      : "Not played"}
                  </Table.Cell>
                  <LadderForMatchTableCell match={match} />
                  <TeamNameTableCell teamId={match.team1Id} />
                  <TeamNameTableCell teamId={match.team2Id} />
                  <WinnerTableCell match={match} />
                </Table.Row>
              ))}
            </EntityCard>
          </Tabs.Content>
        </Tabs.Root>
      </VStack>
    </Box>
  );
}

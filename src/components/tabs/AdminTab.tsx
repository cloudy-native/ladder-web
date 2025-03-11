"use client";

import {
  Box,
  Button,
  ButtonGroup,
  Flex,
  Icon,
  Spacer,
  Table,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoBeaker, IoRefresh, IoTrash, IoTrophy } from "react-icons/io5";
import {
  Ladder,
  LadderModel,
  Match,
  MatchModel,
  models,
  Player,
  PlayerModel,
  Team,
  TeamModel,
} from "../../utils/amplify-helpers";
import { deleteAllItems } from "../../utils/data-fetchers";
import { addSampleEntities } from "../../utils/data-generators";
import { nameFor } from "../../utils/random";
import { EntityCard, IdCell, RelationTableCell } from "../admin";

export function AdminTab() {
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
      const { data, errors } = await LadderModel.list();

      if (errors) {
        console.error("Ladder list errors:", errors);
        console.warn("Continuing with available ladder data despite errors");
        const validLadders =
          data?.filter((ladder: any) => ladder !== null) || [];
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
      const { data, errors } = await PlayerModel.list();

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
      const { data, errors } = await TeamModel.list();

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
      const { data, errors } = await MatchModel.list({
        selectionSet: [
          "id",
          "ladderId",
          "team1Id",
          "team2Id",
          "winnerId",
          "createdAt",
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
        );
        // Sort by creation date, newest first
        validMatches.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
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
      await Promise.all([
        deleteAllMatches(),
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
        matches: false,
      });
    }
  }

  function TeamsForPlayer1TableCell({ player }: { player: Player }) {
    return (
      <RelationTableCell<Player, Team>
        entity={player}
        dependencyKey={player.id}
        fetchRelation={async () => {
          const result = await TeamModel.list({
            filter: { player1Id: { eq: player.id } },
            selectionSet: ["id", "name", "rating", "ladderId"],
          });

          if (result.errors) {
            throw new Error("Error fetching team");
          }

          return result.data?.[0] || null;
        }}
        renderContent={(team) => (
          <Text>{team && "name" in team ? team.name : "—"}</Text>
        )}
      />
    );
  }

  function TeamsForPlayer2TableCell({ player }: { player: Player }) {
    return (
      <RelationTableCell<Player, Team>
        entity={player}
        dependencyKey={player.id}
        fetchRelation={async () => {
          const result = await TeamModel.list({
            filter: { player2Id: { eq: player.id } },
            selectionSet: ["id", "name", "rating", "ladderId"],
          });

          if (result.errors) {
            throw new Error("Error fetching team");
          }

          return result.data?.[0] || null;
        }}
        renderContent={(team) => (
          <Text>{team && "name" in team ? team.name : "—"}</Text>
        )}
      />
    );
  }

  function PlayersForTeamTableCell({ team }: { team: Team }) {
    return (
      <RelationTableCell<Team, Player[]>
        entity={team}
        dependencyKey={[team.id, team.player1Id || "", team.player2Id || ""]}
        fetchRelation={async () => {
          const results = await Promise.all([
            // If player1Id exists, fetch player1
            team.player1Id
              ? PlayerModel.get({ id: team.player1Id })
              : Promise.resolve({ data: null, errors: null }),

            // If player2Id exists, fetch player2
            team.player2Id
              ? PlayerModel.get({ id: team.player2Id })
              : Promise.resolve({ data: null, errors: null }),
          ]);

          const [player1Result, player2Result] = results;
          const playerList: Player[] = [];

          if (player1Result.data) {
            playerList.push(player1Result.data);
          }

          if (player2Result.data) {
            playerList.push(player2Result.data);
          }

          return playerList;
        }}
        renderContent={(players) => (
          <Text>
            {Array.isArray(players) && players.length > 0
              ? players.map((p) => nameFor(p)).join(", ")
              : "—"}
          </Text>
        )}
      />
    );
  }

  function TeamsForLadderTableCell({ ladder }: { ladder: Ladder }) {
    return (
      <RelationTableCell<Ladder, Team[]>
        entity={ladder}
        dependencyKey={ladder.id}
        fetchRelation={async () => {
          const result = await TeamModel.list({
            filter: { ladderId: { eq: ladder.id } },
            selectionSet: ["id", "name"],
          });

          if (result.errors) {
            throw new Error("Error fetching teams for ladder");
          }

          return result.data || [];
        }}
        renderContent={(teams) => (
          <Text>
            {Array.isArray(teams) && teams.length > 0
              ? teams.map((team) => team.name).join(", ")
              : "—"}
          </Text>
        )}
      />
    );
  }

  function LadderForTeamTableCell({ team }: { team: Team }) {
    return (
      <RelationTableCell<Team, Ladder>
        entity={team}
        dependencyKey={team.ladderId || ""}
        fetchRelation={async () => {
          if (!team.ladderId) {
            return null;
          }

          const result = await LadderModel.get({
            id: team.ladderId,
          });

          if (result.errors) {
            throw new Error("Error fetching ladder for team");
          }

          return result.data;
        }}
        renderContent={(ladder) => (
          <Text>{ladder && "name" in ladder ? ladder.name : "—"}</Text>
        )}
      />
    );
  }

  function TeamNameTableCell({ teamId }: { teamId: string }) {
    return (
      <RelationTableCell<{ id: string }, Team>
        entity={{ id: teamId }}
        dependencyKey={teamId}
        fetchRelation={async () => {
          if (!teamId) {
            return null;
          }

          const result = await TeamModel.get({
            id: teamId,
          });

          if (result.errors) {
            throw new Error("Error fetching team");
          }

          return result.data;
        }}
        renderContent={(team) => (
          <Text>{team && "name" in team ? team.name : "—"}</Text>
        )}
      />
    );
  }

  function LadderForMatchTableCell({ match }: { match: Match }) {
    return (
      <RelationTableCell<Match, Ladder>
        entity={match}
        dependencyKey={match.ladderId}
        fetchRelation={async () => {
          if (!match.ladderId) {
            return null;
          }

          const result = await LadderModel.get({
            id: match.ladderId,
          });

          if (result.errors) {
            throw new Error("Error fetching ladder for match");
          }

          return result.data;
        }}
        renderContent={(ladder) => (
          <Text>{ladder && "name" in ladder ? ladder.name : "—"}</Text>
        )}
      />
    );
  }

  function WinnerTableCell({ match }: { match: Match }) {
    return (
      <RelationTableCell<Match, Team>
        entity={match}
        dependencyKey={match.winnerId || ""}
        fetchRelation={async () => {
          if (!match.winnerId) {
            return null;
          }

          const result = await TeamModel.get({
            id: match.winnerId,
          });

          if (result.errors) {
            throw new Error("Error fetching winner team");
          }

          return result.data;
        }}
        renderContent={(team) => (
          <Flex align="center">
            {team && "name" in team ? (
              <>
                <Icon as={IoTrophy} color="yellow.500" mr={2} />
                <Text>{team.name}</Text>
              </>
            ) : (
              <Text>Not recorded</Text>
            )}
          </Flex>
        )}
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

        {/* Ladders */}
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
              <IdCell id={ladder.id}  />
              <Table.Cell>{ladder.name}</Table.Cell>
              <Table.Cell>{ladder.description}</Table.Cell>
              <TeamsForLadderTableCell ladder={ladder} />
            </Table.Row>
          ))}
        </EntityCard>

        {/* Players */}
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
              <IdCell id={player.id}  />
              <Table.Cell>
                {player.givenName} {player.familyName}
              </Table.Cell>
              <TeamsForPlayer1TableCell player={player} />
              <TeamsForPlayer2TableCell player={player} />
            </Table.Row>
          ))}
        </EntityCard>

        {/* Teams */}
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

        {/* Matches */}
        <EntityCard
          title="Matches"
          isLoading={isLoading.matches}
          onDelete={deleteAllMatches}
          deleteButtonText="Delete All Matches"
          columnHeaders={[
            { key: "id", label: "ID", width: "60px" },
            { key: "date", label: "Date" },
            { key: "ladder", label: "Ladder" },
            { key: "team1", label: "Team 1" },
            { key: "team2", label: "Team 2" },
            { key: "winner", label: "Winner" },
          ]}
        >
          {matches.map((match) => (
            <Table.Row key={match.id}>
              <IdCell id={match.id}  />
              <Table.Cell>
                {new Date(match.createdAt).toLocaleDateString() +
                  " " +
                  new Date(match.createdAt).toLocaleTimeString()}
              </Table.Cell>
              <LadderForMatchTableCell match={match} />
              <TeamNameTableCell teamId={match.team1Id} />
              <TeamNameTableCell teamId={match.team2Id} />
              <WinnerTableCell match={match} />
            </Table.Row>
          ))}
        </EntityCard>
      </VStack>
    </Box>
  );
}

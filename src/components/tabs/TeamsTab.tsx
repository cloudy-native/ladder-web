import {
  Alert,
  Box,
  Button,
  Card,
  DialogRootProvider,
  Heading,
  HStack,
  Icon,
  Input,
  Spinner,
  Table,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoTrash, IoPeople } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";
import { getCurrentPlayer } from "../../data";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

const client = generateClient<Schema>();

type Team = Schema["Team"]["type"];
type Player = Schema["Player"]["type"];

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>();
  const addTeamDialog = useDialog();
  const joinTeamDialog = useDialog();
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  async function getTeams() {
    setLoading(true);

    try {
      const { data: teamData, errors } = await client.models.Team.list();

      if (errors) {
        console.error("Error fetching teams:", errors);
        throw new Error("Failed to fetch teams");
      }

      setTeams(teamData || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getPlayer() {
    try {
      const player = await getCurrentPlayer();

      setCurrentPlayer(player);
    } catch (error) {
      console.error("Error getting current player:", error);
    }
  }

  async function createTeam() {
    if (!teamName) {
      console.log("Empty team name");
      return;
    }

    try {
      const { data: createdTeam, errors } = await client.models.Team.create({
        name: teamName,
      });

      setTeamName("");

      if (errors) {
        console.error("Error creating team:", errors);
        throw new Error("Failed to create team");
      }

      console.log("Team created successfully:", createdTeam);

      // Add the new team to the list
      if (createdTeam) {
        setTeams((prev) => [createdTeam, ...prev]);
      }
    } catch (error) {
      console.error("Error creating team:", error);
    }
  }

  async function deleteTeam(id: string) {
    try {
      const { errors } = await client.models.Team.delete({ id });

      if (errors) {
        console.error("Error deleting team:", errors);
        throw new Error("Failed to delete team");
      }

      console.log("Team deleted successfully");

      // Remove the deleted team from the list
      setTeams((prev) => prev.filter((team) => team.id !== id));
    } catch (error) {
      console.error("Error deleting team:", error);
    }
  }

  async function joinTeam(teamId: string) {
    if (!currentPlayer) {
      console.error("No current player");
      return;
    }

    try {
      const { data: updatedPlayer, errors } = await client.models.Player.update(
        {
          id: currentPlayer.id,
          teamId: teamId,
        }
      );

      if (errors) {
        console.error("Error joining team:", errors);
        throw new Error("Failed to join team");
      }

      console.log("Joined team successfully:", updatedPlayer);
      setCurrentPlayer(updatedPlayer);

      // Refresh teams to update player counts
      await getTeams();
    } catch (error) {
      console.error("Error joining team:", error);
    }
  }

  async function leaveTeam() {
    if (!currentPlayer || !currentPlayer.teamId) {
      console.error("No current player or player not in a team");
      return;
    }

    try {
      const { data: updatedPlayer, errors } = await client.models.Player.update(
        {
          id: currentPlayer.id,
          teamId: null,
        }
      );

      if (errors) {
        console.error("Error leaving team:", errors);
        throw new Error("Failed to leave team");
      }

      console.log("Left team successfully:", updatedPlayer);
      // setCurrentPlayer(updatedPlayer); // TODO

      // Refresh teams to update player counts
      await getTeams();
    } catch (error) {
      console.error("Error leaving team:", error);
    }
  }

  useEffect(() => {
    getTeams();
    getPlayer();
  }, []);

  return (
    <Box>
      {/* Current Team Section */}
      <Card.Root mb={4} p={4}>
        <Card.Header>
          <Heading size="md">Your Team</Heading>
        </Card.Header>
        <Card.Body>
          {currentPlayer?.teamId ? (
            <HStack justifyContent="space-between">
              <Text>
                You are currently a member of team:{" "}
                <Text as="span" fontWeight="bold">
                  {teams.find((team) => team.id === currentPlayer.teamId)
                    ?.name || currentPlayer.teamId}
                </Text>
              </Text>
              <Button variant="outline" colorScheme="red" onClick={leaveTeam}>
                Leave Team
              </Button>
            </HStack>
          ) : (
            <Text>
              You are not currently a member of any team. Join a team below.
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      {/* Create Team Button */}
      <HStack justifyContent="flex-end" mb={4}>
        <DialogRootProvider value={addTeamDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Create Team</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Team</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field label="Team name">
                <Input
                  placeholder="Enter name..."
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button
                onClick={() => {
                  createTeam();
                  addTeamDialog.setOpen(false);
                }}
              >
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRootProvider>
      </HStack>

      <Heading size="md" mb={4}>
        All Teams
      </Heading>

      {/* Join Team Dialog */}
      <DialogRootProvider value={joinTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join Team</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to join{" "}
              <Text as="span" fontWeight="bold">
                {selectedTeam?.name}
              </Text>
              ?
            </Text>
            {currentPlayer?.teamId && (
              <Alert.Root status="warning" mt={4}>
                <Alert.Indicator />
                <Alert.Title>
                  You are already a member of another team. Joining this team
                  will remove you from your current team.
                </Alert.Title>
              </Alert.Root>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              onClick={() => {
                if (selectedTeam) {
                  joinTeam(selectedTeam.id);
                  joinTeamDialog.setOpen(false);
                }
              }}
            >
              Join
            </Button>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRootProvider>

      {/* Teams List */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading teams...</Text>
        </Box>
      ) : teams.length === 0 ? (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>No teams found</Alert.Title>
        </Alert.Root>
      ) : (
        <Card.Root>
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Team Name</Table.ColumnHeader>
                <Table.ColumnHeader>Players</Table.ColumnHeader>
                <Table.ColumnHeader>Actions</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {teams.map((team) => (
                <Table.Row key={team.id}>
                  <Table.Cell fontWeight="medium">
                    <HStack>
                      <Icon as={IoPeople} />
                      <Text>{team.name}</Text>
                    </HStack>
                  </Table.Cell>
                  <Table.Cell>{team.players?.length || 0}/2</Table.Cell>
                  <Table.Cell>
                    <HStack>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTeam(team);
                          joinTeamDialog.setOpen(true);
                        }}
                        disabled={currentPlayer?.teamId === team.id}
                      >
                        {currentPlayer?.teamId === team.id ? "Joined" : "Join"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteTeam(team.id)}
                      >
                        <Icon as={IoTrash} />
                      </Button>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Card.Root>
      )}
    </Box>
  );
}

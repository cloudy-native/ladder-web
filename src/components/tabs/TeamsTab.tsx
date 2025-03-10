import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  DialogRootProvider,
  Flex,
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
import {
  IoAdd,
  IoAddCircle,
  IoClose,
  IoPeople,
  IoPersonAdd,
  IoRefresh,
  IoRemove,
  IoRemoveCircle,
  IoSave,
  IoTrash,
  IoTrophy,
} from "react-icons/io5";
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

type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

// Define extended team type with players list and ladder details
interface TeamWithPlayers extends Team {
  playersList?: Player[];
  ladderDetails?: Ladder | null;
}

export function TeamsTab() {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>();
  const [ladders, setLadders] = useState<Ladder[]>([]);
  // TODO: just one loading...
  const [loadingLadders, setLoadingLadders] = useState(false);

  // Dialogs
  const addTeamDialog = useDialog();
  const joinTeamDialog = useDialog();
  const ladderDialog = useDialog();

  // Selected items
  const [selectedTeam, setSelectedTeam] = useState<TeamWithPlayers | null>(
    null
  );
  const [selectedLadder, setSelectedLadder] = useState<Ladder | null>(null);

  async function getTeams() {
    setLoading(true);

    try {
      const { data: teamData, errors } = await client.models.Team.list();

      if (errors) {
        console.error("Error fetching teams:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid team objects to prevent UI errors
      if (teamData && Array.isArray(teamData)) {
        const validTeams = teamData.filter(
          (team) =>
            team !== null && typeof team === "object" && team.id && team.name
        );

        console.log(`Fetched ${validTeams.length} teams`);

        // Create an array of promises to fetch players and ladder for each team in parallel
        const teamsWithPlayersPromises = validTeams.map(async (team) => {
          try {
            // Fetch players for this team
            const playersResult = await team.players();
            const players = playersResult.data || [];

            // Fetch ladder for this team if it has one
            let ladder = null;
            if (team.ladderId) {
              const ladderResult = await team.ladder();
              ladder = ladderResult.data;
            }

            return {
              ...team,
              playersList: players,
              ladderDetails: ladder,
            } as TeamWithPlayers;
          } catch (err) {
            console.error(`Error fetching related data for team ${team.id}:`, err);
            return {
              ...team,
              playersList: [],
              ladderDetails: null,
            } as TeamWithPlayers;
          }
        });

        // Wait for all fetches to complete
        const teamsWithPlayers = await Promise.all(teamsWithPlayersPromises);
        setTeams(teamsWithPlayers);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error("Error fetching teams:", error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }

  async function getLadders() {
    setLoadingLadders(true);

    try {
      const { data: ladderData, errors } = await client.models.Ladder.list();

      if (errors) {
        console.error("Error fetching ladders:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid ladder objects to prevent UI errors
      if (ladderData && Array.isArray(ladderData)) {
        const validLadders = ladderData.filter(
          (ladder) =>
            ladder !== null &&
            typeof ladder === "object" &&
            ladder.id &&
            ladder.name
        );

        // Sort by name for better user experience
        validLadders.sort((a, b) => a.name.localeCompare(b.name));

        setLadders(validLadders);
      } else {
        setLadders([]);
      }
    } catch (error) {
      console.error("Error fetching ladders:", error);
      setLadders([]);
    } finally {
      setLoadingLadders(false);
    }
  }

  async function getPlayer() {
    try {
      const player = await getCurrentPlayer();
      console.log("Teams: Current player", player);

      setCurrentPlayer(player);
    } catch (error) {
      console.error("Error getting current player:", error);
    }
  }

  const [initialRating, setInitialRating] = useState<string>("1200");
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [createTeamError, setCreateTeamError] = useState<string | null>(null);

  async function createTeam() {
    // Reset error state
    setCreateTeamError(null);

    // Validate input
    if (!teamName.trim()) {
      setCreateTeamError("Team name is required");
      return;
    }

    const parsedRating = parseInt(initialRating);
    if (isNaN(parsedRating) || parsedRating < 0) {
      setCreateTeamError("Rating must be a positive number");
      return;
    }

    setIsCreatingTeam(true);

    try {
      const { data: createdTeam, errors } = await client.models.Team.create({
        name: teamName.trim(),
        rating: parsedRating !== 0 ? parsedRating || 1200 : 0,
      });

      if (errors) {
        console.error("Error creating team:", errors);
        setCreateTeamError("Failed to create team. Please try again.");
        return;
      }

      console.log("Team created successfully:", createdTeam);

      // Reset form fields
      setTeamName("");
      setInitialRating("1200");

      // Close the dialog
      addTeamDialog.setOpen(false);

      // Add the new team to the list or refresh the list
      if (createdTeam) {
        // Option 1: Add to existing list
        setTeams((prev) => [createdTeam, ...prev]);

        // Option 2: Refresh the full list to ensure consistency
        // getTeams();
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setCreateTeamError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingTeam(false);
    }
  }

  const [deletingTeams, setDeletingTeams] = useState<Record<string, boolean>>(
    {}
  );
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});

  async function deleteTeam(id: string) {
    // Reset any previous error for this team
    setDeleteErrors((prev) => ({ ...prev, [id]: "" }));

    // Set the deleting state for this specific team
    setDeletingTeams((prev) => ({ ...prev, [id]: true }));

    try {
      // Check if team has players
      const teamExists = teams.find((t) => t.id === id);
      if (teamExists) {
        // Check if the team has players before deletion
        if (teamExists.playersList && teamExists.playersList.length > 0) {
          setDeleteErrors((prev) => ({
            ...prev,
            [id]: `Cannot delete: team has ${teamExists.playersList.length} player(s). Remove players first.`,
          }));
          return;
        }

        const { errors } = await client.models.Team.delete({ id });

        if (errors) {
          console.error("Error deleting team:", errors);
          setDeleteErrors((prev) => ({
            ...prev,
            [id]: "Failed to delete team. It may have players.",
          }));
          return;
        }

        console.log("Team deleted successfully");

        // Remove the deleted team from the list
        setTeams((prev) => prev.filter((team) => team.id !== id));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      setDeleteErrors((prev) => ({
        ...prev,
        [id]: "An unexpected error occurred during deletion.",
      }));
    } finally {
      // Reset the deleting state
      setDeletingTeams((prev) => ({ ...prev, [id]: false }));
    }
  }

  const [isJoiningTeam, setIsJoiningTeam] = useState(false);
  const [joinTeamError, setJoinTeamError] = useState<string | null>(null);

  async function joinTeam(teamId: string) {
    // Reset error state
    setJoinTeamError(null);

    if (!currentPlayer) {
      setJoinTeamError("You must be logged in to join a team");
      return;
    }

    setIsJoiningTeam(true);

    try {
      const { data: updatedPlayer, errors } = await client.models.Player.update(
        {
          id: currentPlayer.id,
          teamId: teamId,
        }
      );

      if (errors) {
        console.error("Error joining team:", errors);
        setJoinTeamError("Failed to join team. Please try again.");
        return;
      }

      console.log("Joined team successfully:", updatedPlayer);

      // Update local state
      setCurrentPlayer(updatedPlayer);

      // Close dialog
      joinTeamDialog.setOpen(false);

      // Refresh teams to update player counts
      await getTeams();
    } catch (error) {
      console.error("Error joining team:", error);
      setJoinTeamError("An unexpected error occurred. Please try again.");
    } finally {
      setIsJoiningTeam(false);
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

  // Add a team to a ladder
  async function addTeamToLadder(teamId: string, ladderId: string) {
    try {
      // Check if the team already has a ladder
      const teamToUpdate = teams.find(team => team.id === teamId);
      
      if (teamToUpdate?.ladderId === ladderId) {
        console.log("Team already in this ladder");
        return;
      }

      const { data: updatedTeam, errors } = await client.models.Team.update({
        id: teamId,
        ladderId: ladderId,
      });

      if (errors) {
        console.error("Error adding team to ladder:", errors);
        throw new Error("Failed to add team to ladder");
      }

      console.log("Team added to ladder successfully:", updatedTeam);

      // Refresh data
      getTeams();
    } catch (error) {
      console.error("Error adding team to ladder:", error);
    }
  }

  // Remove a team from a ladder
  async function removeTeamFromLadder(teamId: string) {
    try {
      const { data: updatedTeam, errors } = await client.models.Team.update({
        id: teamId,
        ladderId: null, // Remove the ladder association
      });

      if (errors) {
        console.error("Error removing team from ladder:", errors);
        throw new Error("Failed to remove team from ladder");
      }

      console.log("Team removed from ladder successfully");

      // Refresh data
      getTeams();
    } catch (error) {
      console.error("Error removing team from ladder:", error);
    }
  }

  // Check if a team is in a specific ladder
  function isTeamInLadder(teamId: string, ladderId: string) {
    const team = teams.find(team => team.id === teamId);
    return team?.ladderId === ladderId;
  }

  // Get ladder name by ID
  function getLadderName(ladderId: string) {
    const ladder = ladders.find((ladder) => ladder.id === ladderId);
    return ladder ? ladder.name : "Unknown Ladder";
  }
  
  // Get team's ladder
  function getTeamLadder(teamId: string) {
    const team = teams.find(team => team.id === teamId);
    return team?.ladderDetails || null;
  }

  // Check if current player is a member of the team
  function isPlayerInTeam(teamId: string) {
    return currentPlayer?.teamId === teamId;
  }

  // Function to refresh all data
  const refreshData = () => {
    getTeams();
    getPlayer();
    getLadders();
  };

  // Load data once on component mount
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <Box>
      {/* Action Buttons */}
      <HStack justifyContent="flex-end" mb={4}>
        <Button onClick={refreshData}>
          <Icon as={IoRefresh} mr={2} /> Refresh
        </Button>
        <DialogRootProvider value={addTeamDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icon as={IoAddCircle} mr={2} /> Create Team
            </Button>
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
                  required
                />
              </Field>
              <Field label="Initial rating">
                <Input
                  type="number"
                  placeholder="Enter rating..."
                  value={initialRating}
                  onChange={(e) => setInitialRating(e.target.value)}
                />
                <Text fontSize="xs" color="gray.500" mt={1}>
                  The default rating is 1200. Higher values indicate stronger
                  teams.
                </Text>
              </Field>

              {createTeamError && (
                <Alert.Root status="error" mt={2}>
                  <Alert.Indicator />
                  <Alert.Title>{createTeamError}</Alert.Title>
                </Alert.Root>
              )}
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button>
                  <Icon as={IoClose} mr={2} /> Cancel
                </Button>
              </DialogActionTrigger>
              <Button
                onClick={createTeam}
                loading={isCreatingTeam}
                loadingText="Creating..."
                disabled={isCreatingTeam || !teamName.trim()}
              >
                <Icon as={IoSave} mr={2} /> Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRootProvider>
      </HStack>

      {/* Enroll Team Dialog */}
      <DialogRootProvider value={ladderDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTeam
                ? `Manage "${selectedTeam.name}" Ladder`
                : "Manage Team Ladder"}
            </DialogTitle>
          </DialogHeader>
          <DialogBody>
            {loadingLadders ? (
              <Box textAlign="center" py={4}>
                <Spinner size="md" />
                <Text mt={2}>Loading ladders...</Text>
              </Box>
            ) : ladders.length === 0 ? (
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Title>No ladders available</Alert.Title>
                <Alert.Description>
                  There are no ladders to join. Create a ladder first.
                </Alert.Description>
              </Alert.Root>
            ) : (
              <>
                <Text mb={4}>Select a ladder for your team:</Text>
                
                {selectedTeam?.ladderId && (
                  <Alert.Root status="info" mb={4}>
                    <Alert.Indicator />
                    <Alert.Title>
                      Your team is currently in the ladder: {selectedTeam?.ladderDetails?.name || "Unknown Ladder"}
                    </Alert.Title>
                    <Alert.Description>
                      Teams can only be in one ladder at a time.
                    </Alert.Description>
                  </Alert.Root>
                )}
                
                <VStack align="stretch">
                  {ladders.map((ladder) => {
                    const isInLadder =
                      selectedTeam &&
                      isTeamInLadder(selectedTeam.id, ladder.id);

                    return (
                      <Card.Root key={ladder.id}>
                        <Card.Body p={3}>
                          <HStack justifyContent="space-between">
                            <VStack align="start">
                              <Text fontWeight="bold">{ladder.name}</Text>
                              {ladder.description && (
                                <Text fontSize="sm" color="gray.600">
                                  {ladder.description}
                                </Text>
                              )}
                            </VStack>
                            {isInLadder ? (
                              <Button
                                size="sm"
                                colorScheme="red"
                                onClick={() => {
                                  if (selectedTeam) {
                                    removeTeamFromLadder(selectedTeam.id);
                                  }
                                }}
                              >
                                <IoRemove />
                                Remove
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                onClick={() => {
                                  if (selectedTeam) {
                                    addTeamToLadder(
                                      selectedTeam.id,
                                      ladder.id
                                    );
                                  }
                                }}
                                disabled={selectedTeam?.ladderId !== null && selectedTeam?.ladderId !== undefined}
                              >
                                <IoAdd />
                                Join
                              </Button>
                            )}
                          </HStack>
                        </Card.Body>
                      </Card.Root>
                    );
                  })}
                </VStack>
              </>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button>Close</Button>
            </DialogActionTrigger>
          </DialogFooter>
          <DialogCloseTrigger />
        </DialogContent>
      </DialogRootProvider>

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

            {joinTeamError && (
              <Alert.Root status="error" mt={4}>
                <Alert.Indicator />
                <Alert.Title>{joinTeamError}</Alert.Title>
              </Alert.Root>
            )}
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button>
                <Icon as={IoClose} mr={2} /> Cancel
              </Button>
            </DialogActionTrigger>
            <Button
              onClick={() => {
                if (selectedTeam) {
                  joinTeam(selectedTeam.id);
                }
              }}
              loading={isJoiningTeam}
              loadingText="Joining..."
              disabled={isJoiningTeam || !selectedTeam}
            >
              <Icon as={IoPersonAdd} mr={2} /> Join
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
        <VStack align="stretch">
          {teams.map((team) => {
            const isInTeam = isPlayerInTeam(team.id);
            const teamLadder = team.ladderDetails;

            return (
              <Card.Root key={team.id}>
                <Card.Header p={4}>
                  <Flex
                    direction="row"
                    width="100%"
                    justify="space-between"
                    align="center"
                  >
                    <HStack>
                      <Box
                        p={2}
                        borderRadius="lg"
                        display="flex"
                        alignItems="center"
                      >
                        <Icon as={IoPeople} boxSize={5} color="blue.600" />
                      </Box>
                      <Box>
                        <HStack>
                          <Text fontWeight="bold" fontSize="lg">
                            {team.name}
                          </Text>
                          {isInTeam && (
                            <Badge
                              colorScheme="green"
                              size="sm"
                              variant="solid"
                              px={2}
                              borderRadius="full"
                            >
                              Your Team
                            </Badge>
                          )}
                        </HStack>
                        <HStack>
                          <Text fontSize="sm" color="gray.600">
                            Rating:{" "}
                            <Text as="span" fontWeight="bold">
                              {typeof team.rating === "number"
                                ? team.rating
                                : 1200}
                            </Text>
                          </Text>
                          {team.ladderId && teamLadder && (
                            <Text fontSize="sm" color="blue.600">
                              • Ladder:{" "}
                              <Text as="span" fontWeight="bold">
                                {teamLadder.name}
                              </Text>
                            </Text>
                          )}
                        </HStack>
                      </Box>
                    </HStack>
                    <HStack>
                      <Button
                        size="sm"
                        colorScheme={isInTeam ? "green" : "blue"}
                        variant={isInTeam ? "outline" : "solid"}
                        onClick={() => {
                          setSelectedTeam(team);
                          joinTeamDialog.setOpen(true);
                        }}
                        disabled={currentPlayer?.teamId === team.id}
                      >
                        {currentPlayer?.teamId === team.id ? "Joined" : "Join"}
                      </Button>
                      {isInTeam && (
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => {
                            setSelectedTeam(team);
                            ladderDialog.setOpen(true);
                          }}
                        >
                          <IoTrophy />
                          Ladders
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => deleteTeam(team.id)}
                        loading={deletingTeams[team.id]}
                        aria-label="Delete team"
                      >
                        <Icon as={IoTrash} />
                      </Button>
                    </HStack>
                  </Flex>
                </Card.Header>
                <Box height="1px" bg="gray.200" />
                <Card.Body p={4}>
                  {/* Player Section */}
                  <Box>
                    {!team.playersList || team.playersList.length === 0 ? (
                      <Text color="gray.500" fontSize="sm">
                        No players in this team yet
                      </Text>
                    ) : (
                      <Table.Root size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Player</Table.ColumnHeader>
                            <Table.ColumnHeader>Email</Table.ColumnHeader>
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          {team.playersList.map((player) => (
                            <Table.Row key={player.id}>
                              <Table.Cell>
                                <HStack>
                                  <Avatar.Root size="xs">
                                    <Avatar.Fallback
                                      name={`${player.givenName} ${player.familyName}`}
                                    />
                                  </Avatar.Root>
                                  <Text fontWeight="medium">
                                    {player.givenName} {player.familyName}
                                    {player.id === currentPlayer?.id && (
                                      <Badge
                                        colorScheme="green"
                                        ml={2}
                                        size="sm"
                                      >
                                        You
                                      </Badge>
                                    )}
                                  </Text>
                                </HStack>
                              </Table.Cell>
                              <Table.Cell>
                                <Text fontSize="sm">{player.email}</Text>
                              </Table.Cell>
                            </Table.Row>
                          ))}
                        </Table.Body>
                      </Table.Root>
                    )}
                  </Box>

                  {/* Error message for team deletion */}
                  {deleteErrors[team.id] && (
                    <Alert.Root status="error" my={2} size="sm">
                      <Alert.Indicator />
                      <Alert.Title>{deleteErrors[team.id]}</Alert.Title>
                    </Alert.Root>
                  )}

                  {/* Team Ladder Section (if ladder exists) */}
                  {team.ladderId && teamLadder && (
                    <Box mt={3}>
                      <Box height="1px" bg="gray.200" mb={3} />
                      <Table.Root size="sm">
                        <Table.Header>
                          <Table.Row>
                            <Table.ColumnHeader>Ladder</Table.ColumnHeader>
                            <Table.ColumnHeader>Description</Table.ColumnHeader>
                            {isInTeam && (
                              <Table.ColumnHeader textAlign="right">
                                Actions
                              </Table.ColumnHeader>
                            )}
                          </Table.Row>
                        </Table.Header>
                        <Table.Body>
                          <Table.Row>
                            <Table.Cell>
                              <Text fontWeight="medium">{teamLadder.name}</Text>
                            </Table.Cell>
                            <Table.Cell>
                              <Text fontWeight="medium">
                                {teamLadder.description}
                              </Text>
                            </Table.Cell>
                            {isInTeam && (
                              <Table.Cell textAlign="right">
                                <Button
                                  size="xs"
                                  colorScheme="red"
                                  onClick={() => removeTeamFromLadder(team.id)}
                                >
                                  <Icon
                                    as={IoRemoveCircle}
                                    mr={1}
                                    boxSize={3}
                                  />
                                  Remove
                                </Button>
                              </Table.Cell>
                            )}
                          </Table.Row>
                        </Table.Body>
                      </Table.Root>
                    </Box>
                  )}
                </Card.Body>
              </Card.Root>
            );
          })}
        </VStack>
      )}
    </Box>
  );
}

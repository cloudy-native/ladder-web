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
  IoExit,
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

type Enrollment = Schema["Enrollment"]["type"];
type Ladder = Schema["Ladder"]["type"];
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

// Define extended team type with players list
interface TeamWithPlayers extends Team {
  playersList?: Player[];
}

export function TeamsTab() {
  const [teams, setTeams] = useState<TeamWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamName, setTeamName] = useState("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>();
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  // TODO: just one loading...
  const [loadingLadders, setLoadingLadders] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Dialogs
  const addTeamDialog = useDialog();
  const joinTeamDialog = useDialog();
  const enrollTeamDialog = useDialog();

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

        // Create an array of promises to fetch players for each team in parallel
        const teamsWithPlayersPromises = validTeams.map(async (team) => {
          try {
            // Fetch players for this team
            const playersResult = await team.players();
            const players = playersResult.data || [];

            return {
              ...team,
              playersList: players,
            } as TeamWithPlayers;
          } catch (err) {
            console.error(`Error fetching players for team ${team.id}:`, err);
            return {
              ...team,
              playersList: [],
            } as TeamWithPlayers;
          }
        });

        // Wait for all player fetches to complete
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

  async function getEnrollments() {
    setLoadingEnrollments(true);

    try {
      const { data: enrollmentData, errors } =
        await client.models.Enrollment.list();

      if (errors) {
        console.error("Error fetching enrollments:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid enrollment objects to prevent UI errors
      if (enrollmentData && Array.isArray(enrollmentData)) {
        const validEnrollments = enrollmentData.filter(
          (enrollment) =>
            enrollment !== null &&
            typeof enrollment === "object" &&
            enrollment.id &&
            enrollment.teamId &&
            enrollment.ladderId
        );

        setEnrollments(validEnrollments);
        console.log(`Fetched ${validEnrollments.length} enrollments`);
      } else {
        setEnrollments([]);
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      setEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
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
      // First check if team has enrollments
      const teamEnrollments = enrollments.filter((e) => e.teamId === id);
      if (teamEnrollments.length > 0) {
        setDeleteErrors((prev) => ({
          ...prev,
          [id]: `Cannot delete: team is enrolled in ${teamEnrollments.length} ladder(s). Unenroll first.`,
        }));
        return;
      }

      // Then check if team has players
      const teamExists = teams.find((t) => t.id === id);
      if (teamExists) {
        // We'd need to fetch players for this team, but for now we'll proceed with deletion

        const { errors } = await client.models.Team.delete({ id });

        if (errors) {
          console.error("Error deleting team:", errors);
          setDeleteErrors((prev) => ({
            ...prev,
            [id]: "Failed to delete team. It may have players or enrollments.",
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

  // Enroll a team in a ladder
  async function enrollTeamInLadder(teamId: string, ladderId: string) {
    try {
      // Check if already enrolled
      const isEnrolled = enrollments.some(
        (enrollment) =>
          enrollment.teamId === teamId && enrollment.ladderId === ladderId
      );

      if (isEnrolled) {
        console.log("Team already enrolled in this ladder");
        return;
      }

      const { data: createdEnrollment, errors } =
        await client.models.Enrollment.create({
          teamId: teamId,
          ladderId: ladderId,
        });

      if (errors) {
        console.error("Error enrolling team in ladder:", errors);
        throw new Error("Failed to enroll team in ladder");
      }

      console.log("Team enrolled successfully:", createdEnrollment);

      // Refresh data
      getTeams();
      getEnrollments();
    } catch (error) {
      console.error("Error enrolling team:", error);
    }
  }

  // Unenroll a team from a ladder
  async function unenrollTeamFromLadder(teamId: string, ladderId: string) {
    try {
      // Find the enrollment to delete
      const enrollmentToDelete = enrollments.find(
        (enrollment) =>
          enrollment.teamId === teamId && enrollment.ladderId === ladderId
      );

      if (!enrollmentToDelete) {
        console.log("No enrollment found to delete");
        return;
      }

      const { errors } = await client.models.Enrollment.delete({
        id: enrollmentToDelete.id,
      });

      if (errors) {
        console.error("Error unenrolling team from ladder:", errors);
        throw new Error("Failed to unenroll team from ladder");
      }

      console.log("Team unenrolled successfully");

      // Refresh data
      getTeams();
      getEnrollments();
    } catch (error) {
      console.error("Error unenrolling team:", error);
    }
  }

  // Check if a team is enrolled in a specific ladder
  function isTeamEnrolledInLadder(teamId: string, ladderId: string) {
    return enrollments.some(
      (enrollment) =>
        enrollment.teamId === teamId && enrollment.ladderId === ladderId
    );
  }

  // Get ladder name by ID
  function getLadderName(ladderId: string) {
    const ladder = ladders.find((ladder) => ladder.id === ladderId);
    return ladder ? ladder.name : "Unknown Ladder";
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
    getEnrollments();
  };

  // Load data once on component mount
  useEffect(() => {
    refreshData();
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
              <Button variant="outline" onClick={leaveTeam}>
                <Icon as={IoExit} mr={2} /> Leave Team
              </Button>
            </HStack>
          ) : (
            <Text>
              You are not currently a member of any team. Join a team below.
            </Text>
          )}
        </Card.Body>
      </Card.Root>

      {/* Action Buttons */}
      <HStack justifyContent="flex-end" mb={4}>
        <Button variant="outline" onClick={refreshData}>
          <Icon as={IoRefresh} mr={2} /> Refresh
        </Button>
        <DialogRootProvider value={addTeamDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">
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
                <Button variant="outline">
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
      <DialogRootProvider value={enrollTeamDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTeam
                ? `Enroll "${selectedTeam.name}" in Ladders`
                : "Enroll Team in Ladders"}
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
                  There are no ladders to enroll in. Create a ladder first.
                </Alert.Description>
              </Alert.Root>
            ) : (
              <>
                <Text mb={4}>Select a ladder to enroll your team:</Text>
                <VStack align="stretch">
                  {ladders.map((ladder) => {
                    const isEnrolled =
                      selectedTeam &&
                      isTeamEnrolledInLadder(selectedTeam.id, ladder.id);

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
                            {isEnrolled ? (
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                leftIcon={<Icon as={IoRemove} />}
                                onClick={() => {
                                  if (selectedTeam) {
                                    unenrollTeamFromLadder(
                                      selectedTeam.id,
                                      ladder.id
                                    );
                                  }
                                }}
                              >
                                Unenroll
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                colorScheme="blue"
                                leftIcon={<Icon as={IoAdd} />}
                                onClick={() => {
                                  if (selectedTeam) {
                                    enrollTeamInLadder(
                                      selectedTeam.id,
                                      ladder.id
                                    );
                                  }
                                }}
                              >
                                Enroll
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
              <Button variant="outline">Close</Button>
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
              <Button variant="outline">
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
            const teamLadders = enrollments
              .filter((enrollment) => enrollment.teamId === team.id)
              .map((enrollment) => {
                const ladderName = getLadderName(enrollment.ladderId);
                return { id: enrollment.ladderId, name: ladderName } as Ladder;
              });

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
                            enrollTeamDialog.setOpen(true);
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
                  <Box mb={teamLadders.length > 0 ? 4 : 0}>
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

                  {/* Team Ladders Section */}
                  {teamLadders.length > 0 && (
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
                          {teamLadders.map((ladder) => (
                            <Table.Row key={ladder.id}>
                              <Table.Cell>
                                <Text fontWeight="medium">{ladder.name}</Text>
                              </Table.Cell>
                              <Table.Cell>
                                <Text fontWeight="medium">
                                  {ladder.description}
                                </Text>
                              </Table.Cell>
                              {isInTeam && (
                                <Table.Cell textAlign="right">
                                  <Button
                                    size="xs"
                                    colorScheme="red"
                                    variant="outline"
                                    onClick={() =>
                                      ladder.id &&
                                      unenrollTeamFromLadder(team.id, ladder.id)
                                    }
                                  >
                                    <Icon
                                      as={IoRemoveCircle}
                                      mr={1}
                                      boxSize={3}
                                    />
                                    Unenroll
                                  </Button>
                                </Table.Cell>
                              )}
                            </Table.Row>
                          ))}
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

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
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoAdd, IoPeople, IoRemove, IoRemoveCircle, IoTrash, IoTrophy, IoUnlink } from "react-icons/io5";
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

export function TeamsTab() {
  const [teams, setTeams] = useState<Team[]>([]);
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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedLadder, setSelectedLadder] = useState<Ladder | null>(null);

  async function getTeams() {
    setLoading(true);

    try {
      const { data: teamData, errors } = await client.models.Team.list({
        selectionSet: ["id", "name", "rating", "players.*"]
        
        //  `
        //   id
        //   name
        //   rating
        //   players {
        //     items {
        //       id
        //       givenName
        //       familyName
        //       email
        //     }
        //   }
        // `
      });

      if (errors) {
        console.error("Error fetching teams:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid team objects to prevent UI errors
      if (teamData && Array.isArray(teamData)) {
        const validTeams = teamData.filter(team => 
          team !== null && 
          typeof team === 'object' &&
          team.id &&
          team.name
        );
        
        console.log(`Fetched ${validTeams.length} teams`);
        setTeams(validTeams);
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
        const validLadders = ladderData.filter(ladder => 
          ladder !== null && 
          typeof ladder === 'object' &&
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
      const { data: enrollmentData, errors } = await client.models.Enrollment.list();

      if (errors) {
        console.error("Error fetching enrollments:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid enrollment objects to prevent UI errors
      if (enrollmentData && Array.isArray(enrollmentData)) {
        const validEnrollments = enrollmentData.filter(enrollment => 
          enrollment !== null && 
          typeof enrollment === 'object' &&
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
        rating: parsedRating !== 0 ? (parsedRating || 1200) : 0
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

  const [deletingTeams, setDeletingTeams] = useState<Record<string, boolean>>({});
  const [deleteErrors, setDeleteErrors] = useState<Record<string, string>>({});
  
  async function deleteTeam(id: string) {
    // Reset any previous error for this team
    setDeleteErrors(prev => ({ ...prev, [id]: '' }));
    
    // Set the deleting state for this specific team
    setDeletingTeams(prev => ({ ...prev, [id]: true }));
    
    try {
      // First check if team has enrollments
      const teamEnrollments = enrollments.filter(e => e.teamId === id);
      if (teamEnrollments.length > 0) {
        setDeleteErrors(prev => ({ 
          ...prev, 
          [id]: `Cannot delete: team is enrolled in ${teamEnrollments.length} ladder(s). Unenroll first.`
        }));
        return;
      }
      
      // Then check if team has players
      const teamExists = teams.find(t => t.id === id);
      if (teamExists) {
        // We'd need to fetch players for this team, but for now we'll proceed with deletion
        
        const { errors } = await client.models.Team.delete({ id });
        
        if (errors) {
          console.error("Error deleting team:", errors);
          setDeleteErrors(prev => ({ 
            ...prev, 
            [id]: "Failed to delete team. It may have players or enrollments."
          }));
          return;
        }
        
        console.log("Team deleted successfully");
        
        // Remove the deleted team from the list
        setTeams((prev) => prev.filter((team) => team.id !== id));
      }
    } catch (error) {
      console.error("Error deleting team:", error);
      setDeleteErrors(prev => ({ 
        ...prev, 
        [id]: "An unexpected error occurred during deletion."
      }));
    } finally {
      // Reset the deleting state
      setDeletingTeams(prev => ({ ...prev, [id]: false }));
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
      const { data: updatedPlayer, errors } = await client.models.Player.update({
        id: currentPlayer.id,
        teamId: teamId,
      });

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

  useEffect(() => {
    getTeams();
    getPlayer();
    getLadders();
    getEnrollments();
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
                  The default rating is 1200. Higher values indicate stronger teams.
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
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button
                onClick={createTeam}
                loading={isCreatingTeam}
                loadingText="Creating..."
                disabled={isCreatingTeam || !teamName.trim()}
              >
                Save
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
                      <Card.Root
                        key={ladder.id}
                        variant={isEnrolled ? "filled" : "outline"}
                      >
                        <Card.Body p={3}>
                          <HStack justifyContent="space-between">
                            <VStack align="start" spacing={0}>
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
              <Button variant="outline">Cancel</Button>
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
        <VStack spacing={4} align="stretch">
          {teams.map((team) => {
            const isInTeam = isPlayerInTeam(team.id);
            const teamLadders = enrollments
              .filter((enrollment) => enrollment.teamId === team.id)
              .map((enrollment) => {
                const ladderName = getLadderName(enrollment.ladderId);
                return { id: enrollment.ladderId, name: ladderName };
              });

            return (
              <Card.Root key={team.id}>
                <Card.Header p={4}>
                  <HStack justifyContent="space-between" width="100%">
                    <HStack>
                      <Icon as={IoPeople} boxSize={5} />
                      <Text fontWeight="bold" fontSize="lg">
                        {team.name}
                      </Text>
                      <HStack spacing={1}>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          (Rating: {typeof team.rating === 'number' ? team.rating : 1200})
                        </Text>
                        {isInTeam && (
                          <Text fontSize="sm" color="green.500" fontWeight="bold">
                            • Your Team
                          </Text>
                        )}
                      </HStack>
                    </HStack>
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
                      {isInTeam && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedTeam(team);
                            enrollTeamDialog.setOpen(true);
                          }}
                        >
                          <IoTrophy />
                          Manage Ladders
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteTeam(team.id)}
                        loading={deletingTeams[team.id]}
                        aria-label="Delete team"
                      >
                        <Icon as={IoTrash} />
                      </Button>
                    </HStack>
                  </HStack>
                </Card.Header>
                <Card.Body p={4} pt={0}>
                  <Text>Players: {team.players?.items?.length || 0}/2</Text>
                  
                  {/* Display player names with highlighting */}
                  {team.players?.items && team.players.items.length > 0 && (
                    <Box mt={2}>
                      <Text fontWeight="medium" mb={1}>Team members:</Text>
                      <VStack align="left" spacing={1}>
                        {team.players.items.map((player) => (
                          <Text 
                            key={player.id}
                            color="blue.500"  
                            fontWeight="bold"
                            fontSize="sm"
                          >
                            {player.givenName} {player.familyName}
                            {player.id === currentPlayer?.id && (
                              <Text as="span" color="green.500" ml={1}>(You)</Text>
                            )}
                          </Text>
                        ))}
                      </VStack>
                    </Box>
                  )}
                  
                  {/* Error message for team deletion */}
                  {deleteErrors[team.id] && (
                    <Alert.Root status="error" mt={3} size="sm">
                      <Alert.Indicator />
                      <Alert.Title>{deleteErrors[team.id]}</Alert.Title>
                    </Alert.Root>
                  )}

                  {/* Team Ladders */}
                  {teamLadders.length > 0 && (
                    <Box mt={3}>
                      <Text fontWeight="medium" mb={2}>
                        Enrolled Ladders:
                      </Text>
                      <VStack align="stretch">
                        {teamLadders.map((ladder) => (
                          <HStack
                            key={ladder.id}
                            justifyContent="space-between"
                          >
                            <Text>{ladder.name}</Text>
                            {isInTeam && (
                              <Button
                                size="xs"
                                variant="outline"
                                onClick={() =>
                                  unenrollTeamFromLadder(team.id, ladder.id!)
                                }
                              >
                                <Icon as={IoRemoveCircle} boxSize={3} mr={1} />
                                Unenroll
                              </Button>
                            )}
                          </HStack>
                        ))}
                      </VStack>
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

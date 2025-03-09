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
  Stack,
  Table,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoPerson, IoPersonAdd } from "react-icons/io5";
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

// Base player type from schema
type Player = Schema["Player"]["type"];
type Team = Schema["Team"]["type"];

const client = generateClient<Schema>();

export function PlayersTab() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [teamName, setTeamName] = useState("");
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const addPlayerDialog = useDialog();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [playersPerPage] = useState(10);

  // Form states for new player
  const [newPlayerGivenName, setNewPlayerGivenName] = useState("");
  const [newPlayerFamilyName, setNewPlayerFamilyName] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");

  useEffect(() => {
    fetchPlayer();
    getAllPlayers();
  }, []);

  async function fetchPlayer() {
    try {
      const currentPlayer = await getCurrentPlayer();

      if (currentPlayer) {
        // Fetch the team relation data if player has a teamId
        if (currentPlayer.teamId) {
          try {
            const teamResult = await currentPlayer.teams();
            if (teamResult.data) {
              setTeamName(teamResult.data.name || "—");
            }
          } catch (teamError) {
            console.error("Error fetching player's team:", teamError);
            setTeamName("—");
          }
        } else {
          setTeamName("—");
        }

        setPlayer(currentPlayer);
      }
    } catch (error) {
      console.error("Error fetching player:", error);
    }
  }

  async function getAllPlayers() {
    setLoading(true);

    try {
      const { data: playerData, errors } = await client.models.Player.list();

      if (errors) {
        console.error("Error fetching players:", errors);
        // Continue with any available data rather than throwing
      }

      // Ensure we only use valid player objects to prevent UI errors
      if (playerData && Array.isArray(playerData)) {
        const validPlayers = playerData.filter(
          (player) =>
            player !== null &&
            typeof player === "object" &&
            player.id &&
            player.givenName &&
            player.familyName
        );

        // Sort players by name for better readability
        validPlayers.sort((a, b) => {
          return `${a.givenName} ${a.familyName}`.localeCompare(
            `${b.givenName} ${b.familyName}`
          );
        });

        setAllPlayers(validPlayers);
        console.log(`Fetched ${validPlayers.length} players`);
      } else {
        setAllPlayers([]);
      }
    } catch (error) {
      console.error("Error fetching players:", error);
      setAllPlayers([]);
    } finally {
      setLoading(false);
    }
  }

  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [createPlayerError, setCreatePlayerError] = useState<string | null>(
    null
  );

  async function createPlayer() {
    // Reset error state
    setCreatePlayerError(null);

    // Validate input
    if (!newPlayerGivenName.trim()) {
      setCreatePlayerError("First name is required");
      return;
    }

    if (!newPlayerFamilyName.trim()) {
      setCreatePlayerError("Last name is required");
      return;
    }

    if (!newPlayerEmail.trim()) {
      setCreatePlayerError("Email is required");
      return;
    }

    // Simple email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newPlayerEmail.trim())) {
      setCreatePlayerError("Please enter a valid email address");
      return;
    }

    setIsCreatingPlayer(true);

    try {
      const { data: createdPlayer, errors } = await client.models.Player.create(
        {
          givenName: newPlayerGivenName.trim(),
          familyName: newPlayerFamilyName.trim(),
          email: newPlayerEmail.trim(),
        }
      );

      if (errors) {
        console.error("Error creating player:", errors);
        setCreatePlayerError("Failed to create player. Please try again.");
        return;
      }

      console.log("Player created successfully:", createdPlayer);

      // Reset form fields
      setNewPlayerGivenName("");
      setNewPlayerFamilyName("");
      setNewPlayerEmail("");

      // Close the dialog
      addPlayerDialog.setOpen(false);

      // Refresh player list
      getAllPlayers();
    } catch (error) {
      console.error("Error creating player:", error);
      setCreatePlayerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreatingPlayer(false);
    }
  }

  // Get current players for pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = allPlayers.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  );
  const totalPages = Math.ceil(allPlayers.length / playersPerPage);

  // TeamCell component to display team information
  function TeamCell({ player }: { player: Player }) {
    const [teamName, setTeamName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      async function fetchTeam() {
        if (!player.teamId) {
          setTeamName("—");
          setLoading(false);
          return;
        }

        try {
          const teamResult = await player.teams();
          setTeamName(teamResult.data?.name || "Unknown Team");
        } catch (err) {
          console.error("Error fetching team:", err);
          setTeamName("Error loading team");
        } finally {
          setLoading(false);
        }
      }

      fetchTeam();
    }, [player]);

    if (loading) return <Text fontSize="sm">Loading...</Text>;
    return <Text>{teamName}</Text>;
  }

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Stack>
      {/* Current Player Section */}
      {player ? (
        <Card.Root p={4} mb={6}>
          <Card.Header>
            <Heading size="md">Your Profile</Heading>
          </Card.Header>
          <Card.Body>
            <HStack align="flex-start">
              <Box bg="blue.100" p={3} borderRadius="lg">
                <Icon as={IoPerson} boxSize={10} color="blue.500" />
              </Box>
              <VStack align="start">
                <Text fontWeight="bold" fontSize="lg">
                  {player.givenName} {player.familyName}
                </Text>
                <Text fontSize="md">{player.email}</Text>
                <HStack>
                  <Text fontWeight="medium" color="gray.700">
                    Team:
                  </Text>
                  <Text
                    fontWeight={player.teamId ? "medium" : "normal"}
                    color={player.teamId ? "blue.500" : "gray.500"}
                  >
                    {teamName || "—"}
                  </Text>
                </HStack>
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
      ) : (
        <Alert.Root status="info" mb={6}>
          <Alert.Indicator />
          <Alert.Title>No profile found</Alert.Title>
          <Alert.Description>
            Create a new player profile below to get started.
          </Alert.Description>
        </Alert.Root>
      )}

      {/* All Players Section */}
      <Box>
        <HStack justifyContent="space-between" mb={4}>
          <Heading size="md">All Players</Heading>

          <DialogRootProvider value={addPlayerDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IoPersonAdd />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Player</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <Stack>
                  <Field label="First Name">
                    <Input
                      placeholder="Enter first name"
                      value={newPlayerGivenName}
                      onChange={(e) => setNewPlayerGivenName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Last Name">
                    <Input
                      placeholder="Enter last name"
                      value={newPlayerFamilyName}
                      onChange={(e) => setNewPlayerFamilyName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      placeholder="Enter email"
                      type="email"
                      value={newPlayerEmail}
                      onChange={(e) => setNewPlayerEmail(e.target.value)}
                      required
                    />
                  </Field>

                  {createPlayerError && (
                    <Alert.Root status="error" mt={2}>
                      <Alert.Indicator />
                      <Alert.Title>{createPlayerError}</Alert.Title>
                    </Alert.Root>
                  )}
                </Stack>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button
                  onClick={createPlayer}
                  loading={isCreatingPlayer}
                  loadingText="Creating..."
                  disabled={
                    isCreatingPlayer ||
                    !newPlayerGivenName.trim() ||
                    !newPlayerFamilyName.trim() ||
                    !newPlayerEmail.trim()
                  }
                >
                  Create Player
                </Button>
              </DialogFooter>
              <DialogCloseTrigger />
            </DialogContent>
          </DialogRootProvider>
        </HStack>

        {loading ? (
          <Box textAlign="center" py={8}>
            <Spinner size="xl" />
            <Text mt={4}>Loading players...</Text>
          </Box>
        ) : allPlayers.length === 0 ? (
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>No players found</Alert.Title>
          </Alert.Root>
        ) : (
          <>
            <Card.Root variant="outline" mb={4}>
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Name</Table.ColumnHeader>
                    <Table.ColumnHeader>Email</Table.ColumnHeader>
                    <Table.ColumnHeader>Team</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {currentPlayers.map((player) => (
                    <Table.Row key={player.id}>
                      <Table.Cell fontWeight="medium">
                        {player.givenName} {player.familyName}
                      </Table.Cell>
                      <Table.Cell>{player.email}</Table.Cell>
                      <Table.Cell>
                        <TeamCell player={player} />
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>

            {/* Pagination */}
            <Box mt={6}>
              <HStack justifyContent="space-between" mb={3}>
                <Text fontSize="sm" color="gray.600">
                  Showing {indexOfFirstPlayer + 1}-
                  {Math.min(indexOfLastPlayer, allPlayers.length)} of{" "}
                  {allPlayers.length} players
                </Text>

                <HStack>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => paginate(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                  >
                    First
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <Text mr={1}>&laquo;</Text> Prev
                  </Button>

                  {/* Display a limited window of page numbers to avoid cluttering the UI */}
                  {[...Array(totalPages)].map((_, index) => {
                    // Only show pages around the current page
                    if (
                      index + 1 === 1 || // Always show first page
                      index + 1 === totalPages || // Always show last page
                      (index + 1 >= currentPage - 1 &&
                        index + 1 <= currentPage + 1) // Show pages around current
                    ) {
                      return (
                        <Button
                          key={index}
                          size="sm"
                          variant={
                            currentPage === index + 1 ? "solid" : "outline"
                          }
                          onClick={() => paginate(index + 1)}
                          backgroundColor={
                            currentPage === index + 1 ? "blue.500" : undefined
                          }
                          color={
                            currentPage === index + 1 ? "white" : undefined
                          }
                          minW="2.5rem"
                        >
                          {index + 1}
                        </Button>
                      );
                    }

                    // Show ellipsis if there's a gap
                    if (
                      (index + 1 === currentPage - 2 && currentPage > 3) ||
                      (index + 1 === currentPage + 2 &&
                        currentPage < totalPages - 2)
                    ) {
                      return <Text key={`ellipsis-${index}`}>...</Text>;
                    }

                    return null;
                  })}

                  <Button
                    size="sm"
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next <Text ml={1}>&raquo;</Text>
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => paginate(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                  >
                    Last
                  </Button>
                </HStack>
              </HStack>
            </Box>
          </>
        )}
      </Box>
    </Stack>
  );
}

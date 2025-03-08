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

      setPlayer(currentPlayer);
      setTeamName(currentPlayer?.teams.name || "—");
    } catch (error) {
      console.error("Error fetching player:", error);
    }
  }

  async function getAllPlayers() {
    setLoading(true);

    try {
      // Use selectionSet parameter to include team relationships
      const { data: playerData, errors } = await client.models.Player.list();

      if (errors) {
        console.error("Error fetching players:", errors);
        throw new Error("Failed to fetch players");
      }

      setAllPlayers(playerData);
      console.log("Players fetched successfully:", allPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createPlayer() {
    if (!newPlayerGivenName || !newPlayerFamilyName || !newPlayerEmail) {
      console.error("All fields are required");
      return;
    }

    try {
      const { data: createdPlayer, errors } = await client.models.Player.create(
        {
          givenName: newPlayerGivenName,
          familyName: newPlayerFamilyName,
          email: newPlayerEmail,
        }
      );

      if (errors) {
        console.error("Error creating player:", errors);
        throw new Error("Failed to create player");
      }

      console.log("Player created successfully:", createdPlayer);

      // Reset form fields
      setNewPlayerGivenName("");
      setNewPlayerFamilyName("");
      setNewPlayerEmail("");

      // Refresh player list
      getAllPlayers();
    } catch (error) {
      console.error("Error creating player:", error);
    }

    getAllPlayers();
  }

  // Get current players for pagination
  const indexOfLastPlayer = currentPage * playersPerPage;
  const indexOfFirstPlayer = indexOfLastPlayer - playersPerPage;
  const currentPlayers = allPlayers.slice(
    indexOfFirstPlayer,
    indexOfLastPlayer
  );
  const totalPages = Math.ceil(allPlayers.length / playersPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <Stack>
      {/* Current Player Section */}
      {player && (
        <Card.Root p={4}>
          <Card.Header>
            <Heading size="md">Your Profile</Heading>
          </Card.Header>
          <Card.Body>
            <HStack>
              <Icon as={IoPerson} boxSize={10} />
              <VStack align="start">
                <Text fontWeight="bold" fontSize="lg">
                  {player.givenName} {player.familyName} ({player.email})
                </Text>
                <Text color="gray.600">Player ID: {player.id}</Text>
                {player.teamId && (
                  <Text>
                    Team:{" "}
                    <Text as="span" fontWeight="bold">
                      {player.teams.name || "—"}
                    </Text>
                  </Text>
                )}
              </VStack>
            </HStack>
          </Card.Body>
        </Card.Root>
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
                    />
                  </Field>
                  <Field label="Last Name">
                    <Input
                      placeholder="Enter last name"
                      value={newPlayerFamilyName}
                      onChange={(e) => setNewPlayerFamilyName(e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <Input
                      placeholder="Enter email"
                      type="email"
                      value={newPlayerEmail}
                      onChange={(e) => setNewPlayerEmail(e.target.value)}
                    />
                  </Field>
                </Stack>
              </DialogBody>
              <DialogFooter>
                <DialogActionTrigger asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogActionTrigger>
                <Button
                  onClick={() => {
                    createPlayer();
                    addPlayerDialog.setOpen(false);
                  }}
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
                      <Table.Cell fontWeight="medium">
                        {player.email}
                      </Table.Cell>
                      <Table.Cell>
                        {player.teamId
                          ? player.teams.name || "Unknown Team"
                          : "—"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Card.Root>

            {/* Pagination */}
            <HStack justifyContent="center" mt={4}>
              <Button
                size="sm"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={currentPage === index + 1 ? "solid" : "outline"}
                  onClick={() => paginate(index + 1)}
                >
                  {index + 1}
                </Button>
              ))}

              <Button
                size="sm"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </HStack>
            <Text textAlign="center" fontSize="sm" color="gray.500" mt={2}>
              Showing {indexOfFirstPlayer + 1}-
              {Math.min(indexOfLastPlayer, allPlayers.length)} of{" "}
              {allPlayers.length} players
            </Text>
          </>
        )}
      </Box>
    </Stack>
  );
}

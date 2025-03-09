import {
  Alert,
  Box,
  Button,
  Card,
  DialogRootProvider,
  HStack,
  Icon,
  Input,
  Spinner,
  Text,
  useDialog,
  VStack,
  Table,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoTrash } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";
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

export function LaddersTab() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ladderName, setLadderName] = useState("");
  const [ladderDescription, setLadderDescription] = useState("");
  const addLadderDialog = useDialog();

  async function getLadders() {
    setLoading(true);

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
        setLadders(validLadders);
        console.log("Ladders fetched:", validLadders.length);
      } else {
        setLadders([]);
      }
    } catch (error) {
      console.error("Exception fetching ladders:", error);
      setLadders([]);
    } finally {
      setLoading(false);
    }
  }

  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  async function createLadder() {
    // Reset error state
    setCreateError(null);

    // Validate input
    if (!ladderName.trim()) {
      setCreateError("Ladder name is required");
      return;
    }

    setIsCreating(true);

    try {
      const { data: createdLadder, errors } = await client.models.Ladder.create(
        {
          name: ladderName.trim(),
          description: ladderDescription.trim() || undefined, // Only send if not empty
        }
      );

      if (errors) {
        console.error("Error creating ladder:", errors);
        setCreateError("Failed to create ladder. Please try again.");
        return;
      }

      console.log("Ladder created successfully:", createdLadder);

      // Clear form after successful creation
      setLadderName("");
      setLadderDescription("");

      // Refresh ladder list
      getLadders();

      // Success - close dialog
      addLadderDialog.setOpen(false);
    } catch (error) {
      console.error("Exception creating ladder:", error);
      setCreateError("An unexpected error occurred. Please try again.");
    } finally {
      setIsCreating(false);
    }
  }

  const [deletingLadders, setDeletingLadders] = useState<
    Record<string, boolean>
  >({});
  const [deleteError, setDeleteError] = useState<Record<string, string>>({});
  const deleteDialogRef = useDialog();
  const [ladderToDelete, setLadderToDelete] = useState<Ladder | null>(null);

  function confirmDeleteLadder(ladder: Ladder) {
    setLadderToDelete(ladder);
    deleteDialogRef.setOpen(true);
  }

  async function deleteLadder(id: string) {
    // Reset any previous error for this ladder
    setDeleteError((prev) => ({ ...prev, [id]: "" }));

    // Set the deleting state for this specific ladder
    setDeletingLadders((prev) => ({ ...prev, [id]: true }));

    try {
      const { errors } = await client.models.Ladder.delete({ id });

      if (errors) {
        console.error("Error deleting ladder:", errors);
        setDeleteError((prev) => ({
          ...prev,
          [id]: "Failed to delete ladder. It may be in use by enrollments.",
        }));
        return;
      }

      console.log("Ladder deleted successfully");

      // Refresh the ladder list
      getLadders();
    } catch (error) {
      console.error("Exception deleting ladder:", error);
      setDeleteError((prev) => ({
        ...prev,
        [id]: "An unexpected error occurred during deletion.",
      }));
    } finally {
      // Reset the deleting state
      setDeletingLadders((prev) => ({ ...prev, [id]: false }));
    }
  }

  useEffect(() => {
    getLadders();
  }, []);

  // Import type from resource schema
  type Team = Schema["Team"]["type"];
  type Enrollment = Schema["Enrollment"]["type"];
  type Player = Schema["Player"]["type"];

  interface TeamWithPlayers extends Team {
    playersList?: Player[];
  }

  // Component to display enrollments as a table sorted by rating
  function EnrollmentsDisplay({ ladder }: { ladder: Ladder }) {
    const [enrollmentData, setEnrollmentData] = useState<Enrollment[] | null>(
      null
    );
    const [teamsWithPlayers, setTeamsWithPlayers] = useState<TeamWithPlayers[]>(
      []
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      async function fetchEnrollments() {
        setLoading(true);
        setError(false);

        try {
          // Fetch enrollments for this ladder
          const enrollmentResult = await ladder.enrollments();

          if (enrollmentResult.errors) {
            console.error(
              "Error fetching enrollments:",
              enrollmentResult.errors
            );
            setError(true);
            return;
          }

          const enrollments = enrollmentResult.data || [];
          setEnrollmentData(enrollments);

          // If we have enrollments, fetch the team info and players for each one
          if (enrollments.length > 0) {
            const teamsData: TeamWithPlayers[] = [];

            // Create an array of promises to fetch teams in parallel
            const teamPromises = enrollments.map(async (enrollment) => {
              try {
                const teamResult = await enrollment.team();
                if (teamResult.data && teamResult.data.id) {
                  const team = teamResult.data;

                  // Fetch players for this team
                  const playersResult = await team.players();
                  const players = playersResult.data || [];

                  teamsData.push({
                    ...team,
                    playersList: players,
                  });
                }
              } catch (err) {
                console.error("Error fetching team or players:", err);
              }
            });

            // Wait for all team fetches to complete
            await Promise.all(teamPromises);

            // Sort teams by rating in descending order
            teamsData.sort((a, b) => (b.rating || 0) - (a.rating || 0));

            setTeamsWithPlayers(teamsData);
          }
        } catch (err) {
          console.error("Exception fetching enrollments:", err);
          setError(true);
        } finally {
          setLoading(false);
        }
      }

      fetchEnrollments();
    }, [ladder]);

    if (loading) return <Text fontSize="sm">Loading teams...</Text>;
    if (error)
      return (
        <Text fontSize="sm" color="red.500">
          Error loading teams
        </Text>
      );
    if (!enrollmentData || enrollmentData.length === 0)
      return <Text fontSize="sm">No teams enrolled</Text>;

    // Format player names
    function formatPlayers(players?: Player[]) {
      if (!players || players.length === 0) return "—";

      return players
        .map((player) => `${player.givenName} ${player.familyName}`)
        .join(", ");
    }

    return (
      <Box>
        <Text fontSize="sm" fontWeight="medium" mb={3}>
          {enrollmentData.length} team{enrollmentData.length !== 1 ? "s" : ""}{" "}
          enrolled:
        </Text>

        <Table.Root size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader width="40px">#</Table.ColumnHeader>
              <Table.ColumnHeader>Team</Table.ColumnHeader>
              <Table.ColumnHeader>Players</Table.ColumnHeader>
              <Table.ColumnHeader>Rating</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {teamsWithPlayers.map((team, index) => (
              <Table.Row key={team.id}>
                <Table.Cell fontWeight="medium">{index + 1}</Table.Cell>
                <Table.Cell fontWeight="medium">{team.name}</Table.Cell>
                <Table.Cell>{formatPlayers(team.playersList)}</Table.Cell>
                <Table.Cell fontWeight="medium">{team.rating}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Box>
    );
  }

  return (
    <>
      {/* Create Ladder Dialog */}
      <HStack justifyContent="flex-end" mb={4}>
        <DialogRootProvider value={addLadderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Create Ladder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Ladder</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field label="Ladder name">
                <Input
                  placeholder="Enter name..."
                  value={ladderName}
                  onChange={(e) => setLadderName(e.target.value)}
                />
              </Field>
              <Field label="Ladder description">
                <Input
                  placeholder="Enter description..."
                  value={ladderDescription}
                  onChange={(e) => setLadderDescription(e.target.value)}
                />
              </Field>
              {createError && (
                <Alert.Root status="error" mt={2}>
                  <Alert.Indicator />
                  <Alert.Title>{createError}</Alert.Title>
                </Alert.Root>
              )}
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button
                onClick={createLadder}
                loading={isCreating}
                loadingText="Creating..."
                disabled={isCreating || !ladderName.trim()}
              >
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRootProvider>
      </HStack>

      {/* Delete Confirmation Dialog */}
      <DialogRootProvider value={deleteDialogRef}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Ladder</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete the ladder "{ladderToDelete?.name}
              "?
              {"\n"}
              This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogActionTrigger asChild>
              <Button variant="outline">Cancel</Button>
            </DialogActionTrigger>
            <Button
              colorScheme="red"
              onClick={() => {
                if (ladderToDelete) {
                  deleteLadder(ladderToDelete.id);
                  deleteDialogRef.setOpen(false);
                }
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRootProvider>

      {/* Ladder List */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading ladders...</Text>
        </Box>
      ) : ladders.length === 0 ? (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>No ladders found</Alert.Title>
          <Alert.Description>Create a ladder to get started.</Alert.Description>
        </Alert.Root>
      ) : (
        <VStack align="stretch">
          {ladders.map((ladder) => (
            <Card.Root key={ladder.id}>
              <Card.Header>
                <HStack justifyContent="space-between" width="100%">
                  <Box>
                    <Text fontWeight="bold" fontSize="xl">
                      {ladder.name}
                    </Text>
                    {ladder.description && (
                      <Text color="gray.600">{ladder.description}</Text>
                    )}
                  </Box>
                  <Button
                    variant="ghost"
                    onClick={() => confirmDeleteLadder(ladder)}
                    aria-label="Delete ladder"
                    size="sm"
                    loading={deletingLadders[ladder.id]}
                  >
                    <Icon as={IoTrash} />
                  </Button>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Box mt={2} mb={2} overflowX="auto">
                  <EnrollmentsDisplay ladder={ladder} />
                </Box>

                <HStack fontSize="sm" color="gray.500" mt={4}>
                  <Text>
                    Created: {new Date(ladder.createdAt).toLocaleDateString()}
                  </Text>
                </HStack>

                {deleteError[ladder.id] && (
                  <Alert.Root status="error" mt={3} size="sm">
                    <Alert.Indicator />
                    <Alert.Title>{deleteError[ladder.id]}</Alert.Title>
                  </Alert.Root>
                )}
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </>
  );
}

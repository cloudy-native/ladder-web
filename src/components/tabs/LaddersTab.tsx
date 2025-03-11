"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  DialogRootProvider,
  Flex,
  HStack,
  Icon,
  Input,
  Spinner,
  Table,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { IoAddCircle, IoClose, IoRefresh, IoTrash } from "react-icons/io5";
import { Ladder, Player } from '../../utils/amplify-helpers';
import {
  useFilter,
  useLadderCreate,
  useLadderDelete,
  useLadderList,
  useTeamsForLadder,
} from "../../utils/hooks";
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

// Component to display teams in a ladder as a table sorted by rating
function TeamsDisplay({ ladder }: { ladder: Ladder }) {
  const { teamsWithPlayers, loading, error } = useTeamsForLadder(ladder.id);

  if (loading) return <Text fontSize="sm">Loading teams...</Text>;
  if (error)
    return (
      <Text fontSize="sm" color="red.500">
        Error loading teams
      </Text>
    );
  if (teamsWithPlayers.length === 0)
    return <Text fontSize="sm">No teams in this ladder</Text>;

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
        {teamsWithPlayers.length} team{teamsWithPlayers.length !== 1 ? "s" : ""}{" "}
        in ladder:
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

export function LaddersTab() {
  // Custom hooks for ladder data and operations
  const { ladders, loading, refreshLadders } = useLadderList();
  const { createLadder, isCreating, createError } = useLadderCreate();
  const { deleteLadder, deletingLadders, deleteError } = useLadderDelete();

  // Filter hook
  const ladderFilter = useCallback((ladder: Ladder, searchText: string) => {
    // Check ladder name
    if (ladder.name.toLowerCase().includes(searchText)) return true;

    // Check ladder description if it exists
    if (
      ladder.description &&
      ladder.description.toLowerCase().includes(searchText)
    ) {
      return true;
    }

    return false;
  }, []);

  const {
    filterText,
    setFilterText,
    filteredItems: filteredLadders,
    clearFilter,
  } = useFilter(ladders, ladderFilter);

  // Form state
  const [ladderName, setLadderName] = useState("");
  const [ladderDescription, setLadderDescription] = useState("");

  // Dialog state
  const addLadderDialog = useDialog();
  const deleteDialogRef = useDialog();
  const [ladderToDelete, setLadderToDelete] = useState<Ladder | null>(null);

  // Functions for UI operations
  const handleCreateLadder = async () => {
    const created = await createLadder(ladderName, ladderDescription);
    if (created) {
      // Clear form after successful creation
      setLadderName("");
      setLadderDescription("");

      // Refresh ladder list
      refreshLadders();

      // Close dialog
      addLadderDialog.setOpen(false);
    }
  };

  const confirmDeleteLadder = (ladder: Ladder) => {
    setLadderToDelete(ladder);
    deleteDialogRef.setOpen(true);
  };

  const handleDeleteLadder = async () => {
    if (ladderToDelete) {
      const success = await deleteLadder(ladderToDelete.id);
      if (success) {
        refreshLadders();
      }
      deleteDialogRef.setOpen(false);
    }
  };

  const refreshData = () => {
    refreshLadders();
    clearFilter();
  };

  return (
    <Box>
      {/* Action Buttons */}
      <HStack justifyContent="flex-end" mb={4}>
        <Button onClick={refreshData}>
          <Icon as={IoRefresh} mr={2} /> Refresh
        </Button>
        <DialogRootProvider value={addLadderDialog}>
          <DialogTrigger asChild>
            <Button>
              <Icon as={IoAddCircle} mr={2} /> Create Ladder
            </Button>
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
                <Button>Cancel</Button>
              </DialogActionTrigger>
              <Button
                onClick={handleCreateLadder}
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

      {/* Search input */}
      <Box mb={4}>
        <Flex gap={4} alignItems="center">
          <Input
            placeholder="Search by ladder name or description..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            flex="1"
            bg="white"
          />
          {filterText && (
            <Button
              size="sm"
              variant="ghost"
              onClick={clearFilter}
              aria-label="Clear search"
            >
              <Icon as={IoClose} />
            </Button>
          )}
        </Flex>
      </Box>

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
              <Button>Cancel</Button>
            </DialogActionTrigger>
            <Button colorScheme="red" onClick={handleDeleteLadder}>
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
      ) : filteredLadders.length === 0 ? (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>No ladders match your search</Alert.Title>
          <Alert.Description>
            Try a different search term or clear your filter.
          </Alert.Description>
        </Alert.Root>
      ) : (
        <VStack align="stretch">
          {filteredLadders.map((ladder) => (
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
                  <TeamsDisplay ladder={ladder} />
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
    </Box>
  );
}

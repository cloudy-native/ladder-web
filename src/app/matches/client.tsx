"use client";

import { formatFriendlyDate } from "@/utils/dates";
import {
  Alert,
  Box,
  Button,
  Container,
  createListCollection,
  Heading,
  HStack,
  Icon,
  SelectContent,
  SelectItem,
  SelectRoot,
  SelectTrigger,
  SelectValueText,
  Spinner,
  Table,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { IoAddCircle, IoRefresh, IoTrophy } from "react-icons/io5";
import { Pagination, SearchInput } from "../../components/shared";
import { Field } from "../../components/ui/field";
import {
  MatchWithDetails,
  useFilter,
  useLadderList,
  useMatchCreate,
  useMatchList,
  usePagination,
  useTeamsForMatch,
} from "../../utils/hooks";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Matches
      </Heading>
      <MatchesPage />
    </Container>
  );
}

function MatchesPage() {
  // Custom hooks
  const { matches, loading, refreshMatches } = useMatchList();
  const { ladders } = useLadderList();

  // State for create match dialog
  const createMatchDialog = useDialog();
  const [selectedLadderId, setSelectedLadderId] = useState<string>("");
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>("");
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>("");
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>("");

  // Filter hook
  const matchFilter = useCallback(
    (match: MatchWithDetails, searchText: string) => {
      // Check team names
      if (match.team1Details?.name?.toLowerCase().includes(searchText))
        return true;
      if (match.team2Details?.name?.toLowerCase().includes(searchText))
        return true;

      // Check ladder name
      if (match.ladderDetails?.name?.toLowerCase().includes(searchText))
        return true;

      return false;
    },
    []
  );

  const {
    filterText,
    setFilterText,
    filteredItems: filteredMatches,
    clearFilter,
  } = useFilter(matches, matchFilter);

  // Pagination
  const MATCHES_PER_PAGE = 10;
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedMatches,
    firstItemIndex,
    lastItemIndex,
    totalItems,
  } = usePagination(filteredMatches, MATCHES_PER_PAGE);

  // Reset form when dialog opens/closes
  React.useEffect(() => {
    if (!createMatchDialog.open) {
      // Reset form when dialog closes
      setSelectedLadderId("");
      setSelectedTeam1Id("");
      setSelectedTeam2Id("");
      setSelectedWinnerId("");
    }
  }, [createMatchDialog.open]);

  // Team options for selected ladder
  const { teams: teamsForLadder, loading: loadingTeams } =
    useTeamsForMatch(selectedLadderId);

  // Create match hook
  const { createMatch, isCreating, createError } = useMatchCreate();

  // Handle match creation
  const handleCreateMatch = async () => {
    const created = await createMatch(
      selectedLadderId,
      selectedTeam1Id,
      selectedTeam2Id,
      selectedWinnerId || undefined
    );

    if (created) {
      refreshMatches();
      createMatchDialog.setOpen(false);
    }
  };

  // Function to refresh all data
  const refreshData = () => {
    refreshMatches();
    clearFilter();
    setCurrentPage(1);
  };

  return (
    <Box>
      {/* Header and action buttons */}
      <Box mb={4}>
        <HStack justifyContent="flex-end" mb={4}>
          <Button onClick={refreshData}>
            <Icon as={IoRefresh} mr={2} /> Refresh
          </Button>
          <DialogRoot {...createMatchDialog}>
            <DialogTrigger asChild>
              <Button>
                <Icon as={IoAddCircle} mr={2} /> Record Match
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Match</DialogTitle>
              </DialogHeader>
              <DialogBody>
                <VStack align="stretch">
                  <Field label="Ladder">
                    {/* <Select
                        placeholder="Select ladder"
                        value={selectedLadderId}
                        onChange={(e) => {
                          setSelectedLadderId(e.target.value);
                          // Reset team selections when ladder changes
                          setSelectedTeam1Id("");
                          setSelectedTeam2Id("");
                          setSelectedWinnerId("");
                        }}
                      >
                        {ladders.map((ladder) => (
                          <option key={ladder.id} value={ladder.id}>
                            {ladder.name}
                          </option>
                        ))}
                      </Select> */}
                  </Field>

                  {selectedLadderId && (
                    <>
                      <Field label="Team 1">
                      </Field>

                      <Field label="Team 2">
                      </Field>

                      {selectedTeam1Id && selectedTeam2Id && (
                        <Field
                          label="Winner (optional)"
                          helperText="If you select a winner, team ratings will be updated automatically."
                        >
                        </Field>
                      )}
                    </>
                  )}

                  {!selectedLadderId && teamsForLadder.length === 0 && (
                    <Alert.Root status="info">
                      <Alert.Indicator />
                      <Alert.Title>Select a ladder first</Alert.Title>
                    </Alert.Root>
                  )}

                  {selectedLadderId && teamsForLadder.length < 2 && (
                    <Alert.Root status="warning">
                      <Alert.Indicator />
                      <Alert.Title>Not enough teams</Alert.Title>
                      <Alert.Description>
                        This ladder needs at least 2 teams to record a match.
                      </Alert.Description>
                    </Alert.Root>
                  )}

                  {createError && (
                    <Alert.Root status="error">
                      <Alert.Indicator />
                      <Alert.Title>{createError}</Alert.Title>
                    </Alert.Root>
                  )}
                </VStack>
              </DialogBody>
              <DialogFooter>
                <Button onClick={() => createMatchDialog.setOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateMatch}
                  loading={isCreating}
                  loadingText="Recording..."
                  disabled={
                    isCreating ||
                    !selectedLadderId ||
                    !selectedTeam1Id ||
                    !selectedTeam2Id
                  }
                >
                  Record Match
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogRoot>
        </HStack>
      </Box>

      {/* Search input */}
      <Box mb={4}>
        <SearchInput
          value={filterText}
          onChange={setFilterText}
          placeholder="Search by team name or ladder..."
        />
      </Box>

      {/* Matches List */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading matches...</Text>
        </Box>
      ) : matches.length === 0 ? (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>No matches found</Alert.Title>
          <Alert.Description>
            Record some matches to see them here.
          </Alert.Description>
        </Alert.Root>
      ) : (
        <VStack align="stretch">
          {filteredMatches.length === 0 ? (
            <Alert.Root status="info">
              <Alert.Indicator />
              <Alert.Title>No matches match your search</Alert.Title>
              <Alert.Description>
                Try a different search term or clear your filter.
              </Alert.Description>
            </Alert.Root>
          ) : (
            <>
              <Table.Root size="md">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Ladder</Table.ColumnHeader>
                    <Table.ColumnHeader>Team 1</Table.ColumnHeader>
                    <Table.ColumnHeader>Team 2</Table.ColumnHeader>
                    <Table.ColumnHeader>Played On</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedMatches.map((match) => (
                    <Table.Row key={match.id}>
                      <Table.Cell>
                        {match.ladderDetails?.name || "Unknown Ladder"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winnerId === match.team1Id ? "bold" : "normal"
                        }
                      >
                        {match.winnerId === match.team1Id && (
                          <Icon as={IoTrophy} color="yellow.500" mr={2} />
                        )}
                        {match.team1Details?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winnerId === match.team2Id ? "bold" : "normal"
                        }
                      >
                        {match.winnerId === match.team2Id && (
                          <Icon as={IoTrophy} color="yellow.500" mr={2} />
                        )}
                        {match.team2Details?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell>
                        {match.playedOn
                          ? formatFriendlyDate(match.playedOn)
                          : "Not played"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {/* Pagination controls */}
              {filteredMatches.length > MATCHES_PER_PAGE && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={totalItems}
                  firstItemIndex={firstItemIndex}
                  lastItemIndex={lastItemIndex}
                  itemLabel="matches"
                />
              )}
            </>
          )}
        </VStack>
      )}
    </Box>
  );
}

import {
  Alert,
  Box,
  Button,
  createListCollection,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRootProvider,
  DialogTitle,
  DialogTrigger,
  Flex,
  Heading,
  HStack,
  Icon,
  SelectContent,
  SelectItem,
  SelectLabel,
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
import {
  MatchWithDetails,
  useFilter,
  useLadderList,
  useMatchCreate,
  useMatchList,
  usePagination,
  useTeamsForMatch,
} from "../../utils/hooks";
import { Pagination, SearchInput } from "../shared";
import { Field } from "../ui/field";

export function MatchesTab() {
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

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <Box>
      {/* Header and action buttons */}
      <Box mb={4}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Match History</Heading>
          <HStack>
            <Button onClick={refreshData}>
              <Icon as={IoRefresh} mr={2} /> Refresh
            </Button>
            <DialogRootProvider value={createMatchDialog}>
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
                      <SelectRoot
                        collection={createListCollection({ items: ladders })}
                        size="sm"
                        width="320px"
                        onChange={(e) => {
                          setSelectedLadderId(e.target);
                          // Reset team selections when ladder changes
                          setSelectedTeam1Id("");
                          setSelectedTeam2Id("");
                          setSelectedWinnerId("");
                        }}
                      >
                        <SelectTrigger>
                          <SelectValueText placeholder="Select ladder" />
                        </SelectTrigger>
                        <SelectContent>
                          {ladders.map((ladder) => (
                            <SelectItem item={ladder} key={ladder.id}>
                              {ladder.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </SelectRoot>
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
                          {/* <Select
                            placeholder="Select team 1"
                            value={selectedTeam1Id}
                            onChange={(e) => {
                              setSelectedTeam1Id(e.target.value);
                              // Reset winner if it was this team
                              if (selectedWinnerId === e.target.value) {
                                setSelectedWinnerId("");
                              }
                            }}
                            isDisabled={
                              loadingTeams || teamsForLadder.length === 0
                            }
                          >
                            {teamsForLadder.map((team) => (
                              <option key={team.id} value={team.id}>
                                {team.name} (Rating: {team.rating})
                              </option>
                            ))}
                          </Select> */}
                        </Field>

                        <Field label="Team 2">
                          {/* <Select
                            placeholder="Select team 2"
                            value={selectedTeam2Id}
                            onChange={(e) => {
                              setSelectedTeam2Id(e.target.value);
                              // Reset winner if it was this team
                              if (selectedWinnerId === e.target.value) {
                                setSelectedWinnerId("");
                              }
                            }}
                            isDisabled={
                              loadingTeams || teamsForLadder.length === 0
                            }
                          >
                            {teamsForLadder
                              .filter((team) => team.id !== selectedTeam1Id) // Filter out team 1
                              .map((team) => (
                                <option key={team.id} value={team.id}>
                                  {team.name} (Rating: {team.rating})
                                </option>
                              ))}
                          </Select> */}
                        </Field>

                        {selectedTeam1Id && selectedTeam2Id && (
                          <Field
                            label="Winner (optional)"
                            helperText="If you select a winner, team ratings will be updated automatically."
                          >
                            {/* <Select
                              placeholder="Select winner (optional)"
                              value={selectedWinnerId}
                              onChange={(e) =>
                                setSelectedWinnerId(e.target.value)
                              }
                            >
                              <option value={selectedTeam1Id}>
                                {
                                  teamsForLadder.find(
                                    (t) => t.id === selectedTeam1Id
                                  )?.name
                                }
                              </option>
                              <option value={selectedTeam2Id}>
                                {
                                  teamsForLadder.find(
                                    (t) => t.id === selectedTeam2Id
                                  )?.name
                                }
                              </option>
                            </Select> */}
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
                <DialogCloseTrigger />
              </DialogContent>
            </DialogRootProvider>
          </HStack>
        </Flex>
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
                    <Table.ColumnHeader>Date</Table.ColumnHeader>
                    <Table.ColumnHeader>Ladder</Table.ColumnHeader>
                    <Table.ColumnHeader>Team 1</Table.ColumnHeader>
                    <Table.ColumnHeader>Team 2</Table.ColumnHeader>
                    <Table.ColumnHeader>Winner</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {paginatedMatches.map((match) => (
                    <Table.Row key={match.id}>
                      <Table.Cell>{formatDate(match.createdAt)}</Table.Cell>
                      <Table.Cell>
                        {match.ladderDetails?.name || "Unknown Ladder"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winnerId === match.team1Id ? "bold" : "normal"
                        }
                      >
                        {match.team1Details?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winnerId === match.team2Id ? "bold" : "normal"
                        }
                      >
                        {match.team2Details?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell>
                        {match.winnerId ? (
                          <Flex alignItems="center">
                            <Icon as={IoTrophy} color="yellow.500" mr={2} />
                            {match.winnerDetails?.name ||
                              (match.winnerId === match.team1Id
                                ? match.team1Details?.name
                                : match.team2Details?.name) ||
                              "Unknown Winner"}
                          </Flex>
                        ) : (
                          "Not recorded"
                        )}
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

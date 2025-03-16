import { Pagination, SearchInput } from "@/components/shared";
import {
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Field,
} from "@/components/ui";
import { PAGE_SIZE } from "@/utils/constants";
import { formatFriendlyDate } from "@/utils/dates";
import {
  MatchWithLadderAndTeams,
  useFilter,
  useMatchCreate,
  useMatchList,
  usePagination,
  useTeamsForLadder,
} from "@/utils/hooks";
import {
  Alert,
  Box,
  Button,
  HStack,
  Icon,
  Spinner,
  Table,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import React, { useCallback, useState } from "react";
import { IoAddCircle, IoRefresh, IoTrophy } from "react-icons/io5";

export function MatchesPage() {
  // Custom hooks
  const { matches, loading: loadingMatches, refreshMatches } = useMatchList();

  // State for create match dialog
  const createMatchDialog = useDialog();
  const [selectedLadderId, setSelectedLadderId] = useState<string>("");
  const [selectedTeam1Id, setSelectedTeam1Id] = useState<string>("");
  const [selectedTeam2Id, setSelectedTeam2Id] = useState<string>("");
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>("");

  // Filter hook
  const matchFilter = useCallback(
    (match: MatchWithLadderAndTeams, searchText: string) => {
      // Check team names
      if (match.team1?.name.toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }
      if (match.team2?.name.toLowerCase().includes(searchText.toLowerCase())) {
        return true;
      }

      // Check ladder name
      if (
        match.ladder?.name?.toLowerCase().includes(searchText.toLowerCase())
      ) {
        return true;
      }

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
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedMatches,
    firstItemIndex,
    lastItemIndex,
    totalItems,
  } = usePagination(filteredMatches);

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
  const { teamsWithPlayers, loading: loadingTeams } =
    useTeamsForLadder(selectedLadderId);

  if (loadingTeams) return <Text fontSize="sm">Loading teams...</Text>;
  if (loadingMatches) return <Text fontSize="sm">Loading matches...</Text>;

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
                      <Field label="Team 1"></Field>
                      <Field label="Team 2"></Field>
                      {selectedTeam1Id && selectedTeam2Id && (
                        <Field
                          label="Winner (optional)"
                          helperText="If you select a winner, team ratings will be updated automatically."
                        ></Field>
                      )}
                    </>
                  )}

                  {!selectedLadderId && teamsWithPlayers.length === 0 && (
                    <Alert.Root status="info">
                      <Alert.Indicator />
                      <Alert.Title>Select a ladder first</Alert.Title>
                    </Alert.Root>
                  )}

                  {selectedLadderId && teamsWithPlayers.length < 2 && (
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
      {loadingMatches ? (
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
                    <Table.Row key={match.match.id}>
                      <Table.Cell>
                        {match.ladder?.name || "Unknown Ladder"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winner?.id === match.team1?.id
                            ? "bold"
                            : "normal"
                        }
                      >
                        {match.winner?.id === match.team1?.id && (
                          <Icon as={IoTrophy} color="yellow.500" mr={2} />
                        )}
                        {match.team1?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell
                        fontWeight={
                          match.winner?.id === match.team2?.id
                            ? "bold"
                            : "normal"
                        }
                      >
                        {match.winner?.id === match.team2?.id && (
                          <Icon as={IoTrophy} color="yellow.500" mr={2} />
                        )}
                        {match.team2?.name || "Unknown Team"}
                      </Table.Cell>
                      <Table.Cell>
                        {match.match.playedOn
                          ? formatFriendlyDate(match.match.playedOn)
                          : "Not played"}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {/* Pagination controls */}
              {filteredMatches.length > PAGE_SIZE && (
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

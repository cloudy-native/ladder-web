"use client";

import {
  Alert,
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Icon,
  Spinner,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { useCallback, useState } from "react";
import { IoAddCircle, IoRefresh } from "react-icons/io5";
import { Pagination, SearchInput } from "../../components/shared";
import {
  CreateTeamDialog,
  JoinTeamDialog,
  LadderManager,
  TeamCard,
} from "../../components/teams";
import {
  TeamWithPlayers,
  useFilter,
  usePagination,
  useTeamList,
} from "../../utils/hooks";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Teams
      </Heading>
      <TeamsPage />
    </Container>
  );
}

function TeamsPage() {
  // Custom hooks
  const { teams, loading, refreshTeams } = useTeamList();

  // Filter hook
  const teamFilter = useCallback(
    (team: TeamWithPlayers, searchText: string) => {
      // Check team name
      if (team.name.toLowerCase().includes(searchText)) return true;

      // Check player names
      if (
        team.player1Details &&
        `${team.player1Details.givenName} ${team.player1Details.familyName}`
          .toLowerCase()
          .includes(searchText)
      ) {
        return true;
      }

      if (
        team.player2Details &&
        `${team.player2Details.givenName} ${team.player2Details.familyName}`
          .toLowerCase()
          .includes(searchText)
      ) {
        return true;
      }

      // Check ladder name
      if (
        team.ladderDetails &&
        team.ladderDetails.name.toLowerCase().includes(searchText)
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
    filteredItems: filteredTeams,
    clearFilter,
  } = useFilter(teams, teamFilter);

  // Pagination
  const TEAMS_PER_PAGE = 5;
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedTeams,
    firstItemIndex,
    lastItemIndex,
    totalItems,
  } = usePagination(filteredTeams, TEAMS_PER_PAGE);

  // Dialogs
  const addTeamDialog = useDialog();
  const joinTeamDialog = useDialog();
  const ladderDialog = useDialog();

  // Selected team state
  const [selectedTeam, setSelectedTeam] = useState<TeamWithPlayers | null>(
    null
  );

  // Function to refresh all data
  const refreshData = () => {
    refreshTeams();
    // Reset to first page on refresh
    setCurrentPage(1);
    // Clear filter
    clearFilter();
  };

  // Handle team click
  const handleTeamClick = (team: TeamWithPlayers) => {
    setSelectedTeam(team);
    joinTeamDialog.setOpen(true);
  };

  // Handle ladder management
  const handleManageLadder = (team: TeamWithPlayers, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    setSelectedTeam(team);
    ladderDialog.setOpen(true);
  };

  return (
    <Box>
      {/* Action Buttons */}
      <Box mb={4}>
        <HStack justifyContent="flex-end" mb={4}>
          <Button onClick={refreshData}>
            <Icon as={IoRefresh} mr={2} /> Refresh
          </Button>
          <CreateTeamDialog
            dialog={addTeamDialog}
            onTeamCreated={refreshTeams}
            triggerButton={
              <Button>
                <Icon as={IoAddCircle} mr={2} /> Create Team
              </Button>
            }
          />
        </HStack>
      </Box>

      {/* Search input */}
      <Box mb={4}>
        <SearchInput
          value={filterText}
          onChange={setFilterText}
          placeholder="Search by team name, player, or ladder..."
        />
      </Box>

      {/* Ladder Manager Dialog */}
      {selectedTeam && (
        <LadderManager
          team={selectedTeam}
          dialogRef={ladderDialog}
          onLadderChanged={refreshTeams}
        />
      )}

      {/* Join Team Dialog */}
      {selectedTeam && (
        <JoinTeamDialog
          team={selectedTeam}
          dialogRef={joinTeamDialog}
          onTeamJoined={refreshTeams}
          teams={teams}
        />
      )}

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
          {/* Teams for current page */}
          <VStack align="stretch">
            {filteredTeams.length === 0 ? (
              <Alert.Root status="info">
                <Alert.Indicator />
                <Alert.Title>No teams match your search</Alert.Title>
                <Alert.Description>
                  Try a different search term or clear your filter.
                </Alert.Description>
              </Alert.Root>
            ) : (
              paginatedTeams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  onClick={() => handleTeamClick(team)}
                />
              ))
            )}
          </VStack>

          {/* Pagination controls */}
          {filteredTeams.length > TEAMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={totalItems}
              firstItemIndex={firstItemIndex}
              lastItemIndex={lastItemIndex}
              itemLabel="teams"
            />
          )}
        </VStack>
      )}
    </Box>
  );
}

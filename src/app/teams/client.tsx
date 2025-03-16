"use client";

import { Pagination, SearchInput } from "@/components/shared";
import {
  CreateTeamDialog,
  TeamCard
} from "@/components/teams";
import { PAGE_SIZE } from "@/utils/constants";
import { TeamWithPlayers } from "@/utils/crudl";
import { formatPlayerName } from "@/utils/data";
import {
  useFilter,
  usePagination,
  useTeamList,
} from "@/utils/hooks";
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
  const { teamsWithPlayers, loading, refreshTeams } = useTeamList();

  // Filter hook
  const teamFilter = useCallback(
    (team: TeamWithPlayers, searchText: string) => {
      // Check team name
      if (team.team.name.toLowerCase().includes(searchText.toLowerCase())) return true;

      // Check player names
      if (team.player1 && formatPlayerName(team.player1).includes(searchText.toLowerCase()))
        return true;
      if (team.player2 && formatPlayerName(team.player2).includes(searchText.toLowerCase()))
        return true;

      return false;
    },
    []
  );

  const {
    filterText,
    setFilterText,
    filteredItems: filteredTeams,
    clearFilter,
  } = useFilter(teamsWithPlayers, teamFilter);

  // Pagination
  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedItems: paginatedTeams,
    firstItemIndex,
    lastItemIndex,
    totalItems,
  } = usePagination(filteredTeams);

  // Dialogs
  const addTeamDialog = useDialog();
  const joinTeamDialog = useDialog();
  // const ladderDialog = useDialog();

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
  // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
  // const handleManageLadder = (team: TeamWithPlayers, e: React.MouseEvent) => {
  //   e.stopPropagation(); // Prevent card click event
  //   setSelectedTeam(team);
  //   ladderDialog.setOpen(true);
  // };

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
      Ladder Manager Dialog
      {/* {selectedTeam && (
        <LadderManager
          team={selectedTeam}
          dialogRef={ladderDialog}
          onLadderChanged={refreshTeams}
        />
      )} */}
      {/* Join Team Dialog */}
      {/* {selectedTeam && (
        <JoinTeamDialog
          team={selectedTeam}
          dialogRef={joinTeamDialog}
          onTeamJoined={refreshTeams}
          teams={teams}
        />
      )} */}
      {/* Teams List */}
      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading teams...</Text>
        </Box>
      ) : teamsWithPlayers.length === 0 ? (
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
              paginatedTeams.map((teamWithPlayers) => (
                <TeamCard
                  key={teamWithPlayers.team.id}
                  teamWithPlayers={teamWithPlayers}
                  onClick={() => handleTeamClick(teamWithPlayers)}
                />
              ))
            )}
          </VStack>

          {/* Pagination controls */}
          {filteredTeams.length > PAGE_SIZE && (
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

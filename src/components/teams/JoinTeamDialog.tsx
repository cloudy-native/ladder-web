import React from 'react';
import {
  Alert,
  Box,
  Button,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRootProvider,
  DialogTitle,
  DialogActionTrigger,
  DialogTrigger,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IoClose, IoPersonAdd, IoRemove } from "react-icons/io5";
import { TeamWithPlayers } from '../../utils/hooks/useTeams';
import { usePlayer, useTeamJoin } from '../../utils/hooks';

interface JoinTeamDialogProps {
  team: TeamWithPlayers;
  dialogRef: any;
  onTeamJoined: () => void;
  teams: TeamWithPlayers[];
  trigger?: React.ReactNode;
}

export function JoinTeamDialog({
  team,
  dialogRef,
  onTeamJoined,
  teams,
  trigger,
}: JoinTeamDialogProps) {
  const { currentPlayer, isPlayerInTeam, isPlayerOnAnyTeam } = usePlayer();
  const { joinTeam, leaveTeam, isJoining, joinError } = useTeamJoin();

  const isInTeam = currentPlayer ? isPlayerInTeam(team.id, teams) : false;
  const isOnAnyTeam = currentPlayer ? isPlayerOnAnyTeam(teams) : false;

  const handleJoinTeam = async () => {
    if (currentPlayer) {
      const success = await joinTeam(team.id, currentPlayer, teams);
      if (success) {
        onTeamJoined();
        dialogRef.setOpen(false);
      }
    }
  };

  const handleLeaveTeam = async () => {
    if (currentPlayer) {
      const success = await leaveTeam(team.id, currentPlayer);
      if (success) {
        onTeamJoined();
        dialogRef.setOpen(false);
      }
    }
  };

  return (
    <DialogRootProvider value={dialogRef}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Join Team</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            Are you sure you want to join{" "}
            <Text as="span" fontWeight="bold">
              {team.name}
            </Text>
            ?
          </Text>

          {/* Show slot information */}
          <Box mt={2}>
            <Text fontWeight="medium">Team Slots:</Text>
            <VStack align="flex-start" mt={1} spacing={1}>
              <Text>
                Player 1:{" "}
                {team.player1Details
                  ? `${team.player1Details.givenName} ${team.player1Details.familyName}`
                  : "Available"}
              </Text>
              <Text>
                Player 2:{" "}
                {team.player2Details
                  ? `${team.player2Details.givenName} ${team.player2Details.familyName}`
                  : "Available"}
              </Text>
            </VStack>
          </Box>

          {/* Check if player is already on a team */}
          {(isOnAnyTeam || isInTeam) && (
            <Alert.Root status="warning" mt={4}>
              <Alert.Indicator />
              <Alert.Title>
                {isInTeam
                  ? "You are already a member of this team."
                  : "You are already a member of another team. Joining this team will remove you from your current team."}
              </Alert.Title>
            </Alert.Root>
          )}

          {joinError && (
            <Alert.Root status="error" mt={4}>
              <Alert.Indicator />
              <Alert.Title>{joinError}</Alert.Title>
            </Alert.Root>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button>
              <Icon as={IoClose} mr={2} /> Cancel
            </Button>
          </DialogActionTrigger>
          {isInTeam ? (
            <Button
              colorScheme="red"
              onClick={handleLeaveTeam}
              isLoading={isJoining}
            >
              <Icon as={IoRemove} mr={2} /> Leave Team
            </Button>
          ) : (
            <Button
              onClick={handleJoinTeam}
              isLoading={isJoining}
              loadingText="Joining..."
              isDisabled={
                isJoining ||
                !currentPlayer ||
                (!team.player1Id && !team.player2Id)
              }
            >
              <Icon as={IoPersonAdd} mr={2} /> Join
            </Button>
          )}
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRootProvider>
  );
}
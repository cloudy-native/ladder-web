import {
  Alert,
  Box,
  Button,
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRootProvider,
  DialogTitle,
  DialogTrigger,
  Icon,
  Text,
  VStack,
} from "@chakra-ui/react";
import React, { RefObject, useState } from "react";
import { IoClose, IoPersonAdd, IoPersonRemove } from "react-icons/io5";
import { useTeamJoin } from "../../utils/hooks";
import { TeamWithPlayers } from "../../utils/hooks/useTeams";
import { Player } from "../../utils/amplify-helpers";

interface JoinTeamDialogProps {
  team: TeamWithPlayers;
  dialogRef: RefObject<HTMLDivElement>;
  onTeamChanged: () => void; // Renamed prop
  currentPlayer?: Player; // Added current player
  trigger?: React.ReactNode;
}

export function JoinTeamDialog({
  team,
  dialogRef,
  onTeamChanged,
  currentPlayer,
  trigger,
}: JoinTeamDialogProps) {
  const { joinTeam, leaveTeam, isJoining, joinError } = useTeamJoin();
  const [isLeaving, setIsLeaving] = useState<boolean>(false);

  // Determine if the current user is on this team
  const isCurrentPlayerOnTeam =
    currentPlayer &&
    (team.player1Id === currentPlayer.id ||
      team.player2Id === currentPlayer.id);

  // Determine if the team is full
  const isTeamFull = team.player1Id && team.player2Id;

  const handleJoin = async () => {
    if (currentPlayer) {
      const success = await joinTeam(team.id, currentPlayer);
      if (success) {
        onTeamChanged();
      }
    }
  };

  const handleLeave = async () => {
    setIsLeaving(true);
    if (currentPlayer) {
      const success = await leaveTeam(team.id, currentPlayer);
      if (success) {
        onTeamChanged();
      }
    }
    setIsLeaving(false);
  };

  return (
    <DialogRootProvider value={dialogRef}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isCurrentPlayerOnTeam ? "Leave Team" : "Join Team"}
          </DialogTitle>
        </DialogHeader>
        <DialogBody>
          <Text>
            {isCurrentPlayerOnTeam
              ? `Are you sure you want to leave "${team.name}"?`
              : `Are you sure you want to join "${team.name}"?`}
          </Text>

          {/* Show slot information */}
          <Box mt={2}>
            <Text fontWeight="medium">Team Slots:</Text>
            <VStack align="flex-start" mt={1}>
              <Text>
                Player 1:{" "}
                {team.player1Details
                  ? `${team.player1Details.givenName} ${team.player1Details.familyName} (Occupied)`
                  : "Open"}
              </Text>
              <Text>
                Player 2:{" "}
                {team.player2Details
                  ? `${team.player2Details.givenName} ${team.player2Details.familyName} (Occupied)`
                  : "Open"}
              </Text>
            </VStack>
          </Box>

          {joinError && (
            <Alert.Root status="error" mt={4}>
              <Alert.Indicator />
              <Alert.Title>{joinError}</Alert.Title>
            </Alert.Root>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button
              onClick={isCurrentPlayerOnTeam ? handleLeave : handleJoin}
              isLoading={isJoining || isLeaving}
              colorScheme={isCurrentPlayerOnTeam ? "red" : "blue"}
              disabled={isTeamFull && !isCurrentPlayerOnTeam}
            >
              <Icon
                as={isCurrentPlayerOnTeam ? IoPersonRemove : IoPersonAdd}
                mr={2}
              />
              {isCurrentPlayerOnTeam ? "Leave Team" : "Join Team"}
            </Button>
          </DialogActionTrigger>

          <DialogCloseTrigger asChild>
            <Button variant={"ghost"}>
              <Icon as={IoClose} mr={2} /> Cancel
            </Button>
          </DialogCloseTrigger>
        </DialogFooter>
      </DialogContent>
    </DialogRootProvider>
  );
}

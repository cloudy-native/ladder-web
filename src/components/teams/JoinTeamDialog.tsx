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
import React from "react";
import { IoClose } from "react-icons/io5";
import { useTeamJoin } from "../../utils/hooks";
import { TeamWithPlayers } from "../../utils/hooks/useTeams";

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
  const { joinTeam, leaveTeam, isJoining, joinError } = useTeamJoin();

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
            <VStack align="flex-start" mt={1}>
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
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRootProvider>
  );
}

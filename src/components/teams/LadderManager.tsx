import React, { RefObject } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRootProvider,
  DialogTitle,
  DialogActionTrigger,
  DialogTrigger,
  HStack,
  Spinner,
  Text,
  VStack,
} from "@chakra-ui/react";
import { IoAdd, IoRemove } from "react-icons/io5";
import { useLadderSelect } from "../../utils/hooks";
import { useTeamLadder } from "../../utils/hooks";
import { TeamWithPlayers } from "../../utils/hooks/useTeams";

interface LadderManagerProps {
  team: TeamWithPlayers;
  dialogRef: RefObject<HTMLDivElement>;
  onLadderChanged: () => void;
  trigger?: React.ReactNode;
}

export function LadderManager({
  team,
  dialogRef,
  onLadderChanged,
  trigger,
}: LadderManagerProps) {
  const { ladders, loading, error, isTeamInLadder, refreshLadders } =
    useLadderSelect();

  const { addTeamToLadder, removeTeamFromLadder, isUpdating, updateError } =
    useTeamLadder();

  // Handle adding team to ladder
  const handleAddToLadder = async (ladderId: string) => {
    const success = await addTeamToLadder(team.id, ladderId);
    if (success) {
      onLadderChanged();
    }
  };

  // Handle removing team from ladder
  const handleRemoveFromLadder = async () => {
    const success = await removeTeamFromLadder(team.id);
    if (success) {
      onLadderChanged();
    }
  };

  return (
    <DialogRootProvider value={dialogRef}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{`Manage "${team.name}" Ladder`}</DialogTitle>
        </DialogHeader>
        <DialogBody>
          {loading ? (
            <Box textAlign="center" py={4}>
              <Spinner size="md" />
              <Text mt={2}>Loading ladders...</Text>
            </Box>
          ) : error ? (
            <Alert.Root status="error">
              <Alert.Indicator />
              <Alert.Title>Error loading ladders</Alert.Title>
              <Alert.Description>Please try again later.</Alert.Description>
            </Alert.Root>
          ) : ladders.length === 0 ? (
            <Alert.Root status="info">
              <Alert.Indicator />
              <Alert.Title>No ladders available</Alert.Title>
              <Alert.Description>
                There are no ladders to join. Create a ladder first.
              </Alert.Description>
            </Alert.Root>
          ) : (
            <>
              <Text mb={4}>Select a ladder for your team:</Text>

              {team.ladderId && (
                <Alert.Root status="info" mb={4}>
                  <Alert.Indicator />
                  <Alert.Title>
                    Your team is currently in the ladder:{" "}
                    {team.ladderDetails?.name || "Unknown Ladder"}
                  </Alert.Title>
                  <Alert.Description>
                    Teams can only be in one ladder at a time.
                  </Alert.Description>
                </Alert.Root>
              )}

              {updateError && (
                <Alert.Root status="error" mb={4}>
                  <Alert.Indicator />
                  <Alert.Title>{updateError}</Alert.Title>
                </Alert.Root>
              )}

              <VStack align="stretch">
                {ladders.map((ladder) => {
                  const isInLadder = isTeamInLadder(team.id, ladder.id, [team]);
                  return (
                    <Card.Root key={ladder.id}>
                      <Card.Body p={3}>
                        <HStack justifyContent="space-between">
                          <VStack align="start">
                            <Text fontWeight="bold">{ladder.name}</Text>
                            {ladder.description && (
                              <Text fontSize="sm" color="gray.600">
                                {ladder.description}
                              </Text>
                            )}
                          </VStack>
                          {isInLadder ? (
                            <Button
                              size="sm"
                              colorScheme="red"
                              loading={isUpdating}
                              onClick={handleRemoveFromLadder}
                            >
                              <IoRemove />
                              Remove
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              colorScheme="blue"
                              loading={isUpdating}
                              onClick={() => handleAddToLadder(ladder.id)}
                              disabled={
                                team.ladderId !== null &&
                                team.ladderId !== undefined
                              }
                            >
                              <IoAdd />
                              Join
                            </Button>
                          )}
                        </HStack>
                      </Card.Body>
                    </Card.Root>
                  );
                })}
              </VStack>
            </>
          )}
        </DialogBody>
        <DialogFooter>
          <DialogActionTrigger asChild>
            <Button>Close</Button>
          </DialogActionTrigger>
        </DialogFooter>
        <DialogCloseTrigger />
      </DialogContent>
    </DialogRootProvider>
  );
}

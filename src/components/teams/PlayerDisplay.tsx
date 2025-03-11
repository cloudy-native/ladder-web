import { Avatar, Badge, Box, HStack, Text } from "@chakra-ui/react";
import { Player } from "../../utils/amplify-helpers";

interface PlayerDisplayProps {
  /**
   * Player to display
   */
  player: Player | null | undefined;

  /**
   * Whether this player is the current logged-in user
   */
  isCurrentUser?: boolean;

  /**
   * Display variant - full (with avatar and details) or compact
   */
  variant?: "full" | "compact";

  /**
   * Optional slot label (e.g. "Player 1")
   */
  slotLabel?: string;
}

/**
 * Displays player information in a standardized format
 */
export function PlayerDisplay({
  player,
  isCurrentUser = false,
  variant = "full",
  slotLabel,
}: PlayerDisplayProps) {
  if (!player) {
    return (
      <Box bg="gray.50" p={2} borderRadius="md" flex="1" minW="200px">
        <Text color="gray.500" fontSize="sm">
          {slotLabel || "Player"}: Open slot
        </Text>
      </Box>
    );
  }

  const playerName = `${player.givenName} ${player.familyName}`;

  if (variant === "compact") {
    return (
      <Text fontSize="sm" fontWeight={isCurrentUser ? "bold" : "medium"}>
        {playerName}
        {isCurrentUser && (
          <Badge colorScheme="green" ml={1} size="xs">
            You
          </Badge>
        )}
      </Text>
    );
  }

  return (
    <HStack bg="gray.50" p={2} borderRadius="md" flex="1" minW="200px">
      <Avatar.Root size="xs">
        <Avatar.Fallback name={playerName} />
      </Avatar.Root>
      <Box>
        <Text fontSize="sm" fontWeight="medium">
          {playerName}
          {isCurrentUser && (
            <Badge colorScheme="green" ml={1} size="xs">
              You
            </Badge>
          )}
        </Text>
      </Box>
    </HStack>
  );
}

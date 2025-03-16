import { TeamWithPlayers } from "@/utils/crudl";
import { Badge, Box, Card, Flex, HStack, Icon, Text } from "@chakra-ui/react";
import { IoPeople, IoTrophy } from "react-icons/io5";
import { PlayerDisplay } from "./PlayerDisplay";

interface TeamCardProps {
  /**
   * Team data with related entities
   */
  teamWithPlayers: TeamWithPlayers;

  /**
   * ID of current player for highlighting
   */
  currentPlayerId?: string | null;

  /**
   * Function called when card is clicked
   */
  onClick?: () => void;

  /**
   * Custom action button for the card
   */
  actionButton?: React.ReactNode;
}

/**
 * Displays team information in a card format
 */
export function TeamCard({ teamWithPlayers, onClick, actionButton }: TeamCardProps) {
  return (
    <Card.Root
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      _hover={
        onClick ? { boxShadow: "md", transform: "translateY(-2px)" } : undefined
      }
      transition="all 0.2s"
    >
      <Card.Header>
        <Flex justify="space-between" align="center">
          {/* Team name and badges */}
          <HStack>
            <Icon as={IoPeople} boxSize={5} color="blue.500" />
            <Box>
              <HStack mb={1}>
                <Text fontWeight="bold">{teamWithPlayers.team.name}</Text>
                {/* Rating badge */}
                <Badge variant="outline" colorScheme="gray">
                  {typeof teamWithPlayers.team.rating === "number" ? teamWithPlayers.team.rating : 1200}
                </Badge>
              </HStack>
            </Box>
          </HStack>

          {/* Action button */}
          {actionButton && <HStack>{actionButton}</HStack>}
        </Flex>
      </Card.Header>

      <Card.Body py={2}>
        {/* Player list */}
        <Flex gap={4} flexWrap="wrap">
          <PlayerDisplay player={teamWithPlayers.player1} slotLabel="Player 1" />

          <PlayerDisplay player={teamWithPlayers.player2} slotLabel="Player 2" />
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}

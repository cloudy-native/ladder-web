import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  HStack,
  Icon,
  Text
} from "@chakra-ui/react";
import { IoPeople, IoTrophy } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";
import { PlayerDisplay } from "./PlayerDisplay";

type Team = Schema["Team"]["type"];
type Player = Schema["Player"]["type"];
type Ladder = Schema["Ladder"]["type"];

interface TeamWithDetails extends Team {
  player1Details?: Player | null;
  player2Details?: Player | null;
  ladderDetails?: Ladder | null;
}

interface TeamCardProps {
  /**
   * Team data with related entities
   */
  team: TeamWithDetails;

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
export function TeamCard({
  team,
  currentPlayerId,
  onClick,
  actionButton
}: TeamCardProps) {
  const isCurrentPlayerInTeam = currentPlayerId && 
    (team.player1Id === currentPlayerId || team.player2Id === currentPlayerId);
  
  const teamLadder = team.ladderDetails;

  return (
    <Card.Root 
      onClick={onClick}
      cursor={onClick ? "pointer" : "default"}
      _hover={onClick ? { boxShadow: "md", transform: "translateY(-2px)" } : undefined}
      transition="all 0.2s"
    >
      <Card.Header>
        <Flex justify="space-between" align="center">
          {/* Team name and badges */}
          <HStack spacing={3}>
            <Icon as={IoPeople} boxSize={5} color="blue.500" />
            <Box>
              <HStack mb={1}>
                <Text fontWeight="bold">{team.name}</Text>
                {isCurrentPlayerInTeam && (
                  <Badge colorScheme="green" variant="solid" size="sm">You</Badge>
                )}
                {/* Rating badge */}
                <Badge variant="outline" colorScheme="gray">
                  {typeof team.rating === "number" ? team.rating : 1200}
                </Badge>
              </HStack>
              
              {/* Ladder info if available */}
              {team.ladderId && teamLadder && (
                <Text fontSize="sm" color="blue.600">
                  <Icon as={IoTrophy} boxSize={3} mr={1} /> {teamLadder.name}
                </Text>
              )}
            </Box>
          </HStack>
          
          {/* Action button */}
          {actionButton && (
            <HStack>
              {actionButton}
            </HStack>
          )}
        </Flex>
      </Card.Header>
      
      <Card.Body py={2}>
        {/* Player list */}
        <Flex gap={4} flexWrap="wrap">
          <PlayerDisplay 
            player={team.player1Details} 
            isCurrentUser={team.player1Details?.id === currentPlayerId}
            slotLabel="Player 1"
          />
          
          <PlayerDisplay 
            player={team.player2Details} 
            isCurrentUser={team.player2Details?.id === currentPlayerId}
            slotLabel="Player 2"
          />
        </Flex>
      </Card.Body>
    </Card.Root>
  );
}
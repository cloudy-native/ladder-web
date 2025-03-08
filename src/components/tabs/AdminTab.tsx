import {
  Box,
  Button,
  ButtonGroup,
  Heading,
  Text,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useState } from "react";
import { IoTrash } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];
type Team = Schema["Team"]["type"];
type Enrollment = Schema["Enrollment"]["type"];
type Player = Schema["Player"]["type"];


export function AdminTab() {
  const [isLoading, setIsLoading] = useState({
    ladders: false,
    enrollments: false,
    teams: false,
    players: false,
  });

  // Delete all ladders
  //
  // TODO: I have no idea whether this correctly handles promises and exceptions correctly
  //
  const deleteAllLadders = async () => {
    setIsLoading((prev) => ({ ...prev, ladders: true }));

    // Function to list all ladders
    async function list() {
      const { data, errors } = await client.models.Ladder.list();

      if (errors) {
        console.error("Error fetching ladders:", errors);
        throw new Error("Failed to fetch ladders");
      }
      const ladders = data || [];
      console.log(`Found ${ladders.length} ladders to delete`);
      return ladders;
    }

    // Function to delete all ladders
    async function deleteAll(ladders: Ladder[]) {
      if (ladders.length === 0) {
        console.log("No ladders to delete");
        return Promise.resolve();
      }

      // Create an array of promises for each deletion
      const deletePromises = ladders.map((ladder) =>
        client.models.Ladder.delete({ id: ladder.id }).then(({ errors }) => {
          if (errors) {
            console.error(`Error deleting ladder ${ladder.id}:`, errors);
            throw new Error(`Failed to delete ladder ${ladder.id}`);
          }
          console.log(`Deleted ladder ${ladder.id}`);
        })
      );

      await Promise.all(deletePromises);
      console.log("All ladders successfully deleted");
    }

    // Chain the operations
    try {
      try {
        const ladders_2 = await list();
        return deleteAll(ladders_2);
      } catch (error) {
        console.error("Error in delete operation:", error);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, ladders: false }));
    }
  };

  // Delete all enrollments
  const deleteAllEnrollments = async () => {
    setIsLoading((prev) => ({ ...prev, enrollments: true }));

    // Function to list all enrollments
    async function list() {
      const { data, errors } = await client.models.Enrollment.list();

      if (errors) {
        console.error("Error fetching enrollments:", errors);
        throw new Error("Failed to fetch enrollments");
      }
      const enrollments = data || [];
      console.log(`Found ${enrollments.length} enrollments to delete`);
      return enrollments;
    }

    // Function to delete all enrollments
    async function deleteAll(enrollments: Enrollment[]) {
      if (enrollments.length === 0) {
        console.log("No enrollments to delete");
        return Promise.resolve();
      }

      // Create an array of promises for each deletion
      const deletePromises = enrollments.map((enrollment) =>
        client.models.Enrollment.delete({ id: enrollment.id }).then(
          ({ errors }) => {
            if (errors) {
              console.error(
                `Error deleting enrollment ${enrollment.id}:`,
                errors
              );
              throw new Error(`Failed to delete enrollment ${enrollment.id}`);
            }
            console.log(`Deleted enrollment ${enrollment.id}`);
          }
        )
      );

      await Promise.all(deletePromises);
      console.log("All enrollments successfully deleted");
    }

    // Chain the operations
    try {
      try {
        const enrollments = await list();
        return deleteAll(enrollments);
      } catch (error) {
        console.error("Error in delete operation:", error);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, enrollments: false }));
    }
  };

  // Delete all teams
  const deleteAllTeams = async () => {
    setIsLoading((prev) => ({ ...prev, teams: true }));

    // Function to list all teams
    async function list() {
      const { data, errors } = await client.models.Team.list();

      if (errors) {
        console.error("Error fetching teams:", errors);
        throw new Error("Failed to fetch teams");
      }
      const teams = data || [];
      console.log(`Found ${teams.length} teams to delete`);
      return teams;
    }

    // Function to delete all teams
    async function deleteAll(teams: Team[]) {
      if (teams.length === 0) {
        console.log("No teams to delete");
        return Promise.resolve();
      }

      // Create an array of promises for each deletion
      const deletePromises = teams.map((team) =>
        client.models.Team.delete({ id: team.id }).then(({ errors }) => {
          if (errors) {
            console.error(`Error deleting team ${team.id}:`, errors);
            throw new Error(`Failed to delete team ${team.id}`);
          }
          console.log(`Deleted team ${team.id}`);
        })
      );

      await Promise.all(deletePromises);
      console.log("All teams successfully deleted");
    }

    // Chain the operations
    try {
      try {
        const teams = await list();
        return deleteAll(teams);
      } catch (error) {
        console.error("Error in delete operation:", error);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, teams: false }));
    }
  };

  // Delete all players
  const deleteAllPlayers = async () => {
    setIsLoading((prev) => ({ ...prev, players: true }));

    // Function to list all players
    async function list() {
      const { data, errors } = await client.models.Player.list();

      if (errors) {
        console.error("Error fetching players:", errors);
        throw new Error("Failed to fetch players");
      }
      const players = data || [];
      console.log(`Found ${players.length} players to delete`);
      return players;
    }

    // Function to delete all players
    async function deleteAll(players: Player[]) {
      if (players.length === 0) {
        console.log("No players to delete");
        return Promise.resolve();
      }

      // Create an array of promises for each deletion
      const deletePromises = players.map((player) =>
        client.models.Player.delete({ id: player.id }).then(({ errors }) => {
          if (errors) {
            console.error(`Error deleting player ${player.id}:`, errors);
            throw new Error(`Failed to delete player ${player.id}`);
          }
          console.log(`Deleted player ${player.id}`);
        })
      );

      await Promise.all(deletePromises);
      console.log("All players successfully deleted");
    }

    // Chain the operations
    try {
      try {
        const players = await list();
        return deleteAll(players);
      } catch (error) {
        console.error("Error in delete operation:", error);
      }
    } finally {
      setIsLoading((prev) => ({ ...prev, players: false }));
    }
  };

  return (
    <Box>
      <Heading size="md" mb={6}>
        Admin Operations
      </Heading>
      <Text mb={6} color="gray.600">
        These operations allow you to manage the data in the system. Use with
        caution.
      </Text>
      <VStack align="flex-start">
        <Box>
          <Text fontWeight="bold" mb={2}>
            Database Cleanup
          </Text>
          <ButtonGroup size="md">
            <Button
              loading={isLoading.ladders}
              onClick={deleteAllLadders}
              disabled={isLoading.ladders}
            >
              <IoTrash />
              Delete All Ladders
            </Button>

            <Button
              loading={isLoading.enrollments}
              onClick={deleteAllEnrollments}
              disabled={isLoading.enrollments}
            >
              <IoTrash />
              Delete All Enrollments
            </Button>

            <Button
              loading={isLoading.teams}
              onClick={deleteAllTeams}
              disabled={isLoading.teams}
            >
              <IoTrash />
              Delete All Teams
            </Button>

            <Button
              loading={isLoading.players}
              onClick={deleteAllPlayers}
              disabled={isLoading.players}
            >
              <IoTrash />
              Delete All Players
            </Button>
          </ButtonGroup>
        </Box>
      </VStack>
    </Box>
  );
}

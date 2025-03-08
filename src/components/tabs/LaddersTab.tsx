import {
  Box,
  Button,
  Card,
  DialogRootProvider,
  HStack,
  Icon,
  Input,
  Spinner,
  Text,
  useDialog,
  VStack,
  Heading,
  Alert,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoTrash } from "react-icons/io5";
import type { Schema } from "../../../amplify/data/resource";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Field } from "../ui/field";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];

export function LaddersTab() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ladderName, setLadderName] = useState("");
  const [ladderDescription, setLadderDescription] = useState("");
  const addLadderDialog = useDialog();

  async function getLadders() {
    setLoading(true);

    try {
      const { data: ladderData, errors } = await client.models.Ladder.list();

      if (errors) {
        console.error("Error fetching ladders:", errors);
        throw new Error("Failed to fetch ladders");
      }

      console.log(
        "Ladders fetched successfully:",
        JSON.stringify(ladderData, null, 2)
      );

      setLadders(ladderData || []);
    } catch (error) {
      console.error("Error fetching ladders:", error);
    } finally {
      setLoading(false);
    }
  }

  async function createLadder() {
    if (!ladderName) {
      console.log("Empty ladder name");
      return;
    }

    try {
      const { data: createdLadder, errors } = await client.models.Ladder.create(
        { name: ladderName, description: ladderDescription }
      );

      setLadderName("");
      setLadderDescription("");

      if (errors) {
        console.error("Error creating ladder:", errors);
        throw new Error("Failed to create ladder");
      }

      console.log("Ladder created successfully:", createdLadder);

      // Add the new ladder to the list
      if (createdLadder) {
        setLadders((prev) => [createdLadder, ...prev]);
      }
    } catch (error) {
      console.error("Error creating ladder:", error);
    }
  }

  async function deleteLadder(id: string) {
    try {
      const { errors } = await client.models.Ladder.delete({ id });

      if (errors) {
        console.error("Error deleting ladder:", errors);
        throw new Error("Failed to delete ladder");
      }

      console.log("Ladder deleted successfully");

      // Remove the deleted ladder from the list
      setLadders((prev) => prev.filter((ladder) => ladder.id !== id));
    } catch (error) {
      console.error("Error deleting ladder:", error);
    }
  }

  useEffect(() => {
    getLadders();
  }, []);

  return (
    <>
      <HStack justifyContent="flex-end" mb={4}>
        <DialogRootProvider value={addLadderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline">Create Ladder</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Ladder</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Field label="Ladder name">
                <Input
                  placeholder="Enter name..."
                  onChange={(value) => setLadderName(value.target.value)}
                />
              </Field>
              <Field label="Ladder description">
                <Input
                  placeholder="Enter description..."
                  onChange={(value) => setLadderDescription(value.target.value)}
                />
              </Field>
            </DialogBody>
            <DialogFooter>
              <DialogActionTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogActionTrigger>
              <Button
                onClick={() => {
                  createLadder();
                  addLadderDialog.setOpen(false);
                }}
              >
                Save
              </Button>
            </DialogFooter>
            <DialogCloseTrigger />
          </DialogContent>
        </DialogRootProvider>
      </HStack>

      {loading ? (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" />
          <Text mt={4}>Loading ladders...</Text>
        </Box>
      ) : ladders.length === 0 ? (
        <Alert.Root status="info">
          <Alert.Indicator />
          <Alert.Title>No ladders found</Alert.Title>
        </Alert.Root>
      ) : (
        <VStack align="stretch">
          {ladders.map((ladder) => (
            <Card.Root key={ladder.id} p={4}>
              <Card.Header>
                <HStack justifyContent="space-between" width="100%">
                  <Box>
                    <Text fontWeight="bold" fontSize="xl">
                      {ladder.name}
                    </Text>
                    <Text>{ladder.description}</Text>
                  </Box>
                  <Button
                    variant="ghost"
                    onClick={() => deleteLadder(ladder.id)}
                    aria-label="Delete ladder"
                    size="sm"
                  >
                    <Icon as={IoTrash} />
                  </Button>
                </HStack>
              </Card.Header>
              <Card.Body>
                <Text>Enrolments: {ladder.enrollments?.length || 0}</Text>
                <Text>
                  Created: {new Date(ladder.createdAt).toLocaleDateString()}
                </Text>
              </Card.Body>
            </Card.Root>
          ))}
        </VStack>
      )}
    </>
  );
}

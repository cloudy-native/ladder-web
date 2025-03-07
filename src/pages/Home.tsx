import {
  Box,
  Button,
  Card,
  Container,
  DialogRootProvider,
  Heading,
  HStack,
  Icon,
  Input,
  Spinner,
  Tabs,
  Text,
  useDialog,
  VStack,
} from "@chakra-ui/react";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react";
import { IoAnalytics, IoPeople, IoPerson, IoTrash } from "react-icons/io5";
import type { Schema } from "../../amplify/data/resource";
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Field } from "../components/ui/field";

const client = generateClient<Schema>();

type Ladder = Schema["Ladder"]["type"];

export default function Home() {
  const [ladders, setLadders] = useState<Ladder[]>([]);
  const [loading, setLoading] = useState(true);
  const [ladderName, setLadderName] = useState("");
  const [ladderDescription, setLadderDescription] = useState("");
  const dialog = useDialog();

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
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Welcome to Ladder Web
      </Heading>

      <Tabs.Root defaultValue="ladders">
        <Tabs.List mb={4}>
          <Tabs.Trigger value="ladders">
            <Icon as={IoAnalytics} mr={2} />
            Ladders
          </Tabs.Trigger>
          <Tabs.Trigger value="players">
            <Icon as={IoPerson} mr={2} />
            Players
          </Tabs.Trigger>
          <Tabs.Trigger value="teams">
            <Icon as={IoPeople} mr={2} />
            Teams
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="ladders">
          <HStack justifyContent="flex-end" mb={4}>
            <DialogRootProvider value={dialog}>
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
                      onChange={(value) =>
                        setLadderDescription(value.target.value)
                      }
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
                      dialog.setOpen(false);
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
          ) : (
            <VStack align="stretch">
              {ladders.map((ladder) => (
                <Card.Root key={ladder.id} p={4}>
                  <Card.Header>
                    <Heading size="md">{ladder.name}</Heading>
                    <Text>{ladder.description}</Text>
                  </Card.Header>
                  <Card.Body>
                    <Text>Enrolments: {ladder.enrolment?.length}</Text>
                    <Text>Created: {ladder.createdAt}</Text>
                  </Card.Body>
                  <Card.Footer justifyContent="flex-end">
                    <Button
                      variant="ghost"
                      onClick={() => deleteLadder(ladder.id)}
                      aria-label="Delete ladder"
                    >
                      <Icon as={IoTrash} />
                    </Button>
                  </Card.Footer>
                </Card.Root>
              ))}
            </VStack>
          )}
        </Tabs.Content>

        <Tabs.Content value="players">
          <Box p={6} bg="gray.50" borderRadius="md">
            <Text>View and manage players in your ladders</Text>
          </Box>
        </Tabs.Content>

        <Tabs.Content value="teams">
          <Box p={6} bg="gray.50" borderRadius="md">
            <Text>View and manage teams in your ladders</Text>
          </Box>
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}

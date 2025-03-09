import { Container, Heading, Icon, Tabs } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import {
  IoAnalytics,
  IoPeople,
  IoPerson,
  IoSettingsSharp,
} from "react-icons/io5";
import { Schema } from "../../amplify/data/resource";
import { AdminTab, LaddersTab, PlayersTab, TeamsTab } from "../components/tabs";
import { getCurrentPlayer } from "../data";
import { nameFor } from "../utils/random";

type Player = Schema["Player"]["type"];
type TabValue = "ladders" | "players" | "teams" | "admin";

export default function Home() {
  // TODO: rename currentPlayer
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabValue>("ladders");

  // Fetch player data once on component mount
  useEffect(() => {
    async function fetchPlayer() {
      try {
        setLoading(true);
        setCurrentPlayer(await getCurrentPlayer());
      } catch (error) {
        console.error("Error fetching player in Home:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, []);

  const handleTabChange = (details: { value: string }) => {
    setActiveTab(details.value as TabValue);
  };

  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Welcome{" "}
        {loading ? " ..." : currentPlayer ? nameFor(currentPlayer) : ""}
      </Heading>

      <Tabs.Root
        defaultValue="ladders"
        value={activeTab}
        onValueChange={handleTabChange}
      >
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
          <Tabs.Trigger value="admin" ml="auto">
            <Icon as={IoSettingsSharp} mr={2} />
            Admin
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="ladders">
          <LaddersTab />
        </Tabs.Content>

        <Tabs.Content value="players">
          <PlayersTab />
        </Tabs.Content>

        <Tabs.Content value="teams">
          <TeamsTab />
        </Tabs.Content>

        <Tabs.Content value="admin">
          <AdminTab />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}

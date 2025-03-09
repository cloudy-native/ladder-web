import { Container, Heading, Icon, Tabs } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { IoAnalytics, IoPeople, IoPerson, IoSettingsSharp } from "react-icons/io5";
import { Schema } from "../../amplify/data/resource";
import { AdminTab, LaddersTab, PlayersTab, TeamsTab } from "../components/tabs";
import { getCurrentPlayer } from "../data";

type Player = Schema["Player"]["type"]

export default function Home() {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch player data once on component mount
  useEffect(() => {
    async function fetchPlayer() {
      try {
        setLoading(true);
        const currentPlayer = await getCurrentPlayer();
        setPlayer(currentPlayer);
      } catch (error) {
        console.error("Error fetching player in Home:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchPlayer();
  }, []);

  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}> 
        Welcome
        {loading ? ' ...' : player ? ` ${player.givenName} ${player.familyName}` : ''}
      </Heading>

      <Tabs.Root 
        defaultValue="ladders" 
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
          <LaddersTab  />
        </Tabs.Content>

        <Tabs.Content value="players">
          <PlayersTab  />
        </Tabs.Content>

        <Tabs.Content value="teams">
          <TeamsTab  />
        </Tabs.Content>
        
        <Tabs.Content value="admin">
          <AdminTab  />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}

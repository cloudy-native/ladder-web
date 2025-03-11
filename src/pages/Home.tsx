'use client'

import { Container, Heading, Icon, Tabs } from "@chakra-ui/react";
import { useState } from "react";
import {
  IoAnalytics,
  IoPeople,
  IoPerson,
  IoSettingsSharp,
  IoTrophy
} from "react-icons/io5";
import { 
  AdminTab, 
  LaddersTab, 
  MatchesTab, 
  PlayersTab, 
  TeamsTab 
} from "../components/tabs";

type TabValue = "ladders" | "players" | "teams" | "matches" | "admin";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabValue>("ladders");

  const handleTabChange = (details: { value: string }) => {
    setActiveTab(details.value as TabValue);
  };

  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Welcome to Ladder Web
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
          <Tabs.Trigger value="matches">
            <Icon as={IoTrophy} mr={2} />
            Matches
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

        <Tabs.Content value="matches">
          <MatchesTab />
        </Tabs.Content>

        <Tabs.Content value="admin">
          <AdminTab />
        </Tabs.Content>
      </Tabs.Root>
    </Container>
  );
}

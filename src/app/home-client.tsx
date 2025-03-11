"use client";

import { Box, Container, Flex, Heading, Icon, SimpleGrid, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";
import { IoAnalytics, IoPeople, IoPerson, IoSettingsSharp, IoTrophy } from "react-icons/io5";

export function ClientOnly() {
  const features = [
    {
      title: "Ladders",
      description: "View and manage competition ladders",
      icon: IoAnalytics,
      href: "/ladders",
    },
    {
      title: "Players",
      description: "Manage player profiles and statistics",
      icon: IoPerson,
      href: "/players",
    },
    {
      title: "Teams",
      description: "Create and join teams for competitions",
      icon: IoPeople,
      href: "/teams",
    },
    {
      title: "Matches",
      description: "Record and view match results",
      icon: IoTrophy,
      href: "/matches",
    },
    {
      title: "Admin",
      description: "Administrative tools and settings",
      icon: IoSettingsSharp,
      href: "/admin",
    },
  ];

  return (
    <Container maxW="container.lg">
      <VStack spacing={8} align="center" mb={12}>
        <Heading as="h1" size="2xl">
          Welcome to Ladder Web
        </Heading>
        <Text fontSize="lg" textAlign="center">
          A platform for managing competitive ladders and tournaments
        </Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {features.map((feature) => (
          <Box
            key={feature.title}
            as={NextLink}
            href={feature.href}
            borderWidth={1}
            borderRadius="lg"
            p={6}
            transition="all 0.3s"
            _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
          >
            <Flex direction="column" align="center" textAlign="center">
              <Icon as={feature.icon} w={10} h={10} mb={4} />
              <Heading as="h3" size="md" mb={2}>
                {feature.title}
              </Heading>
              <Text>{feature.description}</Text>
            </Flex>
          </Box>
        ))}
      </SimpleGrid>
    </Container>
  );
}
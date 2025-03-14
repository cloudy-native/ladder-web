"use client";

import {
  Box,
  CardBody,
  CardHeader,
  CardRoot,
  Container,
  Flex,
  Heading,
  Icon,
  Link,
  SimpleGrid,
  Text,
  VStack,
} from "@chakra-ui/react";
import NextLink from "next/link";
import {
  IoAnalytics,
  IoPeople,
  IoPerson,
  IoSettingsSharp,
  IoTrophy,
} from "react-icons/io5";

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
    <Container maxW="container.lg" py={12}>
      <VStack align="center" mb={12}>
        <Heading as="h1" size="2xl" textAlign="center">
          Welcome to Ladder Web
        </Heading>
        <Text fontSize="lg" textAlign="center" color="gray.600">
          A platform for managing competitive ladders and tournaments.
        </Text>
      </VStack>

      {/* Feature Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
        {features.map((feature) => (
          <CardRoot
            key={feature.title}
            boxShadow="md"
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
            }}
            borderRadius="lg"
          >
            <Link
              as={NextLink}
              href={feature.href}
              _hover={{ textDecoration: "none" }}
            >
              <CardHeader p={4}>
                <Flex direction="column" align="center" textAlign="center">
                  <Icon
                    as={feature.icon}
                    w={10}
                    h={10}
                    mb={4}
                    color="blue.500"
                  />
                  <Heading as="h3" size="md" mb={2}>
                    {feature.title}
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <Box textAlign="center">
                  <Text color="gray.700">{feature.description}</Text>
                </Box>
              </CardBody>
            </Link>
          </CardRoot>
        ))}
      </SimpleGrid>
    </Container>
  );
}

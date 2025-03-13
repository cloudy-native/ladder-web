'use client'

import { Box, Heading, Text, Container } from "@chakra-ui/react";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Settings
      </Heading>
      <AboutPage />
    </Container>
  );
}

function AboutPage() {
  return (
    <Container maxW="container.lg">
      <Box py={4}>
        <Heading as="h1" mb={4}>About Ladder Web</Heading>
        <Text>
          Ladder Web is a platform designed to help clubs organize and manage their ladder competitions
          for racket sports such as tennis, squash, badminton, and pickleball.
        </Text>
        <Text mt={4}>
          Players can join teams, challenge other teams, and track their progress as they climb up the ladder.
          Administrators can easily manage ladders, players, and matches.
        </Text>
        <Text mt={4}>
          Built with Next.js and AWS Amplify for a responsive, scalable, and secure experience.
        </Text>
      </Box>
    </Container>
  );
}

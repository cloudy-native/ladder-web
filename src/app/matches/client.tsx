"use client";

import { Container, Heading } from "@chakra-ui/react";
import { MatchesPage } from "./MatchesPage";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Matches
      </Heading>
      <MatchesPage />
    </Container>
  );
}

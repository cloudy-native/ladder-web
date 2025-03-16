"use client";

import { Container, Heading } from "@chakra-ui/react";
import { PlayersPage } from "./PlayersPage";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Players
      </Heading>
      <PlayersPage />
    </Container>
  );
}

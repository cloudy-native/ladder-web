"use client";

import { Container, Heading } from "@chakra-ui/react";
import { PlayersTab } from "../../components/tabs";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Players
      </Heading>
      <PlayersTab />
    </Container>
  );
}
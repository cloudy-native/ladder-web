"use client";

import { Container, Heading } from "@chakra-ui/react";
import { TeamsPage } from "./TeamsPage";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Teams
      </Heading>
      <TeamsPage />
    </Container>
  );
}

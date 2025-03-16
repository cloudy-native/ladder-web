"use client";

import {
  Container,
  Heading
} from "@chakra-ui/react";
import LaddersPage from "./page";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Ladders
      </Heading>
      <LaddersPage />
    </Container>
  );
}

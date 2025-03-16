"use client";

import { Container, Heading } from "@chakra-ui/react";
import { AdminPage } from "./AdminPage";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" m={6}>
        Settings
      </Heading>
      <AdminPage />
    </Container>
  );
}

"use client";

import { Container, Heading } from "@chakra-ui/react";
import { AdminTab } from "../../components/tabs";

export function ClientOnly() {
  return (
    <Container maxW="container.lg">
      <Heading as="h1" mb={6}>
        Admin
      </Heading>
      <AdminTab />
    </Container>
  );
}
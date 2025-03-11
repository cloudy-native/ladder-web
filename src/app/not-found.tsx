'use client'

import { Button, Center, Container, Heading, Text, VStack } from "@chakra-ui/react";
import NextLink from "next/link";

export default function NotFound() {
  return (
    <Container maxW="container.md">
      <Center minH="60vh">
        <VStack spacing={6} textAlign="center">
          <Heading as="h1" size="2xl">
            404
          </Heading>
          <Heading as="h2" size="lg">
            Page Not Found
          </Heading>
          <Text fontSize="lg">
            The page you are looking for doesn't exist or has been moved.
          </Text>
          <Button as={NextLink} href="/" colorScheme="blue">
            Go Home
          </Button>
        </VStack>
      </Center>
    </Container>
  );
}
import { Box, Heading, Text, Container } from "@chakra-ui/react";

export default function About() {
  return (
    <Container maxW="container.lg">
      <Box py={4}>
        <Heading as="h1" mb={4}>About Us</Heading>
        <Text>This is the about page of our application.</Text>
      </Box>
    </Container>
  );
}
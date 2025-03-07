import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Link,
  Spacer,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ColorModeButton } from "../color-mode";

export const Header = () => {
  return (
    <Box as="header" py={4} px={6}>
      <Flex align="center">
        <Heading size="md">Ladder Web</Heading>
        <HStack ml={8}>
          <Link as={RouterLink} to="/" _hover={{ textDecoration: "none" }}>
            Home
          </Link>
          <Link as={RouterLink} to="/about" _hover={{ textDecoration: "none" }}>
            About
          </Link>
        </HStack>
        <Spacer />
        <HStack>
          <ColorModeButton />
          <Button variant="outline" colorScheme="whiteAlpha" size="sm">
            Sign In
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
};

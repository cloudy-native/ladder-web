'use client'

import {
  Box,
  Flex,
  Heading,
  HStack,
  Link,
  Spacer,
} from "@chakra-ui/react";
import NextLink from "next/link";

interface HeaderProps {
  signOut?: () => void;
}

export const Header = () => {
  return (
    <Box as="header" py={4} px={6}>
      <Flex align="center">
        <Heading size="md">Ladder Web</Heading>
        <HStack ml={8}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }}>
            Home
          </Link>
          <Link as={NextLink} href="/about" _hover={{ textDecoration: "none" }}>
            About
          </Link>
        </HStack>
        <Spacer />
      </Flex>
    </Box>
  );
};

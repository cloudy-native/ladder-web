'use client'

import {
  Box,
  Flex,
  Heading,
  HStack,
  Icon,
  Link,
  Spacer,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { 
  IoAnalytics, 
  IoHome,
  IoInformation, 
  IoPeople, 
  IoPerson, 
  IoSettingsSharp, 
  IoTrophy 
} from "react-icons/io5";
import { UserMenu } from "../../auth";

export const Header = () => {
  return (
    <Box as="header" py={4} px={6} borderBottomWidth="1px" borderColor="gray.200">
      <Flex align="center">
        <Heading size="md">Ladder Web</Heading>
        <HStack ml={8} spacing={4}>
          <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoHome} mr={1} />
            Home
          </Link>
          <Link as={NextLink} href="/ladders" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoAnalytics} mr={1} />
            Ladders
          </Link>
          <Link as={NextLink} href="/players" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoPerson} mr={1} />
            Players
          </Link>
          <Link as={NextLink} href="/teams" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoPeople} mr={1} />
            Teams
          </Link>
          <Link as={NextLink} href="/matches" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoTrophy} mr={1} />
            Matches
          </Link>
          <Link as={NextLink} href="/about" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoInformation} mr={1} />
            About
          </Link>
        </HStack>
        <Spacer />
        <HStack spacing={4}>
          <Link as={NextLink} href="/admin" _hover={{ textDecoration: "none" }} display="flex" alignItems="center">
            <Icon as={IoSettingsSharp} mr={1} />
            Admin
          </Link>
          <UserMenu />
        </HStack>
      </Flex>
    </Box>
  );
};

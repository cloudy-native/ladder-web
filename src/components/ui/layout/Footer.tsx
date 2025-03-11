'use client'

import { Box, Center, Text } from "@chakra-ui/react";

export const Footer = () => {
  return (
    <Box as="footer" py={4} px={6}>
      <Center>
        <Text fontSize="sm">
          &copy; {new Date().getFullYear()} Ladder Web. All rights reserved.
        </Text>
      </Center>
    </Box>
  );
};

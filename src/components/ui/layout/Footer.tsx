"use client";

import { useColorModeValue } from "@/components/ui";
import {
  Box,
  Button,
  Container,
  Flex,
  HStack,
  Icon,
  Link,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { IoLogoGithub, IoLogoTwitter, IoMailOutline } from "react-icons/io5";

interface SocialButtonProps {
  children: React.ReactNode;
  label: string;
  href: string;
}

// eslint-disable-next-line no-unused-vars -- this variable needs to be here for future work
const SocialButton = ({ children, label, href }: SocialButtonProps) => {
  return (
    <Button
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      rounded="full"
      w={8}
      h={8}
      cursor="pointer"
      as="a"
      display="inline-flex"
      alignItems="center"
      justifyContent="center"
      transition="background 0.3s ease"
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
      aria-label={label}
    >
      {children}
    </Button>
  );
};

interface ListHeaderProps {
  children: React.ReactNode;
}

const ListHeader = ({ children }: ListHeaderProps) => {
  return (
    <Text
      fontWeight="bold"
      mb={2}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      {children}
    </Text>
  );
};

export const Footer = () => {
  const footerBg = useColorModeValue("gray.50", "gray.900");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  return (
    <Box
      as="footer"
      bg={footerBg}
      borderTopWidth={1}
      borderStyle="solid"
      borderColor={borderColor}
      mt="auto"
    >
      <Container maxW="container.xl" pt={10} pb={6}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} mb={8}>
          <Stack align="flex-start">
            <ListHeader>Product</ListHeader>
            <Link as={NextLink} href="/about">
              About
            </Link>
            <Link as={NextLink} href="/ladders">
              Ladders
            </Link>
            <Link as={NextLink} href="/matches">
              Matches
            </Link>
            <Link as={NextLink} href="/teams">
              Teams
            </Link>
          </Stack>

          <Stack align="flex-start">
            <ListHeader>Company</ListHeader>
            <Link href="#">Blog</Link>
            <Link href="#">Careers</Link>
            <Link href="#">Contact Us</Link>
            <Link href="#">Partners</Link>
          </Stack>

          <Stack align="flex-start">
            <ListHeader>Support</ListHeader>
            <Link href="#">Help Center</Link>
            <Link href="#">Terms of Service</Link>
            <Link href="#">Privacy Policy</Link>
            <Link href="#">FAQ</Link>
          </Stack>

          <Stack align="flex-start">
            <ListHeader>Stay Connected</ListHeader>
            <HStack>
              <SocialButton label="Twitter" href="#">
                <Icon as={IoLogoTwitter} boxSize={4} />
              </SocialButton>
              <SocialButton label="GitHub" href="#">
                <Icon as={IoLogoGithub} boxSize={4} />
              </SocialButton>
              <SocialButton label="Email" href="#">
                <Icon as={IoMailOutline} boxSize={4} />
              </SocialButton>
            </HStack>
            <Text
              mt={2}
              fontSize="sm"
              color={useColorModeValue("gray.600", "gray.400")}
            >
              Subscribe to our newsletter
            </Text>
            <Link href="#" color="blue.400">
              Sign up now
            </Link>
          </Stack>
        </SimpleGrid>

        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align="center"
          fontSize="sm"
        >
          <Text>
            &copy; {new Date().getFullYear()} Ladder Web. All rights reserved.
          </Text>
          <Text
            bgGradient="linear(to-r, blue.400, teal.400)"
            bgClip="text"
            fontWeight="bold"
            fontSize="md"
            mt={{ base: 2, md: 0 }}
          >
            Ladder Web
          </Text>
        </Flex>
      </Container>
    </Box>
  );
};

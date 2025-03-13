"use client";

import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
  IconButton,
  Link,
  Spacer,
  Text,
  useBreakpointValue,
  useDisclosure
} from "@chakra-ui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import {
  IoAnalytics,
  IoHome,
  IoMenu,
  IoPeople,
  IoPerson,
  IoSettingsSharp,
  IoTrophy
} from "react-icons/io5";
import { useColorModeValue } from "../../ui/color-mode";

interface NavItemProps {
  icon: React.ElementType;
  href: string;
  children: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, href, children, isActive, onClick }: NavItemProps) => {
  const activeColor = useColorModeValue("blue.500", "blue.300");
  const hoverBg = useColorModeValue("gray.100", "gray.700");

  return (
    <Link
      as={NextLink}
      href={href}
      px={3}
      py={2}
      rounded="md"
      display="flex"
      alignItems="center"
      color={isActive ? activeColor : undefined}
      fontWeight={isActive ? "semibold" : "medium"}
      transition="all 0.2s"
      _hover={{
        textDecoration: "none",
        bg: hoverBg,
      }}
      onClick={onClick}
    >
      <Icon as={icon} mr={2} />
      <Text>{children}</Text>
    </Link>
  );
};

export const Header = () => {
  const pathname = usePathname();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const { onOpen, } = useDisclosure();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const navItems = [
    { href: "/", icon: IoHome, label: "Home" },
    { href: "/ladders", icon: IoAnalytics, label: "Ladders" },
    { href: "/players", icon: IoPerson, label: "Players" },
    { href: "/teams", icon: IoPeople, label: "Teams" },
    { href: "/matches", icon: IoTrophy, label: "Matches" },
    { href: "/admin", icon: IoSettingsSharp, label: "Settings" },
  ];

  return (
    <Box
      as="header"
      py={3}
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bgColor}
      boxShadow="sm"
      borderBottomWidth="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex align="center">
          {isMobile && (
            <IconButton
              aria-label="Open menu"
              icon={<IoMenu />}
              variant="ghost"
              mr={2}
              onClick={onOpen}
            />
          )}

          <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              bgGradient="linear(to-r, blue.400, teal.400)"
              bgClip="text"
            >
              Ladder Web
            </Text>
          </Link>

          {!isMobile && (
            <HStack ml={8}>
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  icon={item.icon}
                  href={item.href}
                  isActive={pathname === item.href}
                >
                  {item.label}
                </NavItem>
              ))}
            </HStack>
          )}

          <Spacer />
        </Flex>
      </Container>
    </Box>
  );
};

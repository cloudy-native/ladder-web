"use client";

import {
  Box,
  Container,
  Flex,
  HStack,
  Icon,
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
  IoTrophy,
} from "react-icons/io5";
// import { ReactComponent as Logo } from "../../../assets/react.svg";
import { Button } from "@aws-amplify/ui-react";
import { useColorModeValue } from "../color-mode";

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
  const { onOpen } = useDisclosure();
  const bgColor = useColorModeValue("blue.50", "gray.800"); // Pale blue in light mode
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // const logoColor = useColorModeValue("blue.500", "white"); // change the color of the logo in dark mode

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
      py={4} // Increased padding
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl">
        <Flex align="center">
          {isMobile && (
            <Box>
              <Button aria-label="Open menu" onClick={onOpen}>
                <IoMenu />
              </Button>
            </Box>
          )}

          {/* Logo */}
          <Link as={NextLink} href="/" _hover={{ textDecoration: "none" }}>
            <HStack>
              {/* <Logo fill={logoColor} width="48px" height="48px" /> */}
              <Text
                fontSize="2xl" // Larger font size
                fontWeight="bold"
                bgGradient="linear(to-r, blue.400, teal.400)"
                bgClip="text"
              >
                Ladder Web
              </Text>
            </HStack>
          </Link>

          <Spacer />

          {/* Navigation Items */}
          {!isMobile && (
            <HStack>
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
        </Flex>
      </Container>
    </Box>
  );
};

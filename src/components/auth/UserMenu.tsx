"use client";

import {
  Avatar,
  Button,
  Flex,
  Menu,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "./AuthContext";
import { useAuthDialog } from "./AuthDialog";

export function UserMenu() {
  const { isAuthenticated, isLoading, user, signOut } = useAuth();
  const { openLogin, openSignUp, AuthDialogComponent } = useAuthDialog();

  // Show loading spinner while auth state is being determined
  if (isLoading) {
    return <Spinner size="sm" />;
  }

  // If user is not authenticated, show sign in / sign up buttons
  if (!isAuthenticated) {
    return (
      <Flex gap={2}>
        <Button variant="ghost" size="sm" onClick={openLogin}>
          Sign In
        </Button>
        <Button colorScheme="blue" size="sm" onClick={openSignUp}>
          Sign Up
        </Button>
        {AuthDialogComponent}
      </Flex>
    );
  }

  // If user is authenticated, show user menu
  return (
    <Flex alignItems="center" gap={2}>
      <Menu>
        <Menu.Button>
          <Flex alignItems="center" gap={2}>
            <Avatar
              size="sm"
              name={user?.givenName ? `${user.givenName} ${user.familyName || ''}` : user?.email}
              src=""
              bg="blue.500"
            />
            <Text display={{ base: "none", md: "block" }}>
              {user?.givenName || user?.email?.split('@')[0]}
            </Text>
          </Flex>
        </Menu.Button>
        <Menu.List>
          <Menu.Item>Profile</Menu.Item>
          <Menu.Item>Settings</Menu.Item>
          <Menu.Item onClick={() => signOut()}>Sign Out</Menu.Item>
        </Menu.List>
      </Menu>
    </Flex>
  );
}
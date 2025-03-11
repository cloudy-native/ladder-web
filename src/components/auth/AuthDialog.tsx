"use client";

import {
  Button,
  Dialog,
  DialogRootProvider,
  Flex,
  Icon,
  Tabs,
  useDialog,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { IoAdd, IoLogIn } from "react-icons/io5";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: "login" | "signup";
}

type TabValue = "login" | "signup";

export function AuthDialog({
  isOpen,
  onClose,
  initialView = "login",
}: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(initialView);

  const authDialog = useDialog();

  const handleTabChange = (details: { value: string }) => {
    setActiveTab(details.value as TabValue);
  };

  return (
    <DialogRootProvider value={authDialog}>
      <Dialog.Content>
        <Dialog.Header>
          {activeTab === "login" ? "Sign In" : "Create Account"}
        </Dialog.Header>

        <Dialog.Body p={6}>
          <Tabs.Root
            defaultValue={"login"}
            value={activeTab}
            variant="enclosed"
            onValueChange={handleTabChange}
            mb={4}
          >
            <Tabs.List mb={6}>
              <Tabs.Trigger value="login">
                <Icon as={IoLogIn} mr={2} />
                Login
              </Tabs.Trigger>
              <Tabs.Trigger value="signup">
                <Icon as={IoAdd} mr={2} />
                Sign Up
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.ContentGroup>
              <Tabs.Content p={0} value="login">
                <LoginForm onSuccess={onClose} />
              </Tabs.Content>

              <Tabs.Content p={0} value="signup">
                <SignUpForm
                  onSuccess={() => handleTabChange({ value: "login" })}
                />
              </Tabs.Content>
            </Tabs.ContentGroup>
          </Tabs.Root>
        </Dialog.Body>
      </Dialog.Content>
    </DialogRootProvider>
  );
}

export function useAuthDialog(initialView: "login" | "signup" = "login") {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeView, setActiveView] = useState<"login" | "signup">(initialView);

  const openLogin = () => {
    setActiveView("login");
    onOpen();
  };

  const openSignUp = () => {
    setActiveView("signup");
    onOpen();
  };

  return {
    isOpen,
    onClose,
    activeView,
    openLogin,
    openSignUp,
    AuthDialogComponent: (
      <AuthDialog isOpen={isOpen} onClose={onClose} initialView={activeView} />
    ),
  };
}

export function AuthButton() {
  const { openLogin, openSignUp, AuthDialogComponent } = useAuthDialog();

  return (
    <Flex gap={2} alignItems="center">
      <Button variant="ghost" onClick={openLogin}>
        Sign In
      </Button>
      <Button colorScheme="blue" onClick={openSignUp}>
        Sign Up
      </Button>
      {AuthDialogComponent}
    </Flex>
  );
}

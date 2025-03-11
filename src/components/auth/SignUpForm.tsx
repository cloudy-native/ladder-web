"use client";

import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  Grid,
  Input,
  Text,
  Stack,
} from "@chakra-ui/react";
import { confirmSignUp, signUp } from "aws-amplify/auth";
import { useState } from "react";

interface SignUpFormProps {
  onSuccess?: () => void;
}

export function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [step, setStep] = useState<"signup" | "confirm">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [givenName, setGivenName] = useState("");
  const [familyName, setFamilyName] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateSignUpForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    if (!password) {
      errors.password = "Password is required";
      isValid = false;
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }

    if (!givenName) {
      errors.givenName = "First name is required";
      isValid = false;
    }

    if (!familyName) {
      errors.familyName = "Last name is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateConfirmationForm = () => {
    const errors: Record<string, string> = {};
    let isValid = true;

    if (!confirmationCode) {
      errors.confirmationCode = "Confirmation code is required";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateSignUpForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            given_name: givenName,
            family_name: familyName,
            email,
          },
          autoSignIn: true,
        },
      });

      setStep("confirm");
    } catch (err: any) {
      console.error("Error signing up:", err);
      setError(err.message || "An error occurred during sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfirmationForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await confirmSignUp({
        username: email,
        confirmationCode,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Error confirming sign up:", err);
      setError(
        err.message || "An error occurred during confirmation. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (step === "confirm") {
    return (
      <Box as="form" onSubmit={handleConfirmSignUp}>
        <Stack.VStack spacing={6} align="stretch">
          {error && (
            <Alert status="error" borderRadius="md">
              <Alert.Icon />
              {error}
            </Alert>
          )}

          <Text fontWeight="medium">
            We've sent a confirmation code to {email}. Please enter the code below to verify your account.
          </Text>

          <FormControl isInvalid={!!formErrors.confirmationCode}>
            <FormControl.Label htmlFor="confirmation-code">Confirmation Code</FormControl.Label>
            <Input
              id="confirmation-code"
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Enter the 6-digit code"
            />
            {formErrors.confirmationCode && (
              <FormControl.ErrorMessage>{formErrors.confirmationCode}</FormControl.ErrorMessage>
            )}
            <FormControl.HelperText>
              Check your email inbox (and spam folder) for the verification code
            </FormControl.HelperText>
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            size="lg"
            isLoading={isLoading}
            loadingText="Verifying..."
          >
            Verify Email
          </Button>

          <Button
            variant="ghost"
            onClick={() => setStep("signup")}
            disabled={isLoading}
          >
            Back to Sign Up
          </Button>
        </Stack.VStack>
      </Box>
    );
  }

  return (
    <Box as="form" onSubmit={handleSignUp}>
      <Stack.VStack spacing={6} align="stretch">
        {error && (
          <Alert status="error" borderRadius="md">
            <Alert.Icon />
            {error}
          </Alert>
        )}

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <Grid.Item>
            <FormControl isInvalid={!!formErrors.givenName}>
              <FormControl.Label htmlFor="given-name">First Name</FormControl.Label>
              <Input
                id="given-name"
                value={givenName}
                onChange={(e) => setGivenName(e.target.value)}
                placeholder="First name"
              />
              {formErrors.givenName && (
                <FormControl.ErrorMessage>{formErrors.givenName}</FormControl.ErrorMessage>
              )}
            </FormControl>
          </Grid.Item>

          <Grid.Item>
            <FormControl isInvalid={!!formErrors.familyName}>
              <FormControl.Label htmlFor="family-name">Last Name</FormControl.Label>
              <Input
                id="family-name"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                placeholder="Last name"
              />
              {formErrors.familyName && (
                <FormControl.ErrorMessage>{formErrors.familyName}</FormControl.ErrorMessage>
              )}
            </FormControl>
          </Grid.Item>
        </Grid>

        <FormControl isInvalid={!!formErrors.email}>
          <FormControl.Label htmlFor="email">Email</FormControl.Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          {formErrors.email && (
            <FormControl.ErrorMessage>{formErrors.email}</FormControl.ErrorMessage>
          )}
        </FormControl>

        <FormControl isInvalid={!!formErrors.password}>
          <FormControl.Label htmlFor="password">Password</FormControl.Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
          />
          {formErrors.password ? (
            <FormControl.ErrorMessage>{formErrors.password}</FormControl.ErrorMessage>
          ) : (
            <FormControl.HelperText>
              Password must be at least 8 characters
            </FormControl.HelperText>
          )}
        </FormControl>

        <FormControl isInvalid={!!formErrors.confirmPassword}>
          <FormControl.Label htmlFor="confirm-password">Confirm Password</FormControl.Label>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
          />
          {formErrors.confirmPassword && (
            <FormControl.ErrorMessage>{formErrors.confirmPassword}</FormControl.ErrorMessage>
          )}
        </FormControl>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          size="lg"
          isLoading={isLoading}
          loadingText="Creating account..."
        >
          Create Account
        </Button>

        <Divider />

        <Text align="center" color="gray.500" fontSize="sm">
          By creating an account, you agree to our Terms of Service and Privacy
          Policy
        </Text>
      </Stack.VStack>
    </Box>
  );
}
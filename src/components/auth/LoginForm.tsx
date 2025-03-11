"use client";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  Input,
  Stack,
  Text,
} from '@chakra-ui/react';
import { signIn } from 'aws-amplify/auth';
import { useState } from 'react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const validateForm = () => {
    let isValid = true;
    setEmailError(null);
    setPasswordError(null);

    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { isSignedIn } = await signIn({ 
        username: email, 
        password 
      });
      
      if (isSignedIn && onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error signing in:', err);
      setError(
        err.message || 'An error occurred during sign in. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <Stack.VStack spacing={4} align="stretch">
        {error && (
          <Alert status="error" borderRadius="md">
            <Alert.Icon />
            {error}
          </Alert>
        )}

        <FormControl isInvalid={!!emailError}>
          <FormControl.Label htmlFor="email">Email</FormControl.Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
          />
          {emailError && <FormControl.ErrorMessage>{emailError}</FormControl.ErrorMessage>}
        </FormControl>

        <FormControl isInvalid={!!passwordError}>
          <FormControl.Label htmlFor="password">Password</FormControl.Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="•••••••••"
          />
          {passwordError && <FormControl.ErrorMessage>{passwordError}</FormControl.ErrorMessage>}
        </FormControl>

        <Stack.Row justify="space-between" align="center">
          <Checkbox defaultChecked>Remember me</Checkbox>
          <Button variant="link" colorScheme="blue" size="sm">
            Forgot password?
          </Button>
        </Stack.Row>

        <Button
          type="submit"
          colorScheme="blue"
          width="full"
          isLoading={isLoading}
          loadingText="Signing in..."
        >
          Sign In
        </Button>

        <Divider />

        <Text align="center" color="gray.500" fontSize="sm">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </Text>
      </Stack.VStack>
    </Box>
  );
}
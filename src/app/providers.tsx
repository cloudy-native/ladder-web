"use client";

import { ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import { StrictMode, useEffect, useState } from "react";
import config from "../../amplify_outputs.json";
import { Layout } from "../components/ui/layout/Layout";
import { theme } from "../theme/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Configure Amplify on the client side only
    if (typeof window !== "undefined") {
      Amplify.configure(config);

      // Initialize auth listeners for user management
      // authListeners();
      setIsClient(true);
    }
  }, []);

  if (!isClient) {
    return (
      <StrictMode>
        <ChakraProvider value={theme}>
          <Layout>
            <div>Loading authentication...</div>
          </Layout>
        </ChakraProvider>
      </StrictMode>
    );
  }

  return (
    <StrictMode>
      <ChakraProvider value={theme}>
        <ThemeProvider>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </ChakraProvider>
    </StrictMode>
  );
}

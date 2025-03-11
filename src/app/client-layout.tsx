"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode, useEffect } from "react";
import { theme } from "../theme/theme";
import { Layout } from "../components/ui/layout/Layout";
import { Amplify } from "aws-amplify";
import config from "../../amplify_outputs.json";
import { Authenticator } from "@aws-amplify/ui-react";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Amplify for data operations
  useEffect(() => {
    console.log("Configuring Amplify in client-layout");
    Amplify.configure(config);
    console.log("Amplify configured successfully");
  }, []);

  return (
    <StrictMode>
      <ChakraProvider value={theme}>
        <Authenticator>
          <Layout>{children}</Layout>
        </Authenticator>
      </ChakraProvider>
    </StrictMode>
  );
}

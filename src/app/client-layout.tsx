'use client'

import { ChakraProvider } from "@chakra-ui/react";
import { StrictMode, useEffect } from "react";
import { theme } from "../theme/theme";
import { Layout } from "../components/ui/layout/Layout";
import { Amplify } from "aws-amplify";
import config from "../../amplify_outputs.json";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Amplify for data operations
  useEffect(() => {
    console.log("Configuring Amplify in client-layout");
    Amplify.configure({
      API: {
        GraphQL: {
          endpoint: config.data.url,
          region: config.data.aws_region,
          defaultAuthMode: 'apiKey'
        }
      }
    });
    console.log("Amplify configured successfully");
  }, []);

  return (
    <StrictMode>
      <ChakraProvider value={theme}>
        <Layout>
          {children}
        </Layout>
      </ChakraProvider>
    </StrictMode>
  );
}
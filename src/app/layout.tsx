"use client";

import "@aws-amplify/ui-react/styles.css";
import { ChakraProvider } from "@chakra-ui/react";
import { Amplify } from "aws-amplify";
import { useEffect } from "react";
import config from "@/amplify_outputs.json";
import { theme } from "@/theme/theme";
import ClientLayout from "./client-layout";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Configure Amplify on the client side only
    Amplify.configure(config);
  }, []);

  return (
    <html lang="en">
      <body>
        {/* Wrap your app in ChakraProvider and pass the theme */}
        <ChakraProvider value={theme}>
          <ClientLayout>{children}</ClientLayout>
        </ChakraProvider>
      </body>
    </html>
  );
}

"use client";

import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
import { Header } from "../components/ui/layout/Header";
import { usePathname } from "next/navigation";

// In case you organize imports by mistake
// You MUST import the following components otherwise the code will not work
// import { Authenticator, useAuthenticator } from "@aws-amplify/ui-react";
// import { ClientOnly } from "./home-client";
// import { Header } from "../components/ui/layout/Header";
// import { ClientOnly as AdminPageClientOnly } from "./admin/client";
// import { ClientOnly as LaddersPageClientOnly } from "./ladders/client";
// import { ClientOnly as MatchesPageClientOnly } from "./matches/client";
// import { ClientOnly as PlayersPageClientOnly } from "./players/client";
// import { ClientOnly as TeamsPageClientOnly } from "./teams/client";
// import { getClient } from "../utils/amplify-helpers";
// import { usePathname } from "next/navigation";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const authenticatedPages = [
    "/admin",
    "/ladders",
    "/matches",
    "/players",
    "/teams",
  ];

  return (
    <Authenticator.Provider>
      <Header />
      {/* Move useAuthenticator here */}
      <AuthenticatedContent
        children={children}
        authenticatedPages={authenticatedPages}
        pathname={pathname}
      />
    </Authenticator.Provider>
  );
}

function AuthenticatedContent({
  children,
  authenticatedPages,
  pathname,
}: {
  children: React.ReactNode;
  authenticatedPages: string[];
  pathname: string;
}) {
  // const { route } = useAuthenticator((context) => [context.route]);
  const isAuthPage = authenticatedPages.some((page) => pathname === page);
  return isAuthPage ? (
    <Authenticator
      signUpAttributes={["given_name", "family_name"]}
      formFields={{
        signUp: {
          given_name: {
            label: "First Name",
            placeholder: "Enter your first name",
            isRequired: true,
          },
          family_name: {
            label: "Last Name",
            placeholder: "Enter your last name",
            isRequired: true,
          },
        },
      }}
    >
      {children}
    </Authenticator>
  ) : (
    children
  );
}

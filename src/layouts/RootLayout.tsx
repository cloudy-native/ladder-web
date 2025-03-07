import { Outlet } from "react-router-dom";
import { Layout } from "../components/ui/layout/Layout";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

export default function RootLayout() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <Layout signOut={signOut}>
          <Outlet />
        </Layout>
      )}
    </Authenticator>
  );
}
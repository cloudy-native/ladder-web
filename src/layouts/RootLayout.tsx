import { Outlet } from "react-router-dom";
import { Layout } from "../components/ui/layout/Layout";

export default function RootLayout() {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
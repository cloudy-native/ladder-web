import { Amplify } from "aws-amplify";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "./components/ui/provider";

import config from "../amplify_outputs.json";

import App from "./App";
import authListeners from "./utils/auth-listeners";

// TODO: local dev only
//
Amplify.configure(config);

// Used to create Player for logged in user the first time, and so on
//
authListeners();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Provider>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>
);

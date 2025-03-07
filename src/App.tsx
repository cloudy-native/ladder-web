import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Button, Container } from "@chakra-ui/react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <Container w="80%">
      <Button onClick={() => setCount((count) => count + 1)}>
        ChakraUI count is {count}
      </Button>
    </Container>
  );
}

export default App;

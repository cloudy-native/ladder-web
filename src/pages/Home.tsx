import { useState } from "react";
import { Button, Container } from "@chakra-ui/react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <Container maxW="container.lg">
      <Button onClick={() => setCount((count) => count + 1)}>
        ChakraUI count is {count}
      </Button>
    </Container>
  );
}
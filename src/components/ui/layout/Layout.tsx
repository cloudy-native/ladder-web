import { Box, Flex } from '@chakra-ui/react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
  signOut?: () => void;
}

export const Layout = ({ children, signOut }: LayoutProps) => {
  return (
    <Flex direction="column" minH="100vh">
      <Header signOut={signOut} />
      <Box as="main" flex="1" py={8} px={4}>
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};
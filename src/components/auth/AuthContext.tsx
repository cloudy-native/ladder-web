"use client";

import { getCurrentUser, signOut } from "aws-amplify/auth";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthUser {
  username: string;
  email?: string;
  givenName?: string;
  familyName?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      
      // User is logged in
      const userData: AuthUser = {
        username: currentUser.username,
      };
      
      if (currentUser.signInDetails?.loginId) {
        userData.email = currentUser.signInDetails.loginId;
      }

      // In a real-world app, you would likely also get user attributes here
      // For simplicity, we're just setting basic info
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // User is not logged in
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  useEffect(() => {
    fetchUserData();
    
    // In a production app, you would set up auth event listeners here
    // to handle things like sign-in, sign-out, etc.
    
    return () => {
      // Clean up listeners
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
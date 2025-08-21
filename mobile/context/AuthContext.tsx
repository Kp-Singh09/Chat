import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the shape of the authentication state
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
}

// Define the shape of the context value
interface AuthContextType {
  authState: AuthState;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
  });

  // Function to handle login
  const login = async (token: string) => {
    try {
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('token', token);
      // Update the state
      setAuthState({
        token: token,
        isAuthenticated: true,
      });
    } catch (e) {
      // Handle saving error
      console.error('Failed to save the token to storage', e);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      // Remove the token from AsyncStorage
      await AsyncStorage.removeItem('token');
      // Update the state
      setAuthState({
        token: null,
        isAuthenticated: false,
      });
    } catch (e) {
      // Handle removal error
      console.error('Failed to remove the token from storage', e);
    }
  };

  const value = {
    authState,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
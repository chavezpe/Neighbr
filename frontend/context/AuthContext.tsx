import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { loginUser, signupUser, verifyToken } from '@/api/auth';
import { jwtDecode } from 'jwt-decode';

type DecodedToken = {
  sub: string;
  user_id: string;
  community_id: string;
  is_admin: boolean;
  exp: number;
};

type User = {
  id: string;
  email: string;
  communityId: string;
  isAdmin: boolean;
};

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  token: string | null;
};

type AuthContextType = AuthState & {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, hoaCode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true,
    token: null,
  });

  useEffect(() => {
    // Try to restore the session on app load
    refreshSession();
  }, []);

  const refreshSession = async (): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const storedToken = await SecureStore.getItemAsync('auth_token');
      
      if (!storedToken) {
        setState({ isAuthenticated: false, user: null, isLoading: false, token: null });
        return false;
      }

      // Verify the token with the backend
      const isValid = await verifyToken(storedToken);
      if (!isValid) {
        await SecureStore.deleteItemAsync('auth_token');
        setState({ isAuthenticated: false, user: null, isLoading: false, token: null });
        return false;
      }

      // Decode the token
      const decoded = jwtDecode<DecodedToken>(storedToken);
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        await SecureStore.deleteItemAsync('auth_token');
        setState({ isAuthenticated: false, user: null, isLoading: false, token: null });
        return false;
      }

      // Set authentication state
      setState({
        isAuthenticated: true,
        user: {
          id: decoded.user_id,
          email: decoded.sub,
          communityId: decoded.community_id,
          isAdmin: decoded.is_admin,
        },
        isLoading: false,
        token: storedToken,
      });
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      setState({ isAuthenticated: false, user: null, isLoading: false, token: null });
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await loginUser(email, password);
      
      if (response && response.access_token) {
        await SecureStore.setItemAsync('auth_token', response.access_token);
        
        // Decode the token
        const decoded = jwtDecode<DecodedToken>(response.access_token);
        
        setState({
          isAuthenticated: true,
          user: {
            id: decoded.user_id,
            email: decoded.sub,
            communityId: decoded.community_id,
            isAdmin: decoded.is_admin,
          },
          isLoading: false,
          token: response.access_token,
        });
        
        // Navigate to the appropriate screen
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string, hoaCode: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const response = await signupUser(name, email, password, hoaCode);
      
      if (response && response.access_token) {
        await SecureStore.setItemAsync('auth_token', response.access_token);
        
        // Decode the token
        const decoded = jwtDecode<DecodedToken>(response.access_token);
        
        setState({
          isAuthenticated: true,
          user: {
            id: decoded.user_id,
            email: decoded.sub,
            communityId: decoded.community_id,
            isAdmin: decoded.is_admin,
          },
          isLoading: false,
          token: response.access_token,
        });
        
        // Navigate to the appropriate screen
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await SecureStore.deleteItemAsync('auth_token');
      setState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        token: null,
      });
      router.replace('/(auth)/login-screen');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';

interface User {
  id: number;
  username: string;
  email?: string;
  full_name?: string;
  role: 'admin' | 'user';
  is_active: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

// Token management
const TOKEN_KEY = 'fertilizer_shop_token';
const TOKEN_EXPIRY_KEY = 'fertilizer_shop_token_expiry';

const setToken = (token: string, expiresIn?: number) => {
  localStorage.setItem(TOKEN_KEY, token);
  if (expiresIn) {
    const expiryTime = Date.now() + (expiresIn * 1000);
    localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
  }
};

const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token) return null;
  
  if (expiry && Date.now() > parseInt(expiry)) {
    clearToken();
    return null;
  }
  
  return token;
};

const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password);
      const tokenData = response.data;
      
      // Store token with expiry
      if (tokenData.access_token) {
        setToken(tokenData.access_token, tokenData.expires_in || 86400);
      }
      
      // Fetch user data using the token
      await refreshUser();
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    clearToken();
    // Optionally call logout API
    authApi.logout().catch(() => {
      // Ignore errors on logout
    });
  };

  const refreshUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data);
    } catch (error) {
      // If refresh fails, clear user data
      setUser(null);
      clearToken();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          // Token is invalid, clear it
          clearToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TableUser, getSessionUser, tableLogout } from '@/lib/tableAuth';

export type UserRole = 'admin' | 'hr' | 'employee';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  authUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getSessionUser();
      if (user) {
        setAuthUser({
          id: user.id,
          email: user.email,
          role: user.role,
          profileId: user.profileId,
          firstName: user.firstName,
          lastName: user.lastName,
        });
      } else {
        setAuthUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await refreshUser();
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    try {
      await tableLogout();
      setAuthUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      setAuthUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authUser, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

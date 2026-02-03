import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, getCurrentUser, UserRole } from '@/lib/auth';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  authUser: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  authUser: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getCurrentUser();
      setAuthUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        // Handle different auth events securely
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          setAuthUser(null);
          setLoading(false);
          return;
        }

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Defer fetching user details to avoid deadlock
          if (session?.user) {
            setTimeout(async () => {
              if (mounted) {
                await refreshUser();
                setLoading(false);
              }
            }, 0);
          }
        } else {
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshUser]);

  const signOut = useCallback(async () => {
    try {
      // Clear local state first
      setUser(null);
      setSession(null);
      setAuthUser(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any cached data
      localStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Sign out error:', error);
      // Still clear local state even if remote signout fails
      setUser(null);
      setSession(null);
      setAuthUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, authUser, loading, signOut, refreshUser }}>
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

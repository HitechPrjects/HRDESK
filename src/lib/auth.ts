import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'admin' | 'hr' | 'employee';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  profileId: string;
  firstName: string;
  lastName: string;
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get user role
  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // Get profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, first_name, last_name')
    .eq('user_id', user.id)
    .single();

  if (!roleData || !profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    role: roleData.role as UserRole,
    profileId: profile.id,
    firstName: profile.first_name,
    lastName: profile.last_name,
  };
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .single();

  return data?.role as UserRole | null;
}

export function getRedirectPath(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'hr':
      return '/hr';
    case 'employee':
      return '/employee';
    default:
      return '/';
  }
}
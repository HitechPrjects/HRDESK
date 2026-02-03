import { supabase } from '@/integrations/supabase/client';

/**
 * User object returned to the app
 */
export interface TableUser {
  id: string;          // auth.users.id
  profileId: string;   // profiles.id
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'hr' | 'employee';
}

export interface LoginResult {
  success: boolean;
  user?: TableUser;
  error?: string;
}

/**
 * LOGIN
 * Uses Supabase Auth (email + password)
 */
export async function tableLogin(
  email: string,
  password: string
): Promise<LoginResult> {
  try {
    // 1. Authenticate via Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password,
      });

    if (authError || !authData.user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const userId = authData.user.id;

    // 2. Fetch profile (created by trigger)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found' };
    }

    // 3. Fetch role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (roleError || !roleData) {
      return { success: false, error: 'User role not found' };
    }

    return {
      success: true,
      user: {
        id: userId,
        profileId: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: roleData.role as 'admin' | 'hr' | 'employee',
      },
    };
  } catch (err) {
    console.error('Login error:', err);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * LOGOUT
 * Clears Supabase Auth session
 */
export async function tableLogout(): Promise<void> {
  await supabase.auth.signOut();
}
/**
 * Get currently authenticated user with profile + role
 */
export async function getSessionUser(): Promise<TableUser | null> {
  try {
    // 1. Get auth session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return null;
    }

    const userId = session.user.id;

    // 2. Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name')
      .eq('user_id', userId)
      .single();

    if (profileError || !profile) {
      return null;
    }

    // 3. Fetch role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    return {
      id: userId,
      profileId: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: (roleData?.role as 'admin' | 'hr' | 'employee') || 'employee',
    };
  } catch (err) {
    console.error('Get session user error:', err);
    return null;
  }
}

/**
 * SIGN UP (create user)
 * Supabase Auth creates auth.users
 * Trigger creates profiles row automatically
 */
export async function tableSignUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signUp({
      email: email.toLowerCase().trim(),
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Signup error:', err);
    return { success: false, error: 'Signup failed' };
  }
}

/**
 * Assign role to a user (admin/hr only via RLS)
 */
export async function assignUserRole(
  userId: string,
  role: 'admin' | 'hr' | 'employee'
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update password (Supabase Auth)
 */
export async function updatePassword(
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
/**
 * Check if the current user has a specific role
 */
export async function hasRole(
  role: 'admin' | 'hr' | 'employee'
): Promise<boolean> {
  try {
    const user = await getSessionUser();
    if (!user) return false;
    return user.role === role;
  } catch {
    return false;
  }
}

/**
 * Convenience helpers
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole('admin');
}

export async function isHR(): Promise<boolean> {
  return hasRole('hr');
}

export async function isEmployee(): Promise<boolean> {
  return hasRole('employee');
}

/**
 * Force refresh the auth session
 * Useful after role changes
 */
export async function refreshSession(): Promise<void> {
  await supabase.auth.refreshSession();
}

/**
 * Subscribe to auth state changes
 * Useful for global auth context
 */
export function onAuthStateChange(
  callback: (event: string) => void
) {
  return supabase.auth.onAuthStateChange((event) => {
    callback(event);
  });
}

/**
 * Get raw Supabase auth user
 * (useful for debugging / advanced cases)
 */
export async function getAuthUser() {
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

/**
 * Completely sign out and clear state
 */
export async function fullLogout(): Promise<void> {
  await supabase.auth.signOut();
}

/**
 * END OF FILE
 * All authentication is now handled by Supabase Auth
 * Profiles and roles are fetched via RLS-protected tables
 */

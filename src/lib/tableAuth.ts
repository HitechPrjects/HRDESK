import { supabase } from '@/integrations/supabase/client';

export interface TableUser {
  id: string;
  profileId: string;
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

export interface CreateUserResult {
  success: boolean;
  userId?: string;
  profileId?: string;
  error?: string;
}

/**
 * Login using email and password against the profiles table
 * Password verification is done using PostgreSQL's pgcrypto
 */
export async function tableLogin(email: string, password: string): Promise<LoginResult> {
  try {
    // Find user by email and verify password using DB function
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name, password_hash')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      return { success: false, error: 'Login failed. Please try again.' };
    }

    if (!profile) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!profile.password_hash) {
      return { success: false, error: 'Account not properly configured. Please contact admin.' };
    }

    // Verify password using PostgreSQL's verify_password function
    const { data: verifyResult, error: verifyError } = await supabase
      .rpc('verify_password', {
        password: password,
        password_hash: profile.password_hash
      });

    if (verifyError) {
      console.error('Password verification error:', verifyError);
      return { success: false, error: 'Login failed. Please try again.' };
    }

    if (!verifyResult) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Get user role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    if (roleError || !roleData) {
      return { success: false, error: 'User role not found' };
    }

    // Create session in user_sessions table
    const sessionToken = generateSessionToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        profile_id: profile.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return { success: false, error: 'Failed to create session' };
    }

    // Store session token in localStorage
    localStorage.setItem('hrms_session_token', sessionToken);
    localStorage.setItem('hrms_user_id', profile.user_id);

    return {
      success: true,
      user: {
        id: profile.user_id,
        profileId: profile.id,
        email: profile.email,
        firstName: profile.first_name,
        lastName: profile.last_name,
        role: roleData.role as 'admin' | 'hr' | 'employee',
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Logout - clear session from database and localStorage
 */
export async function tableLogout(): Promise<void> {
  const sessionToken = localStorage.getItem('hrms_session_token');
  
  if (sessionToken) {
    await supabase
      .from('user_sessions')
      .delete()
      .eq('session_token', sessionToken);
  }

  localStorage.removeItem('hrms_session_token');
  localStorage.removeItem('hrms_user_id');
}

/**
 * Get current session user
 */
export async function getSessionUser(): Promise<TableUser | null> {
  const sessionToken = localStorage.getItem('hrms_session_token');
  
  if (!sessionToken) {
    return null;
  }

  try {
    // Check if session is valid
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('profile_id, expires_at')
      .eq('session_token', sessionToken)
      .maybeSingle();

    if (sessionError || !session) {
      localStorage.removeItem('hrms_session_token');
      localStorage.removeItem('hrms_user_id');
      return null;
    }

    // Check if session expired
    if (new Date(session.expires_at) < new Date()) {
      await supabase.from('user_sessions').delete().eq('session_token', sessionToken);
      localStorage.removeItem('hrms_session_token');
      localStorage.removeItem('hrms_user_id');
      return null;
    }

    // Get profile and role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, user_id, email, first_name, last_name')
      .eq('id', session.profile_id)
      .maybeSingle();

    if (profileError || !profile) {
      return null;
    }

    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.user_id)
      .maybeSingle();

    return {
      id: profile.user_id,
      profileId: profile.id,
      email: profile.email,
      firstName: profile.first_name,
      lastName: profile.last_name,
      role: (roleData?.role as 'admin' | 'hr' | 'employee') || 'employee',
    };
  } catch (error) {
    console.error('Session check error:', error);
    return null;
  }
}

/**
 * Create a new user with password hashed using PostgreSQL's pgcrypto
 */
export async function createTableUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  role: 'hr' | 'employee',
  additionalData?: {
    phone?: string;
    department_id?: string;
    designation_id?: string;
    date_of_birth?: string;
    joining_date?: string;
    employee_id?: string;
    reporting_manager?: string;
  }
): Promise<CreateUserResult> {
  try {
    // Check if email already exists
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .maybeSingle();

    if (existing) {
      return { success: false, error: 'Email already registered' };
    }

    // Hash the password using PostgreSQL's hash_password function
    const { data: passwordHash, error: hashError } = await supabase
      .rpc('hash_password', { password: password });

    if (hashError || !passwordHash) {
      console.error('Password hashing error:', hashError);
      return { success: false, error: 'Failed to secure password' };
    }

    // Generate a unique user_id (UUID format)
    const userId = crypto.randomUUID();

    // Create profile with hashed password
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        email: email.toLowerCase().trim(),
        first_name: firstName,
        last_name: lastName,
        password_hash: passwordHash,
        phone: additionalData?.phone || null,
        department_id: additionalData?.department_id || null,
        designation_id: additionalData?.designation_id || null,
        date_of_birth: additionalData?.date_of_birth || null,
        joining_date: additionalData?.joining_date || new Date().toISOString().split('T')[0],
        employee_id: additionalData?.employee_id || null,
        reporting_manager: additionalData?.reporting_manager || null,
      })
      .select('id')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { success: false, error: profileError.message };
    }

    // Create user role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role: role,
      });

    if (roleError) {
      console.error('Role creation error:', roleError);
      // Rollback profile creation
      await supabase.from('profiles').delete().eq('id', profile.id);
      return { success: false, error: 'Failed to assign role' };
    }

    return {
      success: true,
      userId: userId,
      profileId: profile.id,
    };
  } catch (error) {
    console.error('Create user error:', error);
    return { success: false, error: 'Failed to create user' };
  }
}

/**
 * Update user password using PostgreSQL's hash_password function
 */
export async function updatePassword(profileId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Hash the new password using PostgreSQL function
    const { data: passwordHash, error: hashError } = await supabase
      .rpc('hash_password', { password: newPassword });

    if (hashError || !passwordHash) {
      return { success: false, error: 'Failed to secure password' };
    }
    
    const { error } = await supabase
      .from('profiles')
      .update({ password_hash: passwordHash })
      .eq('id', profileId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Update password error:', error);
    return { success: false, error: 'Failed to update password' };
  }
}

function generateSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

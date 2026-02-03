// Re-export from tableAuth for backward compatibility
export type { TableUser as AuthUser } from './tableAuth';
export type UserRole = 'admin' | 'hr' | 'employee';

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

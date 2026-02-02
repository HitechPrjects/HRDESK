import { useAuth } from '@/contexts/AuthContext';
import { CheckInOutButton } from '@/components/attendance/CheckInOutButton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const { authUser, signOut } = useAuth();
  const navigate = useNavigate();

  const showCheckInOut = authUser?.role === 'hr' || authUser?.role === 'employee';

  const getInitials = () => {
    if (!authUser) return '';
    return `${authUser.firstName?.[0] || ''}${authUser.lastName?.[0] || ''}`;
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getSettingsPath = () => {
    switch (authUser?.role) {
      case 'admin':
        return '/admin/settings';
      case 'hr':
        return '/hr/settings';
      case 'employee':
        return '/employee/settings';
      default:
        return '/';
    }
  };

  return (
    <header className="fixed right-0 top-0 z-40 flex h-16 items-center justify-end gap-4 border-b bg-background px-6 md:left-64">
      {showCheckInOut && (
        <CheckInOutButton />
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium leading-none">
                {authUser?.firstName} {authUser?.lastName}
              </p>
              <p className="text-xs text-muted-foreground capitalize">
                {authUser?.role}
              </p>
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(getSettingsPath())}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

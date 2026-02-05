import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building,
  Briefcase,
  Calendar,
  Clock,
  CheckSquare,
  CalendarDays,
  GraduationCap,
  Target,
  DollarSign,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  items: SidebarItem[];
  header:React.ReactNode;
}

export function Sidebar({ items, header }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };


  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen border-r bg-sidebar transition-all duration-300',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
            {!collapsed && header}
            <Button
              variant="ghost"
              size="icon"
              className="flex md:hidden text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                className={cn(
                  'h-4 w-4 transition-transform',
                  collapsed && 'rotate-180'
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors text-sidebar-foreground',
                      isActive
                        ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                        : 'hover:bg-sidebar-accent'
                    )}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.title}</span>}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="border-t border-sidebar-border p-2">
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent',
                collapsed && 'justify-center px-2'
              )}
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              {!collapsed && <span>Sign Out</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
}

export const adminSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Employees', href: '/admin/employees', icon: <Users className="h-4 w-4" /> },
  { title: 'Departments', href: '/admin/departments', icon: <Building className="h-4 w-4" /> },
  { title: 'Designations', href: '/admin/designations', icon: <Briefcase className="h-4 w-4" /> },
  { title: 'Attendance', href: '/admin/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheets', href: '/admin/timesheets', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/admin/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/admin/leaves', icon: <CalendarDays className="h-4 w-4" /> },
  { title: 'Training', href: '/admin/training', icon: <GraduationCap className="h-4 w-4" /> },
  { title: 'Goalsheets', href: '/admin/goalsheets', icon: <Target className="h-4 w-4" /> },
  { title: 'Payroll', href: '/admin/payroll', icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Announcements', href: '/admin/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

export const hrSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/hr', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Employees', href: '/hr/employees', icon: <Users className="h-4 w-4" /> },
  { title: 'Departments', href: '/hr/departments', icon: <Building className="h-4 w-4" /> },
  { title: 'Designations', href: '/hr/designations', icon: <Briefcase className="h-4 w-4" /> },
  { title: 'Attendance', href: '/hr/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheets', href: '/hr/timesheets', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/hr/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/hr/leaves', icon: <CalendarDays className="h-4 w-4" /> },
  { title: 'Training', href: '/hr/training', icon: <GraduationCap className="h-4 w-4" /> },
  { title: 'Goalsheets', href: '/hr/goalsheets', icon: <Target className="h-4 w-4" /> },
  { title: 'Payroll', href: '/hr/payroll', icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Announcements', href: '/hr/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { title: 'Settings', href: '/hr/settings', icon: <Settings className="h-4 w-4" /> },
];

export const employeeSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/employee', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Attendance', href: '/employee/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheet', href: '/employee/timesheet', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/employee/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/employee/leaves', icon: <CalendarDays className="h-4 w-4" /> },
  { title: 'Training', href: '/employee/training', icon: <GraduationCap className="h-4 w-4" /> },
  { title: 'Goals', href: '/employee/goals', icon: <Target className="h-4 w-4" /> },
  { title: 'Settings', href: '/employee/settings', icon: <Settings className="h-4 w-4" /> },
];

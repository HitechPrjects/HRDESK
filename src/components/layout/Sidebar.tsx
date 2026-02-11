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

/* ================= TYPES ================= */

interface SidebarItem {
  title: string;
  href?: string;
  icon: React.ReactNode;
  children?: SidebarItem[];
}

interface SidebarProps {
  items: SidebarItem[];
  header: React.ReactNode;
}

/* ================= SIDEBAR COMPONENT ================= */

export function Sidebar({ items, header }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const { signOut } = useAuth();

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden bg-background"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
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
              className="hidden md:flex text-sidebar-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronLeft
                className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')}
              />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-4">
            <nav className="space-y-1">
              {items.map((item) => {
                const isActive =
                item.href &&
                (
                  location.pathname === item.href ||
                  (
                    item.href !== '/admin' &&
                    item.href !== '/hr' &&
                    item.href !== '/employee' &&
                    location.pathname.startsWith(item.href + '/')
                  )
                );

                const isOpen = openMenus[item.title];

                if (item.children) {
                  return (
                    <div key={item.title}>
                      <button
                        onClick={() => toggleMenu(item.title)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent"
                      >
                        {item.icon}
                        {!collapsed && (
                          <span className="flex-1 text-left">{item.title}</span>
                        )}
                        {!collapsed && (
                          <ChevronLeft
                            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-[-90deg]')}
                          />
                        )}
                      </button>

                      {isOpen && !collapsed && (
                        <div className="ml-6 mt-1 space-y-1">
                          {item.children.map((child) => {
                            const childActive =
                              location.pathname === child.href;

                            return (
                              <Link
                                key={child.href}
                                to={child.href!}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                  'block rounded-md px-3 py-2 text-sm',
                                  childActive
                                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                                    : 'text-sidebar-foreground hover:bg-sidebar-accent'
                                )}
                              >
                                {child.title}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                /* Normal Item */
                return (
                  <Link
                    key={item.href}
                    to={item.href!}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground',
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

/* ================= ROLE MENUS ================= */

/* ---------- ADMIN ---------- */
export const adminSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Employees', href: '/admin/employees', icon: <Users className="h-4 w-4" /> },
  { title: 'Departments', href: '/admin/departments', icon: <Building className="h-4 w-4" /> },
  { title: 'Designations', href: '/admin/designations', icon: <Briefcase className="h-4 w-4" /> },
  { title: 'Attendance', href: '/admin/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheets', href: '/admin/timesheets', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/admin/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/admin/leaves', icon: <CalendarDays className="h-4 w-4" /> },

  {
    title: 'Training Details',
    href: '/admin/training/details',
    icon: <GraduationCap className="h-4 w-4" />
  },
  { title: 'Goalsheets', href: '/admin/goalsheets', icon: <Target className="h-4 w-4" /> },
  { title: 'Payroll', href: '/admin/payroll', icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Announcements', href: '/admin/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { title: 'Settings', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
];

/* ---------- HR ---------- */
export const hrSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/hr', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Employees', href: '/hr/employees', icon: <Users className="h-4 w-4" /> },
  { title: 'Departments', href: '/hr/departments', icon: <Building className="h-4 w-4" /> },
  { title: 'Designations', href: '/hr/designations', icon: <Briefcase className="h-4 w-4" /> },
  { title: 'Attendance', href: '/hr/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheets', href: '/hr/timesheets', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/hr/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/hr/leaves', icon: <CalendarDays className="h-4 w-4" /> },

  {
    title: 'Training',
    icon: <GraduationCap className="h-4 w-4" />,
    children: [
      { title: 'Daily Training', href: '/hr/training/daily', icon: null },
      { title: 'Ongoing Training', href: '/hr/training/ongoing', icon: null },
      { title: 'View Training Details', href: '/hr/training/details', icon: null },
    ],
  },

  { title: 'Goalsheets', href: '/hr/goalsheets', icon: <Target className="h-4 w-4" /> },
  { title: 'Payroll', href: '/hr/payroll', icon: <DollarSign className="h-4 w-4" /> },
  { title: 'Announcements', href: '/hr/announcements', icon: <Megaphone className="h-4 w-4" /> },
  { title: 'Settings', href: '/hr/settings', icon: <Settings className="h-4 w-4" /> },
];

/* ---------- EMPLOYEE ---------- */
export const employeeSidebarItems: SidebarItem[] = [
  { title: 'Dashboard', href: '/employee', icon: <LayoutDashboard className="h-4 w-4" /> },
  { title: 'Attendance', href: '/employee/attendance', icon: <Calendar className="h-4 w-4" /> },
  { title: 'Timesheet', href: '/employee/timesheet', icon: <Clock className="h-4 w-4" /> },
  { title: 'Tasks', href: '/employee/tasks', icon: <CheckSquare className="h-4 w-4" /> },
  { title: 'Leaves', href: '/employee/leaves', icon: <CalendarDays className="h-4 w-4" /> },

  {
    title: 'Training',
    icon: <GraduationCap className="h-4 w-4" />,
    children: [
      { title: 'Daily Training', href: '/employee/training/daily', icon: null },
      { title: 'Ongoing Training', href: '/employee/training/ongoing', icon: null },
    ],
  },

  { title: 'Goals', href: '/employee/goals', icon: <Target className="h-4 w-4" /> },
  { title: 'Settings', href: '/employee/settings', icon: <Settings className="h-4 w-4" /> },
];

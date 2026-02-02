import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimesheetEmployee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
}

interface TimesheetEntry {
  id: string;
  entry_number: number;
  from_time: string | null;
  to_time: string | null;
  description: string | null;
  hours: number | null;
}

interface AdminTimesheetsProps {
  viewMode?: 'all' | 'my' | 'employees';
}

export default function AdminTimesheets({ viewMode: initialViewMode }: AdminTimesheetsProps) {
  const { authUser } = useAuth();
  const [employees, setEmployees] = useState<TimesheetEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedEmployee, setSelectedEmployee] = useState<TimesheetEmployee | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [timesheetDialogOpen, setTimesheetDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  useEffect(() => {
    fetchEmployees();
  }, [viewMode, authUser]);

  const fetchEmployees = async () => {
    if (!authUser) return;
    
    try {
      // For employees, show only their own
      if (isEmployee || viewMode === 'my') {
        const { data } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('id', authUser.profileId)
          .single();

        setEmployees(data ? [{ ...data, role: authUser.role }] : []);
      } else {
        // For admin/HR, get all employees except admin
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, user_id')
          .eq('employment_status', 'active')
          .order('first_name');

        const { data: roles } = await supabase
          .from('user_roles')
          .select('user_id, role');

        const employeesWithRoles = profiles?.map(p => ({
          ...p,
          role: roles?.find(r => r.user_id === p.user_id)?.role || 'employee',
        })) || [];

        // Admin view: exclude admin timesheets
        // HR view: show HR and employees
        const filtered = employeesWithRoles.filter(e => e.role !== 'admin');
        setEmployees(filtered);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewTimesheet = async (employee: TimesheetEmployee) => {
    setSelectedEmployee(employee);
    setTimesheetDialogOpen(true);

    const { data: timesheet } = await supabase
      .from('timesheets')
      .select('id')
      .eq('profile_id', employee.id)
      .eq('timesheet_date', dateFilter)
      .single();

    if (timesheet) {
      const { data: entriesData } = await supabase
        .from('timesheet_entries')
        .select('*')
        .eq('timesheet_id', timesheet.id)
        .order('entry_number');

      setEntries(entriesData || []);
    } else {
      setEntries([]);
    }
  };

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Timesheets</h1>
        <p className="text-muted-foreground">
          {isEmployee ? 'View your timesheets' : 'View employee timesheets'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* View mode dropdown for HR */}
              {isHR && (
                <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="View mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="my">My Timesheet</SelectItem>
                    <SelectItem value="employees">Employee Timesheets</SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-auto"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">
                    {employee.first_name} {employee.last_name}
                  </TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => viewTimesheet(employee)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Timesheet
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No employees found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={timesheetDialogOpen} onOpenChange={setTimesheetDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Timesheet - {selectedEmployee?.first_name} {selectedEmployee?.last_name}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Date: {format(new Date(dateFilter), 'MMMM d, yyyy')}
          </p>

          {entries.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No timesheet entries for this date
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.entry_number}</TableCell>
                    <TableCell>{entry.from_time || '-'}</TableCell>
                    <TableCell>{entry.to_time || '-'}</TableCell>
                    <TableCell>{entry.hours?.toFixed(2) || '-'}</TableCell>
                    <TableCell>{entry.description || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

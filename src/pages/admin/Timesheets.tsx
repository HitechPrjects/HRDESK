import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format, subDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TimesheetRow {
  id: string;
  profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  timesheet_date: string;
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

  const [rows, setRows] = useState<TimesheetRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // last 30 days default
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [selectedRow, setSelectedRow] = useState<TimesheetRow | null>(null);
  const [entries, setEntries] = useState<TimesheetEntry[]>([]);
  const [open, setOpen] = useState(false);

  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');

  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  useEffect(() => {
    fetchTimesheets();
  }, [authUser, fromDate, toDate, viewMode]);

  const fetchTimesheets = async () => {
    if (!authUser) return;
    setLoading(true);

    try {
      let query = supabase
        .from('timesheets')
        .select(`
          id,
          profile_id,
          timesheet_date,
          profiles:profile_id(first_name, last_name, email)
        `)
        .gte('timesheet_date', fromDate)
        .lte('timesheet_date', toDate)
        .order('timesheet_date', { ascending: false });

      if (isEmployee || viewMode === 'my') {
        query = query.eq('profile_id', authUser.profileId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const mapped: TimesheetRow[] =
        data?.map((t: any) => ({
          id: t.id,
          profile_id: t.profile_id,
          timesheet_date: t.timesheet_date,
          first_name: t.profiles.first_name,
          last_name: t.profiles.last_name,
          email: t.profiles.email,
        })) || [];

      setRows(mapped);
    } catch (err) {
      console.error('fetchTimesheets error', err);
    } finally {
      setLoading(false);
    }
  };

  const viewTimesheet = async (row: TimesheetRow) => {
    setSelectedRow(row);
    setOpen(true);

    const { data } = await supabase
      .from('timesheet_entries')
      .select('*')
      .eq('timesheet_id', row.id)
      .order('entry_number');

    setEntries(data || []);
  };

  const filtered = rows.filter((r) =>
    `${r.first_name} ${r.last_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())
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
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees..." className="pl-10" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <span className="text-sm text-muted-foreground">to</span>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.first_name} {r.last_name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{format(new Date(r.timesheet_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="ghost" onClick={() => viewTimesheet(r)}>
                      <Eye className="mr-2 h-4 w-4" /> View Timesheet
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No timesheets in selected date range
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>
              Timesheet - {selectedRow?.first_name} {selectedRow?.last_name}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            Date: {selectedRow && format(new Date(selectedRow.timesheet_date), 'MMMM d, yyyy')}
          </p>

          <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
            {entries.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No timesheet entries for this date</p>
            ) : (
              <Table>
                <TableHeader className="bg-[hsl(var(--sidebar-background))]">
                  <TableRow >
                    <TableHead className="text-white">S.No</TableHead>
                    <TableHead className="text-white">From</TableHead>
                    <TableHead className="text-white">To</TableHead>
                    <TableHead className="text-white">Hours</TableHead>
                    <TableHead className="text-white">Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>{e.entry_number}</TableCell>
                      <TableCell>{e.from_time || '-'}</TableCell>
                      <TableCell>{e.to_time || '-'}</TableCell>
                      <TableCell>{e.hours?.toFixed(2) || '-'}</TableCell>
                      <TableCell>{e.description || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

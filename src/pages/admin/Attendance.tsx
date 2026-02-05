import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { format, differenceInSeconds, subDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AttendanceRecord {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
    email: string;
  };
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_ip: string | null;
  check_out_ip: string | null;
  total_hours: number | null;
  status: string;
}

interface AdminAttendanceProps {
  viewMode?: 'all' | 'my' | 'employees';
}

export default function AdminAttendance({ viewMode: initialViewMode }: AdminAttendanceProps) {
  const { authUser } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Default: last 30 days
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 29), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  // Live timer
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [fromDate, toDate, viewMode, authUser]);

  const fetchAttendance = async () => {
    if (!authUser) return;
    setLoading(true);

    try {
      let query = supabase
        .from('attendance')
        .select(`
          id,
          attendance_date,
          check_in_time,
          check_out_time,
          check_in_ip,
          check_out_ip,
          total_hours,
          status,
          profiles:profile_id(first_name, last_name, email)
        `)
        .gte('attendance_date', fromDate)
        .lte('attendance_date', toDate)
        .order('attendance_date', { ascending: false })
        .order('check_in_time', { ascending: false });

      // Employee → only own records
      if (isEmployee || viewMode === 'my') {
        query = query.eq('profile_id', authUser.profileId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const formatted =
        data?.map((a) => ({
          ...a,
          profile: a.profiles as any,
        })) || [];

      setAttendance(formatted);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAttendance = attendance.filter((a) =>
    `${a.profile?.first_name} ${a.profile?.last_name} ${a.profile?.email}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800">Present</Badge>;
      case 'absent':
        return <Badge variant="destructive">Absent</Badge>;
      case 'late':
        return <Badge className="bg-yellow-100 text-yellow-800">Late</Badge>;
      case 'half_day':
        return <Badge className="bg-orange-100 text-orange-800">Half Day</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatWorkingHours = (
    checkIn: string | null,
    checkOut: string | null,
    storedHours: number | null
  ) => {
    if (checkOut && storedHours) {
      const hours = Math.floor(storedHours);
      const minutes = Math.floor((storedHours - hours) * 60);
      const seconds = Math.floor(((storedHours - hours) * 60 - minutes) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (checkIn && !checkOut) {
      const checkInDate = new Date(checkIn);
      const diff = differenceInSeconds(currentTime, checkInDate);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes
        .toString()
        .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return '-';
  };

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
        <h1 className="text-3xl font-bold">Attendance Sheet</h1>
        <p className="text-muted-foreground">
          {isEmployee ? 'View your attendance records' : 'View all employee attendance records'}
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
                    <SelectItem value="my">My Attendance</SelectItem>
                    <SelectItem value="employees">Employee Attendance</SelectItem>
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

            {/* Date range filter */}
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
              <TableRow className="bg-[hsl(var(--sidebar-background))]">
                <TableHead className='text-white'>Employee</TableHead>
                <TableHead className='text-white'>Date</TableHead>
                <TableHead className='text-white'>Check In</TableHead>
                <TableHead className='text-white'>Check Out</TableHead>
                {!isEmployee && <TableHead className='text-white'>Check-in IP</TableHead>}
                {!isEmployee && <TableHead className='text-white'>Check-out IP</TableHead>}
                <TableHead className='text-white'>Working Hours</TableHead>
                <TableHead className='text-white'>Status</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    {record.profile?.first_name} {record.profile?.last_name}
                  </TableCell>
                  <TableCell>{format(new Date(record.attendance_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {record.check_in_time
                      ? format(new Date(record.check_in_time), 'hh:mm:ss a')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {record.check_out_time
                      ? format(new Date(record.check_out_time), 'hh:mm:ss a')
                      : '-'}
                  </TableCell>

                  {!isEmployee && (
                    <>
                      <TableCell className="font-mono text-sm">{record.check_in_ip || '-'}</TableCell>
                      <TableCell className="font-mono text-sm">{record.check_out_ip || '-'}</TableCell>
                    </>
                  )}

                  <TableCell className="font-mono">
                    {formatWorkingHours(record.check_in_time, record.check_out_time, record.total_hours)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}

              {filteredAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isEmployee ? 6 : 8} className="text-center text-muted-foreground">
                    No attendance records in selected date range
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

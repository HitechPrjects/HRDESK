import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search } from 'lucide-react';
import { format, differenceInSeconds } from 'date-fns';
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
  const [dateFilter, setDateFilter] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');
  const [currentTime, setCurrentTime] = useState(new Date());

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  // Update current time every second for live hours calculation
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [dateFilter, viewMode, authUser]);

  const fetchAttendance = async () => {
    if (!authUser) return;
    setLoading(true);
    
    try {
      let query = supabase
        .from('attendance')
        .select(`
          id, attendance_date, check_in_time, check_out_time, check_in_ip, total_hours, status,
          profiles:profile_id(first_name, last_name, email)
        `)
        .eq('attendance_date', dateFilter)
        .order('check_in_time', { ascending: false });

      // For employee, always show only their own
      if (isEmployee || viewMode === 'my') {
        query = query.eq('profile_id', authUser.profileId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formatted = data?.map(a => ({
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

  const filteredAttendance = attendance.filter(a =>
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

  const formatWorkingHours = (checkIn: string | null, checkOut: string | null, storedHours: number | null) => {
    if (checkOut && storedHours) {
      // Completed day - show stored hours
      const hours = Math.floor(storedHours);
      const minutes = Math.floor((storedHours - hours) * 60);
      const seconds = Math.floor(((storedHours - hours) * 60 - minutes) * 60);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else if (checkIn && !checkOut) {
      // Still working - calculate live
      const checkInDate = new Date(checkIn);
      const diff = differenceInSeconds(currentTime, checkInDate);
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
              {/* View mode dropdown for HR */}
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
                <TableHead>Date</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Working Hours</TableHead>
                <TableHead>Status</TableHead>
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
                  <TableCell className="font-mono text-sm">
                    {record.check_in_ip || '-'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {formatWorkingHours(record.check_in_time, record.check_out_time, record.total_hours)}
                  </TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
              {filteredAttendance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No attendance records for this date
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

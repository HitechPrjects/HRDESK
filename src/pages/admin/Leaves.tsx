import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Check, X } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const leaveSchema = z.object({
  leave_type_id: z.string().min(1, 'Select leave type'),
  start_date: z.string().min(1, 'Start date required'),
  end_date: z.string().min(1, 'End date required'),
  reason: z.string().optional(),
});

type LeaveForm = z.infer<typeof leaveSchema>;

interface Leave {
  id: string;
  profile_id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  leave_type: {
    name: string;
  };
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string | null;
  status: string;
  created_at: string;
}

interface LeaveType {
  id: string;
  name: string;
  default_days: number;
}

interface AdminLeavesProps {
  viewMode?: 'all' | 'my' | 'employees';
}

export default function AdminLeaves({ viewMode: initialViewMode }: AdminLeavesProps) {
  const { authUser } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');
  const { toast } = useToast();

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  const form = useForm<LeaveForm>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leave_type_id: '',
      start_date: '',
      end_date: '',
      reason: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, [viewMode, authUser]);

  const fetchData = async () => {
    if (!authUser) return;

    try {
      let query = supabase
        .from('leaves')
        .select(`
          id, profile_id, start_date, end_date, total_days, reason, status, created_at,
          profiles:profile_id(first_name, last_name),
          leave_types:leave_type_id(name)
        `)
        .order('created_at', { ascending: false });

      // For employees or "my" view, show only own leaves
      if (isEmployee || viewMode === 'my') {
        query = query.eq('profile_id', authUser.profileId);
      }

      const { data } = await query;

      setLeaves(data?.map(l => ({
        ...l,
        profile: l.profiles as any,
        leave_type: l.leave_types as any,
      })) || []);

      const { data: types } = await supabase
        .from('leave_types')
        .select('id, name, default_days');

      setLeaveTypes(types || []);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: LeaveForm) => {
    if (!authUser) return;

    try {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const totalDays = differenceInDays(endDate, startDate) + 1;

      if (totalDays < 1) {
        toast({
          title: 'Invalid Dates',
          description: 'End date must be after start date',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('leaves')
        .insert({
          profile_id: authUser.profileId,
          leave_type_id: data.leave_type_id,
          start_date: data.start_date,
          end_date: data.end_date,
          total_days: totalDays,
          reason: data.reason || null,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Leave Applied',
        description: 'Your leave request has been submitted for approval',
      });

      setDialogOpen(false);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleApprove = async (leave: Leave) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({
          status: 'approved',
          approved_by: authUser?.profileId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', leave.id);

      if (error) throw error;

      toast({
        title: 'Leave Approved',
        description: 'The leave request has been approved',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (leave: Leave) => {
    try {
      const { error } = await supabase
        .from('leaves')
        .update({
          status: 'rejected',
          approved_by: authUser?.profileId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', leave.id);

      if (error) throw error;

      toast({
        title: 'Leave Rejected',
        description: 'The leave request has been rejected',
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredLeaves = leaves.filter(l =>
    `${l.profile?.first_name} ${l.profile?.last_name} ${l.leave_type?.name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const canApprove = isAdmin || isHR;
  const canShowOtherLeaves = viewMode === 'employees' || viewMode === 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            {isEmployee ? 'Apply and track your leaves' : 'Manage leave requests'}
          </p>
        </div>

        {/* Apply Leave button for HR and Employees */}
        {(isHR || isEmployee) && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="leave_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leave Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select leave type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {leaveTypes.map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="start_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="end_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reason (Optional)</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Apply</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {/* View mode dropdown for HR */}
            {isHR && (
              <Select value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="View mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="my">My Leaves</SelectItem>
                  <SelectItem value="employees">Employee Leaves</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Leave Type</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                {canApprove && canShowOtherLeaves && <TableHead>Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell className="font-medium">
                    {leave.profile?.first_name} {leave.profile?.last_name}
                  </TableCell>
                  <TableCell>{leave.leave_type?.name}</TableCell>
                  <TableCell>{format(new Date(leave.start_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{format(new Date(leave.end_date), 'MMM d, yyyy')}</TableCell>
                  <TableCell>{leave.total_days}</TableCell>
                  <TableCell>{getStatusBadge(leave.status)}</TableCell>
                  {canApprove && canShowOtherLeaves && (
                    <TableCell>
                      {leave.status === 'pending' && leave.profile_id !== authUser?.profileId && (
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-green-600"
                            onClick={() => handleApprove(leave)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleReject(leave)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {filteredLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={canApprove && canShowOtherLeaves ? 7 : 6} className="text-center text-muted-foreground">
                    No leave records found
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

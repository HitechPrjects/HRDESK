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
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

const trainingSchema = z.object({
  profile_id: z.string().min(1, 'Select a student/intern'),
  title: z.string().min(1, 'Title is required'),
  domain: z.string().optional(),
  trainer_name: z.string().optional(),
  trainer_organization: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  duration_hours: z.coerce.number().optional(),
  status: z.string().optional(),
});

type TrainingForm = z.infer<typeof trainingSchema>;

interface Training {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  title: string;
  domain: string | null;
  trainer_name: string | null;
  trainer_organization: string | null;
  start_date: string | null;
  end_date: string | null;
  duration_hours: number | null;
  status: string;
}

interface AdminTrainingProps {
  viewOnly?: boolean;
}

export default function AdminTraining({ viewOnly = false }: AdminTrainingProps) {
  const { authUser } = useAuth();
  const [training, setTraining] = useState<Training[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const isEmployee = authUser?.role === 'employee';

  const form = useForm<TrainingForm>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      profile_id: '',
      title: '',
      domain: '',
      trainer_name: '',
      trainer_organization: '',
      start_date: '',
      end_date: '',
      duration_hours: 0,
      status: 'scheduled',
    },
  });

  useEffect(() => {
    fetchData();
  }, [authUser]);

  const fetchData = async () => {
    if (!authUser) return;
    
    try {
      let query = supabase
        .from('training')
        .select(`
          id, title, domain, trainer_name, trainer_organization, start_date, end_date, duration_hours, status,
          profiles:profile_id(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // For employees, only show their own training
      if (isEmployee) {
        query = query.eq('profile_id', authUser.profileId);
      }

      const { data: trainingData } = await query;

      setTraining(trainingData?.map(t => ({
        ...t,
        profile: t.profiles as any,
      })) || []);

      if (!isEmployee) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('employment_status', 'active');

        setEmployees(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching training:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TrainingForm) => {
    try {
      const { error } = await supabase
        .from('training')
        .insert([{
          profile_id: data.profile_id,
          title: data.title,
          domain: data.domain || null,
          trainer_name: data.trainer_name || null,
          trainer_organization: data.trainer_organization || null,
          start_date: data.start_date || null,
          end_date: data.end_date || null,
          duration_hours: data.duration_hours || null,
          status: (data.status || 'scheduled') as any,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Training record created',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'scheduled':
        return <Badge variant="secondary">Scheduled</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredTraining = training.filter(t =>
    `${t.profile?.first_name} ${t.profile?.last_name} ${t.title} ${t.domain}`
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Training Records</h1>
          <p className="text-muted-foreground">
            {isEmployee ? 'View your training records' : 'Manage employee training'}
          </p>
        </div>

        {!isEmployee && !viewOnly && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Training
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Training Record</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="profile_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student/Intern Name</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select student/intern" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {employees.map(emp => (
                              <SelectItem key={emp.id} value={emp.id}>
                                {emp.first_name} {emp.last_name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Training Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="domain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domain</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainer_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trainer Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="trainer_organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Trainer Organization</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
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
                    name="duration_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (Hours)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="scheduled">Scheduled</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Create</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Student/Intern</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTraining.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium">
                    {t.profile?.first_name} {t.profile?.last_name}
                  </TableCell>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.domain || '-'}</TableCell>
                  <TableCell>
                    {t.trainer_name || '-'}
                    {t.trainer_organization && <span className="text-muted-foreground text-sm block">({t.trainer_organization})</span>}
                  </TableCell>
                  <TableCell>
                    {t.start_date ? format(new Date(t.start_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {t.end_date ? format(new Date(t.end_date), 'MMM d, yyyy') : '-'}
                  </TableCell>
                  <TableCell>
                    {t.duration_hours ? `${t.duration_hours} hrs` : '-'}
                  </TableCell>
                  <TableCell>{getStatusBadge(t.status)}</TableCell>
                </TableRow>
              ))}
              {filteredTraining.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    No training records found
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

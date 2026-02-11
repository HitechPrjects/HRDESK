import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';

/* ================= SCHEMA ================= */

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  domain: z.string().min(1, 'Domain is required'),
  from_date: z.string().min(1, 'From date required'),
  to_date: z.string().min(1, 'To date required'),
  time_from: z.string().min(1, 'Start time required'),
  time_to: z.string().min(1, 'End time required'),
  status: z.enum(['ongoing', 'completed', 'discontinue']).default('ongoing'),
});

type FormValues = z.infer<typeof schema>;

/* ================= TYPES ================= */

interface OngoingTrainingType {
  id: string;
  name: string;
  domain: string;
  from_date: string;
  to_date: string;
  time_from: string;
  time_to: string;
  status: 'ongoing' | 'completed' | 'discontinue';
}

/* ================= COMPONENT ================= */

export default function OngoingTraining() {
  const { authUser } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<OngoingTrainingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<OngoingTrainingType | null>(null);
  const [statusFilter, setStatusFilter] =
  useState<'ongoing' | 'completed' | 'discontinue'>('ongoing');


  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      domain: '',
      from_date: '',
      to_date: '',
      time_from: '',
      time_to: '',
      status: 'ongoing',
    },
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    if (!authUser) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('ongoing_training')
      .select('*')
      .eq('profile_id', authUser.profileId)
      .eq('status', statusFilter)
      .order('from_date', { ascending: false });;

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setData(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [authUser, statusFilter]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: FormValues) => {
    if (editItem) {
      const { error } = await supabase
        .from('ongoing_training')
        .update({
          name: values.name,
          domain: values.domain,
          from_date: new Date(values.from_date).toISOString(),
          to_date: new Date(values.to_date).toISOString(),

          time_from: values.time_from,
          time_to: values.time_to,
          status: values.status,
        })
        .eq('id', editItem.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Updated', description: 'Training updated successfully' });
    } else {
      const { error } = await supabase.from('ongoing_training').insert([
        {
          profile_id: authUser?.profileId,
          name: values.name,
          domain: values.domain,
          from_date: values.from_date,
          to_date: values.to_date,
          time_from: values.time_from,
          time_to: values.time_to,
          status: values.status,
        },
      ]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
        return;
      }

      toast({ title: 'Success', description: 'Ongoing training added' });
    }

    setEditItem(null);
    form.reset();
    setDialogOpen(false);
    fetchData();
  };

  /* ================= STATUS BADGE ================= */

  const getBadge = (status: OngoingTrainingType['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'ongoing':
        return <Badge className="bg-blue-100 text-blue-800">Ongoing</Badge>;
      case 'discontinue':
        return <Badge variant="outline">Discontinue</Badge>;
    }
  };

  /* ================= FILTER ================= */

  const filtered = data.filter((d) =>
    `${d.name} ${d.domain} ${d.status}`.toLowerCase().includes(search.toLowerCase())
  );

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6 mt-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ongoing Training</h1>

        <div className="flex gap-2">
          <Select
            value={statusFilter}
            onValueChange={(v) =>
              setStatusFilter(v as 'ongoing' | 'completed' | 'discontinue')
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="discontinue">Discontinue</SelectItem>
            </SelectContent>
          </Select>


          <Dialog
            open={dialogOpen}
            onOpenChange={(open) => {
              setDialogOpen(open);
              if (!open) setEditItem(null);
            }}
          >
            <Button
              onClick={() => {
                setEditItem(null);          

                form.reset({              
                  name: '',
                  domain: '',
                  from_date: '',
                  to_date: '',
                  time_from: '',
                  time_to: '',
                  status: 'ongoing',
                });

                setDialogOpen(true);       
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Ongoing
            </Button>


            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editItem ? 'Edit Ongoing Training' : 'Add Ongoing Training'}
                </DialogTitle>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
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

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="from_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="to_date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="time_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time_to"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Time</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                            <SelectItem value="ongoing">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="discontinue">Discontinue</SelectItem>
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
                    <Button type="submit">Submit</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
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
                <TableHead>Name</TableHead>
                <TableHead>From Date</TableHead>
                <TableHead>To Date</TableHead>
                <TableHead>Timing</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{format(new Date(d.from_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{format(new Date(d.to_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {format(new Date(`1970-01-01T${d.time_from}`), 'hh:mm a')} -{' '}
                    {format(new Date(`1970-01-01T${d.time_to}`), 'hh:mm a')}
                  </TableCell>

                  <TableCell>{d.domain}</TableCell>
                  <TableCell>{getBadge(d.status)}</TableCell>
                  <TableCell>
                    {d.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditItem(d);
                          form.reset({
                            ...d,
                            from_date: d.from_date.split("T")[0],
                            to_date: d.to_date.split("T")[0],
                          });

                          setDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No records found
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

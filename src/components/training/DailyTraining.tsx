import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
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
  description: z.string().min(1, 'Description is required'),
  time_from: z.string().min(1, 'Start time required'),
  time_to: z.string().min(1, 'End time required'),
});

type FormValues = z.infer<typeof schema>;

/* ================= TYPES ================= */

interface DailyTraining {
  id: string;
  name: string;
  domain: string;
  description: string;
  date: string;
  time_from: string;
  time_to: string;
}

/* ================= COMPONENT ================= */

export default function DailyTraining() {
  const { authUser } = useAuth();
  const { toast } = useToast();

  const [data, setData] = useState<DailyTraining[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fromDate, setFromDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));



  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      domain: '',
      description: '',
      time_from: '',
      time_to: '',
    },
  });

  /* ================= FETCH ================= */

  const fetchData = async () => {
    if (!authUser) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('daily_training')
      .select('*')
      .eq('profile_id', authUser.profileId)
      .gte('date', new Date(fromDate).toISOString())
      .lte('date', new Date(toDate).toISOString())
      .order('date', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setData(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [authUser, fromDate,toDate]);

  /* ================= SUBMIT ================= */

  const onSubmit = async (values: FormValues) => {
    const today = new Date();

    const { error } = await supabase.from('daily_training').insert([
      {
        profile_id: authUser?.profileId,
        name: values.name,
        domain: values.domain,
        description: values.description,
        date: today.toISOString(),
        time_from: values.time_from,
        time_to: values.time_to,
      },
    ]);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Success', description: 'Daily training added' });

    form.reset();
    setDialogOpen(false);
    fetchData();
  };

  /* ================= FILTER ================= */

  const filtered = data.filter((d) =>
    `${d.name} ${d.domain} ${d.description}`.toLowerCase().includes(search.toLowerCase())
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
        <h1 className="text-3xl font-bold">Daily Training</h1>

        <div className="flex gap-2">
          <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />


          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button
              onClick={() => {
                form.reset({
                  name: '',
                  domain: '',
                  description: '',
                  time_from: '',
                  time_to: '',
                });

                setDialogOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" /> Add Training
            </Button>



            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Daily Training</DialogTitle>
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

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
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
                      name="time_from"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From</FormLabel>
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
                          <FormLabel>To</FormLabel>
                          <FormControl>
                            <Input type="time" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

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
                <TableHead>S.No</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Timing</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((d, i) => (
                <TableRow key={d.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell>{d.domain}</TableCell>
                  <TableCell>{d.description}</TableCell>
                  <TableCell>{format(new Date(d.date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>
                    {format(new Date(`1970-01-01T${d.time_from}`), 'hh:mm a')} -{' '}
                    {format(new Date(`1970-01-01T${d.time_to}`), 'hh:mm a')}
                  </TableCell>

                </TableRow>
              ))}

              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
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
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
import { Plus, FileText, Search } from 'lucide-react';
import { format } from 'date-fns';

const payrollSchema = z.object({
  profile_id: z.string().min(1, 'Select an employee'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000).max(2100),
  basic_salary: z.coerce.number().min(0),
  hra: z.coerce.number().min(0),
  da: z.coerce.number().min(0),
  conveyance_allowance: z.coerce.number().min(0),
  medical_allowance: z.coerce.number().min(0),
  special_allowance: z.coerce.number().min(0),
  pf: z.coerce.number().min(0),
  esi: z.coerce.number().min(0),
  professional_tax: z.coerce.number().min(0),
  tds: z.coerce.number().min(0),
});

type PayrollForm = z.infer<typeof payrollSchema>;

interface Payroll {
  id: string;
  profile: {
    first_name: string;
    last_name: string;
  };
  month: number;
  year: number;
  basic_salary: number;
  gross_earnings: number;
  total_deductions: number;
  net_salary: number;
  payment_status: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function AdminPayroll() {
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<PayrollForm>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      profile_id: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      basic_salary: 0,
      hra: 0,
      da: 0,
      conveyance_allowance: 0,
      medical_allowance: 0,
      special_allowance: 0,
      pf: 0,
      esi: 0,
      professional_tax: 0,
      tds: 0,
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: payrollData } = await supabase
        .from('payroll')
        .select(`
          id, month, year, basic_salary, gross_earnings, total_deductions, net_salary, payment_status,
          profiles:profile_id(first_name, last_name)
        `)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      setPayrolls(payrollData?.map(p => ({
        ...p,
        profile: p.profiles as any,
      })) || []);

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .eq('employment_status', 'active');

      setEmployees(profiles || []);
    } catch (error) {
      console.error('Error fetching payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: PayrollForm) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .insert([{
          profile_id: data.profile_id,
          month: data.month,
          year: data.year,
          basic_salary: data.basic_salary,
          hra: data.hra,
          da: data.da,
          conveyance_allowance: data.conveyance_allowance,
          medical_allowance: data.medical_allowance,
          special_allowance: data.special_allowance,
          pf: data.pf,
          esi: data.esi,
          professional_tax: data.professional_tax,
          tds: data.tds,
        }]);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Payroll created successfully',
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
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayrolls = payrolls.filter(p =>
    `${p.profile?.first_name} ${p.profile?.last_name}`
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
          <h1 className="text-3xl font-bold">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employee salaries</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Payroll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Payroll</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="profile_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employee" />
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

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="month"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Month</FormLabel>
                        <Select onValueChange={(v) => field.onChange(parseInt(v))} defaultValue={field.value.toString()}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {months.map((month, i) => (
                              <SelectItem key={i} value={(i + 1).toString()}>{month}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Year</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Earnings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="basic_salary" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Salary</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="hra" render={({ field }) => (
                      <FormItem>
                        <FormLabel>HRA</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="da" render={({ field }) => (
                      <FormItem>
                        <FormLabel>DA</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="conveyance_allowance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Conveyance</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="medical_allowance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Medical</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="special_allowance" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Allowance</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-4">Deductions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="pf" render={({ field }) => (
                      <FormItem>
                        <FormLabel>PF</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="esi" render={({ field }) => (
                      <FormItem>
                        <FormLabel>ESI</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="professional_tax" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Tax</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="tds" render={({ field }) => (
                      <FormItem>
                        <FormLabel>TDS</FormLabel>
                        <FormControl><Input type="number" {...field} /></FormControl>
                      </FormItem>
                    )} />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Payroll</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <TableHead>Period</TableHead>
                <TableHead>Gross</TableHead>
                <TableHead>Deductions</TableHead>
                <TableHead>Net Salary</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell className="font-medium">
                    {payroll.profile?.first_name} {payroll.profile?.last_name}
                  </TableCell>
                  <TableCell>{months[payroll.month - 1]} {payroll.year}</TableCell>
                  <TableCell>₹{payroll.gross_earnings?.toLocaleString()}</TableCell>
                  <TableCell>₹{payroll.total_deductions?.toLocaleString()}</TableCell>
                  <TableCell className="font-medium">₹{payroll.net_salary?.toLocaleString()}</TableCell>
                  <TableCell>{getStatusBadge(payroll.payment_status)}</TableCell>
                </TableRow>
              ))}
              {filteredPayrolls.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No payroll records found
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
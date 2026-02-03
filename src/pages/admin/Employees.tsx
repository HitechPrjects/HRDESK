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
import { Plus, Pencil, Trash2, UserX, Search, Eye, EyeOff } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { createTableUser, updatePassword } from '@/lib/tableAuth';

const employeeSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  role: z.enum(['hr', 'employee']),
  department_id: z.string().optional(),
  designation_id: z.string().optional(),
  date_of_birth: z.string().optional(),
  joining_date: z.string().optional(),
  employee_id: z.string().min(1, 'Employee ID is required'),
  reporting_manager: z.string().optional(),
});

type EmployeeForm = z.infer<typeof employeeSchema>;

interface Employee {
  id: string;
  user_id: string;
  employee_id: string | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  employment_status: string;
  department_id: string | null;
  designation_id: string | null;
  date_of_birth: string | null;
  joining_date: string | null;
  department: { name: string } | null;
  designation: { name: string } | null;
  role: string;
  reporting_manager: string | null;
}

interface AdminEmployeesProps {
  hideAdmin?: boolean;
}

export default function AdminEmployees({ hideAdmin = false }: AdminEmployeesProps) {
  const { authUser } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const isHR = authUser?.role === 'hr';

  // Generate next employee ID in format "HTE-XXX"
  const generateNextEmployeeId = (): string => {
    const prefix = 'HTE';
    const existingIds = employees
      .map(e => e.employee_id)
      .filter((id): id is string => !!id && id.startsWith(prefix + '-'))
      .map(id => {
        const numPart = id.split('-')[1];
        return parseInt(numPart, 10);
      })
      .filter(n => !isNaN(n));
    
    const maxNum = existingIds.length > 0 ? Math.max(...existingIds) : 0;
    const nextNum = maxNum + 1;
    return `${prefix}-${String(nextNum).padStart(3, '0')}`;
  };

  const form = useForm<EmployeeForm>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'employee',
      department_id: '',
      designation_id: '',
      date_of_birth: '',
      joining_date: '',
      employee_id: '',
      reporting_manager: '',
    },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          id, user_id, employee_id, first_name, last_name, email, phone, employment_status,
          department_id, designation_id, date_of_birth, joining_date, reporting_manager,
          departments:department_id(name),
          designations:designation_id(name)
        `)
        .order('created_at', { ascending: false });

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const employeesWithRoles = profiles?.map(p => ({
        ...p,
        department: p.departments,
        designation: p.designations,
        role: roles?.find(r => r.user_id === p.user_id)?.role || 'employee',
      })) || [];

      // Filter out admins (and for HR view, also filter self)
      let filtered = employeesWithRoles.filter(e => e.role !== 'admin');
      
      if (hideAdmin && isHR) {
        // HR should only see HR and employees, not admin
        filtered = filtered.filter(e => e.role !== 'admin');
      }

      setEmployees(filtered);

      const { data: depts } = await supabase.from('departments').select('*');
      setDepartments(depts || []);

      const { data: desigs } = await supabase.from('designations').select('*');
      setDesignations(desigs || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmployeeForm) => {
    setSubmitting(true);
    try {
      if (editingEmployee) {
        // Update existing employee
        const updateData: any = {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone || null,
          department_id: data.department_id || null,
          designation_id: data.designation_id || null,
          date_of_birth: data.date_of_birth || null,
          joining_date: data.joining_date || null,
          employee_id: data.employee_id || null,
          reporting_manager: data.reporting_manager || null,
        };

        const { error } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', editingEmployee.id);

        if (error) {
          console.error('Update error:', error);
          toast({
            title: 'Error',
            description: error.message || 'Failed to update employee',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        // If password provided, update it
        if (data.password) {
          const passwordResult = await updatePassword(editingEmployee.id, data.password);
          if (!passwordResult.success) {
            toast({
              title: 'Warning',
              description: 'Employee updated but password change failed',
              variant: 'destructive',
            });
          }
        }

        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        // Create new employee using table-based auth
        if (!data.password) {
          toast({
            title: 'Error',
            description: 'Password is required for new employees',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        const result = await createTableUser(
          data.email,
          data.password,
          data.first_name,
          data.last_name,
          data.role,
          {
            phone: data.phone,
            department_id: data.department_id,
            designation_id: data.designation_id,
            date_of_birth: data.date_of_birth,
            joining_date: data.joining_date,
            employee_id: data.employee_id,
            reporting_manager: data.reporting_manager,
          }
        );

        if (!result.success) {
          form.setError('email', { type: 'manual', message: result.error || 'Failed to create user' });
          toast({
            title: 'Error',
            description: result.error || 'Failed to create employee',
            variant: 'destructive',
          });
          setSubmitting(false);
          return;
        }

        toast({
          title: 'Success',
          description: `${data.role === 'hr' ? 'HR' : 'Employee'} created successfully`,
        });
      }

      setDialogOpen(false);
      setEditingEmployee(null);
      form.reset();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to save employee',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    form.reset({
      email: employee.email,
      password: '',
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone || '',
      role: employee.role as 'hr' | 'employee',
      department_id: employee.department_id || '',
      designation_id: employee.designation_id || '',
      date_of_birth: employee.date_of_birth || '',
      joining_date: employee.joining_date || '',
      employee_id: employee.employee_id || '',
      reporting_manager: (employee as any).reporting_manager || '',
    });
    setDialogOpen(true);
  };

  const handleFire = async (employee: Employee) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ employment_status: 'fired' })
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'Employee Fired',
        description: `${employee.first_name} ${employee.last_name} has been marked as fired`,
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

  const handleDelete = async (employee: Employee) => {
    try {
      // First delete user role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', employee.user_id);

      // Delete sessions
      await supabase
        .from('user_sessions')
        .delete()
        .eq('profile_id', employee.id);

      // Then delete profile
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;

      toast({
        title: 'Employee Deleted',
        description: `${employee.first_name} ${employee.last_name} has been permanently deleted`,
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

  const filteredEmployees = employees.filter(e =>
    `${e.first_name} ${e.last_name} ${e.email}`.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'fired':
        return <Badge variant="destructive">Fired</Badge>;
      case 'resigned':
        return <Badge variant="secondary">Resigned</Badge>;
      case 'on_leave':
        return <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingEmployee(null);
      form.reset();
    }
    setDialogOpen(open);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Employees</h1>
          <p className="text-muted-foreground">Manage all employees and HR personnel</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingEmployee(null);
              // Auto-generate employee ID for new employees
              form.reset({
                email: '',
                password: '',
                first_name: '',
                last_name: '',
                phone: '',
                role: 'employee',
                department_id: '',
                designation_id: '',
                date_of_birth: '',
                joining_date: '',
                employee_id: generateNextEmployeeId(),
                reporting_manager: '',
              });
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={!!editingEmployee} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{editingEmployee ? 'New Password (leave blank to keep current)' : 'Password'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? 'text' : 'password'}
                            {...field}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="employee_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employee ID</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!editingEmployee}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="department_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {departments.map(dept => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.name}
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
                  name="designation_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Designation</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select designation" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {designations.map(desig => (
                            <SelectItem key={desig.id} value={desig.id}>
                              {desig.name}
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
                  name="reporting_manager"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reporting Manager</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employees
                            .filter(e => e.id !== editingEmployee?.id)
                            .map(emp => (
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
                    name="date_of_birth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="joining_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Joining Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? 'Saving...' : (editingEmployee ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No employees found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.employee_id || '-'}</TableCell>
                    <TableCell>{employee.first_name} {employee.last_name}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>
                      <Badge variant={employee.role === 'hr' ? 'default' : 'secondary'}>
                        {employee.role.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{employee.department?.name || '-'}</TableCell>
                    <TableCell>{employee.designation?.name || '-'}</TableCell>
                    <TableCell>{getStatusBadge(employee.employment_status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(employee)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {employee.employment_status === 'active' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <UserX className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Fire Employee?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will mark {employee.first_name} {employee.last_name} as fired.
                                  They will no longer be able to access the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleFire(employee)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Fire
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        {!isHR && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Employee?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently delete {employee.first_name} {employee.last_name} and all their data.
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(employee)}
                                  className="bg-destructive text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

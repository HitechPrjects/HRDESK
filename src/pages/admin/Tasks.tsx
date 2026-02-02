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
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigned_to: z.string().min(1, 'Please select an employee'),
  priority: z.string().optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  progress: number;
  assigned_to: string;
  assigned_profile: {
    first_name: string;
    last_name: string;
  } | null;
  created_at: string;
}

interface AdminTasksProps {
  canAssign?: boolean;
  viewMode?: 'all' | 'my' | 'employees';
}

export default function AdminTasks({ canAssign = true, viewMode: initialViewMode }: AdminTasksProps) {
  const { authUser } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'employees'>(initialViewMode || 'all');
  const [reasonDialogOpen, setReasonDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [notCompletedReason, setNotCompletedReason] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const { toast } = useToast();

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      assigned_to: '',
      priority: 'medium',
    },
  });

  useEffect(() => {
    fetchData();
  }, [viewMode, authUser]);

  const fetchData = async () => {
    if (!authUser) return;
    
    try {
      let query = supabase
        .from('tasks')
        .select(`
          id, title, description, status, priority, progress, assigned_to, created_at,
          assigned_profile:assigned_to(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      // For employees or "my" view, show only own tasks
      if (isEmployee || viewMode === 'my') {
        query = query.eq('assigned_to', authUser.profileId);
      }

      const { data: tasksData } = await query;

      setTasks(tasksData?.map(t => ({
        ...t,
        assigned_profile: t.assigned_profile as any,
      })) || []);

      if (!isEmployee) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email')
          .eq('employment_status', 'active');

        setEmployees(profiles || []);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: TaskForm) => {
    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: data.title,
            description: data.description || null,
            assigned_to: data.assigned_to,
            priority: data.priority || 'medium',
          })
          .eq('id', editingTask.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Task updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            title: data.title,
            description: data.description || null,
            assigned_to: data.assigned_to,
            priority: data.priority || 'medium',
            assigned_by: authUser?.profileId,
          });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Task created successfully',
        });
      }

      setDialogOpen(false);
      setEditingTask(null);
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

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    form.reset({
      title: task.title,
      description: task.description || '',
      assigned_to: task.assigned_to,
      priority: task.priority,
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!taskToDelete) return;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskToDelete.id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Task deleted successfully',
      });

      setDeleteDialogOpen(false);
      setTaskToDelete(null);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const updateTaskStatus = async (task: Task, newStatus: string) => {
    if (newStatus === 'not_completed') {
      setSelectedTask(task);
      setReasonDialogOpen(true);
      return;
    }

    try {
      const updates: any = { status: newStatus };
      if (newStatus === 'completed') {
        updates.progress = 100;
        updates.completed_at = new Date().toISOString();
      } else if (newStatus === 'in_progress') {
        updates.progress = 50;
      }

      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', task.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Task marked as ${newStatus.replace('_', ' ')}`,
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

  const submitNotCompleted = async () => {
    if (!selectedTask || !notCompletedReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a reason for not completing the task',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          status: 'cancelled',
          description: `${selectedTask.description || ''}\n\n[NOT COMPLETED REASON]: ${notCompletedReason}`,
        })
        .eq('id', selectedTask.id);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: 'Task marked as not completed',
      });

      setReasonDialogOpen(false);
      setNotCompletedReason('');
      setSelectedTask(null);
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
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Not Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="secondary">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const filteredTasks = tasks.filter(t =>
    `${t.title} ${t.assigned_profile?.first_name} ${t.assigned_profile?.last_name}`
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
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {isEmployee ? 'View and update your tasks' : 'Manage and assign tasks'}
          </p>
        </div>

        {canAssign && !isEmployee && (
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingTask(null);
              form.reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Assign New Task'}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
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
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="assigned_to"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Assign To</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setDialogOpen(false);
                      setEditingTask(null);
                      form.reset();
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">{editingTask ? 'Update' : 'Create'} Task</Button>
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
                  <SelectItem value="my">My Tasks</SelectItem>
                  <SelectItem value="employees">Employee Tasks</SelectItem>
                </SelectContent>
              </Select>
            )}

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
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
                <TableHead>Title</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    {task.assigned_profile
                      ? `${task.assigned_profile.first_name} ${task.assigned_profile.last_name}`
                      : '-'}
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>{task.progress}%</TableCell>
                  <TableCell>{format(new Date(task.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {(isEmployee || viewMode === 'my' || task.assigned_to === authUser?.profileId) && task.status !== 'completed' && task.status !== 'cancelled' && (
                        <Select
                          value={task.status}
                          onValueChange={(value) => updateTaskStatus(task, value)}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">Ongoing</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="not_completed">Not Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {!isEmployee && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(task)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setTaskToDelete(task);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTasks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No tasks found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={reasonDialogOpen} onOpenChange={setReasonDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reason for Not Completing</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason why this task could not be completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={notCompletedReason}
            onChange={(e) => setNotCompletedReason(e.target.value)}
            placeholder="Enter reason..."
            className="min-h-[100px]"
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setNotCompletedReason('');
              setSelectedTask(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={submitNotCompleted}>
              Submit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setTaskToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

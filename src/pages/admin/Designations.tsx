import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const designationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  level: z.coerce.number().min(1).optional(),
});

type DesignationForm = z.infer<typeof designationSchema>;

interface Designation {
  id: string;
  name: string;
  description: string | null;
  level: number;
  created_at: string;
}

export default function AdminDesignations() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDesignation, setEditingDesignation] = useState<Designation | null>(null);
  const { toast } = useToast();

  const form = useForm<DesignationForm>({
    resolver: zodResolver(designationSchema),
    defaultValues: {
      name: '',
      description: '',
      level: 1,
    },
  });

  useEffect(() => {
    fetchDesignations();
  }, []);

  const fetchDesignations = async () => {
    try {
      const { data, error } = await supabase
        .from('designations')
        .select('*')
        .order('level');

      if (error) throw error;
      setDesignations(data || []);
    } catch (error) {
      console.error('Error fetching designations:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: DesignationForm) => {
    try {
      if (editingDesignation) {
        const { error } = await supabase
          .from('designations')
          .update({ name: data.name, description: data.description || null, level: data.level || 1 })
          .eq('id', editingDesignation.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Designation updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('designations')
          .insert({ name: data.name, description: data.description || null, level: data.level || 1 });

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Designation created successfully',
        });
      }

      setDialogOpen(false);
      setEditingDesignation(null);
      form.reset();
      fetchDesignations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEdit = (designation: Designation) => {
    setEditingDesignation(designation);
    form.reset({
      name: designation.name,
      description: designation.description || '',
      level: designation.level,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('designations')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Designation deleted successfully',
      });

      fetchDesignations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const openNewDialog = () => {
    setEditingDesignation(null);
    form.reset({ name: '', description: '', level: 1 });
    setDialogOpen(true);
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
          <h1 className="text-3xl font-bold">Designations</h1>
          <p className="text-muted-foreground">Manage employee designations</p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Designation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDesignation ? 'Edit Designation' : 'Add New Designation'}
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
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
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
                      <FormLabel>Description (Optional)</FormLabel>
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
                  <Button type="submit">
                    {editingDesignation ? 'Update' : 'Create'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designations.map((designation) => (
                <TableRow key={designation.id}>
                  <TableCell className="font-medium">{designation.name}</TableCell>
                  <TableCell>{designation.level}</TableCell>
                  <TableCell>{designation.description || '-'}</TableCell>
                  <TableCell>{format(new Date(designation.created_at), 'MMM d, yyyy')}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleEdit(designation)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Designation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the designation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(designation.id)} className="bg-destructive text-destructive-foreground">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {designations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No designations found
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
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw, Plus, FileDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
  CreateGoalsheetDialog,
  GoalsheetTable,
  ViewGoalsheetDialog,
  WeekEntryDialog,
  EditGoalsheetDialog,
  EnterPercentageDialog,
  Goalsheet,
  GoalItem,
  TargetType,
  Employee,
} from '@/components/goalsheets';

interface AdminGoalsheetsProps {
  viewMode?: 'all' | 'my';
}

export default function AdminGoalsheets({ viewMode: initialViewMode }: AdminGoalsheetsProps) {
  const { authUser } = useAuth();
  const { toast } = useToast();
  const [goalsheets, setGoalsheets] = useState<Goalsheet[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [targetTypes, setTargetTypes] = useState<TargetType[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'my'>(initialViewMode || 'all');
  
  // Filters
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [weekDialogOpen, setWeekDialogOpen] = useState(false);
  const [percentageDialogOpen, setPercentageDialogOpen] = useState(false);
  
  const [selectedGoalsheet, setSelectedGoalsheet] = useState<Goalsheet | null>(null);
  const [selectedGoalItems, setSelectedGoalItems] = useState<GoalItem[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number>(1);

  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  

  const fetchData = async () => {
    if (!authUser) return;

    try {
      setLoading(true);

      // Fetch target types
      const { data: types } = await supabase
        .from('target_types')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      setTargetTypes((types as TargetType[]) || []);

      // Fetch goalsheets with profile and reporting manager
      let query = supabase
        .from('goalsheets')
        .select(`
          *,
          profiles:profile_id(id, first_name, last_name, employee_id),
          reporting_manager:reporting_manager_id(first_name, last_name),
          goal_items(*)
        `)
        .order('created_at', { ascending: false });

      if (viewMode === 'my') {
        if (isEmployee) {
          // Employee → own goalsheets
          query = query.eq('profile_id', authUser.profileId);
        } else if (isHR) {
          // HR / Manager → team goalsheets
          query = query.eq('reporting_manager_id', authUser.profileId);
        } else if (isAdmin) {
          // Admin → show ALL goalsheets (do nothing)
        }
      }



      if (fromDate) {
        query = query.gte('created_at', fromDate);
      }
      if (toDate) {
        query = query.lte('created_at', toDate + 'T23:59:59');
      }

      const { data } = await query;

      const formattedGoalsheets = data?.map((g: any) => ({
        ...g,
        profile: g.profiles,
        reporting_manager: g.reporting_manager,
        goal_items: g.goal_items,
      })) || [];

      setGoalsheets(formattedGoalsheets);

      // Fetch employees for Admin/HR
      if (!isEmployee) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, employee_id, email')
          .eq('employment_status', 'active');

        setEmployees((profiles as Employee[]) || []);
      }
    } catch (error) {
      console.error('Error fetching goalsheets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
      fetchData();
    }, []);

  const fetchGoalItems = async (goalsheetId: string) => {
    const { data } = await supabase
      .from('goal_items')
      .select('*')
      .eq('goalsheet_id', goalsheetId)
      .order('created_at');

    return (data as GoalItem[]) || [];
  };

  const handleView = async (goalsheet: Goalsheet) => {
    setSelectedGoalsheet(goalsheet);
    const items = await fetchGoalItems(goalsheet.id);
    setSelectedGoalItems(items);
    setViewDialogOpen(true);
  };

  const handleEdit = async (goalsheet: Goalsheet) => {
    setSelectedGoalsheet(goalsheet);
    const items = await fetchGoalItems(goalsheet.id);
    setSelectedGoalItems(items);
    setEditDialogOpen(true);
  };

  const handleWeekClick = async (goalsheet: Goalsheet, week: number) => {
    setSelectedGoalsheet(goalsheet);
    const items = await fetchGoalItems(goalsheet.id);
    setSelectedGoalItems(items);
    setSelectedWeek(week);
    setWeekDialogOpen(true);
  };

  const handleEnterPercentage = async (goalsheet: Goalsheet) => {
    setSelectedGoalsheet(goalsheet);
    const items = await fetchGoalItems(goalsheet.id);
    setSelectedGoalItems(items);
    setPercentageDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('goalsheets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Deleted',
        description: 'Goalsheet deleted successfully',
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

  const handleFilter = () => {
    fetchData();
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
          <h1 className="text-3xl font-bold">
            {viewMode === 'my'
              ? isHR
                ? 'My Team Goalsheets'
                : 'My Goalsheet Details'
              : 'Employee Goalsheet Details'}
          </h1>

        </div>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          {/* Admin/HR: Create button only */}
          {(isAdmin || isHR) && viewMode === 'all' && (
            <div className="flex items-end gap-4">
              <Button onClick={() => setCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="mr-2 h-4 w-4" />
                Create Goalsheet
              </Button>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-end gap-4 flex-wrap">
            <div className="space-y-2">
              <Label>From:</Label>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label>To:</Label>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button onClick={handleFilter} className="bg-blue-600 hover:bg-blue-700">
              Filter
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            {(isHR) && (
              <Button 
                variant={viewMode === 'my' ? 'default' : 'outline'}
                onClick={() => setViewMode(viewMode === 'my' ? 'all' : 'my')}
                className={viewMode === 'my' ? 'bg-blue-600 hover:bg-blue-700' : ''}
              >
                {viewMode === 'my' ? 'Back' : 'My Goalsheet Details'}
              </Button>
            )}
          </div>

          {/* Export buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="mr-1 h-4 w-4" />
              PDF
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <GoalsheetTable
            goalsheets={goalsheets}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onEnterPercentage={handleEnterPercentage}
            showWeekButtons={isEmployee || viewMode === 'my'}
            onWeekClick={handleWeekClick}
          />
        </CardContent>
      </Card>

      {/* Dialogs */}
    <CreateGoalsheetDialog
      open={createDialogOpen}
      onOpenChange={setCreateDialogOpen}
      employees={employees}
      targetTypes={targetTypes}
    />

    <ViewGoalsheetDialog
      open={viewDialogOpen}
      onOpenChange={setViewDialogOpen}
      goalsheet={selectedGoalsheet}
      goalItems={selectedGoalItems}
      targetTypes={targetTypes}
    />

    <EditGoalsheetDialog
      open={editDialogOpen}
      onOpenChange={setEditDialogOpen}
      goalsheet={selectedGoalsheet}
      goalItems={selectedGoalItems}
      targetTypes={targetTypes}
      onSuccess={fetchData}
    />

    <WeekEntryDialog
      open={weekDialogOpen}
      onOpenChange={setWeekDialogOpen}
      goalsheet={selectedGoalsheet}
      goalItems={selectedGoalItems}
      targetTypes={targetTypes}
      week={selectedWeek}
      onSuccess={fetchData}
    />

    <EnterPercentageDialog
      open={percentageDialogOpen}
      onOpenChange={setPercentageDialogOpen}
      goalsheet={selectedGoalsheet}
      goalItems={selectedGoalItems}
      targetTypes={targetTypes}
      onSuccess={fetchData}
    />

    </div>
  );
}

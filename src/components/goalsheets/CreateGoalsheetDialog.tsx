import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, TargetType } from './types';
import { format } from 'date-fns';

interface CreateGoalsheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  employees: Employee[];
  targetTypes: TargetType[];
}

export function CreateGoalsheetDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  employees,
  targetTypes
}: CreateGoalsheetDialogProps) {
  const { authUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [reportingManager, setReportingManager] = useState<string>('');
  
  // Goal items - target and goal pairs
  const [goalItems, setGoalItems] = useState<Array<{ targetTypeId: string; goal: string }>>([
    { targetTypeId: '', goal: '' },
    { targetTypeId: '', goal: '' },
    { targetTypeId: '', goal: '' },
    { targetTypeId: '', goal: '' },
    { targetTypeId: '', goal: '' },
    { targetTypeId: '', goal: '' },
  ]);

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return { value: year.toString(), label: year.toString() };
  });

  const selectedEmployeeData = employees.find(e => e.id === selectedEmployee);

  const updateGoalItem = (index: number, field: 'targetTypeId' | 'goal', value: string) => {
    setGoalItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !selectedMonth || !selectedYear) {
      toast({
        title: 'Error',
        description: 'Please select employee, month and year',
        variant: 'destructive',
      });
      return;
    }

    const validItems = goalItems.filter(item => item.targetTypeId && item.goal.trim());
    if (validItems.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one target with a goal',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const month = parseInt(selectedMonth);
      const year = parseInt(selectedYear);
      const periodStart = new Date(year, month - 1, 1);
      const periodEnd = new Date(year, month, 0);

      const monthName = months.find(m => m.value === selectedMonth)?.label;
      const title = `Goalsheet|${monthName} ${year}`;

      // Create goalsheet
      const { data: goalsheet, error: goalsheetError } = await supabase
        .from('goalsheets')
        .insert({
          profile_id: selectedEmployee,
          title,
          period_start: format(periodStart, 'yyyy-MM-dd'),
          period_end: format(periodEnd, 'yyyy-MM-dd'),
          month,
          year,
          status: 'not_started',
          created_by: authUser?.profileId,
          reporting_manager_id: authUser?.profileId,
        })
        .select()
        .single();

      if (goalsheetError) throw goalsheetError;

      // Create goal items
      const goalItemsToInsert = validItems.map(item => ({
        goalsheet_id: goalsheet.id,
        target_type_id: item.targetTypeId,
        title: item.goal,
        description: item.goal,
        status: 'not_started' as const,
        progress: 0,
      }));

      const { error: itemsError } = await supabase
        .from('goal_items')
        .insert(goalItemsToInsert);

      if (itemsError) throw itemsError;

      toast({
        title: 'Success',
        description: 'Goalsheet created successfully',
      });

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedMonth('');
    setReportingManager('');
    setGoalItems([
      { targetTypeId: '', goal: '' },
      { targetTypeId: '', goal: '' },
      { targetTypeId: '', goal: '' },
      { targetTypeId: '', goal: '' },
      { targetTypeId: '', goal: '' },
      { targetTypeId: '', goal: '' },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Select the target and fill in the goalsheet for each individual</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User Name*</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select User --" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input 
                value={selectedEmployeeData?.employee_id || ''} 
                disabled 
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Month*</Label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Month --" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Year*</Label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="-- Select Year --" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Reporting Manager</Label>
              <Input
                value={reportingManager}
                onChange={(e) => setReportingManager(e.target.value)}
                placeholder="Enter manager name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Targets:</Label>
              {goalItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-sm">{index + 1}:{index < 5 ? '*' : ''}</Label>
                  <Select 
                    value={item.targetTypeId} 
                    onValueChange={(v) => updateGoalItem(index, 'targetTypeId', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="-- Select Target --" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <Label className="text-base font-semibold">Goals:</Label>
              {goalItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-sm">{index + 1}:{index < 5 ? '*' : ''}</Label>
                  <Input
                    value={item.goal}
                    onChange={(e) => updateGoalItem(index, 'goal', e.target.value)}
                    placeholder=""
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating...' : 'Create Goalsheet'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

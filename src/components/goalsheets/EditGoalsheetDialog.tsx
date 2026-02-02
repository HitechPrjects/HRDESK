import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Goalsheet, GoalItem, TargetType } from './types';

interface EditGoalsheetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalsheet: Goalsheet | null;
  goalItems: GoalItem[];
  targetTypes: TargetType[];
  onSuccess: () => void;
}

export function EditGoalsheetDialog({ 
  open, 
  onOpenChange, 
  goalsheet,
  goalItems,
  targetTypes,
  onSuccess
}: EditGoalsheetDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [editedItems, setEditedItems] = useState<Array<{ id?: string; targetTypeId: string; goal: string }>>([]);

  useEffect(() => {
    if (open && goalItems.length > 0) {
      setEditedItems(goalItems.map(item => ({
        id: item.id,
        targetTypeId: item.target_type_id || '',
        goal: item.title || '',
      })));
    } else if (open) {
      setEditedItems([
        { targetTypeId: '', goal: '' },
        { targetTypeId: '', goal: '' },
        { targetTypeId: '', goal: '' },
        { targetTypeId: '', goal: '' },
        { targetTypeId: '', goal: '' },
        { targetTypeId: '', goal: '' },
      ]);
    }
  }, [open, goalItems]);

  if (!goalsheet) return null;

  const updateItem = (index: number, field: 'targetTypeId' | 'goal', value: string) => {
    setEditedItems(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addNewRow = () => {
    setEditedItems(prev => [...prev, { targetTypeId: '', goal: '' }]);
  };

  const handleSubmit = async () => {
    const validItems = editedItems.filter(item => item.targetTypeId && item.goal.trim());
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
      // Delete existing items that are no longer in the list
      const existingIds = goalItems.map(item => item.id);
      const keptIds = editedItems.filter(item => item.id).map(item => item.id!);
      const idsToDelete = existingIds.filter(id => !keptIds.includes(id));

      if (idsToDelete.length > 0) {
        await supabase.from('goal_items').delete().in('id', idsToDelete);
      }

      // Update existing items and insert new ones
      for (const item of validItems) {
        if (item.id) {
          // Update existing
          await supabase
            .from('goal_items')
            .update({
              target_type_id: item.targetTypeId,
              title: item.goal,
              description: item.goal,
            })
            .eq('id', item.id);
        } else {
          // Insert new
          await supabase
            .from('goal_items')
            .insert({
              goalsheet_id: goalsheet.id,
              target_type_id: item.targetTypeId,
              title: item.goal,
              description: item.goal,
              status: 'not_started' as const,
              progress: 0,
            });
        }
      }

      toast({
        title: 'Success',
        description: 'Goalsheet updated successfully',
      });

      onSuccess();
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Goalsheet</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Input 
                value={`${goalsheet.profile?.first_name} ${goalsheet.profile?.last_name}`} 
                disabled 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <Input 
                value={goalsheet.profile?.employee_id || '-'} 
                disabled 
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Targets:</Label>
              {editedItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-sm">{index + 1}:</Label>
                  <Select 
                    value={item.targetTypeId} 
                    onValueChange={(v) => updateItem(index, 'targetTypeId', v)}
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
              {editedItems.map((item, index) => (
                <div key={index} className="space-y-1">
                  <Label className="text-sm">{index + 1}:</Label>
                  <Input
                    value={item.goal}
                    onChange={(e) => updateItem(index, 'goal', e.target.value)}
                    placeholder=""
                  />
                </div>
              ))}
            </div>
          </div>

          <Button variant="outline" onClick={addNewRow} className="w-full">
            + Add Another Row
          </Button>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Goalsheet, GoalItem, TargetType } from './types';

interface EnterPercentageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalsheet: Goalsheet | null;
  goalItems: GoalItem[];
  targetTypes: TargetType[];
  onSuccess: () => void;
}

export function EnterPercentageDialog({ 
  open, 
  onOpenChange, 
  goalsheet,
  goalItems,
  targetTypes,
  onSuccess
}: EnterPercentageDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [percentages, setPercentages] = useState<Record<string, number>>({});

  useEffect(() => {
    if (open && goalItems.length > 0) {
      const initial: Record<string, number> = {};
      goalItems.forEach(item => {
        initial[item.id] = item.overall_percentage || 0;
      });
      setPercentages(initial);
    }
  }, [open, goalItems]);

  if (!goalsheet) return null;

  const getTargetName = (targetTypeId: string | null) => {
    if (!targetTypeId) return '-';
    const target = targetTypes.find(t => t.id === targetTypeId);
    return target?.name || '-';
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Update each goal item with the percentage
      for (const item of goalItems) {
        const { error } = await supabase
          .from('goal_items')
          .update({
            overall_percentage: percentages[item.id] || 0,
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      // Calculate and update overall progress
      const totalPercentage = Object.values(percentages).reduce((sum, val) => sum + val, 0);
      const avgPercentage = goalItems.length > 0 ? Math.round(totalPercentage / goalItems.length) : 0;

      await supabase
        .from('goalsheets')
        .update({ 
          overall_progress: avgPercentage,
          status: avgPercentage === 100 ? 'completed' : 'in_progress'
        })
        .eq('id', goalsheet.id);

      toast({
        title: 'Success',
        description: 'Percentages updated successfully',
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
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enter Percentage</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            {goalsheet.profile?.first_name} {goalsheet.profile?.last_name} - {goalsheet.title}
          </p>

          {goalItems.map((item) => (
            <div key={item.id} className="flex items-center gap-4 border-b pb-4">
              <div className="flex-1">
                <Label className="font-semibold">
                  {getTargetName(item.target_type_id)}
                </Label>
                <p className="text-sm text-muted-foreground">{item.title}</p>
              </div>
              <div className="w-24">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={percentages[item.id] || 0}
                  onChange={(e) => setPercentages(prev => ({ 
                    ...prev, 
                    [item.id]: Math.min(100, Math.max(0, parseInt(e.target.value) || 0))
                  }))}
                  className="text-center"
                />
              </div>
              <span className="text-sm">%</span>
            </div>
          ))}

          {goalItems.length === 0 && (
            <p className="text-center text-muted-foreground">No goal items found</p>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : 'Save Percentages'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

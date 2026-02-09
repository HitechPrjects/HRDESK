import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Goalsheet, GoalItem, TargetType } from './types';
import { useAuth } from '@/contexts/AuthContext';

interface WeekEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalsheet: Goalsheet | null;
  goalItems: GoalItem[];
  targetTypes: TargetType[];
  week: number;
  onSuccess: () => void;
}

export function WeekEntryDialog({
  open,
  onOpenChange,
  goalsheet,
  goalItems,
  targetTypes,
  week,
  onSuccess,
}: WeekEntryDialogProps) {
  const { toast } = useToast();
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 🔹 edit mode
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [outOfBoxEntries, setOutOfBoxEntries] = useState<Record<string, string>>({});

  const weekKey = `week${week}_value` as keyof GoalItem;
  const weekSubmittedKey = `week${week}_submitted` as keyof GoalItem;

  /** ---------------- ROLE CHECK ---------------- */
  const isAdmin = authUser?.role === 'admin';
  const isHR = authUser?.role === 'hr';
  const isEmployee = authUser?.role === 'employee';

  const canEditRole = isAdmin || isHR;

  /** ---------------- SUBMIT STATE ---------------- */
  const isSubmitted =
    goalItems.length > 0 && goalItems.every((item) => item[weekSubmittedKey]);

  /** ---------------- DISABLE INPUT ---------------- */
  const disableEditing = isEmployee || !isEditing;

  const isWeek4 = week === 4;

  /** ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (open && goalItems.length > 0) {
      const initialEntries: Record<string, string> = {};
      const initialOutOfBox: Record<string, string> = {};

      goalItems.forEach((item) => {
        initialEntries[item.id] = (item[weekKey] as string) || '';
        initialOutOfBox[item.id] = item.out_of_box || '';
      });

      setEntries(initialEntries);
      setOutOfBoxEntries(initialOutOfBox);
      setIsEditing(false); // reset edit mode when dialog opens
    }
  }, [open, goalItems, weekKey]);

  if (!goalsheet) return null;

  /** ---------------- HELPERS ---------------- */
  const getTargetName = (targetTypeId: string | null) => {
    if (!targetTypeId) return '-';
    const target = targetTypes.find((t) => t.id === targetTypeId);
    return target?.name || '-';
  };

  /** ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    setLoading(true);

    try {
      for (const item of goalItems) {
        const updateData: Record<string, any> = {
          [weekKey]: entries[item.id] || null,
          [weekSubmittedKey]: true,
        };

        if (isWeek4) {
          updateData.out_of_box = outOfBoxEntries[item.id] || null;
        }

        const { error } = await supabase
          .from('goal_items')
          .update(updateData)
          .eq('id', item.id);

        if (error) throw error;
      }

      await supabase
        .from('goalsheets')
        .update({ status: 'in_progress' })
        .eq('id', goalsheet.id);

      toast({
        title: 'Success',
        description: `Week ${week} entries updated successfully`,
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

  /** ---------------- UI ---------------- */
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Week {week} - Update Goals</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-sm text-muted-foreground">
            {goalsheet.profile?.first_name} {goalsheet.profile?.last_name} -{' '}
            {goalsheet.title}
          </p>

          {goalItems.map((item) => (
            <div key={item.id} className="space-y-2 border-b pb-4">
              <Label className="font-semibold">
                {getTargetName(item.target_type_id)}
              </Label>

              <p className="text-sm text-muted-foreground">{item.title}</p>

              <Textarea
                value={entries[item.id] || ''}
                onChange={(e) =>
                  setEntries((prev) => ({
                    ...prev,
                    [item.id]: e.target.value,
                  }))
                }
                rows={3}
                disabled={disableEditing}
              />

              {isWeek4 && (
                <div className="mt-3">
                  <Label className="font-semibold text-purple-700">
                    Out of Box
                  </Label>

                  <Textarea
                    value={outOfBoxEntries[item.id] || ''}
                    onChange={(e) =>
                      setOutOfBoxEntries((prev) => ({
                        ...prev,
                        [item.id]: e.target.value,
                      }))
                    }
                    rows={2}
                    disabled={disableEditing}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          ))}

          {goalItems.length === 0 && (
            <p className="text-center text-muted-foreground">
              No goal items found
            </p>
          )}

          {/* ---------------- BUTTONS ---------------- */}
          <div className="flex justify-end gap-2 items-center">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            {/* EMPLOYEE → only Already Submitted text */}
            {isEmployee && isSubmitted && (
              <p className="text-sm text-green-600">✓ Already submitted</p>
            )}

            {/* ADMIN / HR VIEW MODE */}
            {canEditRole && isSubmitted && !isEditing && (
              <>
                <p className="text-sm text-green-600">✓ Already submitted</p>
                <Button onClick={() => setIsEditing(true)}>Edit</Button>
              </>
            )}

            {/* ADMIN / HR EDIT MODE */}
            {canEditRole && isEditing && (
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

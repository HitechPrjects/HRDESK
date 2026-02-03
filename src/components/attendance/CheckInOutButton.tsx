import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { LogIn, LogOut, Clock } from 'lucide-react';

interface TimesheetEntry {
  from_time: string;
  to_time: string;
  description: string;
}

export function CheckInOutButton() {
  const { authUser } = useAuth();
  const { toast } = useToast();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [attendanceId, setAttendanceId] = useState<string | null>(null);
  const [showTimesheetDialog, setShowTimesheetDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<TimesheetEntry[]>(
    Array(10).fill({ from_time: '', to_time: '', description: '' })
  );

  useEffect(() => {
    checkTodayAttendance();
  }, [authUser]);

  const checkTodayAttendance = async () => {
    if (!authUser?.profileId) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const { data } = await supabase
      .from('attendance')
      .select('id, check_in_time, check_out_time')
      .eq('profile_id', authUser.profileId)
      .eq('attendance_date', today)
      .single();

    if (data) {
      setAttendanceId(data.id);
      if (data.check_in_time && !data.check_out_time) {
        setIsCheckedIn(true);
        setCheckInTime(data.check_in_time);
      } else if (data.check_out_time) {
        setIsCheckedIn(false);
        setCheckInTime(null);
      }
    }
  };

  const getIpAddress = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return null;
    }
  };

  const handleCheckIn = async () => {
    if (!authUser?.profileId) return;
    setLoading(true);

    try {
      const ip = await getIpAddress();
      const now = new Date().toISOString();
      const today = format(new Date(), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('attendance')
        .insert({
          profile_id: authUser.profileId,
          attendance_date: today,
          check_in_time: now,
          check_in_ip: ip,
          status: 'present',
        })
        .select()
        .single();

      if (error) throw error;

      setAttendanceId(data.id);
      setIsCheckedIn(true);
      setCheckInTime(now);

      toast({
        title: 'Checked In',
        description: `Checked in at ${format(new Date(), 'hh:mm:ss a')}`,
      });
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

  const handleCheckOutClick = () => {
    setShowTimesheetDialog(true);
  };

  const updateEntry = (index: number, field: keyof TimesheetEntry, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], [field]: value };
    setEntries(newEntries);
  };

  const validateTimesheet = () => {
    // Check if at least one entry has both from_time and to_time filled
    const filledEntries = entries.filter(e => e.from_time && e.to_time);
    return filledEntries.length > 0;
  };

  const handleCheckOut = async () => {
    if (!validateTimesheet()) {
      toast({
        title: 'Timesheet Required',
        description: 'Please fill at least one timesheet entry before checking out',
        variant: 'destructive',
      });
      return;
    }

    if (!authUser?.profileId || !attendanceId) return;
    setLoading(true);

    try {
      const ip = await getIpAddress();
      const now = new Date();
      const today = format(new Date(), 'yyyy-MM-dd');

      // Calculate total hours
      const checkIn = checkInTime ? new Date(checkInTime) : now;
      const totalHours = (now.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

      // Update attendance
      const { error: attendanceError } = await supabase
        .from('attendance')
        .update({
          check_out_time: now.toISOString(),
          check_out_ip: ip,
          total_hours: totalHours,
          timesheet_completed: true,
        })
        .eq('id', attendanceId);

      if (attendanceError) throw attendanceError;

      // Create timesheet
      const { data: timesheet, error: timesheetError } = await supabase
        .from('timesheets')
        .insert({
          profile_id: authUser.profileId,
          timesheet_date: today,
          status: 'submitted',
          submitted_at: now.toISOString(),
          total_hours: totalHours,
        })
        .select()
        .single();

      if (timesheetError) throw timesheetError;

      // Create timesheet entries
      const validEntries = entries
        .map((e, i) => ({
          timesheet_id: timesheet.id,
          entry_number: i + 1,
          from_time: e.from_time || null,
          to_time: e.to_time || null,
          description: e.description || null,
          hours: e.from_time && e.to_time ? calculateHours(e.from_time, e.to_time) : null,
        }))
        .filter(e => e.from_time && e.to_time);

      if (validEntries.length > 0) {
        const { error: entriesError } = await supabase
          .from('timesheet_entries')
          .insert(validEntries);

        if (entriesError) throw entriesError;
      }

      setIsCheckedIn(false);
      setCheckInTime(null);
      setShowTimesheetDialog(false);
      setEntries(Array(10).fill({ from_time: '', to_time: '', description: '' }));

      toast({
        title: 'Checked Out Successfully',
        description: `Total hours: ${totalHours.toFixed(2)}`,
      });
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

  const calculateHours = (from: string, to: string) => {
    try {
      const [fromHours, fromMinutes] = from.split(':').map(Number);
      const [toHours, toMinutes] = to.split(':').map(Number);
      const fromTotal = fromHours + fromMinutes / 60;
      const toTotal = toHours + toMinutes / 60;
      return toTotal - fromTotal;
    } catch {
      return 0;
    }
  };

  return (
    <>
      {isCheckedIn ? (
        <Button 
          onClick={handleCheckOutClick} 
          disabled={loading}
          className="bg-red-600 hover:bg-red-700"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Check-OUT
        </Button>
      ) : (
        <Button 
          onClick={handleCheckIn} 
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Check-IN
        </Button>
      )}

      <Dialog open={showTimesheetDialog} onOpenChange={setShowTimesheetDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Timesheet Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* In-Time and Out-Time Display */}
            <div className="grid grid-cols-2 gap-4 bg-muted/50 p-4 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground mb-1">In-Time</p>
                <p className="bg-primary/10 px-4 py-2 rounded text-lg font-medium">
                  {checkInTime ? format(new Date(checkInTime), 'hh:mm:ss a') : '--:--:-- --'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Out-Time</p>
                <p className="bg-primary/10 px-4 py-2 rounded text-lg font-medium">
                  {format(new Date(), 'hh:mm:ss a')}
                </p>
              </div>
            </div>

            {/* Time Entries - 10 entries in 5x2 grid */}
            <div className="grid grid-cols-2 gap-6">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="space-y-4">
                  {[0, 1].map((col) => {
                    const index = row * 2 + col;
                    return (
                      <div key={index} className="bg-muted/30 p-3 rounded-lg space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          Session {index + 1}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Input
                              type="time"
                              value={entries[index]?.from_time || ''}
                              onChange={(e) => updateEntry(index, 'from_time', e.target.value)}
                              placeholder="From"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Input
                              type="time"
                              value={entries[index]?.to_time || ''}
                              onChange={(e) => updateEntry(index, 'to_time', e.target.value)}
                              placeholder="To"
                              className="text-sm"
                            />
                          </div>
                        </div>
                        <Textarea
                          value={entries[index]?.description || ''}
                          onChange={(e) => updateEntry(index, 'description', e.target.value)}
                          placeholder="Remark / Description"
                          className="text-sm resize-none"
                          rows={2}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowTimesheetDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCheckOut} disabled={loading}>
                {loading ? 'Processing...' : 'Submit & Check-OUT'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

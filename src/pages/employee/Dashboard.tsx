import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, BirthdayCard, AnnouncementsCard } from '@/components/dashboard';
import { UserCheck, CheckSquare, CalendarDays, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

export default function EmployeeDashboard() {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    appliedLeaves: 0, 
    approvedLeaves: 0, 
    pendingTasks: 0, 
    myTraining: 0 
  });
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;
      
      const currentMonth = format(new Date(), 'MM');
      const currentDay = format(new Date(), 'dd');

      // Get total applied leaves (all leaves for this user)
      const { count: appliedCount } = await supabase
        .from('leaves')
        .select('id', { count: 'exact' })
        .eq('profile_id', authUser.profileId);

      // Get approved leaves count
      const { count: approvedCount } = await supabase
        .from('leaves')
        .select('id', { count: 'exact' })
        .eq('profile_id', authUser.profileId)
        .eq('status', 'approved');

      // Get pending tasks
      const { count: taskCount } = await supabase
        .from('tasks')
        .select('id', { count: 'exact' })
        .eq('assigned_to', authUser.profileId)
        .in('status', ['pending', 'in_progress']);

      // Get user's training count
      const { count: trainingCount } = await supabase
        .from('training')
        .select('id', { count: 'exact' })
        .eq('profile_id', authUser.profileId);

      // Get announcements
      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(5);

      // Get today's birthdays
      const { data: birthdayData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, date_of_birth')
        .not('date_of_birth', 'is', null);

      const todayBirthdays = birthdayData?.filter(p => {
        if (!p.date_of_birth) return false;
        const dob = new Date(p.date_of_birth);
        return format(dob, 'MM-dd') === `${currentMonth}-${currentDay}`;
      }) || [];
      
      setStats({ 
        appliedLeaves: appliedCount || 0, 
        approvedLeaves: approvedCount || 0, 
        pendingTasks: taskCount || 0, 
        myTraining: trainingCount || 0 
      });
      setAnnouncements(ann?.map(a => ({ id: a.id, title: a.title, content: a.content, priority: a.priority, publishedAt: a.published_at })) || []);
      setBirthdays(todayBirthdays.map(b => ({ id: b.id, name: `${b.first_name} ${b.last_name}` })));
      setLoading(false);
    };
    fetchData();
  }, [authUser]);

  if (loading) return <div className="flex items-center justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold">Welcome, {authUser?.firstName}!</h1><p className="text-muted-foreground">Your employee dashboard</p></div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Applied Leaves" value={stats.appliedLeaves} icon={<CalendarDays className="h-4 w-4" />} description="Total leave applications" />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={<UserCheck className="h-4 w-4" />} description="Leaves approved" />
        <StatCard title="Pending Tasks" value={stats.pendingTasks} icon={<CheckSquare className="h-4 w-4" />} />
        <StatCard title="My Trainings" value={stats.myTraining} icon={<GraduationCap className="h-4 w-4" />} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <BirthdayCard birthdays={birthdays} />
        <AnnouncementsCard announcements={announcements} />
      </div>
    </div>
  );
}

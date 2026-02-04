import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StatCard, BirthdayCard, AnnouncementsCard } from '@/components/dashboard';
import {
  Users,
  UserCheck,
  CalendarDays,
  CheckSquare,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalHR: 0,
    todayAttendance: 0,
    pendingLeaves: 0,
    completedTasks: 0,
    totalTasks: 0,
    monthlyTraining: 0,
  });
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch employee counts
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('employment_status', 'active');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const hrCount = roles?.filter(r => r.role === 'hr').length || 0;
      const adminCount = roles?.filter(r => r.role === 'admin').length || 0;
      const totalEmployees = (profiles?.length || 0) - adminCount;

      // Today's attendance
      const today = format(new Date(), 'yyyy-MM-dd');
      const { count: attendanceCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact' })
        .eq('attendance_date', today);

      // Pending leaves
      const { count: pendingLeavesCount } = await supabase
        .from('leaves')
        .select('id', { count: 'exact' })
        .eq('status', 'pending');

      // Tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('id, status');

      const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;

      // Monthly training
      const startOfMonth = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
      const { count: trainingCount } = await supabase
        .from('training')
        .select('id', { count: 'exact' })
        .gte('start_date', startOfMonth);

      // Today's birthdays
      const todayDate = format(new Date(), 'MM-dd');
      const { data: birthdayProfiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, date_of_birth, departments(name)')
        .not('date_of_birth', 'is', null);

      const todayBirthdays = birthdayProfiles?.filter(p => {
        if (!p.date_of_birth) return false;
        const dob = format(new Date(p.date_of_birth), 'MM-dd');
        return dob === todayDate;
      }).map(p => ({
        id: p.id,
        name: `${p.first_name} ${p.last_name}`,
        department: (p.departments as any)?.name,
        date: p.date_of_birth,
      })) || [];

      // Announcements
      const { data: announcementsData } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(5);

      setStats({
        totalEmployees,
        totalHR: hrCount,
        todayAttendance: attendanceCount || 0,
        pendingLeaves: pendingLeavesCount || 0,
        completedTasks,
        totalTasks: tasks?.length || 0,
        monthlyTraining: trainingCount || 0,
      });

      setBirthdays(todayBirthdays);
      setAnnouncements(
        announcementsData?.map(a => ({
          id: a.id,
          title: a.title,
          content: a.content,
          priority: a.priority,
          publishedAt: a.published_at,
        })) || []
      );
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
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
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={<Users className="h-4 w-4" />}
          description={`Including ${stats.totalHR} HR personnel`}
        />
        <StatCard
          title="Today's Attendance"
          value={stats.todayAttendance}
          icon={<UserCheck className="h-4 w-4" />}
          description={`Out of ${stats.totalEmployees} employees`}
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves}
          icon={<CalendarDays className="h-4 w-4" />}
          description="Awaiting approval"
        />
        <StatCard
          title="Tasks Completed"
          value={`${stats.completedTasks}/${stats.totalTasks}`}
          icon={<CheckSquare className="h-4 w-4" />}
          description="This month"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Monthly Training"
          value={stats.monthlyTraining}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Sessions this month"
        />
        <BirthdayCard birthdays={birthdays} />
        <AnnouncementsCard announcements={announcements} />
      </div>
    </div>
  );
}
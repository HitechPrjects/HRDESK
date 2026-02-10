import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard, BirthdayCard, AnnouncementsCard } from '@/components/dashboard';
import { Users, UserCheck, CalendarDays, GraduationCap } from 'lucide-react';
import { format } from 'date-fns';

export default function HRDashboard() {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    employees: 0,
    attendance: 0,
    employeesOnLeave: 0,
    dailyTraining: 0,
    ongoingTraining: 0,
  });

  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!authUser) return;

      const today = format(new Date(), 'yyyy-MM-dd');
      const now = new Date();

      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      const currentMonth = format(now, 'MM');
      const currentDay = format(now, 'dd');

      /* ================= EMPLOYEE COUNT (EXCLUDING ADMIN) ================= */

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, user_id')
        .eq('employment_status', 'active');

      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const nonAdminProfiles =
        profiles?.filter((p) => {
          const role = roles?.find((r) => r.user_id === p.user_id)?.role;
          return role !== 'admin';
        }) || [];

      /* ================= TODAY ATTENDANCE ================= */

      const { count: attCount } = await supabase
        .from('attendance')
        .select('id', { count: 'exact' })
        .eq('attendance_date', today);

      /* ================= EMPLOYEES ON LEAVE TODAY ================= */

      const { count: leaveCount } = await supabase
        .from('leaves')
        .select('id', { count: 'exact' })
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today);

      /* ================= DAILY TRAINING (CURRENT MONTH) ================= */

      const { count: dailyCount } = await supabase
        .from('daily_training')
        .select('id', { count: 'exact' })
        .gte('date', startOfMonth.toISOString())
        .lt('date', endOfMonth.toISOString());

      /* ================= ONGOING TRAINING (CURRENT MONTH) ================= */

      const { count: ongoingCount } = await supabase
        .from('ongoing_training')
        .select('id', { count: 'exact' })
        .gte('from_date', startOfMonth.toISOString())
        .lt('from_date', endOfMonth.toISOString());

      /* ================= ANNOUNCEMENTS ================= */

      const { data: ann } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(5);

      /* ================= TODAY BIRTHDAYS ================= */

      const { data: birthdayData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, date_of_birth')
        .not('date_of_birth', 'is', null);

      const todayBirthdays =
        birthdayData?.filter((p) => {
          if (!p.date_of_birth) return false;
          const dob = new Date(p.date_of_birth);
          return format(dob, 'MM-dd') === `${currentMonth}-${currentDay}`;
        }) || [];

      /* ================= SET STATE ================= */

      setStats({
        employees: nonAdminProfiles.length,
        attendance: attCount || 0,
        employeesOnLeave: leaveCount || 0,
        dailyTraining: dailyCount || 0,
        ongoingTraining: ongoingCount || 0,
      });

      setAnnouncements(
        ann?.map((a) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          priority: a.priority,
          publishedAt: a.published_at,
        })) || []
      );

      setBirthdays(
        todayBirthdays.map((b) => ({
          id: b.id,
          name: `${b.first_name} ${b.last_name}`,
        }))
      );

      setLoading(false);
    };

    fetchData();
  }, [authUser]);

  /* ================= LOADING ================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">HR Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the HR portal</p>
      </div>

      {/* ===== STATS ===== */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Employees"
          value={stats.employees}
          icon={<Users className="h-4 w-4" />}
          description="HR & Employees"
        />

        <StatCard
          title="Today's Attendance"
          value={stats.attendance}
          icon={<UserCheck className="h-4 w-4" />}
        />

        <StatCard
          title="Employees on Leave"
          value={stats.employeesOnLeave}
          icon={<CalendarDays className="h-4 w-4" />}
          description="Currently on approved leave"
        />

        <StatCard
          title="Daily Training"
          value={stats.dailyTraining}
          icon={<GraduationCap className="h-4 w-4" />}
          description="This month sessions"
        />

        <StatCard
          title="Ongoing Training"
          value={stats.ongoingTraining}
          icon={<GraduationCap className="h-4 w-4" />}
          description="Started this month"
        />
      </div>

      {/* ===== SECOND ROW ===== */}
      <div className="grid gap-4 md:grid-cols-2">
        <BirthdayCard birthdays={birthdays} />
        <AnnouncementsCard announcements={announcements} />
      </div>
    </div>
  );
}

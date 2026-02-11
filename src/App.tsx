import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminLayout, HRLayout, EmployeeLayout } from "@/components/layout";

import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin pages
import { AdminDashboard, AdminEmployees, AdminDepartments, AdminDesignations, AdminAttendance, AdminTimesheets, AdminTasks, AdminLeaves, AdminTraining, AdminGoalsheets, AdminPayroll, AdminAnnouncements, AdminSettings } from "@/pages/admin";

// HR pages
import HRDashboard from "@/pages/hr/Dashboard";

// Employee pages
import EmployeeDashboard from "@/pages/employee/Dashboard";
import DailyTraining from "./components/training/DailyTraining";
import OngoingTraining from "./components/training/OngoingTraining";
import TrainingDetailsList from "./components/training/TrainingDetailsList";
import TrainingUserView from "./components/training/TrainingUserView";

// Configure query client with security settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="designations" element={<AdminDesignations />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="timesheets" element={<AdminTimesheets />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="training" element={<AdminTraining />} />
              <Route path="training/details" element={<TrainingDetailsList />} />
              <Route path="training/details/:profileId" element={<TrainingUserView />} />

              <Route path="goalsheets" element={<AdminGoalsheets />} />
              <Route path="payroll" element={<AdminPayroll />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Protected HR Routes */}
            <Route path="/hr" element={
              <ProtectedRoute allowedRoles={['hr']}>
                <HRLayout />
              </ProtectedRoute>
            }>
              <Route index element={<HRDashboard />} />
              <Route path="employees" element={<AdminEmployees />} />
              <Route path="departments" element={<AdminDepartments />} />
              <Route path="designations" element={<AdminDesignations />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="timesheets" element={<AdminTimesheets />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="training">
                <Route index element={<AdminTraining />} />
                <Route path="daily" element={<DailyTraining />} />
                <Route path="ongoing" element={<OngoingTraining />} />
                <Route path="details" element={<TrainingDetailsList />} />
                <Route path="details/:profileId" element={<TrainingUserView />} />
              </Route>


              <Route path="goalsheets" element={<AdminGoalsheets />} />
              <Route path="payroll" element={<AdminPayroll />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Protected Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeLayout />
              </ProtectedRoute>
            }>
              <Route index element={<EmployeeDashboard />} />
              <Route path="attendance" element={<AdminAttendance />} />
              <Route path="timesheet" element={<AdminTimesheets />} />
              <Route path="tasks" element={<AdminTasks />} />
              <Route path="leaves" element={<AdminLeaves />} />
              <Route path="training">
                <Route index element={<AdminTraining />} />
                <Route path="daily" element={<DailyTraining />} />
                <Route path="ongoing" element={<OngoingTraining />} />
              </Route>

              <Route path="goals" element={<AdminGoalsheets />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Catch all - redirect to login */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "@/contexts/AuthContext";
import AuthGate from "@/components/AuthGate";

import { AdminLayout, HRLayout, EmployeeLayout } from "@/components/layout";

import Login from "@/pages/Login";
import NotFound from "@/pages/NotFound";

// Admin pages
import {
  AdminDashboard,
  AdminEmployees,
  AdminDepartments,
  AdminDesignations,
  AdminAttendance,
  AdminTimesheets,
  AdminTasks,
  AdminLeaves,
  AdminTraining,
  AdminGoalsheets,
  AdminPayroll,
  AdminAnnouncements,
  AdminSettings,
} from "@/pages/admin";

// HR pages
import HRDashboard from "@/pages/hr/Dashboard";

// Employee pages
import EmployeeDashboard from "@/pages/employee/Dashboard";


// ==============================
// React Query Client
// ==============================
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 60 * 1000,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    },
  },
});


// ==============================
// App Component
// ==============================
const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />

          <BrowserRouter future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}>
            <Routes>

              {/* ================= PUBLIC ================= */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<Login />} />

              {/* ================= PROTECTED ================= */}
              <Route path="/*" element={<AuthGate />}>

                {/* -------- ADMIN -------- */}
                <Route path="admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="employees" element={<AdminEmployees />} />
                  <Route path="departments" element={<AdminDepartments />} />
                  <Route path="designations" element={<AdminDesignations />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="timesheets" element={<AdminTimesheets />} />
                  <Route path="tasks" element={<AdminTasks />} />
                  <Route path="leaves" element={<AdminLeaves />} />
                  <Route path="training" element={<AdminTraining />} />
                  <Route path="goalsheets" element={<AdminGoalsheets />} />
                  <Route path="payroll" element={<AdminPayroll />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* -------- HR -------- */}
                <Route path="hr" element={<HRLayout />}>
                  <Route index element={<HRDashboard />} />
                </Route>

                {/* -------- EMPLOYEE -------- */}
                <Route path="employee" element={<EmployeeLayout />}>
                  <Route index element={<EmployeeDashboard />} />
                  <Route path="attendance" element={<AdminAttendance />} />
                  <Route path="timesheet" element={<AdminTimesheets />} />
                  <Route path="tasks" element={<AdminTasks />} />
                  <Route path="leaves" element={<AdminLeaves />} />
                  <Route path="training" element={<AdminTraining />} />
                  <Route path="goals" element={<AdminGoalsheets />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* -------- 404 -------- */}
                <Route path="*" element={<NotFound />} />

              </Route>

            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

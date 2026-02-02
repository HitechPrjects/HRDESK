import { Outlet } from 'react-router-dom';
import { Sidebar, employeeSidebarItems } from './Sidebar';
import { Navbar } from './Navbar';

export function EmployeeLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={employeeSidebarItems} title="Employee Portal" />
      <Navbar />
      <main className="md:ml-64 pt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}

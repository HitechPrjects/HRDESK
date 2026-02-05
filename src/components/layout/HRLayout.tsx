import { Outlet } from 'react-router-dom';
import { Sidebar, hrSidebarItems} from './Sidebar';
import { Navbar } from './Navbar';
import { sidebarLogo } from './Sidebarlogo';
export function HRLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={hrSidebarItems} header={sidebarLogo} />
      <Navbar />
      <main className="md:ml-64 pt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}

import { Outlet } from 'react-router-dom';
import { Sidebar, adminSidebarItems} from './Sidebar';
import { Navbar } from './Navbar';
import { sidebarLogo } from './Sidebarlogo';

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar items={adminSidebarItems} header={sidebarLogo} />
      <Navbar />
      <main className="md:ml-64 pt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}

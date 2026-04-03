import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine active item and title from path
  const path = location.pathname;
  let activeItem = 'dashboard';
  let title = 'Dashboard';

  if (path.includes('/spaces')) {
    activeItem = 'spaces';
    title = 'Public Spaces';
  } else if (path.includes('/features')) {
    activeItem = 'features';
    title = 'Access Features';
  } else if (path.includes('/reviews')) {
    activeItem = 'reviews';
    title = 'Reviews';
  } else if (path.includes('/users')) {
    activeItem = 'users';
    title = 'Users';
  } else if (path.includes('/analytics')) {
    activeItem = 'analytics';
    title = 'Analytics';
  } else if (path.includes('/settings')) {
    activeItem = 'settings';
    title = 'Settings';
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-gray-950 flex font-sans text-gray-900 dark:text-white transition-colors duration-300">
      <AdminSidebar
        activeItem={activeItem}
        onNavigate={(route) => navigate(route)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div
        className="flex-1 transition-all duration-300 ease-in-out flex flex-col min-w-0"
        style={{ marginLeft: collapsed ? '80px' : '280px' }}
      >
        <AdminNavbar title={title} />
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

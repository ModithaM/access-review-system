import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  MapPinned,
  Accessibility,
  Star,
  UserRound,
  BarChart3,
  Settings,
  Menu,
  ChevronLeft,
  LogOut,
  User,
  AlertCircle,
} from 'lucide-react';
import authService from '../../services/auth.service';

interface SidebarProps {
  activeItem: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/admin' },
  {
    id: 'spaces',
    label: 'Public Spaces',
    icon: MapPinned,
    route: '/admin/spaces',
  },
  {
    id: 'features',
    label: 'Access Features',
    icon: Accessibility,
    route: '/admin/features',
  },
  { id: 'reviews', label: 'Reviews', icon: Star, route: '/admin/reviews' },
  { id: 'users', label: 'Users', icon: UserRound, route: '/admin/users' },
  {
    id: 'issues',
    label: 'Reported Issues',
    icon: AlertCircle,
    route: '/admin/issues',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    route: '/admin/analytics',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    route: '/admin/settings',
  },
];

export default function AdminSidebar({
  activeItem,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
}: SidebarProps) {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentUser = authService.getCurrentUser()?.user;
  const userName = currentUser?.name || 'Admin User';
  const userEmail = currentUser?.email || 'admin@accessify.com';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 248 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 shadow-xl shadow-gray-200/50 dark:shadow-none z-50 flex flex-col rounded-r-3xl border-r border-gray-100 dark:border-gray-800 transition-colors duration-300"
    >
      <div className="flex items-center justify-between p-5 h-20">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold bg-brand-gradient text-transparent bg-clip-text truncate"
          >
            Accessify Admin
          </motion.div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors mx-auto"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav
        className="flex-1 px-3 py-5 space-y-2 overflow-y-auto"
        style={{ scrollbarWidth: 'none' }}
      >
        {MENU_ITEMS.map((item) => {
          const isActive = activeItem === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => onNavigate(item.route)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                collapsed ? 'justify-center' : 'justify-start space-x-4'
              } ${
                isActive
                  ? 'bg-brand-gradient text-white shadow-lg shadow-blue-500/20'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {!isActive && (
                <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity duration-300" />
              )}

              <Icon
                size={22}
                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}
              />

              {!collapsed && (
                <span className="relative z-10 font-medium truncate">{item.label}</span>
              )}

              {collapsed && (
                <div className="absolute left-14 bg-gray-900 dark:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div
        className="p-4 border-t border-gray-100 dark:border-gray-800 relative transition-colors duration-300"
        ref={dropdownRef}
      >
        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`absolute bottom-full mb-2 ${collapsed ? 'left-2 right-2' : 'left-4 right-4'} bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none p-2 z-50 transition-colors duration-300`}
            >
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/profile');
                  }}
                  className={`flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 p-2'} text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium w-full text-left`}
                  title="Profile"
                >
                  <User size={18} />
                  {!collapsed && <span>Profile</span>}
                </button>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    navigate('/');
                  }}
                  className={`flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 p-2'} text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium w-full text-left`}
                  title="Home"
                >
                  <Home size={18} />
                  {!collapsed && <span>Home</span>}
                </button>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-1 w-full transition-colors duration-300" />
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    handleLogout();
                  }}
                  className={`flex items-center ${collapsed ? 'justify-center p-3' : 'gap-3 p-2'} text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm font-medium w-full text-left`}
                  title="Logout"
                >
                  <LogOut size={18} />
                  {!collapsed && <span>Logout</span>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center w-full ${collapsed ? 'justify-center p-2' : 'space-x-3 p-2'} rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group border border-transparent hover:border-gray-100 dark:hover:border-gray-800`}
        >
          <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shrink-0 shadow-sm relative">
            {userInitial}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors duration-300">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate transition-colors duration-300">
                {userEmail}
              </p>
            </div>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

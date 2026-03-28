import { motion } from 'framer-motion';
import { 
  Home, 
  MapPinned, 
  Accessibility, 
  Star, 
  UserRound, 
  BarChart3, 
  Settings,
  Menu,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  activeItem: string;
  onNavigate: (route: string) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, route: '/admin' },
  { id: 'spaces', label: 'Public Spaces', icon: MapPinned, route: '/admin/spaces' },
  { id: 'features', label: 'Access Features', icon: Accessibility, route: '/admin/features' },
  { id: 'reviews', label: 'Reviews', icon: Star, route: '/admin/reviews' },
  { id: 'users', label: 'Users', icon: UserRound, route: '/admin/users' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/admin/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, route: '/admin/settings' },
];

export default function AdminSidebar({ activeItem, onNavigate, collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen bg-white shadow-xl shadow-gray-200/50 z-50 flex flex-col rounded-r-3xl border-r border-gray-100"
    >
      <div className="flex items-center justify-between p-6 h-20">
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
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors mx-auto"
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {!isActive && (
                <div className="absolute inset-0 bg-brand-gradient opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              )}
              
              <Icon 
                size={22} 
                className={`relative z-10 transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-blue-600'}`} 
              />
              
              {!collapsed && (
                <span className="relative z-10 font-medium truncate">
                  {item.label}
                </span>
              )}
              
              {collapsed && (
                <div className="absolute left-16 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-2xl bg-gray-50`}>
          <div className="w-10 h-10 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold shrink-0 shadow-md">
            A
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">Admin User</p>
              <p className="text-xs text-gray-400 truncate">admin@accessify.com</p>
            </div>
          )}
        </div>
      </div>
    </motion.aside>
  );
}

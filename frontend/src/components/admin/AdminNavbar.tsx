import { useState, useEffect } from 'react';
import { Search, Bell, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  title: string;
}

export default function AdminNavbar({ title }: NavbarProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Determine default mode based on localStorage or browser preference
    const storedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <header className="h-20 bg-white/70 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-8 dark:bg-gray-900/70 dark:border-gray-800 transition-colors">
      <h1 className="text-2xl font-bold bg-brand-gradient text-transparent bg-clip-text">
        {title}
      </h1>

      <div className="flex items-center space-x-6">
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all focus:w-80 focus:bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:focus:bg-gray-700"
          />
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleDarkMode}
            className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-gray-300 hover:text-yellow-400 transition-colors" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 hover:text-blue-600 transition-colors" />
            )}
          </button>

          <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-pink-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>
        </div>
      </div>
    </header>
  );
}

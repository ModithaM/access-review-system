import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, LogOut, Menu, Shield, User, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/shared/Button';
import { AuroraText } from './AuroraText';
import AuthService from '@/services/auth.service';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '@/hooks/useTheme';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Explore Spaces', href: '/explore-spaces' },
  { name: 'Accessibility Features', href: '#' },
  { name: 'Report Issue', href: '/report-issue' },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    const handleWindowClick = () => setIsProfileMenuOpen(false);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('click', handleWindowClick);

    // Check login state
    const user = AuthService.getCurrentUser();
    setIsLoggedIn(!!user?.token);
    setUserName(user?.user?.name || null);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleWindowClick);
    };
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUserName(null);
    setIsOpen(false);
    setIsProfileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-4' : 'py-8'
      }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`relative flex w-full items-center p-2 rounded-[2rem] transition-all duration-500 ${
            scrolled
              ? 'bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-slate-950/75 dark:shadow-black/30'
              : 'bg-white/80 shadow-none backdrop-blur-xl dark:bg-transparent dark:backdrop-blur-none'
          }`}
        >
          <div className="mr-auto flex shrink-0 items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#FF0080] via-[#7928CA] to-[#0070F3] text-white shadow-lg shadow-[#7928CA]/30 dark:shadow-[#0070F3]/20"
            >
              <Shield className="h-6 w-6 text-white" />
            </Link>
            <Link to="/" className="no-underline">
              <AuroraText
                className="text-xl font-black tracking-tighter"
                colors={
                  isDark ? ['#f9a8d4', '#c4b5fd', '#7dd3fc'] : ['#FF0080', '#7928CA', '#0070F3']
                }
              >
                ACCESSIFY
              </AuroraText>
            </Link>
          </div>

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className="h-10 shrink-0 rounded-full px-3 text-[10px] font-bold uppercase tracking-widest text-black hover:bg-gray-100 dark:text-white dark:hover:bg-white/10 sm:px-4 sm:text-[11px]"
              >
                {item.href.startsWith('/') ? (
                  <Link to={item.href}>{item.name}</Link>
                ) : (
                  <a href={item.href}>{item.name}</a>
                )}
              </Button>
            ))}
          </div>

          <ThemeToggle
            isDark={isDark}
            onToggle={toggleTheme}
            className="ml-3 hidden lg:inline-flex"
          />

          {isLoggedIn ? (
            <div
              className="relative ml-3 hidden lg:block"
              onClick={(event) => event.stopPropagation()}
            >
              <Button
                type="button"
                onClick={() => setIsProfileMenuOpen((current) => !current)}
                className="h-12 shrink-0 gap-2 rounded-2xl border-0 bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-5 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-[#7928CA]/20 ring-0 transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <User className="h-4 w-4" />
                <span className="max-w-32 truncate">{userName ?? 'Account'}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isProfileMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </Button>

              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute right-0 mt-3 w-60 overflow-hidden rounded-3xl border border-gray-200 bg-white/95 p-2 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/95"
                  >
                    <div className="rounded-2xl bg-linear-to-r from-[#FF0080]/10 via-[#7928CA]/10 to-[#0070F3]/10 px-4 py-3 dark:from-[#FF0080]/15 dark:via-[#7928CA]/15 dark:to-[#0070F3]/15">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-slate-400">
                        Signed in
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-gray-900 dark:text-white">
                        {userName ?? 'Accessify User'}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-col gap-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-white/8"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        type="button"
                        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-500/10"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="ml-3 hidden items-center gap-3 lg:flex">
              <Button
                asChild
                variant="ghost"
                className="h-12 shrink-0 rounded-2xl border border-transparent bg-[linear-gradient(rgba(255,255,255,0.92),rgba(245,247,255,0.92))_padding-box,linear-gradient(120deg,rgba(255,0,128,0.75),rgba(121,40,202,0.7),rgba(0,112,243,0.78))_border-box] px-6 text-[11px] font-black uppercase tracking-widest text-[#5b21b6] shadow-[0_14px_32px_rgba(121,40,202,0.14)] backdrop-blur-xl hover:bg-[linear-gradient(rgba(255,255,255,0.98),rgba(250,245,255,0.98))_padding-box,linear-gradient(120deg,rgba(255,0,128,0.9),rgba(121,40,202,0.82),rgba(0,112,243,0.88))_border-box] hover:text-[#4c1d95] dark:border-white/10 dark:bg-white/6 dark:text-slate-100 dark:shadow-none dark:hover:bg-white/10"
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="h-12 shrink-0 rounded-2xl border-0 bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-xl shadow-[#7928CA]/20 ring-0 transition-all hover:opacity-95 active:scale-[0.98]"
              >
                <Link to="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 h-12 w-12 shrink-0 rounded-xl bg-gray-100 text-black dark:bg-white/10 dark:text-white lg:ml-0 lg:hidden"
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="container mx-auto mt-4 px-4 lg:hidden"
          >
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-2xl dark:border-white/10 dark:bg-slate-950">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.href.startsWith('/') ? (
                      <Link
                        to={item.href}
                        className="block rounded-xl px-2 py-3 text-lg font-black tracking-tight text-black transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-white/8"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="block rounded-xl px-2 py-3 text-lg font-black tracking-tight text-black transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-white/8"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </a>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-6 space-y-3 border-t border-gray-200 pt-6 dark:border-white/10">
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {isDark ? 'Dark mode' : 'Light mode'}
                  </span>
                  <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
                </div>
                {isLoggedIn ? (
                  <>
                    <Button
                      asChild
                      className="h-12 w-full rounded-xl border-2 border-black bg-white text-center text-[11px] font-black uppercase tracking-widest text-black dark:border-white dark:bg-transparent dark:text-white"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-center gap-2"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </Button>
                    <Button
                      className="h-12 w-full rounded-xl bg-red-600 text-[11px] font-black uppercase tracking-widest text-white hover:bg-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      asChild
                      className="h-12 w-full rounded-xl bg-linear-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] text-[11px] font-black uppercase tracking-widest text-white"
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="h-12 w-full rounded-xl border border-[#7928CA]/20 bg-white text-[11px] font-black uppercase tracking-widest text-[#7928CA] dark:border-white/10 dark:bg-white/6 dark:text-white"
                    >
                      <Link to="/register" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

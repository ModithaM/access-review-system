import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Shield, X, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { Button } from '@/components/shared/Button';
import { AuroraText } from './AuroraText';
import AuthService from '@/services/auth.service';

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Explore Spaces', href: '#' },
  { name: 'Reviews', href: '#' },
  { name: 'Accessibility Features', href: '#' },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check login state
    const user = AuthService.getCurrentUser();
    setIsLoggedIn(!!user?.token);
    setUserName(user?.user?.name || null);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    setIsLoggedIn(false);
    setUserName(null);
    setIsOpen(false);
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
              ? 'bg-white/80 backdrop-blur-xl shadow-2xl'
              : 'bg-white/80 backdrop-blur-xl dark:bg-transparent dark:backdrop-blur-none shadow-none'
          }`}
        >
          <div className="mr-auto flex shrink-0 items-center gap-3 px-4">
            <Link
              to="/"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-black shadow-lg shadow-black/20"
            >
              <Shield className="h-6 w-6 text-white" />
            </Link>
            <Link to="/" className="no-underline">
              <AuroraText className="text-xl font-black tracking-tighter">ACCESSIFY</AuroraText>
            </Link>
          </div>

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className="h-10 shrink-0 rounded-full px-3 text-[10px] text-black font-bold uppercase tracking-widest hover:bg-gray-100 sm:px-4 sm:text-[11px]"
              >
                {item.href.startsWith('/') ? (
                  <Link to={item.href}>{item.name}</Link>
                ) : (
                  <a href={item.href}>{item.name}</a>
                )}
              </Button>
            ))}
          </div>

          {isLoggedIn ? (
            <Button
              asChild
              className="ml-3 hidden h-12 shrink-0 rounded-2xl bg-black px-6 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.98] lg:inline-flex gap-2"
            >
              <Link to="/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {userName}
              </Link>
            </Button>
          ) : (
            <Button
              asChild
              className="ml-3 hidden h-12 shrink-0 rounded-2xl bg-black px-8 text-[11px] font-black uppercase tracking-widest text-white shadow-xl transition-all hover:opacity-90 active:scale-[0.98] lg:inline-flex"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 h-12 w-12 shrink-0 rounded-xl bg-gray-100 text-black lg:ml-0 lg:hidden"
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
            <div className="overflow-hidden rounded-[2.5rem] border border-gray-200 bg-white p-8 shadow-2xl">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.href.startsWith('/') ? (
                      <Link
                        to={item.href}
                        className="block rounded-xl px-2 py-3 text-lg font-black tracking-tight text-black transition-colors hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </Link>
                    ) : (
                      <a
                        href={item.href}
                        className="block rounded-xl px-2 py-3 text-lg font-black tracking-tight text-black transition-colors hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.name}
                      </a>
                    )}
                  </div>
                ))}
              </nav>
              <div className="mt-6 border-t border-gray-200 pt-6 space-y-3">
                {isLoggedIn ? (
                  <>
                    <Button
                      asChild
                      className="w-full h-12 rounded-xl border-2 border-black bg-white text-black text-center text-[11px] font-black uppercase tracking-widest"
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
                      className="w-full h-12 rounded-xl bg-red-600 text-white text-[11px] font-black uppercase tracking-widest hover:bg-red-700"
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
                      className="w-full h-12 rounded-xl bg-black text-white text-[11px] font-black uppercase tracking-widest"
                    >
                      <Link to="/login" onClick={() => setIsOpen(false)}>
                        Login
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full h-12 rounded-xl border-2 border-black bg-white text-black text-[11px] font-black uppercase tracking-widest"
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

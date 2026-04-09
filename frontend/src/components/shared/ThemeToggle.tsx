import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/shared/Button';

type ThemeToggleProps = {
  isDark: boolean;
  onToggle: () => void;
  className?: string;
};

export default function ThemeToggle({ isDark, onToggle, className }: ThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={onToggle}
      className={`rounded-xl border border-black/5 bg-white/80 text-black shadow-sm backdrop-blur-sm transition-all hover:bg-gray-100 dark:border-white/10 dark:bg-white/8 dark:text-white dark:hover:bg-white/12 ${className ?? ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
}

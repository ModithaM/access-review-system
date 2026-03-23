import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Shield, X } from "lucide-react";

import { Button } from "@/components/shared/Button";
import { AuroraText } from "./AuroraText";

const navigation = [
  { name: "Home", href: "#" },
  { name: "Explore Spaces", href: "#" },
  { name: "Reviews", href: "#" },
  { name: "Accessibility Features", href: "#" },
  { name: "Login", href: "#" },
] as const;

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "py-4" : "py-8"
        }`}
    >
      <div className="container mx-auto px-4">
        <div
          className={`relative flex w-full items-center p-2 rounded-[2rem] transition-all duration-500 ${scrolled
              ? "bg-background/80 backdrop-blur-xl shadow-2xl"
              : "bg-background/80 backdrop-blur-xl dark:bg-transparent dark:backdrop-blur-none shadow-none"
            }`}
        >
          <div className="mr-auto flex shrink-0 items-center gap-3 px-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <AuroraText className="text-xl font-black tracking-tighter">
              ACCESSIFY
            </AuroraText>
          </div>

          <div className="hidden items-center gap-1 lg:flex lg:gap-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant="ghost"
                asChild
                className="h-10 shrink-0 rounded-full px-3 text-[10px] text-black font-bold uppercase tracking-widest hover:bg-muted/50 sm:px-4 sm:text-[11px]"
              >
                <a href={item.href}>{item.name}</a>
              </Button>
            ))}
          </div>

          <Button
            asChild
            className="ml-3 hidden h-12 shrink-0 rounded-2xl bg-foreground px-8 text-[11px] font-black uppercase tracking-widest text-background shadow-xl transition-all hover:opacity-90 active:scale-[0.98] lg:inline-flex"
          >
            <a href="#">Sign Up</a>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="ml-2 h-12 w-12 shrink-0 rounded-xl bg-muted/50 text-foreground lg:ml-0 lg:hidden"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="container mx-auto mt-4 px-4 lg:hidden"
          >
            <div className="overflow-hidden rounded-[2.5rem] border border-border bg-card p-8 shadow-2xl">
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="rounded-xl px-2 py-3 text-lg font-black tracking-tight text-foreground transition-colors hover:bg-muted/50"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </nav>
              <div className="mt-6 border-t border-border pt-6">
                <Button
                  asChild
                  className="h-14 w-full rounded-2xl border-none bg-foreground text-[10px] font-black uppercase tracking-widest text-background"
                >
                  <a href="#" onClick={() => setIsOpen(false)}>
                    Sign Up
                  </a>
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

// pages/HomePage.tsx

import { About } from "@/components/home/About";
import Features from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Testimonials from "@/components/home/Testimonials";
import Header01 from "@/components/shared/Header";
import { AccessifyMarquee } from "@/components/shared/Marquee";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <Header01 />
      <main className="relative w-full px-0">
        <Hero />
        <AccessifyMarquee />
        <About />
        <Features />
        <Testimonials />
        <Stats />
      </main>
    </div>
  );
}

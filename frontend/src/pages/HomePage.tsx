// pages/HomePage.tsx

import { About } from "@/components/home/About";
import Features from "@/components/home/Features";
import { Hero } from "@/components/home/Hero";
import Testimonials from "@/components/home/Testimonials";
import Header01 from "@/components/shared/Header";
import { AccessifyMarquee } from "@/components/shared/Marquee";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-white">
      <Header01 />
      <main className="relative w-full px-0">
        <Hero />
        <div className="-mt-10">
          <AccessifyMarquee />
        </div>
        <div className="-mt-30">
          <About />
        </div>
        <div className="-mt-40">
          <Features />
        </div>
        <div className="-mt-120">
          <Testimonials />
        </div>
      </main>
    </div>
  );
}
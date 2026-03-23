"use client";

import { useEffect, useRef, useState } from "react";
import {
  Accessibility,
  Map,
  MapPinned,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";
import ThreeDHoverGallery from "@/components/ui/3d-hover-gallery";

const features = [
  {
    title: "Discover Public Spaces",
    desc: "Find accessible public spaces such as parks, malls, stations, and other important locations with clear details and community ratings.",
    icon: MapPinned,
    accentHex: "#FF0080",
  },
  {
    title: "Share Accessibility Reviews",
    desc: "Submit honest reviews based on real experiences and help others understand the accessibility of each location.",
    icon: Star,
    accentHex: "#7928CA",
  },
  {
    title: "Explore Accessibility Features",
    desc: "View important accessibility facilities such as wheelchair ramps, elevators, tactile paths, handrails, and accessible entrances.",
    icon: Accessibility,
    accentHex: "#0070F3",
  },
  {
    title: "Personalized User Profiles",
    desc: "Manage your reviews, keep track of your contributions, and save your favorite accessible places for quick access later.",
    icon: UserRound,
    accentHex: "#38bdf8",
  },
  {
    title: "Interactive Map View",
    desc: "Visualize accessible places on a map, explore nearby locations, and make navigation easier with location-based discovery.",
    icon: Map,
    accentHex: "#FF0080",
  },
  {
    title: "Trusted and Inclusive Platform",
    desc: "Built to promote equality and accessibility by giving users a reliable space to share information that supports inclusive public environments.",
    icon: ShieldCheck,
    accentHex: "#7928CA",
  },
];

export default function WhyAccessify() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="w-full px-0 py-10 overflow-hidden">
      <div
        className={[
          "transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
        ].join(" ")}
      >
        {isVisible ? (
          <ThreeDHoverGallery
            items={features}
            defaultActiveIndex={0}
            itemHeightVw={40}
            itemActiveWidthVw={50}
          />
        ) : (
          <div className="min-h-[520px]" />
        )}
      </div>
    </section>
  );
}
"use client";

import ScrollStack, { ScrollStackItem } from "@/components/ui/ScrollStack";
import ScrollFloat from "@/components/ui/ScrollFloat";
import { motion } from "framer-motion";
import {
  MapPinned,
  Accessibility,
  Star,
  UserRound,
  ShieldCheck,
  Map,
  Navigation,
} from "lucide-react";

/* ─────────────────────────────────────────────
   Tiny reusable fade-up wrapper
───────────────────────────────────────────── */
function FadeUp({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   Fake map mockup — built entirely in CSS
───────────────────────────────────────────── */
function MapMockup() {
  const pins = [
    { top: "22%", left: "28%", color: "#FF0080", label: "City Mall" },
    { top: "55%", left: "58%", color: "#7928CA", label: "Central Park" },
    { top: "38%", left: "72%", color: "#0070F3", label: "Metro Hub" },
    { top: "68%", left: "30%", color: "#38BDF8", label: "Library" },
  ];

  const features = [
    { icon: "♿", label: "Ramp" },
    { icon: "🛗", label: "Lift" },
    { icon: "👁", label: "Braille" },
    { icon: "🔇", label: "Quiet" },
  ];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 border border-gray-100 shadow-inner"
      style={{ height: "220px" }}
    >
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.07]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid-feat"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="#0070F3"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-feat)" />
      </svg>
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <line
          x1="0"
          y1="45%"
          x2="100%"
          y2="45%"
          stroke="#334155"
          strokeWidth="6"
        />
        <line
          x1="0"
          y1="75%"
          x2="100%"
          y2="75%"
          stroke="#334155"
          strokeWidth="3"
        />
        <line
          x1="38%"
          y1="0"
          x2="38%"
          y2="100%"
          stroke="#334155"
          strokeWidth="6"
        />
        <line
          x1="68%"
          y1="0"
          x2="68%"
          y2="100%"
          stroke="#334155"
          strokeWidth="3"
        />
      </svg>
      <div
        className="absolute rounded-full blur-2xl opacity-20"
        style={{
          width: 100,
          height: 100,
          top: "10%",
          left: "20%",
          backgroundColor: "#FF0080",
        }}
      />
      <div
        className="absolute rounded-full blur-2xl opacity-15"
        style={{
          width: 120,
          height: 120,
          top: "40%",
          left: "50%",
          backgroundColor: "#7928CA",
        }}
      />
      {pins.map((p) => (
        <div
          key={p.label}
          className="absolute flex flex-col items-center"
          style={{
            top: p.top,
            left: p.left,
            transform: "translate(-50%,-100%)",
          }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg text-white text-[10px] font-black ring-2 ring-white"
            style={{ backgroundColor: p.color }}
          >
            <MapPinned size={12} />
          </div>
          <div
            className="mt-0.5 px-2 py-0.5 rounded-full text-[8px] font-bold text-white shadow-md whitespace-nowrap"
            style={{ backgroundColor: p.color }}
          >
            {p.label}
          </div>
        </div>
      ))}
      <div className="absolute bottom-3 left-3 right-3 flex gap-2 flex-wrap">
        {features.map((f) => (
          <span
            key={f.label}
            className="inline-flex items-center gap-1 bg-white/90 backdrop-blur-sm border border-gray-100 rounded-full px-2.5 py-1 text-[10px] font-semibold text-gray-700 shadow-sm"
          >
            <span>{f.icon}</span> {f.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Rating stars helper
───────────────────────────────────────────── */
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={11}
          className={
            i < rating
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Feature card definitions
───────────────────────────────────────────── */
const featureCards = [
  {
    id: "header",
    content: (
      <div className="flex flex-col items-center justify-center text-center h-full gap-7 max-w-4xl mx-auto">
        <ScrollFloat
          containerClassName="!my-0 !overflow-visible"
          textClassName="!text-sm !leading-none uppercase tracking-[0.22em] text-gray-400 font-semibold"
          animationDuration={0.85}
          ease="power2.out"
          stagger={0.012}
          scrollStart="center bottom+=25%"
          scrollEnd="bottom bottom-=55%"
        >
          Inclusive by Design
        </ScrollFloat>

        <h2
          className="w-full font-black tracking-tight leading-[1.05] text-gray-900"
          style={{ fontSize: "clamp(2.8rem, 5vw, 6rem)" }}
        >
          Designed for{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(to right,#FF0080,#7928CA,#0070F3)",
            }}
          >
            Inclusive
          </span>{" "}
          Exploration
        </h2>

        <p className="text-gray-500 text-xl leading-relaxed max-w-2xl">
          AccessAble helps you discover, review, and truly understand the
          accessibility of public spaces — powered by community-driven
          insights and meaningful real-world data.
        </p>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
  {
    id: "map",
    gradient: null,
    bg: "bg-white",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        {/* Left: text */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-5 mb-8">
            <div
              className="w-18 h-18 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "#FF008018", width: 72, height: 72 }}
            >
              <Map size={34} style={{ color: "#FF0080" }} />
            </div>
            <div>
              <p className="text-xs uppercase font-bold tracking-widest text-gray-400">
                Live Discovery
              </p>
              <h3 className="text-4xl font-black tracking-tight text-gray-900">
                Interactive Map View
              </h3>
            </div>
          </div>
          <p className="text-gray-500 text-lg leading-relaxed mb-8">
            Visualize accessible locations on a live, interactive map. Explore
            what's nearby, filter by facility type, and navigate every public
            space with total confidence.
          </p>
          <div className="flex gap-3 flex-wrap">
            {[
              {
                name: "City Mall",
                rating: 4,
                badge: "Wheelchair ✓",
                color: "#FF0080",
              },
              {
                name: "Central Park",
                rating: 5,
                badge: "Quiet Zone ✓",
                color: "#7928CA",
              },
              {
                name: "Metro Hub",
                rating: 3,
                badge: "Elevator ✓",
                color: "#0070F3",
              },
            ].map((loc) => (
              <div
                key={loc.name}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3"
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${loc.color}18` }}
                >
                  <MapPinned size={16} style={{ color: loc.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-none mb-1">
                    {loc.name}
                  </p>
                  <Stars rating={loc.rating} />
                </div>
                <span
                  className="ml-1 text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `${loc.color}18`,
                    color: loc.color,
                  }}
                >
                  {loc.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
        {/* Right: map mockup */}
        <div className="flex-1 w-full relative">
          <MapMockup />
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-4 -right-2 z-10 bg-gray-900 text-white rounded-2xl px-5 py-3.5 shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#FF008022" }}
            >
              <Navigation size={20} style={{ color: "#FF0080" }} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-black tracking-widest opacity-50">
                Nearby
              </p>
              <p className="text-sm font-black leading-tight">
                4 Accessible Spots
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
  {
    id: "accessibility",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div className="w-18 h-18 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8" style={{ width: 72, height: 72 }}>
            <Accessibility size={34} className="text-white" />
          </div>
          <h3 className="text-4xl font-black tracking-tight text-white mb-5 leading-tight">
            Explore Accessibility Features
          </h3>
          <p className="text-white/75 text-lg leading-relaxed mb-8">
            Check wheelchair ramps, elevators, tactile paths, handrails, braille
            signage, quiet zones, and accessible entrances — all in one place.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {[
              "♿ Ramp",
              "🛗 Lift",
              "👁 Braille",
              "🔇 Quiet",
              "🚪 Entry",
              "🔊 Audio",
            ].map((chip) => (
              <span
                key={chip}
                className="text-sm font-bold bg-white/15 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-full"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-5">
          {[
            { label: "Wheelchair Ramps", count: "340+", icon: "♿" },
            { label: "Elevator Access", count: "180+", icon: "🛗" },
            { label: "Braille Signage", count: "95+", icon: "👁" },
            { label: "Quiet Zones", count: "120+", icon: "🔇" },
          ].map((item) => (
            <div
              key={item.label}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-3xl p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{item.icon}</span>
              <span className="text-3xl font-black text-white">
                {item.count}
              </span>
              <span className="text-sm text-white/60 font-semibold">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    itemClassName: "text-white overflow-hidden",
    style: { background: "linear-gradient(135deg, #7928CA 0%, #0070F3 100%)" },
  },
  {
    id: "trusted",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "#38BDF818", width: 72, height: 72 }}
          >
            <ShieldCheck size={34} style={{ color: "#38BDF8" }} />
          </div>
          <h3 className="text-4xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Trusted & Inclusive Platform
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Community-powered and built on transparency — giving everyone
            reliable information to move freely through the world.
          </p>
        </div>
        <div className="flex-1 grid grid-cols-3 gap-5">
          {[
            { val: "1200+", label: "Reviews", color: "#FF0080" },
            { val: "250+", label: "Places", color: "#7928CA" },
            { val: "40+", label: "Features", color: "#0070F3" },
          ].map(({ val, label, color }) => (
            <div
              key={label}
              className="flex flex-col items-center justify-center text-center rounded-3xl py-10 px-4"
              style={{ backgroundColor: `${color}0D` }}
            >
              <span
                className="text-5xl font-black leading-none"
                style={{ color }}
              >
                {val}
              </span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-3">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
  {
    id: "discover",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "#FF008018", width: 72, height: 72 }}
          >
            <MapPinned size={34} style={{ color: "#FF0080" }} />
          </div>
          <h3 className="text-4xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Discover Public Spaces
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Find parks, malls, transit hubs, and buildings with
            community-verified accessibility details. Never second-guess a venue
            again.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {[
            {
              label: "Parks & Recreation",
              places: "68 places",
              color: "#FF0080",
            },
            {
              label: "Shopping Centres",
              places: "45 places",
              color: "#7928CA",
            },
            {
              label: "Transit & Transport",
              places: "87 places",
              color: "#0070F3",
            },
            {
              label: "Public Buildings",
              places: "52 places",
              color: "#38BDF8",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-base font-semibold text-gray-800">
                  {item.label}
                </span>
              </div>
              <span
                className="text-sm font-bold px-4 py-1.5 rounded-full"
                style={{
                  backgroundColor: `${item.color}18`,
                  color: item.color,
                }}
              >
                {item.places}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
  {
    id: "reviews",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "#7928CA18", width: 72, height: 72 }}
          >
            <Star size={34} style={{ color: "#7928CA" }} />
          </div>
          <h3 className="text-4xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Share Accessibility Reviews
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Submit honest, experience-based reviews that help others navigate
            with confidence. Your voice makes every space more accessible.
          </p>
        </div>
        <div className="flex-1 flex flex-col gap-4">
          {[
            {
              name: "Ayesha M.",
              review: "Wheelchair ramp was easy to use!",
              stars: 5,
              tag: "Wheelchair ✓",
            },
            {
              name: "Ravi K.",
              review: "Elevator worked perfectly, great signage.",
              stars: 4,
              tag: "Elevator ✓",
            },
            {
              name: "Sophie L.",
              review: "Quiet area helped me focus — brilliant.",
              stars: 5,
              tag: "Quiet Zone ✓",
            },
          ].map((r) => (
            <div
              key={r.name}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7928CA] to-[#0070F3] flex items-center justify-center text-white text-sm font-black">
                    {r.name[0]}
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    {r.name}
                  </span>
                </div>
                <Stars rating={r.stars} />
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-3">
                "{r.review}"
              </p>
              <span
                className="text-xs font-bold px-3 py-1 rounded-full text-[#7928CA]"
                style={{ backgroundColor: "#7928CA18" }}
              >
                {r.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
  {
    id: "profile",
    content: (
      <div className="flex flex-col lg:flex-row gap-10 h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div
            className="rounded-2xl flex items-center justify-center mb-8"
            style={{ backgroundColor: "#0070F318", width: 72, height: 72 }}
          >
            <UserRound size={34} style={{ color: "#0070F3" }} />
          </div>
          <h3 className="text-4xl font-black tracking-tight text-gray-900 mb-5 leading-tight">
            Personalised Profiles
          </h3>
          <p className="text-gray-500 text-lg leading-relaxed">
            Track your contributions, manage reviews, and bookmark favourite
            accessible places. Build your accessibility journey in one place.
          </p>
        </div>
        <div className="flex-1 bg-gray-50 border border-gray-100 rounded-3xl p-8">
          <div className="flex items-center gap-4 mb-7 pb-6 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0070F3] to-[#7928CA] flex items-center justify-center text-white text-2xl font-black">
              A
            </div>
            <div>
              <p className="text-lg font-black text-gray-900">Alex Johnson</p>
              <p className="text-sm text-gray-400">Accessibility Advocate</p>
            </div>
            <span
              className="ml-auto text-xs font-bold px-3 py-1.5 rounded-full text-[#0070F3]"
              style={{ backgroundColor: "#0070F318" }}
            >
              Verified ✓
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { val: "24", label: "Reviews", color: "#0070F3" },
              { val: "11", label: "Bookmarks", color: "#7928CA" },
              { val: "8", label: "Places", color: "#FF0080" },
            ].map(({ val, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center rounded-2xl py-4"
                style={{ backgroundColor: `${color}0D` }}
              >
                <span className="text-2xl font-black" style={{ color }}>
                  {val}
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-400 font-semibold mb-3">
            Recent Activity
          </div>
          {[
            "Reviewed City Mall",
            "Bookmarked Central Park",
            "Added Metro Hub lift info",
          ].map((a) => (
            <div
              key={a}
              className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
            >
              <div className="w-2 h-2 rounded-full bg-[#0070F3]" />
              <span className="text-sm text-gray-600">{a}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    itemClassName: "bg-white border border-gray-100",
  },
];

/* ─────────────────────────────────────────────
   Section
───────────────────────────────────────────── */
export default function FeaturesBento() {
  return (
    <section className="relative w-full overflow-visible bg-white">
      {/* Background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[560px] w-[700px] rounded-full bg-gradient-to-br from-[#FF0080]/5 via-[#7928CA]/5 to-[#0070F3]/5 blur-3xl" />
      </div>

      {/* ScrollStack feature cards */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 pt-12 pb-32">
        <ScrollStack
          useWindowScroll={true}
          itemDistance={90}
          itemScale={0.0}
          itemStackDistance={0}
          stackPosition="20%"
          scaleEndPosition="10%"
          baseScale={1.05}
          rotationAmount={0}
          blurAmount={1}
        >
          {featureCards.map((card) => (
            <ScrollStackItem
              key={card.id}
              itemClassName={`min-h-[650px] ${card.itemClassName ?? ""}`}
              style={card.style}
            >
              {card.content}
            </ScrollStackItem>
          ))}
        </ScrollStack>
      </div>
    </section>
  );
}
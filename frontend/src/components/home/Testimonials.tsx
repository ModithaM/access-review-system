"use client";

import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow,
} from "@/components/ui/3d-scroll-trigger";
import { cn } from "@/lib/utils";

const testimonials = [
  {
    name: "Amara Nwosu",
    role: "Wheelchair User",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amara",
    text: "Accessify helped me find a fully accessible mall near me in minutes. The ramp and elevator details were spot on — saved me so much stress.",
  },
  {
    name: "Dilshan Perera",
    role: "Occupational Therapist",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dilshan",
    text: "I recommend Accessify to all my patients. The community reviews are honest and detailed — it's genuinely changed how my clients plan their outings.",
  },
  {
    name: "Sofia Mendes",
    role: "Visually Impaired Advocate",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia",
    text: "Finally a platform that cares about tactile paths and audio guidance. The detail in these reviews is something I've never seen anywhere else.",
  },
  {
    name: "James Okafor",
    role: "Parent of a Disabled Child",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James",
    text: "We used Accessify to plan a day out with our son. Every location we visited matched exactly what the reviews described. Incredibly reliable.",
  },
  {
    name: "Priya Sharma",
    role: "Urban Accessibility Researcher",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    text: "The map view combined with community data is a goldmine for my research. Accessify is doing what city councils should have done years ago.",
  },
  {
    name: "Lena Hoffmann",
    role: "Crutch User & Travel Blogger",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lena",
    text: "I document accessible travel across Europe and Accessify is my first stop before every trip. The accuracy and depth of reviews is unmatched.",
  },
  {
    name: "Carlos Reyes",
    role: "Deaf Community Organizer",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
    text: "Accessify doesn't just focus on mobility — the visual accessibility notes are incredibly helpful for our community. Truly inclusive design.",
  },
  {
    name: "Yuki Tanaka",
    role: "Elderly Care Coordinator",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki",
    text: "My elderly clients rely on Accessify to find safe, comfortable public spaces. The handrail and seating details make a huge difference for them.",
  },
  {
    name: "Marcus Bell",
    role: "Blind Commuter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    text: "Accessify has completely transformed how I navigate the city. The audio cue details and tactile paving info are things no other app even thinks about.",
  },
  {
    name: "Nadia Osei",
    role: "Sign Language Interpreter",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia",
    text: "I use Accessify to scout venues before my clients arrive. Knowing which spaces have induction loops or visual alerts saves us so much time.",
  },
  {
    name: "Tom Eriksson",
    role: "Adaptive Sports Coach",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tom",
    text: "Planning accessible routes for our team used to take hours. With Accessify it takes minutes. The facility details are accurate and always up to date.",
  },
  {
    name: "Fatima Al-Rashid",
    role: "Chronic Pain Advocate",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima",
    text: "Rest areas and seating availability matter so much when you have chronic pain. Accessify is the only platform that actually lists these details.",
  },
];

const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4, 8);
const row3 = testimonials.slice(8, 12);

function TestimonialCard({
  name,
  role,
  avatar,
  text,
}: (typeof testimonials)[0]) {
  return (
    <figure
      className={cn(
        "mx-3 shrink-0 w-[22vw] rounded-[34px] border",
        "bg-[#f3f3f5] border-[#dedee3]",
        "px-8 py-8 flex flex-col h-auto"
      )}
    >
      {/* Avatar + Name/Role row */}
      <div className="flex flex-row items-start gap-4">
        {/* Avatar */}
        <div className="shrink-0">
          <img
            src={avatar}
            alt={name}
            className="h-[50px] w-[50px] rounded-full object-cover"
          />
        </div>

        {/* Name & Role */}
        <div className="flex flex-col min-w-0">
          <figcaption
            className="font-bold text-[#1f2430]"
            style={{ fontSize: "1.5vw", lineHeight: "1.1" }}
          >
            {name}
          </figcaption>

          <p className="mt-1 font-medium text-[#7a808c]" style={{ fontSize: "0.85vw" }}>
            {role}
          </p>
        </div>
      </div>

      {/* Body text — full width below the row */}
      <p
        className="mt-4 leading-[1.7] font-medium text-[#111111] break-words whitespace-normal overflow-hidden"
        style={{ fontSize: "0.85vw" }}
      >
        {text}
      </p>
    </figure>
  );
}

export default function Testimonials() {
  return (
    <section className="relative w-full overflow-hidden py-24">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(121,40,202,0.08) 0%, transparent 70%)",
        }}
      />

      {/* Heading */}
      <div className="mb-16 px-6 text-center">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-white/35">
          Real stories
        </p>

        <h2 className="text-[clamp(2rem,5vw,4rem)] font-black uppercase leading-none tracking-tight text-white">
          Trusted by the{" "}
          <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            Community
          </span>
        </h2>
      </div>

      {/* Slider */}
      <ThreeDScrollTriggerContainer className="flex flex-col gap-6">
        <ThreeDScrollTriggerRow baseVelocity={3} direction={1}>
          {row1.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </ThreeDScrollTriggerRow>

        <ThreeDScrollTriggerRow baseVelocity={3} direction={-1}>
          {row2.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </ThreeDScrollTriggerRow>

        <ThreeDScrollTriggerRow baseVelocity={3} direction={1}>
          {row3.map((item) => (
            <TestimonialCard key={item.name} {...item} />
          ))}
        </ThreeDScrollTriggerRow>
      </ThreeDScrollTriggerContainer>

      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-background to-transparent" />
    </section>
  );
}
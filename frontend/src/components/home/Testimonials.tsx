'use client';

import {
  ThreeDScrollTriggerContainer,
  ThreeDScrollTriggerRow,
} from '@/components/ui/3d-scroll-trigger';
import { cn } from '@/lib/utils';
import { Star, Quote } from 'lucide-react';

/* ─────────────────────────────────────────
   Data
───────────────────────────────────────── */
const testimonials = [
  {
    name: 'Amara Nwosu',
    role: 'Wheelchair User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amara',
    text: 'Accessify helped me find a fully accessible mall near me in minutes. The ramp and elevator details were spot on — saved me so much stress.',
    rating: 5,
  },
  {
    name: 'Dilshan Perera',
    role: 'Occupational Therapist',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dilshan',
    text: "I recommend Accessify to all my patients. The community reviews are honest and detailed — it's genuinely changed how my clients plan their outings.",
    rating: 5,
  },
  {
    name: 'Sofia Mendes',
    role: 'Visually Impaired Advocate',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia',
    text: "Finally a platform that cares about tactile paths and audio guidance. The detail in these reviews is something I've never seen anywhere else.",
    rating: 5,
  },
  {
    name: 'James Okafor',
    role: 'Parent of a Disabled Child',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    text: 'We used Accessify to plan a day out with our son. Every location we visited matched exactly what the reviews described. Incredibly reliable.',
    rating: 5,
  },
  {
    name: 'Priya Sharma',
    role: 'Urban Accessibility Researcher',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    text: 'The map view combined with community data is a goldmine for my research. Accessify is doing what city councils should have done years ago.',
    rating: 5,
  },
  {
    name: 'Lena Hoffmann',
    role: 'Crutch User & Travel Blogger',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lena',
    text: 'I document accessible travel across Europe and Accessify is my first stop before every trip. The accuracy and depth of reviews is unmatched.',
    rating: 5,
  },
  {
    name: 'Carlos Reyes',
    role: 'Deaf Community Organizer',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos',
    text: "Accessify doesn't just focus on mobility — the visual accessibility notes are incredibly helpful for our community. Truly inclusive design.",
    rating: 5,
  },
  {
    name: 'Yuki Tanaka',
    role: 'Elderly Care Coordinator',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yuki',
    text: 'My elderly clients rely on Accessify to find safe, comfortable public spaces. The handrail and seating details make a huge difference for them.',
    rating: 5,
  },
  {
    name: 'Marcus Bell',
    role: 'Blind Commuter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    text: 'Accessify has completely transformed how I navigate the city. The audio cue details and tactile paving info are things no other app even thinks about.',
    rating: 5,
  },
  {
    name: 'Nadia Osei',
    role: 'Sign Language Interpreter',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nadia',
    text: 'I use Accessify to scout venues before my clients arrive. Knowing which spaces have induction loops or visual alerts saves us so much time.',
    rating: 5,
  },
  {
    name: 'Tom Eriksson',
    role: 'Adaptive Sports Coach',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom',
    text: 'Planning accessible routes for our team used to take hours. With Accessify it takes minutes. The facility details are accurate and always up to date.',
    rating: 4,
  },
  {
    name: 'Fatima Al-Rashid',
    role: 'Chronic Pain Advocate',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatima',
    text: 'Rest areas and seating availability matter so much when you have chronic pain. Accessify is the only platform that actually lists these details.',
    rating: 5,
  },
];

const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4, 8);
const row3 = testimonials.slice(8, 12);

/* ─────────────────────────────────────────
   Stars component
───────────────────────────────────────── */
function Stars({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'w-3.5 h-3.5',
            i < rating
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200 dark:fill-slate-700 dark:text-slate-700',
          )}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Section Heading
───────────────────────────────────────── */
function SectionHeading() {
  return (
    <div className="mb-20 px-6 text-center">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.4em] text-gray-400 dark:text-slate-400">
        Real stories
      </p>
      <h2 className="text-[clamp(2rem,5vw,4rem)] font-black uppercase leading-none tracking-tight text-gray-900 dark:text-white">
        Trusted by the{' '}
        <span
          className="bg-clip-text text-transparent"
          style={{
            backgroundImage: 'linear-gradient(90deg, #FF0080, #7928CA, #0070F3, #38bdf8)',
          }}
        >
          Community
        </span>
      </h2>
      <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-500 dark:text-slate-300">
        Thousands of people with disabilities rely on Accessify every day to navigate the world with
        confidence and ease.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────
   Testimonial Card
───────────────────────────────────────── */
function TestimonialCard({ name, role, avatar, text, rating }: (typeof testimonials)[0]) {
  return (
    <figure
      className={cn(
        'group relative mx-4 shrink-0 w-[22vw] min-w-[260px] max-w-[360px]',
        'rounded-[2.5rem] border border-gray-200 bg-white dark:border-white/10 dark:bg-slate-900/80',
        'shadow-sm hover:shadow-xl',
        'p-8 flex flex-col overflow-hidden',
        'transition-all duration-300 ease-out',
        'hover:-translate-y-1',
      )}
    >
      {/* Hover glow overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(121,40,202,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Decorative quote icon */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-[-8%] top-1/2 -translate-y-1/2 opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-300"
      >
        <Quote className="w-28 h-28 text-purple-500 dark:text-purple-300" />
      </div>

      {/* Top row: avatar + name/role */}
      <div className="relative flex items-center gap-3.5">
        {/* Avatar */}
        <div className="shrink-0 rounded-full ring-2 overflow-hidden">
          <img
            src={avatar}
            alt={name}
            width={48}
            height={48}
            className="h-12 w-12 rounded-full object-cover"
          />
        </div>

        {/* Name & Role */}
        <div className="flex flex-col min-w-0">
          <figcaption className="truncate text-lg font-black leading-tight text-gray-900 dark:text-white">
            {name}
          </figcaption>
          <p className="mt-0.5 truncate text-xs font-medium text-gray-400 dark:text-slate-400">
            {role}
          </p>
        </div>
      </div>

      {/* Stars */}
      <div className="relative mt-4">
        <Stars rating={rating} />
      </div>

      {/* Review text */}
      <p className="relative mt-4 break-words whitespace-normal text-sm leading-relaxed text-gray-600 dark:text-slate-300">
        {text}
      </p>
    </figure>
  );
}

/* ─────────────────────────────────────────
   Main Section
───────────────────────────────────────── */
export default function Testimonials() {
  return (
    <section className="relative w-full overflow-hidden bg-white py-32 transition-colors duration-300 dark:bg-slate-950">
      {/* Background glow blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/4 h-[600px] w-[600px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(255,0,128,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-16 right-1/4 h-[500px] w-[500px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full blur-3xl"
        style={{
          background: 'radial-gradient(ellipse, rgba(121,40,202,0.06) 0%, transparent 70%)',
        }}
      />

      {/* Heading */}
      <SectionHeading />

      {/* Scroll rows */}
      <ThreeDScrollTriggerContainer className="flex flex-col gap-8">
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

      {/* Edge fades — matched to white bg */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-1/4 bg-gradient-to-r from-white to-transparent dark:from-slate-950" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-1/4 bg-gradient-to-l from-white to-transparent dark:from-slate-950" />

      {/* Bottom gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-white to-transparent dark:from-slate-950"
      />
    </section>
  );
}

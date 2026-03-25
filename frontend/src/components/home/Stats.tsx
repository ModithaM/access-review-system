"use client";
import { CountUp } from "@/components/ui/count-up";
import { AuroraBackground } from "@/components/shared/AuroraBackground";

const stats = [
  { label: "Locations", value: 2400, suffix: "+" },
  { label: "Reviews", value: 7500, suffix: "+" },
  { label: "Cities", value: 45, suffix: "+" },
  { label: "Satisfaction", value: 98, suffix: "%" },
];

export default function Stats() {
  return (
    <AuroraBackground className="w-9/10 py-24 flex items-center justify-center mx-auto rounded-[40px]">
      <div className="w-full max-w-6xl px-8">
        <div className="flex flex-wrap items-center justify-center gap-0">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="relative flex flex-col justify-between px-10 py-10 group"
            >
              <p style={{ fontSize: "2vw" }} className="font-semibold leading-snug text-white">
                {stat.label}
              </p>

              <div className="mt-6">
                <CountUp
                  value={stat.value}
                  suffix={stat.suffix}
                  duration={4}
                  animationStyle="gentle"
                  triggerOnView={true}
                  className="text-[5vw] text-gray-200 !leading-none tracking-tight"
                  numberClassName="text-gray-200"
                />
              </div>

              <div className="absolute bottom-0 left-0 h-px w-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 transition-all duration-500 group-hover:w-full" />
            </div>
          ))}
        </div>
      </div>
    </AuroraBackground>
  );
}
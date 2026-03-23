import { AuroraBackground } from "@/components/shared/AuroraBackground";

export function AccessifyMarquee() {
  const items = Array(10).fill("Accessify");

  return (
    <AuroraBackground className="w-full py-8">
      <div className="relative w-full overflow-hidden">
        <div
          className="flex w-max"
          style={{ animation: "marquee 18s linear infinite" }}
        >
          {[...items, ...items].map((_, i) => (
            <span
              key={i}
              className="flex items-center gap-6 px-12 text-2xl font-medium"
              style={{ color: "#ffffff" }}
            >
              Accessify
              <span
                className="h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: "#ffffff" }}
              />
            </span>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-transparent" />

        <style>{`
          @keyframes marquee {
            0%   { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
      </div>
    </AuroraBackground>
  );
}

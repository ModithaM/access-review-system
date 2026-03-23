import ScrollReveal from "@/components/ui/ScrollReveal";

export function About() {
  return (
    <section className="flex w-full min-h-dvh items-center justify-center px-0 py-0">
      <div className="flex flex-col items-center justify-center gap-16 text-center">
        <div className="w-full">
          <h2 className="text-[clamp(2.2rem,7vw,5.5rem)] font-black tracking-tight bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] bg-clip-text text-transparent">
            WHAT IS THIS ACCESSIFY?
          </h2>

          <div className="mt-10 w-full max-w-6xl mx-auto">
            <ScrollReveal
              containerClassName="w-full"
              textClassName="text-gray-700 w-full text-center leading-loose"
              baseRotation={0}
            >
              Our platform is designed to bridge the accessibility gap in public spaces by empowering users to share real experiences. Whether it's a park, shopping mall, or transport hub, we help identify accessibility features such as ramps, elevators, braille signage, and more.
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

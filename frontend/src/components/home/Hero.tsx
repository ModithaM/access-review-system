import { AuroraText } from '@/components/shared/AuroraText'
import { Globe } from '@/components/shared/Globe'

export function Hero() {
  return (
    <section
      className="relative flex min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-white px-4 pt-24 sm:pt-28 md:pt-32"
      aria-labelledby="hero-heading"
    >
      {/* ── Decorative background blobs ── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-[#7928CA]/10 blur-3xl" />
        <div className="absolute top-32 -left-32 h-80 w-80 rounded-full bg-[#0070F3]/10 blur-3xl" />
        <div className="absolute top-48 -right-32 h-80 w-80 rounded-full bg-[#FF0080]/8 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-72 w-[700px] -translate-x-1/2 rounded-full bg-[#38BDF8]/12 blur-3xl" />
      </div>

      {/* ── Globe in background ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center"
        style={{ top: '10vw' }}
      >
        {/* Glow behind globe */}
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-[#FF0080]/10 via-[#7928CA]/15 to-[#0070F3]/10 blur-3xl" />
        <Globe className="w-full max-w-4xl opacity-60 sm:opacity-70 md:opacity-80" />
      </div>

      {/* ── Radial overlay to keep text readable over the globe ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_70%_at_50%_50%,rgba(255,255,255,0.85)_0%,rgba(255,255,255,0.6)_50%,transparent_100%)]"
      />

      {/* ── Main content (above globe) ── */}
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-6 text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#7928CA]/20 bg-white/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-gradient-to-r from-[#FF0080] to-[#7928CA]"
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-[#7928CA]">
            Accessibility Review Platform
          </span>
        </div>

        {/* Heading */}
        <h1
          id="hero-heading"
          className="text-[5vw] font-bold leading-[1.15] tracking-tight text-gray-900"
        >
          {/* Mobile: "Making" alone */}
          <span className="block sm:hidden">Making</span>

          {/* Desktop: "Making Public Spaces Accessible" on one line */}
          <span className="hidden sm:inline">Making </span>

          <span className="bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] bg-clip-text text-transparent block sm:inline">
            Public Spaces
          </span>

          {/* Mobile line break after "Public Spaces" */}
          <span className="block sm:inline"> Accessible</span>

          {/* Desktop line break before "for Everyone" */}
          <br className="hidden sm:block" />

          <span className="block sm:inline"> for </span>

          <AuroraText>Everyone</AuroraText>
        </h1>

        {/* Subtitle */}
        <p className="max-w-lg text-base leading-relaxed text-gray-500 sm:text-lg">
          Discover, review, and improve accessibility in public spaces.{' '}
          <strong className="font-semibold text-gray-700">Your voice</strong>{' '}
          helps build a more inclusive world.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
          <button
            type="button"
            className="rounded-2xl bg-gradient-to-r from-[#FF0080] via-[#7928CA] to-[#0070F3] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#7928CA]/20 transition-all duration-200 hover:scale-[1.03] hover:shadow-xl hover:shadow-[#7928CA]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA] focus-visible:ring-offset-2"
          >
            Explore Spaces
          </button>
          <button
            type="button"
            className="rounded-2xl border border-gray-200 bg-white/80 px-8 py-3.5 text-sm font-semibold text-gray-600 shadow-sm backdrop-blur-sm transition-all duration-200 hover:border-[#7928CA]/30 hover:bg-[#7928CA]/5 hover:text-[#7928CA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7928CA] focus-visible:ring-offset-2"
          >
            Write a Review
          </button>
        </div>

        {/* Trust signal */}
        <p className="text-xs text-gray-400">
          Trusted by communities across{' '}
          <span className="font-medium text-gray-500">50+ countries</span>
        </p>
      </div>

      {/* ── Bottom fade ── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/60 to-transparent"
      />
    </section>
  )
}
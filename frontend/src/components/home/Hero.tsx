import { AuroraText } from '@/components/shared/AuroraText'
import { Globe } from '@/components/shared/Globe'

export function Hero() {
  return (
    <div className="relative flex h-dvh min-h-dvh w-full flex-col items-center justify-center overflow-hidden bg-white px-4 pt-20 sm:pt-24 md:pt-28">
      <span className="z-1 pointer-events-none bg-linear-to-b from-black to-gray-300/80 bg-clip-text text-center text-[8vw] leading-none font-semibold -mt-19 whitespace-pre-wrap text-transparent dark:from-white dark:to-slate-900/10">
        Making Public Spaces Accessible for Everyone
      </span>
      <AuroraText className="pointer-events-none relative z-10 w-full top-20 text-center text-sm font-bold tracking-tighter text-balance text-neutral-900 md:text-5xl lg:text-[2vw] dark:text-neutral-100">
        Discover, review, and improve accessibility in public spaces. <br />
        Your voice helps build a more inclusive world.
      </AuroraText>
      <Globe className="z-0 top-10 h-75%" />
      <div className="pointer-events-none absolute inset-0 z-1 h-full bg-[radial-gradient(circle_at_50%_200%,rgba(0,0,0,0.2),rgba(255,255,255,0))] dark:bg-[radial-gradient(circle_at_50%_200%,rgba(255,255,255,0.15),rgba(0,0,0,0))]" />
    </div>
  )
}


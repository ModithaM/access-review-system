import { useEffect, useRef } from 'react'
import createGlobe, { type COBEOptions } from 'cobe'
import { useMotionValue, useSpring } from 'motion/react'

import { cn } from '@/lib/utils'

const MOVEMENT_DAMPING = 1400

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.35,
  mapSamples: 16000,
  mapBrightness: 1.1,
  baseColor: [0.96, 0.95, 1.0],          // soft lavender-white base
  markerColor: [255 / 255, 0 / 255, 128 / 255], // #FF0080 brand pink
  glowColor: [0.82, 0.78, 1.0],           // soft purple glow to match #7928CA
  devicePixelRatio: 2,
  markers: [
    // Major accessibility-relevant cities around the world
    { location: [14.5995, 120.9842], size: 0.04 },   // Manila
    { location: [19.076, 72.8777], size: 0.08 },     // Mumbai
    { location: [23.8103, 90.4125], size: 0.05 },    // Dhaka
    { location: [30.0444, 31.2357], size: 0.06 },    // Cairo
    { location: [39.9042, 116.4074], size: 0.08 },   // Beijing
    { location: [-23.5505, -46.6333], size: 0.09 },  // São Paulo
    { location: [19.4326, -99.1332], size: 0.08 },   // Mexico City
    { location: [40.7128, -74.006], size: 0.09 },    // New York
    { location: [34.6937, 135.5022], size: 0.05 },   // Osaka
    { location: [41.0082, 28.9784], size: 0.06 },    // Istanbul
    { location: [51.5074, -0.1278], size: 0.07 },    // London
    { location: [48.8566, 2.3522], size: 0.06 },     // Paris
    { location: [-33.8688, 151.2093], size: 0.05 },  // Sydney
    { location: [37.7749, -122.4194], size: 0.07 },  // San Francisco
    { location: [52.52, 13.405], size: 0.05 },       // Berlin
    { location: [1.3521, 103.8198], size: 0.05 },    // Singapore
  ],
}

export function Globe({
  className,
  config,
}: {
  className?: string
  config?: Partial<COBEOptions>
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const phiRef = useRef(0)
  const widthRef = useRef(0)
  const pointerInteracting = useRef<number | null>(null)

  const r = useMotionValue(0)
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  })

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? 'grabbing' : 'grab'
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteracting.current = clientX
      r.set(r.get() + delta / MOVEMENT_DAMPING)
    }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const onResize = () => {
      widthRef.current = canvas.offsetWidth
    }

    window.addEventListener('resize', onResize)
    onResize()

    const merged: COBEOptions = { ...GLOBE_CONFIG, ...config }
    const w = widthRef.current
    const globe = createGlobe(canvas, {
      ...merged,
      width: w * 2,
      height: w * 2,
    })

    let raf = 0
    const tick = () => {
      if (pointerInteracting.current === null) phiRef.current += 0.005
      globe.update({
        phi: phiRef.current + rs.get(),
        width: widthRef.current * 2,
        height: widthRef.current * 2,
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    requestAnimationFrame(() => {
      canvas.style.opacity = '1'
    })

    return () => {
      cancelAnimationFrame(raf)
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [rs, config])

  return (
    <div
      className={cn(
        'relative mx-auto aspect-square w-full max-w-[800px]',
        className,
      )}
    >
      {/* Soft brand-colored glow behind the globe */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-2/3 w-2/3 rounded-full bg-[radial-gradient(circle,rgba(121,40,202,0.14)_0%,rgba(0,112,243,0.10)_45%,transparent_70%)] blur-3xl" />
      </div>

      <canvas
        className="relative size-full cursor-grab opacity-0 transition-opacity duration-700"
        ref={canvasRef}
        onPointerDown={(e) => updatePointerInteraction(e.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
        aria-label="Interactive globe showing accessibility-reviewed public spaces worldwide"
        role="img"
      />
    </div>
  )
}
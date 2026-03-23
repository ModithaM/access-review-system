// components/ui/aurora-background.tsx

import { memo, type CSSProperties, type ReactNode } from 'react'

export interface AuroraBackgroundProps {
  children?: ReactNode
  className?: string
  colors?: string[]
  speed?: number
  blur?: number
}

export const AuroraBackground = memo(
  ({
    children,
    className = '',
    colors = ['#FF0080', '#7928CA', '#0070F3'],
    speed = 1,
    blur = 40,
  }: AuroraBackgroundProps) => {
    const gradientStyle: CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
      backgroundSize: '300% 300%',
      filter: `blur(${blur}px)`,
      position: 'absolute',
      inset: '-100%',
      opacity: 0.9,
      animation: `aurora ${10 / speed}s linear infinite`,
    }

    const overlayStyle: CSSProperties = {
      backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
      backgroundSize: '300% 300%',
      position: 'absolute',
      inset: 0,
      opacity: 0.3,
      animation: `aurora ${10 / speed}s linear infinite`,
      mixBlendMode: 'screen',
    }

    return (
      <div className={`relative overflow-hidden ${className}`}>
        <style>{`
          @keyframes aurora {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>

        {/* Base blurred aurora layer */}
        <div style={gradientStyle} aria-hidden={true} />

        {/* Sharp overlay layer to boost color intensity */}
        <div style={overlayStyle} aria-hidden={true} />

        {children && (
          <div style={{ position: 'relative', zIndex: 10 }}>
            {children}
          </div>
        )}
      </div>
    )
  },
)

AuroraBackground.displayName = 'AuroraBackground'
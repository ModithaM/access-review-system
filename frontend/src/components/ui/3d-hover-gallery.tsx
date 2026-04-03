'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

type GalleryIcon = React.ElementType;

export type ThreeDHoverGalleryItem = {
  title: string;
  desc: string;
  icon: GalleryIcon;
  accentHex?: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace(/^#/, '');

  if (cleaned.length === 3) {
    const r = parseInt(cleaned[0] + cleaned[0], 16);
    const g = parseInt(cleaned[1] + cleaned[1], 16);
    const b = parseInt(cleaned[2] + cleaned[2], 16);
    return { r, g, b };
  }

  if (cleaned.length !== 6) return null;

  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
  return { r, g, b };
}

function rgba(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return `rgba(121,40,202,${alpha})`;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export type ThreeDHoverGalleryProps = {
  items: ThreeDHoverGalleryItem[];
  defaultActiveIndex?: number;
  itemWidthVw?: number;
  itemActiveWidthVw?: number;
  itemHeightVw?: number;
  itemGapVw?: number;
  perspectivePx?: number;
  hoverTranslateZpx?: number;
  hoverScale?: number;
  transitionDurationMs?: number;
  enableKeyboardNavigation?: boolean;
  autoPlay?: boolean;
  autoPlayDelayMs?: number;
  className?: string;
  style?: React.CSSProperties;
};

function TiltWrapper({
  children,
  active,
  translateZpx,
  hoverScale,
  transitionDurationMs,
}: {
  children: React.ReactNode;
  active?: boolean;
  translateZpx: number;
  hoverScale: number;
  transitionDurationMs: number;
}) {
  const [tilt, setTilt] = React.useState({ rx: 0, ry: 0 });

  return (
    <div
      className="transform-gpu [transform-style:preserve-3d] h-full w-full"
      onMouseMove={(e) => {
        const target = e.currentTarget;
        const rect = target.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const ry = (px - 0.5) * 10;
        const rx = (0.5 - py) * 10;
        setTilt({ rx, ry });
      }}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateZ(${
          active ? translateZpx : 0
        }px) scale(${active ? hoverScale : 1})`,
        transition: `transform ${transitionDurationMs}ms cubic-bezier(.2, .9, .2, 1)`,
      }}
    >
      {children}
    </div>
  );
}

export default function ThreeDHoverGallery({
  items,
  defaultActiveIndex = 0,
  itemWidthVw = 4,
  itemActiveWidthVw = 10,
  itemHeightVw = 10,
  itemGapVw = 0.9,
  perspectivePx = 1000,
  hoverTranslateZpx = 50,
  hoverScale = 1.03,
  transitionDurationMs = 650,
  enableKeyboardNavigation = true,
  autoPlay = false,
  autoPlayDelayMs = 3000,
  className,
  style,
}: ThreeDHoverGalleryProps) {
  const safeDefaultIndex = useMemo(
    () => Math.min(Math.max(defaultActiveIndex, 0), Math.max(items.length - 1, 0)),
    [defaultActiveIndex, items.length],
  );

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<number | null>(null);

  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);
  const [, setActiveIndex] = useState<number>(safeDefaultIndex);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  // Initialize hoverIndex to safeDefaultIndex so first card is expanded by default
  const [hoverIndex, setHoverIndex] = useState<number | null>(safeDefaultIndex);

  const shouldShowDetails = (index: number) => pinnedIndex === index || hoverIndex === index;

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const vwToPx = (vw: number) => (vw / 100) * viewportWidth;
  const inactiveWidthPx = vwToPx(itemWidthVw);
  const activeWidthPx = vwToPx(itemActiveWidthVw);
  const cardHeightPx = vwToPx(itemHeightVw);
  const gapPx = vwToPx(itemGapVw);

  const totalRowWidthPx = items.length * inactiveWidthPx + (items.length - 1) * gapPx;
  const overlayMode = totalRowWidthPx > viewportWidth * 0.98;
  const rowStartPx = (viewportWidth - totalRowWidthPx) / 2;

  useEffect(() => {
    if (!autoPlay || items.length <= 1) return;

    if (autoPlayRef.current) {
      window.clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    autoPlayRef.current = window.setInterval(() => {
      setPinnedIndex(null);
      setActiveIndex((prev) => {
        const next = (prev + 1) % items.length;
        setHoverIndex(next);
        return next;
      });
    }, autoPlayDelayMs);

    return () => {
      if (autoPlayRef.current) {
        window.clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [autoPlay, autoPlayDelayMs, items.length]);

  const getItemStyle = (index: number): React.CSSProperties => {
    const isFocused = focusedIndex === index;
    const isExpanded = shouldShowDetails(index);

    const widthPx = isExpanded ? activeWidthPx : inactiveWidthPx;

    const base: React.CSSProperties = {
      width: widthPx,
      height: cardHeightPx,
      zIndex: isExpanded ? 50 : 1,
      transition: `width ${transitionDurationMs}ms cubic-bezier(.2, .9, .2, 1)`,
      willChange: 'width',
      outline: isFocused ? '2px solid rgba(56,189,248,0.9)' : 'none',
      outlineOffset: isFocused ? 3 : undefined,
      borderRadius: 24,
      top: 0,
      left: 0,
    };

    if (overlayMode) {
      return {
        ...base,
        position: 'absolute',
        left: rowStartPx + index * (inactiveWidthPx + gapPx),
      };
    }

    return {
      ...base,
      position: 'relative',
    };
  };

  const handlePinToggle = (index: number) => {
    if (autoPlay) return;

    setPinnedIndex((prev) => {
      const nextPinned = prev === index ? null : index;
      if (nextPinned === null) {
        setActiveIndex(safeDefaultIndex);
        setHoverIndex(safeDefaultIndex); // revert to default hovered card
      } else {
        setActiveIndex(nextPinned);
        setHoverIndex(null);
      }
      return nextPinned;
    });
  };

  const handleArrowNav = (fromIndex: number, direction: -1 | 1) => {
    if (!enableKeyboardNavigation) return;
    const container = containerRef.current;
    if (!container) return;

    const maxIndex = items.length - 1;
    const nextIndex =
      direction === -1
        ? fromIndex > 0
          ? fromIndex - 1
          : maxIndex
        : fromIndex < maxIndex
          ? fromIndex + 1
          : 0;

    const nextEl = container.children.item(nextIndex) as HTMLElement | null;
    nextEl?.focus?.();
  };

  return (
    <div
      className={cn('w-full', className)}
      style={{ ...style, overflow: overlayMode ? 'visible' : 'hidden' }}
    >
      <div
        ref={containerRef}
        className={cn(
          'relative items-stretch py-2',
          overlayMode ? '' : 'flex justify-center overflow-x-auto px-2',
        )}
        style={{
          perspective: `${perspectivePx}px`,
          gap: `${gapPx}px`,
          minHeight: cardHeightPx,
        }}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          const isPinned = pinnedIndex === index;
          const showDetails = shouldShowDetails(index);
          const accentHex = item.accentHex ?? '#7928CA';

          return (
            <button
              key={item.title}
              type="button"
              className="group relative shrink-0 text-left"
              style={getItemStyle(index)}
              tabIndex={enableKeyboardNavigation ? 0 : -1}
              aria-pressed={showDetails}
              onClick={() => handlePinToggle(index)}
              onFocus={() => {
                setFocusedIndex(index);
                if (pinnedIndex === null) setHoverIndex(index);
              }}
              onBlur={() => {
                setFocusedIndex(null);
                if (pinnedIndex === null) setHoverIndex(safeDefaultIndex); // revert to default on blur
              }}
              onMouseEnter={() => {
                if (autoPlay) return;
                if (pinnedIndex !== null) return;
                setActiveIndex(index);
                setHoverIndex(index);
              }}
              onMouseLeave={() => {
                if (autoPlay) return;
                if (pinnedIndex !== null) return;
                setActiveIndex(safeDefaultIndex);
                setHoverIndex(safeDefaultIndex); // revert to default card on mouse leave
              }}
              onKeyDown={(e) => {
                if (!enableKeyboardNavigation) return;
                switch (e.key) {
                  case 'Enter':
                  case ' ':
                    e.preventDefault();
                    handlePinToggle(index);
                    break;
                  case 'ArrowLeft':
                    e.preventDefault();
                    handleArrowNav(index, -1);
                    break;
                  case 'ArrowRight':
                    e.preventDefault();
                    handleArrowNav(index, 1);
                    break;
                }
              }}
            >
              <TiltWrapper
                active={showDetails}
                translateZpx={hoverTranslateZpx}
                hoverScale={hoverScale}
                transitionDurationMs={transitionDurationMs}
              >
                <div
                  className="h-full overflow-hidden rounded-3xl transition-colors"
                  style={{
                    backgroundColor: rgba(accentHex, showDetails ? 1 : 0.28),
                  }}
                >
                  <div
                    className="flex h-full flex-col items-center"
                    style={{
                      justifyContent: showDetails ? 'flex-start' : 'center',
                      padding: showDetails ? `${vwToPx(1.2)}px ${vwToPx(0.9)}px` : 0,
                    }}
                  >
                    <div
                      style={{
                        width: vwToPx(itemWidthVw),
                        height: vwToPx(itemWidthVw),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon
                        style={{
                          width: vwToPx(2.2),
                          height: vwToPx(2.2),
                          color: '#ffffff',
                        }}
                      />
                    </div>

                    <div
                      className="w-full overflow-hidden transition-[max-height,opacity]"
                      style={{
                        transitionDuration: `${transitionDurationMs}ms`,
                        transitionTimingFunction: 'cubic-bezier(.2, .9, .2, 1)',
                        maxHeight: showDetails ? `${cardHeightPx}px` : '0px',
                        opacity: showDetails ? 1 : 0,
                      }}
                    >
                      <div style={{ textAlign: 'center' }}>
                        <h3
                          style={{
                            fontSize: vwToPx(5),
                            lineHeight: 1.05,
                            color: '#ffffff',
                            fontWeight: 800,
                            letterSpacing: '-0.01em',
                            marginBottom: vwToPx(2),
                          }}
                        >
                          {item.title}
                        </h3>
                        <p
                          style={{
                            fontSize: vwToPx(2),
                            lineHeight: 1.4,
                            color: 'rgba(255,255,255,0.95)',
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 3,
                            overflow: 'hidden',
                          }}
                        >
                          {item.desc}
                        </p>
                        <div
                          style={{
                            marginTop: vwToPx(1),
                            fontSize: vwToPx(1.4),
                            color: 'rgba(255,255,255,0.9)',
                          }}
                        >
                          {isPinned ? 'Click to collapse' : 'Click to pin'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltWrapper>
            </button>
          );
        })}
      </div>
    </div>
  );
}

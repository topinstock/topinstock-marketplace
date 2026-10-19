'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Heart, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  title: string;
  discountPercentage?: number | null;
}

export default function ProductGallery({
  images = [],
  title,
  discountPercentage,
}: ProductGalleryProps) {
  const displayImages = images.length > 0 ? images : ['/images/product_laptop.jpg'];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  }

  function handleNext() {
    setSelectedIndex((prev) => (prev + 1) % displayImages.length);
  }

  function handlePrev() {
    setSelectedIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  }

  // ── Touch swipe support for mobile ──
  function handleTouchStart(e: React.TouchEvent) {
    setTouchStartX(e.touches[0].clientX);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext(); // swiped left -> next
      } else {
        handlePrev(); // swiped right -> prev
      }
    }
    setTouchStartX(null);
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* ── Desktop Thumbnail Strip (Left) ── */}
      {displayImages.length > 1 && (
        <div className="hidden md:flex flex-col gap-2.5 w-20 flex-shrink-0">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedIndex(idx)}
              className={cn(
                'relative aspect-square w-full rounded-xl overflow-hidden border-2 transition-all cursor-pointer bg-white p-1 flex items-center justify-center',
                selectedIndex === idx
                  ? 'border-orange-500 ring-2 ring-orange-500/20 shadow-sm'
                  : 'border-gray-200 hover:border-gray-400 opacity-80 hover:opacity-100'
              )}
            >
              <Image
                src={img}
                alt={`${title} - Imagine ${idx + 1}`}
                fill
                loading="lazy"
                sizes="80px"
                className="object-contain object-center"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Main High-Resolution Image Container ── */}
      <div className="flex-1 relative">
        <div
          className="relative aspect-square w-full rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xs cursor-crosshair group touch-pan-y p-6 sm:p-8 flex items-center justify-center"
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Image (LCP Element - eMAG Standard) */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={displayImages[selectedIndex]}
              alt={`${title} - Imagine ${selectedIndex + 1}`}
              fill
              priority
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, 50vw"
              className={cn(
                'object-contain object-center transition-transform duration-300 ease-out',
                isZoomed ? 'scale-150 origin-center' : 'scale-100'
              )}
              style={
                isZoomed
                  ? {
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }
                  : undefined
              }
            />
          </div>



          {/* Wishlist Button */}
          <button
            type="button"
            onClick={() => setIsWishlisted((prev) => !prev)}
            aria-label={isWishlisted ? 'Elimină din favorite' : 'Adaugă la favorite'}
            className={cn(
              'absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center',
              'bg-white/90 backdrop-blur-xs shadow-md transition-all duration-200',
              'hover:scale-110 active:scale-95 cursor-pointer',
              isWishlisted
                ? 'text-rose-500 bg-white'
                : 'text-gray-400 hover:text-rose-500 hover:bg-white'
            )}
          >
            <Heart
              size={18}
              fill={isWishlisted ? 'currentColor' : 'none'}
              strokeWidth={isWishlisted ? 0 : 2}
            />
          </button>

          {/* Mobile Arrows */}
          {displayImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-700 shadow-md"
                aria-label="Imaginea anterioară"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur-xs flex items-center justify-center text-gray-700 shadow-md"
                aria-label="Imaginea următoare"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Zoom hint icon (bottom right) */}
          <div className="hidden md:flex items-center gap-1 absolute bottom-4 right-4 bg-black/40 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={12} />
            <span>Trece cursorul pentru zoom</span>
          </div>
        </div>

        {/* ── Mobile Thumbnail Dots / Strip ── */}
        {displayImages.length > 1 && (
          <div className="flex md:hidden items-center justify-center gap-2 mt-3 overflow-x-auto pb-1">
            {displayImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  selectedIndex === idx ? 'w-6 bg-orange-500' : 'bg-gray-300'
                )}
                aria-label={`Selectează imaginea ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

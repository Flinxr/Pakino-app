import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Recycle, 
  Gift, 
  HeartHandshake, 
  Trophy, 
  Calendar, 
  CheckCircle2,
  TreePine,
  Banknote,
  ShieldCheck,
  Coins,
  Truck
} from 'lucide-react';
import { HeroSlide } from '../types';
import { INITIAL_HERO_SLIDES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

interface HeroCarouselProps {
  cityName: string;
  slides?: HeroSlide[];
  onOpenPickup: () => void;
  onOpenLottery: () => void;
  onOpenWallet?: () => void;
  onOpenShare?: () => void;
  onOpenFeedback?: () => void;
}

const ICON_MAP: Record<string, any> = {
  Recycle,
  Trophy,
  HeartHandshake,
  Gift,
  Sparkles,
  TreePine,
  Banknote,
  ShieldCheck,
  Coins,
  Truck
};

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  cityName,
  slides,
  onOpenPickup,
  onOpenLottery,
  onOpenWallet,
  onOpenShare,
  onOpenFeedback
}) => {
  // Use active slides from props or defaults
  const activeSlides = (slides && slides.length > 0 ? slides : INITIAL_HERO_SLIDES).filter((s) => s.isActive !== false);
  const displaySlides = activeSlides.length > 0 ? activeSlides : INITIAL_HERO_SLIDES;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // Safeguard index if slides array shrinks
  useEffect(() => {
    if (currentIndex >= displaySlides.length) {
      setCurrentIndex(0);
    }
  }, [displaySlides.length, currentIndex]);

  useEffect(() => {
    if (!isAutoPlay || displaySlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay, displaySlides.length]);

  const nextSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const prevSlide = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const current = displaySlides[currentIndex] || displaySlides[0];
  const IconComponent = ICON_MAP[current?.iconName] || Recycle;

  const handleAction = () => {
    switch (current.actionType) {
      case 'lottery':
        onOpenLottery();
        break;
      case 'wallet':
        if (onOpenWallet) onOpenWallet();
        break;
      case 'share':
        if (onOpenShare) onOpenShare();
        break;
      case 'feedback':
        if (onOpenFeedback) onOpenFeedback();
        break;
      case 'pickup':
      default:
        onOpenPickup();
        break;
    }
  };

  return (
    <div 
      className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-white/10 select-none group"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      <div className={`bg-gradient-to-r ${current.bgGradient} text-white p-4 sm:p-7 min-h-[190px] sm:min-h-[220px] flex flex-col justify-between transition-all duration-700`}>
        {/* Decorative Lighting Layer */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Top Tag & Slide Indicators */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black ${current.tagColor || 'bg-white/20 text-white'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{current.tag.replace('{cityName}', cityName)}</span>
          </span>

          {/* Dots */}
          {displaySlides.length > 1 && (
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === i ? 'w-5 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`اسلاید ${toPersianDigits(i + 1)}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="my-2 sm:my-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-black text-white leading-snug tracking-tight">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-100/90 mt-1 leading-relaxed line-clamp-2">
                {current.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Highlight & Action */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/15 text-xs relative z-10">
          <span className="text-[11px] sm:text-xs text-emerald-200 font-bold flex items-center gap-1.5 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="truncate">{current.highlightText}</span>
          </span>

          {current.actionText && (
            <button
              type="button"
              onClick={handleAction}
              className="px-3.5 py-1.5 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-extrabold rounded-xl text-[11px] sm:text-xs transition shrink-0 flex items-center gap-1 cursor-pointer shadow-xs border border-white/20"
            >
              <span>{current.actionText}</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Arrows for desktop hover */}
      {displaySlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-20"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

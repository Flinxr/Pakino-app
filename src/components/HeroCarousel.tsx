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
  Truck,
  ExternalLink,
  Link as LinkIcon,
  Image as ImageIcon
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
    }, 6000);
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

  const handleAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    switch (current.actionType) {
      case 'custom_url': {
        const url = current.customUrl || current.linkUrl;
        if (url && url.trim()) {
          const targetUrl = url.trim();
          if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
          } else {
            window.location.href = targetUrl;
          }
        }
        break;
      }
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

  // Determine container height based on aspect ratio (Item 4: ارتفاع بیشتر و نسبت تقریباً مربعی/عمودی)
  const isTall = current.aspectRatio === 'tall' || current.aspectRatio === 'square';
  const minHeightClass = isTall 
    ? 'min-h-[250px] sm:min-h-[290px]' 
    : 'min-h-[210px] sm:min-h-[240px]';

  return (
    <div 
      className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-700/40 select-none group transition-all"
      onMouseEnter={() => setIsAutoPlay(false)}
      onMouseLeave={() => setIsAutoPlay(true)}
    >
      {/* Background Image Layer if present */}
      {current.imageUrl && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={current.imageUrl} 
            alt={current.title} 
            className="w-full h-full object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
          />
          {/* Dark gradient overlay to preserve text readability */}
          <div className={`absolute inset-0 bg-gradient-to-t ${current.bgGradient || 'from-slate-950 via-slate-900/85 to-slate-950/70'} opacity-90 backdrop-blur-[1px]`} />
        </div>
      )}

      <div className={`relative z-10 ${!current.imageUrl ? `bg-gradient-to-r ${current.bgGradient}` : ''} text-white p-4 sm:p-6 ${minHeightClass} flex flex-col justify-between transition-all duration-700`}>
        {/* Decorative Lighting Layer */}
        <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-white/10 blur-3xl pointer-events-none" />

        {/* Top Tag & Slide Indicators */}
        <div className="flex items-center justify-between gap-2 relative z-10">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black backdrop-blur-md shadow-xs ${current.tagColor || 'bg-white/20 text-white border border-white/20'}`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{(current.tag || '').replace('{cityName}', cityName)}</span>
          </span>

          {/* Dots */}
          {displaySlides.length > 1 && (
            <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15">
              {displaySlides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setIsAutoPlay(false);
                    setCurrentIndex(i);
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    currentIndex === i ? 'w-5 bg-white shadow-xs' : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`اسلاید ${toPersianDigits(i + 1)}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="my-3 sm:my-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition">
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-xl font-black text-white leading-snug tracking-tight drop-shadow-xs">
                {current.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-100/90 mt-1.5 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {current.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar with Highlight & Primary Action Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2.5 border-t border-white/15 text-xs relative z-10">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span className="text-[11px] sm:text-xs text-emerald-200 font-bold flex items-center gap-1.5 truncate">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">{current.highlightText}</span>
            </span>
          </div>

          {current.actionText && (
            <button
              type="button"
              onClick={handleAction}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 active:scale-95 text-white font-extrabold rounded-xl text-[11px] sm:text-xs transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-white/25 backdrop-blur-md self-end sm:self-auto"
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
            className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-20 shadow-md"
            aria-label="اسلاید قبلی"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 rounded-full bg-black/35 hover:bg-black/60 text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer z-20 shadow-md"
            aria-label="اسلاید بعدی"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

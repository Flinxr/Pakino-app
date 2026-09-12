import React, { useState } from 'react';
import { 
  Plus, 
  Gift, 
  MapPin, 
  ChevronDown, 
  Sparkles, 
  Trophy, 
  HelpCircle, 
  ChevronUp, 
  Share2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { CityId, UserProfile, PickupRequest, CharityProject, HeroSlide, WasteCategory } from '../types';
import { CITIES, FAQ_ITEMS } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';
import { HeroCarousel } from './HeroCarousel';
import { WastePriceAccordion } from './WastePriceAccordion';
import { CharityProjectsSection } from './CharityProjectsSection';

interface CitizenHomeProps {
  currentCity: CityId;
  onSelectCity: (cityId: CityId) => void;
  user: UserProfile;
  requests: PickupRequest[];
  charityProjects?: CharityProject[];
  heroSlides?: HeroSlide[];
  wasteCategories?: WasteCategory[];
  onOpenNewPickup: () => void;
  onOpenHistory: () => void;
  onOpenLottery: () => void;
  onOpenWallet: () => void;
  onOpenFeedback: () => void;
  onOpenShare: () => void;
  onSelectCharityProject?: (projectId: string) => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  currentCity,
  onSelectCity,
  user,
  requests,
  charityProjects,
  heroSlides,
  wasteCategories,
  onOpenNewPickup,
  onOpenHistory,
  onOpenLottery,
  onOpenWallet,
  onOpenFeedback,
  onOpenShare,
  onSelectCharityProject
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;

  // Active Cities Dropdown/Accordion state
  const [isCityAccordionOpen, setIsCityAccordionOpen] = useState(false);

  // Active FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-300">
      
      {/* ACCOUNT WARNING / SUSPENSION ALERT BANNER */}
      {user.status === 'suspended' && (
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-start gap-3 text-rose-900 shadow-sm animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm text-rose-800">حساب کاربری در وضعیت تعلیق موقت</div>
            <p>
              {user.statusMessage || 'حساب کاربری شما به دلیل دریافت امتیازات ضعیف یا عدم رعایت قوانین تفکیک در حالت تعلیق قرار گرفته است.'}
            </p>
            <p className="text-[11px] text-rose-700 font-medium">
              جهت فعال‌سازی مجدد و بررسی با پشتیبانی پاکینو تماس حاصل فرمایید.
            </p>
          </div>
        </div>
      )}

      {user.status === 'warning' && (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm text-amber-800">
              هشدار انضباطی حساب کاربری ({toPersianDigits(user.warningCount || 1)} اخطار فعال)
            </div>
            <p>
              {user.statusMessage || 'امتیاز دریافتی شما از سفیران به دلیل عدم تفکیک مناسب پسماند یا عدم حضور در آدرس کاهش یافته است.'}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              لطفاً جهت تداوم استفاده از خدمات، پسماندها را به صورت خشک و تفکیک‌شده تحویل نمایید.
            </p>
          </div>
        </div>
      )}

      {/* 1. DYNAMIC HERO CAROUSEL */}
      <HeroCarousel
        cityName={city.name}
        slides={heroSlides}
        onOpenPickup={onOpenNewPickup}
        onOpenLottery={onOpenLottery}
        onOpenWallet={onOpenWallet}
        onOpenShare={onOpenShare}
        onOpenFeedback={onOpenFeedback}
      />

      {/* 2. PRIMARY ACTION BUTTONS (درخواست جمع‌آوری، قرعه‌کشی و جوایز) - تک‌خطی و باریک */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
        {/* BUTTON 1: REQUEST COLLECTION */}
        <button
          type="button"
          onClick={onOpenNewPickup}
          className="group relative bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 active:scale-[0.99] text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between text-right border border-emerald-500/40 overflow-hidden cursor-pointer"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-6 transition-transform">
              <Plus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap">
                درخواست جمع‌آوری
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-100 font-medium truncate">
                (توزین در محل با تسویه آنی)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 mr-1.5 text-emerald-200 group-hover:translate-x-[-2px] transition-transform">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300 opacity-90 shrink-0" />
            <ArrowLeft className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </div>
        </button>

        {/* BUTTON 2: LOTTERY & PRIZES */}
        <button
          type="button"
          onClick={onOpenLottery}
          className="group relative bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-700 hover:from-amber-600 hover:to-yellow-800 active:scale-[0.99] text-white px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-between text-right border border-amber-400/40 overflow-hidden cursor-pointer"
        >
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0 shadow-inner group-hover:-rotate-6 transition-transform">
              <Trophy className="w-5 h-5 text-amber-100 stroke-[2.2]" />
            </div>
            <div className="flex items-baseline gap-2 min-w-0">
              <span className="text-xs sm:text-sm font-black text-white whitespace-nowrap">
                قرعه‌کشی و جوایز
              </span>
              <span className="text-[10px] sm:text-[11px] text-amber-100 font-medium truncate">
                (شانس‌ها و برندگان طلایی)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 mr-1.5 text-amber-200 group-hover:translate-x-[-2px] transition-transform">
            <Gift className="w-3.5 h-3.5 text-amber-200 opacity-90 shrink-0" />
            <ArrowLeft className="w-3.5 h-3.5 opacity-80 shrink-0" />
          </div>
        </button>
      </div>

      {/* 3. ACTIVE CITIES DROPDOWN / ACCORDION */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <button
          type="button"
          onClick={() => setIsCityAccordionOpen(!isCityAccordionOpen)}
          className="w-full p-4 sm:p-5 flex items-center justify-between text-right hover:bg-slate-50 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-slate-900">
                  محدوده و شهرهای فعال پاکینو
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                  شهر فعلی: {city.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {isCityAccordionOpen ? 'جهت بستن کلیک کنید' : 'جهت مشاهده و تغییر شهر یا منطقه تحت پوشش کلیک کنید'}
              </p>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            {isCityAccordionOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isCityAccordionOpen && (
          <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.values(CITIES).map((c) => {
                const isSelected = c.id === currentCity;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectCity(c.id);
                      setIsCityAccordionOpen(false);
                    }}
                    className={`p-3.5 rounded-2xl border text-right transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-black text-xs sm:text-sm">{c.fullName}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        {toPersianDigits(c.neighborhoods.length)} محله تحت پوشش فعال
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. WASTE PRICE ACCORDION (COLLAPSIBLE) */}
      <WastePriceAccordion cityName={city.name} wasteCategories={wasteCategories} />

      {/* 5. CHARITY & COMMUNITY PROJECTS SECTION */}
      <CharityProjectsSection 
        projects={charityProjects}
        onSelectProjectForRecycle={onSelectCharityProject} 
      />

      {/* 6. INVITE CITIZENS / REFERRAL (SHORT SMS OPTIMIZED) */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5 text-teal-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black">دعوت از همشهریان و کسب امتیاز هدیه</h4>
            <p className="text-[11px] text-teal-200 mt-0.5">
              با معرفی پاکینو به همسایگان، ۵۰ کیلو شانس هدیه در قرعه‌کشی دریافت کنید.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenShare}
          className="px-4 py-2 bg-white text-teal-950 hover:bg-teal-50 text-xs font-black rounded-xl transition shadow-xs self-start sm:self-auto cursor-pointer"
        >
          ارسال دعوت‌نامه پیامکی
        </button>
      </div>

      {/* 7. FAQ ACCORDION */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <h3 className="text-xs sm:text-sm font-black text-slate-900">
            پرسش‌های متداول شهروندان
          </h3>
        </div>

        <div className="space-y-2">
          {FAQ_ITEMS.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-200/80 overflow-hidden bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-3.5 text-right font-black text-xs text-slate-800 flex items-center justify-between gap-2 hover:bg-slate-100/70 transition cursor-pointer"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="p-3.5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white animate-in fade-in">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

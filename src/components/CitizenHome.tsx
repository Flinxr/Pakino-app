import React from 'react';
import { 
  Recycle, 
  HeartHandshake, 
  Banknote, 
  MapPin, 
  Clock, 
  Gift, 
  History, 
  MessageSquare, 
  Share2, 
  Sparkles, 
  ArrowLeft, 
  CheckCircle2,
  TreePine,
  Droplets,
  ShieldCheck,
  ChevronLeft,
  Truck,
  Wallet,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import { CityId, UserProfile, PickupRequest } from '../types';
import { CITIES, WASTE_CATEGORIES } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface CitizenHomeProps {
  currentCity: CityId;
  user: UserProfile;
  requests: PickupRequest[];
  onOpenNewPickup: () => void;
  onOpenHistory: () => void;
  onOpenFeedback: () => void;
  onOpenShare: () => void;
  onOpenLottery: () => void;
  onOpenWallet: () => void;
}

export const CitizenHome: React.FC<CitizenHomeProps> = ({
  currentCity,
  user,
  requests,
  onOpenNewPickup,
  onOpenHistory,
  onOpenFeedback,
  onOpenShare,
  onOpenLottery,
  onOpenWallet
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;

  // Active or pending requests
  const activeRequests = requests.filter((r) => r.status === 'pending' || r.status === 'assigned');
  const totalKg = requests.reduce((acc, curr) => acc + (curr.actualKg || curr.estimatedKg), 0);

  // Environmental equivalencies
  const treesSaved = Math.max(1, Math.floor(totalKg / 20));
  const waterSavedLiters = Math.max(50, totalKg * 25);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Active Request Alert Card (if any pending) */}
      {activeRequests.length > 0 && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md flex items-center justify-between gap-2.5 animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Truck className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm">درخواست فعال در دست اقدام</span>
                <span className="text-[10px] bg-white text-emerald-900 font-bold px-1.5 py-0.5 rounded-full">
                  #{toPersianDigits(activeRequests[0].id)}
                </span>
              </div>
              <p className="text-[11px] text-emerald-100 truncate mt-0.5">
                {toPersianDigits(activeRequests[0].dateStr)} • بازه {toPersianDigits(activeRequests[0].timeSlot)}
              </p>
            </div>
          </div>

          <button
            onClick={onOpenHistory}
            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-black rounded-xl shrink-0 transition flex items-center gap-1 cursor-pointer"
          >
            <span>پیگیری</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Citizen Wallet & Balance Highlight Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-200 shrink-0">
            <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-emerald-200 font-bold">کیف پول بازیافت:</span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-500/30 text-emerald-100 px-1.5 py-0.2 rounded-full border border-emerald-400/20">
                تسویه پایا
              </span>
            </div>
            <div className="text-lg sm:text-2xl font-black text-white font-mono mt-0.5">
              {toPersianDigits(user.walletBalanceTomans.toLocaleString())} <span className="text-xs font-sans font-bold text-emerald-200">تومان</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-center">
          <button
            onClick={onOpenWallet}
            className="flex-1 sm:flex-none px-3.5 py-2 sm:py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>برداشت موجودی</span>
          </button>

          <button
            onClick={onOpenWallet}
            className="px-3 py-2 sm:py-2.5 bg-white/15 hover:bg-white/25 text-white font-bold rounded-xl sm:rounded-2xl text-xs flex items-center justify-center gap-1 transition cursor-pointer"
          >
            <span>گردش حساب</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Hero Card with Primary "دکمه جمع‌آوری" */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-500/20 shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 font-bold text-[11px] px-2.5 py-0.5 rounded-full mb-2">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              <span>پوشش {city.name}</span>
            </div>

            <h1 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              جمع‌آوری پسماند خشک در محل
            </h1>
            
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              مراجعه سفیر پاکیار با ترازوی دیجیتال به درب منزل یا محل کار شما
            </p>
          </div>

          {/* TWO OPTIONS PREVIEW BOX */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3.5 sm:my-4">
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">۱. هدیه به خیریه</h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  واریز به خیریه + ۲ برابر شانس قرعه‌کشی
                </p>
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-xs text-slate-900">۲. دریافت وجه نقد</h4>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  تسویه آنی بر مبنای وزن دقیق ترازوی دیجیتال
                </p>
              </div>
            </div>
          </div>

          {/* THE BIG MAIN COLLECTION BUTTON (دکمه جمع‌آوری) */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <button
              id="main-collect-btn"
              onClick={onOpenNewPickup}
              className="w-full sm:w-auto flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-98 text-white font-black py-3.5 px-6 rounded-xl sm:rounded-2xl text-sm sm:text-base shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <Recycle className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
              <span>درخواست جمع‌آوری بازیافت</span>
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </button>

            <button
              onClick={onOpenHistory}
              className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold py-3.5 px-5 rounded-xl sm:rounded-2xl text-xs sm:text-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <History className="w-4 h-4 text-emerald-700" />
              <span>سوابق من</span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS GRID: History, Feedback, Share, Lottery */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          id="quick-history-btn"
          onClick={onOpenHistory}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-right transition group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <History className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-800">سوابق بازیافت</div>
          <div className="text-[10px] text-slate-400 mt-0.5">تاریخ‌ها و وزن‌ها</div>
        </button>

        <button
          id="quick-lottery-btn"
          onClick={onOpenLottery}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-right transition group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <Gift className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-800">قرعه‌کشی و جوایز</div>
          <div className="text-[10px] text-slate-400 mt-0.5">کدهای شانس ماهانه</div>
        </button>

        <button
          id="quick-feedback-btn"
          onClick={onOpenFeedback}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-right transition group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-800">پیشنهادات و پشتیبانی</div>
          <div className="text-[10px] text-slate-400 mt-0.5">پاسخگویی سریع</div>
        </button>

        <button
          id="quick-share-btn"
          onClick={onOpenShare}
          className="p-3 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-right transition group shadow-2xs cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-1.5 group-hover:scale-105 transition">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="font-extrabold text-xs text-slate-800">دعوت همشهریان</div>
          <div className="text-[10px] text-slate-400 mt-0.5">دریافت پاداش معرفی</div>
        </button>
      </div>

      {/* WASTE CATEGORIES & APPROVED RATES (MOBILE OPTIMIZED: 1 item per row on mobile as requested!) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              نرخ مصوب انواع پسماند خشک در {city.name}
            </h3>
            <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">
              مبنای تسویه نقدی یا واریز به خیریه (تومان به ازای هر کیلوگرم)
            </p>
          </div>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
            نرخ رسمی
          </span>
        </div>

        {/* 1 Item per row on mobile (grid-cols-1), 2 cols on tablet (sm:grid-cols-2), 3 cols on desktop (lg:grid-cols-3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {WASTE_CATEGORIES.map((item) => (
            <div
              key={item.id}
              className="p-2.5 sm:p-3 rounded-xl bg-slate-50/90 hover:bg-emerald-50/40 border border-slate-200/80 flex items-center justify-between transition"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
                <span className="font-bold text-xs sm:text-sm text-slate-800 truncate">
                  {item.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 bg-white px-2.5 py-1 rounded-lg border border-emerald-100 shadow-2xs">
                <span className="font-black text-emerald-700 font-mono text-xs sm:text-sm">
                  {toPersianDigits(item.ratePerKgTomans.toLocaleString())}
                </span>
                <span className="text-[10px] font-bold text-emerald-600">تومان</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ENVIRONMENTAL IMPACT METRICS */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs sm:text-sm font-black flex items-center gap-1.5">
              <TreePine className="w-4 h-4 text-emerald-400" />
              <span>اثرات محیط‌زیستی در {city.name}</span>
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-300 mt-0.5">
              مشارکت شهروندان در کاهش دفن زباله و حفظ منابع طبیعی
            </p>
          </div>

          <div className="flex items-center gap-4 self-center sm:self-auto bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <div className="text-center">
              <div className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {toPersianDigits(treesSaved)}
              </div>
              <div className="text-[9px] text-slate-300">درخت حفظ شده</div>
            </div>

            <div className="h-6 w-px bg-white/20" />

            <div className="text-center">
              <div className="text-base sm:text-lg font-black text-sky-400 font-mono">
                {toPersianDigits(waterSavedLiters)}
              </div>
              <div className="text-[9px] text-slate-300">لیتر آب ذخیره</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

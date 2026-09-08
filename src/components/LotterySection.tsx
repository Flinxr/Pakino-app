import React from 'react';
import { Gift, Sparkles, Trophy, Award, Calendar, CheckCircle, Ticket, HeartHandshake } from 'lucide-react';
import { CityId, UserProfile, PickupRequest } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

interface LotterySectionProps {
  currentCity: CityId;
  user: UserProfile;
  requests: PickupRequest[];
  onOpenNewPickup: () => void;
  onClose?: () => void;
}

export const LotterySection: React.FC<LotterySectionProps> = ({
  currentCity,
  user,
  requests,
  onOpenNewPickup,
  onClose
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;

  const tickets = requests.map((r) => ({
    code: r.lotteryTicketNumber,
    date: r.dateStr,
    type: r.type,
    weight: r.actualKg || r.estimatedKg,
    status: r.status
  }));

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white">
              <Trophy className="w-8 h-8 text-amber-100 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">قرعه‌کشی بزرگ ماهانه پاکینو</h2>
                <span className="text-[10px] bg-white text-amber-900 font-black px-2.5 py-0.5 rounded-full">
                  ویژه شهر {city.name}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                به ازای هر بار تحویل پسماند خشک، یک شماره شانس دریافت کنید!
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 text-center self-start sm:self-auto">
            <div className="text-[11px] text-amber-100">مجموع شانس‌های فعال شما:</div>
            <div className="text-xl font-black text-white mt-0.5">
              {toPersianDigits(tickets.length + Math.floor(user.lotteryPoints / 10))} شانس قرعه‌کشی
            </div>
          </div>
        </div>
      </div>

      {/* Prizes Grid */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 mb-3 flex items-center gap-1.5">
          <Gift className="w-4 h-4 text-amber-600" />
          <span>جوایز این دوره قرعه‌کشی شهر {city.name}:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg font-black shrink-0">
              🥇
            </div>
            <div>
              <div className="text-xs font-black text-slate-800">جایزه اول: ربع سکه بهار آزادی</div>
              <div className="text-[11px] text-slate-500 mt-0.5">۱ برنده خوش‌شانس این ماه</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center text-lg font-black shrink-0">
              🥈
            </div>
            <div>
              <div className="text-xs font-black text-slate-800">جایزه دوم: ۳ کارت هدیه ۵ میلیونی</div>
              <div className="text-[11px] text-slate-500 mt-0.5">۳ برنده از بین فعال‌ترین شهروندان</div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center text-lg font-black shrink-0">
              🥉
            </div>
            <div>
              <div className="text-xs font-black text-slate-800">جایزه سوم: ۱۰ دستگاه خردکن برقی</div>
              <div className="text-[11px] text-slate-500 mt-0.5">۱۰ برنده ویژه حالت نیکوکاری</div>
            </div>
          </div>
        </div>
      </div>

      {/* User's active lottery tickets */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Ticket className="w-4 h-4 text-emerald-600" />
            <span>کدهای قرعه‌کشی ثبت شده به نام شما:</span>
          </span>
          <span className="text-[11px] text-slate-500">{toPersianDigits(tickets.length)} بلیط فعال</span>
        </h3>

        {tickets.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-2">
            <p>هنوز کد قرعه‌کشی دریافت نکرده‌اید.</p>
            <p className="text-[11px] text-slate-400">
              با اولین ثبت سفارش جمع‌آوری بازیافت، کد قرعه‌کشی شما فوراً صادر خواهد شد.
            </p>
            <button
              onClick={onOpenNewPickup}
              className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition"
            >
              <span>ثبت درخواست بازیافت و دریافت کد</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tickets.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-mono font-black text-emerald-800 text-sm tracking-widest">{t.code}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{toPersianDigits(t.date)}</div>
                </div>
                <div className="text-left">
                  {t.type === 'charity' ? (
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <HeartHandshake className="w-3 h-3" />
                      <span>۲ برابر شانس</span>
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      ۱ شانس
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

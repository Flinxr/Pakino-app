import React, { useState } from 'react';
import { 
  History, 
  Calendar, 
  Clock, 
  Scale, 
  HeartHandshake, 
  Banknote, 
  MapPin, 
  CheckCircle2, 
  Clock3, 
  XCircle, 
  Truck, 
  Gift, 
  Share2, 
  Plus,
  Trash2,
  Filter,
  Award
} from 'lucide-react';
import { PickupRequest, CityId } from '../types';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface HistoryViewProps {
  requests: PickupRequest[];
  onOpenNewPickup: () => void;
  onCancelRequest: (requestId: string) => void;
  currentCity: CityId;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  requests,
  onOpenNewPickup,
  onCancelRequest,
  currentCity
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'collected' | 'charity' | 'cash'>('all');

  // Filter requests
  const filteredRequests = requests.filter((req) => {
    if (filter === 'pending') return req.status === 'pending' || req.status === 'assigned';
    if (filter === 'collected') return req.status === 'collected';
    if (filter === 'charity') return req.type === 'charity';
    if (filter === 'cash') return req.type === 'cash';
    return true;
  });

  // Calculate totals
  const totalKg = requests.reduce((acc, curr) => acc + (curr.actualKg || curr.estimatedKg), 0);
  const totalDonatedKg = requests
    .filter((r) => r.type === 'charity')
    .reduce((acc, curr) => acc + (curr.actualKg || curr.estimatedKg), 0);
  const totalCashEarned = requests
    .filter((r) => r.type === 'cash' && r.status === 'collected')
    .reduce((acc, curr) => acc + (curr.cashPaidTomans || curr.approximatePayoutTomans), 0);

  const getStatusBadge = (status: PickupRequest['status']) => {
    switch (status) {
      case 'pending':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full border border-amber-200">
            <Clock3 className="w-3 h-3 text-amber-600" />
            <span>در انتظار پذیرش راننده</span>
          </span>
        );
      case 'assigned':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-sky-100 text-sky-900 px-2.5 py-1 rounded-full border border-sky-200 animate-pulse">
            <Truck className="w-3 h-3 text-sky-600" />
            <span>راننده در مسیر مراجعه</span>
          </span>
        );
      case 'collected':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>تحویل گرفته شد</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-900 px-2.5 py-1 rounded-full border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>لغو شده</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2">
                <History className="w-6 h-6 text-emerald-300" />
                <span>سوابق تحویل بازیافت شهروند</span>
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                مشاهده تاریخ‌ها، اوزان تحویل داده شده، مبالغ نقدی و امور نیکوکاری
              </p>
            </div>

            <button
              onClick={onOpenNewPickup}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت درخواست بازیافت جدید</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-emerald-700/60">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[11px] text-emerald-200 font-medium">کل بازیافت تحویلی</div>
              <div className="text-lg sm:text-xl font-black mt-0.5">
                {toPersianDigits(totalKg)} <span className="text-xs font-normal">کیلوگرم</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[11px] text-emerald-200 font-medium">اهدایی به نیکوکاری</div>
              <div className="text-lg sm:text-xl font-black mt-0.5 text-amber-300">
                {toPersianDigits(totalDonatedKg)} <span className="text-xs font-normal">کیلوگرم</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[11px] text-emerald-200 font-medium">پاداش‌های نقدی</div>
              <div className="text-sm sm:text-base font-black mt-1">
                {formatTomans(totalCashEarned)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>فیلتر سوابق:</span>
        </span>

        {[
          { id: 'all', label: 'همه سوابق' },
          { id: 'pending', label: 'در جریان و فعال' },
          { id: 'collected', label: 'تحویل شده' },
          { id: 'charity', label: 'نیکوکاری' },
          { id: 'cash', label: 'دریافت پول' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
              filter === item.id
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <History className="w-7 h-7" />
          </div>
          <h3 className="text-base font-extrabold text-slate-800">
            موردی در سوابق بازیافت یافت نشد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            هنوز درخواستی با این فیلتر ثبت نکرده‌اید. با اولین تفکیک پسماند، امتیاز قرعه‌کشی و رسید اختصاصی دریافت کنید.
          </p>
          <button
            onClick={onOpenNewPickup}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs inline-flex items-center gap-2 shadow-md transition"
          >
            <Plus className="w-4 h-4" />
            <span>ثبت اولین درخواست بازیافت</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-mono font-black text-sm">
                    شماره بازیافت: #{toPersianDigits(req.id)}
                  </div>
                  <span className="text-xs text-slate-500">شهر: {req.cityName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(req.status)}
                </div>
              </div>

              {/* Card Body Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 my-4 text-xs">
                {/* Date & Day */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">تاریخ هماهنگ شده</span>
                    <span className="font-bold text-slate-900">{toPersianDigits(req.dateStr)}</span>
                  </div>
                </div>

                {/* Time Slot */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">ساعت جمع‌آوری</span>
                    <span className="font-bold text-slate-900">{toPersianDigits(req.timeSlot)}</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Scale className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">وزن بازیافت</span>
                    <span className="font-extrabold text-slate-900">
                      {toPersianDigits(req.actualKg || req.estimatedKg)} کیلوگرم
                    </span>
                  </div>
                </div>

                {/* Type & Payout */}
                <div className="flex items-start gap-2 text-slate-700">
                  {req.type === 'charity' ? (
                    <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  ) : (
                    <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="text-slate-400 block text-[10px]">نوع تسویه</span>
                    {req.type === 'charity' ? (
                      <span className="font-bold text-rose-700">نیکوکاری (خیریه)</span>
                    ) : (
                      <span className="font-bold text-emerald-700">
                        دریافت نقد ({formatTomans(req.cashPaidTomans || req.approximatePayoutTomans)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Address info */}
              <div className="bg-slate-50 p-3 rounded-2xl text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>آدرس تحویل:</strong> {req.address.street}
                  {req.address.plaque ? ` - ${req.address.plaque}` : ''}
                  {req.address.unit ? ` - ${req.address.unit}` : ''}
                  {req.address.notes ? ` (${req.address.notes})` : ''}
                </span>
              </div>

              {/* Card Footer with Lottery Ticket & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1 rounded-xl">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>کد قرعه‌کشی: {req.lotteryTicketNumber}</span>
                  </div>
                  {req.type === 'charity' && (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>نشان نیکوکار پاکینو</span>
                    </span>
                  )}
                </div>

                {req.status === 'pending' && (
                  <button
                    onClick={() => onCancelRequest(req.id)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 self-end sm:self-auto transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>لغو این درخواست</span>
                  </button>
                )}

                {req.status === 'collected' && (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>توسط سفیر پاکینو تکمیل و ثبت شد</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

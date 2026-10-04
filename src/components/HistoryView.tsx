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
  Award,
  Star,
  UserCheck,
  CreditCard
} from 'lucide-react';
import { PickupRequest, CityId } from '../types';
import { toPersianDigits, formatTomans } from '../utils/persian';
import { GreenReceiptModal } from './GreenReceiptModal';

interface HistoryViewProps {
  requests: PickupRequest[];
  onOpenNewPickup: () => void;
  onCancelRequest: (requestId: string, reason?: string) => void;
  onOpenRatingModal?: (request: PickupRequest) => void;
  currentCity: CityId;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  requests,
  onOpenNewPickup,
  onCancelRequest,
  onOpenRatingModal,
  currentCity
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'collected' | 'charity' | 'cash'>('all');
  const [cancellingRequest, setCancellingRequest] = useState<PickupRequest | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [selectedReceiptRequest, setSelectedReceiptRequest] = useState<PickupRequest | null>(null);

  const filteredRequests = requests.filter((req) => {
    if (filter === 'pending') return req.status === 'pending' || req.status === 'assigned';
    if (filter === 'collected') return req.status === 'collected';
    if (filter === 'charity') return req.type === 'charity';
    if (filter === 'cash') return req.type === 'cash';
    return true;
  });

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
            <span>در انتظار اعزام راننده</span>
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
            <span>تکمیل و تحویل گرفته شد</span>
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
    <div className="space-y-5 sm:space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-900 text-white p-5 sm:p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black flex items-center gap-2">
                <History className="w-6 h-6 text-emerald-300" />
                <span>سوابق تحویل بازیافت شهروند</span>
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                مشاهده تاریخ‌ها، اوزان، مشخصات سفیر اعزامی، مبالغ نقدی و امور نیکوکاری
              </p>
            </div>

            <button
              onClick={onOpenNewPickup}
              className="bg-white hover:bg-emerald-50 text-emerald-800 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md transition self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت درخواست جدید</span>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mt-5 pt-4 border-t border-emerald-700/60">
            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[10px] sm:text-[11px] text-emerald-200 font-medium">کل بازیافت تحویلی</div>
              <div className="text-base sm:text-xl font-black mt-0.5">
                {toPersianDigits(totalKg)} <span className="text-[10px] font-normal">کیلو</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[10px] sm:text-[11px] text-emerald-200 font-medium">اهدایی به نیکوکاری</div>
              <div className="text-base sm:text-xl font-black mt-0.5 text-amber-300">
                {toPersianDigits(totalDonatedKg)} <span className="text-[10px] font-normal">کیلو</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center">
              <div className="text-[10px] sm:text-[11px] text-emerald-200 font-medium">پاداش‌های نقدی</div>
              <div className="text-xs sm:text-base font-black mt-1">
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
          <span>فیلتر:</span>
        </span>

        {[
          { id: 'all', label: 'همه' },
          { id: 'pending', label: 'در جریان و فعال' },
          { id: 'collected', label: 'تحویل شده' },
          { id: 'charity', label: 'نیکوکاری' },
          { id: 'cash', label: 'دریافت پول' }
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setFilter(item.id as any)}
            className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border cursor-pointer ${
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
            موردی در سوابق یافت نشد
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            با اولین تحویل پسماند خشک، شانس قرعه‌کشی و رسید دیجیتال دریافت نمایید.
          </p>
        </div>
      ) : (
        <div className="space-y-3.5">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-emerald-300 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 px-2.5 rounded-xl bg-emerald-50 text-emerald-800 font-mono font-black text-xs sm:text-sm">
                    {req.trackingCode}
                  </div>
                  <span className="text-xs text-slate-500">{req.cityName}</span>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusBadge(req.status)}
                </div>
              </div>

              {/* Card Body Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 text-xs">
                {/* Date & Day */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">تاریخ</span>
                    <span className="font-bold text-slate-900">{toPersianDigits(req.dateStr)}</span>
                  </div>
                </div>

                {/* Time Slot */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">ساعت</span>
                    <span className="font-bold text-slate-900">{toPersianDigits(req.timeSlot)}</span>
                  </div>
                </div>

                {/* Weight */}
                <div className="flex items-start gap-2 text-slate-700">
                  <Scale className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">وزن بازیافت</span>
                    <span className="font-extrabold text-slate-900">
                      {toPersianDigits(req.actualKg || req.estimatedKg)} کیلو
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
                      <span className="font-bold text-rose-700">نیکوکاری</span>
                    ) : (
                      <span className="font-bold text-emerald-700">
                        نقد ({formatTomans(req.cashPaidTomans || req.approximatePayoutTomans)})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Driver & Vehicle Info Display (if assigned or collected) */}
              {(req.status === 'assigned' || req.status === 'collected' || req.driverName) && (
                <div className="bg-sky-50/80 p-3 rounded-2xl border border-sky-200/80 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 my-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-sky-200 text-sky-900 flex items-center justify-center font-bold">
                      🚗
                    </div>
                    <div>
                      <div className="font-black text-slate-900">
                        سفیر اعزامی: {req.driverName || 'سفیر شماره ۱۲ پاکینو'} {req.driverPhone ? `(${req.driverPhone})` : ''}
                      </div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        {req.vehicleModel || 'وانت پراید مجهز به ترازوی دیجیتال'} • پلاک: {req.vehiclePlate || 'ایران ۷۳ - ۴۵۶ ج ۱۲'}
                      </div>
                    </div>
                  </div>

                  {/* Rating & Receipt triggers */}
                  {req.status === 'collected' && (
                    <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReceiptRequest(req)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer transition"
                        title="مشاهده شناسنامه سبز و چاپ رسید"
                      >
                        <Award className="w-3.5 h-3.5 text-white" />
                        <span>رسید سبز و شناسنامه</span>
                      </button>

                      {onOpenRatingModal && (
                        <button
                          type="button"
                          onClick={() => onOpenRatingModal(req)}
                          className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-[11px] rounded-xl border border-amber-300 shadow-2xs flex items-center gap-1 cursor-pointer transition"
                        >
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>{req.rating ? `امتیاز شما: ${toPersianDigits(req.rating)} ستاره` : 'ثبت نظر و امتیاز'}</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Address info */}
              <div className="bg-slate-50 p-2.5 rounded-xl text-xs text-slate-600 flex items-start gap-2 border border-slate-100">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  <strong>آدرس:</strong> {req.address.street}
                  {req.address.plaque ? ` - پلاک ${req.address.plaque}` : ''}
                  {req.address.unit ? ` - واحد ${req.address.unit}` : ''}
                </span>
              </div>

              {/* Cancellation Notice if Cancelled */}
              {req.status === 'cancelled' && (
                <div className="bg-rose-50/80 border border-rose-200 p-2.5 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="flex items-center justify-between font-bold text-[11px]">
                    <span className="flex items-center gap-1 text-rose-700">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>لغو شده توسط: {req.cancellationDetails?.cancelledBy === 'driver' ? 'سفیر راننده' : req.cancellationDetails?.cancelledBy === 'admin' ? 'مدیریت سامانه' : 'شهروند'}</span>
                    </span>
                    {req.cancellationDetails?.cancelledAt && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        {toPersianDigits(new Date(req.cancellationDetails.cancelledAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}
                      </span>
                    )}
                  </div>
                  {req.cancellationDetails?.reason && (
                    <p className="text-[11px] text-slate-700 bg-white/70 p-1.5 rounded-lg border border-rose-100">
                      <strong>علت لغو:</strong> {req.cancellationDetails.reason}
                    </p>
                  )}
                  {req.cancellationDetails?.previousDriverName && (
                    <div className="text-[10px] text-slate-500">
                      سفیر مربوطه: {req.cancellationDetails.previousDriverName}
                    </div>
                  )}
                </div>
              )}

              {/* Card Footer with Lottery Ticket & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-xl text-[11px]">
                    <Gift className="w-3.5 h-3.5 text-amber-600" />
                    <span>کد قرعه‌کشی: {req.lotteryTicketNumber}</span>
                  </div>
                  {req.type === 'charity' && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      <span>طرح عام‌المنفعه</span>
                    </span>
                  )}
                </div>

                {(req.status === 'pending' || req.status === 'assigned') && (
                  <button
                    onClick={() => {
                      setCancellingRequest(req);
                      setCancelReason('');
                    }}
                    className="text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 self-end sm:self-auto transition cursor-pointer bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>لغو این درخواست</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Citizen Cancellation Modal with Optional Reason Input (Item 5) */}
      {cancellingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  لغو نوبت جمع‌آوری پسماند
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  کد رهگیری: {cancellingRequest.trackingCode}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-200">
              آیا از لغو این نوبت اطمینان دارید؟ در صورت نیاز می‌توانید دلیل لغو درخواست را برای هماهنگی بهتر با تیم پاکینو یادداشت فرمایید.
            </p>

            <div>
              <label htmlFor="cancel-reason-textarea" className="block text-xs font-bold text-slate-700 mb-1">
                دلیل لغو نوبت (اختیاری):
              </label>
              <textarea
                id="cancel-reason-textarea"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="مثال: تغییر برنامه کاری، جمع‌آوری زودتر از موعد، اشتباه در انتخاب روز و..."
                className="w-full p-3 bg-white border border-slate-300 rounded-2xl text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 text-slate-800"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setCancellingRequest(null);
                  setCancelReason('');
                }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                انصراف و بازگشت
              </button>
              <button
                type="button"
                onClick={() => {
                  onCancelRequest(cancellingRequest.id, cancelReason.trim() || undefined);
                  setCancellingRequest(null);
                  setCancelReason('');
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-2xl transition shadow-md cursor-pointer"
              >
                تایید لغو درخواست
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GREEN RECYCLING CERTIFICATE & RECEIPT MODAL */}
      <GreenReceiptModal
        isOpen={!!selectedReceiptRequest}
        onClose={() => setSelectedReceiptRequest(null)}
        request={selectedReceiptRequest}
      />
    </div>
  );
};

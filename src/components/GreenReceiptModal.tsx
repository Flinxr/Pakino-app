import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Award, 
  TreePine, 
  Droplets, 
  Leaf, 
  Scale, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Truck, 
  CreditCard, 
  HeartHandshake, 
  Trophy,
  Sparkles,
  QrCode
} from 'lucide-react';
import { PickupRequest } from '../types';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface GreenReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PickupRequest | null;
}

export const GreenReceiptModal: React.FC<GreenReceiptModalProps> = ({
  isOpen,
  onClose,
  request
}) => {
  const [copied, setCopied] = React.useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !request) return null;

  const weightKg = request.actualKg || request.estimatedKg || 10;
  const isCharity = request.type === 'charity' || request.convertedToCharityMidway;
  const amountTomans = request.cashPaidTomans || request.approximatePayoutTomans || weightKg * 15000;

  // Environmental impact calculations
  const treesSaved = (weightKg * 0.017).toFixed(2);
  const waterSavedLiters = Math.round(weightKg * 26);
  const co2ReducedKg = (weightKg * 2.1).toFixed(1);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(request.trackingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `شناسنامه تفکیک بازیافت پاکینو - ${request.trackingCode}`,
        text: `من با تحویل ${toPersianDigits(weightKg)} کیلوگرم بازیافت در سامانه پاکینو، معادل ${toPersianDigits(treesSaved)} اصله درخت را از قطع شدن نجات دادم! 🌱`,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
        {/* Top Action Bar (hidden on print) */}
        <div className="bg-slate-900 text-white p-3.5 px-5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span className="font-black text-xs sm:text-sm">رسید سبز و شناسنامه رسمی تفکیک پاکینو</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="p-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              title="چاپ یا ذخیره به صورت PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">چاپ رسید</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
              title="اشتراک‌گذاری"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Certificate Body */}
        <div ref={receiptRef} className="p-5 sm:p-6 space-y-4 text-right">
          {/* Header & Municipal Branding */}
          <div className="border-b-2 border-emerald-600 pb-3 flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-emerald-800 tracking-tight">سامانه پاکینو</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.5 rounded-full border border-emerald-300">
                  شهرداری {request.cityName}
                </span>
              </div>
              <h2 className="text-xs font-bold text-slate-600">
                گواهی هوشمند تفکیک از مبدا و تحویل مواد قابل بازیافت
              </h2>
            </div>

            {/* Stamp Simulator */}
            <div className="border-2 border-dashed border-emerald-600 rounded-2xl p-1.5 px-2.5 text-center rotate-3 shrink-0 bg-emerald-50/50">
              <div className="text-[9px] font-black text-emerald-800">تأییدیه رسمی</div>
              <div className="text-[8px] font-bold text-emerald-600">سازمان مدیریت پسماند</div>
              <div className="text-[7px] font-mono text-emerald-700 mt-0.5">{toPersianDigits(request.dateStr.slice(0, 10))}</div>
            </div>
          </div>

          {/* Tracking Barcode & Status Banner */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">شناسه یکتای رهگیری دیجیتال:</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="font-mono font-black text-base text-slate-900 tracking-wider">
                  {request.trackingCode}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-xs transition cursor-pointer print:hidden"
                  title="کپی شناسه"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="text-left font-mono">
              <span className="text-[10px] text-slate-400 block font-bold">وضعیت تحویل:</span>
              <span className="inline-flex items-center gap-1 text-emerald-700 font-black text-xs bg-emerald-100/80 px-2 py-0.5 rounded-lg border border-emerald-300 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>تحویل و توزین نهایی</span>
              </span>
            </div>
          </div>

          {/* Citizen & Service Details Grid */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>شهروند محترم:</span>
              </span>
              <div className="font-black text-slate-900 mt-1">{request.userName}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{request.userPhone}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600" />
                <span>سفیر پاکیار جمع‌آوری:</span>
              </span>
              <div className="font-black text-slate-900 mt-1">{request.driverName || 'سفیر ناوگان شهری'}</div>
              <div className="text-[10px] text-slate-500 mt-0.5 truncate">{request.vehiclePlate || 'خودروی توزین سیار'}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>تاریخ و شیفت مراجعه:</span>
              </span>
              <div className="font-bold text-slate-900 mt-1">{toPersianDigits(request.dateStr)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">ساعت {toPersianDigits(request.timeSlot)}</div>
            </div>

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>محل تحویل پسماند:</span>
              </span>
              <div className="font-bold text-slate-900 mt-1 truncate">{request.cityName} - {request.address.neighborhood || 'مرکز شهر'}</div>
              <div className="text-[10px] text-slate-500 truncate mt-0.5">{request.address.street}</div>
            </div>
          </div>

          {/* Weighing & Payout Summary Box */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-700" />
                <span>وزن قطعی پسماند خشک (باسکول دیجیتال):</span>
              </span>
              <span className="font-mono font-black text-base text-emerald-800">
                {toPersianDigits(weightKg)} <span className="text-xs font-sans font-bold">کیلوگرم</span>
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/80">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                {isCharity ? <HeartHandshake className="w-4 h-4 text-rose-600" /> : <CreditCard className="w-4 h-4 text-blue-600" />}
                <span>نحوه تسویه و بازیافت:</span>
              </span>

              <div className="text-left">
                {isCharity ? (
                  <div>
                    <span className="font-black text-rose-800 text-xs">اهدای کامل به نیکوکاری</span>
                    <span className="text-[10px] text-rose-600 block mt-0.5">({request.charityName || 'طرح مسئولیت اجتماعی شهری'})</span>
                  </div>
                ) : (
                  <div>
                    <span className="font-mono font-black text-emerald-800 text-sm">
                      {toPersianDigits(formatTomans(amountTomans))}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {request.payoutMethod === 'direct_card_transfer' 
                        ? `واریز کارت‌به‌کارت ${request.cardTransferRefCode ? `(رهگیری: ${request.cardTransferRefCode})` : ''}`
                        : 'پرداخت نقد در محل'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {request.convertedToCharityMidway && (
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[10px] text-amber-900 font-bold">
                🌱 این سفارش با موافقت شهروند محترم در محل توزین، از تسویه نقدی به طرح نیکوکاری تبدیل گردید.
              </div>
            )}
          </div>

          {/* Environmental Contribution Metrics (Eco Footprint) */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-black text-slate-700 flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" />
              <span>اثرات زیست‌محیطی حاصل از تفکیک این سفارش:</span>
            </h4>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
                <TreePine className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="font-mono font-black text-xs text-emerald-800">
                  {toPersianDigits(treesSaved)}
                </div>
                <div className="text-[9px] text-emerald-700 font-bold mt-0.5">اصله درخت نجات‌یافته</div>
              </div>

              <div className="p-2.5 bg-sky-50/70 rounded-xl border border-sky-100">
                <Droplets className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                <div className="font-mono font-black text-xs text-sky-800">
                  {toPersianDigits(waterSavedLiters)}
                </div>
                <div className="text-[9px] text-sky-700 font-bold mt-0.5">لیتر آب صرفه‌جویی‌شده</div>
              </div>

              <div className="p-2.5 bg-teal-50/70 rounded-xl border border-teal-100">
                <Sparkles className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                <div className="font-mono font-black text-xs text-teal-800">
                  {toPersianDigits(co2ReducedKg)} kg
                </div>
                <div className="text-[9px] text-teal-700 font-bold mt-0.5">کاهش آلودگی دی‌اکسید کربن</div>
              </div>
            </div>
          </div>

          {/* Lottery Ticket Code Box */}
          <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Trophy className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-amber-800 block font-bold">کد شانس ورود به قرعه‌کشی دوره‌ای:</span>
                <span className="font-mono font-black text-amber-950 text-sm tracking-widest">
                  {request.lotteryTicketNumber}
                </span>
              </div>
            </div>

            <span className="text-[10px] font-black text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300 shrink-0">
              شانس فعال
            </span>
          </div>

          {/* Footer Watermark */}
          <div className="text-center pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-center gap-2">
            <span>سامانه یکپارچه مدیریت بازیافت هوشمند پاکینو</span>
            <span>•</span>
            <span className="font-mono">{toPersianDigits(new Date().getFullYear())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

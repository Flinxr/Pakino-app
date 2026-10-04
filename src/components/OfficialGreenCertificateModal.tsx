import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Share2, 
  Award, 
  Trees, 
  Droplet, 
  Wind, 
  Scale, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  ShieldCheck,
  Calendar,
  Sparkles,
  Download
} from 'lucide-react';
import { UserProfile, CityId } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

interface OfficialGreenCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentCity: CityId;
}

export const OfficialGreenCertificateModal: React.FC<OfficialGreenCertificateModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCity
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const cityName = CITIES[currentCity]?.name || 'نورآباد ممسنی';
  const totalKg = Math.max(user.totalKgRecycled || 0, 15); // Fallback to 15 if newly registered demo
  
  // Environmental formulas
  // 1 tree saved per ~50kg paper/cardboard/wood
  const treesSaved = Math.max(1, Math.round((totalKg * 0.02) * 10) / 10);
  // 1.5kg CO2 offset per 1kg recycled
  const co2Offset = Math.round(totalKg * 1.5);
  // 25 liters of water conserved per 1kg recycled
  const waterSaved = Math.round(totalKg * 25);

  const issueDateStr = '۱۴۰۵/۰۶/۲۰';
  const certificateCode = `CERT-PK-${currentCity.toUpperCase()}-${user.id ? user.id.replace(/[^0-9a-zA-Z]/g, '').slice(-5).toUpperCase() : '98201'}`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🌱 گواهی رسمی شهروند سبز شهرداری ${cityName} برای من صادر شد!\nبا تفکیک ${toPersianDigits(totalKg)} کیلوگرم پسماند خشک، مانع از قطع ${toPersianDigits(treesSaved)} درخت و انتشار ${toPersianDigits(co2Offset)} کیلوگرم دی‌اکسید کربن شدم.\nکد گواهی: ${certificateCode}\nسامانه پاکینو: https://pakino.ir`;
    if (navigator.share) {
      navigator.share({
        title: 'گواهی رسمی شهروند سبز پاکینو',
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('متن گواهی در کلیپ‌بورد کپی شد!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Background click to close */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="print:hidden bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-black">گواهی رسمی شهروند سبز شهرداری</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              title="چاپ و پرینت گواهی"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">چاپ و دانلود</span>
            </button>

            <button
              onClick={handleShare}
              type="button"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              title="اشتراک‌گذاری افتخار"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">اشتراک</span>
            </button>

            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE CERTIFICATE BODY */}
        <div 
          ref={certificateRef}
          className="p-5 sm:p-8 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 text-slate-900 border-[10px] border-emerald-800/80 m-3 sm:m-4 rounded-2xl relative shadow-inner overflow-hidden"
          style={{ direction: 'rtl' }}
        >
          {/* Decorative Corner Ornaments */}
          <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-amber-600/70 rounded-tr-xl pointer-events-none" />
          <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-amber-600/70 rounded-tl-xl pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-amber-600/70 rounded-br-xl pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-amber-600/70 rounded-bl-xl pointer-events-none" />

          {/* Watermark Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Building2 className="w-96 h-96 text-emerald-950" />
          </div>

          {/* Official Header */}
          <div className="text-center space-y-1.5 pb-4 border-b-2 border-emerald-800/30 relative">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-900 text-amber-300 shadow-md mb-1">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-700 tracking-wide">
              جمهوری اسلامی ایران • وزارت کشور
            </div>
            <h1 className="text-sm sm:text-base font-black text-emerald-950">
              سازمان مدیریت پسماند شهرداری {cityName}
            </h1>
            <p className="text-[11px] text-emerald-800 font-bold">
              سامانه هوشمند تفکیک از مبدا و اقتصاد چرخشی پاکینو
            </p>

            <div className="mt-2 inline-block bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-900 text-amber-200 px-4 py-1.5 rounded-full text-xs font-black shadow-xs">
              گواهی رسمی افتخار شهروندی زیست‌محیطی (پاسپورت سبز)
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="py-5 sm:py-6 space-y-4 text-justify leading-relaxed relative">
            <p className="text-xs sm:text-sm text-slate-800">
              بدین‌وسیله گواهی می‌شود شهروند گرامی جناب آقای / سرکار خانم{' '}
              <strong className="text-emerald-950 font-black underline decoration-emerald-500 decoration-2 text-sm sm:text-base">
                {user.firstName ? `${user.firstName} ${user.lastName}` : 'شهروند همیار'}
              </strong>{' '}
              {user.phone && (
                <span className="text-slate-600 text-xs">
                  (شماره همراه: {toPersianDigits(user.phone)})
                </span>
              )}
              ، با مشارکت مسئولانه و مستمر در تفکیک اصولی پسماندهای خشک از مبدا در شهرستان <strong>{cityName}</strong>، نقش برجسته و ماندگاری در حفظ بهداشت شهری، پایداری محیط زیست و تحقق اقتصاد چرخشی ایفا نموده‌اند.
            </p>

            {/* Environmental Impact Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 py-2">
              <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200 shadow-xs text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1">
                  <Scale className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-emerald-950">
                  {toPersianDigits(totalKg)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold">کیلوگرم پسماند خشک</div>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-green-200 shadow-xs text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-800 flex items-center justify-center mb-1">
                  <Trees className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-green-950">
                  {toPersianDigits(treesSaved)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold">درخت حفظ‌شده از قطع</div>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-teal-200 shadow-xs text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-1">
                  <Wind className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-teal-950">
                  {toPersianDigits(co2Offset)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold">کیلوگرم کاهش CO2</div>
              </div>

              <div className="bg-white/90 p-3 rounded-2xl border border-sky-200 shadow-xs text-center flex flex-col items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center mb-1">
                  <Droplet className="w-4 h-4" />
                </div>
                <div className="text-base sm:text-lg font-black text-sky-950">
                  {toPersianDigits(waterSaved)}
                </div>
                <div className="text-[10px] text-slate-600 font-bold">لیتر آب صرفه‌جویی‌شده</div>
              </div>
            </div>

            <p className="text-[11px] sm:text-xs text-slate-700 font-medium">
              مراتب تقدیر و سپاس سازمان مدیریت پسماند و شورای اسلامی شهر تقدیم حضورتان می‌گردد. امید است این همت زیست‌محیطی الگوی همشهریان در ساختن شهری پاک و سرسبز باشد.
            </p>
          </div>

          {/* Certificate Footer with Signatures & QR Code */}
          <div className="pt-4 border-t-2 border-emerald-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 relative">
            {/* Metadata & QR */}
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-slate-300 rounded-xl shadow-xs">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-600 space-y-0.5 text-right font-mono">
                <div>کد شناسه گواهی: <strong>{certificateCode}</strong></div>
                <div>تاریخ صدور: <strong>{toPersianDigits(issueDateStr)}</strong></div>
                <div className="text-emerald-700 font-bold flex items-center gap-1 font-sans">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>اصالت ثبت شده در پایگاه پسماند شهری</span>
                </div>
              </div>
            </div>

            {/* Official Municipal Seal & Signature */}
            <div className="text-center relative">
              {/* Stamp Graphic */}
              <div className="inline-block relative">
                <div className="w-24 h-24 rounded-full border-2 border-rose-700/80 flex flex-col items-center justify-center p-1 text-rose-700 rotate-[-12deg] font-black shadow-xs bg-rose-50/20">
                  <span className="text-[8px]">سازمان مدیریت پسماند</span>
                  <Building2 className="w-5 h-5 my-0.5" />
                  <span className="text-[9px]">شهرداری {cityName}</span>
                  <span className="text-[7px]">تایید رسمی شد</span>
                </div>
              </div>
              <div className="text-[11px] font-black text-slate-800 mt-1">
                ریاست سازمان مدیریت پسماند و خدمات شهری
              </div>
            </div>
          </div>
        </div>

        {/* Bottom helper notice */}
        <div className="print:hidden bg-slate-50 p-4 border-t border-slate-200 text-center text-xs text-slate-500">
          این گواهی جهت ارائه به سازمان‌ها، مدارس و کسب امتیازات تشویقی تخفیف عوارض نوسازی شهرداری معتبر است.
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { X, Navigation, ExternalLink, MapPin, Compass } from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

interface NavigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  userName: string;
  street: string;
  cityName: string;
}

export const NavigationModal: React.FC<NavigationModalProps> = ({
  isOpen,
  onClose,
  lat,
  lng,
  userName,
  street,
  cityName
}) => {
  if (!isOpen) return null;

  const navApps = [
    {
      id: 'neshan',
      name: 'نشان (Neshan)',
      subtitle: 'مسیریاب ایرانی پرسرعت با ترافیک زنده و دوربین‌ها',
      badge: 'پیشنهادی',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-blue-600 text-white',
      iconText: 'نشان',
      url: `https://neshan.org/maps/@${lat},${lng},16z/search`
    },
    {
      id: 'balad',
      name: 'بلد (Balad)',
      subtitle: 'نقشه و مسیریاب سخنگوی فارسی با جزئیات دقیق کوچه و پلاک',
      badge: 'پیشنهادی',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      iconBg: 'bg-emerald-600 text-white',
      iconText: 'بلد',
      url: `https://balad.ir/location?latitude=${lat}&longitude=${lng}`
    },
    {
      id: 'waze',
      name: 'ویز (Waze)',
      subtitle: 'مسیریاب جهانی هوشمند با اعلام موانع و پلیس',
      badge: 'جهانی',
      badgeColor: 'bg-sky-100 text-sky-800',
      iconBg: 'bg-cyan-500 text-white',
      iconText: 'Waze',
      url: `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    },
    {
      id: 'google',
      name: 'گوگل مپ (Google Maps)',
      subtitle: 'نقشه گوگل با نمای ماهواره‌ای و جهت‌یابی استاندارد',
      badge: 'استاندارد',
      badgeColor: 'bg-slate-100 text-slate-700',
      iconBg: 'bg-rose-500 text-white',
      iconText: 'Google',
      url: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
    },
    {
      id: 'default',
      name: 'مسیریاب پیش‌فرض گوشی (Apple / Geo)',
      subtitle: 'باز کردن با برنامه پیش‌فرض نقشه در دستگاه هوشمند شما',
      badge: 'سیستمی',
      badgeColor: 'bg-slate-100 text-slate-700',
      iconBg: 'bg-slate-800 text-white',
      iconText: 'GPS',
      url: `geo:${lat},${lng}?q=${lat},${lng}`
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 via-sky-600 to-teal-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              <Navigation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">انتخاب برنامه مسیریابی</h2>
              <p className="text-xs text-sky-100 mt-0.5">
                مسیریابی به سمت آدرس شهروند: {userName}
              </p>
            </div>
          </div>

          <div className="mt-3 p-2.5 bg-white/10 backdrop-blur-md rounded-xl text-xs text-white flex items-center gap-2 border border-white/15">
            <MapPin className="w-3.5 h-3.5 text-sky-200 shrink-0" />
            <span className="truncate">
              {cityName}، {street}
            </span>
          </div>
        </div>

        {/* Options List */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[60vh] overflow-y-auto">
          {navApps.map((app) => (
            <a
              key={app.id}
              href={app.url}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
              className="p-3 bg-slate-50 hover:bg-sky-50/70 border border-slate-200 hover:border-sky-300 rounded-2xl flex items-center justify-between transition group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${app.iconBg}`}>
                  {app.iconText}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs sm:text-sm text-slate-900 group-hover:text-sky-800 transition">
                      {app.name}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {app.subtitle}
                  </p>
                </div>
              </div>

              <div className="w-8 h-8 rounded-xl bg-white group-hover:bg-sky-600 group-hover:text-white text-slate-400 flex items-center justify-center border border-slate-200 group-hover:border-sky-600 transition shrink-0 mr-2">
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

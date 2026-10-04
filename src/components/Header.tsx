import React, { useState } from 'react';
import { 
  Recycle, 
  MapPin, 
  User, 
  Truck, 
  Sparkles, 
  ChevronDown, 
  Phone,
  LogOut,
  Gift,
  CreditCard,
  X,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft,
  Headphones
} from 'lucide-react';
import { CityId, UserProfile } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface HeaderProps {
  currentCity: CityId;
  onCityChange: (city: CityId) => void;
  userRole: 'citizen' | 'driver' | 'admin';
  onRoleChange: (role: 'citizen' | 'driver' | 'admin') => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenShare: () => void;
  onOpenLottery: () => void;
  onOpenFeedback?: () => void;
  onOpenWallet?: () => void;
  onLogout: () => void;
  onGoHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onCityChange,
  userRole,
  onRoleChange,
  user,
  onOpenAuth,
  onOpenShare,
  onOpenLottery,
  onOpenFeedback,
  onOpenWallet,
  onLogout,
  onGoHome
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cityInfo = CITIES[currentCity] || CITIES.noorabad;

  const getRoleLabel = () => {
    if (userRole === 'admin') return 'مدیریت کل سیستم';
    if (userRole === 'driver') return 'راننده و سفیر پاکیار';
    return cityInfo.name;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo & Home Navigation */}
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 group text-right cursor-pointer focus:outline-hidden hover:opacity-90 active:scale-95 transition-all select-none"
          title={
            userRole === 'admin'
              ? 'بازگشت به داشبورد مدیریت'
              : userRole === 'driver'
              ? 'بازگشت به صفحه اول راننده'
              : 'بازگشت به صفحه اصلی شهروند'
          }
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 shrink-0 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition">
            <Recycle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 group-hover:text-emerald-700 transition">پاکینو</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">
                {cityInfo.name}
              </span>
            </div>
          </div>
        </button>

        {/* Compact Right Side Controls */}
        <div className="flex items-center gap-2">
          {/* User Role Icon in Header */}
          <button
            id="user-profile-btn"
            onClick={() => setShowProfileMenu(true)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-slate-100 hover:bg-slate-200 active:scale-95 border border-slate-200 flex items-center justify-center transition cursor-pointer relative shadow-xs"
            aria-label={
              userRole === 'admin' 
                ? 'پنل مدیریت سامانه' 
                : userRole === 'driver' 
                ? 'پنل راننده و سفیر پاکیار' 
                : user.isRegistered 
                ? `پروفایل شهروندی: ${user.firstName} ${user.lastName}` 
                : 'ورود و حساب کاربری شهروند'
            }
            title={
              userRole === 'admin' 
                ? 'پنل مدیریت سامانه' 
                : userRole === 'driver' 
                ? 'پنل راننده و سفیر پاکیار' 
                : user.isRegistered 
                ? `پروفایل شهروندی: ${user.firstName} ${user.lastName}` 
                : 'ورود و حساب کاربری شهروند'
            }
          >
            {userRole === 'admin' ? (
              <ShieldCheck className="w-5 h-5 text-indigo-700" />
            ) : userRole === 'driver' ? (
              <Truck className="w-5 h-5 text-emerald-700" />
            ) : (
              <User className="w-5 h-5 text-slate-700" />
            )}
            <span className="sr-only">
              {userRole === 'admin' ? 'مدیریت سامانه' : userRole === 'driver' ? 'راننده' : 'شهروند'}
            </span>
          </button>
        </div>
      </div>

      {/* Styled Profile & Controls Dropdown Modal */}
      {showProfileMenu && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div 
            className="fixed inset-0" 
            onClick={() => setShowProfileMenu(false)} 
          />
          
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 relative">
              <button
                onClick={() => setShowProfileMenu(false)}
                className="absolute top-4 left-4 w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 text-white flex items-center justify-center font-black text-lg shadow-inner">
                  {userRole === 'admin' ? '⚙️' : user.isRegistered && user.firstName ? user.firstName[0] : 'ش'}
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {userRole === 'admin' ? 'مدیر ارشد سامانه' : user.isRegistered ? `${user.firstName} ${user.lastName}` : 'کاربر مهمان'}
                  </h3>
                  <p className="text-xs text-emerald-200 font-mono mt-0.5">
                    {user.isRegistered ? toPersianDigits(user.phone) : 'حساب کاربری فعال نیست'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: City Selector Dropdown (Item 15) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>انتخاب شهرستان و محدوده خدمات</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                    تحت پوشش
                  </span>
                </div>
                
                <div className="relative">
                  <select
                    value={currentCity}
                    onChange={(e) => onCityChange(e.target.value as CityId)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-xs cursor-pointer appearance-none text-right"
                    aria-label="انتخاب شهرستان"
                  >
                    {Object.values(CITIES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* SECTION 2: Role Switcher (Citizen / Driver / Admin) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-extrabold text-slate-800 mb-2">
                  <span>نقش کاربری در سامانه</span>
                </div>
                
                <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      onRoleChange('citizen');
                      setShowProfileMenu(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                      userRole === 'citizen'
                        ? 'bg-white text-emerald-800 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>شهروند</span>
                  </button>

                  <button
                    onClick={() => {
                      onRoleChange('driver');
                      setShowProfileMenu(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                      userRole === 'driver'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>سفیر راننده</span>
                  </button>

                  <button
                    onClick={() => {
                      onRoleChange('admin');
                      setShowProfileMenu(false);
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1 cursor-pointer ${
                      userRole === 'admin'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>مدیریت</span>
                  </button>
                </div>
              </div>

              {/* SECTION 4: Menu Action Links */}
              <div className="space-y-1 pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLottery();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-900 flex items-center justify-between font-bold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-600" />
                    <span>قرعه‌کشی و شانس‌های طلایی</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenShare();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center justify-between font-bold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>دعوت از دوستان و دریافت امتیاز هدیه</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </button>

                {onOpenFeedback && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenFeedback();
                    }}
                    className="w-full text-right p-2.5 rounded-xl text-xs text-slate-700 hover:bg-slate-100 flex items-center justify-between font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-emerald-600" />
                      <span>مرکز پشتیبانی و ثبت تیکت (صدای شهروند)</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-slate-400" />
                  </button>
                )}

                {!user.isRegistered ? (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full text-right p-2.5 rounded-xl text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 flex items-center justify-between font-black transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>ورود / ثبت‌نام با شماره موبایل</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full text-right p-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 flex items-center justify-between font-bold transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>خروج از حساب</span>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

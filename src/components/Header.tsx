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
  Wallet,
  CreditCard,
  X,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  ChevronLeft
} from 'lucide-react';
import { CityId, UserProfile } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface HeaderProps {
  currentCity: CityId;
  onCityChange: (city: CityId) => void;
  userRole: 'citizen' | 'driver';
  onRoleChange: (role: 'citizen' | 'driver') => void;
  user: UserProfile;
  onOpenAuth: () => void;
  onOpenShare: () => void;
  onOpenLottery: () => void;
  onOpenWallet: () => void;
  onLogout: () => void;
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
  onOpenWallet,
  onLogout
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const cityInfo = CITIES[currentCity] || CITIES.noorabad;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between gap-2">
        {/* Brand Logo - Compact, Clean, without "بازیافت هوشمند" */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
            <Recycle className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900">پاکینو</span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-lg">
                {cityInfo.name}
              </span>
            </div>
          </div>
        </div>

        {/* Compact Right Side: Stylish Profile Button that encapsulates all controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Wallet preview badge on larger screens */}
          {userRole === 'citizen' && (
            <button
              onClick={onOpenWallet}
              className="hidden md:flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer"
              title="کیف پول و موجودی"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-emerald-800">
                {toPersianDigits(user.walletBalanceTomans.toLocaleString())}
              </span>
              <span className="text-[10px] text-emerald-600 font-normal">تومان</span>
            </button>
          )}

          {/* Unified Profile & Control Trigger Button */}
          <button
            id="user-profile-btn"
            onClick={() => setShowProfileMenu(true)}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-100/90 hover:bg-slate-200/90 active:scale-95 border border-slate-200/90 px-2.5 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl text-xs font-bold text-slate-800 transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
              {user.isRegistered && user.firstName ? user.firstName[0] : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
            
            <div className="flex flex-col text-right">
              <div className="flex items-center gap-1">
                <span className="text-xs font-extrabold text-slate-800">
                  {user.isRegistered ? `${user.firstName} ${user.lastName}`.trim() : 'ورود / حساب'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </div>
              <div className="text-[9px] text-emerald-700 font-semibold leading-none mt-0.5">
                {userRole === 'driver' ? 'راننده پاکیار' : `${cityInfo.name}`}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Styled Profile & Controls Dropdown / Bottom Sheet Modal */}
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
                  {user.isRegistered && user.firstName ? user.firstName[0] : 'ش'}
                </div>
                <div>
                  <h3 className="font-black text-base text-white">
                    {user.isRegistered ? `${user.firstName} ${user.lastName}` : 'کاربر مهمان'}
                  </h3>
                  <p className="text-xs text-emerald-200 font-mono mt-0.5">
                    {user.isRegistered ? toPersianDigits(user.phone) : 'حساب کاربری فعال نیست'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* SECTION 1: City Selector (موقعیت شهر) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>انتخاب شهرستان و محدوده خدمات</span>
                  </div>
                  <span className="text-[10px] text-emerald-700 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                    فعال
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(CITIES).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        onCityChange(c.id);
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                        currentCity === c.id
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${currentCity === c.id ? 'bg-white' : 'bg-slate-400'}`} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 2: Role Switcher (تغییر نقش: شهروند / راننده) */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="text-xs font-extrabold text-slate-800 mb-2">
                  <span>نقش کاربری در سامانه</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 bg-slate-200/70 p-1 rounded-xl">
                  <button
                    onClick={() => {
                      onRoleChange('citizen');
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
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
                    }}
                    className={`py-2 rounded-lg text-xs font-extrabold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      userRole === 'driver'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>راننده پاکیار</span>
                  </button>
                </div>
              </div>

              {/* SECTION 3: Wallet & Direct Withdrawal (کیف پول و برداشت موجودی) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-600 font-bold flex items-center gap-1">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>موجودی کیف پول شما:</span>
                  </div>
                  <div className="text-base font-black text-emerald-900 font-mono mt-0.5">
                    {toPersianDigits(user.walletBalanceTomans.toLocaleString())} <span className="text-[10px] font-sans font-bold">تومان</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenWallet();
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center gap-1 shadow-xs transition cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>برداشت وجه</span>
                </button>
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
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span>جوایز و قرعه‌کشی ماهانه</span>
                  </div>
                  <span className="text-amber-700 font-mono text-[11px] bg-amber-100 px-2 py-0.5 rounded-full">
                    {toPersianDigits(user.lotteryPoints)} شانس
                  </span>
                </button>

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenShare();
                  }}
                  className="w-full text-right p-2.5 rounded-xl text-xs text-slate-700 hover:bg-teal-50 hover:text-teal-900 flex items-center gap-2 font-bold transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>دعوت همشهریان و دریافت هدیه</span>
                </button>
              </div>

              {/* Bottom Login / Logout Action */}
              <div className="pt-2 border-t border-slate-100">
                {user.isRegistered ? (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>خروج از حساب کاربری</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenAuth();
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>ورود یا ثبت‌نام با شماره موبایل</span>
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

import React, { useState } from 'react';
import { X, Phone, User, CheckCircle2, Lock, Eye, EyeOff, Sparkles, UserPlus, LogIn } from 'lucide-react';
import { UserProfile, CityId } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  currentCity: CityId;
  usersList?: UserProfile[];
  onRegisterUser?: (newUser: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentCity,
  usersList = [],
  onRegisterUser
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('0917');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const normalizeDigits = (str: string) => {
    return str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).trim();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = normalizeDigits(phone);
    const cleanPassword = normalizeDigits(password);

    if (!cleanPhone.startsWith('09') || cleanPhone.length !== 11) {
      setError('شماره موبایل باید ۱۱ رقمی و با ۰۹ آغاز شود (مثال: ۰۹۱۷۱۲۳۴۵۶۷)');
      return;
    }

    if (!cleanPassword) {
      setError('لطفاً رمز عبور حساب کاربری خود را وارد کنید');
      return;
    }

    // Search in registered users
    const matchedUser = usersList.find((u) => normalizeDigits(u.phone) === cleanPhone);

    if (matchedUser) {
      const userPass = normalizeDigits(matchedUser.password || '123456');
      if (cleanPassword === userPass || cleanPassword === '123456') {
        onLoginSuccess({
          ...matchedUser,
          isRegistered: true
        });
        onClose();
        return;
      } else {
        setError('رمز عبور وارد شده نادرست است. (رمز پیش‌فرض تستی: ۱۲۳۴۵۶)');
        return;
      }
    }

    // If demo default user (09171234567)
    if (cleanPhone === '09171234567' && (cleanPassword === '123456' || cleanPassword === '1234')) {
      onLoginSuccess({
        id: 'usr-101',
        phone: '09171234567',
        firstName: 'علی',
        lastName: 'حسینی',
        password: cleanPassword,
        cityId: currentCity,
        isRegistered: true
      });
      onClose();
      return;
    }

    // If user not in system yet
    setError('حساب کاربری با این شماره یافت نشد. لطفاً ابتدا از تب «ثبت‌نام جدید» اقدام به ایجاد حساب فرمایید.');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanPhone = normalizeDigits(phone);
    const cleanPassword = normalizeDigits(password);
    const cleanConfirm = normalizeDigits(confirmPassword);

    if (!cleanPhone.startsWith('09') || cleanPhone.length !== 11) {
      setError('شماره موبایل باید ۱۱ رقمی و با ۰۹ آغاز شود (مانند ۰۹۱۷۱۲۳۴۵۶۷)');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('لطفاً نام و نام خانوادگی را وارد فرمایید');
      return;
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      setError('رمز عبور باید حداقل ۴ رقم یا کاراکتر باشد');
      return;
    }

    if (cleanPassword !== cleanConfirm) {
      setError('رمز عبور با تکرار آن یکسان نیست');
      return;
    }

    // Check if phone already registered
    const existing = usersList.find((u) => normalizeDigits(u.phone) === cleanPhone);
    if (existing) {
      setError('این شماره تلفن قبلاً در سامانه ثبت شده است. لطفاً وارد شوید.');
      setMode('login');
      return;
    }

    const newUser: UserProfile = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      phone: cleanPhone,
      password: cleanPassword,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      cityId: currentCity,
      walletBalanceTomans: 50000, // 50k gift
      totalKgRecycled: 0,
      totalDonatedKg: 0,
      totalEarnedTomans: 0,
      lotteryPoints: 50, // Welcome bonus
      isRegistered: true,
      status: 'active',
      warningCount: 0
    };

    if (onRegisterUser) {
      onRegisterUser(newUser);
    }
    onLoginSuccess(newUser);
    onClose();
  };

  const fillDemoCredentials = () => {
    setMode('login');
    setPhone('09171234567');
    setPassword('123456');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 p-5 text-white relative">
          <button
            id="close-auth-modal"
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
              {mode === 'login' ? <LogIn className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className="text-lg font-black">
                {mode === 'login' ? 'ورود به حساب شهروندی پاکینو' : 'ثبت‌نام شهروند جدید'}
              </h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                ورود و عضویت مستقیم با شماره تلفن و رمز عبور (بدون نیاز به پیامک)
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-black/20 p-1 rounded-2xl mt-4 border border-white/10 text-xs font-black">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'login' ? 'bg-white text-emerald-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>ورود با رمز عبور</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
              }}
              className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'register' ? 'bg-white text-emerald-950 shadow-md' : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>ثبت‌نام جدید</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* LOGIN FORM */
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شماره تلفن همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09171234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-mono text-sm tracking-wider text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    maxLength={11}
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رمز عبور <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور خود را وارد کنید"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-mono text-sm tracking-wider text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Demo Account Helper */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>تست سریع: ۰۹۱۷۱۲۳۴۵۶۷ (رمز: ۱۲۳۴۵۶)</span>
                </div>
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-emerald-700 font-bold hover:underline bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs cursor-pointer"
                >
                  درج خودکار
                </button>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>ورود به حساب کاربری</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-bold transition cursor-pointer"
                >
                  هنوز در پاکینو ثبت‌نام نکرده‌اید؟ <span className="text-emerald-600 underline">ایجاد حساب جدید</span>
                </button>
              </div>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-[11px] text-emerald-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>۵۰ کیلو امتیاز خوش‌آمدگویی و شانس قرعه‌کشی پس از ثبت‌نام به شما هدیه می‌شود!</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  شماره تلفن همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="register-phone"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09171234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 font-mono text-sm tracking-wider text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    maxLength={11}
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="register-firstname"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="مثال: علی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-900 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="register-lastname"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: حسینی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-900 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رمز عبور دلخواه <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="register-password"
                      type={showPassword ? 'text' : 'password'}
                      dir="ltr"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="حداقل ۴ رقم"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-900 font-mono text-xs text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تکرار رمز عبور <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="register-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    dir="ltr"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="تکرار همان رمز"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2.5 text-slate-900 font-mono text-xs text-left focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black py-3 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ثبت‌نام و ورود به سامانه</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-emerald-700 font-bold transition cursor-pointer"
                >
                  قبلاً ثبت‌نام کرده‌اید؟ <span className="text-emerald-600 underline">ورود با رمز عبور</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

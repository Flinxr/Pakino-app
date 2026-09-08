import React, { useState, useEffect } from 'react';
import { X, Phone, User, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Sparkles } from 'lucide-react';
import { UserProfile, CityId } from '../types';
import { toPersianDigits } from '../utils/persian';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  currentCity: CityId;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  currentCity
}) => {
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [phone, setPhone] = useState('0917');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('48291');
  const [timer, setTimer] = useState(120);
  const [error, setError] = useState('');
  const [showSmsNotice, setShowSmsNotice] = useState(false);

  useEffect(() => {
    let interval: any;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Iranian mobile phone validation: 11 digits starting with 09
    const cleanPhone = phone.trim();
    if (!cleanPhone.startsWith('09') || cleanPhone.length !== 11) {
      setError('لطفاً شماره موبایل ۱۱ رقمی معتبر (مانند ۰۹۱۷۱۲۳۴۵۶۷) وارد کنید');
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('لطفاً نام و نام خانوادگی خود را کامل وارد فرمایید');
      return;
    }

    // Generate random 5-digit code
    const newCode = String(Math.floor(10000 + Math.random() * 90000));
    setGeneratedOtp(newCode);
    setStep('otp');
    setTimer(120);
    setShowSmsNotice(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '12345') {
      setError('کد وارد شده صحیح نمی‌باشد. لطفاً مجدداً بررسی فرمایید.');
      return;
    }

    onLoginSuccess({
      phone,
      firstName,
      lastName,
      cityId: currentCity,
      isRegistered: true,
      lotteryPoints: 50 // Welcome bonus lottery points!
    });
    onClose();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${toPersianDigits(mins)}:${secs < 10 ? '۰' : ''}${toPersianDigits(secs)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 p-6 text-white relative">
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black">ورود و عضویت در پاکینو</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                {step === 'info' ? 'مرحله ۱: ثبت اطلاعات اولیه شهروند' : 'مرحله ۲: تایید شماره همراه پیامکی'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {step === 'info' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="p-3 bg-emerald-50/80 border border-emerald-100 rounded-2xl text-xs text-emerald-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <p className="leading-relaxed">
                  با ثبت‌نام در سامانه پاکینو، پس از هر تحویل پسماند بازیافتی به صورت خودکار در قرعه‌کشی ماهانه شرکت داده می‌شوید.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  شماره تلفن همراه <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="auth-phone-input"
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09171234567"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-mono text-sm tracking-widest text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    maxLength={11}
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute right-4 top-3.5" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">کد تایید پیامکی به این شماره ارسال خواهد شد.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="auth-firstname-input"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="مثال: علی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      required
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    نام خانوادگی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="auth-lastname-input"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="مثال: حسینی"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-3 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <button
                id="auth-send-sms-btn"
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
              >
                <span>دریافت کد پیامکی</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              {showSmsNotice && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      پیامک شبیه‌سازی شده پاکینو
                    </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="text-emerald-700 hover:underline bg-white px-2 py-0.5 rounded-lg border border-amber-200 shadow-2xs font-mono"
                    >
                      درج خودکار کد
                    </button>
                  </div>
                  <p className="font-mono text-slate-700 bg-white/70 p-2 rounded-xl border border-amber-100 mt-1">
                    کد تایید ورود شما: <strong className="text-emerald-700 text-sm tracking-wider">{toPersianDigits(generatedOtp)}</strong> ({generatedOtp})
                  </p>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    کد ۵ رقمی ارسال شده به {toPersianDigits(phone)}
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('info')}
                    className="text-[11px] text-emerald-600 hover:underline font-semibold"
                  >
                    ویرایش شماره
                  </button>
                </div>
                <input
                  id="auth-otp-input"
                  type="text"
                  dir="ltr"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="_ _ _ _ _"
                  className="w-full bg-slate-50 border-2 border-emerald-500 rounded-2xl px-4 py-3.5 text-center text-slate-900 font-mono text-xl font-bold tracking-[0.5em] focus:outline-none focus:bg-white transition"
                  maxLength={5}
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                {timer > 0 ? (
                  <span>ارسال مجدد کد تا: {formatTimer(timer)}</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      const newCode = String(Math.floor(10000 + Math.random() * 90000));
                      setGeneratedOtp(newCode);
                      setTimer(120);
                      setShowSmsNotice(true);
                    }}
                    className="text-emerald-600 font-bold hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ارسال مجدد پیامک</span>
                  </button>
                )}
              </div>

              <button
                id="auth-verify-btn"
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>تایید و ورود به پاکینو</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

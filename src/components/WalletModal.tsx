import React, { useState } from 'react';
import { 
  X, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ChevronLeft,
  ShieldCheck,
  RefreshCw,
  Gift,
  Coins,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CityId, UserProfile, WalletTransaction, WithdrawalRequest } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  transactions: WalletTransaction[];
  onWithdraw: (request: WithdrawalRequest) => boolean;
  currentCity: CityId;
}

// Iranian Bank Card Prefix Dictionary
const IRANIAN_BANKS: Record<string, { name: string; color: string; logo?: string }> = {
  '603799': { name: 'بانک ملی ایران', color: 'from-amber-700 to-amber-900' },
  '610433': { name: 'بانک ملت', color: 'from-red-600 to-red-800' },
  '603769': { name: 'بانک صادرات ایران', color: 'from-blue-700 to-blue-900' },
  '585983': { name: 'بانک تجارت', color: 'from-cyan-700 to-blue-900' },
  '627353': { name: 'بانک تجارت', color: 'from-cyan-700 to-blue-900' },
  '603770': { name: 'بانک کشاورزی', color: 'from-emerald-700 to-emerald-900' },
  '502229': { name: 'بانک پاسارگاد', color: 'from-amber-600 to-yellow-800' },
  '621986': { name: 'بانک سامان', color: 'from-sky-600 to-sky-800' },
  '627412': { name: 'بانک اقتصاد نوین', color: 'from-purple-700 to-purple-900' },
  '639346': { name: 'بانک سینا', color: 'from-indigo-700 to-indigo-900' },
  '502908': { name: 'بانک توسعه تعاون', color: 'from-teal-700 to-teal-900' },
  '589210': { name: 'بانک سپه', color: 'from-amber-800 to-slate-900' },
  '627381': { name: 'بانک انصار / سپه', color: 'from-amber-800 to-slate-900' },
  '628023': { name: 'بانک مسکن', color: 'from-orange-600 to-orange-800' },
  '504706': { name: 'بانک شهر', color: 'from-rose-700 to-rose-900' },
  '639607': { name: 'بانک سرمایه', color: 'from-blue-600 to-blue-800' }
};

export function detectBankName(cardNumber: string): { name: string; color: string } {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length >= 6) {
    const prefix = clean.substring(0, 6);
    if (IRANIAN_BANKS[prefix]) {
      return IRANIAN_BANKS[prefix];
    }
  }
  return { name: 'کارت بانکی عضو شتاب', color: 'from-slate-700 to-slate-900' };
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  user,
  transactions,
  onWithdraw,
  currentCity
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'withdraw' | 'history'>('overview');

  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState<number>(user.walletBalanceTomans > 0 ? user.walletBalanceTomans : 100000);
  const [cardNumber, setCardNumber] = useState<string>(user.savedCardNumber || '');
  const [shebaNumber, setShebaNumber] = useState<string>(user.savedSheba || '');
  const [accountHolder, setAccountHolder] = useState<string>(
    user.savedAccountHolder || `${user.firstName} ${user.lastName}`.trim() || 'علی حسینی'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successWithdrawal, setSuccessWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const city = CITIES[currentCity] || CITIES.noorabad;
  const detectedBank = detectBankName(cardNumber);

  // Format Card Number (adds space every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Quick percent buttons
  const handleSetPercent = (pct: number) => {
    const calculated = Math.floor((user.walletBalanceTomans * pct) / 1000) * 1000;
    setWithdrawAmount(Math.max(50000, calculated));
  };

  // Submit Withdrawal
  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (user.walletBalanceTomans <= 0) {
      setErrorMessage('موجودی کیف پول شما صفر است. با تحویل بازیافت موجودی خود را افزایش دهید.');
      return;
    }

    if (withdrawAmount < 50000) {
      setErrorMessage('حداقل مبلغ قابل برداشت ۵۰,۰۰۰ تومان می‌باشد.');
      return;
    }

    if (withdrawAmount > user.walletBalanceTomans) {
      setErrorMessage('مبلغ درخواستی بیشتر از موجودی کیف پول شما است.');
      return;
    }

    const cleanCard = cardNumber.replace(/\D/g, '');
    if (cleanCard.length < 16 && !shebaNumber.trim()) {
      setErrorMessage('لطفاً شماره کارت ۱۶ رقمی معتبر یا شماره شبا را وارد کنید.');
      return;
    }

    if (!accountHolder.trim()) {
      setErrorMessage('لطفاً نام و نام خانوادگی صاحب حساب را وارد کنید.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const newWithdrawal: WithdrawalRequest = {
        id: `WTH-${Date.now().toString().slice(-6)}`,
        amountTomans: withdrawAmount,
        cardNumberOrSheba: cleanCard ? `****-****-****-${cleanCard.slice(-4)}` : shebaNumber,
        bankName: detectedBank.name,
        accountHolder: accountHolder.trim(),
        dateStr: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
        createdAt: new Date().toISOString(),
        status: 'completed',
        trackingNumber: `PY-${Math.floor(100000 + Math.random() * 900000)}`
      };

      const success = onWithdraw(newWithdrawal);
      setIsSubmitting(false);

      if (success) {
        setSuccessWithdrawal(newWithdrawal);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center border border-white/30 shadow-inner">
              <Wallet className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h2 className="text-lg font-black">کیف پول شهروندی</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                درآمد بازیافت و تسویه آنی
              </p>
            </div>
          </div>

          {/* MAIN WALLET CARD */}
          <div className="mt-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div>
              <div className="text-xs text-emerald-100 font-medium">موجودی قابل برداشت:</div>
              <div className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-mono tracking-tight">
                {toPersianDigits(user.walletBalanceTomans.toLocaleString())} <span className="text-xs font-sans font-bold">تومان</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessWithdrawal(null);
                setWithdrawAmount(user.walletBalanceTomans > 0 ? user.walletBalanceTomans : 100000);
                setActiveTab('withdraw');
              }}
              disabled={user.walletBalanceTomans <= 0}
              className={`px-4 py-2.5 rounded-xl font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer ${
                user.walletBalanceTomans > 0
                  ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 active:scale-95'
                  : 'bg-white/20 text-white/60 cursor-not-allowed'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>برداشت موجودی</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>داشبورد</span>
          </button>

          <button
            onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'withdraw'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4 text-amber-600" />
            <span>برداشت وجه</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>گردش حساب ({toPersianDigits(transactions.length)})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-3.5">
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <div className="text-[11px] text-emerald-800 font-semibold">کل درآمد</div>
                  <div className="text-base font-extrabold text-emerald-950 mt-0.5 font-mono">
                    {formatTomans(user.totalEarnedTomans)}
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-2xl">
                  <div className="text-[11px] text-amber-800 font-semibold">امتیاز قرعه‌کشی</div>
                  <div className="text-base font-extrabold text-amber-950 mt-0.5 font-mono">
                    {toPersianDigits(user.lotteryPoints)} امتیاز
                  </div>
                </div>

                <div className="col-span-2 sm:col-span-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <div className="text-[11px] text-slate-600 font-semibold">مجموع بازیافت</div>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5 font-mono">
                    {toPersianDigits(user.totalKgRecycled)} کیلوگرم
                  </div>
                </div>
              </div>

              {/* How it works info - short and crisp */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>راهنمای تسویه:</span>
                </div>
                <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside leading-relaxed">
                  <li>شارژ آنی موجودی پس از توزین بازیافت توسط راننده</li>
                  <li>امکان انتقال آنی به کلیه حساب‌های بانکی (پایا و شتاب)</li>
                </ul>
              </div>

              {/* Quick action button */}
              <button
                onClick={() => {
                  setSuccessWithdrawal(null);
                  setWithdrawAmount(user.walletBalanceTomans > 0 ? user.walletBalanceTomans : 100000);
                  setActiveTab('withdraw');
                }}
                disabled={user.walletBalanceTomans <= 0}
                className={`w-full py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer ${
                  user.walletBalanceTomans > 0
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>درخواست واریز به حساب بانکی</span>
              </button>
            </div>
          )}

          {/* TAB 2: WITHDRAW */}
          {activeTab === 'withdraw' && (
            <div>
              {successWithdrawal ? (
                <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      درخواست برداشت با موفقیت ثبت شد!
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">
                      مبلغ <strong>{formatTomans(successWithdrawal.amountTomans)}</strong> به شماره کارت بانکی شما ارسال گردید.
                    </p>
                  </div>

                  {/* Receipt Box */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 space-y-2 text-right">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">کد پیگیری پایا:</span>
                      <span className="font-mono font-bold text-emerald-700">{successWithdrawal.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">بانک مقصد:</span>
                      <span className="font-bold">{successWithdrawal.bankName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">صاحب حساب:</span>
                      <span className="font-bold">{successWithdrawal.accountHolder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">زمان انتقال:</span>
                      <span className="font-bold">{toPersianDigits(successWithdrawal.dateStr)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab('history')}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl text-xs transition"
                    >
                      مشاهده در گردش حساب
                    </button>
                    <button
                      onClick={() => {
                        setSuccessWithdrawal(null);
                        setActiveTab('overview');
                      }}
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs transition"
                    >
                      بازگشت به کیف پول
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 flex items-start gap-2 animate-shake">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Available Balance banner */}
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                    <span className="text-emerald-800 font-bold">موجودی فعلی قابل برداشت:</span>
                    <span className="font-mono font-black text-emerald-950 text-sm">
                      {formatTomans(user.walletBalanceTomans)}
                    </span>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-800">
                        مبلغ برداشتی (تومان):
                      </label>
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleSetPercent(25)}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-bold"
                        >
                          ۲۵٪
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPercent(50)}
                          className="text-[10px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded-lg text-slate-700 font-bold"
                        >
                          ۵۰٪
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSetPercent(100)}
                          className="text-[10px] bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg text-emerald-800 font-bold"
                        >
                          کل موجودی
                        </button>
                      </div>
                    </div>

                    <input
                      type="number"
                      value={withdrawAmount || ''}
                      onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                      placeholder="مثلاً ۱۰۰۰۰۰"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                      min={50000}
                      max={user.walletBalanceTomans}
                    />
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>حداقل مبلغ برداشت: ۵۰,۰۰۰ تومان</span>
                      <span className="font-bold text-emerald-700 font-mono">
                        معادل: {formatTomans(withdrawAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Bank Card Input with auto bank detection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      شماره کارت بانکی ۱۶ رقمی:
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="۶۰۳۷ ۹۹** **** ****"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-base font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition tracking-widest text-center"
                        maxLength={19}
                      />
                    </div>

                    {cardNumber.replace(/\D/g, '').length >= 6 && (
                      <div className="mt-1.5 p-2 bg-slate-100 rounded-xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>بانک تشخیص داده شده:</span>
                        </div>
                        <span className="font-extrabold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {detectedBank.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sheba option */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      یا شماره شبا (اختیاری):
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        dir="ltr"
                        value={shebaNumber}
                        onChange={(e) => setShebaNumber(e.target.value.toUpperCase())}
                        placeholder="IR000000000000000000000000"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl font-mono text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition tracking-wide text-left"
                        maxLength={26}
                      />
                    </div>
                  </div>

                  {/* Account Holder Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1.5">
                      نام و نام خانوادگی صاحب حساب:
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="مثلاً علی حسینی"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition"
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || user.walletBalanceTomans < 50000}
                    className={`w-full py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition ${
                      user.walletBalanceTomans >= 50000
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer active:scale-95'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>در حال پردازش و اتصال به سامانه پایا...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>تایید و برداشت {formatTomans(withdrawAmount || 0)}</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-400 space-y-2">
                  <Receipt className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">هنوز تراکنشی در کیف پول شما ثبت نشده است</p>
                  <p className="text-[11px] text-slate-400">با تحویل بازیافت، مبالغ به صورت خودکار در این قسمت واریز می‌گردد.</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          tx.type === 'credit'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {tx.type === 'credit' ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>

                      <div>
                        <div className="font-extrabold text-slate-800">{tx.title}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {toPersianDigits(tx.dateStr)} {tx.referenceId ? `• پیگیری: ${tx.referenceId}` : ''}
                        </div>
                      </div>
                    </div>

                    <div className="text-left">
                      <div
                        className={`font-mono font-black text-sm ${
                          tx.type === 'credit' ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {tx.type === 'credit' ? '+' : '-'} {toPersianDigits(tx.amountTomans.toLocaleString())}
                      </div>
                      <span className="text-[10px] text-slate-400">تومان</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

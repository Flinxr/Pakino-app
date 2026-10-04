import React, { useState } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Award, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  Trees, 
  Droplet, 
  Wind, 
  Scale, 
  Building2, 
  Save, 
  ExternalLink,
  ShieldCheck,
  Copy,
  Check,
  Plus,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { UserProfile, CityId, SavedLocation } from '../types';
import { CITIES } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';
import { 
  detectBankFromCard, 
  isValidCardNumber, 
  formatCardNumber, 
  isValidSheba, 
  formatSheba, 
  isValidIranianNationalCode,
  normalizeDigits 
} from '../utils/bankHelper';

interface CitizenProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentCity: CityId;
  onUpdateUser: (updatedUser: UserProfile) => void;
  onOpenGreenCertificate: () => void;
}

export const CitizenProfileModal: React.FC<CitizenProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  currentCity,
  onUpdateUser,
  onOpenGreenCertificate
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'banking' | 'impact' | 'addresses'>('banking');

  // Form states
  const [firstName, setFirstName] = useState(user.firstName || '');
  const [lastName, setLastName] = useState(user.lastName || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [nationalId, setNationalId] = useState('');
  
  // Banking states
  const [cardNumber, setCardNumber] = useState(user.savedCardNumber || '');
  const [sheba, setSheba] = useState(user.savedSheba || '');
  const [accountHolder, setAccountHolder] = useState(user.savedAccountHolder || (user.firstName ? `${user.firstName} ${user.lastName}` : ''));
  
  // Status message & copied indicator
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCopiedCard, setIsCopiedCard] = useState(false);
  const [isCopiedSheba, setIsCopiedSheba] = useState(false);

  if (!isOpen) return null;

  // Real-time bank detection
  const detectedBank = detectBankFromCard(cardNumber);
  const isCardValid = cardNumber.length >= 16 ? isValidCardNumber(cardNumber) : true;
  const isShebaValid = sheba.length >= 26 ? isValidSheba(sheba) : true;

  // Environmental metrics
  const totalKg = Math.max(user.totalKgRecycled || 0, 15);
  const treesSaved = Math.max(1, Math.round((totalKg * 0.02) * 10) / 10);
  const co2Offset = Math.round(totalKg * 1.5);
  const waterSaved = Math.round(totalKg * 25);

  const getCitizenBadge = () => {
    if (totalKg >= 100) return { title: 'قهرمان طلایی محیط زیست', color: 'from-amber-500 to-yellow-600', icon: '🏆' };
    if (totalKg >= 50) return { title: 'سفیر پیشگام پایداری', color: 'from-emerald-600 to-teal-700', icon: '🌟' };
    return { title: 'همیار سبز پاکینو', color: 'from-teal-600 to-emerald-700', icon: '🌱' };
  };

  const badge = getCitizenBadge();

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = normalizeDigits(e.target.value);
    if (raw.length <= 16) {
      setCardNumber(raw);
    }
  };

  const handleShebaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    if (!val.startsWith('IR')) {
      const digits = normalizeDigits(val);
      setSheba('IR' + digits.substring(0, 24));
    } else {
      const digits = normalizeDigits(val.substring(2));
      setSheba('IR' + digits.substring(0, 24));
    }
  };

  const handleSaveProfileAndBank = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSaveSuccessMessage(null);

    if (cardNumber && !isValidCardNumber(cardNumber)) {
      setErrorMessage('شماره کارت ۱۶ رقمی وارد شده نامعتبر است (کنترل ارقام شتاب)');
      return;
    }

    if (sheba && sheba.length > 2 && !isValidSheba(sheba)) {
      setErrorMessage('شماره شبا نامعتبر است (لطفاً ۲۴ رقم پس از IR را بررسی کنید)');
      return;
    }

    const updated: UserProfile = {
      ...user,
      firstName: firstName.trim() || user.firstName,
      lastName: lastName.trim() || user.lastName,
      savedCardNumber: cardNumber ? normalizeDigits(cardNumber) : undefined,
      savedSheba: sheba ? sheba.replace(/\s+/g, '') : undefined,
      savedAccountHolder: accountHolder.trim() || undefined
    };

    onUpdateUser(updated);
    setSaveSuccessMessage('اطلاعات کاربری و بانکی با موفقیت ذخیره و به‌روزرسانی شد.');
    setTimeout(() => {
      setSaveSuccessMessage(null);
    }, 3500);
  };

  const copyToClipboard = (text: string, type: 'card' | 'sheba') => {
    navigator.clipboard.writeText(text);
    if (type === 'card') {
      setIsCopiedCard(true);
      setTimeout(() => setIsCopiedCard(false), 2000);
    } else {
      setIsCopiedSheba(true);
      setTimeout(() => setIsCopiedSheba(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      {/* Background backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 relative">
          <button
            onClick={onClose}
            type="button"
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-black text-xl shadow-lg border border-white/20 shrink-0">
              {user.firstName ? user.firstName[0] : 'ش'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : 'پروفایل شهروندی'}
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  {badge.title}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                مدیریت حساب بانکی جهت تسویه آنی، مشخصات هویتی و پاسپورت زیست‌محیطی
              </p>
            </div>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-white/10 backdrop-blur-md p-1 rounded-xl gap-1 mt-4 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('banking')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'banking' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>شماره کارت و شبا</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>اطلاعات هویتی</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'impact' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>پاسپورت سبز</span>
            </button>
          </div>
        </div>

        {/* Feedback alerts */}
        {saveSuccessMessage && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="m-4 mb-0 p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-center gap-2 text-rose-800 text-xs font-bold animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: BANKING & SETTLEMENT */}
        {activeTab === 'banking' && (
          <form onSubmit={handleSaveProfileAndBank} className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Visual Debit Card Mockup */}
            <div className={`p-5 rounded-2xl text-white shadow-xl bg-gradient-to-br ${detectedBank?.bgGradient || 'from-slate-800 via-slate-700 to-indigo-950'} relative overflow-hidden transition-all duration-300 border border-white/10`}>
              {/* Chip & Bank Logo */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-7 rounded bg-amber-300/80 border border-amber-400 shadow-inner flex items-center justify-center">
                    <div className="w-6 h-4 border-t border-b border-amber-500/50" />
                  </div>
                  <span className="text-[10px] text-white/70 font-mono">EMV CHIP</span>
                </div>

                <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-white/10">
                  <Building2 className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-xs font-black">
                    {detectedBank ? detectedBank.bankName : 'عضو شبکه شتاب کشور'}
                  </span>
                </div>
              </div>

              {/* Formatted Card Number Display */}
              <div className="my-5 text-center relative z-10" style={{ direction: 'ltr' }}>
                <div className="font-mono text-lg sm:text-xl font-bold tracking-widest text-white drop-shadow-md">
                  {cardNumber ? formatCardNumber(cardNumber) : '•••• •••• •••• ••••'}
                </div>
              </div>

              {/* Cardholder Name & Sheba status */}
              <div className="flex items-center justify-between text-xs pt-1 relative z-10">
                <div>
                  <div className="text-[9px] text-white/70 uppercase">صاحب کارت</div>
                  <div className="font-bold text-white">
                    {accountHolder || (user.firstName ? `${user.firstName} ${user.lastName}` : 'نام و نام خانوادگی')}
                  </div>
                </div>

                <div className="text-left" style={{ direction: 'ltr' }}>
                  <div className="text-[9px] text-white/70">IRAN SHETAB</div>
                  <div className="text-[10px] font-mono text-emerald-300 font-bold">
                    {sheba ? 'IBAN CONNECTED' : 'READY FOR PAYOUT'}
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Payout Notice */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-start gap-2.5 text-emerald-950 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>تسویه مستقیم کارت‌به‌کارت:</strong> سفیران پاکیار پس از توزین پسماند خشک در آدرس شما، مبلغ مصوب را مستقیماً به این شماره کارت واریز کرده و فیش بانکی ثبت می‌نمایند.
              </p>
            </div>

            {/* Card Number Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  شماره کارت ۱۶ رقمی بانکی:
                </label>
                {cardNumber && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cardNumber, 'card')}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedCard ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedCard ? 'کپی شد' : 'کپی شماره'}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="مثال: ۶۰۳۷۹۹۱۸۱۲۳۴۵۶۷۸"
                  maxLength={16}
                  style={{ direction: 'ltr' }}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 ${
                    !isCardValid
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
                <CreditCard className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              {detectedBank && (
                <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>بانک تشخیص داده شده: {detectedBank.bankName}</span>
                </p>
              )}
            </div>

            {/* Sheba IBAN Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black text-slate-800">
                  شماره شبا (اختیاری جهت مبالغ بالای ۱۰ میلیون تومان):
                </label>
                {sheba && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(sheba, 'sheba')}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    {isCopiedSheba ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{isCopiedSheba ? 'کپی شد' : 'کپی شبا'}</span>
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={sheba}
                  onChange={handleShebaChange}
                  placeholder="IR00 0000 0000 0000 0000 0000 00"
                  maxLength={26}
                  style={{ direction: 'ltr' }}
                  className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 ${
                    !isShebaValid
                      ? 'border-rose-400 focus:ring-rose-400'
                      : 'border-slate-300 focus:ring-emerald-500/20 focus:border-emerald-500'
                  }`}
                />
              </div>
            </div>

            {/* Account Holder Name */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">
                نام و نام خانوادگی صاحب حساب:
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="مطابق با نام درج شده روی کارت بانکی"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره مشخصات بانکی و تسویه</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: PROFILE & IDENTITY */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfileAndBank} className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800">نام:</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-800">نام خانوادگی:</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">شماره تلفن همراه (تایید شده):</label>
              <div className="relative">
                <input
                  type="text"
                  value={phone}
                  readOnly
                  disabled
                  style={{ direction: 'ltr' }}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <p className="text-[10px] text-slate-500">شماره همراه به عنوان شناسه اصلی حساب کاربری غیرقابل تغییر است.</p>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">کد ملی ۱۰ رقمی (اختیاری جهت گواهی شهرداری):</label>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(normalizeDigits(e.target.value).substring(0, 10))}
                placeholder="۱۰ رقم بدون خط تیره"
                style={{ direction: 'ltr' }}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">شهرستان محل سکونت:</label>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>{CITIES[currentCity]?.fullName || 'نورآباد ممسنی'}</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  دارای خدمات جمع‌آوری درب منزل
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>ذخیره تغییرات هویتی</span>
              </button>
            </div>
          </form>
        )}

        {/* TAB 3: GREEN PASSPORT & CIVIC IMPACT */}
        {activeTab === 'impact' && (
          <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Level Banner */}
            <div className={`p-4 rounded-2xl bg-gradient-to-r ${badge.color} text-white shadow-md flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">{badge.icon}</span>
                <div>
                  <div className="text-xs text-white/80 font-medium">سطح شهروندی زیست‌محیطی:</div>
                  <div className="text-base font-black">{badge.title}</div>
                </div>
              </div>

              <div className="text-left">
                <div className="text-[10px] text-white/80">مجموع بازیافت:</div>
                <div className="text-sm font-black">{toPersianDigits(totalKg)} کیلوگرم</div>
              </div>
            </div>

            {/* Environmental Savings Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                <Trees className="w-5 h-5 text-emerald-700 mx-auto mb-1" />
                <div className="text-base font-black text-emerald-950">{toPersianDigits(treesSaved)}</div>
                <div className="text-[11px] text-emerald-800 font-bold">درخت حفظ‌شده از قطع</div>
              </div>

              <div className="bg-teal-50 border border-teal-200 p-3 rounded-2xl text-center">
                <Wind className="w-5 h-5 text-teal-700 mx-auto mb-1" />
                <div className="text-base font-black text-teal-950">{toPersianDigits(co2Offset)} kg</div>
                <div className="text-[11px] text-teal-800 font-bold">کاهش ردپای کربن CO2</div>
              </div>

              <div className="bg-sky-50 border border-sky-200 p-3 rounded-2xl text-center">
                <Droplet className="w-5 h-5 text-sky-700 mx-auto mb-1" />
                <div className="text-base font-black text-sky-950">{toPersianDigits(waterSaved)} L</div>
                <div className="text-[11px] text-sky-800 font-bold">صرفه‌جویی آب پاک</div>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                <Award className="w-5 h-5 text-amber-700 mx-auto mb-1" />
                <div className="text-base font-black text-amber-950">{toPersianDigits(user.lotteryPoints || 120)}</div>
                <div className="text-[11px] text-amber-800 font-bold">امتیاز و شانس قرعه‌کشی</div>
              </div>
            </div>

            {/* Official Municipal Green Certificate Button */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white p-4 rounded-2xl shadow-md space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-white">گواهی رسمی شهروند سبز شهرداری</h4>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    دارای کد رهگیری و تاییدیه رسمی سازمان مدیریت پسماند شهرستان {CITIES[currentCity]?.name}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenGreenCertificate();
                }}
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-900" />
                <span>مشاهده و چاپ گواهی رسمی شهرداری</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

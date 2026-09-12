import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Scale, 
  Phone, 
  Navigation, 
  CheckCircle, 
  Banknote, 
  HeartHandshake, 
  Power, 
  Filter, 
  AlertCircle,
  Eye,
  Check,
  ShieldCheck,
  Package,
  Map,
  Wallet,
  Sparkles,
  ExternalLink,
  Calendar,
  CheckSquare,
  Square,
  ListOrdered,
  Layers,
  TrendingUp,
  AlertTriangle,
  Lock,
  User,
  Star,
  CreditCard,
  MessageSquare,
  Flag,
  FileText,
  Send,
  EyeOff,
  LogOut,
  Compass
} from 'lucide-react';
import { PickupRequest, CityId, DriverProfile, FeedbackItem } from '../types';
import { CITIES, TIME_SLOTS } from '../data/cities';
import { toPersianDigits, formatTomans, getUpcomingDays } from '../utils/persian';
import { DriverMapCard } from './DriverMapCard';
import { DriverRouteMap } from './DriverRouteMap';
import { NavigationModal } from './NavigationModal';

interface DriverPanelProps {
  currentCity: CityId;
  requests: PickupRequest[];
  drivers?: DriverProfile[];
  onAcceptRequest: (requestId: string, driverName: string) => void;
  onAcceptBatchRequests?: (requestIds: string[], driverName: string) => void;
  onCompletePickup: (
    requestId: string, 
    actualKg: number, 
    cashPaid: number, 
    note?: string, 
    paymentMode?: 'wallet' | 'direct_card',
    ratingToCitizen?: number,
    citizenFeedbackTags?: string[]
  ) => void;
  onFlagIssue?: (requestId: string, issueFlag: 'citizen_absent' | 'waste_unprepared' | 'wrong_address', note: string) => void;
}

export const DriverPanel: React.FC<DriverPanelProps> = ({
  currentCity,
  requests,
  drivers = [],
  onAcceptRequest,
  onAcceptBatchRequests,
  onCompletePickup,
  onFlagIssue
}) => {
  // Authentication State: Phone Number + Password (configured by Admin)
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [phoneInput, setPhoneInput] = useState('09171239988');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Driver Profile State
  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
    id: 'drv-101',
    name: 'سفیر علی رضایی',
    phone: '09171239988',
    nationalId: '2360123456',
    pinCode: '1234',
    vehicleType: 'وانت پراید سفید مسقف',
    plateNumber: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
    cityId: currentCity,
    isOnline: true,
    totalCompletedPickups: 64,
    totalCollectedKg: 890,
    rating: 4.9,
    ratingCount: 52,
    status: 'active',
    statusMessage: '',
    warningCount: 0,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  });

  const [isOnline, setIsOnline] = useState(true);
  const [selectedCityFilter, setSelectedCityFilter] = useState<CityId>(currentCity);
  const [activeTab, setActiveTab] = useState<'schedule' | 'my_active' | 'completed' | 'profile'>('schedule');

  // Days list for sub-menu (شنبه تا جمعه)
  const upcomingDays = useMemo(() => getUpcomingDays(), []);
  const [selectedDayKey, setSelectedDayKey] = useState<string>('all');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('all');

  // Batch selection of requests
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [showRouteMap, setShowRouteMap] = useState<boolean>(true);
  const [showScheduleMap, setShowScheduleMap] = useState<boolean>(true);

  // Complete Pickup Modal State
  const [completingRequest, setCompletingRequest] = useState<PickupRequest | null>(null);
  const [actualWeightKg, setActualWeightKg] = useState<number>(10);
  const [cashAmountTomans, setCashAmountTomans] = useState<number>(150000);
  const [driverCompletionNote, setDriverCompletionNote] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'wallet' | 'direct_card'>('direct_card');
  const [citizenRatingStars, setCitizenRatingStars] = useState<number>(5);
  const [citizenRatingHover, setCitizenRatingHover] = useState<number>(0);
  const [selectedCitizenTags, setSelectedCitizenTags] = useState<string[]>([]);

  // Issue reporting modal
  const [flaggingRequest, setFlaggingRequest] = useState<PickupRequest | null>(null);
  const [selectedIssueType, setSelectedIssueType] = useState<'citizen_absent' | 'waste_unprepared' | 'wrong_address'>('citizen_absent');
  const [issueNote, setIssueNote] = useState('');

  // Navigation Target State
  const [navTarget, setNavTarget] = useState<{
    lat: number;
    lng: number;
    userName: string;
    street: string;
    cityName: string;
  } | null>(null);

  const city = CITIES[selectedCityFilter] || CITIES.noorabad;
  const cityRequests = requests.filter((r) => r.cityId === selectedCityFilter);
  const currentSelectedDay = upcomingDays.find((d) => d.rawDateKey === selectedDayKey) || upcomingDays[0];

  const dayPendingRequests = useMemo(() => {
    return cityRequests.filter((r) => {
      if (r.status !== 'pending') return false;
      if (selectedDayKey === 'all') return true;
      const matchesDay = r.dayOfWeek === currentSelectedDay?.dayName || 
                         r.dateStr.includes(currentSelectedDay?.dayName) ||
                         r.dateStr.includes(currentSelectedDay?.dayNumber);
      return matchesDay;
    });
  }, [cityRequests, currentSelectedDay, selectedDayKey]);

  const filteredPendingRequests = useMemo(() => {
    if (selectedSlotId === 'all') return dayPendingRequests;
    return dayPendingRequests.filter((r) => r.timeSlotId === selectedSlotId);
  }, [dayPendingRequests, selectedSlotId]);

  const myActiveRequests = cityRequests.filter((r) => r.status === 'assigned');
  const completedRequests = cityRequests.filter((r) => r.status === 'collected');

  // Login handler
  const handleDriverLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizeDigits = (str: string) => str.replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString()).trim();
    const cleanPhone = normalizeDigits(phoneInput);
    const cleanPassword = normalizeDigits(passwordInput);

    if (!cleanPhone.startsWith('09') || cleanPhone.length !== 11) {
      setAuthError('شماره موبایل باید ۱۱ رقمی و با ۰۹ آغاز شود (مثال: ۰۹۱۷۱۲۳۹۹۸۸)');
      return;
    }

    const allDrivers = drivers && drivers.length > 0 ? drivers : [driverProfile];
    const matched = allDrivers.find((d) => normalizeDigits(d.phone) === cleanPhone);

    if (matched) {
      const expectedPass = normalizeDigits(matched.password || matched.pinCode || '1234');
      if (cleanPassword === expectedPass || cleanPassword === '1234') {
        setDriverProfile(matched);
        setIsAuthenticated(true);
        setAuthError('');
        return;
      } else {
        setAuthError('رمز عبور وارد شده نادرست است. این رمز توسط مدیریت در پنل ادمین تنظیم می‌شود. (پیش‌فرض تستی: 1234)');
        return;
      }
    }

    // Default fallback driver test account
    if (cleanPhone === '09171239988' && (cleanPassword === '1234' || cleanPassword === (driverProfile.password || '1234'))) {
      setIsAuthenticated(true);
      setAuthError('');
      return;
    }

    setAuthError('سفیری با این شماره موبایل در سیستم ثبت نشده است. لطفاً با مدیر سیستم تماس بگیرید.');
  };

  const handleToggleSelectRequest = (id: string) => {
    setSelectedRequestIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedRequestIds.length === filteredPendingRequests.length) {
      setSelectedRequestIds([]);
    } else {
      setSelectedRequestIds(filteredPendingRequests.map((r) => r.id));
    }
  };

  const handleAcceptBatch = () => {
    if (selectedRequestIds.length === 0) return;
    const driverName = driverProfile.name;
    if (onAcceptBatchRequests) {
      onAcceptBatchRequests(selectedRequestIds, driverName);
    } else {
      selectedRequestIds.forEach((id) => onAcceptRequest(id, driverName));
    }
    setSelectedRequestIds([]);
    setActiveTab('my_active');
  };

  const handleOpenCompleteModal = (req: PickupRequest) => {
    setCompletingRequest(req);
    const kg = req.estimatedKg || 10;
    setActualWeightKg(kg);
    setCashAmountTomans(kg * 15000);
    setDriverCompletionNote('');
    setSelectedPaymentMode('direct_card');
    setCitizenRatingStars(5);
    setCitizenRatingHover(0);
    setSelectedCitizenTags([]);
  };

  const handleConfirmComplete = () => {
    if (!completingRequest) return;
    onCompletePickup(
      completingRequest.id, 
      actualWeightKg, 
      completingRequest.type === 'cash' ? cashAmountTomans : 0,
      driverCompletionNote,
      selectedPaymentMode,
      citizenRatingStars,
      selectedCitizenTags
    );
    setCompletingRequest(null);
  };

  const handleConfirmFlagIssue = () => {
    if (!flaggingRequest) return;
    if (onFlagIssue) {
      onFlagIssue(flaggingRequest.id, selectedIssueType, issueNote);
    }
    setFlaggingRequest(null);
    setIssueNote('');
  };

  // Auth Gate
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900">ورود به پنل سفیران و رانندگان پاکینو</h2>
          <p className="text-xs text-slate-500 mt-1">
            ورود ایمن با شماره تلفن و رمز عبور اختصاصی تنظیم‌شده توسط مدیریت
          </p>
        </div>

        <form onSubmit={handleDriverLogin} className="space-y-3.5 text-right">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              شماره تلفن سفیر (موبایل): <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                dir="ltr"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="09171239988"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-left focus:bg-white outline-hidden tracking-wider"
                required
              />
              <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              رمز عبور اختصاصی سفیر: <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                dir="ltr"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="رمز عبور تعیین‌شده توسط مدیریت"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono font-bold text-left focus:bg-white outline-hidden tracking-wider"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center gap-1.5 text-right">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>تست سفیر نورآباد: ۰۹۱۷۱۲۳۹۹۸۸ (رمز: 1234)</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhoneInput('09171239988');
                setPasswordInput('1234');
                setAuthError('');
              }}
              className="text-emerald-700 font-bold hover:underline bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs cursor-pointer"
            >
              درج خودکار
            </button>
          </div>

          {authError && (
            <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              {authError}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition shadow-md cursor-pointer"
          >
            ورود به پنل راننده
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Driver Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">{driverProfile.name}</h2>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-300 font-black px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-emerald-300 text-emerald-300" />
                  <span>{toPersianDigits(driverProfile.rating)}</span>
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {driverProfile.vehicleType} • پلاک: {driverProfile.plateNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'آماده خدمت (آنلاین)' : 'آفلاین'}</span>
            </button>

            <button
              onClick={() => {
                setIsAuthenticated(false);
                setPasswordInput('');
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border bg-white/10 hover:bg-white/20 text-slate-200 border-white/20"
              title="خروج از حساب سفیر"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج</span>
            </button>
          </div>
        </div>
      </div>

      {/* DRIVER ACCOUNT WARNING / SUSPENSION ALERT */}
      {driverProfile.status === 'suspended' ? (
        <div className="bg-rose-50 border-2 border-rose-300 p-4 rounded-2xl flex items-start gap-3 text-rose-900 shadow-sm animate-pulse">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm text-rose-800">حساب کاربری سفیر در وضعیت تعلیق قرار دارد</div>
            <p>
              {driverProfile.statusMessage || 'حساب کاربری شما به دلیل دریافت شکایات یا میانگین امتیاز ضعیف از سوی شهروندان موقتاً مسدود شده است.'}
            </p>
            <p className="text-[11px] text-rose-700 font-bold">
              جهت بازبینی پرونده و فعال‌سازی مجدد با واحد پشتیبانی ناوگان پاکینو تماس حاصل فرمایید.
            </p>
          </div>
        </div>
      ) : (driverProfile.status === 'warning' || (driverProfile.rating && driverProfile.rating < 3.8)) ? (
        <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-amber-900 shadow-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <div className="font-black text-sm text-amber-800">
              هشدار انضباطی کیفیت خدمات سفیر ({toPersianDigits(driverProfile.warningCount || 1)} اخطار فعال)
            </div>
            <p>
              {driverProfile.statusMessage || `میانگین امتیاز دریافتی شما از شهروندان (${toPersianDigits(driverProfile.rating)} از ۵) پایین‌تر از حد استاندارد است.`}
            </p>
            <p className="text-[11px] text-amber-700 font-medium">
              لطفاً در وقت‌شناسی، دقت در توزین دیجیتال و اخلاق حرفه‌ای دقت فرمایید تا حساب شما دچار تعلیق نگردد.
            </p>
          </div>
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'schedule' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>برنامه هفتگی ({toPersianDigits(filteredPendingRequests.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('my_active')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'my_active' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-sky-600" />
          <span>مسیرهای پذیرفته شده ({toPersianDigits(myActiveRequests.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'completed' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>آرشیو تحویلی ({toPersianDigits(completedRequests.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-3 rounded-xl font-black transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'profile' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4 text-purple-600" />
          <span>پروفایل و آمار سفیر</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULE & PENDING REQUESTS */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Day and Slot filter row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            {/* Days picker (All 7 days from Saturday to Friday) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              <button
                type="button"
                onClick={() => setSelectedDayKey('all')}
                className={`text-xs px-3 py-1.5 rounded-xl font-black transition cursor-pointer whitespace-nowrap ${
                  selectedDayKey === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                همه روزها
              </button>
              {upcomingDays.map((d) => (
                <button
                  key={d.rawDateKey}
                  type="button"
                  onClick={() => setSelectedDayKey(d.rawDateKey)}
                  className={`text-xs px-2.5 py-1.5 rounded-xl font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    selectedDayKey === d.rawDateKey
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span>{d.dayName}</span>
                  <span className="text-[10px] opacity-80">{toPersianDigits(d.dayNumber)}</span>
                  {d.isToday && <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>}
                </button>
              ))}
            </div>

            {/* Batch Select and Accept Button */}
            {filteredPendingRequests.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAllFiltered}
                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  {selectedRequestIds.length === filteredPendingRequests.length ? 'عدم انتخاب' : 'انتخاب همه'}
                </button>

                {selectedRequestIds.length > 0 && (
                  <button
                    onClick={handleAcceptBatch}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl transition shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <span>پذیرش دسته‌جمعی ({toPersianDigits(selectedRequestIds.length)})</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Map for the Selected Day's Pending Requests */}
          <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    نقشه موقعیت و نقطه‌گذاری سفارشات {selectedDayKey === 'all' ? 'کل هفته' : currentSelectedDay?.dayName}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    موقعیت جغرافیایی تمام درخواست‌های در انتظار جمع‌آوری این روز روی نقشه
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-xl border border-emerald-100">
                  {toPersianDigits(filteredPendingRequests.length)} نقطه روی نقشه
                </span>
                <button
                  type="button"
                  onClick={() => setShowScheduleMap(!showScheduleMap)}
                  className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  {showScheduleMap ? 'بستن نقشه' : 'نمایش نقشه'}
                </button>
              </div>
            </div>

            {showScheduleMap && (
              <div>
                {filteredPendingRequests.length === 0 ? (
                  <div className="h-36 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center text-xs text-slate-500 gap-1.5">
                    <Map className="w-6 h-6 text-slate-400" />
                    <span>سفارشی برای این روز جهت نمایش بر روی نقشه وجود ندارد.</span>
                  </div>
                ) : (
                  <DriverRouteMap
                    requests={filteredPendingRequests}
                    cityCenter={city.center}
                    title={`موقعیت سفارشات ${selectedDayKey === 'all' ? 'کل هفته' : currentSelectedDay?.dayName}`}
                    heightClass="h-64 sm:h-80"
                    polylineColor="#10b981"
                  />
                )}
              </div>
            )}
          </div>

          {/* Pending Requests List */}
          {filteredPendingRequests.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              درخواستی برای این تاریخ در وضعیت انتظار وجود ندارد.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingRequests.map((req) => (
                <div
                  key={req.id}
                  className={`bg-white p-4 rounded-2xl border transition shadow-2xs ${
                    selectedRequestIds.includes(req.id) ? 'border-emerald-500 bg-emerald-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedRequestIds.includes(req.id)}
                        onChange={() => handleToggleSelectRequest(req.id)}
                        className="accent-emerald-600 w-4 h-4 rounded-sm cursor-pointer"
                      />
                      <span className="font-mono font-black text-slate-900">{req.trackingCode}</span>
                      <span className="text-slate-400">|</span>
                      <span className="font-bold text-slate-700">{req.userName}</span>
                    </div>

                    <span className="text-[11px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg">
                      {req.timeSlot}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="my-2.5 text-xs text-slate-600 space-y-1">
                    <p><strong>آدرس:</strong> {req.address.street}</p>
                    <div className="flex justify-between items-center text-[11px] pt-1">
                      <span className="font-bold text-slate-800">
                        تخمین بار: {toPersianDigits(req.estimatedKg)} کیلوگرم
                      </span>
                      <span className={`font-bold ${req.type === 'charity' ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {req.type === 'charity' ? 'نیکوکاری' : `نقدی (${formatTomans(req.approximatePayoutTomans)})`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.userPhone}`}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>تماس</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => setNavTarget({
                          lat: req.address.lat,
                          lng: req.address.lng,
                          userName: req.userName,
                          street: req.address.street,
                          cityName: city.name
                        })}
                        className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>مسیریابی و لوکیشن</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onAcceptRequest(req.id, driverProfile.name)}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>پذیرش این سفارش</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY ACTIVE ROUTE */}
      {activeTab === 'my_active' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Top Route Map for All Accepted Requests */}
          {myActiveRequests.length > 0 && (
            <div className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-sky-300 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                    <Navigation className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900">
                      نقشه جامع مسیر و توالی سفارشات پذیرفته‌شده
                    </h3>
                    <p className="text-xs text-slate-500">
                      تمام مقصدهای پذیرفته‌شده امروز به ترتیب توقف روی نقشه متصل و مسیریابی شده‌اند
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black bg-sky-100 text-sky-900 px-3 py-1.5 rounded-xl border border-sky-200">
                    {toPersianDigits(myActiveRequests.length)} توقف فعال
                  </span>
                </div>
              </div>

              <DriverRouteMap
                requests={myActiveRequests}
                cityCenter={city.center}
                title="مسیر حرکت سفیر (ایستگاه‌های پذیرفته‌شده)"
                polylineColor="#0284c7"
                heightClass="h-72 sm:h-96"
              />
            </div>
          )}

          {myActiveRequests.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              درحال حاضر سفارشی در مسیر فعال خود ندارید. از تب «برنامه هفتگی» سفارشات را بپذیرید.
            </div>
          ) : (
            <div className="space-y-4">
              {myActiveRequests.map((req) => (
                <div key={req.id} className="bg-white p-4 sm:p-5 rounded-3xl border-2 border-sky-300 shadow-xs space-y-3.5">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sky-900 bg-sky-100 px-2 py-0.5 rounded-lg">
                        {req.trackingCode}
                      </span>
                      <span className="font-bold text-slate-900">{req.userName}</span>
                    </div>

                    <span className="text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full animate-pulse">
                      درحال مراجعه
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1.5">
                    <p><strong>آدرس تحویل:</strong> {req.address.street}</p>
                    <p><strong>تلفن شهروند:</strong> <span className="font-mono">{toPersianDigits(req.userPhone)}</span></p>
                    {req.address.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg">
                        <strong>یادداشت شهروند:</strong> {req.address.notes}
                      </p>
                    )}
                  </div>

                  {/* Destination Map Card */}
                  <div className="pt-1">
                    <DriverMapCard
                      lat={req.address.lat}
                      lng={req.address.lng}
                      userName={req.userName}
                      street={req.address.street}
                      cityName={city.name}
                    />
                  </div>

                  {/* Single Navigation Action Button (Opens Popup with Neshan, Balad, Waze, Google Maps) */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setNavTarget({
                        lat: req.address.lat,
                        lng: req.address.lng,
                        userName: req.userName,
                        street: req.address.street,
                        cityName: city.name
                      })}
                      className="w-full py-3 px-4 bg-gradient-to-r from-sky-600 via-teal-600 to-emerald-600 hover:from-sky-700 hover:to-emerald-700 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center justify-between shadow-md hover:shadow-lg transition cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition">
                          <Compass className="w-4 h-4 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="font-black text-white">مسیریابی با نرم‌افزارهای نقشه</div>
                          <div className="text-[11px] text-sky-100 font-normal">انتخاب بین نشان، بلد، ویز و گوگل مپ</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1.5 rounded-xl text-xs font-bold backdrop-blur-xs">
                        <Navigation className="w-3.5 h-3.5" />
                        <span>شروع مسیریابی</span>
                      </div>
                    </button>
                  </div>

                  {/* Actions Grid */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${req.userPhone}`}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>تماس تلفنی</span>
                      </a>

                      <button
                        onClick={() => setFlaggingRequest(req)}
                        className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>گزارش مشکل</span>
                      </button>
                    </div>

                    <button
                      onClick={() => handleOpenCompleteModal(req)}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition cursor-pointer"
                    >
                      <Scale className="w-4 h-4" />
                      <span>توزین و تکمیل نهایی</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED ARCHIVE */}
      {activeTab === 'completed' && (
        <div className="space-y-3 animate-in fade-in">
          {completedRequests.length === 0 ? (
            <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center text-xs text-slate-500">
              هنوز سفارشی تکمیل نشده است.
            </div>
          ) : (
            completedRequests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 flex items-center justify-between gap-2">
                <div>
                  <div className="font-mono font-black text-slate-900">{req.trackingCode} - {req.userName}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    وزن تحویلی: {toPersianDigits(req.actualKg || req.estimatedKg)} کیلو • {req.type === 'charity' ? 'نیکوکاری' : `پرداخت نقدی ${formatTomans(req.cashPaidTomans || 0)}`}
                  </div>
                  {req.driverNote && (
                    <div className="text-[10px] text-slate-400 mt-0.5">یادداشت: {req.driverNote}</div>
                  )}
                </div>

                <div className="text-left shrink-0">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded-lg">
                    تکمیل شده
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: DRIVER PROFILE & STATS */}
      {activeTab === 'profile' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl">
              👨‍✈️
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">{driverProfile.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">کد شناسایی راننده: {driverProfile.id}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{toPersianDigits(driverProfile.rating)} از ۵ ({toPersianDigits(driverProfile.ratingCount)} نظر شهروند)</span>
                </span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500">کل مراجعات موفق</div>
              <div className="text-lg font-black text-slate-900 mt-1">
                {toPersianDigits(driverProfile.totalCompletedPickups)} <span className="text-xs font-normal">سفارش</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
              <div className="text-xs text-slate-500">مجموع وزن جمع‌آوری</div>
              <div className="text-lg font-black text-emerald-700 mt-1">
                {toPersianDigits(driverProfile.totalCollectedKg)} <span className="text-xs font-normal">کیلو</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-center col-span-2 sm:col-span-1">
              <div className="text-xs text-slate-500">پلاک و ناوگان</div>
              <div className="text-xs font-bold text-slate-800 font-mono mt-1">
                {driverProfile.plateNumber}
              </div>
            </div>
          </div>

          {/* Account Credentials Box */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1 text-slate-800">
              <div className="font-bold flex items-center gap-1.5 text-emerald-950">
                <Lock className="w-3.5 h-3.5 text-emerald-700" />
                <span>اطلاعات ورود سفیر (تنظیم‌شده در پنل مدیریت):</span>
              </div>
              <div className="text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1 font-mono">
                <span>شماره تماس: <strong className="text-slate-900">{driverProfile.phone}</strong></span>
                <span>رمز عبور: <strong className="text-slate-900">{driverProfile.password || driverProfile.pinCode || '1234'}</strong></span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                setPasswordInput('');
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs self-end sm:self-center"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>خروج از پنل</span>
            </button>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL */}
      {completingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center">
              <h3 className="font-black text-base text-slate-900">
                توزین نهایی و تسویه ({completingRequest.trackingCode})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                مشتری: {completingRequest.userName}
              </p>
            </div>

            {/* Actual Weight Input */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                وزن دقیق باسکول / ترازوی دیجیتال (کیلوگرم):
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={actualWeightKg}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setActualWeightKg(val);
                  setCashAmountTomans(val * 15000);
                }}
                className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-base font-mono font-black text-center text-slate-900 outline-hidden"
              />
            </div>

            {/* Payout if Cash */}
            {completingRequest.type === 'cash' && (
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-900">مبلغ قابل پرداخت به شهروند:</span>
                  <span className="font-black text-emerald-900 font-mono text-sm">
                    {formatTomans(cashAmountTomans)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('direct_card')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      selectedPaymentMode === 'direct_card'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    کارت‌به‌کارت مستقیم راننده
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('wallet')}
                    className={`p-2 rounded-xl border text-center font-bold transition cursor-pointer ${
                      selectedPaymentMode === 'wallet'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    شارژ کیف پول پاکینو
                  </button>
                </div>
              </div>
            )}

            {/* Driver Note */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                یادداشت سفیر در مورد این تحویل (اختیاری):
              </label>
              <input
                type="text"
                value={driverCompletionNote}
                onChange={(e) => setDriverCompletionNote(e.target.value)}
                placeholder="مثال: کارتن‌ها تفکیک‌شده و خشک بودند"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            {/* CITIZEN RATING BY DRIVER (سیستم ستاره‌دهی راننده به شهروند) */}
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>امتیازدهی سفیر به نحوه تفکیک و رفتار شهروند:</span>
                </label>
                <span className="text-[11px] font-bold text-amber-800">
                  {citizenRatingStars === 5 && 'عالی و کاملاً تفکیک‌شده'}
                  {citizenRatingStars === 4 && 'خوب و مرتب'}
                  {citizenRatingStars === 3 && 'متوسط و معمولی'}
                  {citizenRatingStars === 2 && 'ضعیف / تاخیر یا پسماند ناخالص'}
                  {citizenRatingStars === 1 && 'بسیار ضعیف / غیبت در محل'}
                </span>
              </div>

              {/* 5 Stars */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setCitizenRatingHover(star)}
                    onMouseLeave={() => setCitizenRatingHover(0)}
                    onClick={() => setCitizenRatingStars(star)}
                    className="p-1 transition transform hover:scale-125 cursor-pointer"
                    title={`${star} ستاره`}
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        (citizenRatingHover || citizenRatingStars) >= star
                          ? 'fill-amber-400 text-amber-500 drop-shadow-xs'
                          : 'text-slate-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Quick Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  'تفکیک اصولی و تمیز',
                  'بسته‌بندی مناسب',
                  'پسماند خیس یا آلوده',
                  'تاخیر شهروند در تحویل',
                  'برخورد محترمانه'
                ].map((tag) => {
                  const isSelected = selectedCitizenTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedCitizenTags((prev) =>
                          isSelected ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-bold transition cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingRequest(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md"
              >
                ثبت و صدور فاکتور نهایی
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ISSUE FLAGGING MODAL */}
      {flaggingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center">
              <h3 className="font-black text-base text-rose-700">
                گزارش عدم تحویل / مشکل سفارش ({flaggingRequest.trackingCode})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                علت عدم انجام تحویل را انتخاب نمایید:
              </p>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { id: 'citizen_absent', label: 'عدم حضور شهروند در محل پس از تماس' },
                { id: 'waste_unprepared', label: 'عدم تفکیک و آماده نبودن پسماند' },
                { id: 'wrong_address', label: 'آدرس نادرست یا خارج از محدوده تردد' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedIssueType(item.id as any)}
                  className={`w-full p-3 rounded-xl border text-right font-bold transition cursor-pointer ${
                    selectedIssueType === item.id
                      ? 'bg-rose-50 border-rose-500 text-rose-900'
                      : 'bg-slate-50 border-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">توضیح تکمیلی:</label>
              <input
                type="text"
                value={issueNote}
                onChange={(e) => setIssueNote(e.target.value)}
                placeholder="توضیحات کوتاه..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFlaggingRequest(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmFlagIssue}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-xs shadow-md"
              >
                ثبت گزارش مشکل
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Modal */}
      {navTarget && (
        <NavigationModal
          isOpen={!!navTarget}
          onClose={() => setNavTarget(null)}
          lat={navTarget.lat}
          lng={navTarget.lng}
          userName={navTarget.userName}
          street={navTarget.street}
          cityName={navTarget.cityName}
        />
      )}
    </div>
  );
};

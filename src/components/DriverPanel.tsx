import React, { useState, useMemo, useEffect } from 'react';
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
  Compass,
  RotateCcw,
  Plus,
  Trash2
} from 'lucide-react';
import { PickupRequest, CityId, DriverProfile, FeedbackItem, CharityProject, WasteCategory, WeighedItem } from '../types';
import { CITIES, TIME_SLOTS, WASTE_CATEGORIES } from '../data/cities';
import { toPersianDigits, formatTomans, getUpcomingDays } from '../utils/persian';
import { DriverMapCard } from './DriverMapCard';
import { DriverRouteMap } from './DriverRouteMap';
import { NavigationModal } from './NavigationModal';

interface DriverPanelProps {
  currentCity: CityId;
  requests: PickupRequest[];
  drivers?: DriverProfile[];
  charityProjects?: CharityProject[];
  wasteCategories?: WasteCategory[];
  onAcceptRequest: (requestId: string, driverName: string) => void;
  onAcceptBatchRequests?: (requestIds: string[], driverName: string) => void;
  onCancelAssignment?: (requestId: string, reason?: string, driverName?: string) => void;
  onCompletePickup: (
    requestId: string, 
    actualKg: number, 
    cashPaid: number, 
    note?: string, 
    paymentMode?: 'direct_card' | 'cash' | 'wallet',
    ratingToCitizen?: number,
    citizenFeedbackTags?: string[],
    charityConversion?: {
      converted: boolean;
      charityName: string;
      charityAmountTomans: number;
      note?: string;
    },
    cardTransferRefCode?: string,
    weighedItems?: WeighedItem[]
  ) => void;
  onFlagIssue?: (requestId: string, issueFlag: 'citizen_absent' | 'waste_unprepared' | 'wrong_address', note: string) => void;
}

export const DriverPanel: React.FC<DriverPanelProps> = ({
  currentCity,
  requests,
  drivers = [],
  charityProjects = [],
  wasteCategories = WASTE_CATEGORIES,
  onAcceptRequest,
  onAcceptBatchRequests,
  onCancelAssignment,
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
  // Default selected day is TODAY (upcomingDays[0])
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => upcomingDays[0]?.rawDateKey || 'today');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('all');

  // Driver GPS Location & Distance Optimization State
  const [driverGps, setDriverGps] = useState<{ lat: number; lng: number }>(() => {
    return CITIES[currentCity]?.center || { lat: 30.1147, lng: 51.5218 };
  });
  const [isGpsActive, setIsGpsActive] = useState<boolean>(false);

  const requestGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDriverGps({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setIsGpsActive(true);
        },
        () => {
          setDriverGps(CITIES[currentCity]?.center || { lat: 30.1147, lng: 51.5218 });
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  useEffect(() => {
    requestGpsLocation();
  }, [currentCity]);

  // Haversine distance calculator in kilometers
  const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Number((R * c).toFixed(1));
  };

  // Batch selection of requests
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [showRouteMap, setShowRouteMap] = useState<boolean>(true);
  const [showScheduleMap, setShowScheduleMap] = useState<boolean>(true);

  // Complete Pickup Modal State (Item 6: توزین تفکیکی دسته‌بندی‌شده راننده با نرخ مصوب)
  const [completingRequest, setCompletingRequest] = useState<PickupRequest | null>(null);
  const [weighedRows, setWeighedRows] = useState<WeighedItem[]>([]);
  const [driverCompletionNote, setDriverCompletionNote] = useState('');
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<'direct_card' | 'cash'>('direct_card');
  const [citizenRatingStars, setCitizenRatingStars] = useState<number>(5);
  const [citizenRatingHover, setCitizenRatingHover] = useState<number>(0);
  const [selectedCitizenTags, setSelectedCitizenTags] = useState<string[]>([]);
  const [convertToCharity, setConvertToCharity] = useState<boolean>(false);
  const [selectedCharityName, setSelectedCharityName] = useState<string>('');
  const [cardTransferRefCodeInput, setCardTransferRefCodeInput] = useState<string>('');
  const [isCopiedCard, setIsCopiedCard] = useState<boolean>(false);

  // Live Total Calculations from Weighed Rows
  const totalWeightKg = useMemo(() => {
    return Number(weighedRows.reduce((sum, r) => sum + (Number(r.weightKg) || 0), 0).toFixed(1));
  }, [weighedRows]);

  const totalPayoutTomans = useMemo(() => {
    return weighedRows.reduce((sum, r) => sum + (Number(r.subtotalTomans) || 0), 0);
  }, [weighedRows]);

  // Driver Assignment Cancellation Modal State (Item 5)
  const [cancellingAssignmentRequest, setCancellingAssignmentRequest] = useState<PickupRequest | null>(null);
  const [driverCancelReason, setDriverCancelReason] = useState<string>('');
  const [driverCancelPreset, setDriverCancelPreset] = useState<string>('پذیرش اشتباهی نوبت');

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
  const isSelectedDayToday = currentSelectedDay?.isToday || selectedDayKey === upcomingDays[0]?.rawDateKey;

  // Strict Day-by-Day Request Filtering
  const dayPendingRequests = useMemo(() => {
    if (!currentSelectedDay) return [];
    return cityRequests.filter((r) => {
      if (r.status !== 'pending') return false;
      if (r.rawDateKey && currentSelectedDay.rawDateKey) {
        return r.rawDateKey === currentSelectedDay.rawDateKey;
      }
      const matchesDayName = r.dayOfWeek === currentSelectedDay.dayName;
      const matchesDateStr = r.dateStr.includes(currentSelectedDay.dayName) && r.dateStr.includes(currentSelectedDay.dayNumber);
      return matchesDayName && matchesDateStr;
    });
  }, [cityRequests, currentSelectedDay]);

  // Per-day request counts for the weekly schedule bar
  const dayPendingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    upcomingDays.forEach((d) => {
      const c = cityRequests.filter((r) => {
        if (r.status !== 'pending') return false;
        if (r.rawDateKey && d.rawDateKey) return r.rawDateKey === d.rawDateKey;
        return r.dateStr.includes(d.dayName) && r.dateStr.includes(d.dayNumber);
      }).length;
      counts[d.rawDateKey] = c;
    });
    return counts;
  }, [cityRequests, upcomingDays]);

  const filteredPendingRequests = useMemo(() => {
    if (selectedSlotId === 'all') return dayPendingRequests;
    return dayPendingRequests.filter((r) => r.timeSlotId === selectedSlotId);
  }, [dayPendingRequests, selectedSlotId]);

  // Active Requests Sorted by Driver GPS Location (Closest First with Priority Ranks 1, 2, 3, 4...)
  const myActiveRequestsWithPriority = useMemo(() => {
    const activeReqs = cityRequests.filter((r) => r.status === 'assigned');

    const withDist = activeReqs.map((req) => {
      const dist = calculateDistanceKm(
        driverGps.lat,
        driverGps.lng,
        req.address.lat,
        req.address.lng
      );
      return { ...req, distanceKm: dist };
    });

    // Sort closest first
    withDist.sort((a, b) => a.distanceKm - b.distanceKm);

    return withDist.map((req, idx) => ({
      ...req,
      priorityRank: idx + 1
    }));
  }, [cityRequests, driverGps]);

  const myActiveRequests = myActiveRequestsWithPriority;
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
    
    // Initialize itemized weighed rows based on citizen's selected categories
    const availableCategories = wasteCategories || WASTE_CATEGORIES;
    let initialRows: WeighedItem[] = [];

    if (req.weighedItems && req.weighedItems.length > 0) {
      initialRows = req.weighedItems;
    } else if (req.categories && req.categories.length > 0) {
      const perCatEst = Math.max(1, Number(((req.estimatedKg || 10) / req.categories.length).toFixed(1)));
      initialRows = req.categories.map((catName) => {
        const found = availableCategories.find(c => c.name === catName || c.id === catName || catName.includes(c.name));
        const cat = found || availableCategories[0];
        return {
          categoryId: cat.id,
          categoryName: cat.name,
          weightKg: perCatEst,
          ratePerKgTomans: cat.ratePerKgTomans,
          subtotalTomans: Math.round(perCatEst * cat.ratePerKgTomans)
        };
      });
    } else {
      const defCat = availableCategories[0] || { id: 'plastic', name: 'پلاستیک و بطری پت (PET)', ratePerKgTomans: 16000 };
      const defKg = req.estimatedKg || 10;
      initialRows = [{
        categoryId: defCat.id,
        categoryName: defCat.name,
        weightKg: defKg,
        ratePerKgTomans: defCat.ratePerKgTomans,
        subtotalTomans: Math.round(defKg * defCat.ratePerKgTomans)
      }];
    }

    setWeighedRows(initialRows);
    setDriverCompletionNote('');
    setSelectedPaymentMode(req.payoutMethod === 'cash_on_delivery' ? 'cash' : 'direct_card');
    setCitizenRatingStars(5);
    setCitizenRatingHover(0);
    setSelectedCitizenTags([]);
    
    // Charity setup
    const isAlreadyCharity = req.type === 'charity';
    setConvertToCharity(isAlreadyCharity);
    const cityCharities = CITIES[req.cityId]?.charities || [];
    setSelectedCharityName(req.charityName || (cityCharities.length > 0 ? cityCharities[0] : 'موسسه خیریه محک'));
    setCardTransferRefCodeInput(req.cardTransferRefCode || '');
    setIsCopiedCard(false);
  };

  // Row Manipulation Handlers for Itemized Weighing
  const handleCategoryChange = (index: number, newCatId: string) => {
    const availableCategories = wasteCategories || WASTE_CATEGORIES;
    const cat = availableCategories.find(c => c.id === newCatId) || availableCategories[0];
    setWeighedRows(prev => prev.map((row, i) => {
      if (i !== index) return row;
      return {
        ...row,
        categoryId: cat.id,
        categoryName: cat.name,
        ratePerKgTomans: cat.ratePerKgTomans,
        subtotalTomans: Math.round(row.weightKg * cat.ratePerKgTomans)
      };
    }));
  };

  const handleWeightChange = (index: number, newWeight: number) => {
    const w = Math.max(0.1, Number(newWeight) || 0.1);
    setWeighedRows(prev => prev.map((row, i) => {
      if (i !== index) return row;
      return {
        ...row,
        weightKg: w,
        subtotalTomans: Math.round(w * row.ratePerKgTomans)
      };
    }));
  };

  const handleAddRow = () => {
    const availableCategories = wasteCategories || WASTE_CATEGORIES;
    const unusedCat = availableCategories.find(c => !weighedRows.some(r => r.categoryId === c.id)) || availableCategories[0];
    const defaultWeight = 5;
    const newRow: WeighedItem = {
      categoryId: unusedCat.id,
      categoryName: unusedCat.name,
      weightKg: defaultWeight,
      ratePerKgTomans: unusedCat.ratePerKgTomans,
      subtotalTomans: Math.round(defaultWeight * unusedCat.ratePerKgTomans)
    };
    setWeighedRows(prev => [...prev, newRow]);
  };

  const handleRemoveRow = (index: number) => {
    if (weighedRows.length <= 1) return;
    setWeighedRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmComplete = () => {
    if (!completingRequest) return;
    const isCharityFinal = completingRequest.type === 'charity' || convertToCharity;
    const charityMidway = completingRequest.type !== 'charity' && convertToCharity;

    onCompletePickup(
      completingRequest.id, 
      totalWeightKg, 
      isCharityFinal ? 0 : totalPayoutTomans,
      driverCompletionNote,
      isCharityFinal ? undefined : selectedPaymentMode,
      citizenRatingStars,
      selectedCitizenTags,
      charityMidway ? {
        converted: true,
        charityName: selectedCharityName,
        charityAmountTomans: totalPayoutTomans,
        note: 'تبدیل نوبت از دریافت وجه به طرح نیکوکاری در زمان توزین با توافق شهروند'
      } : undefined,
      selectedPaymentMode === 'direct_card' ? cardTransferRefCodeInput.trim() : undefined,
      weighedRows
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
            {/* Days picker (All 7 days from Saturday to Friday - Single day view) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-thin">
              {upcomingDays.map((d) => {
                const count = dayPendingCounts[d.rawDateKey] || 0;
                return (
                  <button
                    key={d.rawDateKey}
                    type="button"
                    onClick={() => setSelectedDayKey(d.rawDateKey)}
                    className={`text-xs px-3 py-2 rounded-xl font-black transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      selectedDayKey === d.rawDateKey
                        ? 'bg-emerald-600 text-white shadow-xs ring-2 ring-emerald-400/30'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{d.dayName}</span>
                    <span className="text-[10px] opacity-80">{toPersianDigits(d.dayNumber)}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-extrabold ${
                      selectedDayKey === d.rawDateKey ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      {toPersianDigits(count)} نوبت
                    </span>
                    {d.isToday && (
                      <span className="bg-amber-400 text-amber-950 font-black text-[9px] px-1.5 py-0.2 rounded-full">
                        امروز
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Batch Select and Accept Button */}
            {filteredPendingRequests.length > 0 && isSelectedDayToday && (
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

          {/* Today Only Acceptance Notice for Future Days */}
          {!isSelectedDayToday && (
            <div className="p-3 bg-amber-50 text-amber-900 border border-amber-200 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                برنامه روز {currentSelectedDay?.dayName} ({currentSelectedDay?.dateStr}): پذیرش و دریافت نوبت‌ها فقط در همان روز (امروز) فعال خواهد شد.
              </span>
            </div>
          )}

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

                    {isSelectedDayToday ? (
                      <button
                        onClick={() => onAcceptRequest(req.id, driverProfile.name)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black flex items-center gap-1 transition shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>پذیرش این سفارش</span>
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-bold border border-slate-200">
                        پذیرش فقط در روز نوبت (امروز)
                      </span>
                    )}
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
                  {/* Location-based Priority Rank Banner */}
                  <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-sky-800 text-white p-3 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white text-emerald-800 font-black text-base flex items-center justify-center shadow-inner shrink-0">
                        {toPersianDigits(req.priorityRank || 1)}
                      </div>
                      <div>
                        <div className="font-black text-xs sm:text-sm">
                          اولویت پیشنهادی مسیریابی: ایستگاه {toPersianDigits(req.priorityRank)}
                        </div>
                        <div className="text-[11px] text-emerald-100 mt-0.5">
                          پیشنهادی بر اساس موقعیت مکانی راننده ({toPersianDigits(req.distanceKm)} کیلومتر فاصله)
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white/20 text-white font-extrabold px-2.5 py-1 rounded-xl backdrop-blur-xs shrink-0">
                      {req.priorityRank === 1 ? 'اولین مقصد پیشنهادی' : req.priorityRank === 2 ? 'دومین مقصد' : req.priorityRank === 3 ? 'سومین مقصد' : `مقصد ${toPersianDigits(req.priorityRank)}`}
                    </span>
                  </div>

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
                    <div className="flex items-center gap-2 flex-wrap">
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

                      <button
                        type="button"
                        onClick={() => {
                          setCancellingAssignmentRequest(req);
                          setDriverCancelPreset('پذیرش اشتباهی نوبت');
                          setDriverCancelReason('');
                        }}
                        className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition border border-amber-200"
                        title="انصراف از جمع‌آوری این نوبت و بازگشت به صف پذیرش"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                        <span>انصراف سفیر</span>
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

      {/* DRIVER ASSIGNMENT CANCELLATION MODAL (Item 5) */}
      {cancellingAssignmentRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 text-right">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  انصراف از جمع‌آوری نوبت ({cancellingAssignmentRequest.trackingCode})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  مشتری: {cancellingAssignmentRequest.userName}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed">
              با تایید انصراف، این نوبت از کارتابل شما خارج شده و مجدداً با وضعیت <strong>«در انتظار سفیر»</strong> در دسترس قرار می‌گیرد تا سایر سفیران یا شما در زمانی دیگر بتوانید آن را تحویل بگیرید.
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                علت انصراف سفیر راننده:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {[
                  'پذیرش اشتباهی نوبت',
                  'نقص فنی و خرابی خودرو',
                  'ترافیک سنگین و بعد مسافت',
                  'تغییر شیفت کاری سفیر',
                  'سایر موارد...'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDriverCancelPreset(preset)}
                    className={`p-2 rounded-xl text-[11px] font-bold text-right border transition cursor-pointer ${
                      driverCancelPreset === preset
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                rows={2}
                value={driverCancelReason}
                onChange={(e) => setDriverCancelReason(e.target.value)}
                placeholder="توضیحات تکمیلی یا علت دقیق انصراف (اختیاری)..."
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingAssignmentRequest(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs cursor-pointer transition"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = driverCancelReason.trim()
                    ? `${driverCancelPreset}: ${driverCancelReason.trim()}`
                    : driverCancelPreset;
                  if (onCancelAssignment) {
                    onCancelAssignment(cancellingAssignmentRequest.id, finalReason, driverProfile.name);
                  }
                  setCancellingAssignmentRequest(null);
                }}
                className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer transition"
              >
                تایید انصراف و بازگشت به صف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETION MODAL (Item 6) */}
      {completingRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[92vh] overflow-y-auto text-right">
            {/* Modal Header */}
            <div className="text-center border-b border-slate-100 pb-3">
              <h3 className="font-black text-base text-slate-900">
                توزین نهایی و تکمیل درخواست ({completingRequest.trackingCode})
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                شهروند: <strong className="text-slate-800">{completingRequest.userName}</strong> • {completingRequest.cityName}
              </p>
            </div>

            {/* TOP REQUEST TYPE BANNER (Item 6: بالای صفحه نوع درخواست را واضح نشان بده) */}
            <div className="space-y-2">
              {completingRequest.type === 'charity' || convertToCharity ? (
                <div className="bg-teal-50 border border-teal-200 p-3.5 rounded-2xl text-teal-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs flex items-center gap-1.5 text-teal-800">
                      <HeartHandshake className="w-4 h-4 text-teal-600" />
                      <span>نوع درخواست: طرح نیکوکاری و عام‌المنفعه</span>
                    </span>
                    <span className="text-[10px] bg-teal-200/60 text-teal-900 font-bold px-2 py-0.5 rounded-md">
                      اهدای وجه پسماند
                    </span>
                  </div>
                  <div className="text-xs text-teal-900 pt-0.5">
                    <strong>نام موسسه خیریه منتخب:</strong> {selectedCharityName || completingRequest.charityName || 'موسسه خیریه امام علی (ع)'}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-blue-950 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs flex items-center gap-1.5 text-blue-800">
                      {completingRequest.payoutMethod === 'direct_card_transfer' ? (
                        <>
                          <CreditCard className="w-4 h-4 text-blue-600" />
                          <span>نوع درخواست: دریافت وجه (کارت‌به‌کارت بانکی)</span>
                        </>
                      ) : (
                        <>
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>نوع درخواست: دریافت وجه (پرداخت نقدی)</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] bg-blue-200/60 text-blue-900 font-bold px-2 py-0.5 rounded-md">
                      تسویه با شهروند
                    </span>
                  </div>
                  {completingRequest.payoutMethod === 'direct_card_transfer' && (
                    <div className="text-xs text-blue-900 flex items-center justify-between pt-0.5">
                      <span>شماره کارت شهروند: <strong className="font-mono">۶۰۳۷-۹۹۷۵-۸۳۲۱-۴۴۱۹</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText('6037997583214419');
                          setIsCopiedCard(true);
                          setTimeout(() => setIsCopiedCard(false), 2000);
                        }}
                        className="text-[10px] bg-white text-blue-700 px-2 py-0.5 rounded-md border border-blue-200 font-bold cursor-pointer hover:bg-blue-50"
                      >
                        {isCopiedCard ? 'کپی شد!' : 'کپی شماره کارت'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* MID-PROCESS CONVERSION TO CHARITY TOGGLE (Item 6) */}
              {completingRequest.type !== 'charity' && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-teal-50 border border-teal-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>تبدیل به طرح نیکوکاری در محل توزین:</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConvertToCharity(!convertToCharity)}
                      className={`text-xs px-3 py-1 rounded-xl font-bold transition cursor-pointer ${
                        convertToCharity
                          ? 'bg-teal-700 text-white shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {convertToCharity ? 'فعال (اهدای وجه به خیریه)' : 'فعال‌سازی اهدا'}
                    </button>
                  </div>

                  {convertToCharity && (
                    <div className="space-y-1.5 pt-1 animate-in fade-in">
                      <label className="block text-[11px] font-bold text-teal-900">
                        انتخاب موسسه خیریه مورد نظر شهروند:
                      </label>
                      <select
                        value={selectedCharityName}
                        onChange={(e) => setSelectedCharityName(e.target.value)}
                        className="w-full p-2 bg-white border border-teal-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden"
                      >
                        {(CITIES[completingRequest.cityId]?.charities || [
                          'موسسه خیریه حضرت امام علی (ع)',
                          'مرکز نیکوکاری نرجس خاتون (س)',
                          'موسسه خیریه قمر بنی هاشم',
                          'موسسه حمایت از بیماران خاص'
                        ]).map((cName) => (
                          <option key={cName} value={cName}>
                            {cName}
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-teal-800">
                        این تغییر در لاگ رسمی سفارش ثبت شده و مبلغ به جای پرداخت به شهروند، به نام این خیریه منظور می‌گردد.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ITEMIZE WEIGHING SECTION (توزین تفکیکی نواری به تفکیک دسته بازیافت و محاسبه خودکار مبلغ) */}
            <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-black text-slate-800">
                    توزین تفکیکی اقلام بازیافتی (مبتنی بر نرخ مصوب):
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddRow}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>افزودن ردیف بازیافت</span>
                </button>
              </div>

              {/* List of Dynamic Rows */}
              <div className="space-y-2.5">
                {weighedRows.map((row, index) => {
                  const availableCategories = wasteCategories || WASTE_CATEGORIES;
                  return (
                    <div 
                      key={index} 
                      className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2 relative group animate-in fade-in"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        {/* Category Selector */}
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            نوع پسماند (ردیف {toPersianDigits(index + 1)}):
                          </label>
                          <select
                            value={row.categoryId}
                            onChange={(e) => handleCategoryChange(index, e.target.value)}
                            className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden"
                          >
                            {availableCategories.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.icon || '♻️'} {c.name} — {formatTomans(c.ratePerKgTomans)} / کیلو
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Weight Input Stepper */}
                        <div className="w-full sm:w-48">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            وزن این قلم (کیلوگرم):
                          </label>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleWeightChange(index, Math.max(0.5, row.weightKg - 1))}
                              className="w-8 h-8 bg-slate-100 border border-slate-300 rounded-lg font-black text-sm text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>

                            <input
                              type="number"
                              min="0.1"
                              step="0.5"
                              value={row.weightKg}
                              onChange={(e) => handleWeightChange(index, Number(e.target.value))}
                              className="w-20 px-2 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-black text-center text-slate-900 outline-hidden"
                            />

                            <button
                              type="button"
                              onClick={() => handleWeightChange(index, row.weightKg + 1)}
                              className="w-8 h-8 bg-slate-100 border border-slate-300 rounded-lg font-black text-sm text-slate-700 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>

                            {weighedRows.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(index)}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition mr-auto cursor-pointer"
                                title="حذف این ردیف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Row Subtotal Calculation Display */}
                      <div className="flex items-center justify-between text-[11px] bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                        <span className="text-slate-500">
                          محاسبه: {toPersianDigits(row.weightKg)} کیلو × {formatTomans(row.ratePerKgTomans)}
                        </span>
                        <span className="font-bold text-emerald-800 font-mono">
                          مبلغ ردیف: {formatTomans(row.subtotalTomans)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Row Button at bottom of list */}
              <button
                type="button"
                onClick={handleAddRow}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-dashed border-emerald-400 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ افزودن ردیف بازیافت دیگر (مثلاً چوب، فلز، کاغذ...)</span>
              </button>

              {/* Real-time Summary Card */}
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-3.5 rounded-xl flex items-center justify-between shadow-xs">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-300 font-bold">مجموع کل وزن باسکول:</div>
                  <div className="text-base font-black font-mono text-emerald-300">
                    {toPersianDigits(totalWeightKg)} کیلوگرم
                  </div>
                </div>

                <div className="text-left space-y-0.5">
                  <div className="text-[10px] text-slate-300 font-bold">جمع کل مبلغ مصوب:</div>
                  <div className="text-base font-black font-mono text-white">
                    {formatTomans(totalPayoutTomans)}
                  </div>
                </div>
              </div>
            </div>

            {/* SEPARATE PAYMENT / CHARITY AMOUNT SECTION (Item 6) */}
            {completingRequest.type === 'charity' || convertToCharity ? (
              <div className="bg-teal-50/80 p-4 rounded-2xl border border-teal-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-teal-950 flex items-center gap-1">
                    <HeartHandshake className="w-4 h-4 text-teal-600" />
                    <span>مبلغ اهدایی به خیریه ({selectedCharityName || completingRequest.charityName || 'خیریه'}):</span>
                  </span>
                  <span className="font-black text-teal-900 font-mono text-base">
                    {formatTomans(totalPayoutTomans)}
                  </span>
                </div>
                <p className="text-[11px] text-teal-800 leading-relaxed bg-white/70 p-2 rounded-xl border border-teal-100">
                  این مبلغ مستقیماً به حساب رسمی موسسه خیریه ثبت و واریز خواهد شد و کد رهگیری نیکوکاری به شهروند پیامک می‌گردد.
                </p>
              </div>
            ) : (
              <div className="bg-emerald-50/90 p-4 rounded-2xl border border-emerald-200 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-black text-emerald-950">
                    مبلغ نهایی تسویه با شهروند:
                  </span>
                  <span className="font-black text-emerald-900 font-mono text-base">
                    {formatTomans(totalPayoutTomans)}
                  </span>
                </div>

                {/* Payment Mode Selection */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('direct_card')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPaymentMode === 'direct_card'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>کارت‌به‌کارت راننده</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPaymentMode('cash')}
                    className={`p-2.5 rounded-xl border text-center font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      selectedPaymentMode === 'cash'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span>پرداخت نقدی</span>
                  </button>
                </div>

                {/* If Card-to-Card: Field for Reference / Receipt code */}
                {selectedPaymentMode === 'direct_card' && (
                  <div className="space-y-1.5 pt-1 animate-in fade-in">
                    <label className="block text-xs font-bold text-slate-800">
                      شماره پیگیری / کد ارجاع تراکنش کارت‌به‌کارت (اختیاری):
                    </label>
                    <input
                      type="text"
                      value={cardTransferRefCodeInput}
                      onChange={(e) => setCardTransferRefCodeInput(e.target.value)}
                      placeholder="مثال: ۸۴۹۲۰۱۴۸ یا شماره ارجاع فیش بانکی"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                )}
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
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-400/20"
              />
            </div>

            {/* CITIZEN RATING BY DRIVER */}
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
                  {citizenRatingStars === 2 && 'ضعیف / ناخالص'}
                  {citizenRatingStars === 1 && 'بسیار ضعیف / غیبت'}
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

            {/* Modal Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCompletingRequest(null)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs cursor-pointer transition"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmComplete}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-xs shadow-md cursor-pointer transition"
              >
                ثبت نهایی و صدور فاکتور
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

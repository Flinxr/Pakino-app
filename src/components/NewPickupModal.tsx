import React, { useState } from 'react';
import { 
  X, 
  HeartHandshake, 
  Banknote, 
  MapPin, 
  Calendar, 
  Clock, 
  Scale, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Gift, 
  Share2, 
  Eye, 
  Check, 
  ShieldAlert,
  Building,
  ChevronRight,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CityId, RecyclingType, PickupRequest, UserProfile } from '../types';
import { CITIES, WASTE_CATEGORIES, TIME_SLOTS } from '../data/cities';
import { 
  toPersianDigits, 
  formatTomans, 
  getUpcomingDays, 
  generateRecyclingId, 
  generateLotteryCode,
  checkInsideCityBoundary
} from '../utils/persian';
import { InteractiveMap } from './InteractiveMap';

interface NewPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityId;
  user: UserProfile;
  existingRequests?: PickupRequest[];
  onRequestCreated: (newRequest: PickupRequest) => void;
  onOpenHistory: () => void;
}

export const NewPickupModal: React.FC<NewPickupModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  user,
  existingRequests = [],
  onRequestCreated,
  onOpenHistory
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;

  // Step indicator: 1 = Type (نیکوکاری یا پول), 2 = Location (نقشه و محدوده), 3 = Time & Weight (روز، ساعت، کیلوگرم), 4 = Tracking Code Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [recyclingType, setRecyclingType] = useState<RecyclingType>('charity');
  const [selectedCharity, setSelectedCharity] = useState(city.charities[0]);

  // Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: city.center.lat,
    lng: city.center.lng
  });
  const [isInsideBoundary, setIsInsideBoundary] = useState(true);
  const [streetAddress, setStreetAddress] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(city.neighborhoods[0]);
  const [plaqueNumber, setPlaqueNumber] = useState('');
  const [unitFloor, setUnitFloor] = useState('');
  const [locationNotes, setLocationNotes] = useState('');

  // Schedule & Weight State
  const upcomingDays = getUpcomingDays();
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [selectedTimeSlotId, setSelectedTimeSlotId] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [estimatedKg, setEstimatedKg] = useState<number>(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    WASTE_CATEGORIES[0].id,
    WASTE_CATEGORIES[1].id
  ]);

  // Generated Result Ticket (Step 4)
  const [generatedRequest, setGeneratedRequest] = useState<PickupRequest | null>(null);

  // Error messaging
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const selectedDay = upcomingDays[selectedDayIndex] || upcomingDays[0];
  const selectedSlot = TIME_SLOTS.find((s) => s.id === selectedTimeSlotId) || TIME_SLOTS[0];

  // Calculate current slot load for the selected day in current city (Max 400 KG)
  const getSlotTotalKg = (slotId: string) => {
    return existingRequests
      .filter((r) => {
        if (r.cityId !== currentCity || r.status === 'cancelled') return false;
        const matchesDay = r.dayOfWeek === selectedDay.dayName || 
                           r.dateStr.includes(selectedDay.dayName) || 
                           r.dateStr.includes(selectedDay.dayNumber);
        return matchesDay && r.timeSlotId === slotId;
      })
      .reduce((sum, r) => sum + (r.estimatedKg || 0), 0);
  };

  const currentSlotWeight = getSlotTotalKg(selectedTimeSlotId);
  const isCurrentSlotFull = (currentSlotWeight + estimatedKg) > 400;

  // Estimated payout if cash mode (average rate ~15,000 Tomans/kg)
  const estimatedPayout = estimatedKg * 15000;

  // Step Navigation Handlers
  const handleProceedToLocation = () => {
    setCurrentStep(2);
    setErrorMessage('');
  };

  const handleProceedToSchedule = () => {
    if (!isInsideBoundary) {
      setErrorMessage('امکان ثبت در خارج از محدوده شهری وجود ندارد. لطفاً پین را داخل محدوده قرار دهید.');
      return;
    }
    if (!streetAddress.trim() && !selectedNeighborhood) {
      setErrorMessage('لطفاً آدرس یا نام محله را وارد نمایید');
      return;
    }
    setErrorMessage('');
    setCurrentStep(3);
  };

  const handleCreateRequest = () => {
    // Validation: Minimum 5 kg
    if (estimatedKg < 5) {
      setErrorMessage('حداقل وزن تفکیک شده ۵ کیلوگرم است. بارهای کمتر از ۵ کیلوگرم به صرفه اقتصادی نمی‌باشد.');
      return;
    }

    // Validation: Slot capacity limit (400kg)
    if (isCurrentSlotFull) {
      setErrorMessage(`ظرفیت ناوگان جمع‌آوری برای بازه ${selectedSlot.timeRange} در روز ${selectedDay.dayName} تکمیل است (حداکثر ۴۰۰ کیلوگرم). لطفاً بازه زمانی یا روز دیگری را انتخاب فرمایید.`);
      return;
    }

    const recyclingId = generateRecyclingId();
    const lotteryCode = generateLotteryCode();

    const fullStreetAddress = streetAddress.trim()
      ? `${selectedNeighborhood}، ${streetAddress}`
      : selectedNeighborhood;

    const requestData: PickupRequest = {
      id: recyclingId,
      trackingCode: `PK-${recyclingId}`,
      userId: user.id || 'guest',
      userName: `${user.firstName} ${user.lastName}`.trim() || 'شهروند محترم',
      userPhone: user.phone || '09170000000',
      cityId: currentCity,
      cityName: city.name,
      type: recyclingType,
      dateStr: selectedDay.dateStr,
      dayOfWeek: selectedDay.dayName,
      timeSlot: selectedSlot.timeRange,
      timeSlotId: selectedTimeSlotId,
      estimatedKg: estimatedKg,
      categories: selectedCategories,
      approximatePayoutTomans: recyclingType === 'cash' ? estimatedPayout : 0,
      charityName: recyclingType === 'charity' ? selectedCharity : undefined,
      address: {
        lat: coords.lat,
        lng: coords.lng,
        street: fullStreetAddress,
        neighborhood: selectedNeighborhood,
        plaque: plaqueNumber,
        unit: unitFloor,
        notes: locationNotes,
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: lotteryCode
    };

    setGeneratedRequest(requestData);
    onRequestCreated(requestData);
    setCurrentStep(4);

    // Trigger celebratory confetti for the citizen!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#059669', '#10b981', '#34d399', '#fbbf24', '#ffffff']
      });
    } catch {
      // ignore
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== categoryId));
      }
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Step indicator */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600 text-white p-5 shrink-0 relative">
          <button
            id="close-new-pickup-modal"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              شهر: {city.name}
            </span>
            <span className="text-xs font-bold bg-emerald-500/30 px-2 py-0.5 rounded-full">
              مرحله {toPersianDigits(currentStep)} از ۴
            </span>
          </div>

          <h2 className="text-xl font-extrabold">
            {currentStep === 1 && 'انتخاب شیوه جمع‌آوری پسماند'}
            {currentStep === 2 && 'موقعیت و آدرس دقیق تحویل'}
            {currentStep === 3 && 'زمان‌بندی و وزن تقریبی پسماند'}
            {currentStep === 4 && 'شماره بازیافت و ثبت نهایی'}
          </h2>

          {/* Progress bar */}
          <div className="grid grid-cols-4 gap-1.5 mt-3">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s <= currentStep ? 'bg-white' : 'bg-white/25'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: CHOOSE COLLECTION TYPE (نیکوکاری یا پول) */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="text-center sm:text-right">
                <p className="text-sm font-bold text-slate-800">
                  مایلید عواید حاصل از بازیافت پسماند خشک شما چگونه صرف شود؟
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  شما می‌توانید انتخاب کنید که مبلغ آن را نقداً دریافت نمایید یا صرف امور خیریه شهر {city.name} شود.
                </p>
              </div>

              {/* Option 1: Charity */}
              <div
                id="option-charity"
                onClick={() => setRecyclingType('charity')}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  recyclingType === 'charity'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    recyclingType === 'charity' ? 'bg-emerald-600 text-white' : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    <HeartHandshake className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                        <span>بازیافت برای نیکوکاری (خیریه)</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          پیشنهادی
                        </span>
                      </h3>
                      {recyclingType === 'charity' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      شهروند پولی دریافت نمی‌کند؛ تمام عواید حاصل از بازیافت صرف خانواده‌های نیازمند و درمان بیماران در {city.name} خواهد شد.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 p-2 rounded-xl">
                      <Gift className="w-3.5 h-3.5 text-emerald-600" />
                      <span>مزیت: دریافت ۲ برابر شانس در قرعه‌کشی ماهانه پاکینو + گواهی نیکوکاری دیجیتال</span>
                    </div>
                  </div>
                </div>

                {/* Charity selector if chosen */}
                {recyclingType === 'charity' && (
                  <div className="mt-4 pt-3 border-t border-emerald-200">
                    <label className="block text-[11px] font-bold text-slate-700 mb-1.5">
                      انتخاب نهاد یا خیریه مورد نظر:
                    </label>
                    <select
                      value={selectedCharity}
                      onChange={(e) => setSelectedCharity(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {city.charities.map((ch) => (
                        <option key={ch} value={ch}>
                          {ch}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Option 2: Cash Payout */}
              <div
                id="option-cash"
                onClick={() => setRecyclingType('cash')}
                className={`p-4 sm:p-5 rounded-3xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                  recyclingType === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    recyclingType === 'cash' ? 'bg-emerald-600 text-white' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Banknote className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900">
                        بازیافت و دریافت وجه نقد
                      </h3>
                      {recyclingType === 'cash' && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      پس از حضور سفیر پاکینو و وزن‌کشی با ترازوی دقیق دیجیتال، وجه معادل به صورت نقدی در محل به شما تحویل داده شده یا واریز آنی می‌گردد.
                    </p>
                    <div className="mt-2.5 flex items-center gap-2 text-[11px] font-bold text-slate-700 bg-slate-100 p-2 rounded-xl">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>تسویه بر مبنای نرخ مصوب روز تفکیک پسماند (میانگین ۱۵,۰۰۰ تومان به ازای هر کیلو)</span>
                    </div>
                  </div>
                </div>
              </div>

              <button
                id="proceed-step1-btn"
                type="button"
                onClick={handleProceedToLocation}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
              >
                <span>مرحله بعد: انتخاب موقعیت روی نقشه</span>
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
            </div>
          )}

          {/* STEP 2: LOCATION & GEOFENCE */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  لوکیشن محل تحویل در شهر {city.name}:
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  پین نقشه را روی موقعیت منزل یا محل کار خود قرار دهید. ثبت سفارش تنها در محدوده شهری امکان‌پذیر است.
                </p>
              </div>

              {/* Map Component */}
              <InteractiveMap
                cityId={currentCity}
                selectedCoords={coords}
                onCoordsChange={(newCoords, isInside) => {
                  setCoords(newCoords);
                  setIsInsideBoundary(isInside);
                  if (!isInside) {
                    setErrorMessage('نقطه انتخابی خارج از محدوده مجاز شهری است.');
                  } else {
                    setErrorMessage('');
                  }
                }}
                selectedNeighborhood={selectedNeighborhood}
                onNeighborhoodSelect={(n) => setSelectedNeighborhood(n)}
              />

              {/* Address Form Inputs */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    نام محله / خیابان اصلی <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="address-street-input"
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder={`مثال: ${selectedNeighborhood}، خیابان معلم، کوچه ۸`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      پلاک یا نام مجتمع
                    </label>
                    <input
                      type="text"
                      value={plaqueNumber}
                      onChange={(e) => setPlaqueNumber(e.target.value)}
                      placeholder="مثال: پلاک ۱۲"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      طبقه و واحد
                    </label>
                    <input
                      type="text"
                      value={unitFloor}
                      onChange={(e) => setUnitFloor(e.target.value)}
                      placeholder="مثال: طبقه ۲ واحد ۴"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    توضیحات و راهنمای راننده (اختیاری)
                  </label>
                  <input
                    type="text"
                    value={locationNotes}
                    onChange={(e) => setLocationNotes(e.target.value)}
                    placeholder="مثال: درب طوسی رنگ، روبروی سوپرمارکت"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  <span>قبلی</span>
                </button>

                <button
                  id="proceed-step2-btn"
                  type="button"
                  onClick={handleProceedToSchedule}
                  disabled={!isInsideBoundary}
                  className={`flex-1 py-3.5 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition ${
                    isInsideBoundary
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <span>مرحله بعد: انتخاب تاریخ و ساعت</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DAY, TIME SLOT & WEIGHT (حداقل ۵ کیلو) */}
          {currentStep === 3 && (
            <div className="space-y-5">
              {/* Day Selector */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>روز جمع‌آوری (ایام هفته پیش رو):</span>
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {upcomingDays.map((day, idx) => {
                    const isSelected = selectedDayIndex === idx;
                    return (
                      <button
                        key={day.rawDateKey}
                        type="button"
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-center transition flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className="text-[10px] opacity-80">{day.dayName}</span>
                        <span className="text-sm font-extrabold my-0.5">{day.dayNumber}</span>
                        <span className="text-[9px] opacity-90">{day.monthName}</span>
                        {day.isToday && (
                          <span className={`text-[8px] px-1 rounded-sm mt-0.5 ${isSelected ? 'bg-white/30 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                            امروز
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time Slots Selector (Exact 3 slots requested) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span>ساعت‌های کاری جمع‌آوری بازیافت:</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTimeSlotId === slot.id;
                    const slotLoadKg = getSlotTotalKg(slot.id);
                    const isSlotOverLimit = slotLoadKg >= 400;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => {
                          setSelectedTimeSlotId(slot.id);
                          setErrorMessage('');
                        }}
                        className={`p-3 rounded-2xl border-2 text-center transition relative ${
                          isSlotOverLimit 
                            ? 'bg-rose-50/70 border-rose-200 opacity-75'
                            : isSelected
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {isSlotOverLimit && (
                          <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.2 rounded-full shadow-xs whitespace-nowrap">
                            ظرفیت تکمیل است
                          </span>
                        )}
                        <div className="text-xs text-slate-500 mb-0.5">{slot.label}</div>
                        <div className={`text-xs sm:text-sm font-black tracking-tight ${isSlotOverLimit ? 'text-rose-900 line-through' : 'text-emerald-800'}`}>
                          {toPersianDigits(slot.timeRange)}
                        </div>
                        {isSlotOverLimit ? (
                          <div className="text-[9px] text-rose-700 font-bold mt-1">
                            تکمیل (۴۰۰ کیلو)
                          </div>
                        ) : (
                          <div className="text-[9px] text-emerald-700 font-semibold mt-1">
                            ظرفیت باز ({toPersianDigits(400 - slotLoadKg)} کیلو آزاد)
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Weight Selector with 5KG Minimum Rule */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>تعداد کیلوگرم تقریبی بازیافت:</span>
                  </label>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    {toPersianDigits(estimatedKg)} کیلوگرم
                  </span>
                </div>

                {/* Weight Stepper Controls */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEstimatedKg((k) => Math.max(5, k - 1))}
                    disabled={estimatedKg <= 5}
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-lg transition ${
                      estimatedKg <= 5
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 shadow-xs'
                    }`}
                  >
                    -
                  </button>

                  <div className="flex-1 text-center bg-white border-2 border-emerald-500/40 py-2.5 rounded-2xl shadow-inner">
                    <span className="text-2xl font-black text-slate-900 font-mono">
                      {toPersianDigits(estimatedKg)}
                    </span>
                    <span className="text-xs text-slate-500 mr-1.5 font-bold">کیلوگرم</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setEstimatedKg((k) => k + 1)}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 flex items-center justify-center font-bold text-lg shadow-xs transition"
                  >
                    +
                  </button>
                </div>

                {/* Quick weight chips */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  {[5, 10, 15, 25, 40, 60].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setEstimatedKg(k)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl font-bold transition ${
                        estimatedKg === k
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {toPersianDigits(k)} کیلو
                    </button>
                  ))}
                </div>

                {/* Mandatory Minimum Notice */}
                <div className="mt-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>شرط حداقل وزن:</strong> به علت هزینه حمل و نقل، حداقل وزن مجاز <strong>۵ کیلوگرم</strong> است و سیستم مقادیر کمتر از ۵ کیلوگرم را نمی‌پذیرد.
                  </p>
                </div>

                {/* Financial / Impact Summary */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                  {recyclingType === 'cash' ? (
                    <>
                      <span className="text-slate-600">برآورد مبلغ دریافتی شما:</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        حدود {formatTomans(estimatedPayout)}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-600">ارزش کمکی به خیریه:</span>
                      <span className="font-extrabold text-emerald-700 text-sm">
                        معادل {formatTomans(estimatedPayout)} وقف نیکوکاری
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Categories Checkboxes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  نوع اقلام پسماند تفکیک شده:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WASTE_CATEGORIES.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategoryToggle(cat.id)}
                        className={`p-2.5 rounded-2xl border text-right text-xs transition flex items-center gap-2 ${
                          isChecked
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="text-base">{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                  <span>قبلی</span>
                </button>

                <button
                  id="submit-request-btn"
                  type="button"
                  onClick={handleCreateRequest}
                  className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2 transition"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>ثبت نهایی و دریافت شماره بازیافت</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: TRACKING CODE & SUCCESS TICKET (صفحه بعد و کد پیگیری) */}
          {currentStep === 4 && generatedRequest && (
            <div className="space-y-5 animate-in zoom-in-95 duration-300">
              {/* Top Success Badge */}
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <CheckCircle className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900">
                  درخواست جمع‌آوری با موفقیت ثبت شد!
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  سفیران پاکینو در تاریخ و ساعت هماهنگ شده به محل شما مراجعه خواهند کرد.
                </p>
              </div>

              {/* Exact Specification Recycling Ticket Card */}
              <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/60 p-5 rounded-3xl border-2 border-emerald-500 shadow-md relative overflow-hidden">
                <div className="absolute -left-6 -top-6 w-24 h-24 bg-emerald-200/40 rounded-full blur-xl pointer-events-none" />
                
                {/* Brand Header of Ticket */}
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-emerald-800 text-base">رسید نوبت بازیافت پاکینو</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      {city.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 font-bold">
                    {generatedRequest.trackingCode}
                  </span>
                </div>

                {/* Exact Text lines as specified by user */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-100/70 border border-emerald-300">
                    <span className="text-slate-700 font-bold">شماره بازیافت شما:</span>
                    <span className="text-xl font-black text-emerald-900 font-mono tracking-wider">
                      {toPersianDigits(generatedRequest.id)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-slate-600">تاریخ جمع‌آوری:</span>
                    <span className="font-extrabold text-slate-900">
                      {toPersianDigits(generatedRequest.dateStr)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-slate-600">ساعت جمع‌آوری:</span>
                    <span className="font-extrabold text-slate-900">
                      {toPersianDigits(generatedRequest.timeSlot)} ({generatedRequest.type === 'charity' ? 'نیکوکاری' : 'دریافت پول'})
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-slate-600">وزن تقریبی:</span>
                    <span className="font-bold text-slate-800">
                      {toPersianDigits(generatedRequest.estimatedKg)} کیلوگرم
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <span className="text-slate-600">آدرس تحویل:</span>
                    <span className="font-medium text-slate-800 text-xs truncate max-w-[220px]">
                      {generatedRequest.address.street}
                    </span>
                  </div>

                  {generatedRequest.type === 'charity' ? (
                    <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                      <span>خیریه مقصد:</span>
                      <span className="font-bold">{generatedRequest.charityName}</span>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-xs text-slate-800 flex items-center justify-between">
                      <span>مبلغ تقریبی نقدی:</span>
                      <span className="font-bold text-emerald-700">{formatTomans(generatedRequest.approximatePayoutTomans)}</span>
                    </div>
                  )}

                  {/* Lottery Ticket Code Info */}
                  <div className="mt-2 p-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-amber-100" />
                      <div>
                        <div className="text-[10px] text-amber-100 font-bold">کد شرکت در قرعه‌کشی ماهانه:</div>
                        <div className="text-xs font-black font-mono tracking-widest">{generatedRequest.lotteryTicketNumber}</div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-white text-amber-900 px-2 py-0.5 rounded-full font-bold">
                      فعال شد
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  id="view-history-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenHistory();
                  }}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-md"
                >
                  <Eye className="w-4 h-4" />
                  <span>مشاهده در سوابق بازیافت من</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(1);
                    onClose();
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-xs transition"
                >
                  بستن و بازگشت به صفحه اصلی
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

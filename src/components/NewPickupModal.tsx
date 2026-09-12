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
  Info,
  Bookmark,
  Plus,
  Trash2,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CityId, RecyclingType, PickupRequest, UserProfile, SavedLocation, CharityProject, WasteCategory } from '../types';
import { CITIES, WASTE_CATEGORIES, TIME_SLOTS, CHARITY_PROJECTS } from '../data/cities';
import { 
  toPersianDigits, 
  formatTomans, 
  getUpcomingDays, 
  generateRecyclingId, 
  generateLotteryCode
} from '../utils/persian';
import { InteractiveMap } from './InteractiveMap';

interface NewPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityId;
  user: UserProfile;
  existingRequests?: PickupRequest[];
  charityProjects?: CharityProject[];
  wasteCategories?: WasteCategory[];
  onRequestCreated: (newRequest: PickupRequest) => void;
  onOpenHistory: () => void;
  initialProjectId?: string;
}

export const NewPickupModal: React.FC<NewPickupModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  user,
  existingRequests = [],
  charityProjects,
  wasteCategories = WASTE_CATEGORIES,
  onRequestCreated,
  onOpenHistory,
  initialProjectId
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;
  const activeCharityProjects = charityProjects && charityProjects.length > 0 ? charityProjects : CHARITY_PROJECTS;

  // Step indicator: 1 = Type & Charity, 2 = Location (Saved or Map), 3 = Schedule & Weight, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [recyclingType, setRecyclingType] = useState<RecyclingType>('charity');
  const [selectedCharity, setSelectedCharity] = useState(city.charities[0]);
  const [selectedCharityProject, setSelectedCharityProject] = useState(
    initialProjectId || (activeCharityProjects.find(p => p.cityId === currentCity)?.id || activeCharityProjects[0]?.id)
  );

  // Payout preference if cash
  const [payoutMethod, setPayoutMethod] = useState<'wallet' | 'direct_card_transfer'>('direct_card_transfer');

  // Saved Locations (Home, Work, Warehouse)
  const [savedLocationsList, setSavedLocationsList] = useState<SavedLocation[]>(
    user.savedLocations || [
      {
        id: 'loc-home',
        title: 'منزل',
        icon: '🏠',
        lat: city.center.lat,
        lng: city.center.lng,
        street: 'خیابان معلم، کوچه لاله ۳',
        neighborhood: city.neighborhoods[0],
        plaque: '۱۲',
        unit: '۲'
      },
      {
        id: 'loc-work',
        title: 'محل کار / مغازه',
        icon: '🏢',
        lat: city.center.lat + 0.002,
        lng: city.center.lng + 0.002,
        street: 'بلوار امام خمینی، روبروی بانک ملی',
        neighborhood: city.neighborhoods[1] || city.neighborhoods[0],
        plaque: '۴۵'
      }
    ]
  );

  const [selectedSavedLocId, setSelectedSavedLocId] = useState<string | null>('loc-home');

  // Location State
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: city.center.lat,
    lng: city.center.lng
  });
  const [isInsideBoundary, setIsInsideBoundary] = useState(true);
  const [streetAddress, setStreetAddress] = useState('خیابان معلم، کوچه لاله ۳');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(city.neighborhoods[0]);
  const [plaqueNumber, setPlaqueNumber] = useState('۱۲');
  const [unitFloor, setUnitFloor] = useState('۲');
  const [locationNotes, setLocationNotes] = useState('');
  const [saveAsNewLocationTitle, setSaveAsNewLocationTitle] = useState('');

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
  const [errorMessage, setErrorMessage] = useState('');

  // Reset form to Step 1 with fresh state so subsequent requests start from scratch
  const resetForm = () => {
    setCurrentStep(1);
    setGeneratedRequest(null);
    setErrorMessage('');
    setSelectedCategories([WASTE_CATEGORIES[0].id, WASTE_CATEGORIES[1].id]);
    setEstimatedKg(10);
    setSelectedDayIndex(0);
    setSelectedTimeSlotId('morning');
    setLocationNotes('');
  };

  const handleCloseModal = () => {
    resetForm();
    onClose();
  };

  const handleStartAnotherRequest = () => {
    resetForm();
    setCurrentStep(1);
  };

  if (!isOpen) return null;

  const selectedDay = upcomingDays[selectedDayIndex] || upcomingDays[0];
  const selectedSlot = TIME_SLOTS.find((s) => s.id === selectedTimeSlotId) || TIME_SLOTS[0];

  const handleApplySavedLocation = (loc: SavedLocation) => {
    setSelectedSavedLocId(loc.id);
    setCoords({ lat: loc.lat, lng: loc.lng });
    setStreetAddress(loc.street);
    if (loc.neighborhood) setSelectedNeighborhood(loc.neighborhood);
    if (loc.plaque) setPlaqueNumber(loc.plaque);
    if (loc.unit) setUnitFloor(loc.unit);
  };

  const handleSaveCurrentAsLocation = () => {
    if (!saveAsNewLocationTitle.trim()) return;
    const newLoc: SavedLocation = {
      id: `loc-${Date.now()}`,
      title: saveAsNewLocationTitle.trim(),
      icon: '📍',
      lat: coords.lat,
      lng: coords.lng,
      street: streetAddress,
      neighborhood: selectedNeighborhood,
      plaque: plaqueNumber,
      unit: unitFloor,
      notes: locationNotes
    };
    setSavedLocationsList((prev) => [...prev, newLoc]);
    setSelectedSavedLocId(newLoc.id);
    setSaveAsNewLocationTitle('');
  };

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
    if (estimatedKg < 5) {
      setErrorMessage('حداقل وزن تفکیک شده ۵ کیلوگرم است.');
      return;
    }

    const recyclingId = generateRecyclingId();
    const lotteryCode = generateLotteryCode();

    const fullStreetAddress = streetAddress.trim()
      ? `${selectedNeighborhood}، ${streetAddress}`
      : selectedNeighborhood;

    const chosenProject = CHARITY_PROJECTS.find(p => p.id === selectedCharityProject);

    const requestData: PickupRequest = {
      id: recyclingId,
      trackingCode: `PK-${recyclingId}`,
      userId: user.id || 'guest',
      userName: `${user.firstName} ${user.lastName}`.trim() || 'شهروند محترم',
      userPhone: user.phone || '09171234567',
      cityId: currentCity,
      cityName: city.name,
      type: recyclingType,
      payoutMethod: recyclingType === 'cash' ? payoutMethod : undefined,
      dateStr: selectedDay.dateStr,
      dayOfWeek: selectedDay.dayName,
      timeSlot: selectedSlot.timeRange,
      timeSlotId: selectedTimeSlotId,
      estimatedKg,
      categories: selectedCategories,
      approximatePayoutTomans: estimatedKg * 15000,
      charityName: recyclingType === 'charity' ? (chosenProject?.title || selectedCharity) : undefined,
      charityProjectId: recyclingType === 'charity' ? selectedCharityProject : undefined,
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

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                {currentStep === 4 ? 'رسید نهایی ثبت درخواست' : 'ثبت درخواست جمع‌آوری پسماند'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                پوشش فعال: {city.name}
              </p>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
            title="بستن پنجره"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper Indicator */}
        {currentStep < 4 && (
          <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs">
            <span className={`font-black flex items-center gap-1.5 ${currentStep >= 1 ? 'text-emerald-800' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">۱</span>
              <span>نوع تسویه</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 rotate-180" />
            <span className={`font-black flex items-center gap-1.5 ${currentStep >= 2 ? 'text-emerald-800' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">۲</span>
              <span>آدرس و مکان</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 rotate-180" />
            <span className={`font-black flex items-center gap-1.5 ${currentStep >= 3 ? 'text-emerald-800' : 'text-slate-400'}`}>
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px]">۳</span>
              <span>زمان و وزن</span>
            </span>
          </div>
        )}

        {/* STEP 1: TYPE (CHARITY vs CASH) */}
        {currentStep === 1 && (
          <div className="p-5 space-y-4">
            <div className="text-xs font-black text-slate-800">
              مایcounter-reset: قصد دارید درآمد حاصل از بازیافت چگونه تخصیص یابد؟
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRecyclingType('charity')}
                className={`p-4 rounded-2xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  recyclingType === 'charity'
                    ? 'border-rose-500 bg-rose-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900">نیکوکاری و مسئولیت اجتماعی</div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    تجهیز پارک‌ها، مدارس و کاشت بلوط در زاگرس
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-rose-200/60 text-[10px] font-black text-rose-700">
                  🎁 ۲ برابر شانس در قرعه‌کشی
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRecyclingType('cash')}
                className={`p-4 rounded-2xl border-2 text-right transition flex flex-col justify-between cursor-pointer ${
                  recyclingType === 'cash'
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Banknote className="w-5 h-5" />
                  </div>
                  <div className="font-black text-xs sm:text-sm text-slate-900">دریافت نقد / کارت‌به‌کارت</div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    پرداخت آنی در محل توسط سفیر پاکینو
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-emerald-200/60 text-[10px] font-black text-emerald-800">
                  ⚡ واریز آنی یا شارژ کیف پول
                </div>
              </button>
            </div>

            {/* Charity Project Picker if Charity selected */}
            {recyclingType === 'charity' && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50/60 p-4 rounded-3xl border border-rose-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-rose-950 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-rose-600" />
                    <span>انتخاب طرح نیکوکاری و مسئولیت اجتماعی:</span>
                  </label>
                  <span className="text-[10px] bg-rose-200/70 text-rose-900 font-extrabold px-2 py-0.5 rounded-full">
                    {activeCharityProjects.length} طرح فعال
                  </span>
                </div>

                <div className="relative">
                  <select
                    value={selectedCharityProject}
                    onChange={(e) => setSelectedCharityProject(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-rose-300 rounded-2xl text-xs font-bold text-slate-900 focus:outline-hidden focus:border-rose-500 focus:ring-3 focus:ring-rose-500/20 shadow-xs transition"
                  >
                    {activeCharityProjects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} - ({p.cityName} | {p.categoryName || 'طرح شهری'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Project Live Preview */}
                {(() => {
                  const currProj = activeCharityProjects.find(p => p.id === selectedCharityProject) || activeCharityProjects[0];
                  if (!currProj) return null;
                  return (
                    <div className="bg-white/80 backdrop-blur-xs p-3 rounded-2xl border border-rose-200/70 text-[11px] text-slate-700 flex items-start gap-2.5 mt-2">
                      <div className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ♥
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-black text-slate-900 text-xs truncate">{currProj.title}</div>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{currProj.description}</p>
                        <div className="mt-1 text-[10px] text-rose-700 font-bold">
                          سازمان مجری: {currProj.organizationName || 'انجمن حامیان سبز و نیکوکاری'}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Direct Payout Preference if Cash */}
            {recyclingType === 'cash' && (
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                <label className="block text-xs font-black text-emerald-900">
                  روش دریافت وجه:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPayoutMethod('direct_card_transfer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      payoutMethod === 'direct_card_transfer'
                        ? 'bg-white text-emerald-900 border-emerald-500 shadow-2xs'
                        : 'bg-white/60 text-slate-600 border-emerald-200'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                    <span>کارت‌به‌کارت مستقیم راننده</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPayoutMethod('wallet')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      payoutMethod === 'wallet'
                        ? 'bg-white text-emerald-900 border-emerald-500 shadow-2xs'
                        : 'bg-white/60 text-slate-600 border-emerald-200'
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                    <span>شارژ کیف پول پاکینو</span>
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceedToLocation}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>مرحله بعد: تعیین آدرس و موقعیت</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: LOCATION & SAVED ADDRESSES */}
        {currentStep === 2 && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Quick Saved Locations Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-800 flex items-center gap-1">
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>آدرس‌های ذخیره‌شده شما:</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {savedLocationsList.map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => handleApplySavedLocation(loc)}
                    className={`p-2.5 rounded-xl border text-right transition cursor-pointer ${
                      selectedSavedLocId === loc.id
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-xs font-black">
                      <span>{loc.icon}</span>
                      <span>{loc.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 truncate mt-1">
                      {loc.street}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Map */}
            <div className="rounded-2xl overflow-hidden border border-slate-200">
              <InteractiveMap
                cityId={currentCity}
                selectedCoords={coords}
                centerLat={coords.lat}
                centerLng={coords.lng}
                selectedNeighborhood={selectedNeighborhood}
                onNeighborhoodSelect={(n) => setSelectedNeighborhood(n)}
                onCoordsChange={(newCoords, inside) => {
                  setCoords(newCoords);
                  setIsInsideBoundary(inside);
                  setSelectedSavedLocId(null);
                }}
                onPositionChange={(lat, lng, inside) => {
                  setCoords({ lat, lng });
                  setIsInsideBoundary(inside);
                  setSelectedSavedLocId(null);
                }}
              />
            </div>

            {/* Neighborhood & Details */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  محله / منطقه:
                </label>
                <select
                  value={selectedNeighborhood}
                  onChange={(e) => setSelectedNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-hidden"
                >
                  {city.neighborhoods.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  آدرس دقیق (خیابان، کوچه):
                </label>
                <input
                  type="text"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="مثال: خیابان معلم، کوچه لاله ۳"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">پلاک:</label>
                  <input
                    type="text"
                    value={plaqueNumber}
                    onChange={(e) => setPlaqueNumber(e.target.value)}
                    placeholder="۱۲"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">واحد / طبقه:</label>
                  <input
                    type="text"
                    value={unitFloor}
                    onChange={(e) => setUnitFloor(e.target.value)}
                    placeholder="۲"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white outline-hidden"
                  />
                </div>
              </div>

              {/* Save address option */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={saveAsNewLocationTitle}
                  onChange={(e) => setSaveAsNewLocationTitle(e.target.value)}
                  placeholder="ذخیره این مکان به نام... (مثال: انبار)"
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                />
                {saveAsNewLocationTitle.trim() && (
                  <button
                    type="button"
                    onClick={handleSaveCurrentAsLocation}
                    className="px-3 py-1.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-xl hover:bg-emerald-200 transition"
                  >
                    ذخیره مکان
                  </button>
                )}
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handleProceedToSchedule}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>مرحله بعد: زمان و وزن بازیافت</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE & WEIGHT */}
        {currentStep === 3 && (
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Day Selector (All 7 Days: شنبه تا جمعه) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-600" />
                  <span>روز مراجعه سفیر پاکینو (شنبه تا جمعه):</span>
                </label>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  ۷ روز هفته فعال
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {upcomingDays.map((d, index) => {
                  const isSelected = selectedDayIndex === index;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedDayIndex(index)}
                      className={`p-2 sm:p-2.5 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center relative ${
                        isSelected
                          ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white border-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100/90'
                      }`}
                    >
                      {d.isToday && (
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full mb-0.5 ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          امروز
                        </span>
                      )}
                      {d.isTomorrow && (
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded-full mb-0.5 ${
                          isSelected ? 'bg-white/25 text-white' : 'bg-sky-100 text-sky-800'
                        }`}>
                          فردا
                        </span>
                      )}
                      <div className="font-black text-xs">{d.dayName}</div>
                      <div className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {toPersianDigits(d.dayNumber)} {d.monthName}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slot */}
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">
                بازه زمانی مراجعه:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => setSelectedTimeSlotId(slot.id)}
                    className={`p-2.5 rounded-2xl border text-center transition cursor-pointer ${
                      selectedTimeSlotId === slot.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="font-black text-xs">{slot.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{toPersianDigits(slot.timeRange)}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Waste Categories Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-800">
                اقلام بازیافتی آماده تحویل:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {wasteCategories.map((cat) => {
                  const isChecked = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          if (selectedCategories.length > 1) {
                            setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                          }
                        } else {
                          setSelectedCategories([...selectedCategories, cat.id]);
                        }
                      }}
                      className={`p-2.5 rounded-2xl border text-right transition cursor-pointer flex items-center gap-2 ${
                        isChecked 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs' 
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-lg">{cat.icon || '📦'}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black truncate">{cat.name}</div>
                        <div className="text-[10px] text-emerald-700 font-mono font-bold">
                          {formatTomans(cat.ratePerKgTomans)} ت/ک
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight Slider */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-slate-800">تخمین وزن تقریبی:</span>
                <span className="font-black text-emerald-700 text-base font-mono">
                  {toPersianDigits(estimatedKg)} کیلوگرم
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={estimatedKg}
                onChange={(e) => setEstimatedKg(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>حداقل ۵ کیلو</span>
                <span>۵۰ کیلو</span>
                <span>۱۰۰+ کیلو</span>
              </div>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600 font-bold bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {errorMessage}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl transition cursor-pointer"
              >
                بازگشت
              </button>
              <button
                type="button"
                onClick={handleCreateRequest}
                className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>ثبت نهایی و دریافت کد رهگیری</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CONFIRMATION RECEIPT */}
        {currentStep === 4 && generatedRequest && (
          <div className="p-5 sm:p-6 space-y-4 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                درخواست شما با موفقیت ثبت شد!
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                سفیر پاکینو در تاریخ هماهنگ‌شده جهت توزین و دریافت مراجعه خواهد کرد.
              </p>
            </div>

            {/* Tracking Code & Lottery Ticket Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-2.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">کد رهگیری سفارش:</span>
                <span className="font-mono font-black text-emerald-800 text-sm">
                  {generatedRequest.trackingCode}
                </span>
              </div>

              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">کد شانس قرعه‌کشی:</span>
                <span className="font-mono font-black text-amber-700 text-sm bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                  {generatedRequest.lotteryTicketNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">زمان هماهنگ شده:</span>
                <span className="font-bold text-slate-800">
                  {toPersianDigits(generatedRequest.dateStr)} (ساعت {toPersianDigits(generatedRequest.timeSlot)})
                </span>
              </div>
            </div>

            {/* Multi-Request Info Notice */}
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-200/80 p-3 rounded-2xl text-[11px] text-right flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                امکان ثبت همزمان چند درخواست برای آدرس‌ها یا انواع پسماند مجزا فراهم است. در بخش <strong>«سوابق من»</strong> می‌توانید وضعیت تمام درخواست‌ها را رصد نمایید.
              </span>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleStartAnotherRequest}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>ثبت درخواست دیگر (لوکیشن یا پسماند مجزا)</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    onOpenHistory();
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs rounded-2xl transition cursor-pointer"
                >
                  مشاهده در سوابق من
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-black text-xs rounded-2xl transition cursor-pointer"
                >
                  تایید و بازگشت
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

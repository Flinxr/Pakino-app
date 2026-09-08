import React, { useState, useMemo } from 'react';
import { 
  Truck, 
  MapPin, 
  Clock, 
  Scale, 
  Phone, 
  Navigation, 
  CheckCircle, 
  DollarSign, 
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
  AlertTriangle
} from 'lucide-react';
import { PickupRequest, CityId, DriverProfile } from '../types';
import { CITIES, TIME_SLOTS } from '../data/cities';
import { toPersianDigits, formatTomans, getUpcomingDays } from '../utils/persian';
import { DriverMapCard } from './DriverMapCard';
import { DriverRouteMap } from './DriverRouteMap';
import { NavigationModal } from './NavigationModal';

interface DriverPanelProps {
  currentCity: CityId;
  requests: PickupRequest[];
  onAcceptRequest: (requestId: string, driverName: string) => void;
  onAcceptBatchRequests?: (requestIds: string[], driverName: string) => void;
  onCompletePickup: (requestId: string, actualKg: number, cashPaid: number) => void;
}

export const DriverPanel: React.FC<DriverPanelProps> = ({
  currentCity,
  requests,
  onAcceptRequest,
  onAcceptBatchRequests,
  onCompletePickup
}) => {
  const [isOnline, setIsOnline] = useState(true);
  const [selectedCityFilter, setSelectedCityFilter] = useState<CityId>(currentCity);
  const [activeTab, setActiveTab] = useState<'schedule' | 'my_active' | 'completed'>('schedule');

  // Days list for sub-menu
  const upcomingDays = useMemo(() => getUpcomingDays(), []);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(() => upcomingDays[0]?.rawDateKey || '');
  const [selectedSlotId, setSelectedSlotId] = useState<string>('all'); // 'all', 'morning', 'afternoon', 'evening'

  // Batch selection of requests
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

  // Toggle map route view
  const [showRouteMap, setShowRouteMap] = useState<boolean>(true);

  // Complete Pickup Modal State
  const [completingRequest, setCompletingRequest] = useState<PickupRequest | null>(null);
  const [actualWeightKg, setActualWeightKg] = useState<number>(10);
  const [cashAmountTomans, setCashAmountTomans] = useState<number>(150000);

  // Navigation Target State
  const [navTarget, setNavTarget] = useState<{
    lat: number;
    lng: number;
    userName: string;
    street: string;
    cityName: string;
  } | null>(null);

  // Map Expanded Toggle State per request
  const [expandedMapId, setExpandedMapId] = useState<string | null>(null);

  const city = CITIES[selectedCityFilter] || CITIES.noorabad;

  // Filter requests for driver's selected city
  const cityRequests = requests.filter((r) => r.cityId === selectedCityFilter);

  // Selected Day Object
  const currentSelectedDay = upcomingDays.find((d) => d.rawDateKey === selectedDayKey) || upcomingDays[0];

  // Filter available pending requests by selected day and time slot
  const dayPendingRequests = useMemo(() => {
    return cityRequests.filter((r) => {
      if (r.status !== 'pending') return false;
      // Match day of week or dateStr
      const matchesDay = r.dayOfWeek === currentSelectedDay?.dayName || 
                         r.dateStr.includes(currentSelectedDay?.dayName) ||
                         r.dateStr.includes(currentSelectedDay?.dayNumber);
      return matchesDay;
    });
  }, [cityRequests, currentSelectedDay]);

  // Further filter by slot if selected
  const filteredPendingRequests = useMemo(() => {
    if (selectedSlotId === 'all') return dayPendingRequests;
    return dayPendingRequests.filter((r) => r.timeSlotId === selectedSlotId);
  }, [dayPendingRequests, selectedSlotId]);

  // Capacity calculation per slot (400 KG max rule)
  const slotStats = useMemo(() => {
    const stats: Record<string, { count: number; totalKg: number; isFull: boolean }> = {
      morning: { count: 0, totalKg: 0, isFull: false },
      afternoon: { count: 0, totalKg: 0, isFull: false },
      evening: { count: 0, totalKg: 0, isFull: false }
    };

    dayPendingRequests.forEach((r) => {
      const slot = r.timeSlotId || 'morning';
      if (stats[slot]) {
        stats[slot].count += 1;
        stats[slot].totalKg += (r.estimatedKg || 0);
      }
    });

    Object.keys(stats).forEach((k) => {
      stats[k].isFull = stats[k].totalKg >= 400;
    });

    return stats;
  }, [dayPendingRequests]);

  const totalFilteredKg = useMemo(() => {
    return filteredPendingRequests.reduce((sum, r) => sum + (r.estimatedKg || 0), 0);
  }, [filteredPendingRequests]);

  const myActiveRequests = cityRequests.filter((r) => r.status === 'assigned');
  const completedRequests = cityRequests.filter((r) => r.status === 'collected');

  // Handle Multi-Select Toggles
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

  // Accept Selected Batch
  const handleAcceptBatch = () => {
    if (selectedRequestIds.length === 0) return;
    const driverName = `سفیر پاکیار ${city.name}`;
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
  };

  const handleWeightChange = (newKg: number) => {
    setActualWeightKg(newKg);
    setCashAmountTomans(newKg * 15000);
  };

  const handleConfirmComplete = () => {
    if (!completingRequest) return;
    onCompletePickup(
      completingRequest.id, 
      actualWeightKg, 
      completingRequest.type === 'cash' ? cashAmountTomans : 0
    );
    setCompletingRequest(null);
  };

  return (
    <div className="space-y-5">
      {/* Driver Status Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-3xl shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black">سامانه هوشمند سفیران پاکیار</h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ناوگان جمع‌آوری
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5">
                مدیریت سفارشات روزانه و مسیریابی بهینه شهرستان‌های {CITIES.noorabad.name} و {CITIES.kazeroon.name}
              </p>
            </div>
          </div>

          {/* Online/Offline & Switch City Toggle */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* City Selector */}
            <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
              <button
                onClick={() => {
                  setSelectedCityFilter('noorabad');
                  setSelectedRequestIds([]);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-black transition ${
                  selectedCityFilter === 'noorabad' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                نورآباد
              </button>
              <button
                onClick={() => {
                  setSelectedCityFilter('kazeroon');
                  setSelectedRequestIds([]);
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-black transition ${
                  selectedCityFilter === 'kazeroon' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                کازرون
              </button>
            </div>

            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition shadow-xs ${
                isOnline
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-700 text-slate-300'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>{isOnline ? 'آنلاین' : 'آفلاین'}</span>
            </button>
          </div>
        </div>

        {/* Global Stats bar */}
        <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-700/60">
          <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700">
            <div className="text-[10px] text-slate-400 font-semibold">کل سفارش‌های در صف شهر</div>
            <div className="text-base sm:text-lg font-black text-amber-400 mt-0.5 font-mono">
              {toPersianDigits(cityRequests.filter(r => r.status === 'pending').length)} سفارش
            </div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700">
            <div className="text-[10px] text-slate-400 font-semibold">ماموریت‌های فعال من</div>
            <div className="text-base sm:text-lg font-black text-sky-400 mt-0.5 font-mono">
              {toPersianDigits(myActiveRequests.length)} سرویس
            </div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-2xl text-center border border-slate-700">
            <div className="text-[10px] text-slate-400 font-semibold">جمع‌آوری‌شده امروز</div>
            <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5 font-mono">
              {toPersianDigits(completedRequests.length)} بار
            </div>
          </div>
        </div>
      </div>

      {/* Primary Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>برنامه هفتگی</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {toPersianDigits(cityRequests.filter(r => r.status === 'pending').length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('my_active')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'my_active'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>مسیرهای من</span>
          <span className="bg-white/20 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {toPersianDigits(myActiveRequests.length)}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
            activeTab === 'completed'
              ? 'bg-slate-800 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          <span>آرشیو تحویلی</span>
          <span className="bg-slate-200 text-slate-800 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
            {toPersianDigits(completedRequests.length)}
          </span>
        </button>
      </div>

      {/* TAB 1: WEEKLY SCHEDULE & TIME SLOT SUBMENU */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Sub-menu 1: Day of week tabs */}
          <div className="bg-white p-3 rounded-3xl border border-slate-200 shadow-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>روز ماموریت:</span>
              </span>
              <span className="text-[11px] font-bold text-slate-500">
                {currentSelectedDay?.dateStr}
              </span>
            </div>

            {/* Days Horizontal Carousel */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {upcomingDays.map((day) => {
                const isSelected = selectedDayKey === day.rawDateKey;
                const dayOrdersCount = cityRequests.filter((r) => {
                  if (r.status !== 'pending') return false;
                  return r.dayOfWeek === day.dayName || 
                         r.dateStr.includes(day.dayName) ||
                         r.dateStr.includes(day.dayNumber);
                }).length;

                return (
                  <button
                    key={day.rawDateKey}
                    onClick={() => {
                      setSelectedDayKey(day.rawDateKey);
                      setSelectedRequestIds([]);
                    }}
                    className={`p-2 rounded-2xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-[10px] opacity-80">{day.dayName}</span>
                    <span className="text-sm font-extrabold my-0.5 font-mono">{toPersianDigits(day.dayNumber)}</span>
                    <span className="text-[9px] opacity-90">{day.monthName}</span>
                    {dayOrdersCount > 0 && (
                      <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full mt-1 ${
                        isSelected ? 'bg-white text-emerald-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {toPersianDigits(dayOrdersCount)} سفارش
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-menu 2: Time Slots and Slot Capacity Status (Max 400 KG per slot) */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <button
              onClick={() => {
                setSelectedSlotId('all');
                setSelectedRequestIds([]);
              }}
              className={`p-3 rounded-2xl border-2 text-right transition cursor-pointer ${
                selectedSlotId === 'all'
                  ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="text-[11px] text-slate-500">تمام بازه‌های روز</div>
              <div className="text-sm font-black text-slate-900 mt-0.5">
                همه ساعات کاری
              </div>
              <div className="text-[11px] text-emerald-700 font-bold mt-1">
                {toPersianDigits(dayPendingRequests.length)} سفارش ({toPersianDigits(dayPendingRequests.reduce((s, r) => s + (r.estimatedKg || 0), 0))} کیلو)
              </div>
            </button>

            {TIME_SLOTS.map((slot) => {
              const stat = slotStats[slot.id] || { count: 0, totalKg: 0, isFull: false };
              const isSelected = selectedSlotId === slot.id;
              const percentFilled = Math.min(100, Math.round((stat.totalKg / 400) * 100));

              return (
                <button
                  key={slot.id}
                  onClick={() => {
                    setSelectedSlotId(slot.id);
                    setSelectedRequestIds([]);
                  }}
                  className={`p-3 rounded-2xl border-2 text-right transition cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">{slot.label} ({toPersianDigits(slot.timeRange)})</span>
                    {stat.isFull ? (
                      <span className="text-[9px] bg-rose-100 text-rose-800 font-bold px-1.5 py-0.2 rounded-md">
                        ظرفیت تکمیل
                      </span>
                    ) : (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                        {toPersianDigits(400 - stat.totalKg)} کیلو مانده
                      </span>
                    )}
                  </div>

                  <div className="text-sm font-black text-slate-900 mt-0.5">
                    {toPersianDigits(stat.count)} سفارش • <span className="font-mono text-emerald-700">{toPersianDigits(stat.totalKg)} کیلو</span>
                  </div>

                  {/* Progress bar towards 400kg capacity */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${stat.isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentFilled}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mt-0.5">
                    <span>حداکثر ظرفیت: ۴۰۰ کیلو</span>
                    <span>{toPersianDigits(percentFilled)}٪ پر شده</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Combined Summary & Batch Actions Bar */}
          <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-200">
                  شیفت {currentSelectedDay?.dayName} {selectedSlotId !== 'all' ? `(${toPersianDigits(TIME_SLOTS.find(s => s.id === selectedSlotId)?.timeRange)})` : ''}
                </span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.2 rounded-full">
                  {city.name}
                </span>
              </div>
              <div className="text-sm font-black mt-0.5 flex items-center gap-2">
                <span>{toPersianDigits(filteredPendingRequests.length)} سفارش</span>
                <span className="text-emerald-300">({toPersianDigits(totalFilteredKg)} کیلو بازیافت)</span>
              </div>
            </div>

            {/* Batch Accept Control */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAllFiltered}
                disabled={filteredPendingRequests.length === 0}
                className="px-3 py-2 bg-white/15 hover:bg-white/25 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {selectedRequestIds.length > 0 && selectedRequestIds.length === filteredPendingRequests.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                    <span>لغو انتخاب</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-emerald-300" />
                    <span>انتخاب همه ({toPersianDigits(filteredPendingRequests.length)})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleAcceptBatch}
                disabled={selectedRequestIds.length === 0}
                className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition shadow-md cursor-pointer ${
                  selectedRequestIds.length > 0
                    ? 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 active:scale-95'
                    : 'bg-white/10 text-white/50 cursor-not-allowed'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>پذیرش ({toPersianDigits(selectedRequestIds.length)})</span>
              </button>
            </div>
          </div>

          {/* Interactive Route Map with Red Pins for sequential pick up */}
          {filteredPendingRequests.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Map className="w-3.5 h-3.5 text-rose-500" />
                  <span>نقشه مسیر جمع‌آوری:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowRouteMap(!showRouteMap)}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  {showRouteMap ? 'مخفی کردن نقشه' : 'نمایش نقشه'}
                </button>
              </div>

              {showRouteMap && (
                <DriverRouteMap
                  requests={filteredPendingRequests}
                  cityCenter={city.center}
                  selectedRequestId={selectedRequestIds[0]}
                />
              )}
            </div>
          )}

          {/* List of Orders for the selected day/slot */}
          <div className="space-y-3">
            {filteredPendingRequests.length === 0 ? (
              <div className="bg-white p-10 rounded-3xl border border-slate-200 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-extrabold text-slate-700 text-sm">
                  سفارشی برای روز {currentSelectedDay?.dayName} در شهر {city.name} ثبت نشده است
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  می‌توانید سایر روزهای هفته یا بازه‌های زمانی دیگر را بررسی نمایید.
                </p>
              </div>
            ) : (
              filteredPendingRequests.map((req, index) => {
                const isSelected = selectedRequestIds.includes(req.id);
                return (
                  <div
                    key={req.id}
                    className={`bg-white rounded-3xl border-2 p-4 sm:p-5 shadow-xs transition space-y-3 ${
                      isSelected ? 'border-emerald-600 bg-emerald-50/20 shadow-md' : 'border-slate-200 hover:border-emerald-500/50'
                    }`}
                  >
                    {/* Header Row: Multi-select checkbox + Order Number + Type */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => handleToggleSelectRequest(req.id)}
                          className="text-slate-600 hover:text-emerald-700 transition cursor-pointer"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Square className="w-5 h-5 text-slate-400" />
                          )}
                        </button>

                        <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center font-mono">
                          {toPersianDigits(index + 1)}
                        </span>

                        <span className="text-xs font-mono font-black bg-slate-100 text-slate-800 px-2 py-0.5 rounded-lg">
                          #{toPersianDigits(req.id)}
                        </span>

                        <span className="text-xs font-black text-slate-900">{req.userName}</span>
                      </div>

                      <div>
                        {req.type === 'charity' ? (
                          <span className="text-[11px] font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <HeartHandshake className="w-3 h-3" />
                            <span>نیکوکاری ({req.charityName || 'خیریه شهرستان'})</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            <span>تسویه نقدی / کیف پول</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Exact 3 required items: Phone, Location, Kilograms + Time */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-200 text-xs">
                      {/* 1. Phone number of citizen */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">شماره تلفن شهروند:</span>
                          <a 
                            href={`tel:${req.userPhone}`}
                            className="font-mono font-black text-slate-900 hover:text-emerald-700 hover:underline"
                          >
                            {toPersianDigits(req.userPhone)}
                          </a>
                        </div>
                      </div>

                      {/* 2. Estimated Weight */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Scale className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">تعداد کیلو بازیافت:</span>
                          <span className="font-mono font-black text-slate-900 text-sm">
                            {toPersianDigits(req.estimatedKg)} کیلوگرم
                          </span>
                        </div>
                      </div>

                      {/* 3. Time & Schedule */}
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">بازه زمانی تحویل:</span>
                          <span className="font-extrabold text-slate-900">
                            {toPersianDigits(req.dayOfWeek)} (ساعت {toPersianDigits(req.timeSlot)})
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 4. Full Location & Address with preview map toggle */}
                    <div className="p-3 bg-white rounded-2xl border border-slate-200 text-xs text-slate-800 flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">
                          <strong>لوکیشن و آدرس:</strong> {req.cityName}، {req.address.street}
                          {req.address.neighborhood ? ` (${req.address.neighborhood})` : ''}
                          {req.address.plaque ? `، پلاک ${toPersianDigits(req.address.plaque)}` : ''}
                          {req.address.unit ? `، واحد ${toPersianDigits(req.address.unit)}` : ''}
                          {req.address.notes ? ` (${req.address.notes})` : ''}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setExpandedMapId(expandedMapId === req.id ? null : req.id)}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-[10px] flex items-center gap-1 shrink-0 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 cursor-pointer"
                      >
                        <Map className="w-3 h-3" />
                        <span>{expandedMapId === req.id ? 'بستن' : 'نقشه اختصاصی'}</span>
                      </button>
                    </div>

                    {/* Expanded single map if opened */}
                    {expandedMapId === req.id && (
                      <div className="animate-in fade-in">
                        <DriverMapCard
                          lat={req.address.lat}
                          lng={req.address.lng}
                          userName={req.userName}
                          street={req.address.street}
                          cityName={req.cityName}
                        />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 pt-1">
                      <button
                        onClick={() => onAcceptRequest(req.id, `سفیر پاکیار ${req.cityName}`)}
                        className="flex-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>پذیرش تکی این سفارش</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setNavTarget({
                          lat: req.address.lat,
                          lng: req.address.lng,
                          userName: req.userName,
                          street: req.address.street,
                          cityName: req.cityName
                        })}
                        className="w-full sm:w-auto px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-800 font-extrabold rounded-2xl text-xs border border-sky-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-sky-600" />
                        <span>مسیریابی سریع</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ACTIVE ASSIGNED REQUESTS & NAVIGATION */}
      {activeTab === 'my_active' && (
        <div className="space-y-4">
          {myActiveRequests.length > 0 && (
            <DriverRouteMap
              requests={myActiveRequests}
              cityCenter={city.center}
            />
          )}

          {myActiveRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-slate-700">در حال حاضر ماموریت فعالی ندارید</p>
              <p className="text-xs text-slate-400 mt-1">از تب سفارشات ایام هفته، سفارش‌ها را به صورت تکی یا دسته‌جمعی پذیرش کنید.</p>
            </div>
          ) : (
            myActiveRequests.map((req, index) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border-2 border-sky-400 p-4 sm:p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-black text-xs flex items-center justify-center font-mono">
                      {toPersianDigits(index + 1)}
                    </span>
                    <span className="text-xs font-mono font-black bg-sky-100 text-sky-900 px-2.5 py-1 rounded-xl">
                      شماره بازیافت: #{toPersianDigits(req.id)}
                    </span>
                    <span className="text-xs font-bold text-slate-900">شهروند: {req.userName}</span>
                  </div>

                  <span className="text-xs font-black bg-sky-600 text-white px-3 py-1 rounded-full shadow-xs">
                    در دست جمع‌آوری
                  </span>
                </div>

                {/* Details summary */}
                <div className="p-3 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-slate-800 space-y-1.5">
                  <div className="leading-relaxed">
                    <strong>آدرس و لوکیشن:</strong> {req.cityName}، {req.address.street}
                    {req.address.neighborhood ? ` (${req.address.neighborhood})` : ''}
                    {req.address.plaque ? `، پلاک ${toPersianDigits(req.address.plaque)}` : ''}
                    {req.address.unit ? `، واحد ${toPersianDigits(req.address.unit)}` : ''}
                    {req.address.notes ? ` (${req.address.notes})` : ''}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-sky-100 text-[11px]">
                    <span>تلفن: <strong className="font-mono font-bold">{toPersianDigits(req.userPhone)}</strong></span>
                    <span>وزن تخمینی: <strong>{toPersianDigits(req.estimatedKg)} کیلوگرم</strong> ({req.type === 'charity' ? 'نیکوکاری' : 'تسویه نقدی'})</span>
                  </div>
                </div>

                {/* Driver Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href={`tel:${req.userPhone}`}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>تماس با شهروند ({toPersianDigits(req.userPhone)})</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setNavTarget({
                      lat: req.address.lat,
                      lng: req.address.lng,
                      userName: req.userName,
                      street: req.address.street,
                      cityName: req.cityName
                    })}
                    className="py-2.5 px-3 bg-sky-600 hover:bg-sky-700 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition shadow-md"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>مسیریابی (نشان/بلد/ویز/گوگل)</span>
                  </button>

                  <button
                    onClick={() => handleOpenCompleteModal(req)}
                    className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>ثبت وزن و تسویه نهایی</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED ARCHIVE */}
      {activeTab === 'completed' && (
        <div className="space-y-3">
          {completedRequests.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="font-extrabold text-slate-700">هنوز سرویس تکمیل‌شده‌ای ثبت نشده است</p>
            </div>
          ) : (
            completedRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 p-4 flex items-center justify-between text-xs shadow-xs"
              >
                <div>
                  <div className="font-extrabold text-slate-900">
                    شماره بازیافت: #{toPersianDigits(req.id)} • {req.userName}
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    شهر: {req.cityName} | تاریخ: {toPersianDigits(req.dateStr)} | وزن دقیق: <strong className="text-slate-800 font-mono">{toPersianDigits(req.actualKg || req.estimatedKg)} کیلو</strong>
                  </div>
                </div>

                <div className="text-left">
                  {req.type === 'charity' ? (
                    <span className="font-extrabold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl">
                      صرف خیریه شد
                    </span>
                  ) : (
                    <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl font-mono">
                      {formatTomans(req.cashPaidTomans || req.approximatePayoutTomans)} شارژ شد
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Navigation Modal */}
      {navTarget && (
        <NavigationModal
          isOpen={true}
          onClose={() => setNavTarget(null)}
          lat={navTarget.lat}
          lng={navTarget.lng}
          userName={navTarget.userName}
          street={navTarget.street}
          cityName={navTarget.cityName}
        />
      )}

      {/* Scale & Weighing Completion Modal */}
      {completingRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <Scale className="w-5 h-5 text-emerald-600" />
                <span>ثبت وزن‌کشی نهایی ترازوی دیجیتال</span>
              </h3>
              <button
                onClick={() => setCompletingRequest(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-900 font-bold">
              شماره بازیافت: <strong>#{toPersianDigits(completingRequest.id)}</strong> | شهروند: {completingRequest.userName} ({completingRequest.cityName})
            </div>

            {/* Scale Weight Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                وزن دقیق اندازه‌گیری شده با ترازوی دیجیتال (کیلوگرم):
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleWeightChange(Math.max(5, actualWeightKg - 1))}
                  className="w-11 h-11 rounded-2xl bg-slate-100 font-black text-lg hover:bg-slate-200 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  value={actualWeightKg}
                  onChange={(e) => handleWeightChange(Math.max(1, Number(e.target.value)))}
                  className="flex-1 text-center font-mono text-2xl font-black py-2.5 border-2 border-emerald-500/40 rounded-2xl text-emerald-900 focus:border-emerald-600 focus:outline-none"
                  min={5}
                />
                <button
                  type="button"
                  onClick={() => handleWeightChange(actualWeightKg + 1)}
                  className="w-11 h-11 rounded-2xl bg-slate-100 font-black text-lg hover:bg-slate-200 transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Financial or Charity Payout */}
            {completingRequest.type === 'cash' ? (
              <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-900">مبلغ واریز به کیف پول شهروند:</span>
                  <span className="font-mono font-black text-emerald-800 text-sm">
                    {formatTomans(cashAmountTomans)}
                  </span>
                </div>
                <input
                  type="number"
                  value={cashAmountTomans}
                  onChange={(e) => setCashAmountTomans(Number(e.target.value))}
                  className="w-full font-mono text-sm py-2 px-3 bg-white border border-emerald-300 rounded-xl font-bold text-emerald-700 focus:outline-none"
                />
                <p className="text-[11px] text-emerald-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>این مبلغ بلافاصله به کیف پول حساب شهروند واریز می‌شود.</span>
                </p>
              </div>
            ) : (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
                ❤️ عواید کامل این بار به ارزش تقریبی <strong>{formatTomans(actualWeightKg * 15000)}</strong> مستقیماً به حساب خیریه واریز خواهد شد.
              </div>
            )}

            <button
              onClick={handleConfirmComplete}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <Check className="w-5 h-5" />
              <span>تایید نهایی و صدور فاکتور تحویل</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

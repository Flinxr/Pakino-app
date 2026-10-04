import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, 
  Clock, 
  Scale, 
  Check, 
  X, 
  Copy, 
  Save, 
  Plus, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Flame, 
  Layers, 
  Sparkles,
  Info
} from 'lucide-react';
import { CityId, PickupRequest } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits } from '../../utils/persian';

export interface ShiftSlot {
  id: string;
  name: string;
  timeRange: string;
}

export const FOUR_SHIFTS: ShiftSlot[] = [
  { id: 'shift-1', name: 'شیفت ۱ (صبح زود)', timeRange: '۰۸:۰۰ الی ۱۱:۰۰' },
  { id: 'shift-2', name: 'شیفت ۲ (نیمروز)', timeRange: '۱۱:۰۰ الی ۱۴:۰۰' },
  { id: 'shift-3', name: 'شیفت ۳ (عصر)', timeRange: '۱۴:۰۰ الی ۱۷:۰۰' },
  { id: 'shift-4', name: 'شیفت ۴ (غروب و شب)', timeRange: '۱۷:۰۰ الی ۲۰:۰۰' }
];

export const WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه'
];

export interface SlotConfig {
  isActive: boolean;
  maxKg: number;
  maxRequests: number;
}

export interface DateException {
  id: string;
  dateStr: string; // e.g. "۱۴۰۵/۰۶/۲۵"
  title: string; // e.g. "تعطیلی رسمی اربعین"
  isFullShutdown: boolean;
  customKg?: number;
  note?: string;
}

interface AdminCapacityShiftMatrixProps {
  currentCity: CityId;
  requests: PickupRequest[];
}

export const AdminCapacityShiftMatrix: React.FC<AdminCapacityShiftMatrixProps> = ({
  currentCity,
  requests = []
}) => {
  // 7 days x 4 shifts configuration matrix
  // Key format: `${dayIndex}-${shiftId}`
  const storageKey = `pakino_capacity_matrix_${currentCity}`;
  const exceptionStorageKey = `pakino_capacity_exceptions_${currentCity}`;

  const [matrix, setMatrix] = useState<Record<string, SlotConfig>>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {}

    // Default configuration: 7x4 matrix with 400kg / 20 requests per slot
    const initial: Record<string, SlotConfig> = {};
    for (let day = 0; day < 7; day++) {
      FOUR_SHIFTS.forEach((shift) => {
        const isFridayEvening = day === 6 && (shift.id === 'shift-4');
        initial[`${day}-${shift.id}`] = {
          isActive: !isFridayEvening,
          maxKg: 400,
          maxRequests: 20
        };
      });
    }
    return initial;
  });

  // Date Exceptions List
  const [exceptions, setExceptions] = useState<DateException[]>(() => {
    try {
      const saved = localStorage.getItem(exceptionStorageKey);
      if (saved) return JSON.parse(saved);
    } catch {}

    return [
      {
        id: 'exc-1',
        dateStr: '۲۸ صفر ۱۴۰۵',
        title: 'تعطیلی سراسری رسمی',
        isFullShutdown: true,
        note: 'توقف کل عملیات جمع‌آوری ناوگان'
      },
      {
        id: 'exc-2',
        dateStr: 'جمعه اول مهر ۱۴۰۵',
        title: 'سرویس‌دهی ویژه پاکسازی محله‌های گردشگری',
        isFullShutdown: false,
        customKg: 600,
        note: 'افزایش سقف شیفت صبح تا ۶۰۰ کیلوگرم'
      }
    ];
  });

  // Form states for new date exception
  const [newExcDate, setNewExcDate] = useState('');
  const [newExcTitle, setNewExcTitle] = useState('');
  const [newExcIsShutdown, setNewExcIsShutdown] = useState(true);
  const [newExcCustomKg, setNewExcCustomKg] = useState(300);
  const [newExcNote, setNewExcNote] = useState('');
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Save changes
  const handleSaveMatrix = () => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(matrix));
      localStorage.setItem(exceptionStorageKey, JSON.stringify(exceptions));
      setIsSavedNotice(true);
      setTimeout(() => setIsSavedNotice(false), 3000);
    } catch {}
  };

  const handleToggleSlot = (dayIdx: number, shiftId: string) => {
    const key = `${dayIdx}-${shiftId}`;
    setMatrix((prev) => {
      const cur = prev[key] || { isActive: true, maxKg: 400, maxRequests: 20 };
      return {
        ...prev,
        [key]: { ...cur, isActive: !cur.isActive }
      };
    });
  };

  const handleUpdateKg = (dayIdx: number, shiftId: string, val: number) => {
    const key = `${dayIdx}-${shiftId}`;
    setMatrix((prev) => {
      const cur = prev[key] || { isActive: true, maxKg: 400, maxRequests: 20 };
      return {
        ...prev,
        [key]: { ...cur, maxKg: Math.max(50, val) }
      };
    });
  };

  const handleUpdateMaxReq = (dayIdx: number, shiftId: string, val: number) => {
    const key = `${dayIdx}-${shiftId}`;
    setMatrix((prev) => {
      const cur = prev[key] || { isActive: true, maxKg: 400, maxRequests: 20 };
      return {
        ...prev,
        [key]: { ...cur, maxRequests: Math.max(1, val) }
      };
    });
  };

  const handleCopyDaySettingsToAll = (sourceDayIdx: number) => {
    setMatrix((prev) => {
      const updated = { ...prev };
      FOUR_SHIFTS.forEach((shift) => {
        const sourceConfig = prev[`${sourceDayIdx}-${shift.id}`];
        if (sourceConfig) {
          for (let targetDay = 0; targetDay < 7; targetDay++) {
            updated[`${targetDay}-${shift.id}`] = { ...sourceConfig };
          }
        }
      });
      return updated;
    });
  };

  const handleAddException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExcDate.trim() || !newExcTitle.trim()) return;

    const newExc: DateException = {
      id: `exc-${Date.now()}`,
      dateStr: newExcDate.trim(),
      title: newExcTitle.trim(),
      isFullShutdown: newExcIsShutdown,
      customKg: newExcIsShutdown ? undefined : newExcCustomKg,
      note: newExcNote.trim() || undefined
    };

    setExceptions((prev) => [newExc, ...prev]);
    setNewExcDate('');
    setNewExcTitle('');
    setNewExcNote('');
  };

  const handleDeleteException = (id: string) => {
    setExceptions((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-6 animate-in fade-in text-right">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-black text-sm sm:text-base text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>مدیریت جامع شیفت‌ها و ظرفیت جمع‌آوری (ماتریس ۷×۴ هفتگی)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            تنظیم سقف ظرفیت وزنی و تعدادی در ۲۸ بازه زمانی هفته با پشتیبانی از الگوی تکرارشونده و تقویم استثناها
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isSavedNotice && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>تنظیمات ذخیره شد</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSaveMatrix}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition"
          >
            <Save className="w-4 h-4" />
            <span>ذخیره ماتریس و استثناها</span>
          </button>
        </div>
      </div>

      {/* MATRIX TABLE: 7 DAYS x 4 SHIFTS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-black text-xs text-slate-800 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>ماتریس ظرفیت ۲۸ خانه (۷ روز هفته × ۴ شیفت زمانی):</span>
          </h4>
          <span className="text-[11px] text-slate-400">
            شهر: {CITIES[currentCity]?.name}
          </span>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 font-black border-b border-slate-200">
              <tr>
                <th className="py-3 px-3 w-28">روز هفته</th>
                {FOUR_SHIFTS.map((shift) => (
                  <th key={shift.id} className="py-3 px-3 text-center min-w-[190px]">
                    <div>{shift.name}</div>
                    <div className="text-[10px] font-normal text-slate-400 font-mono mt-0.5">
                      {shift.timeRange}
                    </div>
                  </th>
                ))}
                <th className="py-3 px-2 text-center w-24">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WEEK_DAYS.map((dayName, dayIdx) => (
                <tr key={dayName} className="hover:bg-slate-50/70 transition">
                  {/* Day Name */}
                  <td className="py-3 px-3 font-black text-slate-900 bg-slate-50/50">
                    <span className="text-xs">{dayName}</span>
                  </td>

                  {/* 4 Shift Columns */}
                  {FOUR_SHIFTS.map((shift) => {
                    const key = `${dayIdx}-${shift.id}`;
                    const config = matrix[key] || { isActive: true, maxKg: 400, maxRequests: 20 };

                    return (
                      <td key={shift.id} className="p-2">
                        <div
                          className={`p-2.5 rounded-xl border transition space-y-2 ${
                            config.isActive
                              ? 'bg-white border-slate-200 shadow-2xs'
                              : 'bg-rose-50/50 border-rose-200 opacity-70'
                          }`}
                        >
                          {/* Toggle Active */}
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">
                              {config.isActive ? '✅ شیفت فعال' : '⛔ غیرفعال'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleToggleSlot(dayIdx, shift.id)}
                              className={`w-6 h-6 rounded-lg flex items-center justify-center cursor-pointer transition ${
                                config.isActive
                                  ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              }`}
                              title={config.isActive ? 'غیرفعال‌سازی شیفت' : 'فعال‌سازی شیفت'}
                            >
                              {config.isActive ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                            </button>
                          </div>

                          {/* Inputs */}
                          {config.isActive && (
                            <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                              <div>
                                <label className="block text-[9px] text-slate-400 mb-0.5">سقف کیلو:</label>
                                <input
                                  type="number"
                                  min="50"
                                  step="50"
                                  value={config.maxKg}
                                  onChange={(e) => handleUpdateKg(dayIdx, shift.id, Number(e.target.value))}
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono text-center font-bold text-slate-800"
                                />
                              </div>
                              <div>
                                <label className="block text-[9px] text-slate-400 mb-0.5">حداکثر نوبت:</label>
                                <input
                                  type="number"
                                  min="1"
                                  value={config.maxRequests}
                                  onChange={(e) => handleUpdateMaxReq(dayIdx, shift.id, Number(e.target.value))}
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-mono text-center font-bold text-slate-800"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Copy Row Settings to all days */}
                  <td className="py-3 px-2 text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyDaySettingsToAll(dayIdx)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 mx-auto cursor-pointer transition"
                      title="کپی کردن تنظیمات ۴ شیفت این روز به تمام روزهای هفته"
                    >
                      <Copy className="w-3 h-3 text-indigo-600" />
                      <span>کپی به همه</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DATE EXCEPTIONS & HOLIDAYS (استثنا برای تاریخ‌های خاص) */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>استثنا برای تاریخ‌های خاص (تعطیلات رسمی و شیفت‌های اضطراری):</span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              در روزهای استثنا، چیدمان و ظرفیت‌های این جدول به جای ماتریس هفتگی پیش‌فرض اعمال می‌شود.
            </p>
          </div>
        </div>

        {/* Add Exception Form */}
        <form onSubmit={handleAddException} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
          <div className="font-bold text-xs text-slate-800">تعریف استثنا یا تعطیلی جدید:</div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block text-[11px] text-slate-600 mb-1">تاریخ یا مناسبت:</label>
              <input
                type="text"
                value={newExcDate}
                onChange={(e) => setNewExcDate(e.target.value)}
                placeholder="مثال: ۲۲ بهمن ۱۴۰۵"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">عنوان وضعیت:</label>
              <input
                type="text"
                value={newExcTitle}
                onChange={(e) => setNewExcTitle(e.target.value)}
                placeholder="مثال: تعطیلی رسمی سراسری"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-600 mb-1">نوع وضعیت در این روز:</label>
              <select
                value={newExcIsShutdown ? 'shutdown' : 'custom'}
                onChange={(e) => setNewExcIsShutdown(e.target.value === 'shutdown')}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
              >
                <option value="shutdown">⛔ تعطیلی کامل (توقف پذیرش نوبت)</option>
                <option value="custom">⚡ سقف ظرفیت متغیر و اختصاصی</option>
              </select>
            </div>

            {!newExcIsShutdown ? (
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">سقف ویژه (کیلوگرم):</label>
                <input
                  type="number"
                  value={newExcCustomKg}
                  onChange={(e) => setNewExcCustomKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">یادداشت برای اطلاع‌رسانی:</label>
                <input
                  type="text"
                  value={newExcNote}
                  onChange={(e) => setNewExcNote(e.target.value)}
                  placeholder="مثال: سرویس‌دهی از روز بعد برقرار است"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن استثنا به تقویم</span>
            </button>
          </div>
        </form>

        {/* Existing Exceptions List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {exceptions.map((exc) => (
            <div
              key={exc.id}
              className="p-3.5 bg-white rounded-2xl border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                    {exc.dateStr}
                  </span>
                  <span>{exc.title}</span>
                </div>
                <div className="text-[11px] text-slate-500">
                  {exc.isFullShutdown ? (
                    <span className="text-rose-600 font-bold">⛔ تعطیلی کامل ناوگان</span>
                  ) : (
                    <span className="text-emerald-700 font-bold">
                      ظرفیت ویژه: {toPersianDigits(exc.customKg || 400)} کیلوگرم
                    </span>
                  )}
                  {exc.note && ` • ${exc.note}`}
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDeleteException(exc.id)}
                className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center cursor-pointer transition shrink-0"
                title="حذف این استثنا"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Checks shift availability considering matrix settings, date exceptions, and current occupancy (Item 9).
 */
export function checkShiftAvailability(
  cityId: CityId,
  dayName: string,
  dateStr: string,
  shiftId: string,
  existingRequests: PickupRequest[]
): {
  isAvailable: boolean;
  reason?: string;
  remainingKg: number;
  remainingRequests: number;
} {
  // 1. Check Date Exceptions
  try {
    const excKey = `pakino_capacity_exceptions_${cityId}`;
    const excSaved = localStorage.getItem(excKey);
    if (excSaved) {
      const exceptions: DateException[] = JSON.parse(excSaved);
      const matched = exceptions.find(
        (e) => dateStr.includes(e.dateStr) || e.dateStr.includes(dateStr)
      );
      if (matched && matched.isFullShutdown) {
        return {
          isAvailable: false,
          reason: `تعطیلی (${matched.title})`,
          remainingKg: 0,
          remainingRequests: 0
        };
      }
    }
  } catch {}

  // 2. Map dayName to dayIndex (0 = شنبه, ..., 6 = جمعه)
  const dayIndexMap: Record<string, number> = {
    'شنبه': 0,
    'یکشنبه': 1,
    'دوشنبه': 2,
    'سه‌شنبه': 3,
    'چهارشنبه': 4,
    'پنجشنبه': 5,
    'جمعه': 6
  };
  const dayIdx = dayIndexMap[dayName] ?? 0;

  // 3. Read Matrix config
  let slotConfig: SlotConfig = { isActive: true, maxKg: 400, maxRequests: 20 };
  try {
    const matrixKey = `pakino_capacity_matrix_${cityId}`;
    const matrixSaved = localStorage.getItem(matrixKey);
    if (matrixSaved) {
      const parsed = JSON.parse(matrixSaved);
      if (parsed[`${dayIdx}-${shiftId}`]) {
        slotConfig = parsed[`${dayIdx}-${shiftId}`];
      }
    }
  } catch {}

  if (!slotConfig.isActive) {
    return {
      isAvailable: false,
      reason: 'شیفت غیرفعال',
      remainingKg: 0,
      remainingRequests: 0
    };
  }

  // 4. Count existing requests booked for this city, day, and shift
  const booked = existingRequests.filter((r) => {
    if (r.cityId !== cityId) return false;
    if (r.status === 'cancelled') return false;
    const sameDay = r.dayOfWeek === dayName || r.dateStr.includes(dayName) || r.dateStr === dateStr;
    const sameShift = r.timeSlotId === shiftId || r.timeSlot?.includes(shiftId);
    return sameDay && sameShift;
  });

  const bookedKg = booked.reduce((acc, r) => acc + (r.actualKg || r.estimatedKg || 0), 0);
  const remainingKg = Math.max(0, slotConfig.maxKg - bookedKg);
  const remainingRequests = Math.max(0, slotConfig.maxRequests - booked.length);

  if (remainingRequests <= 0 || remainingKg <= 0) {
    return {
      isAvailable: false,
      reason: 'تکمیل ظرفیت',
      remainingKg: 0,
      remainingRequests: 0
    };
  }

  return {
    isAvailable: true,
    remainingKg,
    remainingRequests
  };
}

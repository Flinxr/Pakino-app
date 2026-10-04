import React, { useState, useMemo, useEffect } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Copy, 
  Check, 
  RefreshCw, 
  X, 
  ShieldCheck, 
  User, 
  Truck, 
  Sliders, 
  Trophy, 
  HeartHandshake, 
  Clock, 
  Calendar,
  AlertCircle,
  Database,
  ArrowUpRight,
  Code2,
  Trash2,
  FileSpreadsheet
} from 'lucide-react';
import { AppEventLog, AppEventType, AppActorRole, CityId } from '../../types';
import { 
  getStoredEventLogs, 
  exportLogsToCSV, 
  exportLogsToJSON, 
  EVENT_TYPE_LABELS 
} from '../../utils/eventLogger';
import { toPersianDigits } from '../../utils/persian';

interface AdminEventLogsManagerProps {
  currentCity: CityId;
}

export const AdminEventLogsManager: React.FC<AdminEventLogsManagerProps> = ({
  currentCity
}) => {
  const [logs, setLogs] = useState<AppEventLog[]>(() => getStoredEventLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<'all' | AppEventType>('all');
  const [selectedRole, setSelectedRole] = useState<'all' | AppActorRole>('all');
  const [selectedCity, setSelectedCity] = useState<'all' | CityId>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [inspectedLog, setInspectedLog] = useState<AppEventLog | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Reload logs and listen for custom dom events
  const reloadLogs = () => {
    setLogs(getStoredEventLogs());
  };

  useEffect(() => {
    const handleNewLog = () => {
      setLogs(getStoredEventLogs());
    };
    window.addEventListener('pakino_event_logged', handleNewLog);
    return () => {
      window.removeEventListener('pakino_event_logged', handleNewLog);
    };
  }, []);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = new Date();

    return logs.filter((log) => {
      // 1. Event Type filter
      if (selectedEventType !== 'all' && log.eventType !== selectedEventType) {
        return false;
      }

      // 2. Role filter
      if (selectedRole !== 'all' && log.actorRole !== selectedRole) {
        return false;
      }

      // 3. City filter
      if (selectedCity !== 'all' && log.cityId !== selectedCity) {
        return false;
      }

      // 4. Time filter
      if (timeFilter !== 'all') {
        const logDate = new Date(log.timestamp);
        const diffHours = (now.getTime() - logDate.getTime()) / (1000 * 60 * 60);

        if (timeFilter === 'today' && diffHours > 24) return false;
        if (timeFilter === 'week' && diffHours > 24 * 7) return false;
        if (timeFilter === 'month' && diffHours > 24 * 30) return false;
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const actorName = (log.actorName || '').toLowerCase();
        const actorId = (log.actorId || '').toLowerCase();
        const entityId = (log.entityId || '').toLowerCase();
        const entityType = (log.entityType || '').toLowerCase();
        const cityName = (log.cityName || '').toLowerCase();
        const detailsStr = JSON.stringify(log.details || {}).toLowerCase();
        const label = (EVENT_TYPE_LABELS[log.eventType]?.label || log.eventType || '').toLowerCase();

        const matchActor = actorName.includes(q) || actorId.includes(q);
        const matchEntity = entityId.includes(q) || entityType.includes(q);
        const matchCity = cityName.includes(q);
        const matchDetails = detailsStr.includes(q);
        const matchLabel = label.includes(q);

        if (!matchActor && !matchEntity && !matchCity && !matchDetails && !matchLabel) {
          return false;
        }
      }

      return true;
    });
  }, [logs, selectedEventType, selectedRole, selectedCity, timeFilter, searchQuery]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = logs.length;
    const citizenCount = logs.filter(l => l.actorRole === 'citizen').length;
    const driverCount = logs.filter(l => l.actorRole === 'driver').length;
    const adminCount = logs.filter(l => l.actorRole === 'admin').length;
    const cancelCount = logs.filter(l => l.eventType.includes('cancelled')).length;
    const completeCount = logs.filter(l => l.eventType === 'request_weighed_and_completed').length;
    const charityCount = logs.filter(l => l.eventType === 'request_type_converted_to_charity').length;

    return {
      total,
      citizenCount,
      driverCount,
      adminCount,
      cancelCount,
      completeCount,
      charityCount
    };
  }, [logs]);

  // Export handlers
  const handleExportCSV = () => {
    const csvData = exportLogsToCSV(filteredLogs);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pakino_event_logs_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const jsonData = exportLogsToJSON(filteredLogs);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pakino_event_logs_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper for human-readable detail summary
  const renderDetailSummary = (log: AppEventLog) => {
    const d = log.details || {};

    if (log.eventType === 'request_created') {
      return `نوبت ${d.trackingCode || ''} • وزن برآوردی: ${toPersianDigits(d.estimatedKg || 0)} kg • ${d.type === 'charity' ? 'نیکوکاری' : 'نقدی/کارت'}`;
    }
    if (log.eventType === 'request_assigned') {
      return `پذیرش نوبت ${d.trackingCode || ''} • خودرو: ${d.vehiclePlate || 'وانت پاکیار'}`;
    }
    if (log.eventType === 'request_cancelled_citizen') {
      return `علت لغو شهروند: ${d.reason || 'نامشخص'}`;
    }
    if (log.eventType === 'request_cancelled_driver') {
      return `انصراف سفیر: ${d.reason || 'نامشخص'} (بازگشت به صف)`;
    }
    if (log.eventType === 'request_type_converted_to_charity') {
      return `تبدیل نوبت به نیکوکاری (${d.charityName || 'خیریه'}) • مبلغ: ${toPersianDigits((d.charityAmountTomans || 0).toLocaleString('fa-IR'))} ت`;
    }
    if (log.eventType === 'request_weighed_and_completed') {
      return `وزن ثبت‌شده: ${toPersianDigits(d.actualKg || 0)} kg • تسویه: ${d.paymentModeUsed === 'direct_card' ? 'کارت‌به‌کارت' : d.type === 'charity' ? 'نیکوکاری' : 'نقدی'}`;
    }
    if (log.eventType === 'weight_and_payout_recorded') {
      return `وزن باسکول: ${toPersianDigits(d.actualKg || 0)} kg • کارت: ${toPersianDigits(d.directCardAmountTomans || 0)} ت`;
    }
    if (log.eventType === 'driver_rated_by_citizen') {
      return `امتیاز ${toPersianDigits(d.rating || 5)} ستاره • نظر: "${d.comment || 'بدون نظر'}"`;
    }
    if (log.eventType === 'lottery_event_entered') {
      return `کد رویداد: ${d.eventCode || ''} • شماره تماس: ${toPersianDigits(d.phoneMasked || '')}`;
    }
    if (log.eventType === 'waste_tariffs_updated') {
      return `افزایش تعرفه ${d.category || ''} به ${toPersianDigits(d.newRate || 0)} تومان`;
    }
    if (log.eventType === 'shifts_matrix_updated') {
      return d.action || 'به‌روزرسانی تنظیمات ظرفیت و شیفت';
    }

    return Object.entries(d).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(' • ');
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                سامانه آمار و لاگ جامع وقایع سیستم (ماده ۸)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ثبت ماندگار و بلادرنگ رویدادها، بازیگران، جزئیات داده‌ای JSON و ردگیری کامل چرخه حیات
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={reloadLogs}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
            title="به‌روزرسانی لاگ‌ها"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>بازخوانی</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>خروجی CSV</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>خروجی JSON</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 block">کل رویدادهای ثبت‌شده</span>
          <span className="text-xl font-black text-slate-900 mt-1 font-mono block">
            {toPersianDigits(stats.total)}
          </span>
          <span className="text-[10px] text-purple-600 font-bold">پایگاه داده وقایع</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-600 block">اقدامات شهروندان</span>
          <span className="text-xl font-black text-blue-900 mt-1 font-mono block">
            {toPersianDigits(stats.citizenCount)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">ثبت نوبت، نظرات، ورود</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-600 block">اقدامات سفیران</span>
          <span className="text-xl font-black text-emerald-900 mt-1 font-mono block">
            {toPersianDigits(stats.driverCount)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">پذیرش، توزین، تسویه</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-purple-600 block">مدیریت و سیستم</span>
          <span className="text-xl font-black text-purple-900 mt-1 font-mono block">
            {toPersianDigits(stats.adminCount)}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">شیفت‌ها، تعرفه‌ها، بنرها</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-600 block">لغوها و انصراف‌ها</span>
          <span className="text-xl font-black text-rose-900 mt-1 font-mono block">
            {toPersianDigits(stats.cancelCount)}
          </span>
          <span className="text-[10px] text-rose-500 font-bold">با ثبت دقیق علت و بازیگر</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-teal-200 bg-teal-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-teal-600 block">تبدیل به نیکوکاری</span>
          <span className="text-xl font-black text-teal-900 mt-1 font-mono block">
            {toPersianDigits(stats.charityCount)}
          </span>
          <span className="text-[10px] text-teal-600 font-bold">تغییر نوع در میانه راه</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-100/80 p-4 rounded-3xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-purple-600" />
            <span>فیلتر و ره‌گیری تخصصی لاگ‌ها:</span>
          </div>
          <span className="text-[11px] text-slate-500">
            نمایش {toPersianDigits(filteredLogs.length)} از {toPersianDigits(logs.length)} رویداد
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              جستجوی آزاد در عنوان، نام بازیگر، شناسه یا JSON
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="مثلاً: علی حسینی، TRF-، لغو، 1021، امام علی..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            </div>
          </div>

          {/* Event Type Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              نوع رویداد
            </label>
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">همه انواع رویدادها</option>
              {Object.entries(EVENT_TYPE_LABELS).map(([k, val]) => (
                <option key={k} value={k}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actor Role Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              نقش بازیگر (Actor Role)
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">همه نقش‌ها</option>
              <option value="citizen">شهروند (Citizen)</option>
              <option value="driver">راننده سفیر (Driver)</option>
              <option value="admin">مدیر سیستم (Admin)</option>
              <option value="system">رویداد خودکار (System)</option>
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              بازه زمانی
            </label>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">تمام تاریخچه</option>
              <option value="today">امروز (۲۴ ساعت اخیر)</option>
              <option value="week">۷ روز اخیر</option>
              <option value="month">۳۰ روز اخیر</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Events Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-black text-slate-900">
              جدول جامع رخدادها و لاگ وقایع پاکینو (Event Log Table)
            </span>
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {toPersianDigits(filteredLogs.length)} رکورد موجود
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Database className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold">هیچ رویدادی با این فیلترها یافت نشد</p>
            <p className="text-xs text-slate-400">جستجو یا گزینه‌های فیلتر را پاکسازی نمایید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">زمان رویداد</th>
                  <th className="py-3 px-3">نوع رویداد</th>
                  <th className="py-3 px-3">بازیگر (Actor)</th>
                  <th className="py-3 px-3">موجودیت (Entity)</th>
                  <th className="py-3 px-3">شهر</th>
                  <th className="py-3 px-3">چکیده و جزئیات</th>
                  <th className="py-3 px-3 text-center">مشاهده داده</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => {
                  const typeMeta = EVENT_TYPE_LABELS[log.eventType] || {
                    label: log.eventType,
                    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200'
                  };

                  const roleBadge = log.actorRole === 'citizen'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : log.actorRole === 'driver'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : log.actorRole === 'admin'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200';

                  const dateFormatted = new Date(log.timestamp).toLocaleString('fa-IR', {
                    dateStyle: 'short',
                    timeStyle: 'medium'
                  });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                        {toPersianDigits(dateFormatted)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${typeMeta.badgeColor}`}>
                          {typeMeta.label}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${roleBadge}`}>
                            {log.actorRole === 'citizen' ? 'شهروند' : log.actorRole === 'driver' ? 'راننده' : log.actorRole === 'admin' ? 'مدیر' : 'سیستم'}
                          </span>
                          <span className="font-bold text-slate-800">{log.actorName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono text-slate-700 whitespace-nowrap">
                        <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600">
                          {log.entityType}: {log.entityId}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap text-[11px]">
                        {log.cityName || 'مرکزی'}
                      </td>
                      <td className="py-3 px-3 text-slate-700 max-w-xs truncate text-[11px]">
                        {renderDetailSummary(log)}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition cursor-pointer flex items-center gap-1 mx-auto"
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          <span>JSON</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail JSON Inspector Modal */}
      {inspectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in zoom-in-95">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-400" />
                <span className="text-sm font-black">
                  جزئیات ساختاریافته رویداد: {inspectedLog.id}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Human Narrative */}
              <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3.5 text-xs text-purple-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                  <span>عنوان رویداد: {EVENT_TYPE_LABELS[inspectedLog.eventType]?.label || inspectedLog.eventType}</span>
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  توسط <strong>{inspectedLog.actorName}</strong> ({inspectedLog.actorRole}) در موجودیت <strong>{inspectedLog.entityType}:{inspectedLog.entityId}</strong> ثبت شد.
                </p>
                <p className="text-[11px] font-mono text-purple-700">
                  زمان ثبت: {new Date(inspectedLog.timestamp).toLocaleString('fa-IR')}
                </p>
              </div>

              {/* JSON Payload Viewer */}
              <div className="relative">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 mb-1">
                  <span>ساختار داده‌ای خام (JSON Payload):</span>
                  <button
                    type="button"
                    onClick={() => handleCopyJSON(JSON.stringify(inspectedLog, null, 2), inspectedLog.id)}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    {copiedId === inspectedLog.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">کپی شد!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>کپی JSON</span>
                      </>
                    )}
                  </button>
                </div>

                <pre className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto border border-slate-800 dir-ltr text-left selection:bg-purple-500 selection:text-white">
                  {JSON.stringify(inspectedLog, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                بستن پنجره
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Filter, 
  Download, 
  Truck, 
  Scale, 
  HeartHandshake, 
  CreditCard, 
  Banknote, 
  Building2, 
  RefreshCw, 
  Search,
  ChevronDown,
  Layers,
  ArrowUpRight,
  MapPin,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { CityId, PickupRequest, DriverProfile, DriverDailyStatRecord } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';
import { calculateDriverDailyStats } from '../../utils/eventLogger';

interface AdminDriverDailyStatsProps {
  currentCity: CityId;
  requests: PickupRequest[];
  drivers: DriverProfile[];
}

export const AdminDriverDailyStats: React.FC<AdminDriverDailyStatsProps> = ({
  currentCity,
  requests = [],
  drivers = []
}) => {
  // Filters
  const [rangeMode, setRangeMode] = useState<'daily' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState<'all' | string>('all');
  const [selectedCityId, setSelectedCityId] = useState<'all' | CityId>('all');
  const [selectedCharityFilter, setSelectedCharityFilter] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedRowKey, setExpandedRowKey] = useState<string | null>(null);

  // Compute Base Stats from Completed Requests
  const rawDailyStats = useMemo(() => {
    return calculateDriverDailyStats(requests);
  }, [requests]);

  // Extract all unique charities from completed requests for filter dropdown
  const availableCharities = useMemo(() => {
    const set = new Set<string>();
    requests.forEach(r => {
      if (r.charityName) set.add(r.charityName);
      if (r.convertedToCharityCharityName) set.add(r.convertedToCharityCharityName);
    });
    // Add known charities
    Object.values(CITIES).forEach(c => c.charities.forEach(ch => set.add(ch)));
    return Array.from(set);
  }, [requests]);

  // Filtered Daily Stats
  const filteredDailyStats = useMemo(() => {
    const now = new Date();

    return rawDailyStats.filter((item) => {
      // 1. Driver Filter
      if (selectedDriverId !== 'all' && item.driverId !== selectedDriverId) {
        return false;
      }

      // 2. City Filter
      if (selectedCityId !== 'all' && item.cityId !== selectedCityId) {
        return false;
      }

      // 3. Charity Filter
      if (selectedCharityFilter !== 'all') {
        const hasCharity = item.charityAmountsByCharity && item.charityAmountsByCharity[selectedCharityFilter] > 0;
        if (!hasCharity) return false;
      }

      // 4. Time Range Filter
      const itemDate = new Date(item.dateKey);
      const isDateValid = !isNaN(itemDate.getTime());

      if (isDateValid) {
        const diffDays = Math.floor((now.getTime() - itemDate.getTime()) / (1000 * 60 * 60 * 24));

        if (rangeMode === 'daily') {
          // today or past 24 hours
          if (diffDays > 1) return false;
        } else if (rangeMode === 'weekly') {
          // past 7 days
          if (diffDays > 7) return false;
        } else if (rangeMode === 'monthly') {
          // past 30 days
          if (diffDays > 30) return false;
        } else if (rangeMode === 'custom') {
          if (customStartDate && item.dateKey < customStartDate) return false;
          if (customEndDate && item.dateKey > customEndDate) return false;
        }
      }

      // 5. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchDriver = item.driverName.toLowerCase().includes(q);
        const matchCity = item.cityName.toLowerCase().includes(q);
        const matchDate = item.dateStr.toLowerCase().includes(q);
        if (!matchDriver && !matchCity && !matchDate) return false;
      }

      return true;
    });
  }, [
    rawDailyStats, 
    selectedDriverId, 
    selectedCityId, 
    selectedCharityFilter, 
    rangeMode, 
    customStartDate, 
    customEndDate, 
    searchQuery
  ]);

  // Aggregate Metrics for Active Filter
  const summaryTotals = useMemo(() => {
    let totalKg = 0;
    let totalRequests = 0;
    let totalDirectCard = 0;
    let totalCash = 0;
    let totalCharity = 0;
    const charityBreakdown: Record<string, number> = {};

    filteredDailyStats.forEach((s) => {
      totalKg += s.totalKg;
      totalRequests += s.completedRequestsCount;
      totalDirectCard += s.directCardAmountTomans;
      totalCash += s.cashAmountTomans;
      totalCharity += s.totalCharityAmountTomans;

      Object.entries(s.charityAmountsByCharity || {}).forEach(([charity, amount]) => {
        charityBreakdown[charity] = (charityBreakdown[charity] || 0) + Number(amount);
      });
    });

    const totalOverallTomans = totalDirectCard + totalCash + totalCharity;

    return {
      totalKg,
      totalRequests,
      totalDirectCard,
      totalCash,
      totalCharity,
      totalOverallTomans,
      charityBreakdown
    };
  }, [filteredDailyStats]);

  // Chart Data by Driver
  const chartDataByDriver = useMemo(() => {
    const driverMap: Record<string, { name: string; kg: number; card: number; cash: number; charity: number }> = {};

    filteredDailyStats.forEach((s) => {
      if (!driverMap[s.driverId]) {
        driverMap[s.driverId] = {
          name: s.driverName.replace('سفیر ', ''),
          kg: 0,
          card: 0,
          cash: 0,
          charity: 0
        };
      }
      driverMap[s.driverId].kg += s.totalKg;
      driverMap[s.driverId].card += s.directCardAmountTomans;
      driverMap[s.driverId].cash += s.cashAmountTomans;
      driverMap[s.driverId].charity += s.totalCharityAmountTomans;
    });

    return Object.values(driverMap);
  }, [filteredDailyStats]);

  // Payout Share Pie Data
  const payoutPieData = useMemo(() => {
    return [
      { name: 'کارت‌به‌کارت', value: summaryTotals.totalDirectCard || 0, color: '#3b82f6' },
      { name: 'وجه نقد', value: summaryTotals.totalCash || 0, color: '#f59e0b' },
      { name: 'طرح نیکوکاری', value: summaryTotals.totalCharity || 0, color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [summaryTotals]);

  // Export Daily Stats to CSV
  const handleExportCSV = () => {
    const headers = [
      'تاریخ',
      'سفیر راننده',
      'شهر',
      'تعداد درخواست',
      'مجموع کیلوگرم',
      'مبلغ کارت‌به‌کارت (تومان)',
      'مبلغ نقدی (تومان)',
      'مجموع نیکوکاری (تومان)',
      'تفکیک خیریه‌ها'
    ].join(',');

    const rows = filteredDailyStats.map((item) => {
      const charityBreakdownText = Object.entries(item.charityAmountsByCharity || {})
        .map(([cName, amt]) => `${cName}: ${amt} تومان`)
        .join(' | ');

      return [
        `"${item.dateStr}"`,
        `"${item.driverName}"`,
        `"${item.cityName}"`,
        item.completedRequestsCount,
        item.totalKg,
        item.directCardAmountTomans,
        item.cashAmountTomans,
        item.totalCharityAmountTomans,
        `"${charityBreakdownText.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pakino_driver_daily_stats_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                گزارش تفکیکی و آمار روزانه سفیران ناوگان (ماده ۷)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                محاسبه خودکار کیلوگرم جمع‌آوری‌شده، مبلغ نقدی، کارت‌به‌کارت و سهم هر خیریه در هر روز
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>خروجی اکسل / CSV</span>
          </button>
        </div>
      </div>

      {/* Comprehensive Filter Controls */}
      <div className="bg-slate-100/80 p-4 rounded-3xl border border-slate-200 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-indigo-600" />
            <span>فیلترهای گزارش‌گیری آماری:</span>
          </div>
          <span className="text-[11px] text-slate-500">
            {toPersianDigits(filteredDailyStats.length)} رکورد آماری روزانه یافت شد
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* 1. Date Range Preset Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              بازه زمانی گزارش
            </label>
            <div className="grid grid-cols-4 gap-1 bg-white p-1 rounded-xl border border-slate-200 text-[11px] font-bold">
              {[
                { id: 'daily', label: 'امروز' },
                { id: 'weekly', label: 'هفتگی' },
                { id: 'monthly', label: 'ماهانه' },
                { id: 'custom', label: 'دلخواه' }
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setRangeMode(m.id as any)}
                  className={`py-1.5 rounded-lg transition text-center cursor-pointer ${
                    rangeMode === m.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Driver Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              انتخاب سفیر راننده
            </label>
            <select
              value={selectedDriverId}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه سفیران ناوگان</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({CITIES[d.cityId]?.name || d.cityId})
                </option>
              ))}
            </select>
          </div>

          {/* 3. City Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              شهرستان تحت پوشش
            </label>
            <select
              value={selectedCityId}
              onChange={(e) => setSelectedCityId(e.target.value as any)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه شهرها (نورآباد و کازرون)</option>
              <option value="noorabad">نورآباد ممسنی</option>
              <option value="kazeroon">کازرون</option>
            </select>
          </div>

          {/* 4. Charity Filter */}
          <div>
            <label className="text-[11px] font-bold text-slate-600 block mb-1">
              موسسه خیریه طرف قرارداد
            </label>
            <select
              value={selectedCharityFilter}
              onChange={(e) => setSelectedCharityFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">همه خیریه‌ها و طرح‌های نیکوکاری</option>
              {availableCharities.map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Inputs if rangeMode === 'custom' */}
        {rangeMode === 'custom' && (
          <div className="p-3 bg-white rounded-2xl border border-indigo-200 flex flex-wrap items-center gap-3 text-xs">
            <span className="font-bold text-indigo-900">بازه تقویمی دلخواه:</span>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">از تاریخ:</span>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-[11px]">تا تاریخ:</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards for the filtered result */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">کل وزن جمع‌آوری‌شده</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            {toPersianDigits(summaryTotals.totalKg.toLocaleString('fa-IR'))}{' '}
            <span className="text-xs font-sans font-bold text-slate-500">کیلوگرم</span>
          </div>
          <div className="text-[11px] text-emerald-600 font-bold mt-1">
            {toPersianDigits(summaryTotals.totalRequests)} سرویس موفق ناوگان
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold">مجموع کارت‌به‌کارت</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-900 mt-2 font-mono">
            {toPersianDigits(formatTomans(summaryTotals.totalDirectCard))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            انتقال مستقیم شتابی به حساب شهروند
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold">مجموع تسویه نقدی</span>
            <Banknote className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-900 mt-2 font-mono">
            {toPersianDigits(formatTomans(summaryTotals.totalCash))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            پرداخت دستی وجه نقد در محل
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold">مجموع اهدایی به خیریه‌ها</span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-rose-900 mt-2 font-mono">
            {toPersianDigits(formatTomans(summaryTotals.totalCharity))}
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1">
            به تفکیک {toPersianDigits(Object.keys(summaryTotals.charityBreakdown).length)} موسسه خیریه
          </div>
        </div>
      </div>

      {/* Charity Breakdown Badges Banner */}
      {Object.keys(summaryTotals.charityBreakdown).length > 0 && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-black text-slate-800">
            <HeartHandshake className="w-4 h-4 text-rose-500" />
            <span>تفکیک مبالغ نیکوکاری به تفکیک موسسات خیریه (مطابق ماده ۷):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(summaryTotals.charityBreakdown).map(([chName, amt]) => (
              <div 
                key={chName}
                className="bg-rose-50 border border-rose-200/80 rounded-xl px-3 py-1.5 flex items-center gap-2"
              >
                <span className="text-xs font-bold text-slate-800">{chName}:</span>
                <span className="text-xs font-black text-rose-700 font-mono">
                  {toPersianDigits(formatTomans(Number(amt)))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visual Comparison Charts */}
      {chartDataByDriver.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <span>مقایسه حجم جمع‌آوری و مبالغ به تفکیک سفیران در بازه انتخابی</span>
            </h4>
            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={200}>
                <BarChart data={chartDataByDriver}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', direction: 'rtl' }}
                    formatter={(val: any, name: any) => [
                      name === 'kg' ? `${toPersianDigits(val)} کیلو` : toPersianDigits(formatTomans(val)),
                      name === 'kg' ? 'وزن' : name === 'card' ? 'کارت‌به‌کارت' : name === 'cash' ? 'نقدی' : 'نیکوکاری'
                    ]}
                  />
                  <Legend 
                    formatter={(value) => value === 'kg' ? 'وزن (کیلوگرم)' : value === 'card' ? 'کارت‌به‌کارت' : value === 'cash' ? 'نقدی' : 'نیکوکاری'}
                  />
                  <Bar dataKey="kg" name="kg" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>سهم شیوه‌های تسویه</span>
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">درصد کارت‌به‌کارت، نقدی و نیکوکاری</p>
            </div>

            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={160}>
                <PieChart>
                  <Pie
                    data={payoutPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {payoutPieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', direction: 'rtl' }}
                    formatter={(val: any) => [toPersianDigits(formatTomans(val)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-bold">
              {payoutPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </span>
                  <span className="font-mono text-slate-900">
                    {toPersianDigits(formatTomans(item.value))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Aggregated Daily Stats Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black text-slate-900">
              ماتریس گزارش روزانه به تفکیک راننده و شیوه‌های پرداخت
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="جستجو در راننده یا تاریخ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-52"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>
        </div>

        {filteredDailyStats.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Truck className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold">رکوردی برای این فیلترها ثبت نشده است</p>
            <p className="text-xs text-slate-400">بازه زمانی یا راننده انتخاب‌شده را تغییر دهید.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">تاریخ</th>
                  <th className="py-3 px-3">سفیر راننده</th>
                  <th className="py-3 px-3">شهر</th>
                  <th className="py-3 px-3 text-center">سفارش‌ها</th>
                  <th className="py-3 px-3 text-center">کل وزن</th>
                  <th className="py-3 px-3">مبلغ کارت‌به‌کارت</th>
                  <th className="py-3 px-3">مبلغ نقدی</th>
                  <th className="py-3 px-3">سهم خیریه‌ها (نیکوکاری)</th>
                  <th className="py-3 px-3">مجموع مالی</th>
                  <th className="py-3 px-3 text-center">جزئیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDailyStats.map((stat, idx) => {
                  const rowKey = `${stat.driverId}-${stat.dateKey}`;
                  const isExpanded = expandedRowKey === rowKey;

                  return (
                    <React.Fragment key={rowKey}>
                      <tr className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-3 font-bold text-slate-800 whitespace-nowrap">
                          {stat.dateStr}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Truck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{stat.driverName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[11px] font-bold">
                            {stat.cityName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700 font-mono">
                          {toPersianDigits(stat.completedRequestsCount)}
                        </td>
                        <td className="py-3 px-3 text-center font-black text-emerald-700 font-mono whitespace-nowrap">
                          {toPersianDigits(stat.totalKg)} <span className="text-[10px] font-sans font-bold">کیلو</span>
                        </td>
                        <td className="py-3 px-3 font-bold text-blue-700 font-mono whitespace-nowrap">
                          {toPersianDigits(formatTomans(stat.directCardAmountTomans))}
                        </td>
                        <td className="py-3 px-3 font-bold text-amber-700 font-mono whitespace-nowrap">
                          {toPersianDigits(formatTomans(stat.cashAmountTomans))}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {stat.totalCharityAmountTomans > 0 ? (
                            <div className="space-y-1">
                              <span className="font-black text-rose-700 font-mono block">
                                {toPersianDigits(formatTomans(stat.totalCharityAmountTomans))}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(stat.charityAmountsByCharity || {}).map(([cName, cAmt]) => (
                                  <span 
                                    key={cName}
                                    className="text-[9px] bg-rose-50 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded"
                                    title={cName}
                                  >
                                    {cName.substring(0, 18)}...: {toPersianDigits(formatTomans(Number(cAmt)))}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono">۰ تومان</span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-black text-slate-900 font-mono whitespace-nowrap">
                          {toPersianDigits(formatTomans(stat.totalPayoutTomans))}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => setExpandedRowKey(isExpanded ? null : rowKey)}
                            className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 transition cursor-pointer"
                            title="مشاهده جزئیات سفارش‌ها"
                          >
                            <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Sub-Row showing requests on that day */}
                      {isExpanded && (
                        <tr className="bg-slate-50/90 border-y border-slate-200">
                          <td colSpan={10} className="p-4 space-y-2">
                            <div className="text-xs font-black text-slate-800 flex items-center gap-2">
                              <Layers className="w-3.5 h-3.5 text-indigo-600" />
                              <span>سفارش‌های جمع‌آوری‌شده توسط {stat.driverName} در {stat.dateStr}:</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {stat.requestsIds.map((reqId) => {
                                const r = requests.find(x => x.id === reqId);
                                if (!r) return null;
                                return (
                                  <div key={reqId} className="bg-white p-3 rounded-xl border border-slate-200 text-[11px] space-y-1 shadow-2xs">
                                    <div className="flex items-center justify-between font-bold">
                                      <span className="text-indigo-600 font-mono">{r.trackingCode}</span>
                                      <span className="text-slate-700">{r.userName}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500">
                                      <span>وزن واقعی: <strong className="text-emerald-700 font-mono">{toPersianDigits(r.actualKg || r.estimatedKg)} kg</strong></span>
                                      <span>
                                        {r.type === 'charity' 
                                          ? <span className="text-rose-600 font-bold">نیکوکاری ({r.charityName})</span> 
                                          : <span className="text-blue-600 font-bold">{r.paymentModeUsed === 'direct_card' ? 'کارت‌به‌کارت' : 'نقدی'}</span>
                                        }
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {r.address?.street}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Truck, 
  User, 
  Phone, 
  ShieldCheck, 
  Key, 
  MapPin, 
  Star, 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  Clock, 
  Scale, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Navigation,
  Sparkles,
  Search,
  ExternalLink,
  Table,
  LayoutGrid,
  ArrowUpDown,
  SlidersHorizontal,
  Filter
} from 'lucide-react';
import { DriverProfile, DriverActivityLog, CityId, PickupRequest } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminFleetManagerProps {
  currentCity: CityId;
  drivers: DriverProfile[];
  requests?: PickupRequest[];
  onUpdateDrivers: (drivers: DriverProfile[]) => void;
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
];

export const AdminFleetManager: React.FC<AdminFleetManagerProps> = ({
  currentCity,
  drivers = [],
  requests = [],
  onUpdateDrivers
}) => {
  const [viewMode, setViewMode] = useState<'cards_detail' | 'stats_table'>('cards_detail');
  const [selectedDriver, setSelectedDriver] = useState<DriverProfile | null>(drivers?.[0] || null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isNewDriverModalOpen, setIsNewDriverModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Table filtering and sorting states
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'warning' | 'suspended'>('all');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [sortBy, setSortBy] = useState<'completed' | 'weight' | 'rating' | 'name'>('completed');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Overall Fleet Stats
  const totalFleetCount = drivers.length;
  const activeFleetCount = drivers.filter(d => d.status === 'active').length;
  const onlineFleetCount = drivers.filter(d => d.isOnline).length;
  const totalFleetKg = drivers.reduce((sum, d) => sum + (d.totalCollectedKg || 0), 0);
  const totalFleetPickups = drivers.reduce((sum, d) => sum + (d.totalCompletedPickups || 0), 0);
  const avgFleetRating = drivers.length > 0 
    ? (drivers.reduce((sum, d) => sum + (d.rating || 5), 0) / drivers.length).toFixed(1)
    : '5.0';

  // Edit / Add Form State
  const [formData, setFormData] = useState<Partial<DriverProfile>>({
    name: '',
    phone: '',
    nationalId: '',
    pinCode: '1234',
    password: '1234',
    vehicleType: '',
    plateNumber: '',
    cityId: currentCity,
    avatarUrl: AVATAR_PRESETS[0],
    status: 'active'
  });

  // New Log Entry State for test/demo
  const [isAddLogOpen, setIsAddLogOpen] = useState(false);
  const [newLogNarrative, setNewLogNarrative] = useState('');
  const [newLogCitizenName, setNewLogCitizenName] = useState('');
  const [newLogLocation, setNewLogLocation] = useState('');
  const [newLogKg, setNewLogKg] = useState(15);
  const [newLogType, setNewLogType] = useState<'charity' | 'cash'>('charity');

  const filteredDrivers = (drivers || []).filter(
    (d) =>
      (d.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.phone || '').includes(searchQuery) ||
      (d.nationalId || '').includes(searchQuery) ||
      (CITIES[d.cityId]?.name || '').includes(searchQuery)
  );

  // Table Filtered & Sorted Drivers
  const tableFilteredDrivers = (drivers || []).filter((d) => {
    // City
    if (cityFilter !== 'all' && d.cityId !== cityFilter) return false;
    // Status
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    // Online
    if (onlineFilter === 'online' && !d.isOnline) return false;
    if (onlineFilter === 'offline' && d.isOnline) return false;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        (d.name || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q) ||
        (d.nationalId || '').includes(q) ||
        (d.plateNumber || '').includes(q) ||
        (d.vehicleType || '').toLowerCase().includes(q) ||
        (CITIES[d.cityId]?.name || '').includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    let diff = 0;
    if (sortBy === 'completed') diff = (a.totalCompletedPickups || 0) - (b.totalCompletedPickups || 0);
    else if (sortBy === 'weight') diff = (a.totalCollectedKg || 0) - (b.totalCollectedKg || 0);
    else if (sortBy === 'rating') diff = (a.rating || 0) - (b.rating || 0);
    else if (sortBy === 'name') diff = a.name.localeCompare(b.name, 'fa');
    return sortOrder === 'desc' ? -diff : diff;
  });

  const handleOpenEdit = (driver: DriverProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFormData({ 
      ...driver,
      password: driver.password || driver.pinCode || '1234',
      pinCode: driver.pinCode || driver.password || '1234'
    });
    setIsEditModalOpen(true);
  };

  const handleOpenNewDriver = () => {
    setFormData({
      id: `drv-${Date.now().toString().slice(-3)}`,
      name: '',
      phone: '0917',
      nationalId: '',
      pinCode: '1234',
      password: '1234',
      vehicleType: 'وانت پراید مجهز به باسکول',
      plateNumber: 'ایران ۷۳ - ',
      cityId: currentCity,
      avatarUrl: AVATAR_PRESETS[0],
      isOnline: true,
      totalCompletedPickups: 0,
      totalCollectedKg: 0,
      rating: 5.0,
      ratingCount: 0,
      joinedDateStr: '۱۴۰۵/۰۱/۰۱',
      status: 'active',
      activityLogs: []
    });
    setIsNewDriverModalOpen(true);
  };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const effectivePassword = formData.password || formData.pinCode || '1234';

    if (isNewDriverModalOpen) {
      const newDriver: DriverProfile = {
        id: formData.id || `drv-${Date.now().toString().slice(-3)}`,
        name: formData.name || 'سفیر جدید',
        phone: formData.phone || '',
        nationalId: formData.nationalId || '',
        pinCode: effectivePassword,
        password: effectivePassword,
        vehicleType: formData.vehicleType || 'وانت باربری',
        plateNumber: formData.plateNumber || 'ایران ۷۳',
        cityId: (formData.cityId as CityId) || currentCity,
        isOnline: true,
        totalCompletedPickups: 0,
        totalCollectedKg: 0,
        rating: 5.0,
        ratingCount: 0,
        avatarUrl: formData.avatarUrl || AVATAR_PRESETS[0],
        joinedDateStr: new Intl.DateTimeFormat('fa-IR').format(new Date()),
        status: 'active',
        activityLogs: []
      };
      const updated = [newDriver, ...drivers];
      onUpdateDrivers(updated);
      setSelectedDriver(newDriver);
      setIsNewDriverModalOpen(false);
    } else if (selectedDriver) {
      const updated = drivers.map((d) =>
        d.id === formData.id
          ? {
              ...d,
              name: formData.name || d.name,
              phone: formData.phone || d.phone,
              nationalId: formData.nationalId || d.nationalId,
              pinCode: effectivePassword,
              password: effectivePassword,
              vehicleType: formData.vehicleType || d.vehicleType,
              plateNumber: formData.plateNumber || d.plateNumber,
              cityId: (formData.cityId as CityId) || d.cityId,
              avatarUrl: formData.avatarUrl || d.avatarUrl,
              status: formData.status || d.status
            }
          : d
      );
      onUpdateDrivers(updated);
      setSelectedDriver(updated.find((d) => d.id === formData.id) || null);
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteDriver = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (confirm('آیا از حذف این راننده از ناوگان اطمینان دارید؟')) {
      const remaining = drivers.filter((d) => d.id !== id);
      onUpdateDrivers(remaining);
      if (selectedDriver?.id === id) {
        setSelectedDriver(remaining[0] || null);
      }
    }
  };

  const handleAddCustomLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    const newLog: DriverActivityLog = {
      id: `log-${Date.now()}`,
      driverId: selectedDriver.id,
      driverName: selectedDriver.name,
      timeStr: `ساعت ${new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' }).format(new Date())}`,
      dateStr: 'امروز',
      locationStr: newLogLocation || 'کوی گلستان، کوچه ۸',
      neighborhood: newLogLocation || 'مرکز شهر',
      cityName: CITIES[selectedDriver.cityId]?.name || 'نورآباد',
      citizenName: newLogCitizenName || 'شهروند گرامی',
      citizenPhone: '0917***1122',
      kgCollected: Number(newLogKg),
      categories: ['کارتن و مقوا', 'پلاستیک'],
      type: newLogType,
      charityName: newLogType === 'charity' ? 'موسسه خیریه امام علی (ع)' : undefined,
      payoutTomans: newLogKg * 15000,
      paymentMode: newLogType === 'charity' ? 'طرح نیکوکاری' : 'کیف پول',
      storyNarrative: newLogNarrative || `ساعت رسید به ${newLogLocation}؛ ${newLogKg} کیلوگرم پسماند از ${newLogCitizenName} دریافت و در سیستم نهایی شد.`,
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    const updatedLogs = [newLog, ...(selectedDriver.activityLogs || [])];
    const updatedDriver: DriverProfile = {
      ...selectedDriver,
      totalCollectedKg: selectedDriver.totalCollectedKg + Number(newLogKg),
      totalCompletedPickups: selectedDriver.totalCompletedPickups + 1,
      activityLogs: updatedLogs
    };

    const allUpdated = drivers.map((d) => (d.id === selectedDriver.id ? updatedDriver : d));
    onUpdateDrivers(allUpdated);
    setSelectedDriver(updatedDriver);
    setIsAddLogOpen(false);
    setNewLogNarrative('');
    setNewLogCitizenName('');
    setNewLogLocation('');
  };

  const handleToggleDriverStatus = (newStatus: 'active' | 'warning' | 'suspended') => {
    if (!selectedDriver) return;
    const defaultMsg =
      newStatus === 'suspended'
        ? 'حساب کاربری سفیر به دلیل گزارش‌های منفی مکرر یا امتیاز پایین توسط مدیریت تعلیق شد.'
        : newStatus === 'warning'
        ? 'اخطار انضباطی: لطفاً در برخورد حرفه‌ای با شهروندان و دقت در باسکول کوشا باشید.'
        : '';

    const updatedDriver: DriverProfile = {
      ...selectedDriver,
      status: newStatus,
      warningCount: newStatus === 'warning' ? (selectedDriver.warningCount || 0) + 1 : selectedDriver.warningCount,
      statusMessage: newStatus === 'active' ? '' : (selectedDriver.statusMessage || defaultMsg)
    };

    const allUpdated = drivers.map((d) => (d.id === selectedDriver.id ? updatedDriver : d));
    onUpdateDrivers(allUpdated);
    setSelectedDriver(updatedDriver);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Action Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>مدیریت ناوگان سفیران، اطلاعات هویتی و لاگ‌های روایی سیستم</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            روی هر سفیر کلیک کنید تا پرونده، تغییر تصویر، پین ورود و گزارش رفت‌وآمد به زبان عامیانه را مشاهده نمایید.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('cards_detail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'cards_detail'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="نمای کارتی و پرونده فردی"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">پرونده و لاگ روایی</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('stats_table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'stats_table'
                  ? 'bg-white text-emerald-800 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="جدول جامع آمار و ارزیابی عملکرد ناوگان"
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">جدول آمار عملکرد</span>
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام، کدملی یا شهر..."
              className="px-3 py-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold w-44 sm:w-52 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <button
            type="button"
            onClick={handleOpenNewDriver}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن سفیر جدید</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Drivers List + Selected Driver Details Drawer */}
      {viewMode === 'cards_detail' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left / Top List (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-2.5">
          {filteredDrivers.map((driver) => {
            const isSelected = selectedDriver?.id === driver.id;
            return (
              <div
                key={driver.id}
                onClick={() => setSelectedDriver(driver)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={driver.avatarUrl || AVATAR_PRESETS[0]}
                      alt={driver.name}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-xs"
                    />
                    <span
                      className={`w-3.5 h-3.5 rounded-full absolute -bottom-1 -right-1 border-2 border-white ${
                        driver.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{driver.name}</span>
                      <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md">
                        {CITIES[driver.cityId]?.name || 'نورآباد'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-2">
                      <span className="font-mono">{driver.phone}</span>
                      <span>•</span>
                      <span>{driver.vehicleType}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-bold">
                      <span className="text-amber-600 flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        <span>{toPersianDigits(driver.rating)}</span>
                      </span>
                      <span>•</span>
                      <span>{toPersianDigits(driver.totalCollectedKg)} کیلوگرم تحویلی</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono bg-white text-indigo-700 font-black px-2 py-0.5 rounded-md border border-slate-200">
                    رمز: {driver.password || driver.pinCode || '1234'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handleOpenEdit(driver, e)}
                      className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200"
                      title="ویرایش راننده"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteDriver(driver.id, e)}
                      className="p-1.5 bg-white hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200"
                      title="حذف راننده"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right / Selected Driver Dossier & Conversational Logs (7 cols on lg) */}
        <div className="lg:col-span-7">
          {selectedDriver ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
              {/* Driver Dossier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={selectedDriver.avatarUrl || AVATAR_PRESETS[0]}
                    alt={selectedDriver.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-base text-slate-900">{selectedDriver.name}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        سفیر رسمی پاکینو
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-3">
                      <span>تلفن (نام کاربری ورود): <strong className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">{selectedDriver.phone}</strong></span>
                      <span>•</span>
                      <span>رمز عبور ورود: <strong className="font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">{selectedDriver.password || selectedDriver.pinCode || '1234'}</strong></span>
                      <span>•</span>
                      <span>پلاک: <strong className="font-mono">{selectedDriver.plateNumber}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>امتیاز شهروندان: {toPersianDigits(selectedDriver.rating || 5)} از ۵</span>
                        <span className="text-[10px] text-slate-400 font-normal">({toPersianDigits(selectedDriver.ratingCount || 0)} نظر)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 self-end sm:self-auto">
                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleToggleDriverStatus('active')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDriver.status === 'active' || !selectedDriver.status
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      فعال
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDriverStatus('warning')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDriver.status === 'warning'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      اخطار
                    </button>
                    <button
                      type="button"
                      onClick={() => handleToggleDriverStatus('suspended')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectedDriver.status === 'suspended'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      تعلیق
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(selectedDriver)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsAddLogOpen(!isAddLogOpen)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت لاگ</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Driver Warning / Suspension Notice */}
              {selectedDriver.status && selectedDriver.status !== 'active' && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  selectedDriver.status === 'suspended'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="font-black flex items-center justify-between">
                      <span>{selectedDriver.status === 'suspended' ? 'حساب کاربری سفیر مسدود / تعلیق‌شده' : 'وضعیت دارای اخطار انضباطی'}</span>
                      <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-md font-bold">
                        {toPersianDigits(selectedDriver.warningCount || 1)} اخطار ثبت‌شده
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {selectedDriver.statusMessage || (selectedDriver.status === 'suspended' ? 'حساب سفیر به دلیل امتیاز ضعیف یا تخلف تعلیق شده است.' : 'اخطار به دلیل نارضایتی شهروندان از برخورد یا توزین')}
                    </p>
                  </div>
                </div>
              )}

              {/* Add New Custom Log Drawer */}
              {isAddLogOpen && (
                <form onSubmit={handleAddCustomLog} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-in slide-in-from-top-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>ثبت لاگ جدید مراجعات سفیر {selectedDriver.name}:</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddLogOpen(false)}
                      className="text-xs text-slate-500 hover:text-slate-800"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">نام شهروند:</label>
                      <input
                        type="text"
                        value={newLogCitizenName}
                        onChange={(e) => setNewLogCitizenName(e.target.value)}
                        placeholder="مثال: آقا رضا یا خانم احمدی"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">محله / آدرس:</label>
                      <input
                        type="text"
                        value={newLogLocation}
                        onChange={(e) => setNewLogLocation(e.target.value)}
                        placeholder="مثال: کوچه ۵ سلمان فارسی"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">وزن باسکول (کیلو):</label>
                      <input
                        type="number"
                        value={newLogKg}
                        onChange={(e) => setNewLogKg(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-center font-bold"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      متن روایی و عامیانه گزارش سیستم (سبک گفتاری صمیمانه):
                    </label>
                    <textarea
                      rows={2}
                      value={newLogNarrative}
                      onChange={(e) => setNewLogNarrative(e.target.value)}
                      placeholder="مثال: ساعت ۹:۱۵ صبح رسید کوچه ۵ سلمان فارسی، ۲۰ کیلو کارتن از آقا رضا گرفت و ۳۰۰ تومن زد به حسابش..."
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsAddLogOpen(false)}
                      className="px-3 py-1.5 bg-white text-slate-600 rounded-lg text-xs font-bold"
                    >
                      انصراف
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-black shadow-xs"
                    >
                      ثبت در پرونده سفیر
                    </button>
                  </div>
                </form>
              )}

              {/* CONVERSATIONAL ACTIVITY LOGS (سیستم گفتاری و عامیانه رفت و آمد) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-indigo-600" />
                    <h5 className="font-black text-xs sm:text-sm text-slate-900">
                      لاگ سیستمی و روایی رفت‌وآمدها (گفتاری و عامیانه)
                    </h5>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {toPersianDigits((selectedDriver.activityLogs || []).length)} رکورد ثبت‌شده
                  </span>
                </div>

                <div className="space-y-3">
                  {(selectedDriver.activityLogs && selectedDriver.activityLogs.length > 0) ? (
                    selectedDriver.activityLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 hover:border-slate-300 transition text-xs space-y-2.5"
                      >
                        {/* Header: Time, Location, Citizen */}
                        <div className="flex items-center justify-between text-slate-600">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{log.timeStr}</span>
                            </span>
                            <span>•</span>
                            <span className="font-bold text-indigo-900">{log.locationStr}</span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-slate-900">{log.citizenName}</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                              {log.citizenPhone}
                            </span>
                          </div>
                        </div>

                        {/* Conversational Narrative Bubble (The Core User Request) */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/90 text-slate-800 leading-relaxed font-medium flex items-start gap-2.5 shadow-2xs">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                            🗣️
                          </div>
                          <p className="text-xs sm:text-[13px] text-slate-800 leading-relaxed font-medium">
                            {log.storyNarrative}
                          </p>
                        </div>

                        {/* Meta Tags: Kg, Payout, Type */}
                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <Scale className="w-3 h-3" />
                              <span>وزن باسکول: {toPersianDigits(log.kgCollected)} کیلو</span>
                            </span>
                            <span className={`font-bold px-2 py-0.5 rounded-lg ${
                              log.type === 'charity' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {log.type === 'charity' ? 'طرح نیکوکاری' : 'تسویه نقدی'}
                            </span>
                          </div>

                          {log.payoutTomans > 0 && (
                            <span className="text-slate-600 font-mono font-bold">
                              مبلغ پایا: {toPersianDigits(formatTomans(log.payoutTomans))}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs">
                      هنوز لاگ مراجعتی برای این راننده ثبت نشده است. از دکمه «ثبت لاگ رفت‌وآمد» استفاده نمایید.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              یک راننده را از لیست انتخاب کنید تا پرونده و لاگ‌های عامیانه آن نمایش داده شود.
            </div>
          )}
        </div>
      </div>
      )}

      {/* DETAILED FLEET STATS & PERFORMANCE TABLE VIEW */}
      {viewMode === 'stats_table' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Fleet Performance KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold">کل ناوگان سفیران</span>
                <Truck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-slate-900 mt-2 font-mono">
                {toPersianDigits(totalFleetCount)} <span className="text-xs font-sans font-bold">سفیر</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-1 font-bold">
                {toPersianDigits(activeFleetCount)} سفیر فعال و تأییدشده
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-xs font-bold">سفیران برخط (آماده‌به‌کار)</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-base sm:text-lg font-black text-emerald-700 mt-2 font-mono">
                {toPersianDigits(onlineFleetCount)} <span className="text-xs font-sans font-bold">نفر</span>
              </div>
              <div className="text-[10px] text-emerald-600 mt-1 font-bold">
                آماده دریافت ماموریت بازیافت
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-indigo-600">
                <span className="text-xs font-bold">مجموع تناژ جمع‌آوری‌شده</span>
                <Scale className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-indigo-800 mt-2 font-mono">
                {toPersianDigits(totalFleetKg)} <span className="text-xs font-sans font-bold">kg</span>
              </div>
              <div className="text-[10px] text-indigo-600 mt-1 font-bold">
                کل پسماند ورودی از مبدا
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-blue-600">
                <span className="text-xs font-bold">ماموریت‌های موفق</span>
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-base sm:text-lg font-black text-blue-800 mt-2 font-mono">
                {toPersianDigits(totalFleetPickups)} <span className="text-xs font-sans font-bold">سرویس</span>
              </div>
              <div className="text-[10px] text-blue-600 mt-1 font-bold">
                تحویل و توزین موفق
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-amber-500">
                <span className="text-xs font-bold">میانگین رضایت شهروندان</span>
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              </div>
              <div className="text-base sm:text-lg font-black text-amber-800 mt-2 font-mono">
                {toPersianDigits(avgFleetRating)} <span className="text-xs font-sans font-bold">از ۵.۰</span>
              </div>
              <div className="text-[10px] text-amber-600 mt-1 font-bold">
                ارزیابی رفتار و دقت باسکول
              </div>
            </div>
          </div>

          {/* Table Filters & Sorting Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* City Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-slate-500">شهر:</span>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="all">همه شهرها</option>
                  {Object.entries(CITIES).map(([k, c]) => (
                    <option key={k} value={k}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-slate-500">وضعیت حساب:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="all">همه وضعیت‌ها</option>
                  <option value="active">فعال</option>
                  <option value="warning">دارای اخطار</option>
                  <option value="suspended">تعلیق‌شده</option>
                </select>
              </div>

              {/* Online Filter */}
              <div className="flex items-center gap-1 text-xs">
                <span className="font-bold text-slate-500">حضور:</span>
                <select
                  value={onlineFilter}
                  onChange={(e) => setOnlineFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="all">همه</option>
                  <option value="online">آنلاین و آماده</option>
                  <option value="offline">آفلاین</option>
                </select>
              </div>
            </div>

            {/* Sorting Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <span>مرتب‌سازی:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:bg-white"
              >
                <option value="completed">بیشترین ماموریت موفق</option>
                <option value="weight">بیشترین وزن جمع‌آوری (kg)</option>
                <option value="rating">بالاترین امتیاز شهروندان</option>
                <option value="name">نام سفیر (الفبا)</option>
              </select>

              <button
                type="button"
                onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                title={sortOrder === 'desc' ? 'نزولی به صعودی' : 'صعودی به نزولی'}
              >
                {sortOrder === 'desc' ? 'نزولی ↓' : 'صعودی ↑'}
              </button>

              <span className="text-xs text-slate-500 font-bold bg-slate-100 px-2.5 py-1 rounded-xl">
                {toPersianDigits(tableFilteredDrivers.length)} سفیر یافت شد
              </span>
            </div>
          </div>

          {/* Main Stats Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-600">
                    <th className="py-3 px-4">مشخصات سفیر</th>
                    <th className="py-3 px-4">شماره تماس و کدملی</th>
                    <th className="py-3 px-4">شهر و مشخصات خودرو</th>
                    <th className="py-3 px-4 text-center">وضعیت برخط</th>
                    <th className="py-3 px-4 text-center">وضعیت حساب</th>
                    <th className="py-3 px-4 text-center">پسماند جمع‌آوری (kg)</th>
                    <th className="py-3 px-4 text-center">ماموریت‌ها</th>
                    <th className="py-3 px-4 text-center">امتیاز و رضایت</th>
                    <th className="py-3 px-4 text-center">لاگ روایی</th>
                    <th className="py-3 px-4 text-center">عملیات مدیریت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                  {tableFilteredDrivers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                        هیچ سفیری با فیلترهای مشخص‌شده در سیستم یافت نشد.
                      </td>
                    </tr>
                  ) : (
                    tableFilteredDrivers.map((driver) => {
                      const cityName = CITIES[driver.cityId]?.name || 'نامشخص';
                      const logsCount = driver.activityLogs?.length || 0;

                      return (
                        <tr key={driver.id} className="hover:bg-slate-50/80 transition">
                          {/* Driver Info */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={driver.avatarUrl || AVATAR_PRESETS[0]}
                                alt={driver.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                              />
                              <div>
                                <div className="font-black text-slate-900">{driver.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  عضویت: {driver.joinedDateStr || '۱۴۰۵'}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact & National ID */}
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-800 text-xs">{driver.phone}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">کدملی: {driver.nationalId}</div>
                          </td>

                          {/* City & Vehicle */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-800">{cityName}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[130px]">
                              {driver.vehicleType} • {driver.plateNumber}
                            </div>
                          </td>

                          {/* Online Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black ${
                              driver.isOnline
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${driver.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                              <span>{driver.isOnline ? 'برخط' : 'آفلاین'}</span>
                            </span>
                          </td>

                          {/* Account Status */}
                          <td className="py-3.5 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                              driver.status === 'active'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : driver.status === 'warning'
                                ? 'bg-amber-50 text-amber-700 border border-amber-300'
                                : 'bg-rose-50 text-rose-700 border border-rose-300'
                            }`}>
                              {driver.status === 'active' ? 'فعال' : driver.status === 'warning' ? `اخطار (${toPersianDigits(driver.warningCount || 1)})` : 'تعلیق'}
                            </span>
                          </td>

                          {/* Collected Kg */}
                          <td className="py-3.5 px-4 text-center font-mono font-black text-emerald-800">
                            {toPersianDigits(driver.totalCollectedKg)} <span className="text-[10px] font-sans font-bold text-slate-500">kg</span>
                          </td>

                          {/* Completed Pickups */}
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                            {toPersianDigits(driver.totalCompletedPickups)}
                          </td>

                          {/* Rating */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {toPersianDigits((driver.rating || 5).toFixed(1))}
                              </span>
                            </div>
                            <div className="text-[9px] text-slate-400 mt-0.5">
                              {toPersianDigits(driver.ratingCount || 0)} نظر
                            </div>
                          </td>

                          {/* Activity Logs Count */}
                          <td className="py-3.5 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setViewMode('cards_detail');
                              }}
                              className="px-2 py-1 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 rounded-lg text-[11px] font-bold text-slate-700 transition cursor-pointer"
                              title="مشاهده لاگ‌های روایی و عامیانه این سفیر"
                            >
                              {toPersianDigits(logsCount)} لاگ روایی
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => handleOpenEdit(driver, e)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition cursor-pointer"
                                title="ویرایش اطلاعات هویتی و رمز"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDriver(driver);
                                  setViewMode('cards_detail');
                                }}
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition cursor-pointer"
                                title="مشاهده پرونده کامل و لاگ‌ها"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT / CREATE DRIVER */}
      {(isEditModalOpen || isNewDriverModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                {isNewDriverModalOpen ? 'ثبت و استخدام سفیر جدید در ناوگان' : `ویرایش پرونده ${formData.name}`}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setIsNewDriverModalOpen(false);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDriver} className="space-y-3.5">
              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  انتخاب یا تغییر تصویر پروفایل سفیر:
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {AVATAR_PRESETS.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt="avatar"
                      referrerPolicy="no-referrer"
                      onClick={() => setFormData({ ...formData, avatarUrl: url })}
                      className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition ${
                        formData.avatarUrl === url ? 'border-emerald-500 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.avatarUrl || ''}
                  onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                  placeholder="یا لینک دلخواه عکس را وارد کنید..."
                  className="w-full mt-1.5 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نام و نام خانوادگی:</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="مثال: سفیر علی رضایی"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    شماره تلفن (نام کاربری ورود): <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0917..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد ملی سفیر:</label>
                  <input
                    type="text"
                    value={formData.nationalId || ''}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="236..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      رمز عبور ورود سفیر: <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-emerald-700 font-bold">ورود با شماره موبایل</span>
                  </div>
                  <input
                    type="text"
                    value={formData.password || formData.pinCode || ''}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value, pinCode: e.target.value })}
                    placeholder="مثال: 1234 یا رمز دلخواه"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-center text-indigo-700 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع خودرو / وسیله:</label>
                  <input
                    type="text"
                    value={formData.vehicleType || ''}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    placeholder="مثال: وانت پراید مسقف"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">شماره پلاک:</label>
                  <input
                    type="text"
                    value={formData.plateNumber || ''}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })}
                    placeholder="ایران ۷۳ - ۴۵۶ ج ۱۲"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">شهر حوزه فعالیت:</label>
                <select
                  value={formData.cityId || currentCity}
                  onChange={(e) => setFormData({ ...formData, cityId: e.target.value as CityId })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                >
                  {Object.values(CITIES).map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setIsNewDriverModalOpen(false);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  ذخیره و به‌روزرسانی پرونده
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

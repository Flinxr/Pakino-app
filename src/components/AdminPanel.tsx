import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Truck, 
  Trophy, 
  Calendar, 
  BarChart3,
  Flame,
  Radio,
  Clock,
  Sparkles,
  HeartHandshake,
  Sliders,
  Coins
} from 'lucide-react';
import { 
  CityId, 
  PickupRequest, 
  UserProfile, 
  DriverProfile, 
  LotteryWinner, 
  LiveEventLottery,
  ScheduledLottery,
  AdminCapacitySetting,
  CharityProject,
  HeroSlide,
  WasteCategory
} from '../types';
import { CITIES, TIME_SLOTS, WASTE_CATEGORIES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

// Modular Admin Views
import { AdminOverviewDashboard } from './admin/AdminOverviewDashboard';
import { AdminLotteryManager } from './admin/AdminLotteryManager';
import { AdminFleetManager } from './admin/AdminFleetManager';
import { AdminCitizenManager } from './admin/AdminCitizenManager';
import { AdminCharityManager } from './admin/AdminCharityManager';
import { AdminHeroSlidesManager } from './admin/AdminHeroSlidesManager';
import { AdminTariffManager } from './admin/AdminTariffManager';

interface AdminPanelProps {
  currentCity: CityId;
  requests: PickupRequest[];
  drivers: DriverProfile[];
  users: UserProfile[];
  scheduledLotteries: ScheduledLottery[];
  liveEventLottery: LiveEventLottery;
  winnersList: LotteryWinner[];
  charityProjects?: CharityProject[];
  heroSlides?: HeroSlide[];
  wasteCategories?: WasteCategory[];
  onUpdateDrivers: (drivers: DriverProfile[]) => void;
  onUpdateUsers: (users: UserProfile[]) => void;
  onUpdateScheduledLotteries: (lotteries: ScheduledLottery[]) => void;
  onUpdateLiveEventLottery: (event: LiveEventLottery) => void;
  onUpdateWinnersList: (winners: LotteryWinner[]) => void;
  onUpdateCharityProjects?: (projects: CharityProject[]) => void;
  onUpdateHeroSlides?: (slides: HeroSlide[]) => void;
  onUpdateWasteCategories?: (categories: WasteCategory[]) => void;
  onAnnounceResetTickets: (periodName: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  currentCity,
  requests,
  drivers,
  users,
  scheduledLotteries,
  liveEventLottery,
  winnersList,
  charityProjects = [],
  heroSlides = [],
  wasteCategories = WASTE_CATEGORIES,
  onUpdateDrivers,
  onUpdateUsers,
  onUpdateScheduledLotteries,
  onUpdateLiveEventLottery,
  onUpdateWinnersList,
  onUpdateCharityProjects,
  onUpdateHeroSlides,
  onUpdateWasteCategories = () => {},
  onAnnounceResetTickets
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'tariffs' | 'lottery_engine' | 'charity' | 'hero_slides' | 'fleet' | 'citizens' | 'capacity'>('overview');

  // Capacity & Holiday Toggles
  const [slotCapacities, setSlotCapacities] = useState<Record<string, number>>({
    morning: 400,
    afternoon: 400,
    evening: 300
  });
  const [isHolidayShutdown, setIsHolidayShutdown] = useState<boolean>(false);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-slate-700 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  سامانه نظارت، پایش هوشمند و مدیریت پاکینو
                </h2>
                <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-2 py-0.5 rounded-full border border-indigo-400/30">
                  {CITIES[currentCity]?.name || 'نورآباد'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                کنترل قرعه‌کشی زمان‌بندی‌شده، رانندگان و گزارش‌های عامیانه، پرونده شهروندان و ظرفیت‌ها
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>سیستم متصل و برخط</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs overflow-x-auto shadow-inner">
        {[
          { id: 'overview', label: 'داشبورد و تحلیل‌ها', icon: BarChart3 },
          { id: 'tariffs', label: 'تعرفه و نرخ مصوب بازیافت', icon: Coins },
          { id: 'hero_slides', label: 'بنرها و اسلایدر صفحه اصلی', icon: Sliders },
          { id: 'lottery_engine', label: 'مدیریت و زمان‌بندی قرعه‌کشی', icon: Trophy },
          { id: 'charity', label: 'پروژه‌های مسئولیت اجتماعی و نیکوکاری', icon: HeartHandshake },
          { id: 'fleet', label: 'مدیریت رانندگان و لاگ عامیانه', icon: Truck },
          { id: 'citizens', label: 'پرونده شهروندان (نقدی/نیکوکاری)', icon: Users },
          { id: 'capacity', label: 'تنظیم ظرفیت و تعطیلات', icon: Calendar }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2.5 px-3.5 rounded-xl font-black transition flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive 
                  ? 'bg-white text-indigo-950 shadow-sm ring-1 ring-slate-200' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <AdminOverviewDashboard
          currentCity={currentCity}
          requests={requests}
          drivers={drivers}
          users={users}
        />
      )}

      {/* TAB: WASTE TARIFFS & APPROVED PRICES MANAGER */}
      {activeTab === 'tariffs' && (
        <AdminTariffManager
          wasteCategories={wasteCategories}
          onUpdateWasteCategories={onUpdateWasteCategories}
        />
      )}

      {/* TAB 2: HERO SLIDES & BANNERS MANAGER */}
      {activeTab === 'hero_slides' && (
        <AdminHeroSlidesManager
          currentCity={currentCity}
          slides={heroSlides}
          onUpdateSlides={(updated) => {
            if (onUpdateHeroSlides) {
              onUpdateHeroSlides(updated);
            }
          }}
        />
      )}

      {/* TAB 2: SCHEDULED LOTTERY & REWARDS MANAGER */}
      {activeTab === 'lottery_engine' && (
        <AdminLotteryManager
          currentCity={currentCity}
          requests={requests}
          users={users}
          scheduledLotteries={scheduledLotteries}
          liveEventLottery={liveEventLottery}
          winnersList={winnersList}
          onUpdateScheduledLotteries={onUpdateScheduledLotteries}
          onUpdateLiveEventLottery={onUpdateLiveEventLottery}
          onAddWinner={(newWinner) => onUpdateWinnersList([newWinner, ...winnersList])}
          onResetPreviousTickets={onAnnounceResetTickets}
        />
      )}

      {/* TAB 3: CHARITY & CSR PROJECTS MANAGER */}
      {activeTab === 'charity' && (
        <AdminCharityManager
          currentCity={currentCity}
          projects={charityProjects}
          onUpdateProjects={(updated) => {
            if (onUpdateCharityProjects) {
              onUpdateCharityProjects(updated);
            }
          }}
        />
      )}

      {/* TAB 3: FLEET MANAGER WITH CONVERSATIONAL LOGS */}
      {activeTab === 'fleet' && (
        <AdminFleetManager
          currentCity={currentCity}
          drivers={drivers}
          requests={requests}
          onUpdateDrivers={onUpdateDrivers}
        />
      )}

      {/* TAB 4: CITIZEN DOSSIERS (CHARITY VS CASH) */}
      {activeTab === 'citizens' && (
        <AdminCitizenManager
          currentCity={currentCity}
          users={users}
          requests={requests}
          onUpdateUsers={onUpdateUsers}
        />
      )}

      {/* TAB 5: CAPACITY & HOLIDAY SHUTDOWN */}
      {activeTab === 'capacity' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <h3 className="font-black text-sm text-slate-900">مدیریت سقف ظرفیت شیفت‌ها و تعطیلات اضطراری</h3>
                <p className="text-xs text-slate-500">تنظیم سقف مجاز دریافت پسماند در هر بازه زمانی</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
              شهر: {CITIES[currentCity]?.name}
            </span>
          </div>

          {/* Holiday Toggle */}
          <div className="p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div>
              <div className="font-black text-xs sm:text-sm text-slate-900">وضعیت سرویس‌دهی شهر:</div>
              <p className="text-xs text-slate-500 mt-0.5">در صورت تعطیلی، امکان ثبت درخواست جدید توسط شهروندان موقتاً غیرفعال خواهد بود.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsHolidayShutdown(!isHolidayShutdown)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition cursor-pointer shadow-xs ${
                isHolidayShutdown ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isHolidayShutdown ? '⛔ سرویس‌دهی متوقف است' : '✅ سرویس‌دهی فعال است'}
            </button>
          </div>

          {/* Capacity settings per slot */}
          <div className="space-y-3 pt-2">
            <h4 className="font-black text-xs text-slate-800">حداکثر سقف مجاز جمع‌آوری ناوگان در هر شیفت (کیلوگرم):</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIME_SLOTS.map((slot) => (
                <div key={slot.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="font-black text-xs text-slate-900 flex items-center justify-between">
                    <span>شیفت {slot.label}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{slot.timeRange}</span>
                  </div>
                  <input
                    type="number"
                    step="50"
                    value={slotCapacities[slot.id] || 400}
                    onChange={(e) => setSlotCapacities({ ...slotCapacities, [slot.id]: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-black text-center text-slate-900 shadow-xs"
                  />
                  <div className="text-[10px] text-slate-500 text-center">سقف مجاز پذیرش سفارش (کیلوگرم)</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

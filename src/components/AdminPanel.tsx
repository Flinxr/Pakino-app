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
  Coins,
  ClipboardList,
  MapPin,
  History as HistoryIcon
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
import { AdminRequestsLifecycleManager } from './admin/AdminRequestsLifecycleManager';
import { AdminLotteryManager } from './admin/AdminLotteryManager';
import { AdminFleetManager } from './admin/AdminFleetManager';
import { AdminCitizenManager } from './admin/AdminCitizenManager';
import { AdminCharityManager } from './admin/AdminCharityManager';
import { AdminHeroSlidesManager } from './admin/AdminHeroSlidesManager';
import { AdminTariffManager } from './admin/AdminTariffManager';
import { AdminCapacityShiftMatrix } from './admin/AdminCapacityShiftMatrix';
import { AdminGeofenceManager } from './admin/AdminGeofenceManager';
import { AdminDriverDailyStats } from './admin/AdminDriverDailyStats';
import { AdminEventLogsManager } from './admin/AdminEventLogsManager';
import { AdminFeedbackPollsManager } from './admin/AdminFeedbackPollsManager';
import { ErrorBoundary } from './ErrorBoundary';

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
  const [activeTab, setActiveTab] = useState<'overview' | 'driver_daily_stats' | 'event_logs' | 'requests_lifecycle' | 'tariffs' | 'hero_slides' | 'lottery_engine' | 'charity' | 'fleet' | 'citizens' | 'feedback_polls' | 'capacity' | 'geofence'>('overview');

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
          { id: 'overview', label: 'داشبورد عمومی', icon: BarChart3 },
          { id: 'driver_daily_stats', label: 'آمار رانندگان', icon: Truck },
          { id: 'event_logs', label: 'لاگ رویدادها', icon: HistoryIcon },
          { id: 'requests_lifecycle', label: 'درخواست‌ها', icon: ClipboardList },
          { id: 'tariffs', label: 'تعرفه پسماند', icon: Coins },
          { id: 'hero_slides', label: 'اسلایدر صفحه اصلی', icon: Sliders },
          { id: 'lottery_engine', label: 'قرعه‌کشی', icon: Trophy },
          { id: 'charity', label: 'پروژه‌های نیکوکاری', icon: HeartHandshake },
          { id: 'fleet', label: 'مدیریت ناوگان', icon: Truck },
          { id: 'citizens', label: 'شهروندان', icon: Users },
          { id: 'feedback_polls', label: 'نظرسنجی و پشتیبانی', icon: ClipboardList },
          { id: 'capacity', label: 'شیفت‌ها و ظرفیت', icon: Calendar },
          { id: 'geofence', label: 'محدوده چندضلعی', icon: MapPin }
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
        <ErrorBoundary fallbackTitle="خطا در بارگذاری داشبورد آمار و تحلیل‌ها">
          <AdminOverviewDashboard
            currentCity={currentCity}
            requests={requests}
            drivers={drivers}
            users={users}
          />
        </ErrorBoundary>
      )}

      {/* TAB: DRIVER DAILY STATS (ITEM 7) */}
      {activeTab === 'driver_daily_stats' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری آمار تفکیکی روزانه رانندگان">
          <AdminDriverDailyStats
            currentCity={currentCity}
            requests={requests}
            drivers={drivers}
          />
        </ErrorBoundary>
      )}

      {/* TAB: COMPREHENSIVE EVENT LOGS AUDIT (ITEM 8) */}
      {activeTab === 'event_logs' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری سامانه لاگ و وقایع">
          <AdminEventLogsManager
            currentCity={currentCity}
          />
        </ErrorBoundary>
      )}

      {/* TAB: REQUESTS LIFECYCLE & CANCELLATIONS AUDIT */}
      {activeTab === 'requests_lifecycle' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری چرخه حیات درخواست‌ها">
          <AdminRequestsLifecycleManager
            currentCity={currentCity}
            requests={requests}
          />
        </ErrorBoundary>
      )}

      {/* TAB: WASTE TARIFFS & APPROVED PRICES MANAGER */}
      {activeTab === 'tariffs' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری تعرفه‌ها و نرخ مصوب">
          <AdminTariffManager
            wasteCategories={wasteCategories}
            onUpdateWasteCategories={onUpdateWasteCategories}
          />
        </ErrorBoundary>
      )}

      {/* TAB 2: HERO SLIDES & BANNERS MANAGER */}
      {activeTab === 'hero_slides' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری اسلایدرها و بنرها">
          <AdminHeroSlidesManager
            currentCity={currentCity}
            slides={heroSlides}
            onUpdateSlides={(updated) => {
              if (onUpdateHeroSlides) {
                onUpdateHeroSlides(updated);
              }
            }}
          />
        </ErrorBoundary>
      )}

      {/* TAB 2: SCHEDULED LOTTERY & REWARDS MANAGER */}
      {activeTab === 'lottery_engine' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری مدیریت قرعه‌کشی">
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
        </ErrorBoundary>
      )}

      {/* TAB 3: CHARITY & CSR PROJECTS MANAGER */}
      {activeTab === 'charity' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری پروژه‌های نیکوکاری">
          <AdminCharityManager
            currentCity={currentCity}
            projects={charityProjects}
            requests={requests}
            onUpdateProjects={(updated) => {
              if (onUpdateCharityProjects) {
                onUpdateCharityProjects(updated);
              }
            }}
          />
        </ErrorBoundary>
      )}

      {/* TAB 3: FLEET MANAGER WITH CONVERSATIONAL LOGS */}
      {activeTab === 'fleet' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری مدیریت ناوگان رانندگان">
          <AdminFleetManager
            currentCity={currentCity}
            drivers={drivers}
            requests={requests}
            onUpdateDrivers={onUpdateDrivers}
          />
        </ErrorBoundary>
      )}

      {/* TAB 4: CITIZEN DOSSIERS (CHARITY VS CASH) */}
      {activeTab === 'citizens' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری پرونده شهروندان">
          <AdminCitizenManager
            currentCity={currentCity}
            users={users}
            requests={requests}
            onUpdateUsers={onUpdateUsers}
          />
        </ErrorBoundary>
      )}

      {/* TAB: FEEDBACK & CITIZEN POLLS MANAGER (Item 13) */}
      {activeTab === 'feedback_polls' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری سامانه نظرسنجی و پشتیبانی">
          <AdminFeedbackPollsManager
            currentCity={currentCity}
          />
        </ErrorBoundary>
      )}

      {/* TAB 5: 7x4 SHIFT CAPACITY & DATE EXCEPTIONS (Item 9) */}
      {activeTab === 'capacity' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری ماتریس ظرفیت و شیفت‌ها">
          <AdminCapacityShiftMatrix
            currentCity={currentCity}
            requests={requests}
          />
        </ErrorBoundary>
      )}

      {/* TAB 6: GEOFENCE POLYGON MANAGER (Item 10) */}
      {activeTab === 'geofence' && (
        <ErrorBoundary fallbackTitle="خطا در بارگذاری محدوده چندضلعی شهر">
          <AdminGeofenceManager
            currentCity={currentCity}
          />
        </ErrorBoundary>
      )}
    </div>
  );
};

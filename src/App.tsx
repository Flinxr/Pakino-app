/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Home, 
  History, 
  Gift, 
  MessageSquare, 
  Truck, 
  User, 
  Recycle, 
  Share2, 
  Plus,
  ShieldCheck,
  MapPin,
  CreditCard
} from 'lucide-react';
import { 
  CityId, 
  UserProfile, 
  PickupRequest, 
  WalletTransaction, 
  WithdrawalRequest,
  DriverProfile,
  ScheduledLottery,
  LiveEventLottery,
  LotteryWinner,
  CharityProject,
  HeroSlide,
  WasteCategory,
  RequestStatusLog,
  CancellationInfo,
  WeighedItem
} from './types';
import { 
  CITIES, 
  INITIAL_DRIVERS, 
  INITIAL_SCHEDULED_LOTTERIES, 
  ACTIVE_LIVE_LOTTERY, 
  PAST_LOTTERY_WINNERS, 
  INITIAL_USERS_LIST,
  CHARITY_PROJECTS,
  INITIAL_HERO_SLIDES,
  WASTE_CATEGORIES as INITIAL_WASTE_CATEGORIES
} from './data/cities';
import { toPersianDigits, formatTomans } from './utils/persian';
import { Header } from './components/Header';
import { CitizenHome } from './components/CitizenHome';
import { NewPickupModal } from './components/NewPickupModal';
import { HistoryView } from './components/HistoryView';
import { DriverPanel } from './components/DriverPanel';
import { AdminPanel } from './components/AdminPanel';
import { AuthModal } from './components/AuthModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ShareModal } from './components/ShareModal';
import { LotterySection } from './components/LotterySection';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { DriverRatingModal } from './components/DriverRatingModal';
import { logAppEvent } from './utils/eventLogger';
import { ErrorBoundary } from './components/ErrorBoundary';

import { getUpcomingDays } from './utils/persian';

// Initial default dynamic demo requests based on current upcoming days
const generateInitialDemoRequests = (): PickupRequest[] => {
  const days = getUpcomingDays();
  const day0 = days[0] || { dayName: 'شنبه', dateStr: 'شنبه ۱۷ شهریور ۱۴۰۵', rawDateKey: '2026-09-05' };
  const day1 = days[1] || { dayName: 'یکشنبه', dateStr: 'یکشنبه ۱۸ شهریور ۱۴۰۵', rawDateKey: '2026-09-06' };
  const day2 = days[2] || { dayName: 'دوشنبه', dateStr: 'دوشنبه ۱۹ شهریور ۱۴۰۵', rawDateKey: '2026-09-07' };

  return [
    {
      id: '1021',
      trackingCode: 'PK-1021',
      userId: 'usr-101',
      userName: 'علی حسینی',
      userPhone: '09171234567',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'charity',
      payoutMethod: 'direct_card_transfer',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 15,
      actualKg: 15,
      categories: ['plastic', 'cardboard'],
      approximatePayoutTomans: 225000,
      charityName: 'موسسه خیریه حضرت امام علی (ع) ممسنی',
      address: {
        lat: 30.1147,
        lng: 51.5218,
        street: 'میدان امام خمینی، کوی گلستان، پلاک ۱۲',
        neighborhood: 'کوی گلستان',
        plaque: '۱۲',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-M19204'
    },
    {
      id: '1022',
      trackingCode: 'PK-1022',
      userId: 'user-1',
      userName: 'فاطمه احمدی',
      userPhone: '09173332211',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      payoutMethod: 'direct_card_transfer',
      dateStr: day1.dateStr,
      dayOfWeek: day1.dayName,
      timeSlot: '۱۵ تا ۱۸',
      timeSlotId: 'afternoon',
      estimatedKg: 25,
      categories: ['cardboard', 'glass', 'plastic'],
      approximatePayoutTomans: 375000,
      charityName: 'مرکز نیکوکاری نرجس خاتون (س)',
      address: {
        lat: 30.1210,
        lng: 51.5310,
        street: 'خیابان شهید بهشتی، جنب آتش نشانی',
        neighborhood: 'خیابان شهید بهشتی',
        plaque: '۹',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-E88219'
    },
    {
      id: '1023',
      trackingCode: 'PK-1023',
      userId: 'user-4',
      userName: 'امیرحسین موسوی',
      userPhone: '09177778899',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      payoutMethod: 'direct_card_transfer',
      dateStr: day2.dateStr,
      dayOfWeek: day2.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 18,
      categories: ['metal', 'plastic'],
      approximatePayoutTomans: 270000,
      address: {
        lat: 30.1190,
        lng: 51.5280,
        street: 'خیابان کشاورز، روبروی مرکز بهداشت',
        neighborhood: 'خیابان کشاورز',
        plaque: '۲۲',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-A99211'
    },
    {
      id: '1020',
      trackingCode: 'PK-1020',
      userId: 'user-2',
      userName: 'رضا کازرونی',
      userPhone: '09179876543',
      cityId: 'kazeroon',
      cityName: 'کازرون',
      type: 'cash',
      payoutMethod: 'direct_card_transfer',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 20,
      categories: ['cardboard', 'plastic'],
      approximatePayoutTomans: 300000,
      address: {
        lat: 29.6195,
        lng: 51.6541,
        street: 'میدان شهدا، خیابان سلمان فارسی، کوچه ۵',
        neighborhood: 'میدان شهدا',
        plaque: '۷',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-K10928'
    },
    {
      id: '1025',
      trackingCode: 'PK-1025',
      userId: 'user-3',
      userName: 'مهدی شفیعی',
      userPhone: '09174443322',
      cityId: 'kazeroon',
      cityName: 'کازرون',
      type: 'charity',
      payoutMethod: 'direct_card_transfer',
      dateStr: day1.dateStr,
      dayOfWeek: day1.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 35,
      categories: ['metal', 'plastic', 'electronics'],
      approximatePayoutTomans: 525000,
      charityName: 'موسسه خیریه قمر بنی هاشم کازرون',
      address: {
        lat: 29.6240,
        lng: 51.6480,
        street: 'خیابان نطنج، جنب درمانگاه امام سجاد',
        neighborhood: 'خیابان نطنج',
        plaque: '۱۴',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-K22910'
    },
    {
      id: '1019',
      trackingCode: 'PK-1019',
      userId: 'usr-101',
      userName: 'علی حسینی',
      userPhone: '09171234567',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      dateStr: 'چهارشنبه ۱۴ شهریور ۱۴۰۵',
      dayOfWeek: 'چهارشنبه',
      timeSlot: '۱۵ تا ۱۸',
      timeSlotId: 'afternoon',
      estimatedKg: 18,
      actualKg: 18.5,
      categories: ['metal', 'plastic'],
      approximatePayoutTomans: 275000,
      cashPaidTomans: 280000,
      address: {
        lat: 30.1180,
        lng: 51.5260,
        street: 'بلوار امام خمینی، روبروی فرمانداری',
        neighborhood: 'بلوار امام خمینی',
        plaque: '۴۴',
        isInsideBoundary: true
      },
      status: 'collected',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      lotteryTicketNumber: 'PK-B39102',
      driverName: 'سفیر علی رضایی',
      driverPhone: '09171239988',
      vehicleModel: 'وانت پراید سفید مسقف',
      vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
      payoutMethod: 'direct_card_transfer',
      statusHistory: [
        {
          id: 'log-1019-1',
          status: 'pending',
          statusTitle: 'ثبت نوبت توسط شهروند',
          timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
          changedByRole: 'citizen',
          changedByName: 'علی حسینی'
        },
        {
          id: 'log-1019-2',
          status: 'assigned',
          statusTitle: 'پذیرش توسط سفیر راننده',
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
          changedByRole: 'driver',
          changedByName: 'سفیر علی رضایی'
        },
        {
          id: 'log-1019-3',
          status: 'collected',
          statusTitle: 'توزین و تسویه کارت‌به‌کارت نهایی',
          timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
          changedByRole: 'driver',
          changedByName: 'سفیر علی رضایی',
          note: 'کارتن‌ها کاملاً تفکیک و خشک بودند'
        }
      ]
    },
    {
      id: '1026',
      trackingCode: 'PK-1026',
      userId: 'usr-104',
      userName: 'سارا کریمی',
      userPhone: '09175554433',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      payoutMethod: 'direct_card_transfer',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 22,
      categories: ['plastic', 'cardboard'],
      approximatePayoutTomans: 330000,
      address: {
        lat: 30.1165,
        lng: 51.5240,
        street: 'خیابان ۱۷ شهریور، روبروی پارک لاله',
        neighborhood: 'خیابان ۱۷ شهریور',
        plaque: '۱۸',
        isInsideBoundary: true
      },
      status: 'assigned',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      lotteryTicketNumber: 'PK-S49102',
      driverId: 'drv-101',
      driverName: 'سفیر علی رضایی',
      driverPhone: '09171239988',
      vehicleModel: 'وانت پراید سفید مسقف',
      vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
      statusHistory: [
        {
          id: 'log-1026-1',
          status: 'pending',
          statusTitle: 'ثبت نوبت توسط شهروند',
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
          changedByRole: 'citizen',
          changedByName: 'سارا کریمی'
        },
        {
          id: 'log-1026-2',
          status: 'assigned',
          statusTitle: 'پذیرش توسط سفیر راننده',
          timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
          changedByRole: 'driver',
          changedByName: 'سفیر علی رضایی'
        }
      ]
    },
    {
      id: '1027',
      trackingCode: 'PK-1027',
      userId: 'usr-105',
      userName: 'محمدرضا محمودی',
      userPhone: '09176667788',
      cityId: 'kazeroon',
      cityName: 'کازرون',
      type: 'cash',
      payoutMethod: 'direct_card_transfer',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۱۵ تا ۱۸',
      timeSlotId: 'afternoon',
      estimatedKg: 14,
      categories: ['cardboard'],
      approximatePayoutTomans: 210000,
      address: {
        lat: 29.6150,
        lng: 51.6510,
        street: 'خیابان طالقانی، کوچه پزشکان، بن‌بست سوم',
        neighborhood: 'خیابان طالقانی',
        plaque: '۵',
        isInsideBoundary: true
      },
      status: 'cancelled',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      lotteryTicketNumber: 'PK-M99301',
      cancellationDetails: {
        cancelledBy: 'citizen',
        cancelledById: 'usr-105',
        cancelledByName: 'محمدرضا محمودی',
        cancelledAt: new Date(Date.now() - 3600000 * 8).toISOString(),
        reason: 'تغییر برنامه کاری و عدم حضور در منزل در ساعت مقرر',
        citizenId: 'usr-105',
        citizenName: 'محمدرضا محمودی',
        citizenPhone: '09176667788'
      },
      statusHistory: [
        {
          id: 'log-1027-1',
          status: 'pending',
          statusTitle: 'ثبت نوبت توسط شهروند',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          changedByRole: 'citizen',
          changedByName: 'محمدرضا محمودی'
        },
        {
          id: 'log-1027-2',
          status: 'cancelled',
          statusTitle: 'لغو نوبت توسط شهروند',
          timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
          changedByRole: 'citizen',
          changedByName: 'محمدرضا محمودی',
          note: 'تغییر برنامه کاری و عدم حضور در منزل در ساعت مقرر'
        }
      ]
    }
  ];
};

const INITIAL_DEMO_REQUESTS: PickupRequest[] = generateInitialDemoRequests();

// Initial demo wallet transactions
const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-101',
    type: 'credit',
    title: 'واریز بابت تحویل پسماند خشک (#۱۰۱۹)',
    amountTomans: 280000,
    dateStr: '۱۴ شهریور ۱۴۰۵',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'completed',
    referenceId: 'PK-1019',
    description: 'تحویل ۱۸.۵ کیلوگرم فلز و پلاستیک به سفیر پاکیار'
  },
  {
    id: 'tx-102',
    type: 'credit',
    title: 'هدیه ثبت‌نام اولیه و نصب پاکینو',
    amountTomans: 50000,
    dateStr: '۱۰ شهریور ۱۴۰۵',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'completed',
    referenceId: 'WELCOME-BONUS',
    description: 'پاداش شروع تفکیک پسماند شهری'
  }
];

export default function App() {
  // App City
  const [currentCity, setCurrentCity] = useState<CityId>(() => {
    return (localStorage.getItem('pakino_city') as CityId) || 'noorabad';
  });

  // Mode: citizen vs driver vs admin
  const [userRole, setUserRole] = useState<'citizen' | 'driver' | 'admin'>('citizen');

  // Active Navigation Tab for Citizen Mode
  const [activeCitizenTab, setActiveCitizenTab] = useState<'home' | 'history' | 'lottery'>('home');

  // Modals visibility (Item 1: حذف کامل پاپ‌آپ کیف پول)
  const [isNewPickupOpen, setIsNewPickupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [ratingModalRequest, setRatingModalRequest] = useState<PickupRequest | null>(null);

  // History API State Tracking (Item 17: مدیریت دکمه بازگشت گوشی و بستن مرحله‌به‌مرحله)
  const isNavigatingBackRef = useRef(false);
  const historyStackRef = useRef<string[]>(['root']);

  const pushHistoryEntry = useCallback((entryKey: string) => {
    if (isNavigatingBackRef.current) return;
    const currentTop = historyStackRef.current[historyStackRef.current.length - 1];
    if (currentTop === entryKey) return;
    historyStackRef.current.push(entryKey);
    window.history.pushState({ entryKey, depth: historyStackRef.current.length }, '');
  }, []);

  const popHistoryEntry = useCallback((entryKey: string) => {
    const currentTop = historyStackRef.current[historyStackRef.current.length - 1];
    if (currentTop === entryKey) {
      isNavigatingBackRef.current = true;
      historyStackRef.current.pop();
      window.history.back();
      setTimeout(() => {
        isNavigatingBackRef.current = false;
      }, 60);
    }
  }, []);

  const handleOpenNewPickup = useCallback(() => {
    pushHistoryEntry('modal:new-pickup');
    setIsNewPickupOpen(true);
  }, [pushHistoryEntry]);

  const handleCloseNewPickup = useCallback(() => {
    popHistoryEntry('modal:new-pickup');
    setIsNewPickupOpen(false);
  }, [popHistoryEntry]);

  const handleOpenAuth = useCallback(() => {
    pushHistoryEntry('modal:auth');
    setIsAuthOpen(true);
  }, [pushHistoryEntry]);

  const handleCloseAuth = useCallback(() => {
    popHistoryEntry('modal:auth');
    setIsAuthOpen(false);
  }, [popHistoryEntry]);

  const handleOpenFeedback = useCallback(() => {
    pushHistoryEntry('modal:feedback');
    setIsFeedbackOpen(true);
  }, [pushHistoryEntry]);

  const handleCloseFeedback = useCallback(() => {
    popHistoryEntry('modal:feedback');
    setIsFeedbackOpen(false);
  }, [popHistoryEntry]);

  const handleOpenShare = useCallback(() => {
    pushHistoryEntry('modal:share');
    setIsShareOpen(true);
  }, [pushHistoryEntry]);

  const handleCloseShare = useCallback(() => {
    popHistoryEntry('modal:share');
    setIsShareOpen(false);
  }, [popHistoryEntry]);

  const handleOpenRatingModal = useCallback((req: PickupRequest) => {
    pushHistoryEntry('modal:rating');
    setRatingModalRequest(req);
  }, [pushHistoryEntry]);

  const handleCloseRatingModal = useCallback(() => {
    popHistoryEntry('modal:rating');
    setRatingModalRequest(null);
  }, [popHistoryEntry]);

  const handleSelectCitizenTab = useCallback((tab: 'home' | 'history' | 'lottery') => {
    if (tab === 'home') {
      historyStackRef.current = ['root'];
      setActiveCitizenTab('home');
    } else {
      pushHistoryEntry(`tab:${tab}`);
      setActiveCitizenTab(tab);
    }
  }, [pushHistoryEntry]);

  // Synchronize Browser Popstate with Modals and Sub-pages
  useEffect(() => {
    window.history.replaceState({ entryKey: 'root', depth: 1 }, '');

    const handlePopState = () => {
      if (isNavigatingBackRef.current) return;

      // Close topmost modal first
      if (isNewPickupOpen) {
        setIsNewPickupOpen(false);
        historyStackRef.current = historyStackRef.current.filter((k) => k !== 'modal:new-pickup');
        return;
      }
      if (ratingModalRequest) {
        setRatingModalRequest(null);
        historyStackRef.current = historyStackRef.current.filter((k) => k !== 'modal:rating');
        return;
      }
      if (isFeedbackOpen) {
        setIsFeedbackOpen(false);
        historyStackRef.current = historyStackRef.current.filter((k) => k !== 'modal:feedback');
        return;
      }
      if (isShareOpen) {
        setIsShareOpen(false);
        historyStackRef.current = historyStackRef.current.filter((k) => k !== 'modal:share');
        return;
      }
      if (isAuthOpen) {
        setIsAuthOpen(false);
        historyStackRef.current = historyStackRef.current.filter((k) => k !== 'modal:auth');
        return;
      }

      // If no modal is open and on a citizen sub-tab, go back to home tab
      if (userRole === 'citizen' && activeCitizenTab !== 'home') {
        setActiveCitizenTab('home');
        historyStackRef.current = ['root'];
        return;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isNewPickupOpen, ratingModalRequest, isFeedbackOpen, isShareOpen, isAuthOpen, userRole, activeCitizenTab]);

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('pakino_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          walletBalanceTomans: parsed.walletBalanceTomans !== undefined ? parsed.walletBalanceTomans : 330000
        };
      } catch {}
    }
    return {
      id: 'usr-101',
      phone: '09171234567',
      firstName: 'علی',
      lastName: 'حسینی',
      cityId: 'noorabad',
      walletBalanceTomans: 330000,
      totalKgRecycled: 28,
      totalDonatedKg: 10,
      totalEarnedTomans: 280000,
      lotteryPoints: 120,
      isRegistered: true,
      savedCardNumber: '6037 9971 8823 4410',
      savedAccountHolder: 'علی حسینی'
    };
  });

  // Drivers State
  const [drivers, setDrivers] = useState<DriverProfile[]>(() => {
    const saved = localStorage.getItem('pakino_drivers');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_DRIVERS;
  });

  // Scheduled Lotteries State
  const [scheduledLotteries, setScheduledLotteries] = useState<ScheduledLottery[]>(() => {
    const saved = localStorage.getItem('pakino_scheduled_lotteries');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_SCHEDULED_LOTTERIES;
  });

  // Live Event Lottery State (e.g. Father's Day, Code 110)
  const [liveEventLottery, setLiveEventLottery] = useState<LiveEventLottery>(() => {
    const saved = localStorage.getItem('pakino_live_event_lottery');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return ACTIVE_LIVE_LOTTERY;
  });

  // Winners List State
  const [winnersList, setWinnersList] = useState<LotteryWinner[]>(() => {
    const saved = localStorage.getItem('pakino_winners_list');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return PAST_LOTTERY_WINNERS;
  });

  // Users List State (for Admin Citizen Dossiers)
  const [usersList, setUsersList] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('pakino_users_list');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_USERS_LIST;
  });

  // Charity & Social Responsibility Projects State
  const [charityProjects, setCharityProjects] = useState<CharityProject[]>(() => {
    const saved = localStorage.getItem('pakino_charity_projects');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return CHARITY_PROJECTS;
  });

  // Hero Slides & Banners State (Admin customizable)
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(() => {
    const saved = localStorage.getItem('pakino_hero_slides');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_HERO_SLIDES;
  });

  // Approved Waste Tariffs & Categories State (Admin customizable)
  const [wasteCategories, setWasteCategories] = useState<WasteCategory[]>(() => {
    const saved = localStorage.getItem('pakino_waste_categories');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_WASTE_CATEGORIES;
  });

  // Ticket Reset Announcement Banner
  const [ticketResetAnnouncement, setTicketResetAnnouncement] = useState<string>('');

  // Handle Admin Reset Tickets for previous period
  const handleAnnounceResetTickets = (periodName: string) => {
    setTicketResetAnnouncement(`دوره پیشین (${periodName}) با موفقیت قرعه‌کشی و به پایان رسید. کدهای شانس برای دوره جدید از صفر آغاز شدند.`);
  };

  // Wallet Transactions State
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => {
    const saved = localStorage.getItem('pakino_wallet_tx');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_TRANSACTIONS;
  });

  // Recycling Requests State
  const [requests, setRequests] = useState<PickupRequest[]>(() => {
    const saved = localStorage.getItem('pakino_requests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return INITIAL_DEMO_REQUESTS;
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('pakino_city', currentCity);
  }, [currentCity]);

  // Capture Referral Code from URL query param (?ref=09171234567)
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const refCode = urlParams.get('ref');
      if (refCode && refCode.trim() !== '') {
        localStorage.setItem('pakino_referred_by', refCode.trim());
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem('pakino_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('pakino_wallet_tx', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('pakino_requests', JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem('pakino_charity_projects', JSON.stringify(charityProjects));
  }, [charityProjects]);

  useEffect(() => {
    localStorage.setItem('pakino_hero_slides', JSON.stringify(heroSlides));
  }, [heroSlides]);

  useEffect(() => {
    localStorage.setItem('pakino_waste_categories', JSON.stringify(wasteCategories));
  }, [wasteCategories]);

  useEffect(() => {
    localStorage.setItem('pakino_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('pakino_users_list', JSON.stringify(usersList));
  }, [usersList]);

  // Handlers
  const handleCityChange = (newCity: CityId) => {
    setCurrentCity(newCity);
    setUser((u) => ({ ...u, cityId: newCity }));
  };

  const handleLoginSuccess = (userData: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = {
        ...prev,
        ...userData,
        isRegistered: true
      };
      logAppEvent({
        eventType: 'user_logged_in',
        actorId: updated.id,
        actorRole: 'citizen',
        actorName: `${updated.firstName} ${updated.lastName}`.trim(),
        entityId: updated.id,
        entityType: 'user',
        cityId: updated.cityId || currentCity,
        cityName: CITIES[updated.cityId || currentCity]?.name,
        details: { phone: updated.phone }
      });
      return updated;
    });
  };

  const handleLogout = () => {
    logAppEvent({
      eventType: 'user_logged_out',
      actorId: user.id,
      actorRole: 'citizen',
      actorName: `${user.firstName} ${user.lastName}`.trim(),
      entityId: user.id,
      entityType: 'user',
      cityId: currentCity,
      cityName: CITIES[currentCity]?.name,
      details: { phone: user.phone }
    });

    setUser({
      id: 'guest',
      phone: '',
      firstName: '',
      lastName: '',
      cityId: currentCity,
      walletBalanceTomans: 0,
      totalKgRecycled: 0,
      totalDonatedKg: 0,
      totalEarnedTomans: 0,
      lotteryPoints: 0,
      isRegistered: false
    });
  };

  const handleCreateRequest = (newRequest: PickupRequest) => {
    const now = new Date().toISOString();
    const initialLog: RequestStatusLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: 'pending',
      statusTitle: 'ثبت نوبت توسط شهروند',
      timestamp: now,
      changedByRole: 'citizen',
      changedByName: newRequest.userName,
      note: 'درخواست در سامانه ثبت شد و در صف پذیرش قرار گرفت'
    };
    const reqWithHistory: PickupRequest = {
      ...newRequest,
      statusHistory: [initialLog]
    };
    setRequests((prev) => [reqWithHistory, ...prev]);

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'request_created',
      actorId: newRequest.userId,
      actorRole: 'citizen',
      actorName: newRequest.userName,
      entityId: newRequest.id,
      entityType: 'request',
      cityId: newRequest.cityId,
      cityName: newRequest.cityName,
      details: {
        trackingCode: newRequest.trackingCode,
        type: newRequest.type,
        charityName: newRequest.charityName,
        estimatedKg: newRequest.estimatedKg,
        categories: newRequest.categories,
        timeSlot: newRequest.timeSlot,
        dateStr: newRequest.dateStr,
        payoutMethod: newRequest.payoutMethod,
        address: newRequest.address?.street
      }
    });

    setUser((prev) => ({
      ...prev,
      lotteryPoints: prev.lotteryPoints + (newRequest.type === 'charity' ? 40 : 20),
      totalKgRecycled: prev.totalKgRecycled + newRequest.estimatedKg,
      totalDonatedKg: prev.totalDonatedKg + (newRequest.type === 'charity' ? newRequest.estimatedKg : 0)
    }));

    // Process Referral Bonus (+50 points to referrer on new user's first request)
    try {
      const referrerPhone = localStorage.getItem('pakino_referred_by');
      const isAlreadyRewarded = localStorage.getItem('pakino_ref_rewarded');

      if (referrerPhone && !isAlreadyRewarded && referrerPhone !== newRequest.userPhone) {
        localStorage.setItem('pakino_ref_rewarded', 'true');

        // 1. Award 50 bonus points to referrer in users list
        setUsersList((prevList) =>
          prevList.map((u) =>
            u.phone === referrerPhone ? { ...u, lotteryPoints: (u.lotteryPoints || 0) + 50 } : u
          )
        );

        // 2. If current user is referrer
        if (user.phone === referrerPhone) {
          setUser((prev) => ({
            ...prev,
            lotteryPoints: (prev.lotteryPoints || 0) + 50
          }));
        }

        // 3. Log event
        logAppEvent({
          eventType: 'lottery_event_entered',
          actorId: newRequest.userId,
          actorRole: 'citizen',
          actorName: newRequest.userName,
          entityId: newRequest.id,
          entityType: 'lottery',
          cityId: newRequest.cityId,
          cityName: newRequest.cityName,
          details: {
            note: `اهدای ۵۰ امتیاز هدیه معرفی به کاربر ${referrerPhone} بابت ثبت اولین درخواست شهروند جدید (${newRequest.userName})`,
            referrerPhone
          }
        });
      }
    } catch {}
  };

  const handleCancelRequest = (
    requestId: string,
    reason?: string,
    cancelledByRole: 'citizen' | 'driver' | 'admin' = 'citizen',
    cancelledByName?: string
  ) => {
    const targetReq = requests.find((r) => r.id === requestId);
    const now = new Date().toISOString();
    const resolvedActorName = cancelledByName || (cancelledByRole === 'citizen' ? (targetReq?.userName || `${user.firstName} ${user.lastName}`) : cancelledByRole === 'driver' ? (targetReq?.driverName || 'سفیر علی رضایی') : 'مدیریت سامانه');
    const resolvedReason = reason?.trim() || (cancelledByRole === 'citizen' ? 'لغو توسط شهروند' : cancelledByRole === 'driver' ? 'انصراف سفیر راننده از پذیرش نوبت' : 'لغو توسط مدیریت');

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: cancelledByRole === 'citizen' ? 'request_cancelled_citizen' : cancelledByRole === 'driver' ? 'request_cancelled_driver' : 'request_cancelled_admin',
      actorId: cancelledByRole === 'citizen' ? (targetReq?.userId || user.id) : (cancelledByRole === 'driver' ? (targetReq?.driverId || 'drv-101') : 'admin-01'),
      actorRole: cancelledByRole,
      actorName: resolvedActorName,
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        trackingCode: targetReq?.trackingCode,
        citizenName: targetReq?.userName,
        driverName: targetReq?.driverName,
        reason: resolvedReason,
        previousStatus: targetReq?.status
      }
    });

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const cancelInfo: CancellationInfo = {
          cancelledBy: cancelledByRole,
          cancelledById: cancelledByRole === 'citizen' ? r.userId : cancelledByRole === 'driver' ? (r.driverId || 'drv-101') : 'admin-01',
          cancelledByName: resolvedActorName,
          cancelledAt: now,
          reason: resolvedReason,
          previousDriverId: r.driverId,
          previousDriverName: r.driverName,
          citizenId: r.userId,
          citizenName: r.userName,
          citizenPhone: r.userPhone
        };
        const statusLog: RequestStatusLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'cancelled',
          statusTitle: `لغو نوبت توسط ${cancelInfo.cancelledByName}`,
          timestamp: now,
          changedByRole: cancelledByRole,
          changedByName: cancelInfo.cancelledByName,
          note: cancelInfo.reason
        };
        return {
          ...r,
          status: 'cancelled',
          cancellationDetails: cancelInfo,
          cancellationHistory: [...(r.cancellationHistory || []), cancelInfo],
          statusHistory: [...(r.statusHistory || []), statusLog]
        };
      })
    );
  };

  // Driver Assignment Cancellation (انصراف سفیر و بازگشت به صف پذیرش - Item 5)
  const handleDriverCancelAssignment = (requestId: string, reason?: string, driverName: string = 'سفیر علی رضایی') => {
    const targetReq = requests.find((r) => r.id === requestId);
    const now = new Date().toISOString();
    const resolvedReason = reason?.trim() || 'انصراف سفیر راننده از پذیرش نوبت (بازگشت به صف انتظار)';

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'request_cancelled_driver',
      actorId: targetReq?.driverId || 'drv-101',
      actorRole: 'driver',
      actorName: driverName,
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        trackingCode: targetReq?.trackingCode,
        citizenName: targetReq?.userName,
        citizenPhone: targetReq?.userPhone,
        reason: resolvedReason,
        returnedToQueue: true
      }
    });

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const cancelInfo: CancellationInfo = {
          cancelledBy: 'driver',
          cancelledById: r.driverId || 'drv-101',
          cancelledByName: driverName || r.driverName || 'سفیر علی رضایی',
          cancelledAt: now,
          reason: resolvedReason,
          previousDriverId: r.driverId || 'drv-101',
          previousDriverName: driverName || r.driverName || 'سفیر علی رضایی',
          citizenId: r.userId,
          citizenName: r.userName,
          citizenPhone: r.userPhone
        };
        const statusLog: RequestStatusLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'pending',
          statusTitle: `انصراف سفیر (${cancelInfo.cancelledByName}) و بازگشت نوبت به صف`,
          timestamp: now,
          changedByRole: 'driver',
          changedByName: cancelInfo.cancelledByName,
          note: cancelInfo.reason
        };
        return {
          ...r,
          status: 'pending',
          driverId: undefined,
          driverName: undefined,
          driverPhone: undefined,
          vehicleModel: undefined,
          vehiclePlate: undefined,
          cancellationDetails: cancelInfo,
          cancellationHistory: [...(r.cancellationHistory || []), cancelInfo],
          statusHistory: [...(r.statusHistory || []), statusLog]
        };
      })
    );
  };

  // Driver Actions
  const handleDriverAccept = (requestId: string, driverName: string) => {
    const targetReq = requests.find((r) => r.id === requestId);
    const now = new Date().toISOString();

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'request_assigned',
      actorId: 'drv-101',
      actorRole: 'driver',
      actorName: driverName,
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        trackingCode: targetReq?.trackingCode,
        citizenName: targetReq?.userName,
        citizenPhone: targetReq?.userPhone,
        vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲'
      }
    });

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;
        const statusLog: RequestStatusLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'assigned',
          statusTitle: `پذیرش نوبت توسط ${driverName}`,
          timestamp: now,
          changedByRole: 'driver',
          changedByName: driverName,
          note: 'سفیر راننده سفارش را جهت تحویل و جمع‌آوری قبول کرد'
        };
        return {
          ...r,
          status: 'assigned',
          driverId: 'drv-101',
          driverName: driverName,
          driverPhone: '09171239988',
          vehicleModel: 'وانت پراید مسقف',
          vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
          statusHistory: [...(r.statusHistory || []), statusLog]
        };
      })
    );
  };

  const handleDriverBatchAccept = (requestIds: string[], driverName: string) => {
    const now = new Date().toISOString();

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'request_batch_assigned',
      actorId: 'drv-101',
      actorRole: 'driver',
      actorName: driverName,
      entityId: requestIds.join(','),
      entityType: 'request',
      cityId: currentCity,
      cityName: CITIES[currentCity]?.name,
      details: {
        batchCount: requestIds.length,
        requestIds
      }
    });

    setRequests((prev) =>
      prev.map((r) => {
        if (!requestIds.includes(r.id)) return r;
        const statusLog: RequestStatusLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'assigned',
          statusTitle: `پذیرش نوبت توسط ${driverName}`,
          timestamp: now,
          changedByRole: 'driver',
          changedByName: driverName,
          note: 'سفیر راننده سفارش را به صورت گروهی قبول کرد'
        };
        return {
          ...r,
          status: 'assigned',
          driverId: 'drv-101',
          driverName: driverName,
          driverPhone: '09171239988',
          vehicleModel: 'وانت پراید مسقف',
          vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲',
          statusHistory: [...(r.statusHistory || []), statusLog]
        };
      })
    );
  };

  const handleDriverComplete = (
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
  ) => {
    const targetReq = requests.find((r) => r.id === requestId);
    const now = new Date().toISOString();
    const isConverted = !!charityConversion?.converted;
    const finalType = isConverted ? 'charity' : (targetReq?.type || 'cash');
    const finalCharityName = isConverted ? charityConversion.charityName : targetReq?.charityName;
    const finalPaid = isConverted ? 0 : cashPaid;

    // Record Event: Charity Conversion (if applicable)
    if (isConverted) {
      logAppEvent({
        eventType: 'request_type_converted_to_charity',
        actorId: targetReq?.driverId || 'drv-101',
        actorRole: 'driver',
        actorName: targetReq?.driverName || 'سفیر علی رضایی',
        entityId: requestId,
        entityType: 'request',
        cityId: targetReq?.cityId || currentCity,
        cityName: targetReq?.cityName || CITIES[currentCity]?.name,
        details: {
          trackingCode: targetReq?.trackingCode,
          originalType: targetReq?.type,
          newType: 'charity',
          charityName: charityConversion.charityName,
          charityAmountTomans: charityConversion.charityAmountTomans,
          note: charityConversion.note
        }
      });
    }

    // Record Event: Weighed and Completed
    logAppEvent({
      eventType: 'request_weighed_and_completed',
      actorId: targetReq?.driverId || 'drv-101',
      actorRole: 'driver',
      actorName: targetReq?.driverName || 'سفیر علی رضایی',
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        trackingCode: targetReq?.trackingCode,
        actualKg: actualKg,
        type: finalType,
        charityName: finalCharityName,
        paymentModeUsed: paymentMode,
        cashPaidTomans: finalPaid,
        cardTransferRefCode: cardTransferRefCode,
        ratingToCitizen: ratingToCitizen,
        driverNote: note,
        weighedItemsCount: weighedItems?.length || 0,
        weighedItemsSummary: weighedItems?.map(w => `${w.categoryName}: ${w.weightKg}kg`).join(' | ')
      }
    });

    // Record Event: Weight and Payout Recorded (Item 8)
    logAppEvent({
      eventType: 'weight_and_payout_recorded',
      actorId: targetReq?.driverId || 'drv-101',
      actorRole: 'driver',
      actorName: targetReq?.driverName || 'سفیر علی رضایی',
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        actualKg: actualKg,
        directCardAmountTomans: paymentMode === 'direct_card' ? finalPaid : 0,
        cashAmountTomans: paymentMode === 'cash' ? finalPaid : 0,
        charityAmountTomans: isConverted ? (charityConversion.charityAmountTomans || 0) : finalType === 'charity' ? (targetReq?.approximatePayoutTomans || 0) : 0,
        charityName: finalCharityName,
        weighedItems
      }
    });

    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== requestId) return r;

        const statusLog: RequestStatusLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          status: 'collected',
          statusTitle: isConverted ? 'توزین، تسویه و تبدیل به نیکوکاری' : 'توزین و تسویه نهایی',
          timestamp: now,
          changedByRole: 'driver',
          changedByName: r.driverName || 'سفیر علی رضایی',
          note: isConverted 
            ? `تبدیل نوبت به نیکوکاری (${finalCharityName}) - وزن: ${actualKg} کیلوگرم` 
            : `تکمیل تحویل و تسویه ${paymentMode === 'direct_card' ? 'کارت‌به‌کارت' : 'نقدی'} - وزن: ${actualKg} کیلوگرم (${weighedItems?.map(w => `${w.categoryName}: ${w.weightKg}kg`).join(', ') || ''})`
        };

        return {
          ...r,
          status: 'collected',
          actualKg: actualKg,
          type: finalType,
          charityName: finalCharityName,
          cashPaidTomans: finalPaid,
          paymentModeUsed: paymentMode,
          driverNote: note,
          driverRatingToCitizen: ratingToCitizen,
          collectedAt: now,
          convertedToCharityMidway: isConverted,
          convertedToCharityAt: isConverted ? now : undefined,
          convertedToCharityNote: isConverted ? charityConversion.note : undefined,
          convertedToCharityCharityName: isConverted ? finalCharityName : undefined,
          cardTransferRefCode: cardTransferRefCode,
          weighedItems: weighedItems,
          statusHistory: [...(r.statusHistory || []), statusLog]
        };
      })
    );

    // If driver rated citizen, update citizen account rating & status warnings
    if (ratingToCitizen !== undefined) {
      setUser((prev) => {
        const count = (prev.ratingCount || 0) + 1;
        const currentScore = prev.rating || 5;
        const newScore = Number(((currentScore * (count - 1) + ratingToCitizen) / count).toFixed(1));
        let newStatus = prev.status || 'active';
        let newWarningCount = prev.warningCount || 0;
        let newStatusMsg = prev.statusMessage || '';

        if (ratingToCitizen <= 2) {
          newWarningCount += 1;
          if (newWarningCount >= 3) {
            newStatus = 'suspended';
            newStatusMsg = 'حساب کاربری شما به دلیل دریافت ۳ اخطار تفکیک نامناسب یا غیبت در محل به حالت تعلیق درآمد.';
          } else {
            newStatus = 'warning';
            newStatusMsg = `اخطار تفکیک: سفیر پاکینو به این تحویل امتیاز ${toPersianDigits(ratingToCitizen)} داده است. لطفاً در تفکیک صحیح پسماند دقت نمایید.`;
          }
        }

        return {
          ...prev,
          rating: newScore,
          ratingCount: count,
          status: newStatus,
          warningCount: newWarningCount,
          statusMessage: newStatusMsg
        };
      });

      // Update in usersList for Admin Dossier
      if (targetReq) {
        setUsersList((prevList) =>
          prevList.map((u) => {
            if (u.phone === targetReq.userPhone || u.id === targetReq.userId) {
              const count = (u.ratingCount || 0) + 1;
              const currentScore = u.rating || 5;
              const newScore = Number(((currentScore * (count - 1) + ratingToCitizen) / count).toFixed(1));
              let newStatus = u.status || 'active';
              let newWarningCount = u.warningCount || 0;
              let newStatusMsg = u.statusMessage || '';

              if (ratingToCitizen <= 2) {
                newWarningCount += 1;
                if (newWarningCount >= 3) {
                  newStatus = 'suspended';
                  newStatusMsg = 'تعلیق خودکار حساب به دلیل دریافت ۳ اخطار پسماند نامناسب.';
                } else {
                  newStatus = 'warning';
                  newStatusMsg = `ثبت اخطار توسط سفیر (امتیاز ${toPersianDigits(ratingToCitizen)}).`;
                }
              }

              return {
                ...u,
                rating: newScore,
                ratingCount: count,
                status: newStatus,
                warningCount: newWarningCount,
                statusMessage: newStatusMsg
              };
            }
            return u;
          })
        );
      }
    }

    // If wallet payout mode, credit user's wallet!
    if (cashPaid > 0 && targetReq && paymentMode !== 'direct_card') {
      setUser((prev) => ({
        ...prev,
        walletBalanceTomans: prev.walletBalanceTomans + cashPaid,
        totalEarnedTomans: prev.totalEarnedTomans + cashPaid,
        totalKgRecycled: prev.totalKgRecycled + actualKg
      }));

      const newTx: WalletTransaction = {
        id: `tx-${Date.now()}`,
        type: 'credit',
        title: `واریز وجه بازیافت (#${targetReq.id})`,
        amountTomans: cashPaid,
        dateStr: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
        createdAt: new Date().toISOString(),
        status: 'completed',
        referenceId: targetReq.trackingCode,
        description: `تحویل ${toPersianDigits(actualKg)} کیلوگرم پسماند خشک در ${targetReq.cityName}`
      };

      setTransactions((prev) => [newTx, ...prev]);
    }
  };

  const handleDriverFlagIssue = (
    requestId: string,
    issueFlag: 'citizen_absent' | 'waste_unprepared' | 'wrong_address',
    note: string
  ) => {
    const targetReq = requests.find((r) => r.id === requestId);

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'driver_issue_flagged',
      actorId: targetReq?.driverId || 'drv-101',
      actorRole: 'driver',
      actorName: targetReq?.driverName || 'سفیر پاکینو',
      entityId: requestId,
      entityType: 'request',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        trackingCode: targetReq?.trackingCode,
        issueFlag,
        note
      }
    });

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              issueFlag: issueFlag,
              issueNotes: note
            }
          : r
      )
    );
    alert('گزارش عدم تحویل با موفقیت در سامانه و پنل مدیریت ثبت گردید.');
  };

  const handleSubmitDriverRating = (feedback: any) => {
    const starRating = feedback.rating || 5;
    const targetReq = requests.find((r) => r.id === feedback.requestId);

    // Record Event in Comprehensive Audit Log (Item 8)
    logAppEvent({
      eventType: 'driver_rated_by_citizen',
      actorId: user.id,
      actorRole: 'citizen',
      actorName: `${user.firstName} ${user.lastName}`.trim(),
      entityId: targetReq?.driverId || 'drv-101',
      entityType: 'driver',
      cityId: targetReq?.cityId || currentCity,
      cityName: targetReq?.cityName || CITIES[currentCity]?.name,
      details: {
        requestId: feedback.requestId,
        driverName: targetReq?.driverName,
        rating: starRating,
        comment: feedback.comment || ''
      }
    });

    setRequests((prev) =>
      prev.map((r) =>
        r.id === feedback.requestId
          ? {
              ...r,
              rating: starRating,
              citizenRatingToDriver: starRating
            }
          : r
      )
    );

    // Update driver in drivers list
    setDrivers((prevDrivers) =>
      prevDrivers.map((d) => {
        if (targetReq && (d.name === targetReq.driverName || d.phone === targetReq.driverPhone)) {
          const count = (d.ratingCount || 0) + 1;
          const currentScore = d.rating || 5;
          const newScore = Number(((currentScore * (count - 1) + starRating) / count).toFixed(1));
          let newStatus = d.status || 'active';
          let newWarningCount = d.warningCount || 0;
          let newStatusMsg = d.statusMessage || '';

          if (starRating <= 2) {
            newWarningCount += 1;
            if (newWarningCount >= 3) {
              newStatus = 'suspended';
              newStatusMsg = 'تعلیق حساب کاربری سفیر به دلیل دریافت ۳ گزارش منفی یا نارضایتی شهروندان.';
            } else {
              newStatus = 'warning';
              newStatusMsg = `ثبت اخطار انضباطی به دلیل نارضایتی شهروند (امتیاز ${toPersianDigits(starRating)}).`;
            }
          }

          return {
            ...d,
            rating: newScore,
            ratingCount: count,
            status: newStatus,
            warningCount: newWarningCount,
            statusMessage: newStatusMsg
          };
        }
        return d;
      })
    );

    alert('نظر و امتیاز شما برای سفیر پاکینو با موفقیت ثبت شد. متشکریم!');
  };

  // User Withdrawal from Wallet Handler
  const handleWithdraw = (req: WithdrawalRequest): boolean => {
    if (user.walletBalanceTomans < req.amountTomans) return false;

    // Deduct balance and update user
    setUser((prev) => ({
      ...prev,
      walletBalanceTomans: Math.max(0, prev.walletBalanceTomans - req.amountTomans),
      savedCardNumber: req.cardNumberOrSheba.includes('****') ? prev.savedCardNumber : req.cardNumberOrSheba,
      savedAccountHolder: req.accountHolder
    }));

    // Record Debit Transaction
    const debitTx: WalletTransaction = {
      id: `tx-wth-${Date.now()}`,
      type: 'debit',
      title: `برداشت وجه به ${req.bankName}`,
      amountTomans: req.amountTomans,
      dateStr: req.dateStr,
      createdAt: req.createdAt,
      status: 'completed',
      referenceId: req.trackingNumber,
      description: `انتقال پایا به حساب ${req.accountHolder} (${req.cardNumberOrSheba})`
    };

    setTransactions((prev) => [debitTx, ...prev]);
    return true;
  };

  const handleGoHome = () => {
    if (userRole === 'admin') {
      setUserRole('admin');
    } else if (userRole === 'driver') {
      setUserRole('driver');
    } else {
      setUserRole('citizen');
      setActiveCitizenTab('home');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white pb-20 sm:pb-8 overflow-x-hidden w-full max-w-full">
      {/* PWA Install Prompt Banner */}
      <PWAInstallPrompt />

      {/* Top Application Header */}
      <Header
        currentCity={currentCity}
        onCityChange={handleCityChange}
        userRole={userRole}
        onRoleChange={setUserRole}
        user={user}
        onGoHome={handleGoHome}
        onOpenAuth={handleOpenAuth}
        onOpenShare={handleOpenShare}
        onOpenLottery={() => {
          handleSelectCitizenTab('lottery');
          setUserRole('citizen');
        }}
        onOpenFeedback={handleOpenFeedback}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 overflow-x-hidden">
        {userRole === 'admin' ? (
          /* Admin View (پنل مدیریت و پایش هوشمند) */
          <ErrorBoundary fallbackTitle="خطا در بارگذاری پنل مدیریت">
            <AdminPanel
              currentCity={currentCity}
              requests={requests}
              drivers={drivers}
              users={usersList}
              scheduledLotteries={scheduledLotteries}
              liveEventLottery={liveEventLottery}
              winnersList={winnersList}
              charityProjects={charityProjects}
              heroSlides={heroSlides}
              onUpdateDrivers={(newDrivers) => {
                setDrivers(newDrivers);
                localStorage.setItem('pakino_drivers', JSON.stringify(newDrivers));
              }}
              onUpdateUsers={(newUsers) => {
                setUsersList(newUsers);
                localStorage.setItem('pakino_users_list', JSON.stringify(newUsers));
              }}
              onUpdateScheduledLotteries={(newLotteries) => {
                setScheduledLotteries(newLotteries);
                localStorage.setItem('pakino_scheduled_lotteries', JSON.stringify(newLotteries));
              }}
              onUpdateLiveEventLottery={(newEvent) => {
                setLiveEventLottery(newEvent);
                localStorage.setItem('pakino_live_event_lottery', JSON.stringify(newEvent));
              }}
              onUpdateWinnersList={(newWinners) => {
                setWinnersList(newWinners);
                localStorage.setItem('pakino_winners_list', JSON.stringify(newWinners));
              }}
              onUpdateCharityProjects={(newProjects) => {
                setCharityProjects(newProjects);
                localStorage.setItem('pakino_charity_projects', JSON.stringify(newProjects));
              }}
              onUpdateHeroSlides={(newSlides) => {
                setHeroSlides(newSlides);
                localStorage.setItem('pakino_hero_slides', JSON.stringify(newSlides));
                logAppEvent({
                  eventType: 'hero_slides_updated',
                  actorId: 'admin-01',
                  actorRole: 'admin',
                  actorName: 'مدیریت ارشد پاکینو',
                  entityId: 'hero-slides',
                  entityType: 'hero_slide',
                  cityId: currentCity,
                  cityName: CITIES[currentCity]?.name,
                  details: { slidesCount: newSlides.length }
                });
              }}
              wasteCategories={wasteCategories}
              onUpdateWasteCategories={(newCats) => {
                setWasteCategories(newCats);
                localStorage.setItem('pakino_waste_categories', JSON.stringify(newCats));
                logAppEvent({
                  eventType: 'waste_tariffs_updated',
                  actorId: 'admin-01',
                  actorRole: 'admin',
                  actorName: 'مدیریت ارشد پاکینو',
                  entityId: 'tariffs',
                  entityType: 'tariff',
                  cityId: currentCity,
                  cityName: CITIES[currentCity]?.name,
                  details: { categoriesCount: newCats.length }
                });
              }}
              onAnnounceResetTickets={handleAnnounceResetTickets}
            />
          </ErrorBoundary>
        ) : userRole === 'driver' ? (
          /* Driver View (راننده پاکیار) */
          <DriverPanel
            currentCity={currentCity}
            requests={requests}
            drivers={drivers}
            charityProjects={charityProjects}
            wasteCategories={wasteCategories}
            onAcceptRequest={handleDriverAccept}
            onAcceptBatchRequests={handleDriverBatchAccept}
            onCancelAssignment={handleDriverCancelAssignment}
            onCompletePickup={handleDriverComplete}
            onFlagIssue={handleDriverFlagIssue}
          />
        ) : (
          /* Citizen View (شهروند) */
          <div>
            {activeCitizenTab === 'home' && (
              <CitizenHome
                currentCity={currentCity}
                onSelectCity={handleCityChange}
                user={user}
                requests={requests}
                charityProjects={charityProjects}
                heroSlides={heroSlides}
                wasteCategories={wasteCategories}
                onOpenNewPickup={handleOpenNewPickup}
                onOpenHistory={() => handleSelectCitizenTab('history')}
                onOpenFeedback={handleOpenFeedback}
                onOpenShare={handleOpenShare}
                onOpenLottery={() => handleSelectCitizenTab('lottery')}
                onSelectCharityProject={(_projectId) => {
                  handleOpenNewPickup();
                }}
              />
            )}

            {activeCitizenTab === 'history' && (
              <HistoryView
                requests={requests}
                onOpenNewPickup={handleOpenNewPickup}
                onCancelRequest={handleCancelRequest}
                onOpenRatingModal={handleOpenRatingModal}
                currentCity={currentCity}
              />
            )}

            {activeCitizenTab === 'lottery' && (
              <LotterySection
                currentCity={currentCity}
                user={user}
                requests={requests}
                onOpenNewPickup={handleOpenNewPickup}
                scheduledLottery={scheduledLotteries.find((l) => l.status === 'upcoming' || l.status === 'in_progress') || scheduledLotteries[0]}
                liveEventLottery={liveEventLottery}
                winnersList={winnersList}
                ticketResetAnnouncement={ticketResetAnnouncement}
                onRegisterEventCode={(_code) => {
                  const phone = user.phone || '09171234567';
                  const exists = (liveEventLottery.registeredPhoneNumbers || []).includes(phone);
                  const updatedNumbers = exists
                    ? (liveEventLottery.registeredPhoneNumbers || [])
                    : [...(liveEventLottery.registeredPhoneNumbers || []), phone];
                  const updated: LiveEventLottery = {
                    ...liveEventLottery,
                    participantsCount: Math.max(updatedNumbers.length, (liveEventLottery.participantsCount || 0) + (exists ? 0 : 1)),
                    registeredPhoneNumbers: updatedNumbers
                  };
                  setLiveEventLottery(updated);
                  localStorage.setItem('pakino_live_event_lottery', JSON.stringify(updated));

                  logAppEvent({
                    eventType: 'lottery_event_entered',
                    actorId: user.id,
                    actorRole: 'citizen',
                    actorName: `${user.firstName} ${user.lastName}`.trim() || 'شهروند پاکینو',
                    entityId: liveEventLottery.id,
                    entityType: 'lottery',
                    cityId: currentCity,
                    cityName: CITIES[currentCity]?.name,
                    details: {
                      eventCode: _code,
                      eventTitle: liveEventLottery.eventTitle,
                      phoneMasked: phone
                    }
                  });

                  return true;
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Item 1: حذف کیف پول و تقارن ناوبری) */}
      {userRole === 'citizen' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={() => handleSelectCitizenTab('home')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'home'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="text-[10px] font-bold">خانه</span>
            </button>

            <button
              onClick={() => handleSelectCitizenTab('history')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'history'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold">سوابق</span>
            </button>

            {/* Middle Quick Action Floating Button */}
            <button
              onClick={handleOpenNewPickup}
              className="w-12 h-12 -mt-5 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
              title="ثبت درخواست جدید"
            >
              <Plus className="w-6 h-6 stroke-[3]" />
            </button>

            <button
              onClick={() => handleSelectCitizenTab('lottery')}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'lottery'
                  ? 'text-amber-600 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Gift className="w-5 h-5" />
              <span className="text-[10px] font-bold">قرعه‌کشی</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button on Desktop */}
      {userRole === 'citizen' && activeCitizenTab !== 'home' && (
        <button
          onClick={handleOpenNewPickup}
          className="hidden sm:flex fixed bottom-8 left-8 z-30 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 items-center gap-2 transition transform hover:-translate-y-1 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>ثبت درخواست بازیافت جدید</span>
        </button>
      )}

      {/* Modals with History API Support */}
      <NewPickupModal
        isOpen={isNewPickupOpen}
        onClose={handleCloseNewPickup}
        currentCity={currentCity}
        user={user}
        existingRequests={requests}
        charityProjects={charityProjects}
        wasteCategories={wasteCategories}
        onRequestCreated={handleCreateRequest}
        onOpenHistory={() => {
          handleCloseNewPickup();
          handleSelectCitizenTab('history');
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={handleCloseAuth}
        onLoginSuccess={handleLoginSuccess}
        currentCity={currentCity}
        usersList={usersList}
        onRegisterUser={(newUser) => {
          const updated = [newUser, ...usersList];
          setUsersList(updated);
          localStorage.setItem('pakino_users_list', JSON.stringify(updated));

          logAppEvent({
            eventType: 'user_registered',
            actorId: newUser.id,
            actorRole: 'citizen',
            actorName: `${newUser.firstName} ${newUser.lastName}`.trim(),
            entityId: newUser.id,
            entityType: 'user',
            cityId: newUser.cityId || currentCity,
            cityName: CITIES[newUser.cityId || currentCity]?.name,
            details: {
              phone: newUser.phone
            }
          });
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={handleCloseFeedback}
        currentCity={currentCity}
        userName={`${user.firstName} ${user.lastName}`.trim()}
        userPhone={user.phone}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={handleCloseShare}
        currentCity={currentCity}
        user={user}
      />

      <DriverRatingModal
        isOpen={!!ratingModalRequest}
        onClose={handleCloseRatingModal}
        request={ratingModalRequest}
        onSubmitRating={(reqId, rating, comment, isAnon) => handleSubmitDriverRating({ requestId: reqId, rating, comment, isAnonymous: isAnon })}
      />
    </div>
  );
}

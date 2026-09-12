/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
  Wallet,
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
  WasteCategory
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
import { WalletModal } from './components/WalletModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { DriverRatingModal } from './components/DriverRatingModal';

import { getUpcomingDays } from './utils/persian';

// Initial default dynamic demo requests based on current upcoming days
const generateInitialDemoRequests = (): PickupRequest[] => {
  const days = getUpcomingDays();
  const day0 = days[0] || { dayName: 'شنبه', dateStr: 'شنبه ۱۷ شهریور ۱۴۰۵' };
  const day1 = days[1] || { dayName: 'یکشنبه', dateStr: 'یکشنبه ۱۸ شهریور ۱۴۰۵' };
  const day2 = days[2] || { dayName: 'دوشنبه', dateStr: 'دوشنبه ۱۹ شهریور ۱۴۰۵' };

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
      payoutMethod: 'wallet',
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
      payoutMethod: 'wallet',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
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
      id: '1020',
      trackingCode: 'PK-1020',
      userId: 'user-2',
      userName: 'رضا کازرونی',
      userPhone: '09179876543',
      cityId: 'kazeroon',
      cityName: 'کازرون',
      type: 'cash',
      payoutMethod: 'wallet',
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
      payoutMethod: 'wallet',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
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
      payoutMethod: 'wallet',
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
      vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲'
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

  // Modals visibility
  const [isNewPickupOpen, setIsNewPickupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [ratingModalRequest, setRatingModalRequest] = useState<PickupRequest | null>(null);

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
    setUser((prev) => ({
      ...prev,
      ...userData,
      isRegistered: true
    }));
  };

  const handleLogout = () => {
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
    setRequests((prev) => [newRequest, ...prev]);
    setUser((prev) => ({
      ...prev,
      lotteryPoints: prev.lotteryPoints + (newRequest.type === 'charity' ? 40 : 20),
      totalKgRecycled: prev.totalKgRecycled + newRequest.estimatedKg,
      totalDonatedKg: prev.totalDonatedKg + (newRequest.type === 'charity' ? newRequest.estimatedKg : 0)
    }));
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' } : r))
    );
  };

  // Driver Actions
  const handleDriverAccept = (requestId: string, driverName: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'assigned',
              driverName: driverName,
              driverPhone: '09171239988',
              vehicleModel: 'وانت پراید مسقف',
              vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲'
            }
          : r
      )
    );
  };

  const handleDriverBatchAccept = (requestIds: string[], driverName: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        requestIds.includes(r.id)
          ? {
              ...r,
              status: 'assigned',
              driverName: driverName,
              driverPhone: '09171239988',
              vehicleModel: 'وانت پراید مسقف',
              vehiclePlate: 'ایران ۷۳ - ۴۵۶ ج ۱۲'
            }
          : r
      )
    );
  };

  const handleDriverComplete = (
    requestId: string, 
    actualKg: number, 
    cashPaid: number, 
    note?: string, 
    paymentMode?: 'wallet' | 'direct_card',
    ratingToCitizen?: number,
    citizenFeedbackTags?: string[]
  ) => {
    const targetReq = requests.find((r) => r.id === requestId);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'collected',
              actualKg: actualKg,
              cashPaidTomans: cashPaid,
              driverNote: note,
              driverRatingToCitizen: ratingToCitizen,
              collectedAt: new Date().toISOString()
            }
          : r
      )
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
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenLottery={() => {
          setActiveCitizenTab('lottery');
          setUserRole('citizen');
        }}
        onOpenWallet={() => setIsWalletOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3 sm:px-4 py-3 sm:py-5 overflow-x-hidden">
        {userRole === 'admin' ? (
          /* Admin View (پنل مدیریت و پایش هوشمند) */
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
            }}
            wasteCategories={wasteCategories}
            onUpdateWasteCategories={(newCats) => {
              setWasteCategories(newCats);
              localStorage.setItem('pakino_waste_categories', JSON.stringify(newCats));
            }}
            onAnnounceResetTickets={handleAnnounceResetTickets}
          />
        ) : userRole === 'driver' ? (
          /* Driver View (راننده پاکیار) */
          <DriverPanel
            currentCity={currentCity}
            requests={requests}
            drivers={drivers}
            onAcceptRequest={handleDriverAccept}
            onAcceptBatchRequests={handleDriverBatchAccept}
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
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
                onOpenHistory={() => setActiveCitizenTab('history')}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                onOpenShare={() => setIsShareOpen(true)}
                onOpenLottery={() => setActiveCitizenTab('lottery')}
                onOpenWallet={() => setIsWalletOpen(true)}
                onSelectCharityProject={(projectId) => {
                  setIsNewPickupOpen(true);
                }}
              />
            )}

            {activeCitizenTab === 'history' && (
              <HistoryView
                requests={requests}
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
                onCancelRequest={handleCancelRequest}
                onOpenRatingModal={(req) => setRatingModalRequest(req)}
                currentCity={currentCity}
              />
            )}

            {activeCitizenTab === 'lottery' && (
              <LotterySection
                currentCity={currentCity}
                user={user}
                requests={requests}
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
                scheduledLottery={scheduledLotteries.find((l) => l.status === 'active') || scheduledLotteries[0]}
                liveEventLottery={liveEventLottery}
                winnersList={winnersList}
                ticketResetAnnouncement={ticketResetAnnouncement}
                onRegisterEventCode={(code) => {
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
                  return true;
                }}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      {userRole === 'citizen' && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 py-1.5 px-3 shadow-lg">
          <div className="flex items-center justify-around max-w-md mx-auto">
            <button
              onClick={() => setActiveCitizenTab('home')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'home'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Home className="w-4.5 h-4.5" />
              <span className="text-[10px]">خانه</span>
            </button>

            <button
              onClick={() => setActiveCitizenTab('history')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'history'
                  ? 'text-emerald-700 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4.5 h-4.5" />
              <span className="text-[10px]">سوابق</span>
            </button>

            {/* Middle Quick Action Floating Button */}
            <button
              onClick={() => setIsNewPickupOpen(true)}
              className="w-11 h-11 -mt-4 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 active:scale-95 transition cursor-pointer"
              title="ثبت درخواست جدید"
            >
              <Plus className="w-5 h-5 stroke-[3]" />
            </button>

            {/* Wallet on Mobile Bottom Nav */}
            <button
              onClick={() => setIsWalletOpen(true)}
              className="flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition cursor-pointer"
            >
              <Wallet className="w-4.5 h-4.5 text-emerald-600" />
              <span className="text-[10px] font-bold">کیف پول</span>
            </button>

            <button
              onClick={() => setActiveCitizenTab('lottery')}
              className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition cursor-pointer ${
                activeCitizenTab === 'lottery'
                  ? 'text-amber-600 font-black'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Gift className="w-4.5 h-4.5" />
              <span className="text-[10px]">قرعه‌کشی</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button on Desktop */}
      {userRole === 'citizen' && activeCitizenTab !== 'home' && (
        <button
          onClick={() => setIsNewPickupOpen(true)}
          className="hidden sm:flex fixed bottom-8 left-8 z-30 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-3.5 rounded-2xl shadow-xl shadow-emerald-600/30 items-center gap-2 transition transform hover:-translate-y-1 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          <span>ثبت درخواست بازیافت جدید</span>
        </button>
      )}

      {/* Modals */}
      <NewPickupModal
        isOpen={isNewPickupOpen}
        onClose={() => setIsNewPickupOpen(false)}
        currentCity={currentCity}
        user={user}
        existingRequests={requests}
        charityProjects={charityProjects}
        wasteCategories={wasteCategories}
        onRequestCreated={handleCreateRequest}
        onOpenHistory={() => {
          setActiveCitizenTab('history');
          setIsNewPickupOpen(false);
        }}
      />

      <WalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        user={user}
        transactions={transactions}
        onWithdraw={handleWithdraw}
        currentCity={currentCity}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentCity={currentCity}
        usersList={usersList}
        onRegisterUser={(newUser) => {
          const updated = [newUser, ...usersList];
          setUsersList(updated);
          localStorage.setItem('pakino_users_list', JSON.stringify(updated));
        }}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        currentCity={currentCity}
        userName={`${user.firstName} ${user.lastName}`.trim()}
        userPhone={user.phone}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        currentCity={currentCity}
        user={user}
      />

      <DriverRatingModal
        isOpen={!!ratingModalRequest}
        onClose={() => setRatingModalRequest(null)}
        request={ratingModalRequest}
        onSubmitFeedback={handleSubmitDriverRating}
      />
    </div>
  );
}

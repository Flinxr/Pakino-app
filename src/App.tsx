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
import { CityId, UserProfile, PickupRequest, WalletTransaction, WithdrawalRequest } from './types';
import { CITIES } from './data/cities';
import { toPersianDigits, formatTomans } from './utils/persian';
import { Header } from './components/Header';
import { CitizenHome } from './components/CitizenHome';
import { NewPickupModal } from './components/NewPickupModal';
import { HistoryView } from './components/HistoryView';
import { DriverPanel } from './components/DriverPanel';
import { AuthModal } from './components/AuthModal';
import { FeedbackModal } from './components/FeedbackModal';
import { ShareModal } from './components/ShareModal';
import { LotterySection } from './components/LotterySection';
import { WalletModal } from './components/WalletModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

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
        unit: '۲',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-A84920'
    },
    {
      id: '1022',
      trackingCode: 'PK-1022',
      userId: 'usr-103',
      userName: 'مریم احمدی',
      userPhone: '09173334455',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      payoutMethod: 'wallet',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 22,
      categories: ['cardboard', 'metal'],
      approximatePayoutTomans: 330000,
      address: {
        lat: 30.1192,
        lng: 51.5284,
        street: 'خیابان طالقانی، کوچه بهار، پلاک ۵',
        neighborhood: 'خیابان طالقانی',
        plaque: '۵',
        unit: '۱',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-C49201'
    },
    {
      id: '1023',
      trackingCode: 'PK-1023',
      userId: 'usr-104',
      userName: 'حسین لشکری',
      userPhone: '09175556677',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'cash',
      payoutMethod: 'wallet',
      dateStr: day0.dateStr,
      dayOfWeek: day0.dayName,
      timeSlot: '۹ تا ۱۲',
      timeSlotId: 'morning',
      estimatedKg: 18,
      categories: ['plastic', 'metal'],
      approximatePayoutTomans: 270000,
      address: {
        lat: 30.1125,
        lng: 51.5170,
        street: 'بلوار معلم، روبروی دانشگاه آزاد، کوچه لاله ۳',
        neighborhood: 'بلوار معلم',
        plaque: '۱۸',
        isInsideBoundary: true
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      lotteryTicketNumber: 'PK-D77102'
    },
    {
      id: '1024',
      trackingCode: 'PK-1024',
      userId: 'usr-105',
      userName: 'فاطمه انصاری',
      userPhone: '09176667788',
      cityId: 'noorabad',
      cityName: 'نورآباد ممسنی',
      type: 'charity',
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
      driverName: 'سفیر پاکیار ممسنی'
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
  // App City (Noorabad Mamasani or Kazeroon)
  const [currentCity, setCurrentCity] = useState<CityId>(() => {
    return (localStorage.getItem('pakino_city') as CityId) || 'noorabad';
  });

  // Mode: citizen vs driver
  const [userRole, setUserRole] = useState<'citizen' | 'driver'>('citizen');

  // Active Navigation Tab for Citizen Mode
  const [activeCitizenTab, setActiveCitizenTab] = useState<'home' | 'history' | 'lottery'>('home');

  // Modals visibility
  const [isNewPickupOpen, setIsNewPickupOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isWalletOpen, setIsWalletOpen] = useState(false);

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
              driverPhone: '09171112233'
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
              driverPhone: '09171112233'
            }
          : r
      )
    );
  };

  const handleDriverComplete = (requestId: string, actualKg: number, cashPaid: number) => {
    const targetReq = requests.find((r) => r.id === requestId);

    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'collected',
              actualKg: actualKg,
              cashPaidTomans: cashPaid,
              collectedAt: new Date().toISOString()
            }
          : r
      )
    );

    // If cash payout, credit user's wallet!
    if (cashPaid > 0 && targetReq) {
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
        {userRole === 'driver' ? (
          /* Driver View (راننده پاکیار) */
          <DriverPanel
            currentCity={currentCity}
            requests={requests}
            onAcceptRequest={handleDriverAccept}
            onAcceptBatchRequests={handleDriverBatchAccept}
            onCompletePickup={handleDriverComplete}
          />
        ) : (
          /* Citizen View (شهروند) */
          <div>
            {activeCitizenTab === 'home' && (
              <CitizenHome
                currentCity={currentCity}
                user={user}
                requests={requests}
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
                onOpenHistory={() => setActiveCitizenTab('history')}
                onOpenFeedback={() => setIsFeedbackOpen(true)}
                onOpenShare={() => setIsShareOpen(true)}
                onOpenLottery={() => setActiveCitizenTab('lottery')}
                onOpenWallet={() => setIsWalletOpen(true)}
              />
            )}

            {activeCitizenTab === 'history' && (
              <HistoryView
                requests={requests}
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
                onCancelRequest={handleCancelRequest}
                currentCity={currentCity}
              />
            )}

            {activeCitizenTab === 'lottery' && (
              <LotterySection
                currentCity={currentCity}
                user={user}
                requests={requests}
                onOpenNewPickup={() => setIsNewPickupOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Mobile Iranian Style Bottom Navigation Bar */}
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

      {/* Floating Action Button on Desktop (when on history or lottery view) */}
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
    </div>
  );
}

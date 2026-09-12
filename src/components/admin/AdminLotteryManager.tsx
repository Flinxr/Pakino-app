import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Sparkles, 
  Calendar, 
  Plus, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Gift, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award,
  Radio,
  Sliders,
  Send,
  Users,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  UserPlus
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  CityId, 
  PickupRequest, 
  LotteryWinner, 
  ScheduledLottery, 
  LotteryPrizeConfig,
  LiveEventLottery,
  UserProfile 
} from '../../types';
import { toPersianDigits, formatTomans } from '../../utils/persian';
import { CITIES } from '../../data/cities';

interface AdminLotteryManagerProps {
  currentCity: CityId;
  requests: PickupRequest[];
  users?: UserProfile[];
  scheduledLotteries: ScheduledLottery[];
  onUpdateScheduledLotteries: (lotteries: ScheduledLottery[]) => void;
  liveEventLottery: LiveEventLottery;
  onUpdateLiveEventLottery: (event: LiveEventLottery) => void;
  winnersList: LotteryWinner[];
  onAddWinner: (winner: LotteryWinner) => void;
  onResetPreviousTickets?: (periodCode: string, announcementText: string) => void;
}

export const AdminLotteryManager: React.FC<AdminLotteryManagerProps> = ({
  currentCity,
  requests = [],
  users = [],
  scheduledLotteries = [],
  onUpdateScheduledLotteries,
  liveEventLottery,
  onUpdateLiveEventLottery,
  winnersList = [],
  onAddWinner,
  onResetPreviousTickets
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scheduled' | 'live_event' | 'draw_wheel' | 'winners'>('scheduled');

  // New / Edit Scheduled Lottery Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLottery, setEditingLottery] = useState<ScheduledLottery | null>(null);

  // Reset confirmation modal state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [resetAnnouncementText, setResetAnnouncementText] = useState('تمامی کدهای شانس مربوط به دوره قبلی بایگانی شدند و شانس‌های جدید برای دوره آینده ثبت می‌شوند.');

  // Live Draw Wheel State
  const [drawMode, setDrawMode] = useState<'scheduled_tickets' | 'live_event'>('scheduled_tickets');
  const [isDrawing, setIsDrawing] = useState(false);
  const [shufflingParticipantText, setShufflingParticipantText] = useState<string>('');
  const [selectedLotteryForDraw, setSelectedLotteryForDraw] = useState<string>(scheduledLotteries?.[0]?.id || '');
  const [selectedPrizeTier, setSelectedPrizeTier] = useState<string>('first');
  const [liveEventSelectedPrize, setLiveEventSelectedPrize] = useState<string>(
    liveEventLottery?.prizesList?.[0] || liveEventLottery?.prizeSummary || '۵ عدد نیم سکه بهار آزادی'
  );
  const [recentWinner, setRecentWinner] = useState<LotteryWinner | null>(null);

  // Quick on-site attendee registration form state
  const [onSiteAttendeePhone, setOnSiteAttendeePhone] = useState('');
  const [onSiteAttendeeName, setOnSiteAttendeeName] = useState('');
  const [onSiteAttendeeNotice, setOnSiteAttendeeNotice] = useState(false);

  // Form State for creating/editing scheduled lottery
  const [formTitle, setFormTitle] = useState('');
  const [formPeriodCode, setFormPeriodCode] = useState('');
  const [formDateStr, setFormDateStr] = useState('');
  const [formCountdownDays, setFormCountdownDays] = useState(30);
  const [formPrizes, setFormPrizes] = useState<LotteryPrizeConfig[]>([
    { id: 'p1', rankTitle: 'جایزه نفر اول', tier: 'first', prizeName: 'ربع سکه بهار آزادی + گوشی هوشمند', winnersCount: 1, iconEmoji: '🥇' },
    { id: 'p2', rankTitle: 'جوایز نفرات دوم', tier: 'second', prizeName: '۳ کارت هدیه ۵ میلیون تومانی', winnersCount: 3, iconEmoji: '🥈' },
    { id: 'p3', rankTitle: 'جوایز نفرات سوم', tier: 'third', prizeName: '۱۰ دستگاه خردکن برقی تفال', winnersCount: 10, iconEmoji: '🥉' },
    { id: 'p4', rankTitle: 'جوایز عمومی', tier: 'general', prizeName: '۵۰ پکیج تفکیک پسماند خانگی', winnersCount: 50, iconEmoji: '🎁' }
  ]);

  // Live Event Form State
  const [liveEventTitle, setLiveEventTitle] = useState(liveEventLottery?.eventTitle || 'جشن بزرگ روز پدر');
  const [liveEventCode, setLiveEventCode] = useState(liveEventLottery?.eventCode || '110');
  const [liveEventDescription, setLiveEventDescription] = useState(liveEventLottery?.description || '');
  const [liveEventPrizeSummary, setLiveEventPrizeSummary] = useState(liveEventLottery?.prizeSummary || '');
  const [liveEventActive, setLiveEventActive] = useState(liveEventLottery?.isActive ?? true);
  const [liveEventSavedNotice, setLiveEventSavedNotice] = useState(false);

  // Helper to get registered live event attendees list with rich names
  const registeredEventAttendees = (liveEventLottery?.registeredPhoneNumbers || ['09171234567', '09179998877', '09173332211', '09179876543']).map((phone, index) => {
    const matchedUser = (users || []).find((u) => u.phone === phone);
    const matchedReq = (requests || []).find((r) => r.userPhone === phone);
    const name = matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : (matchedReq?.userName || `شهروند شرکت‌کننده در سالن (${toPersianDigits(index + 1)})`);
    const cityId = matchedUser?.cityId || matchedReq?.cityId || currentCity;
    return {
      phone,
      name,
      cityId,
      cityName: CITIES[cityId]?.name || 'نورآباد ممسنی',
      code: `LIVE-${liveEventLottery?.eventCode || '110'}-${(index + 1).toString().padStart(3, '0')}`
    };
  });

  // Handle on-site manual attendee addition
  const handleAddOnSiteAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = onSiteAttendeePhone.trim();
    if (!cleanPhone) return;

    const currentNumbers = liveEventLottery?.registeredPhoneNumbers || [];
    if (!currentNumbers.includes(cleanPhone)) {
      const updatedNumbers = [...currentNumbers, cleanPhone];
      const updated: LiveEventLottery = {
        ...liveEventLottery,
        participantsCount: Math.max(updatedNumbers.length, (liveEventLottery?.participantsCount || 0) + 1),
        registeredPhoneNumbers: updatedNumbers
      };
      onUpdateLiveEventLottery(updated);
    }

    setOnSiteAttendeeNotice(true);
    setOnSiteAttendeePhone('');
    setOnSiteAttendeeName('');
    setTimeout(() => setOnSiteAttendeeNotice(false), 3000);
  };

  // Open modal to create new
  const handleOpenCreateNew = () => {
    setEditingLottery(null);
    setFormTitle('قرعه‌کشی طلایی دوره آینده (۱ ماه دیگر)');
    setFormPeriodCode(`DRAW-${Date.now().toString().slice(-4)}`);
    setFormDateStr('جمعه ۳۰ آبان ۱۴۰۵');
    setFormCountdownDays(30);
    setFormPrizes([
      { id: 'p1', rankTitle: 'جایزه نفر اول', tier: 'first', prizeName: 'ربع سکه بهار آزادی + گوشی هوشمند', winnersCount: 1, iconEmoji: '🥇' },
      { id: 'p2', rankTitle: 'جوایز نفرات دوم', tier: 'second', prizeName: '۳ کارت هدیه ۵ میلیون تومانی', winnersCount: 3, iconEmoji: '🥈' },
      { id: 'p3', rankTitle: 'جوایز نفرات سوم', tier: 'third', prizeName: '۱۰ دستگاه خردکن برقی تفال', winnersCount: 10, iconEmoji: '🥉' },
      { id: 'p4', rankTitle: 'جوایز عمومی', tier: 'general', prizeName: '۵۰ پکیج تفکیک پسماند خانگی', winnersCount: 50, iconEmoji: '🎁' }
    ]);
    setIsEditModalOpen(true);
  };

  // Open modal to edit existing
  const handleOpenEdit = (lottery: ScheduledLottery) => {
    setEditingLottery(lottery);
    setFormTitle(lottery.title);
    setFormPeriodCode(lottery.periodCode);
    setFormDateStr(lottery.targetDrawDateStr);
    setFormCountdownDays(lottery.countdownDays);
    setFormPrizes(lottery.prizes);
    setIsEditModalOpen(true);
  };

  // Save Scheduled Lottery
  const handleSaveLottery = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLottery) {
      // Update
      const updated = scheduledLotteries.map((l) =>
        l.id === editingLottery.id
          ? {
              ...l,
              title: formTitle,
              periodCode: formPeriodCode,
              targetDrawDateStr: formDateStr,
              countdownDays: Number(formCountdownDays),
              prizes: formPrizes
            }
          : l
      );
      onUpdateScheduledLotteries(updated);
    } else {
      // Create
      const newLottery: ScheduledLottery = {
        id: `lottery-${Date.now()}`,
        title: formTitle,
        periodCode: formPeriodCode,
        cityId: 'all',
        targetDrawDateStr: formDateStr,
        countdownDays: Number(formCountdownDays),
        status: 'upcoming',
        totalEligibleTicketsCount: requests.length,
        isTicketsResetForThisPeriod: false,
        createdAt: new Date().toISOString(),
        prizes: formPrizes
      };
      onUpdateScheduledLotteries([newLottery, ...scheduledLotteries]);
    }
    setIsEditModalOpen(false);
  };

  // Delete Scheduled Lottery
  const handleDeleteLottery = (id: string) => {
    if (confirm('آیا از حذف این دوره قرعه‌کشی اطمینان دارید؟')) {
      onUpdateScheduledLotteries(scheduledLotteries.filter((l) => l.id !== id));
    }
  };

  // Reset and Archive Tickets for Previous Periods
  const handleConfirmResetTickets = () => {
    if (onResetPreviousTickets) {
      onResetPreviousTickets('CURRENT_PERIOD', resetAnnouncementText);
    }
    // Update local scheduled state flag
    const updated = scheduledLotteries.map((l, idx) =>
      idx === 0
        ? {
            ...l,
            isTicketsResetForThisPeriod: true,
            ticketsResetAnnouncement: resetAnnouncementText
          }
        : l
    );
    onUpdateScheduledLotteries(updated);
    setIsResetConfirmOpen(false);
    alert('✅ کدهای دوره قبلی با موفقیت بایگانی شدند و پیام هشدار برای کاربران ثبت گردید.');
  };

  // Save Live Event Settings
  const handleSaveLiveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: LiveEventLottery = {
      ...liveEventLottery,
      eventTitle: liveEventTitle,
      eventCode: liveEventCode,
      description: liveEventDescription,
      prizeSummary: liveEventPrizeSummary,
      isActive: liveEventActive
    };
    onUpdateLiveEventLottery(updated);
    setLiveEventSavedNotice(true);
    setTimeout(() => setLiveEventSavedNotice(false), 3000);
  };

  // Execute Live Draw Wheel (supports both Periodic Scheduled Draw and Live Event On-Site Draw!)
  const handleExecuteWheelDraw = () => {
    if (drawMode === 'live_event') {
      // LIVE EVENT DRAW MODE (کد ۱۱۰ و جشن حضوری)
      const attendees = registeredEventAttendees;
      if (attendees.length === 0) {
        alert('شرکت‌کننده‌ای با کد جشن حضوری ثبت‌نام نکرده است.');
        return;
      }

      setIsDrawing(true);
      setRecentWinner(null);

      // Rapid shuffle animation effect on screen
      const interval = setInterval(() => {
        const randAttendee = attendees[Math.floor(Math.random() * attendees.length)];
        setShufflingParticipantText(`${randAttendee.name} • ${randAttendee.phone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2')}`);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const randomIndex = Math.floor(Math.random() * attendees.length);
        const chosen = attendees[randomIndex];

        const winner: LotteryWinner = {
          id: `win-live-${Date.now()}`,
          drawPeriod: liveEventLottery?.eventTitle || 'جشن بزرگ روز پدر (کد ۱۱۰)',
          winnerName: chosen.name,
          userPhoneMasked: chosen.phone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
          prizeTitle: liveEventSelectedPrize || liveEventLottery?.prizeSummary || 'جایزه ویژه جشن حضوری',
          prizeTier: 'special',
          ticketCode: chosen.code,
          cityId: chosen.cityId,
          cityName: chosen.cityName,
          awardedAt: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
        };

        onAddWinner(winner);
        setRecentWinner(winner);
        setIsDrawing(false);
        setShufflingParticipantText('');

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
      }, 2600);
    } else {
      // SCHEDULED RECYCLING TICKETS DRAW MODE
      const eligibleRequests = requests.filter((r) => r.lotteryTicketNumber);
      if (eligibleRequests.length === 0) {
        alert('کد شانس واجد شرایطی برای قرعه‌کشی موجود نیست.');
        return;
      }

      setIsDrawing(true);
      setRecentWinner(null);

      const activeLottery = scheduledLotteries.find((l) => l.id === selectedLotteryForDraw) || scheduledLotteries[0];
      const prizeConfig = activeLottery?.prizes.find((p) => p.tier === selectedPrizeTier) || activeLottery?.prizes[0];

      // Rapid shuffle animation effect
      const interval = setInterval(() => {
        const randReq = eligibleRequests[Math.floor(Math.random() * eligibleRequests.length)];
        setShufflingParticipantText(`${randReq.userName} • ${randReq.lotteryTicketNumber}`);
      }, 100);

      setTimeout(() => {
        clearInterval(interval);
        const randomIndex = Math.floor(Math.random() * eligibleRequests.length);
        const chosen = eligibleRequests[randomIndex];

        const winner: LotteryWinner = {
          id: `win-${Date.now()}`,
          drawPeriod: activeLottery?.title || 'دوره طلایی جاری',
          winnerName: chosen.userName,
          userPhoneMasked: chosen.userPhone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
          prizeTitle: prizeConfig?.prizeName || 'ربع سکه بهار آزادی',
          prizeTier: (prizeConfig?.tier as any) || 'first',
          ticketCode: chosen.lotteryTicketNumber,
          cityId: chosen.cityId,
          cityName: chosen.cityName,
          awardedAt: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date())
        };

        onAddWinner(winner);
        setRecentWinner(winner);
        setIsDrawing(false);
        setShufflingParticipantText('');

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 }
        });
      }, 2500);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Sub navigation tabs */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('scheduled')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'scheduled' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>قرعه‌کشی زمان‌بندی‌شده</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('live_event')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'live_event' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-600" />
          <span>تنظیمات جشن حضوری ({liveEventLottery?.eventCode || '110'})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('draw_wheel')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'draw_wheel' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>گردونه زنده و استخراج برندگان</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('winners')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'winners' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>تالار برندگان ({toPersianDigits(winnersList.length)})</span>
        </button>
      </div>

      {/* SUB TAB 1: SCHEDULED LOTTERIES */}
      {activeSubTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <span>دوره‌های قرعه‌کشی ادواری پاکینو</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded-full">
                  قابلیت تنظیم تا ۱ سال آینده
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تعریف تاریخ برگزاری، شمارش معکوس و کاستومایز جوایز برای رتبه‌های اول، دوم، سوم و هدایای عمومی
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs rounded-xl border border-rose-200 transition flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>ریست و شروع دوره جدید</span>
              </button>

              <button
                type="button"
                onClick={handleOpenCreateNew}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تعریف دوره جدید</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {scheduledLotteries.map((lottery) => (
              <div
                key={lottery.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-900">{lottery.title}</h4>
                        <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-bold">
                          {lottery.periodCode}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>تاریخ قرعه‌کشی: <strong>{lottery.targetDrawDateStr}</strong></span>
                        </span>
                        <span className="flex items-center gap-1 text-indigo-600 font-black">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{toPersianDigits(lottery.countdownDays)} روز مانده</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lottery)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>ویرایش</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLottery(lottery.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  {lottery.prizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-start gap-2.5 text-xs"
                    >
                      <span className="text-xl shrink-0 mt-0.5">{prize.iconEmoji}</span>
                      <div>
                        <div className="font-black text-slate-900">{prize.rankTitle}</div>
                        <div className="text-slate-600 font-bold mt-0.5 text-[11px] leading-tight text-amber-900">
                          {prize.prizeName}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 font-bold">
                          تعداد برندگان: {toPersianDigits(prize.winnersCount)} نفر
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: LIVE EVENT SETTINGS & ATTENDEE ROSTER */}
      {activeSubTab === 'live_event' && (
        <div className="space-y-4">
          <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-sm text-slate-900">تنظیمات و مدیریت رویداد زنده (جشن حضوری)</h3>
              </div>
              <span className="text-xs font-mono font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-full">
                کد فعال رویداد: {liveEventCode}
              </span>
            </div>

            <form onSubmit={handleSaveLiveEvent} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    عنوان جشن یا همایش حضوری:
                  </label>
                  <input
                    type="text"
                    value={liveEventTitle}
                    onChange={(e) => setLiveEventTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                    placeholder="مثال: جشن بزرگ روز پدر و تقدیر از پاکیاران نورآباد"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    کد اختصاصی ورود به قرعه‌کشی (کد اعلامی به حضار):
                  </label>
                  <input
                    type="text"
                    value={liveEventCode}
                    onChange={(e) => setLiveEventCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-center text-rose-700 focus:bg-white text-base"
                    placeholder="مثال: 110"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  توضیحات و راهنمای شرکت در جشن:
                </label>
                <textarea
                  rows={2}
                  value={liveEventDescription}
                  onChange={(e) => setLiveEventDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  خلاصه جوایز ویژه این رویداد:
                </label>
                <input
                  type="text"
                  value={liveEventPrizeSummary}
                  onChange={(e) => setLiveEventPrizeSummary(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  placeholder="مثال: ۵ عدد نیم سکه بهار آزادی + ۱۰ کارت هدیه نقدی ۲ میلیونی"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="font-black text-xs text-slate-900 block">فعال‌سازی تب ثبت‌نام جشن در اپلیکیشن شهروندی:</span>
                  <span className="text-[11px] text-slate-500">با فعال‌سازی، تب ثبت کد {liveEventCode} در بخش قرعه‌کشی برای تمام شهروندان نمایش داده می‌شود.</span>
                </div>
                <input
                  type="checkbox"
                  checked={liveEventActive}
                  onChange={(e) => setLiveEventActive(e.target.checked)}
                  className="w-5 h-5 accent-rose-600 rounded-md cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>شرکت‌کنندگان ثبت‌شده تاکنون: <strong>{toPersianDigits(registeredEventAttendees.length)} نفر</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  {liveEventSavedNotice && (
                    <span className="text-xs text-emerald-600 font-bold animate-in fade-in">
                      ✅ تنظیمات جشن با موفقیت ذخیره شد
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>ذخیره تغییرات جشن حضوری</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Attendee Registration & List Section */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-black text-xs text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>لیست شهروندان ثبت‌شده در جشن حضوری ({liveEventTitle})</span>
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  کسانی که کد {liveEventCode} را در اپلیکیشن زده‌اند یا توسط مدیر در سالن همایش ثبت شده‌اند
                </p>
              </div>

              <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {toPersianDigits(registeredEventAttendees.length)} شرکت‌کننده آماده قرعه‌کشی
              </span>
            </div>

            {/* Quick manual add attendee on-site */}
            <form onSubmit={handleAddOnSiteAttendee} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-2.5">
              <span className="text-xs font-black text-slate-700 shrink-0 flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-indigo-600" />
                <span>ثبت دستی شماره شرکت‌کننده در سالن:</span>
              </span>
              <input
                type="text"
                value={onSiteAttendeePhone}
                onChange={(e) => setOnSiteAttendeePhone(e.target.value)}
                placeholder="شماره موبایل (مثال: 09171234567)"
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold"
                required
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
              >
                افزودن به لیست شانس
              </button>
              {onSiteAttendeeNotice && (
                <span className="text-xs text-emerald-600 font-bold shrink-0">✅ ثبت شد</span>
              )}
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-1">
              {registeredEventAttendees.map((att, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-black text-slate-900">{att.name}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">{att.phone}</div>
                  </div>
                  <span className="font-mono text-[10px] font-bold bg-white text-rose-800 px-2 py-1 rounded-lg border border-slate-200">
                    {att.code}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: LIVE DRAW WHEEL (DUAL MODE: SCHEDULED RECYCLING & LIVE EVENT 110) */}
      {activeSubTab === 'draw_wheel' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
              <h3 className="font-black text-sm text-slate-900">گردونه قرعه‌کشی زنده و استخراج برندگان در لحظه</h3>
            </div>

            {/* Mode Toggle Switch */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  setDrawMode('scheduled_tickets');
                  setRecentWinner(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-black transition cursor-pointer ${
                  drawMode === 'scheduled_tickets' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                📅 قرعه‌کشی دوره‌ای پسماند
              </button>
              <button
                type="button"
                onClick={() => {
                  setDrawMode('live_event');
                  setRecentWinner(null);
                }}
                className={`px-3 py-1.5 rounded-lg font-black transition cursor-pointer flex items-center gap-1 ${
                  drawMode === 'live_event' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>🎪 جشن حضوری (کد {liveEventLottery?.eventCode || '110'})</span>
              </button>
            </div>
          </div>

          {/* Controls for Scheduled Recycling Mode */}
          {drawMode === 'scheduled_tickets' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">انتخاب دوره قرعه‌کشی ادواری:</label>
                <select
                  value={selectedLotteryForDraw}
                  onChange={(e) => setSelectedLotteryForDraw(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  {scheduledLotteries.map((l) => (
                    <option key={l.id} value={l.id}>{l.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">سطح جایزه مورد قرعه‌کشی:</label>
                <select
                  value={selectedPrizeTier}
                  onChange={(e) => setSelectedPrizeTier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                >
                  <option value="first">🥇 نفر اول (جایزه طلایی / ربع سکه)</option>
                  <option value="second">🥈 نفر دوم (کارت هدیه نقدی ۵ میلیونی)</option>
                  <option value="third">🥉 نفر سوم (۱۰ دستگاه خردکن برقی)</option>
                  <option value="general">🎁 جوایز عمومی و تشویقی</option>
                </select>
              </div>
            </div>
          )}

          {/* Controls for Live Event On-Site Mode */}
          {drawMode === 'live_event' && (
            <div className="space-y-3 bg-gradient-to-r from-rose-50/70 via-amber-50/70 to-rose-50/70 p-4 rounded-2xl border border-rose-200 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                    {liveEventLottery?.eventCode || '110'}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900">{liveEventLottery?.eventTitle}</h4>
                    <p className="text-[11px] text-slate-600">قرعه‌کشی زنده بین تمام کسانی که کد {liveEventLottery?.eventCode || '110'} را ثبت کرده‌اند</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs font-black text-rose-800 bg-white px-3 py-1 rounded-xl border border-rose-200 font-mono">
                    {toPersianDigits(registeredEventAttendees.length)} شرکت‌کننده واجد شرایط در سالن
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">انتخاب جایزه این نوبت جشن حضوری:</label>
                <select
                  value={liveEventSelectedPrize}
                  onChange={(e) => setLiveEventSelectedPrize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-950 focus:border-rose-500"
                >
                  <option value="نیم سکه بهار آزادی (جایزه ویژه جشن روز پدر)">🥇 نیم سکه بهار آزادی (جایزه ویژه جشن)</option>
                  <option value="کارت هدیه نقدی ۲,۰۰۰,۰۰۰ تومانی">💳 کارت هدیه نقدی ۲,۰۰۰,۰۰۰ تومانی</option>
                  <option value="پکیج سطل تفکیک هوشمند خانگی پاکینو">📦 پکیج سطل تفکیک هوشمند خانگی</option>
                  <option value="خردکن برقی و تصفیه آب خانگی">🎁 خردکن برقی و تصفیه آب خانگی</option>
                </select>
              </div>
            </div>
          )}

          {/* Rapid shuffling live display banner during draw */}
          {isDrawing && shufflingParticipantText && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl text-center space-y-1 animate-pulse border-2 border-amber-400">
              <div className="text-xs text-amber-300 font-bold">گردونه هوشمند در حال پیمایش شرکت‌کنندگان...</div>
              <div className="text-lg font-mono font-black text-white tracking-wider">
                {shufflingParticipantText}
              </div>
            </div>
          )}

          {/* Draw Button */}
          <button
            type="button"
            disabled={isDrawing}
            onClick={handleExecuteWheelDraw}
            className={`w-full py-4 text-white font-black text-sm rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
              drawMode === 'live_event'
                ? 'bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-700 hover:to-rose-800'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
            }`}
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>
              {isDrawing
                ? 'در حال چرخش گردونه هوشمند و انتخاب تصادفی برنده...'
                : drawMode === 'live_event'
                ? `اجرای قرعه‌کشی زنده جشن حضوری (کد ${liveEventLottery?.eventCode || '110'})`
                : 'اجرای قرعه‌کشی زنده ادواری و استخراج برنده'}
            </span>
          </button>

          {/* Winner Card */}
          {recentWinner && (
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl border-2 border-amber-400 text-center space-y-3 animate-in zoom-in-95 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center mx-auto text-2xl shadow-lg animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className="text-[11px] font-black bg-amber-200 text-amber-900 px-3 py-0.5 rounded-full">
                  {recentWinner.drawPeriod}
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                  🎉 برنده خوش‌شانس: {recentWinner.winnerName} ({recentWinner.cityName})
                </div>
              </div>

              <div className="p-3 bg-white rounded-2xl border border-amber-200 max-w-md mx-auto space-y-1 text-xs">
                <div className="text-amber-900 font-bold">
                  جایزه اهداشده: <span className="font-black text-emerald-800">{recentWinner.prizeTitle}</span>
                </div>
                <div className="text-slate-600">
                  شماره تماس برنده: <span className="font-mono font-bold">{recentWinner.userPhoneMasked}</span> • کد شانس: <span className="font-mono font-black text-indigo-700">{recentWinner.ticketCode}</span>
                </div>
              </div>

              <p className="text-[11px] text-emerald-700 font-bold">
                ✅ مشخصات برنده فوراً در تالار افتخارات عمومی شهروندان ثبت گردید.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 4: PUBLISHED WINNERS */}
      {activeSubTab === 'winners' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="font-black text-xs text-slate-800">لیست برندگان منتشر شده در تالار افتخارات:</h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              قابل مشاهده توسط تمام شهروندان
            </span>
          </div>

          <div className="space-y-2">
            {winnersList.map((w) => (
              <div key={w.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-xl">
                    {w.prizeTier === 'first' ? '🥇' : w.prizeTier === 'second' ? '🥈' : w.prizeTier === 'special' ? '🎪' : '🥉'}
                  </span>
                  <div>
                    <div className="font-black text-slate-900">{w.winnerName} ({w.cityName})</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">{w.prizeTitle} • {w.drawPeriod}</div>
                  </div>
                </div>
                <div className="text-left font-mono text-slate-700 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200">
                  {w.ticketCode}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT SCHEDULED LOTTERY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                {editingLottery ? 'ویرایش مشخصات و جوایز قرعه‌کشی' : 'تعریف دوره جدید قرعه‌کشی زمان‌بندی‌شده'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveLottery} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عنوان دوره:</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تاریخ برگزاری:</label>
                  <input
                    type="text"
                    value={formDateStr}
                    onChange={(e) => setFormDateStr(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    placeholder="مثال: جمعه ۲۵ مهر ۱۴۰۵"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">روزهای مانده (شمارش):</label>
                  <input
                    type="number"
                    value={formCountdownDays}
                    onChange={(e) => setFormCountdownDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                    required
                  />
                </div>
              </div>

              {/* Prize items configuration */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-black text-slate-800">تنظیم و کاستومایز جوایز:</label>
                {formPrizes.map((p, idx) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-slate-800">{p.iconEmoji} {p.rankTitle}</span>
                      <div className="flex items-center gap-1 text-[11px]">
                        <span>تعداد برنده:</span>
                        <input
                          type="number"
                          value={p.winnersCount}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormPrizes(formPrizes.map((item, i) => i === idx ? { ...item, winnersCount: val } : item));
                          }}
                          className="w-12 px-1.5 py-0.5 bg-white border border-slate-300 rounded-md text-center font-bold"
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      value={p.prizeName}
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormPrizes(formPrizes.map((item, i) => i === idx ? { ...item, prizeName: val } : item));
                      }}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-amber-900"
                      placeholder="عنوان جایزه..."
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  ذخیره زمان‌بندی و جوایز
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PREVIOUS TICKETS CONFIRMATION */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h3 className="font-black text-sm text-slate-900">
                ریست کردن کدهای شانس دوره قبل و شروع دوره جدید
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                با تایید این اقدام، کدهای قرعه‌کشی دوره‌های قبل به عنوان کدهای بایگانی‌شده ثبت شده و کاربران برای دوره جدید شانس‌های تازه دریافت خواهند کرد.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                متن اعلان و پیام برای شهروندان در اپلیکیشن:
              </label>
              <textarea
                rows={3}
                value={resetAnnouncementText}
                onChange={(e) => setResetAnnouncementText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleConfirmResetTickets}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                تایید ریست و اعلان به کاربران
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

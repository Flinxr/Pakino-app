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
  UserPlus,
  UserX,
  Shuffle,
  Eye,
  Check,
  Tag
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
import { CITIES, INITIAL_LIVE_LOTTERIES } from '../../data/cities';
import { logAppEvent } from '../../utils/eventLogger';

interface AdminLotteryManagerProps {
  currentCity: CityId;
  requests: PickupRequest[];
  users?: UserProfile[];
  scheduledLotteries: ScheduledLottery[];
  onUpdateScheduledLotteries: (lotteries: ScheduledLottery[]) => void;
  liveEventLottery: LiveEventLottery;
  onUpdateLiveEventLottery: (event: LiveEventLottery) => void;
  liveEventLotteries?: LiveEventLottery[];
  onUpdateLiveEventLotteries?: (events: LiveEventLottery[]) => void;
  winnersList: LotteryWinner[];
  onAddWinner: (winner: LotteryWinner) => void;
  onUpdateWinnersList?: (winners: LotteryWinner[]) => void;
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
  liveEventLotteries: propLiveEvents,
  onUpdateLiveEventLotteries,
  winnersList = [],
  onAddWinner,
  onUpdateWinnersList,
  onResetPreviousTickets
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'scheduled' | 'live_event' | 'draw_wheel' | 'winners'>('scheduled');

  // Multi-event lotteries state (Item 3: امکان تعریف چند کد قرعه‌کشی هم‌زمان با بازه تاریخ و ساعت شروع/پایان مستقل)
  const [allLiveEvents, setAllLiveEvents] = useState<LiveEventLottery[]>(() => {
    if (propLiveEvents && propLiveEvents.length > 0) return propLiveEvents;
    const saved = localStorage.getItem('pakino_all_live_events');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_LIVE_LOTTERIES;
  });

  const saveLiveEventsList = (events: LiveEventLottery[]) => {
    setAllLiveEvents(events);
    localStorage.setItem('pakino_all_live_events', JSON.stringify(events));
    if (onUpdateLiveEventLotteries) {
      onUpdateLiveEventLotteries(events);
    }
    if (events.length > 0) {
      onUpdateLiveEventLottery(events[0]);
    }
  };

  // Selected live event for edit or draw
  const [selectedLiveEventId, setSelectedLiveEventId] = useState<string>(allLiveEvents[0]?.id || 'live-event-110');
  const activeSelectedLiveEvent = allLiveEvents.find((e) => e.id === selectedLiveEventId) || allLiveEvents[0] || liveEventLottery;

  // New / Edit Event Code Modal State (Item 3)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<LiveEventLottery | null>(null);
  const [eventFormTitle, setEventFormTitle] = useState('');
  const [eventFormCode, setEventFormCode] = useState('');
  const [eventFormDescription, setEventFormDescription] = useState('');
  const [eventFormPrizeSummary, setEventFormPrizeSummary] = useState('');
  const [eventFormStartDate, setEventFormStartDate] = useState('1405-07-01');
  const [eventFormStartTime, setEventFormStartTime] = useState('09:00');
  const [eventFormEndDate, setEventFormEndDate] = useState('1405-07-30');
  const [eventFormEndTime, setEventFormEndTime] = useState('21:00');
  const [eventFormCity, setEventFormCity] = useState<CityId | 'all'>('all');
  const [eventFormActive, setEventFormActive] = useState(true);

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
    activeSelectedLiveEvent?.prizesList?.[0] || activeSelectedLiveEvent?.prizeSummary || '۵ عدد نیم سکه بهار آزادی'
  );
  const [recentWinner, setRecentWinner] = useState<LotteryWinner | null>(null);
  const [absentActionNotice, setAbsentActionNotice] = useState<string | null>(null);

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

  // Winners Tab filter
  const [winnerFilterStatus, setWinnerFilterStatus] = useState<'all' | 'claimed' | 'absent' | 'replaced'>('all');

  // Helper to get registered live event attendees list with rich names for activeSelectedLiveEvent
  const registeredEventAttendees = (activeSelectedLiveEvent?.registeredPhoneNumbers || ['09171234567', '09179998877', '09173332211', '09179876543']).map((phone, index) => {
    const matchedUser = (users || []).find((u) => u.phone === phone);
    const matchedReq = (requests || []).find((r) => r.userPhone === phone);
    const name = matchedUser ? `${matchedUser.firstName} ${matchedUser.lastName}` : (matchedReq?.userName || `شرکت‌کننده (${toPersianDigits(index + 1)})`);
    const cityId = matchedUser?.cityId || matchedReq?.cityId || currentCity;
    return {
      phone,
      name,
      cityId,
      cityName: CITIES[cityId]?.name || 'نورآباد ممسنی',
      code: `LIVE-${activeSelectedLiveEvent?.eventCode || '110'}-${(index + 1).toString().padStart(3, '0')}`
    };
  });

  // Handle on-site manual attendee addition
  const handleAddOnSiteAttendee = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = onSiteAttendeePhone.trim();
    if (!cleanPhone) return;

    const currentNumbers = activeSelectedLiveEvent?.registeredPhoneNumbers || [];
    if (!currentNumbers.includes(cleanPhone)) {
      const updatedNumbers = [...currentNumbers, cleanPhone];
      const updatedEvent: LiveEventLottery = {
        ...activeSelectedLiveEvent,
        participantsCount: Math.max(updatedNumbers.length, (activeSelectedLiveEvent?.participantsCount || 0) + 1),
        registeredPhoneNumbers: updatedNumbers
      };

      const updatedList = allLiveEvents.map((ev) => ev.id === updatedEvent.id ? updatedEvent : ev);
      saveLiveEventsList(updatedList);
    }

    setOnSiteAttendeeNotice(true);
    setOnSiteAttendeePhone('');
    setOnSiteAttendeeName('');
    setTimeout(() => setOnSiteAttendeeNotice(false), 3000);
  };

  // Open modal to create new live event code (Item 3)
  const handleOpenCreateEvent = () => {
    setEditingEvent(null);
    setEventFormTitle('جشنواره ویژه نوروز و پاکسازی بهاره');
    setEventFormCode('NOROOZ');
    setEventFormDescription('کد اختصاصی ویژه جشنواره بهاره نورآباد و کازرون. ثبت‌نام رایگان در گردونه جوایز.');
    setEventFormPrizeSummary('۳ عدد نیم سکه بهار آزادی + ۱۰ کارت هدیه ۲ میلیونی');
    setEventFormStartDate('1405-07-01');
    setEventFormStartTime('10:00');
    setEventFormEndDate('1405-07-30');
    setEventFormEndTime('22:00');
    setEventFormCity('all');
    setEventFormActive(true);
    setIsEventModalOpen(true);
  };

  // Open modal to edit existing live event code
  const handleOpenEditEvent = (ev: LiveEventLottery) => {
    setEditingEvent(ev);
    setEventFormTitle(ev.eventTitle);
    setEventFormCode(ev.eventCode);
    setEventFormDescription(ev.description);
    setEventFormPrizeSummary(ev.prizeSummary);
    setEventFormStartDate(ev.startDate || '1405-06-28');
    setEventFormStartTime(ev.startTime || '18:00');
    setEventFormEndDate(ev.endDate || '1405-06-28');
    setEventFormEndTime(ev.endTime || '22:00');
    setEventFormCity(ev.cityId || 'all');
    setEventFormActive(ev.isActive ?? true);
    setIsEventModalOpen(true);
  };

  // Save Event Code
  const handleSaveEventCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEvent) {
      const updatedList = allLiveEvents.map((ev) =>
        ev.id === editingEvent.id
          ? {
              ...ev,
              eventTitle: eventFormTitle,
              eventCode: eventFormCode,
              description: eventFormDescription,
              prizeSummary: eventFormPrizeSummary,
              startDate: eventFormStartDate,
              startTime: eventFormStartTime,
              endDate: eventFormEndDate,
              endTime: eventFormEndTime,
              cityId: eventFormCity,
              isActive: eventFormActive,
              eventDateStr: `${eventFormStartDate} (ساعت ${eventFormStartTime} الی ${eventFormEndTime})`
            }
          : ev
      );
      saveLiveEventsList(updatedList);
    } else {
      const newEv: LiveEventLottery = {
        id: `live-event-${Date.now()}`,
        eventTitle: eventFormTitle,
        eventCode: eventFormCode,
        description: eventFormDescription,
        prizeSummary: eventFormPrizeSummary,
        startDate: eventFormStartDate,
        startTime: eventFormStartTime,
        endDate: eventFormEndDate,
        endTime: eventFormEndTime,
        cityId: eventFormCity,
        isActive: eventFormActive,
        status: 'active',
        participantsCount: 0,
        registeredPhoneNumbers: [],
        eventDateStr: `${eventFormStartDate} (ساعت ${eventFormStartTime} الی ${eventFormEndTime})`,
        prizesList: [eventFormPrizeSummary]
      };
      saveLiveEventsList([...allLiveEvents, newEv]);
    }
    setIsEventModalOpen(false);
  };

  // Delete Event Code
  const handleDeleteEventCode = (id: string) => {
    if (allLiveEvents.length <= 1) {
      alert('حداقل وجود یک کد قرعه‌کشی فعال در سیستم الزامی است.');
      return;
    }
    const updated = allLiveEvents.filter((e) => e.id !== id);
    saveLiveEventsList(updated);
    if (selectedLiveEventId === id) {
      setSelectedLiveEventId(updated[0]?.id || '');
    }
  };

  // Open modal to create new Scheduled Lottery
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

  // Open modal to edit existing Scheduled Lottery
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
    onUpdateScheduledLotteries(scheduledLotteries.filter((l) => l.id !== id));
  };

  // Reset and Archive Tickets for Previous Periods
  const handleConfirmResetTickets = () => {
    if (onResetPreviousTickets) {
      onResetPreviousTickets('CURRENT_PERIOD', resetAnnouncementText);
    }
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
  };

  // Execute Live Draw Wheel
  const handleExecuteWheelDraw = () => {
    if (drawMode === 'live_event') {
      const attendees = registeredEventAttendees;
      if (attendees.length === 0) {
        alert('شرکت‌کننده‌ای با کد جشن حضوری انتخاب‌شده ثبت‌نام نکرده است.');
        return;
      }

      setIsDrawing(true);
      setRecentWinner(null);

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
          drawPeriod: `${activeSelectedLiveEvent?.eventTitle} (کد ${activeSelectedLiveEvent?.eventCode})`,
          winnerName: chosen.name,
          userPhoneMasked: chosen.phone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
          prizeTitle: liveEventSelectedPrize || activeSelectedLiveEvent?.prizeSummary || 'جایزه ویژه جشن حضوری',
          prizeTier: 'special',
          ticketCode: chosen.code,
          cityId: chosen.cityId,
          cityName: chosen.cityName,
          awardedAt: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
          status: 'claimed',
          isAbsent: false
        };

        onAddWinner(winner);
        setRecentWinner(winner);
        setIsDrawing(false);
        setShufflingParticipantText('');

        logAppEvent({
          eventType: 'lottery_winner_drawn',
          actorId: 'admin-01',
          actorRole: 'admin',
          actorName: 'مدیریت ارشد پاکینو',
          entityId: winner.id,
          entityType: 'lottery',
          cityId: winner.cityId,
          cityName: winner.cityName,
          details: {
            winnerName: winner.winnerName,
            prizeTitle: winner.prizeTitle,
            drawPeriod: winner.drawPeriod,
            eventCode: activeSelectedLiveEvent?.eventCode
          }
        });

        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 }
        });
      }, 2600);
    } else {
      const eligibleRequests = requests.filter((r) => r.lotteryTicketNumber);
      if (eligibleRequests.length === 0) {
        alert('کد شانس واجد شرایطی برای قرعه‌کشی موجود نیست.');
        return;
      }

      setIsDrawing(true);
      setRecentWinner(null);

      const activeLottery = scheduledLotteries.find((l) => l.id === selectedLotteryForDraw) || scheduledLotteries[0];
      const prizeConfig = activeLottery?.prizes.find((p) => p.tier === selectedPrizeTier) || activeLottery?.prizes[0];

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
          userPhoneMasked: (chosen.userPhone || '09171234567').replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
          prizeTitle: prizeConfig?.prizeName || 'ربع سکه بهار آزادی',
          prizeTier: (prizeConfig?.tier as any) || 'first',
          ticketCode: chosen.lotteryTicketNumber || `PK-WIN-${Date.now().toString().slice(-4)}`,
          cityId: chosen.cityId,
          cityName: chosen.cityName,
          awardedAt: new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(new Date()),
          status: 'claimed',
          isAbsent: false
        };

        onAddWinner(winner);
        setRecentWinner(winner);
        setIsDrawing(false);
        setShufflingParticipantText('');

        logAppEvent({
          eventType: 'lottery_winner_drawn',
          actorId: 'admin-01',
          actorRole: 'admin',
          actorName: 'مدیریت ارشد پاکینو',
          entityId: winner.id,
          entityType: 'lottery',
          cityId: winner.cityId,
          cityName: winner.cityName,
          details: {
            winnerName: winner.winnerName,
            prizeTitle: winner.prizeTitle,
            drawPeriod: winner.drawPeriod
          }
        });

        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 }
        });
      }, 2500);
    }
  };

  // ITEM 3: ABSENT WINNER HANDLING (ثبت غیبت برنده و قرعه‌کشی مجدد تصادفی بدون حذف از دیتابیس)
  const handleMarkWinnerAbsentAndRedraw = (targetWinner: LotteryWinner) => {
    // 1. Mark existing winner as absent
    const nowStr = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date());
    const updatedAbsentWinner: LotteryWinner = {
      ...targetWinner,
      status: 'absent',
      isAbsent: true,
      absentMarkedAt: nowStr,
      absentReason: 'عدم حضور در سالن مراسم و ثبت وضعیت غایب توسط مدیر'
    };

    // 2. Choose replacement winner randomly
    let newReplacementWinner: LotteryWinner;

    if (drawMode === 'live_event' || targetWinner.id.startsWith('win-live')) {
      const attendees = registeredEventAttendees.filter(a => a.phone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2') !== targetWinner.userPhoneMasked);
      const chosen = attendees.length > 0 
        ? attendees[Math.floor(Math.random() * attendees.length)] 
        : registeredEventAttendees[0];

      newReplacementWinner = {
        id: `win-replace-${Date.now()}`,
        drawPeriod: targetWinner.drawPeriod,
        winnerName: `${chosen.name} (برنده جایگزین)`,
        userPhoneMasked: chosen.phone.replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
        prizeTitle: targetWinner.prizeTitle,
        prizeTier: targetWinner.prizeTier,
        ticketCode: chosen.code,
        cityId: chosen.cityId,
        cityName: chosen.cityName,
        awardedAt: nowStr,
        status: 'replaced',
        isAbsent: false,
        replacementForWinnerId: targetWinner.id
      };
    } else {
      const eligibleRequests = requests.filter((r) => r.lotteryTicketNumber && r.lotteryTicketNumber !== targetWinner.ticketCode);
      const chosen = eligibleRequests.length > 0 
        ? eligibleRequests[Math.floor(Math.random() * eligibleRequests.length)] 
        : requests[0];

      newReplacementWinner = {
        id: `win-replace-${Date.now()}`,
        drawPeriod: targetWinner.drawPeriod,
        winnerName: `${chosen.userName} (برنده جایگزین)`,
        userPhoneMasked: (chosen.userPhone || '09171234567').replace(/(\d{4})\d{3}(\d{4})/, '$1***$2'),
        prizeTitle: targetWinner.prizeTitle,
        prizeTier: targetWinner.prizeTier,
        ticketCode: chosen.lotteryTicketNumber || `PK-REP-${Date.now().toString().slice(-4)}`,
        cityId: chosen.cityId,
        cityName: chosen.cityName,
        awardedAt: nowStr,
        status: 'replaced',
        isAbsent: false,
        replacementForWinnerId: targetWinner.id
      };
    }

    updatedAbsentWinner.replacedByWinnerId = newReplacementWinner.id;

    // 3. Update winners list state (absent winner stays recorded in history, replacement is added)
    const updatedList = [
      newReplacementWinner,
      ...winnersList.map((w) => (w.id === targetWinner.id ? updatedAbsentWinner : w))
    ];

    if (onUpdateWinnersList) {
      onUpdateWinnersList(updatedList);
    } else {
      onAddWinner(newReplacementWinner);
    }

    setRecentWinner(newReplacementWinner);
    setAbsentActionNotice(`برنده قبلی (${targetWinner.winnerName}) با وضعیت «غایب» ثبت شد و برنده جایگزین (${newReplacementWinner.winnerName}) به‌صورت تصادفی انتخاب گردید.`);
    setTimeout(() => setAbsentActionNotice(null), 5000);

    logAppEvent({
      eventType: 'lottery_winner_drawn',
      actorId: 'admin-01',
      actorRole: 'admin',
      actorName: 'مدیریت ارشد پاکینو',
      entityId: newReplacementWinner.id,
      entityType: 'lottery',
      cityId: newReplacementWinner.cityId,
      cityName: newReplacementWinner.cityName,
      details: {
        isReplacement: true,
        absentWinnerId: targetWinner.id,
        absentWinnerName: targetWinner.winnerName,
        replacementWinnerName: newReplacementWinner.winnerName,
        prizeTitle: newReplacementWinner.prizeTitle
      }
    });

    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 }
    });
  };

  // Filtered Winners for Tab 4
  const filteredWinners = winnersList.filter((w) => {
    if (winnerFilterStatus === 'all') return true;
    if (winnerFilterStatus === 'absent') return w.isAbsent || w.status === 'absent';
    if (winnerFilterStatus === 'replaced') return w.status === 'replaced';
    if (winnerFilterStatus === 'claimed') return !w.isAbsent && w.status !== 'absent';
    return true;
  });

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Action Toast Notice */}
      {absentActionNotice && (
        <div className="p-3.5 bg-amber-50 border border-amber-300 text-amber-950 rounded-2xl text-xs font-bold flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-amber-600" />
            <span>{absentActionNotice}</span>
          </div>
          <button onClick={() => setAbsentActionNotice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

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
          <span>قرعه‌کشی دوره‌ای</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('live_event')}
          className={`flex-1 min-w-[140px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'live_event' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-600" />
          <span>قرعه‌کشی حضوری ({toPersianDigits(allLiveEvents.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('draw_wheel')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'draw_wheel' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-500 animate-bounce" />
          <span>گردونه قرعه‌کشی</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('winners')}
          className={`flex-1 min-w-[130px] py-2.5 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'winners' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-600" />
          <span>اسامی برندگان ({toPersianDigits(winnersList.length)})</span>
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
                        <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          {lottery.periodCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        تاریخ برگزاری: <strong>{lottery.targetDrawDateStr}</strong> ({toPersianDigits(lottery.countdownDays)} روز مانده)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(lottery)}
                      className="p-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 transition"
                      title="ویرایش دوره و جوایز"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLottery(lottery.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                      title="حذف دوره"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Prizes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {lottery.prizes.map((p) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1 text-xs">
                      <div className="flex items-center justify-between font-black">
                        <span className="flex items-center gap-1.5 text-slate-800">
                          <span>{p.iconEmoji}</span>
                          <span>{p.rankTitle}</span>
                        </span>
                        <span className="text-[10px] bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full font-mono">
                          {toPersianDigits(p.winnersCount)} برنده
                        </span>
                      </div>
                      <div className="text-slate-600 font-medium text-[11px] truncate">{p.prizeName}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB TAB 2: MULTIPLE LIVE EVENT CODES (Item 3) */}
      {activeSubTab === 'live_event' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 font-black shrink-0">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-slate-900">
                    مدیریت کدهای قرعه‌کشی هم‌زمان (ماده ۳)
                  </h3>
                  <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full">
                    بازه تاریخ و ساعت مستقل
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  تعریف هم‌زمان چند کد رویداد (جشن روز پدر، همایش محیط‌زیستی، پویش‌های مناسبتی) هرکدام با ساعت و تاریخ مجزا
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateEvent}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>تعریف کد رویداد جدید</span>
            </button>
          </div>

          {/* List of Concurrent Event Codes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {allLiveEvents.map((ev) => {
              const isSelectedForDraw = selectedLiveEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  className={`bg-white rounded-3xl p-5 border transition space-y-3.5 relative overflow-hidden ${
                    isSelectedForDraw ? 'border-rose-400 ring-2 ring-rose-200 shadow-md' : 'border-slate-200 shadow-2xs hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-xs">
                        <span className="text-[9px] uppercase">کد</span>
                        <span className="text-base font-mono leading-none">{ev.eventCode}</span>
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-slate-900">{ev.eventTitle}</h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Clock className="w-3.5 h-3.5 text-rose-500" />
                          <span>{ev.startDate || '۱۴۰۵/۰۷/۰۱'} ({toPersianDigits(ev.startTime || '۰۹:۰۰')} الی {toPersianDigits(ev.endTime || '۲۱:۰۰')})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditEvent(ev)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                        title="ویرایش رویداد"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEventCode(ev.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                        title="حذف رویداد"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {ev.description}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 flex-wrap gap-2">
                    <span className="font-bold text-rose-800 text-[11px]">
                      🎁 جوایز: {ev.prizeSummary}
                    </span>
                    <span className="font-mono font-black text-slate-600 text-[11px] bg-slate-100 px-2.5 py-1 rounded-lg">
                      {toPersianDigits(ev.participantsCount || ev.registeredPhoneNumbers?.length || 0)} شرکت‌کننده
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLiveEventId(ev.id);
                      setDrawMode('live_event');
                      setActiveSubTab('draw_wheel');
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                      isSelectedForDraw
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    }`}
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    <span>انتخاب برای گردونه قرعه‌کشی زنده این کد</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick On-Site Manual Attendee Entry */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
            <h4 className="font-black text-xs text-slate-800 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>ثبت‌نام دستی شرکت‌کننده در سالن مراسم برای کد «{activeSelectedLiveEvent?.eventCode}»:</span>
            </h4>
            <form onSubmit={handleAddOnSiteAttendee} className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <input
                type="text"
                value={onSiteAttendeeName}
                onChange={(e) => setOnSiteAttendeeName(e.target.value)}
                placeholder="نام شرکت‌کننده (اختیاری)"
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              />
              <input
                type="tel"
                value={onSiteAttendeePhone}
                onChange={(e) => setOnSiteAttendeePhone(e.target.value)}
                placeholder="شماره موبایل: 0917..."
                className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-left"
                required
              />
              <button
                type="submit"
                className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>افزودن به گردونه</span>
              </button>
            </form>
            {onSiteAttendeeNotice && (
              <p className="text-xs text-emerald-600 font-bold">✅ شرکت‌کننده با موفقیت به گردونه اضافه گردید.</p>
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 3: LIVE DRAW WHEEL & ABSENT REDRAW */}
      {activeSubTab === 'draw_wheel' && (
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span>گردونه هوشمند استخراج تصادفی برندگان و جایگزینی غایبین</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                الگوریتم تصادفی با قابلیت استخراج برنده جدید در صورت غیبت برنده قبلی
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setDrawMode('scheduled_tickets')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  drawMode === 'scheduled_tickets' ? 'bg-white text-indigo-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                قرعه‌کشی ادواری
              </button>
              <button
                type="button"
                onClick={() => setDrawMode('live_event')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  drawMode === 'live_event' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                کد جشن حضوری ({activeSelectedLiveEvent?.eventCode})
              </button>
            </div>
          </div>

          {/* Controls for Live Event On-Site Mode */}
          {drawMode === 'live_event' && (
            <div className="space-y-3 bg-gradient-to-r from-rose-50/70 via-amber-50/70 to-rose-50/70 p-4 rounded-2xl border border-rose-200 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-sm">
                    {activeSelectedLiveEvent?.eventCode}
                  </div>
                  <div>
                    <h4 className="font-black text-xs text-slate-900">{activeSelectedLiveEvent?.eventTitle}</h4>
                    <p className="text-[11px] text-slate-600">قرعه‌کشی زنده بین تمام کسانی که کد {activeSelectedLiveEvent?.eventCode} را ثبت کرده‌اند</p>
                  </div>
                </div>

                <div className="text-left">
                  <span className="text-xs font-black text-rose-800 bg-white px-3 py-1 rounded-xl border border-rose-200 font-mono">
                    {toPersianDigits(registeredEventAttendees.length)} شرکت‌کننده واجد شرایط
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
                  <option value="نیم سکه بهار آزادی (جایزه ویژه جشن)">🥇 نیم سکه بهار آزادی (جایزه ویژه جشن)</option>
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
                ? `اجرای قرعه‌کشی زنده برای کد «${activeSelectedLiveEvent?.eventCode}»`
                : 'اجرای قرعه‌کشی زنده ادواری و استخراج برنده'}
            </span>
          </button>

          {/* Winner Card with ABSENT REDRAW BUTTON (Item 3) */}
          {recentWinner && (
            <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-3xl border-2 border-amber-400 text-center space-y-3.5 animate-in zoom-in-95 shadow-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-white flex items-center justify-center mx-auto text-2xl shadow-lg animate-bounce">
                🏆
              </div>

              <div className="space-y-1">
                <span className={`text-[11px] font-black px-3 py-0.5 rounded-full ${recentWinner.status === 'replaced' ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                  {recentWinner.status === 'replaced' ? 'برنده جایگزین تاییدشده' : recentWinner.drawPeriod}
                </span>
                <div className="text-xl sm:text-2xl font-black text-amber-950 mt-1">
                  🎉 برنده خوش‌شانس: {recentWinner.winnerName} ({recentWinner.cityName})
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-amber-200 max-w-md mx-auto space-y-1.5 text-xs">
                <div className="text-amber-900 font-bold">
                  جایزه اهداشده: <span className="font-black text-emerald-800">{recentWinner.prizeTitle}</span>
                </div>
                <div className="text-slate-600">
                  شماره تماس برنده: <span className="font-mono font-bold">{recentWinner.userPhoneMasked}</span> • کد شانس: <span className="font-mono font-black text-indigo-700">{recentWinner.ticketCode}</span>
                </div>
              </div>

              {/* ITEM 3: Absent Winner Action Button */}
              {recentWinner.status !== 'absent' && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => handleMarkWinnerAbsentAndRedraw(recentWinner)}
                    className="w-full sm:w-auto px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserX className="w-4 h-4" />
                    <span>برنده غایب است؛ ثبت غیبت و قرعه‌کشی مجدد</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SUB TAB 4: PUBLISHED WINNERS WITH ABSENT BADGES (Item 3) */}
      {activeSubTab === 'winners' && (
        <div className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-800">تالار برندگان و سوابق استخراج (شفافیت ۱۰۰٪)</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">شامل برندگان تاییدشده و افراد غایب با ثبت علت و برنده جایگزین</p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setWinnerFilterStatus('all')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  winnerFilterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                همه ({toPersianDigits(winnersList.length)})
              </button>
              <button
                type="button"
                onClick={() => setWinnerFilterStatus('claimed')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  winnerFilterStatus === 'claimed' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                تاییدشده ({toPersianDigits(winnersList.filter(w => !w.isAbsent && w.status !== 'absent').length)})
              </button>
              <button
                type="button"
                onClick={() => setWinnerFilterStatus('absent')}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                  winnerFilterStatus === 'absent' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600'
                }`}
              >
                غایبین ({toPersianDigits(winnersList.filter(w => w.isAbsent || w.status === 'absent').length)})
              </button>
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredWinners.map((w) => {
              const isAbsent = w.isAbsent || w.status === 'absent';
              const isReplaced = w.status === 'replaced';
              return (
                <div 
                  key={w.id} 
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition ${
                    isAbsent ? 'bg-rose-50/50 border-rose-200' : isReplaced ? 'bg-emerald-50/40 border-emerald-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="text-2xl shrink-0">
                      {isAbsent ? '❌' : w.prizeTier === 'first' ? '🥇' : w.prizeTier === 'second' ? '🥈' : w.prizeTier === 'special' ? '🎪' : '🥉'}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900">{w.winnerName}</span>
                        <span className="text-[10px] text-slate-500">({w.cityName})</span>
                        {isAbsent && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full border border-rose-300">
                            غایب - جایگزین شد
                          </span>
                        )}
                        {isReplaced && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                            برنده جایگزین
                          </span>
                        )}
                      </div>
                      <div className="text-slate-600 text-[11px] mt-0.5">
                        {w.prizeTitle} • {w.drawPeriod}
                      </div>
                      {isAbsent && w.absentReason && (
                        <div className="text-[10px] text-rose-700 mt-1 font-bold">
                          علت ثبت غیبت: {w.absentReason} ({w.absentMarkedAt || ''})
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <div className="font-mono text-slate-700 font-bold bg-white px-2.5 py-1 rounded-xl border border-slate-200 text-[11px]">
                      {w.ticketCode}
                    </div>
                    {!isAbsent && (
                      <button
                        type="button"
                        onClick={() => handleMarkWinnerAbsentAndRedraw(w)}
                        className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-bold border border-rose-200 transition cursor-pointer flex items-center gap-1"
                        title="ثبت غیبت این برنده و قرعه‌کشی مجدد جایگزین"
                      >
                        <UserX className="w-3 h-3" />
                        <span>ثبت غیبت</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT LIVE EVENT CODE (Item 3) */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                {editingEvent ? 'ویرایش کد و بازه زمانی رویداد' : 'تعریف کد قرعه‌کشی هم‌زمان جدید (ماده ۳)'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEventModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEventCode} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">عنوان رویداد یا مراسم:</label>
                  <input
                    type="text"
                    value={eventFormTitle}
                    onChange={(e) => setEventFormTitle(e.target.value)}
                    placeholder="مثال: همایش پاکسازی پاییزی زاگرس"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">کد رویداد (رمز تایید):</label>
                  <input
                    type="text"
                    value={eventFormCode}
                    onChange={(e) => setEventFormCode(e.target.value.toUpperCase())}
                    placeholder="110 یا 724"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-black text-center"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">توضیحات و راهنمای شرکت در سالن:</label>
                <textarea
                  rows={2}
                  value={eventFormDescription}
                  onChange={(e) => setEventFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">خلاصه جوایز این کد رویداد:</label>
                <input
                  type="text"
                  value={eventFormPrizeSummary}
                  onChange={(e) => setEventFormPrizeSummary(e.target.value)}
                  placeholder="مثال: ۵ عدد نیم سکه بهار آزادی + ۱۰ کارت هدیه"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-rose-900"
                  required
                />
              </div>

              {/* Independent Date & Hour Range (Item 3) */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>بازه تاریخ و ساعت شروع / پایان مستقل (ماده ۳):</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">تاریخ شروع:</label>
                    <input
                      type="text"
                      value={eventFormStartDate}
                      onChange={(e) => setEventFormStartDate(e.target.value)}
                      placeholder="1405-07-01"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ساعت شروع:</label>
                    <input
                      type="time"
                      value={eventFormStartTime}
                      onChange={(e) => setEventFormStartTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">تاریخ پایان:</label>
                    <input
                      type="text"
                      value={eventFormEndDate}
                      onChange={(e) => setEventFormEndDate(e.target.value)}
                      placeholder="1405-07-30"
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-600 block mb-1">ساعت پایان:</label>
                    <input
                      type="time"
                      value={eventFormEndTime}
                      onChange={(e) => setEventFormEndTime(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-center"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  ذخیره کد رویداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT SCHEDULED LOTTERY */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-sm text-slate-900">
                {editingLottery ? 'ویرایش مشخصات و جوایز قرعه‌کشی' : 'تعریف دوره جدید قرعه‌کشی زمان‌بندی‌شده'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
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
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
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

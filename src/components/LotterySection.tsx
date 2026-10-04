import React, { useState } from 'react';
import { 
  Gift, 
  Sparkles, 
  Trophy, 
  Award, 
  Ticket, 
  HeartHandshake, 
  CheckCircle2, 
  Flame, 
  Send, 
  Clock,
  History,
  X,
  UserX,
  Calendar,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CityId, UserProfile, PickupRequest, LotteryWinner, LiveEventLottery, ScheduledLottery } from '../types';
import { CITIES, PAST_LOTTERY_WINNERS, INITIAL_LIVE_LOTTERIES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

interface LotterySectionProps {
  currentCity: CityId;
  user: UserProfile;
  requests: PickupRequest[];
  onOpenNewPickup: () => void;
  onClose?: () => void;
  scheduledLottery?: ScheduledLottery;
  liveEventLottery?: LiveEventLottery;
  liveEventLotteries?: LiveEventLottery[];
  winnersList?: LotteryWinner[];
  ticketResetAnnouncement?: string;
  onRegisterEventCode?: (code: string) => boolean;
}

export const LotterySection: React.FC<LotterySectionProps> = ({
  currentCity,
  user,
  requests,
  onOpenNewPickup,
  onClose,
  scheduledLottery,
  liveEventLottery,
  liveEventLotteries: propLiveEvents,
  winnersList = PAST_LOTTERY_WINNERS,
  ticketResetAnnouncement,
  onRegisterEventCode
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;
  const allEvents = propLiveEvents && propLiveEvents.length > 0 ? propLiveEvents : INITIAL_LIVE_LOTTERIES;

  const [activeTab, setActiveTab] = useState<'tickets' | 'live_event' | 'winners'>('tickets');
  const [selectedEventId, setSelectedEventId] = useState<string>(allEvents[0]?.id || 'live-event-110');
  const activeSelectedEvent = allEvents.find(e => e.id === selectedEventId) || allEvents[0];

  const [eventCodeInput, setEventCodeInput] = useState('');
  const [eventRegisteredSuccess, setEventRegisteredSuccess] = useState(false);
  const [eventErrorMessage, setEventErrorMessage] = useState('');
  const [successEventTitle, setSuccessEventTitle] = useState('');

  // Calculate ticket counts based on weight rule: 1kg cash = 1 ticket, 1kg charity = 2 tickets
  const calculatedTickets = requests.map((r) => {
    const weight = r.actualKg || r.estimatedKg || 5;
    const multiplier = r.type === 'charity' ? 2 : 1;
    const ticketCount = Math.max(1, Math.round(weight * multiplier));
    return {
      code: r.lotteryTicketNumber,
      date: r.dateStr,
      type: r.type,
      weight,
      ticketCount,
      status: r.status
    };
  });

  const totalCalculatedTickets = calculatedTickets.reduce((sum, t) => sum + t.ticketCount, 0);

  // Handle Event Code submission (Item 3: امکان شرکت در چند کد رویداد هم‌زمان)
  const handleRegisterEventCode = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = eventCodeInput.trim().toUpperCase();
    if (!cleanCode) {
      setEventErrorMessage('لطفاً کد رویداد را وارد نمایید');
      return;
    }

    const matchedEvent = allEvents.find(ev => ev.eventCode.toUpperCase() === cleanCode);

    if (matchedEvent) {
      if (onRegisterEventCode) {
        onRegisterEventCode(cleanCode);
      }
      setSuccessEventTitle(matchedEvent.eventTitle);
      setEventRegisteredSuccess(true);
      setEventErrorMessage('');
      confetti({
        particleCount: 70,
        spread: 75,
        origin: { y: 0.6 }
      });
    } else {
      setEventErrorMessage('کد رویداد وارد شده صحیح نمی‌باشد. لطفاً کدهای فعال در فهرست پایین را بررسی نمایید.');
    }
  };

  const handleQuickRegister = (event: LiveEventLottery) => {
    if (onRegisterEventCode) {
      onRegisterEventCode(event.eventCode);
    }
    setSuccessEventTitle(event.eventTitle);
    setEventRegisteredSuccess(true);
    confetti({
      particleCount: 70,
      spread: 75,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Ticket Reset Notice Banner if active */}
      {ticketResetAnnouncement && (
        <div className="p-3.5 bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-amber-500/15 border border-amber-300 rounded-2xl text-xs text-amber-950 flex items-center gap-2.5 shadow-2xs animate-in slide-in-from-top-2">
          <span className="text-base">📢</span>
          <div>
            <strong>اطلاعیه دوره جدید قرعه‌کشی:</strong> {ticketResetAnnouncement}
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white p-5 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shrink-0">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-100 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  {scheduledLottery ? scheduledLottery.title : 'قرعه‌کشی و گردونه جوایز طلایی پاکینو'}
                </h2>
                <span className="text-[10px] bg-white text-amber-950 font-black px-2 py-0.5 rounded-full">
                  {city.name}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-1">
                {scheduledLottery ? `تاریخ برگزاری: ${scheduledLottery.targetDrawDateStr} (${toPersianDigits(scheduledLottery.countdownDays)} روز مانده)` : 'هر کیلو بازیافت عادی = ۱ شانس • هر کیلو نیکوکاری = ۲ شانس'}
              </p>
            </div>
          </div>

          <div className="bg-white/15 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/25 text-center self-start sm:self-auto">
            <div className="text-[11px] text-amber-100 font-medium">مجموع شانس‌های فعال شما:</div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono mt-0.5">
              {toPersianDigits(totalCalculatedTickets)} <span className="text-xs font-sans font-bold">شانس قرعه‌کشی</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl gap-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('tickets')}
          className={`flex-1 py-2 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'tickets' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Ticket className="w-4 h-4 text-amber-600" />
          <span>کدهای شانس من ({toPersianDigits(calculatedTickets.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('live_event')}
          className={`flex-1 py-2 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'live_event' ? 'bg-white text-rose-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
          <span>قرعه‌کشی حضوری ({toPersianDigits(allEvents.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('winners')}
          className={`flex-1 py-2 rounded-xl font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'winners' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-emerald-600" />
          <span>تالار برندگان ({toPersianDigits(winnersList.length)})</span>
        </button>
      </div>

      {/* TAB 1: TICKETS & DYNAMIC PRIZES */}
      {activeTab === 'tickets' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Dynamic Prizes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {scheduledLottery ? (
              scheduledLottery.prizes.slice(0, 3).map((p) => (
                <div key={p.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-black shrink-0">
                    {p.iconEmoji}
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">{p.rankTitle}: {p.prizeName}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{toPersianDigits(p.winnersCount)} برنده خوش‌شانس</div>
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-black shrink-0">
                    🥇
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">جایزه اول: ربع سکه بهار آزادی</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">۱ برنده طلایی هر دوره</div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center text-lg font-black shrink-0">
                    🥈
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">جایزه دوم: ۳ کارت هدیه ۵ میلیونی</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">۳ برنده از بین فعالان</div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center text-lg font-black shrink-0">
                    🥉
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-900">جایزه سوم: ۱۰ دستگاه خردکن برقی</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">۱۰ برنده ویژه نیکوکاری</div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User's tickets list */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-emerald-600" />
                <span>کدهای قرعه‌کشی فعال شما:</span>
              </span>
              <span className="text-[11px] text-slate-500 font-bold">
                {toPersianDigits(calculatedTickets.length)} سفارش ثبت شده
              </span>
            </div>

            {calculatedTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-2xl space-y-2">
                <p>هنوز کد قرعه‌کشی ثبت نکرده‌اید.</p>
                <p className="text-[11px] text-slate-400">
                  با تحویل پسماند خشک یا ثبت کد جشن حضوری، کدهای شانس شما فوراً فعال می‌شوند.
                </p>
                <button
                  type="button"
                  onClick={onOpenNewPickup}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>ثبت بازیافت و دریافت کد شانس</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {calculatedTickets.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-mono font-black text-emerald-800 text-sm tracking-widest">{t.code}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{toPersianDigits(t.date)}</div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-1">
                      <span className="text-[11px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-200">
                        {toPersianDigits(t.ticketCount)} شانس ({toPersianDigits(t.weight)} کیلو)
                      </span>
                      {t.type === 'charity' && (
                        <span className="text-[9px] text-rose-600 font-bold flex items-center gap-1">
                          <HeartHandshake className="w-3 h-3" />
                          <span>ضریب ۲ برابری خیریه</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE EVENT ON-SITE LOTTERIES (Item 3: چند کد هم‌زمان با ساعت و تاریخ مستقل) */}
      {activeTab === 'live_event' && (
        <div className="space-y-4 animate-in fade-in">
          {/* List of active concurrent events */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allEvents.map((ev) => {
              const isSelected = selectedEventId === ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEventId(ev.id)}
                  className={`p-4 rounded-3xl border transition cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-rose-50 to-amber-50 border-rose-300 ring-2 ring-rose-200 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-rose-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-mono font-black text-xs shadow-xs">
                      کد: {ev.eventCode}
                    </span>
                    <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3 text-rose-600" />
                      <span>{ev.startDate}</span>
                    </span>
                  </div>

                  <h3 className="font-black text-xs sm:text-sm text-slate-900">{ev.eventTitle}</h3>
                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{ev.description}</p>
                  
                  <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-rose-800">
                    <span>🎁 {ev.prizeSummary}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickRegister(ev);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[10px] font-black transition"
                    >
                      ثبت سریع
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form to submit code */}
          <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            {eventRegisteredSuccess ? (
              <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="font-black text-sm text-emerald-900">
                  ثبت‌نام شما در «{successEventTitle || activeSelectedEvent?.eventTitle}» با موفقیت انجام شد!
                </h4>
                <p className="text-xs text-emerald-700">
                  کد اختصاصی شما در گردونه شانس رویداد حضوری فعال گردید و در قرعه‌کشی زنده شرکت داده خواهید شد.
                </p>
                <button
                  type="button"
                  onClick={() => setEventRegisteredSuccess(false)}
                  className="mt-2 text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                >
                  ثبت کد رویداد دیگر
                </button>
              </div>
            ) : (
              <form onSubmit={handleRegisterEventCode} className="space-y-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1.5">
                    کد اعلام‌شده در همایش یا مراسم (مثلاً: {allEvents.map(e => e.eventCode).join(' یا ')}):
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={eventCodeInput}
                      onChange={(e) => {
                        setEventCodeInput(e.target.value);
                        setEventErrorMessage('');
                      }}
                      placeholder="کد اعلامی توسط مجری در سالن..."
                      className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-2xl text-base font-mono font-black text-center text-slate-900 focus:bg-white focus:border-rose-500 outline-hidden"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>ثبت در گردونه</span>
                    </button>
                  </div>
                  {eventErrorMessage && (
                    <p className="text-xs text-rose-600 font-bold mt-1.5">{eventErrorMessage}</p>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-50 p-3 rounded-xl">
                  💡 نکته: این بخش ویژه گردهمایی‌های حضوری، مراسم جشن روز پدر، اعیاد ملی و پاکسازی‌های دسته‌جمعی است و نیازی به تحویل بازیافت ندارد.
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PAST WINNERS SHOWCASE WITH ABSENT STATUS (Item 3) */}
      {activeTab === 'winners' && (
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>تالار افتخارات و برندگان دوره‌های قبل پاکینو</span>
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              شفافیت ۱۰۰٪
            </span>
          </div>

          <div className="space-y-2.5">
            {winnersList.map((winner) => {
              const isAbsent = winner.isAbsent || winner.status === 'absent';
              const isReplaced = winner.status === 'replaced';
              return (
                <div
                  key={winner.id}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between gap-2 transition ${
                    isAbsent 
                      ? 'bg-rose-50/50 border-rose-200' 
                      : isReplaced 
                      ? 'bg-emerald-50/40 border-emerald-200' 
                      : 'bg-gradient-to-r from-slate-50 to-amber-50/40 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-black shrink-0">
                      {isAbsent ? '❌' : winner.prizeTier === 'first' ? '🥇' : winner.prizeTier === 'second' ? '🥈' : '🥉'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-xs text-slate-900">{winner.winnerName}</span>
                        <span className="text-[10px] text-slate-500">({winner.cityName})</span>
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
                      <div className="text-[11px] text-amber-800 font-bold mt-0.5">
                        {winner.prizeTitle}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        کد برنده: {winner.ticketCode} • {winner.userPhoneMasked}
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <span className="text-[10px] bg-white text-slate-600 px-2 py-1 rounded-xl border border-slate-200 font-medium">
                      {winner.drawPeriod}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

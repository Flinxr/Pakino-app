import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Vote, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Edit3, 
  BarChart2, 
  User, 
  Phone, 
  MapPin, 
  Check, 
  RotateCcw,
  Sparkles,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { CitizenPoll, FeedbackItem, CityId, TicketMessage } from '../../types';
import { CITIES, INITIAL_POLLS, INITIAL_FEEDBACK_ITEMS } from '../../data/cities';
import { toPersianDigits } from '../../utils/persian';
import { logAppEvent } from '../../utils/eventLogger';

interface AdminFeedbackPollsManagerProps {
  currentCity: CityId;
}

export const AdminFeedbackPollsManager: React.FC<AdminFeedbackPollsManagerProps> = ({
  currentCity
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'polls'>('tickets');

  // Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>(() => {
    const saved = localStorage.getItem('pakino_feedback_items');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_FEEDBACK_ITEMS;
  });

  // Polls State
  const [pollsList, setPollsList] = useState<CitizenPoll[]>(() => {
    const saved = localStorage.getItem('pakino_citizen_polls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return INITIAL_POLLS;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'received' | 'answered'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [replyingItem, setReplyingItem] = useState<FeedbackItem | null>(null);
  const [replyText, setReplyText] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Poll modal
  const [isPollModalOpen, setIsPollModalOpen] = useState(false);
  const [pollTitle, setPollTitle] = useState('');
  const [pollDescription, setPollDescription] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['بسیار راضی', 'متوسط', 'نیاز به بهبود']);

  const showNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const saveFeedbacks = (items: FeedbackItem[]) => {
    setFeedbackList(items);
    localStorage.setItem('pakino_feedback_items', JSON.stringify(items));
  };

  const savePolls = (polls: CitizenPoll[]) => {
    setPollsList(polls);
    localStorage.setItem('pakino_citizen_polls', JSON.stringify(polls));
  };

  // Filtered tickets
  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (item.userName || '').toLowerCase().includes(q);
        const matchPhone = (item.userPhone || '').includes(q);
        const matchMsg = (item.message || '').toLowerCase().includes(q);
        const matchReply = (item.adminReply || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchMsg && !matchReply) return false;
      }
      return true;
    });
  }, [feedbackList, statusFilter, categoryFilter, searchQuery]);

  // Reply to ticket
  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingItem || !replyText.trim()) return;

    const newAdminMsg: TicketMessage = {
      id: `msg-adm-${Date.now()}`,
      sender: 'admin',
      senderName: 'مدیریت ارشد پاکینو',
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    const existingMessages: TicketMessage[] = replyingItem.messages && replyingItem.messages.length > 0
      ? replyingItem.messages
      : [
          {
            id: `msg-orig-${replyingItem.id}`,
            sender: 'citizen',
            senderName: replyingItem.userName,
            text: replyingItem.message,
            createdAt: replyingItem.createdAt
          }
        ];

    const updated = feedbackList.map((f) =>
      f.id === replyingItem.id
        ? {
            ...f,
            status: 'answered' as const,
            adminReply: replyText.trim(),
            repliedAt: new Date().toISOString(),
            repliedBy: 'مدیریت پاکینو',
            messages: [...existingMessages, newAdminMsg]
          }
        : f
    );
    saveFeedbacks(updated);

    showNotice(`پاسخ به تیکت «${replyingItem.userName}» با موفقیت ثبت گردید.`);
    setReplyingItem(null);
    setReplyText('');
  };

  // Delete feedback
  const handleDeleteFeedback = (id: string) => {
    const updated = feedbackList.filter((f) => f.id !== id);
    saveFeedbacks(updated);
    showNotice('پیام با موفقیت حذف شد.');
  };

  // Create new Poll
  const handleSavePoll = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pollTitle.trim()) return;

    const newPoll: CitizenPoll = {
      id: `poll-${Date.now()}`,
      title: pollTitle.trim(),
      description: pollDescription.trim(),
      cityId: 'all',
      isActive: true,
      startDate: '1405-07-01',
      endDate: '1405-08-30',
      totalVotes: 0,
      options: pollOptions.filter(o => o.trim()).map((text, idx) => ({
        id: `opt-${Date.now()}-${idx}`,
        text: text.trim(),
        votesCount: 0
      }))
    };

    savePolls([newPoll, ...pollsList]);
    setIsPollModalOpen(false);
    setPollTitle('');
    setPollDescription('');
    setPollOptions(['گزینه اول', 'گزینه دوم', 'گزینه سوم']);
    showNotice('نظرسنجی جدید با موفقیت منتشر گردید.');
  };

  // Delete Poll
  const handleDeletePoll = (id: string) => {
    const updated = pollsList.filter((p) => p.id !== id);
    savePolls(updated);
    showNotice('نظرسنجی با موفقیت حذف شد.');
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'suggestion': return 'پیشنهاد سازنده';
      case 'complaint': return 'گزارش / انتقاد';
      case 'question': return 'سوال و راهنمایی';
      case 'driver_tip': return 'تقدیر از سفیر';
      default: return 'عمومی';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Toast Notice */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-black flex items-center justify-between shadow-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-700 shrink-0">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-black text-sm sm:text-base text-slate-900">
              سامانه نظرسنجی و مدیریت تیکت‌های پشتیبانی شهروندان (ماده ۱۳)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              رسیدگی و پاسخ‌دهی به پیام‌های شهروندی، نظرسنجی‌های رضایت‌سنجی و پایش برخط آرا
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'tickets' ? 'bg-white text-violet-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>پیام‌ها و تیکت‌ها ({toPersianDigits(feedbackList.length)})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('polls')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'polls' ? 'bg-white text-violet-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>نظرسنجی‌ها ({toPersianDigits(pollsList.length)})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: SUPPORT TICKETS & CITIZEN FEEDBACK */}
      {activeTab === 'tickets' && (
        <div className="space-y-3.5">
          {/* Filters Bar */}
          <div className="bg-slate-100/80 p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="جستجو در پیام‌ها، نام شهروند، شماره یا پاسخ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pr-8 pl-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="all">همه وضعیت‌ها</option>
                <option value="received">در انتظار پاسخ</option>
                <option value="answered">پاسخ داده شده</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
              >
                <option value="all">همه موضوعات</option>
                <option value="suggestion">پیشنهاد</option>
                <option value="complaint">انتقاد / گزارش</option>
                <option value="question">سوال</option>
                <option value="driver_tip">تقدیر از سفیر</option>
              </select>
            </div>

            <span className="text-[11px] font-bold text-slate-500">
              {toPersianDigits(filteredFeedback.length)} پیام
            </span>
          </div>

          {/* Tickets List */}
          <div className="space-y-3">
            {filteredFeedback.map((fb) => (
              <div
                key={fb.id}
                className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs space-y-3 hover:border-violet-200 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs sm:text-sm text-slate-900">{fb.userName}</span>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{fb.userPhone}</span>
                    <span className="text-[10px] bg-violet-100 text-violet-800 font-bold px-2 py-0.5 rounded-full">
                      {getCategoryLabel(fb.category)}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fb.status === 'answered' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fb.status === 'answered' ? 'پاسخ داده شده' : 'در انتظار بررسی'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingItem(fb);
                        setReplyText(fb.adminReply || '');
                      }}
                      className="px-3 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>{fb.adminReply ? 'ویرایش پاسخ' : 'پاسخ به تیکت'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeedback(fb.id)}
                      className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                      title="حذف پیام"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100 font-medium">
                  {fb.message}
                </p>

                {fb.adminReply && (
                  <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-emerald-800 font-bold">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>پاسخ رسمی مدیریت پاکینو:</span>
                      </span>
                      <span>{fb.repliedBy || 'واحد پشتیبانی'}</span>
                    </div>
                    <p className="text-emerald-950 font-medium leading-relaxed">{fb.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CITIZEN POLLS MANAGER */}
      {activeTab === 'polls' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
            <div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900">نظرسنجی‌های فعال و نتایج آماری زنده</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">شهروندان در صفحه اصلی و پنجره پشتیبانی می‌توانند در این نظرسنجی‌ها شرکت کنند</p>
            </div>

            <button
              type="button"
              onClick={() => setIsPollModalOpen(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>ایجاد نظرسنجی جدید</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {pollsList.map((poll) => (
              <div
                key={poll.id}
                className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3.5"
              >
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5">
                  <div>
                    <h4 className="font-black text-sm text-slate-900">{poll.title}</h4>
                    {poll.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{poll.description}</p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeletePoll(poll.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                    title="حذف نظرسنجی"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2">
                  {poll.options.map((opt) => {
                    const percent = poll.totalVotes > 0 ? Math.round((opt.votesCount / poll.totalVotes) * 100) : 0;
                    return (
                      <div key={opt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-slate-800 text-[11px]">{opt.text}</span>
                          <span className="text-violet-900 font-mono font-black text-[11px]">{toPersianDigits(percent)}٪ ({toPersianDigits(opt.votesCount)})</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                  <span>مجموع آرا: <strong>{toPersianDigits(poll.totalVotes)} رای</strong></span>
                  <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">فعال در اپلیکیشن</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: REPLY TO TICKET */}
      {replyingItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-sm text-slate-900">
                پاسخ به تیکت «{replyingItem.userName}»
              </h3>
              <button
                type="button"
                onClick={() => setReplyingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Thread messages if exist */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 max-h-48 overflow-y-auto">
              <span className="font-black text-slate-900 block border-b border-slate-200 pb-1">
                تاریخچه پیام‌های این تیکت:
              </span>
              {(() => {
                const threadMessages = replyingItem.messages && replyingItem.messages.length > 0
                  ? replyingItem.messages
                  : [
                      {
                        id: `msg-orig-${replyingItem.id}`,
                        sender: 'citizen',
                        senderName: replyingItem.userName,
                        text: replyingItem.message,
                        createdAt: replyingItem.createdAt
                      }
                    ];
                return threadMessages.map((m, idx) => (
                  <div 
                    key={m.id || idx}
                    className={`p-2 rounded-xl text-xs ${
                      m.sender === 'admin' 
                        ? 'bg-emerald-100 text-emerald-950 mr-4 border border-emerald-200' 
                        : 'bg-white text-slate-800 ml-4 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-0.5">
                      <span>{m.sender === 'admin' ? '🛡️ پاسخ مدیریت' : `👤 ${m.senderName || 'شهروند'}`}</span>
                      <span>{new Date(m.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed font-medium">{m.text}</p>
                  </div>
                ));
              })()}
            </div>

            <form onSubmit={handleSendReply} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  متن پاسخ رسمی به شهروند:
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="پاسخ، راهنمایی یا اقدام انجام شده را بنویسید..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-2xl text-xs leading-relaxed focus:bg-white"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReplyingItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  ثبت پاسخ رسمی
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW POLL */}
      {isPollModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="font-black text-sm text-slate-900">
                ایجاد نظرسنجی جدید برای شهروندان
              </h3>
              <button
                type="button"
                onClick={() => setIsPollModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePoll} className="space-y-3">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">عنوان سوال نظرسنجی:</label>
                <input
                  type="text"
                  value={pollTitle}
                  onChange={(e) => setPollTitle(e.target.value)}
                  placeholder="مثال: رضایت از ساعت شیفت‌های جمع‌آوری"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">توضیحات تکمیلی (اختیاری):</label>
                <input
                  type="text"
                  value={pollDescription}
                  onChange={(e) => setPollDescription(e.target.value)}
                  placeholder="توضیح کوتاه درباره هدف نظرسنجی..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-800">گزینه‌های پاسخ:</label>
                {pollOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 w-4">{toPersianDigits(idx + 1)}</span>
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPollOptions(pollOptions.map((o, i) => i === idx ? val : o));
                      }}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
                      placeholder={`گزینه ${idx + 1}`}
                      required
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setPollOptions(pollOptions.filter((_, i) => i !== idx))}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}

                {pollOptions.length < 6 && (
                  <button
                    type="button"
                    onClick={() => setPollOptions([...pollOptions, `گزینه جدید`])}
                    className="text-xs text-violet-700 font-bold hover:underline flex items-center gap-1 mt-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>افزودن گزینه دیگر</span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPollModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white font-black text-xs rounded-xl shadow-xs"
                >
                  انتشار نظرسنجی در اپ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

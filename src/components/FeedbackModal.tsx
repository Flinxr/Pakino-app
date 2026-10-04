import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  PhoneCall,
  Vote,
  FileText,
  Plus,
  Clock,
  User,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
  Headphones,
  AlertCircle
} from 'lucide-react';
import { CityId, FeedbackItem, TicketMessage } from '../types';
import { CITIES, FAQ_ITEMS, INITIAL_POLLS, INITIAL_FEEDBACK_ITEMS } from '../data/cities';
import { CitizenPollWidget } from './CitizenPollWidget';
import { toPersianDigits } from '../utils/persian';
import { logAppEvent } from '../utils/eventLogger';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityId;
  userName: string;
  userPhone: string;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  userName,
  userPhone
}) => {
  const [activeTab, setActiveTab] = useState<'tickets' | 'polls' | 'faq'>('tickets');
  const [viewMode, setViewMode] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // New Ticket Form State
  const [category, setCategory] = useState<'suggestion' | 'complaint' | 'question' | 'driver_tip' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [senderPhone, setSenderPhone] = useState(userPhone || '0917');
  
  // Follow-up Reply State
  const [replyText, setReplyText] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Tickets List State loaded from localStorage
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

  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Refresh list when modal opens
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem('pakino_feedback_items');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setFeedbackList(parsed);
          }
        } catch {}
      }
      setSenderName(userName || '');
      setSenderPhone(userPhone || '0917');
    }
  }, [isOpen, userName, userPhone]);

  if (!isOpen) return null;

  const city = CITIES[currentCity] || CITIES.noorabad;

  // Filter user's relevant tickets (or all tickets if phone matches / or local device)
  const userTickets = feedbackList.filter(
    (item) => item.cityId === currentCity || item.userPhone === userPhone || !userPhone
  );

  const activeTicket = selectedTicketId 
    ? feedbackList.find((t) => t.id === selectedTicketId) 
    : null;

  // Submit New Ticket
  const handleSubmitNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const ticketNum = `TK-${Math.floor(1000 + Math.random() * 9000)}`;
    const initialMessage: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'citizen',
      senderName: senderName || 'شهروند پاکینو',
      text: message.trim(),
      createdAt: new Date().toISOString()
    };

    const newFeedback: FeedbackItem = {
      id: `fb-${Date.now()}`,
      ticketNumber: ticketNum,
      userName: senderName || 'شهروند پاکینو',
      userPhone: senderPhone || '09170000000',
      cityId: currentCity,
      category,
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'received',
      messages: [initialMessage]
    };

    const updated = [newFeedback, ...feedbackList];
    setFeedbackList(updated);
    localStorage.setItem('pakino_feedback_items', JSON.stringify(updated));

    logAppEvent({
      eventType: 'citizen_feedback_submitted',
      actorId: userPhone || 'citizen-guest',
      actorRole: 'citizen',
      actorName: senderName || 'شهروند پاکینو',
      entityId: newFeedback.id,
      entityType: 'feedback',
      cityId: currentCity,
      cityName: city.name,
      details: {
        ticketNumber: ticketNum,
        category,
        messageSnippet: message.substring(0, 80)
      }
    });

    setMessage('');
    setSelectedTicketId(newFeedback.id);
    setViewMode('detail');
  };

  // Submit Follow-up message under active ticket
  const handleSendFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;

    setIsSubmittingReply(true);

    const newMsg: TicketMessage = {
      id: `msg-${Date.now()}`,
      sender: 'citizen',
      senderName: senderName || activeTicket.userName || 'شهروند',
      text: replyText.trim(),
      createdAt: new Date().toISOString()
    };

    const existingMessages: TicketMessage[] = activeTicket.messages && activeTicket.messages.length > 0
      ? activeTicket.messages
      : [
          {
            id: `msg-orig-${activeTicket.id}`,
            sender: 'citizen',
            senderName: activeTicket.userName,
            text: activeTicket.message,
            createdAt: activeTicket.createdAt
          },
          ...(activeTicket.adminReply ? [{
            id: `msg-reply-${activeTicket.id}`,
            sender: 'admin' as const,
            senderName: activeTicket.repliedBy || 'مدیریت ارشد پاکینو',
            text: activeTicket.adminReply,
            createdAt: activeTicket.repliedAt || activeTicket.createdAt
          }] : [])
        ];

    const updatedTicket: FeedbackItem = {
      ...activeTicket,
      status: 'received', // Re-opened for admin attention
      messages: [...existingMessages, newMsg]
    };

    const updatedList = feedbackList.map((t) => t.id === activeTicket.id ? updatedTicket : t);
    setFeedbackList(updatedList);
    localStorage.setItem('pakino_feedback_items', JSON.stringify(updatedList));

    logAppEvent({
      eventType: 'citizen_feedback_submitted',
      actorId: userPhone || 'citizen-guest',
      actorRole: 'citizen',
      actorName: senderName || activeTicket.userName,
      entityId: activeTicket.id,
      entityType: 'feedback',
      cityId: currentCity,
      cityName: city.name,
      details: {
        action: 'ticket_followup_message',
        ticketNumber: activeTicket.ticketNumber || activeTicket.id,
        messageSnippet: replyText.substring(0, 80)
      }
    });

    setReplyText('');
    setIsSubmittingReply(false);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case 'suggestion': return 'پیشنهاد سازنده';
      case 'complaint': return 'گزارش / انتقاد';
      case 'question': return 'سوال و راهنمایی';
      case 'driver_tip': return 'تقدیر از سفیر';
      default: return 'سایر پیام‌ها';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-4 sm:p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-base sm:text-lg font-black flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <span>مرکز پشتیبانی، تیکت‌ها و صدای شهروند (ماده ۱۳)</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            پیگیری مستقیم درخواست‌ها و تیکت‌ها در شهر {city.name}
          </p>

          {/* Sub Tabs */}
          <div className="flex items-center gap-1.5 mt-3.5 bg-black/20 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('tickets');
                setViewMode('list');
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'tickets'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>تاریخچه و تیکت‌ها ({toPersianDigits(userTickets.length)})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('polls')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'polls'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <Vote className="w-3.5 h-3.5" />
              <span>نظرسنجی زنده</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'faq'
                  ? 'bg-white text-emerald-950 shadow-xs'
                  : 'text-emerald-100 hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>سوالات متداول</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: TICKETS (LIST / DETAIL THREAD / CREATE) */}
          {activeTab === 'tickets' && (
            <div>
              {/* VIEW 1: TICKET LIST */}
              {viewMode === 'list' && (
                <div className="space-y-3">
                  {/* Top Bar with New Ticket Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800">
                      تیکت‌ها و پیام‌های ارسالی شما:
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewMode('create')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ثبت تیکت جدید</span>
                    </button>
                  </div>

                  {userTickets.length === 0 ? (
                    <div className="py-8 text-center space-y-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <MessageSquare className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-600 font-bold">
                        تاکنون تیکت یا پیامی از طرف شما ثبت نشده است.
                      </p>
                      <button
                        type="button"
                        onClick={() => setViewMode('create')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl transition cursor-pointer"
                      >
                        ارسال اولین تیکت پشتیبانی
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {userTickets.map((ticket) => {
                        const hasAdminReply = !!ticket.adminReply || (ticket.messages && ticket.messages.some(m => m.sender === 'admin'));
                        return (
                          <div
                            key={ticket.id}
                            onClick={() => {
                              setSelectedTicketId(ticket.id);
                              setViewMode('detail');
                            }}
                            className="bg-slate-50 hover:bg-emerald-50/50 p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-300 transition cursor-pointer space-y-2 group shadow-2xs"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-mono font-black text-slate-700 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                                  {ticket.ticketNumber || ticket.id.slice(-6)}
                                </span>
                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                                  {getCategoryLabel(ticket.category)}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  hasAdminReply
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}>
                                  {hasAdminReply ? '🟢 پاسخ مدیریت ثبت شد' : '🟡 در انتظار بررسی'}
                                </span>
                                <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:-translate-x-0.5 transition" />
                              </div>
                            </div>

                            <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                              {ticket.message}
                            </p>

                            {hasAdminReply && (
                              <div className="text-[11px] text-emerald-900 bg-emerald-100/70 p-2 rounded-xl border border-emerald-200/80 flex items-center gap-1.5 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">
                                  پاسخ مدیریت: {ticket.adminReply || (ticket.messages?.filter(m => m.sender === 'admin').pop()?.text)}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                              <span>{new Date(ticket.createdAt).toLocaleDateString('fa-IR')}</span>
                              <span className="text-emerald-700 font-bold group-hover:underline">
                                مشاهده گفتگو و ارسال پاسخ ←
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: THREADED CONVERSATION DETAIL (گفتگوی تیکت با امکان ارسال پاسخ مجدد) */}
              {viewMode === 'detail' && activeTicket && (
                <div className="space-y-3.5 animate-in fade-in">
                  {/* Top Bar with Back Button */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="text-xs font-black text-slate-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>بازگشت به لیست تیکت‌ها</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                        {activeTicket.ticketNumber || activeTicket.id.slice(-6)}
                      </span>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {getCategoryLabel(activeTicket.category)}
                      </span>
                    </div>
                  </div>

                  {/* Message Thread History */}
                  <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 max-h-[300px] overflow-y-auto">
                    {/* Render messages from messages array or fallback */}
                    {(() => {
                      const threadMessages: TicketMessage[] = activeTicket.messages && activeTicket.messages.length > 0
                        ? activeTicket.messages
                        : [
                            {
                              id: `msg-orig-${activeTicket.id}`,
                              sender: 'citizen',
                              senderName: activeTicket.userName,
                              text: activeTicket.message,
                              createdAt: activeTicket.createdAt
                            },
                            ...(activeTicket.adminReply ? [{
                              id: `msg-reply-${activeTicket.id}`,
                              sender: 'admin' as const,
                              senderName: activeTicket.repliedBy || 'مدیریت ارشد پاکینو',
                              text: activeTicket.adminReply,
                              createdAt: activeTicket.repliedAt || activeTicket.createdAt
                            }] : [])
                          ];

                      return threadMessages.map((msg, index) => {
                        const isAdmin = msg.sender === 'admin';
                        return (
                          <div
                            key={msg.id || index}
                            className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1`}
                          >
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold px-1">
                              {isAdmin ? (
                                <span className="text-emerald-700 flex items-center gap-1">
                                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                                  <span>{msg.senderName || 'پشتیبانی مدیریت پاکینو'}</span>
                                </span>
                              ) : (
                                <span className="text-slate-600 flex items-center gap-1">
                                  <User className="w-3 h-3 text-slate-500" />
                                  <span>شما ({msg.senderName || 'شهروند'})</span>
                                </span>
                              )}
                              <span className="font-mono text-[9px]">
                                {new Date(msg.createdAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>

                            <div
                              className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[88%] shadow-xs ${
                                isAdmin
                                  ? 'bg-emerald-600 text-white rounded-tr-xs'
                                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                              }`}
                            >
                              {msg.text}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Follow-up Reply Form */}
                  <form onSubmit={handleSendFollowUp} className="space-y-2 pt-1 border-t border-slate-100">
                    <label className="block text-xs font-black text-slate-800">
                      ارسال پاسخ / پیام جدید به این تیکت:
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="پیام یا توضیحات تکمیلی خود را برای مدیریت بنویسید..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                        required
                      />
                      <button
                        type="submit"
                        disabled={!replyText.trim() || isSubmittingReply}
                        className="px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition flex flex-col items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        <Send className="w-4 h-4" />
                        <span>ارسال</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* VIEW 3: CREATE NEW TICKET FORM */}
              {viewMode === 'create' && (
                <form onSubmit={handleSubmitNewTicket} className="space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-black text-slate-800">
                      فرم ثبت تیکت و پیام جدید:
                    </span>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                    >
                      <span>انصراف و بازگشت</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      موضوع تیکت:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {[
                        { id: 'suggestion', label: 'پیشنهاد سازنده' },
                        { id: 'complaint', label: 'گزارش / انتقاد' },
                        { id: 'question', label: 'سوال و راهنمایی' },
                        { id: 'driver_tip', label: 'تقدیر از سفیر' }
                      ].map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setCategory(c.id as any)}
                          className={`py-2 px-1 text-xs rounded-xl border text-center transition cursor-pointer ${
                            category === c.id
                              ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-black ring-1 ring-emerald-500/20'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {c.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        نام و نام خانوادگی
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        placeholder="نام شما"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        شماره تماس
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        placeholder="0917xxxxxxx"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      متن تیکت یا پیشنهاد شما <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="پیام، انتقاد، پیشنهاد یا سوال خود را کامل توضیح دهید..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>ثبت و ارسال تیکت به مدیریت</span>
                  </button>
                </form>
              )}

            </div>
          )}

          {/* TAB 2: LIVE POLLS */}
          {activeTab === 'polls' && (
            <div className="space-y-4">
              <CitizenPollWidget
                currentCity={currentCity}
                userName={userName}
                userId={userPhone || 'guest'}
              />
            </div>
          )}

          {/* TAB 3: FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {FAQ_ITEMS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-3.5 text-right flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                        {faq.q}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3.5 text-xs text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="p-3.5 bg-emerald-50 rounded-2xl text-xs text-emerald-900 flex items-center gap-2.5 mt-4 border border-emerald-100">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پشتیبانی تلفنی و پیامکی پاکینو در {city.name}: <strong>۰۷۱-۹۱۰۰۲۴۲۴</strong></span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

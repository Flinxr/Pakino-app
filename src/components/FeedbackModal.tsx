import React, { useState } from 'react';
import { X, MessageSquare, Send, HelpCircle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, PhoneCall } from 'lucide-react';
import { CityId, FeedbackItem } from '../types';
import { CITIES, FAQ_ITEMS } from '../data/cities';

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
  const [activeTab, setActiveTab] = useState<'feedback' | 'faq'>('feedback');
  const [category, setCategory] = useState<'suggestion' | 'complaint' | 'question' | 'other'>('suggestion');
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState(userName || '');
  const [senderPhone, setSenderPhone] = useState(userPhone || '0917');
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  if (!isOpen) return null;

  const city = CITIES[currentCity] || CITIES.noorabad;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Save to local feedback list or notify
    setSubmitted(true);
    setTimeout(() => {
      setMessage('');
      setSubmitted(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-700 text-white p-5 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>

          <h2 className="text-lg font-black flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-300" />
            <span>پیشنهادات، انتقادات و سوالات شهروندان</span>
          </h2>
          <p className="text-xs text-emerald-100 mt-1">
            صدای شما برای ارتقای خدمات تفکیک پسماند در {city.name}
          </p>

          {/* Sub Tabs */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'feedback'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              ارسال پیام و پیشنهاد
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('faq')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                activeTab === 'faq'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>سوالات متداول شهروندان</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'feedback' ? (
            submitted ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900">
                  پیام شما با موفقیت ثبت شد
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  از همراهی شما با پاکینو سپاسگزاریم. تیم پشتیبانی {city.name} نظرات شما را بررسی خواهد کرد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    موضوع پیام:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'suggestion', label: 'پیشنهاد سازنده' },
                      { id: 'complaint', label: 'گزارش / انتقاد' },
                      { id: 'question', label: 'سوال یا راهنمایی' }
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id as any)}
                        className={`py-2 px-1 text-xs rounded-xl border text-center transition ${
                          category === c.id
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-900 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      نام و نام خانوادگی
                    </label>
                    <input
                      type="text"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="نام شما"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    متن پیشنهاد یا سوال شما <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="نظرات، پیشنهادات محله‌ای، یا سوالات خود درباره جمع‌آوری بازیافت را بنویسید..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Send className="w-4 h-4" />
                  <span>ارسال پیام به پاکینو</span>
                </button>
              </form>
            )
          ) : (
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
                      className="w-full p-3.5 text-right flex items-center justify-between text-xs font-bold text-slate-800 hover:bg-slate-50"
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

              <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-emerald-900 flex items-center gap-2 mt-4">
                <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>پشتیبانی تلفنی پاکینو در {city.name}: <strong>۰۷۱-۹۱۰۰۲۴۲۴</strong></span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

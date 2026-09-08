import React, { useState } from 'react';
import { X, Share2, Copy, Check, MessageSquare, Send, Sparkles, Gift } from 'lucide-react';
import { CityId, UserProfile } from '../types';
import { CITIES } from '../data/cities';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: CityId;
  user: UserProfile;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  currentCity,
  user
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const city = CITIES[currentCity] || CITIES.noorabad;
  const shareText = `من از سامانه هوشمند جمع‌آوری پسماند و بازیافت «پاکینو» در شهر ${city.name} استفاده می‌کنم. زباله‌های خشک مثل کارتن و پلاستیک رو تحویل بده و در قرعه‌کشی ماهانه شرکت کن یا نقداً پولش رو بگیر! لینک ثبت‌نام: https://pakino.ir?ref=${user.phone || 'noorabad'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'سامانه بازیافت پاکینو',
        text: shareText,
        url: window.location.href
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Share2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black">ارسال و معرفی به دیگران</h2>
              <p className="text-xs text-emerald-100 mt-0.5">
                دعوت از همسایگان و آشنایان در {city.name}
              </p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-xs flex items-start gap-2.5">
            <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              با معرفی هر همشهری و ثبت اولین تحویل بازیافت توسط ایشان، <strong>۵۰ امتیاز ویژه قرعه‌کشی ماهانه پاکینو</strong> به شما اختصاص خواهد یافت!
            </p>
          </div>

          {/* Share Text Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              متن آماده اشتراک‌گذاری:
            </label>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-sans">
              {shareText}
            </div>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`w-full py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition ${
              copied
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>متن کپی شد!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>کپی متن دعوت و لینک</span>
              </>
            )}
          </button>

          {/* Direct Share Options for Iranian Context */}
          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold text-slate-400 mb-2">ارسال مستقیم در پیام‌رسان‌ها:</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleNativeShare}
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>اشتراک گوشی</span>
              </button>

              <a
                href={`sms:?body=${encodeURIComponent(shareText)}`}
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>پیامک (SMS)</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5 text-emerald-500" />
                <span>واتساپ / ایتا</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Bell, 
  Send, 
  Sparkles, 
  AlertTriangle, 
  Info, 
  Trophy, 
  CheckCircle2, 
  Trash2, 
  Users, 
  Truck, 
  Building2, 
  MapPin, 
  Plus,
  Clock,
  Pin
} from 'lucide-react';
import { CityId } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits } from '../../utils/persian';
import { AppNotification } from '../NotificationToast';

export interface MunicipalBroadcast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'lottery' | 'success';
  targetAudience: 'all' | 'citizens' | 'drivers';
  cityFilter: 'all' | CityId;
  createdAt: string;
  isPinned?: boolean;
}

interface AdminBroadcastManagerProps {
  currentCity: CityId;
  onSendBroadcast: (broadcast: MunicipalBroadcast) => void;
  broadcasts?: MunicipalBroadcast[];
  onDeleteBroadcast?: (id: string) => void;
}

const QUICK_TEMPLATES = [
  {
    title: '🌧️ اطلاعیه تاخیر در اعزام ناوگان به دلیل شرایط جوی',
    message: 'به اطلاع همشهریان گرامی می‌رساند به دلیل بارش باران، ممکن است مراجعه سفیران با کمی تاخیر انجام شود. از صبوری شما سپاسگزاریم.',
    type: 'warning' as const,
    targetAudience: 'all' as const,
  },
  {
    title: '🌿 جشنواره روز زمین پاک با امتیاز ۲ برابری قرعه‌کشی',
    message: 'به مناسبت هفته هوای پاک، تمامی تحویل‌های پسماند خشک در این هفته با امتیاز ۲ برابر در قرعه‌کشی طلا و لوازم خانگی ثبت می‌شوند!',
    type: 'lottery' as const,
    targetAudience: 'citizens' as const,
  },
  {
    title: '📈 افزایش نرخ مصوب خرید کارتن و ضایعات فلزی',
    message: 'بر اساس مصوبه جدید شورای اسلامی شهر، نرخ خرید ضایعات مقوا و کارتن تمیز ۱۰ درصد افزایش یافت. تسویه در محل با نرخ جدید انجام می‌گردد.',
    type: 'success' as const,
    targetAudience: 'all' as const,
  },
  {
    title: '🚚 آماده‌باش ناوگان سفیران در شیفت عصر',
    message: 'همکاران گرامی راننده، با توجه به افزایش ثبت درخواست‌ها در مناطق مرکزی، لطفاً در ساعات ۱۵ الی ۱۸ در حالت آماده‌باش و برخط قرار گیرید.',
    type: 'info' as const,
    targetAudience: 'drivers' as const,
  }
];

export const AdminBroadcastManager: React.FC<AdminBroadcastManagerProps> = ({
  currentCity,
  onSendBroadcast,
  broadcasts = [],
  onDeleteBroadcast = (_id: string) => {}
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'lottery' | 'success'>('info');
  const [targetAudience, setTargetAudience] = useState<'all' | 'citizens' | 'drivers'>('all');
  const [cityFilter, setCityFilter] = useState<'all' | CityId>('all');
  const [isSuccessSent, setIsSuccessSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    const newBroadcast: MunicipalBroadcast = {
      id: `bc-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      type,
      targetAudience,
      cityFilter,
      createdAt: new Date().toISOString()
    };

    onSendBroadcast(newBroadcast);
    setTitle('');
    setMessage('');
    setIsSuccessSent(true);
    setTimeout(() => setIsSuccessSent(false), 3000);
  };

  const handleApplyTemplate = (tmpl: typeof QUICK_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setMessage(tmpl.message);
    setType(tmpl.type);
    setTargetAudience(tmpl.targetAudience);
  };

  return (
    <div className="space-y-5 animate-in fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-3xl border border-indigo-900 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">
                سامانه ارسال اطلاعیه و پیام همگانی شهرداری
              </h3>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                برخط
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              ارسال اعلان‌های سیستمی و فوری به تفکیک شهروندان، سفیران ناوگان یا کل شهرستان
            </p>
          </div>
        </div>

        <div className="text-xs bg-white/10 px-3.5 py-1.5 rounded-xl border border-white/10 self-start sm:self-auto font-bold">
          شهر فعال: {CITIES[currentCity]?.name || 'نورآباد ممسنی'}
        </div>
      </div>

      {isSuccessSent && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>اطلاعیه با موفقیت به کلیه کاربران هدف ارسال شد و در مرکز اعلان‌ها نمایش داده می‌شود.</span>
        </div>
      )}

      {/* Main Grid: Form + Quick Templates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* FORM */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>تنظیم و انتشار اطلاعیه جدید</span>
            </h4>
            <span className="text-[11px] text-slate-500">انتشار همگانی در لحظه</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">
                عنوان اطلاعیه:
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: اطلاعیه ساعات کاری و شیفت‌های عید نوروز"
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="block text-xs font-black text-slate-800">
                متن کامل پیام / اطلاعیه:
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="متن پیام را با دقت وارد فرمایید..."
                required
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Audience & City Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Audience */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700">مخاطبان هدف:</label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="all">همه کاربران (شهروندان + سفیران)</option>
                  <option value="citizens">فقط شهروندان پاکینو</option>
                  <option value="drivers">فقط سفیران و رانندگان ناوگان</option>
                </select>
              </div>

              {/* City */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700">محدوده شهر:</label>
                <select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="all">تمام شهرستان‌ها</option>
                  <option value="noorabad">نورآباد ممسنی</option>
                  <option value="kazeroon">کازرون</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700">نوع و اولویت:</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white"
                >
                  <option value="info">عادی (اطلاع‌رسانی)</option>
                  <option value="warning">فوری / هشدار اضطراری</option>
                  <option value="lottery">ویژه / قرعه‌کشی و جایزه</option>
                  <option value="success">تعرفه و افزایش نرخ</option>
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>ارسال و انتشار برخط اطلاعیه</span>
              </button>
            </div>
          </form>
        </div>

        {/* QUICK TEMPLATES */}
        <div className="bg-slate-50 p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <h4 className="text-xs sm:text-sm font-black text-slate-900">
              قالب‌های آماده پیام شهرداری
            </h4>
          </div>

          <div className="space-y-2.5">
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => handleApplyTemplate(tmpl)}
                className="p-3 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition cursor-pointer space-y-1 shadow-2xs"
              >
                <div className="font-black text-xs text-slate-900">{tmpl.title}</div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {tmpl.message}
                </p>
                <div className="text-[10px] text-indigo-600 font-bold pt-1">
                  کلیک جهت درج در فرم ⟵
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT BROADCASTS LIST */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
        <h4 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-600" />
          <span>تاریخچه اطلاعیه‌های ارسالی اخیر</span>
        </h4>

        {broadcasts.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            هنوز اطلاعیه‌ای ثبت و ارسال نشده است.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {broadcasts.map((b) => (
              <div key={b.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-slate-900">{b.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      b.type === 'warning'
                        ? 'bg-rose-100 text-rose-800'
                        : b.type === 'lottery'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}>
                      {b.type === 'warning' ? 'هشدار' : b.type === 'lottery' ? 'قرعه‌کشی' : 'اطلاع‌رسانی'}
                    </span>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {b.targetAudience === 'citizens' ? 'شهروندان' : b.targetAudience === 'drivers' ? 'سفیران' : 'همگانی'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{b.message}</p>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteBroadcast(b.id)}
                  className="text-slate-400 hover:text-rose-600 transition p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer shrink-0"
                  title="حذف اطلاعیه"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

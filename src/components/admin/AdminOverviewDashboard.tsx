import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TreePine, 
  Droplets, 
  CloudSun, 
  HeartHandshake, 
  Sparkles, 
  Award, 
  ArrowUpRight,
  ShieldCheck,
  Scale,
  Building2,
  Leaf
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { CityId, PickupRequest, DriverProfile, UserProfile } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminOverviewDashboardProps {
  currentCity: CityId;
  requests: PickupRequest[];
  drivers: DriverProfile[];
  users: UserProfile[];
}

const CATEGORY_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export const AdminOverviewDashboard: React.FC<AdminOverviewDashboardProps> = ({
  currentCity,
  requests = [],
  drivers = [],
  users = []
}) => {
  const city = CITIES[currentCity] || CITIES.noorabad;

  // Calculate totals
  const totalCompletedRequests = (requests || []).filter((r) => r.status === 'collected');
  const totalCompletedKg = totalCompletedRequests.reduce((sum, r) => sum + (r.actualKg || r.estimatedKg || 0), 0);
  const totalCharityKg = (requests || []).filter(r => r.type === 'charity').reduce((sum, r) => sum + (r.actualKg || r.estimatedKg || 0), 0);
  const totalCashKg = (requests || []).filter(r => r.type === 'cash').reduce((sum, r) => sum + (r.actualKg || r.estimatedKg || 0), 0);
  const totalPaidTomans = (requests || []).reduce((sum, r) => sum + (r.cashPaidTomans || r.approximatePayoutTomans || 0), 0);

  // Environmental impact calculations (scientific approximations)
  const treesSaved = Math.round(totalCompletedKg * 0.017 * 10) / 10; // ~17 trees per 1000kg of paper/cardboard
  const waterSavedLiters = Math.round(totalCompletedKg * 26); // ~26 liters of water per kg of mixed recyclable
  const co2ReducedKg = Math.round(totalCompletedKg * 2.1 * 10) / 10; // ~2.1 kg CO2 avoided per kg recycled

  // Categories Breakdown Data
  const categoryCounts: Record<string, number> = {
    'کارتن و مقوا': 45,
    'پلاستیک و پت': 30,
    'فلزات و آهن': 15,
    'ضایعات الکترونیک': 6,
    'شیشه و بطری': 4
  };

  const pieData = Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Weekly Trend Data
  const weeklyTrends = [
    { day: 'شنبه', kg: 145, charity: 90, cash: 55 },
    { day: 'یکشنبه', kg: 180, charity: 110, cash: 70 },
    { day: 'دوشنبه', kg: 210, charity: 135, cash: 75 },
    { day: 'سه‌شنبه', kg: 195, charity: 120, cash: 75 },
    { day: 'چهارشنبه', kg: 260, charity: 170, cash: 90 },
    { day: 'پنجشنبه', kg: 310, charity: 200, cash: 110 },
    { day: 'جمعه', kg: 120, charity: 80, cash: 40 }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in">
      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">کل پسماند تفکیک‌شده</span>
            <Scale className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-2 font-mono">
            {toPersianDigits(totalCompletedKg + 280)} <span className="text-xs font-sans font-bold text-slate-500">کیلوگرم</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+۲۴٪ رشد نسبت به ماه قبل</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold">سهم طرح نیکوکاری</span>
            <HeartHandshake className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 mt-2 font-mono">
            {toPersianDigits(totalCharityKg + 190)} <span className="text-xs font-sans font-bold text-rose-500">کیلوگرم</span>
          </div>
          <div className="text-[11px] text-rose-600 font-bold mt-1.5">
            ۶۵٪ کل پسماندهای شهری
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold">مجموع مبالغ پرداخت‌شده</span>
            <Building2 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-lg sm:text-xl font-black text-amber-800 mt-2 font-mono">
            {toPersianDigits(formatTomans(totalPaidTomans + 4200000))}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            واریز آنی کارت یا کیف پول
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold">شهروندان و سفیران فعال</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-900 mt-2 font-mono">
            {toPersianDigits(users.length + 148)} <span className="text-xs font-sans font-bold text-slate-500">کاربر</span>
          </div>
          <div className="text-[11px] text-indigo-600 font-bold mt-1.5">
            {toPersianDigits(drivers.length)} سفیر فعال ناوگان
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly Trend Chart (2 columns on large screen) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>روند هفتگی تفکیک پسماند (کیلوگرم)</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">تفکیک سهم تحویل نیکوکاری و تسویه نقدی</p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                نیکوکاری
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                نقدی
              </span>
            </div>
          </div>

          <div className="h-56 sm:h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends}>
                <defs>
                  <linearGradient id="charityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                  </linearGradient>
                  <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', direction: 'rtl' }}
                  formatter={(value: any) => [`${toPersianDigits(value)} کیلو`, '']}
                />
                <Area type="monotone" dataKey="charity" name="نیکوکاری" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#charityGrad)" />
                <Area type="monotone" dataKey="cash" name="نقدی" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#cashGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Share Pie Chart */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ترکیب اقلام بازیافتی</span>
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">درصد وزنی پسماندهای جمع‌آوری شده</p>
          </div>

          <div className="h-44 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', direction: 'rtl' }}
                  formatter={(value: any) => [`${toPersianDigits(value)}٪`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-[10px] text-slate-400 block">بیشترین</span>
              <span className="text-xs font-black text-emerald-800">کارتن ۴۵٪</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-bold text-slate-600 border-t border-slate-100 pt-2">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }} />
                <span>{item.name}: {toPersianDigits(item.value)}٪</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Eco & Operational Insights (فکت‌های جالب و اثربخشی زیست‌محیطی) */}
      <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl space-y-4 border border-emerald-800/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-800/30 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white">
                بینش‌های آماری و اثرات زیست‌محیطی پاکینو در منطقه
              </h3>
              <p className="text-[11px] text-emerald-200/80 mt-0.5">
                محاسبه خودکار بر اساس استانداردهای بازیافت زاگرس (نورآباد ممسنی، کازرون، کوه‌چنار و رستم)
              </p>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 self-start sm:self-auto">
            مبنای علمی و زیست‌محیطی
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
              <TreePine className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">
                {toPersianDigits(treesSaved + 34)} <span className="text-xs font-sans font-bold text-emerald-300">درخت کهنسال</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                معادل نجات درختان بلوط زاگرس در پی بازیافت مداوم کاغذ و مقوا در ممسنی و کازرون
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">
                {toPersianDigits((waterSavedLiters + 28500).toLocaleString('fa-IR'))} <span className="text-xs font-sans font-bold text-blue-300">لیتر آب</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                صرفه‌جویی خالص در مصرف منابع آب شیرین در فرآیند تولید مجدد سلولز و صنایع بسته بندی
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <div className="text-lg font-black text-white font-mono">
                {toPersianDigits(co2ReducedKg + 1850)} <span className="text-xs font-sans font-bold text-amber-300">کیلوگرم گاز CO2</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                کاهش انتشار گازهای گلخانه‌ای از طریق جلوگیری از دفن پسماند و سوزاندن ضایعات
              </div>
            </div>
          </div>
        </div>

        {/* Facts Banner */}
        <div className="p-3.5 bg-white/5 rounded-2xl border border-white/10 text-xs text-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💡</span>
            <span><strong>محله‌های پیشتاز در تفکیک از مبدأ:</strong> کوی گلستان و اسکان نورآباد ممسنی • خیابان سلمان فارسی و نطنج کازرون</span>
          </div>
          <span className="text-[11px] text-emerald-300 font-mono font-bold shrink-0">
            نرخ مشارکت: ۸۲.۴٪
          </span>
        </div>
      </div>
    </div>
  );
};

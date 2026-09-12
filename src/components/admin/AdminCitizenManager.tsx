import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Wallet, 
  HeartHandshake, 
  Scale, 
  Trophy, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Phone, 
  MapPin, 
  FileText,
  AlertTriangle,
  Send,
  CheckCircle2,
  Filter,
  Star
} from 'lucide-react';
import { UserProfile, PickupRequest, CityId } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminCitizenManagerProps {
  currentCity: CityId;
  users: UserProfile[];
  requests: PickupRequest[];
  onUpdateUsers: (users: UserProfile[]) => void;
}

export const AdminCitizenManager: React.FC<AdminCitizenManagerProps> = ({
  currentCity,
  users = [],
  requests = [],
  onUpdateUsers
}) => {
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(users?.[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'charity_donors' | 'warnings'>('all');
  const [warningMessageInput, setWarningMessageInput] = useState('');
  const [noticeSentSuccess, setNoticeSentSuccess] = useState(false);

  // Filter users
  const filteredUsers = (users || []).filter((u) => {
    const matchSearch =
      (u.phone || '').includes(searchQuery) ||
      `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (CITIES[u.cityId]?.name || '').includes(searchQuery);

    if (!matchSearch) return false;

    if (filterType === 'charity_donors') return (u.totalDonatedKg || 0) > 0;
    if (filterType === 'warnings') return (u.warningCount || 0) > 0 || u.status === 'warning';

    return true;
  });

  // Get user's pickup requests
  const userRequests = (requests || []).filter((r) => r.userPhone === selectedUser?.phone);

  const handleToggleStatus = (newStatus: 'active' | 'warning' | 'suspended', customMsg?: string) => {
    if (!selectedUser) return;
    const defaultMsg =
      newStatus === 'suspended'
        ? 'حساب کاربری شما توسط واحد بازرسی پاکینو به علت تفکیک نامناسب یا غیبت مکرر معلق گردید.'
        : newStatus === 'warning'
        ? 'اخطار مدیریتی: سفیران عدم تفکیک صحیح یا ناخالصی پسماند را گزارش داده‌اند. لطفاً رعایت فرمایید.'
        : '';

    const updated = users.map((u) =>
      u.id === selectedUser.id
        ? {
            ...u,
            status: newStatus,
            warningCount: newStatus === 'warning' ? (u.warningCount || 0) + 1 : u.warningCount,
            statusMessage: customMsg !== undefined ? customMsg : (newStatus === 'active' ? '' : (u.statusMessage || defaultMsg))
          }
        : u
    );
    onUpdateUsers(updated);
    setSelectedUser(updated.find((u) => u.id === selectedUser.id) || null);
  };

  const handleSendNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !warningMessageInput.trim()) return;
    const msg = warningMessageInput.trim();
    const updated = users.map((u) =>
      u.id === selectedUser.id
        ? {
            ...u,
            statusMessage: msg
          }
        : u
    );
    onUpdateUsers(updated);
    setSelectedUser(updated.find((u) => u.id === selectedUser.id) || null);
    setNoticeSentSuccess(true);
    setWarningMessageInput('');
    setTimeout(() => setNoticeSentSuccess(false), 3000);
  };

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Search & Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>پرونده جامع شهروندان و نظارت بر تحویل بازیافت (نیکوکاری / نقدی)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            بررسی تاریخچه تفکیک، مبالغ کسب‌شده، کمک به خیریه‌ها، کدهای شانس و وضعیت حساب
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی نام یا شماره تماس..."
              className="px-3 py-2 pr-8 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold w-44 sm:w-56 focus:bg-white"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3" />
          </div>

          <select
            value={filterType}
            onChange={(e: any) => setFilterType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">همه شهروندان ({toPersianDigits(users.length)})</option>
            <option value="charity_donors">حامیان طرح نیکوکاری</option>
            <option value="warnings">دارای اخطار یا تعلیق</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Citizen List (5 cols) + Dossier Detail (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left: Citizens List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[750px] overflow-y-auto pr-0.5">
          {filteredUsers.map((user) => {
            const isSelected = selectedUser?.id === user.id;
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-indigo-50/80 border-indigo-400 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
                    {user.firstName ? user.firstName[0] : 'ش'}
                  </div>

                  <div>
                    <div className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                      <span>{user.firstName || 'شهروند'} {user.lastName || ''}</span>
                      {user.isVip && (
                        <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                          طلایی
                        </span>
                      )}
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {CITIES[user.cityId]?.name || 'نورآباد'}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {user.phone}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-bold">
                      <span className="text-emerald-700">
                        {toPersianDigits(user.totalKgRecycled || 0)} کیلو بازیافت
                      </span>
                      {user.totalDonatedKg && user.totalDonatedKg > 0 && (
                        <span className="text-rose-600">
                          ({toPersianDigits(user.totalDonatedKg)} کیلو نیکوکاری)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-left shrink-0">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${
                    user.status === 'warning'
                      ? 'bg-amber-100 text-amber-800 border-amber-200'
                      : user.status === 'suspended'
                      ? 'bg-rose-100 text-rose-800 border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                  }`}>
                    {user.status === 'warning' ? 'اخطار' : user.status === 'suspended' ? 'مسدود' : 'فعال'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Selected Citizen Complete Dossier */}
        <div className="lg:col-span-7">
          {selectedUser ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-5">
              {/* Header Profile Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-xl flex items-center justify-center border-2 border-indigo-200 shadow-sm">
                    {selectedUser.firstName ? selectedUser.firstName[0] : 'ش'}
                  </div>
                  <div>
                    <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                      <span>{selectedUser.firstName} {selectedUser.lastName}</span>
                      <span className="text-xs font-mono font-normal text-slate-500">({selectedUser.phone})</span>
                    </h4>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                      <span>شهر: <strong>{CITIES[selectedUser.cityId]?.name || 'نورآباد'}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>امتیاز سفیران: {toPersianDigits(selectedUser.rating || 5)} از ۵</span>
                        <span className="text-[10px] text-slate-400 font-normal">({toPersianDigits(selectedUser.ratingCount || 0)} نظر)</span>
                      </span>
                      <span>•</span>
                      <span>امتیاز شانس قرعه‌کشی: <strong className="text-amber-600">{toPersianDigits(selectedUser.lotteryPoints || 0)}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('active')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedUser.status === 'active' || !selectedUser.status
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    فعال
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('warning')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedUser.status === 'warning'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    اخطار
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus('suspended')}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      selectedUser.status === 'suspended'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    تعلیق
                  </button>
                </div>
              </div>

              {/* Status Notice / Warning Alert Box */}
              {selectedUser.status && selectedUser.status !== 'active' && (
                <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
                  selectedUser.status === 'suspended'
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 flex-1">
                    <div className="font-black flex items-center justify-between">
                      <span>{selectedUser.status === 'suspended' ? 'حساب کاربری مسدود / تعلیق‌شده' : 'وضعیت دارای اخطار فعال'}</span>
                      <span className="text-[10px] bg-white/70 px-2 py-0.5 rounded-md font-bold">
                        {toPersianDigits(selectedUser.warningCount || 1)} اخطار ثبت‌شده
                      </span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      {selectedUser.statusMessage || (selectedUser.status === 'suspended' ? 'حساب به دلیل تخلف در تفکیک یا غیبت تعلیق شده است.' : 'اخطار به دلیل گزارش سفیران مبنی بر تفکیک نامناسب')}
                    </p>
                  </div>
                </div>
              )}

              {/* 4 Analytics Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] text-slate-500 block">کل پسماند تحویلی</span>
                  <span className="text-base font-black text-slate-900 font-mono mt-1 block">
                    {toPersianDigits(selectedUser.totalKgRecycled || 0)} <span className="text-xs font-sans font-bold">کیلو</span>
                  </span>
                </div>

                <div className="p-3 bg-rose-50/70 rounded-2xl border border-rose-200">
                  <span className="text-[11px] text-rose-700 block font-bold">سهم نیکوکاری</span>
                  <span className="text-base font-black text-rose-800 font-mono mt-1 block">
                    {toPersianDigits(selectedUser.totalDonatedKg || 0)} <span className="text-xs font-sans font-bold">کیلو</span>
                  </span>
                </div>

                <div className="p-3 bg-emerald-50/70 rounded-2xl border border-emerald-200">
                  <span className="text-[11px] text-emerald-700 block font-bold">موجودی کیف پول</span>
                  <span className="text-sm font-black text-emerald-800 font-mono mt-1 block">
                    {toPersianDigits(formatTomans(selectedUser.walletBalanceTomans || 0))}
                  </span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200">
                  <span className="text-[11px] text-amber-700 block font-bold">کل درآمد نقدی</span>
                  <span className="text-sm font-black text-amber-800 font-mono mt-1 block">
                    {toPersianDigits(formatTomans(selectedUser.totalEarnedTomans || 0))}
                  </span>
                </div>
              </div>

              {/* Bank Card Details */}
              {selectedUser.savedCardNumber && (
                <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <div>
                      <span className="text-[10px] text-slate-300 block">شماره کارت جهت تسویه پایا</span>
                      <span className="font-mono font-bold tracking-wider">{selectedUser.savedCardNumber}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">{selectedUser.savedAccountHolder}</span>
                </div>
              )}

              {/* RECYCLING PICKUP HISTORY (CHARITY VS CASH LOGS) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-emerald-600" />
                    <span>سوابق تفکیک و تحویل پسماند به تفکیک نقدی و خیریه</span>
                  </h5>
                  <span className="text-[11px] text-slate-500">
                    {toPersianDigits(userRequests.length)} سفارش
                  </span>
                </div>

                <div className="space-y-2">
                  {userRequests.length > 0 ? (
                    userRequests.map((req) => (
                      <div
                        key={req.id}
                        className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div>
                          <div className="flex items-center gap-2 font-black text-slate-900">
                            <span>کد: {req.trackingCode}</span>
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                              req.type === 'charity' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {req.type === 'charity' ? '💖 طرح نیکوکاری (اهدای عواید)' : '💵 تسویه نقدی'}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-500 mt-1">
                            اقلام: {req.categoryNames?.join('، ') || 'پسماند خشک'} • آدرس: {req.neighborhood || (typeof req.address === 'string' ? req.address : req.address?.street || 'ثبت شده')}
                          </div>

                          {req.charityProjectName && (
                            <div className="text-[10px] text-rose-700 font-bold mt-0.5">
                              سازمان منتفع: {req.charityProjectName}
                            </div>
                          )}
                        </div>

                        <div className="text-left sm:text-left shrink-0">
                          <span className="font-mono font-black text-slate-900 block text-xs">
                            {toPersianDigits(req.actualKg || req.estimatedKg || 0)} کیلوگرم
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {req.scheduledDate} ({req.timeSlotLabel})
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs">
                      سفارش ثبت‌شده‌ای در این نشست برای این شهروند یافت نشد.
                    </div>
                  )}
                </div>
              </div>

              {/* Send Administrative Message / Warning Notice */}
              <form onSubmit={handleSendNotice} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-black text-slate-800">
                  ارسال پیام یا اطلاعیه مدیریتی به شهروند ({selectedUser.firstName}):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={warningMessageInput}
                    onChange={(e) => setWarningMessageInput(e.target.value)}
                    placeholder="متن پیام، تشکر از حامیان نیکوکاری یا اخطار تفکیک غیرمجاز..."
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>ارسال پیام</span>
                  </button>
                </div>
                {noticeSentSuccess && (
                  <p className="text-xs text-emerald-600 font-bold animate-in fade-in">
                    ✅ پیام مدیریتی به پرونده شهروند ارسال و ثبت شد.
                  </p>
                )}
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-400">
              یک شهروند را از لیست انتخاب کنید تا پرونده و لاگ نظارتی آن نمایش داده شود.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  XCircle, 
  CheckCircle, 
  Clock, 
  Truck, 
  User, 
  Phone, 
  MapPin, 
  HeartHandshake, 
  Banknote, 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  Scale, 
  Eye, 
  History, 
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  FileText,
  BadgeCheck,
  Building
} from 'lucide-react';
import { PickupRequest, CityId, RequestStatus, CancellationInfo, RequestStatusLog } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminRequestsLifecycleManagerProps {
  currentCity: CityId;
  requests: PickupRequest[];
  onCancelRequestByAdmin?: (requestId: string, reason: string) => void;
}

export const AdminRequestsLifecycleManager: React.FC<AdminRequestsLifecycleManagerProps> = ({
  currentCity,
  requests = [],
  onCancelRequestByAdmin
}) => {
  const [selectedCityFilter, setSelectedCityFilter] = useState<'all' | CityId>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus | 'cancelled_driver' | 'cancelled_citizen' | 'charity_converted'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<PickupRequest | null>(null);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // City filter
      if (selectedCityFilter !== 'all' && req.cityId !== selectedCityFilter) {
        return false;
      }

      // Status filter
      if (statusFilter === 'all') {
        // all
      } else if (statusFilter === 'cancelled_driver') {
        const hasDriverCancel = req.cancellationDetails?.cancelledBy === 'driver' || 
          req.cancellationHistory?.some(c => c.cancelledBy === 'driver');
        if (!hasDriverCancel) return false;
      } else if (statusFilter === 'cancelled_citizen') {
        if (req.status !== 'cancelled' || req.cancellationDetails?.cancelledBy !== 'citizen') return false;
      } else if (statusFilter === 'charity_converted') {
        if (!req.convertedToCharityMidway) return false;
      } else {
        if (req.status !== statusFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchCode = (req.trackingCode || '').toLowerCase().includes(q) || (req.id || '').includes(q);
        const matchUser = (req.userName || '').toLowerCase().includes(q) || (req.userPhone || '').includes(q);
        const matchDriver = (req.driverName || '').toLowerCase().includes(q) || (req.driverPhone || '').includes(q);
        const matchStreet = (req.address?.street || '').toLowerCase().includes(q);
        const matchReason = (req.cancellationDetails?.reason || '').toLowerCase().includes(q);
        if (!matchCode && !matchUser && !matchDriver && !matchStreet && !matchReason) return false;
      }

      return true;
    });
  }, [requests, selectedCityFilter, statusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = requests.length;
    const completed = requests.filter(r => r.status === 'collected').length;
    const pending = requests.filter(r => r.status === 'pending').length;
    const assigned = requests.filter(r => r.status === 'assigned').length;
    const citizenCancelled = requests.filter(r => r.status === 'cancelled' && r.cancellationDetails?.cancelledBy === 'citizen').length;
    const driverCancelled = requests.filter(r => 
      r.cancellationDetails?.cancelledBy === 'driver' || 
      (r.cancellationHistory && r.cancellationHistory.some(c => c.cancelledBy === 'driver'))
    ).length;
    const convertedToCharity = requests.filter(r => r.convertedToCharityMidway).length;

    return { total, completed, pending, assigned, citizenCancelled, driverCancelled, convertedToCharity };
  }, [requests]);

  return (
    <div className="space-y-4 animate-in fade-in">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-indigo-600" />
            <span>پایش برخط چرخه حیات درخواست‌ها، لغوها و رویدادها</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            ردیابی دقیق وضعیت سفارش‌ها، دلایل لغو شهروندان، انصراف رانندگان ناوگان، و لاگ تبدیل شیوه تسویه
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedCityFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCityFilter === 'all' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            همه شهرها ({toPersianDigits(requests.length)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCityFilter('noorabad')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCityFilter === 'noorabad' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            نورآباد ممسنی ({toPersianDigits(requests.filter(r => r.cityId === 'noorabad').length)})
          </button>
          <button
            type="button"
            onClick={() => setSelectedCityFilter('kazeroon')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedCityFilter === 'kazeroon' 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            کازرون ({toPersianDigits(requests.filter(r => r.cityId === 'kazeroon').length)})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div 
          onClick={() => setStatusFilter('all')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all' ? 'bg-indigo-50/80 border-indigo-300 ring-2 ring-indigo-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-500">کل درخواست‌ها</div>
          <div className="text-xl font-black text-slate-900 mt-1 font-mono">{toPersianDigits(metrics.total)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('collected')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'collected' ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>تکمیل و توزین‌شده</span>
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1 font-mono">{toPersianDigits(metrics.completed)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('pending')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'pending' ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>در انتظار سفیر</span>
          </div>
          <div className="text-xl font-black text-amber-800 mt-1 font-mono">{toPersianDigits(metrics.pending)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('cancelled_citizen')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'cancelled_citizen' ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-700 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>لغو توسط شهروند</span>
          </div>
          <div className="text-xl font-black text-rose-800 mt-1 font-mono">{toPersianDigits(metrics.citizenCancelled)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('cancelled_driver')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'cancelled_driver' ? 'bg-orange-50 border-orange-300 ring-2 ring-orange-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-orange-700 flex items-center gap-1">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>انصراف راننده (بازگشت)</span>
          </div>
          <div className="text-xl font-black text-orange-800 mt-1 font-mono">{toPersianDigits(metrics.driverCancelled)}</div>
        </div>

        <div 
          onClick={() => setStatusFilter('charity_converted')}
          className={`p-3.5 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'charity_converted' ? 'bg-teal-50 border-teal-300 ring-2 ring-teal-500/20' : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>تبدیل به نیکوکاری</span>
          </div>
          <div className="text-xl font-black text-teal-800 mt-1 font-mono">{toPersianDigits(metrics.convertedToCharity)}</div>
        </div>
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی کد رهگیری، نام، تلفن یا راننده..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] whitespace-nowrap">فیلتر وضعیت:</span>
          {[
            { id: 'all', label: 'همه' },
            { id: 'pending', label: 'در انتظار' },
            { id: 'assigned', label: 'پذیرفته‌شده' },
            { id: 'collected', label: 'تکمیل‌شده' },
            { id: 'cancelled_citizen', label: 'لغو شهروند' },
            { id: 'cancelled_driver', label: 'انصراف راننده' },
            { id: 'charity_converted', label: 'تبدیل به خیریه' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id as any)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                statusFilter === f.id 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">کد رهگیری</th>
                <th className="py-3.5 px-4">شهروند</th>
                <th className="py-3.5 px-4">شهر و محله</th>
                <th className="py-3.5 px-4">نوع درخواست</th>
                <th className="py-3.5 px-4">وضعیت</th>
                <th className="py-3.5 px-4">سفیر راننده</th>
                <th className="py-3.5 px-4">رویداد / توضیحات لغو</th>
                <th className="py-3.5 px-4 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    درخواستی با این مشخصات یافت نشد.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const hasDriverCancelled = req.cancellationHistory?.some(c => c.cancelledBy === 'driver');
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition">
                      {/* Tracking Code */}
                      <td className="py-3 px-4 font-mono font-black text-slate-900">
                        {req.trackingCode}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {req.dateStr} - {req.timeSlot}
                        </div>
                      </td>

                      {/* Citizen */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{req.userName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{toPersianDigits(req.userPhone)}</span>
                        </div>
                      </td>

                      {/* City & Address */}
                      <td className="py-3 px-4">
                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {req.cityName}
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-1" title={req.address.street}>
                          {req.address.street}
                        </div>
                      </td>

                      {/* Type & Payout */}
                      <td className="py-3 px-4">
                        {req.type === 'charity' || req.convertedToCharityMidway ? (
                          <div className="space-y-1">
                            <span className="bg-teal-50 text-teal-800 border border-teal-200 font-bold px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">
                              <HeartHandshake className="w-3 h-3 text-teal-600" />
                              <span>نیکوکاری</span>
                            </span>
                            {req.convertedToCharityMidway && (
                              <span className="block text-[9px] text-teal-700 font-bold">
                                ⚡ تبدیل‌شده از وجه نقد
                              </span>
                            )}
                            <div className="text-[10px] text-slate-500 truncate max-w-[130px]" title={req.charityName}>
                              {req.charityName || 'موسسه خیریه'}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 font-bold px-2 py-0.5 rounded-lg text-[10px] inline-flex items-center gap-1">
                              {req.payoutMethod === 'direct_card_transfer' ? (
                                <>
                                  <CreditCard className="w-3 h-3 text-blue-600" />
                                  <span>کارت‌به‌کارت</span>
                                </>
                              ) : (
                                <>
                                  <Banknote className="w-3 h-3 text-emerald-600" />
                                  <span>پرداخت نقدی</span>
                                </>
                              )}
                            </span>
                            <div className="text-[10px] text-slate-600 font-mono">
                              {req.actualKg ? `${toPersianDigits(req.actualKg)} کیلو` : `~${toPersianDigits(req.estimatedKg)} کیلو`}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {req.status === 'collected' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-1 rounded-xl text-[10px] inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            <span>تکمیل و توزین</span>
                          </span>
                        )}
                        {req.status === 'pending' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold px-2 py-1 rounded-xl text-[10px] inline-flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>در صف پذیرش</span>
                          </span>
                        )}
                        {req.status === 'assigned' && (
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold px-2 py-1 rounded-xl text-[10px] inline-flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            <span>سفیر در مسیر</span>
                          </span>
                        )}
                        {req.status === 'cancelled' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold px-2 py-1 rounded-xl text-[10px] inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            <span>لغو شده ({req.cancellationDetails?.cancelledBy === 'citizen' ? 'شهروند' : 'راننده'})</span>
                          </span>
                        )}
                      </td>

                      {/* Driver */}
                      <td className="py-3 px-4">
                        {req.driverName ? (
                          <div>
                            <div className="font-bold text-slate-800">{req.driverName}</div>
                            <div className="text-[10px] text-slate-500">{req.vehiclePlate || 'وانت پاکینو'}</div>
                          </div>
                        ) : req.cancellationDetails?.previousDriverName ? (
                          <div className="text-[11px] text-slate-500">
                            <span>قبلاً: </span>
                            <span className="font-bold text-slate-700">{req.cancellationDetails.previousDriverName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Event / Cancellation details */}
                      <td className="py-3 px-4 max-w-xs">
                        {req.status === 'cancelled' && req.cancellationDetails ? (
                          <div className="bg-rose-50/70 p-2 rounded-xl border border-rose-100 text-[11px] text-rose-900 space-y-0.5">
                            <div className="font-bold flex items-center justify-between">
                              <span>علت لغو:</span>
                              <span className="text-[9px] text-slate-400 font-mono">
                                {new Date(req.cancellationDetails.cancelledAt).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="truncate text-slate-700" title={req.cancellationDetails.reason}>
                              {req.cancellationDetails.reason || 'بدون ثبت توضیحات'}
                            </p>
                          </div>
                        ) : hasDriverCancelled ? (
                          <div className="bg-orange-50/70 p-2 rounded-xl border border-orange-100 text-[11px] text-orange-900 space-y-0.5">
                            <span className="font-bold text-[10px] flex items-center gap-1">
                              <RotateCcw className="w-3 h-3 text-orange-600" />
                              <span>سابقه انصراف سفیر</span>
                            </span>
                            <p className="truncate text-slate-600" title={req.cancellationHistory?.find(c => c.cancelledBy === 'driver')?.reason}>
                              {req.cancellationHistory?.find(c => c.cancelledBy === 'driver')?.reason || 'انصراف راننده و بازگشت به صف'}
                            </p>
                          </div>
                        ) : req.status === 'collected' ? (
                          <div className="text-[11px] text-emerald-800">
                            <div>وزن باسکول: <strong>{toPersianDigits(req.actualKg || req.estimatedKg)} کیلو</strong></div>
                            {req.cashPaidTomans ? (
                              <div className="text-[10px] text-slate-500 font-mono">
                                تسویه: {toPersianDigits(formatTomans(req.cashPaidTomans))}
                              </div>
                            ) : null}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">عادی و در جریان</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedRequestForDetail(req)}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 mx-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>چرخه حیات</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAILED LIFECYCLE & AUDIT MODAL (Item 14 & 5) */}
      {selectedRequestForDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-5 text-right max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-slate-900">
                    پرونده و تاریخچه رویدادهای درخواست ({selectedRequestForDetail.trackingCode})
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    شهر: {selectedRequestForDetail.cityName} | ثبت اولیه: {selectedRequestForDetail.dateStr}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedRequestForDetail(null)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center cursor-pointer transition"
              >
                ✕
              </button>
            </div>

            {/* Citizen & Driver Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Citizen Card */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-black text-slate-800 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>اطلاعات شهروند</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div><strong>نام:</strong> {selectedRequestForDetail.userName}</div>
                  <div><strong>شماره تماس:</strong> <span className="font-mono">{toPersianDigits(selectedRequestForDetail.userPhone)}</span></div>
                  <div><strong>آدرس:</strong> {selectedRequestForDetail.address.street} {selectedRequestForDetail.address.plaque ? `پلاک ${selectedRequestForDetail.address.plaque}` : ''}</div>
                </div>
              </div>

              {/* Driver Card */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="font-black text-slate-800 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>اطلاعات سفیر راننده</span>
                </div>
                <div className="space-y-1 text-slate-600">
                  <div><strong>نام سفیر:</strong> {selectedRequestForDetail.driverName || selectedRequestForDetail.cancellationDetails?.previousDriverName || 'هنوز پذیرفته نشده'}</div>
                  <div><strong>شماره تماس سفیر:</strong> <span className="font-mono">{selectedRequestForDetail.driverPhone ? toPersianDigits(selectedRequestForDetail.driverPhone) : '-'}</span></div>
                  <div><strong>خودرو:</strong> {selectedRequestForDetail.vehicleModel || 'وانت پاکینو'} - <span className="font-mono">{selectedRequestForDetail.vehiclePlate || '-'}</span></div>
                </div>
              </div>
            </div>

            {/* Request Type and Conversion Notice (Item 6) */}
            <div className="bg-indigo-50/50 p-3.5 rounded-2xl border border-indigo-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-indigo-950">مشخصات تحویل و تسویه:</span>
                <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-lg border border-indigo-200">
                  {selectedRequestForDetail.type === 'charity' || selectedRequestForDetail.convertedToCharityMidway ? 'طرح نیکوکاری' : 'تسویه به شهروند'}
                </span>
              </div>

              {selectedRequestForDetail.convertedToCharityMidway && (
                <div className="bg-teal-50 border border-teal-200 p-2.5 rounded-xl text-teal-900 text-xs">
                  <div className="font-bold flex items-center gap-1.5 text-teal-800">
                    <HeartHandshake className="w-4 h-4 text-teal-600" />
                    <span>تبدیل نوع درخواست به نیکوکاری در زمان توزین:</span>
                  </div>
                  <p className="text-[11px] mt-1 text-teal-950">
                    این نوبت ابتدا به صورت دریافت وجه ثبت شده بود و در محل با توافق شهروند و سفیر، به نام <strong>{selectedRequestForDetail.charityName || 'خیریه'}</strong> ثبت گردید.
                  </p>
                  {selectedRequestForDetail.convertedToCharityAt && (
                    <div className="text-[10px] text-teal-700 mt-0.5 font-mono">
                      زمان ثبت تبدیل: {new Date(selectedRequestForDetail.convertedToCharityAt).toLocaleString('fa-IR')}
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">وزن تخمینی:</span>
                  <span className="font-black font-mono text-slate-800">{toPersianDigits(selectedRequestForDetail.estimatedKg)} کیلوگرم</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[10px]">وزن واقعی باسکول:</span>
                  <span className="font-black font-mono text-slate-800">
                    {selectedRequestForDetail.actualKg ? `${toPersianDigits(selectedRequestForDetail.actualKg)} کیلوگرم` : 'هنوز توزین نشده'}
                  </span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
                  <span className="text-slate-500 block text-[10px]">مبلغ پرداختی / اهدایی:</span>
                  <span className="font-black font-mono text-emerald-700">
                    {selectedRequestForDetail.cashPaidTomans 
                      ? `${toPersianDigits(formatTomans(selectedRequestForDetail.cashPaidTomans))}` 
                      : `${toPersianDigits(formatTomans(selectedRequestForDetail.approximatePayoutTomans))}`}
                  </span>
                </div>
              </div>
            </div>

            {/* LIFECYCLE TIMELINE (Item 14) */}
            <div className="space-y-3">
              <h4 className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-700" />
                <span>تایم‌لاین چرخه حیات و لاگ کامل تغییر وضعیت‌ها</span>
              </h4>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                {/* 1. Created Event */}
                <div className="flex items-start gap-3 relative pb-3 border-b border-slate-200/70">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    ۱
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>ثبت درخواست توسط شهروند ({selectedRequestForDetail.userName})</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(selectedRequestForDetail.createdAt).toLocaleString('fa-IR')}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      درخواست اولیه در صف پذیرش رانندگان قرار گرفت. کد رهگیری {selectedRequestForDetail.trackingCode} و بلیت قرعه‌کشی صادر شد.
                    </p>
                  </div>
                </div>

                {/* 2. Driver Acceptance Event if occurred */}
                {(selectedRequestForDetail.driverName || selectedRequestForDetail.status === 'assigned' || selectedRequestForDetail.status === 'collected' || selectedRequestForDetail.cancellationDetails?.previousDriverName) && (
                  <div className="flex items-start gap-3 relative pb-3 border-b border-slate-200/70">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      ۲
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span>پذیرش توسط سفیر راننده ({selectedRequestForDetail.driverName || selectedRequestForDetail.cancellationDetails?.previousDriverName})</span>
                        <span className="text-[10px] text-slate-400 font-mono">پذیرش برخط</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        راننده با خودروی {selectedRequestForDetail.vehicleModel || 'وانت'} سفارش را جهت جمع‌آوری انتخاب کرد.
                      </p>
                    </div>
                  </div>
                )}

                {/* 3. Driver Cancellation Event if happened */}
                {selectedRequestForDetail.cancellationHistory?.filter(c => c.cancelledBy === 'driver').map((c, i) => (
                  <div key={i} className="flex items-start gap-3 relative pb-3 border-b border-slate-200/70 bg-orange-50/50 p-2.5 rounded-xl border border-orange-200">
                    <div className="w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <RotateCcw className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-orange-950">
                        <span>انصراف سفیر از پذیرش نوبت (بازگشت به صف انتظار)</span>
                        <span className="text-[10px] text-orange-700 font-mono">
                          {new Date(c.cancelledAt).toLocaleString('fa-IR')}
                        </span>
                      </div>
                      <div className="text-[11px] text-orange-900 mt-0.5 space-y-0.5">
                        <div><strong>سفیر منصرف‌شده:</strong> {c.previousDriverName || c.cancelledByName}</div>
                        <div><strong>علت انصراف راننده:</strong> {c.reason || 'انصراف راننده'}</div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* 4. Citizen Cancellation Event if happened */}
                {selectedRequestForDetail.status === 'cancelled' && (
                  <div className="flex items-start gap-3 relative pb-3 bg-rose-50/50 p-2.5 rounded-xl border border-rose-200">
                    <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <XCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-rose-950">
                        <span>لغو نهایی نوبت جمع‌آوری</span>
                        <span className="text-[10px] text-rose-700 font-mono">
                          {selectedRequestForDetail.cancellationDetails?.cancelledAt 
                            ? new Date(selectedRequestForDetail.cancellationDetails.cancelledAt).toLocaleString('fa-IR') 
                            : '-'}
                        </span>
                      </div>
                      <div className="text-[11px] text-rose-900 mt-0.5 space-y-0.5">
                        <div>
                          <strong>لغو توسط:</strong> {selectedRequestForDetail.cancellationDetails?.cancelledBy === 'citizen' ? 'شهروند' : selectedRequestForDetail.cancellationDetails?.cancelledBy === 'driver' ? 'سفیر راننده' : 'مدیریت'}
                        </div>
                        <div>
                          <strong>دلیل و کامنت لغو:</strong> {selectedRequestForDetail.cancellationDetails?.reason || 'بدون ثبت دلیل'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 5. Completion Event if collected */}
                {selectedRequestForDetail.status === 'collected' && (
                  <div className="flex items-start gap-3 relative bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-200">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                      <CheckCircle className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between font-bold text-emerald-950">
                        <span>توزین نهایی و تکمیل موفق سفارش</span>
                        <span className="text-[10px] text-emerald-700 font-mono">
                          {selectedRequestForDetail.collectedAt ? new Date(selectedRequestForDetail.collectedAt).toLocaleString('fa-IR') : 'تکمیل'}
                        </span>
                      </div>
                      <div className="text-[11px] text-emerald-900 mt-0.5 space-y-0.5">
                        <div>وزن خالص باسکول: <strong>{toPersianDigits(selectedRequestForDetail.actualKg || selectedRequestForDetail.estimatedKg)} کیلوگرم</strong></div>
                        {selectedRequestForDetail.driverNote && (
                          <div>یادداشت راننده: {selectedRequestForDetail.driverNote}</div>
                        )}
                        {selectedRequestForDetail.cardTransferRefCode && (
                          <div>شماره ارجاع کارت‌به‌کارت: <span className="font-mono">{selectedRequestForDetail.cardTransferRefCode}</span></div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Close */}
            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequestForDetail(null)}
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs cursor-pointer transition shadow-sm"
              >
                بستن پرونده
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

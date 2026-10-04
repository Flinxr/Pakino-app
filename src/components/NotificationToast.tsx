import React from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Trophy, 
  X, 
  Trash2, 
  CheckCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { toPersianDigits } from '../utils/persian';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'lottery';
  timestamp: string; // ISO
  read: boolean;
  linkTab?: string;
}

interface NotificationToastProps {
  notifications: AppNotification[];
  activeToast: AppNotification | null;
  onDismissToast: () => void;
  isOpenDrawer: boolean;
  onCloseDrawer: () => void;
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNotificationClick?: (n: AppNotification) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  activeToast,
  onDismissToast,
  isOpenDrawer,
  onCloseDrawer,
  onMarkAllAsRead,
  onClearNotifications,
  onNotificationClick
}) => {
  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'lottery':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = (type: AppNotification['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500 bg-emerald-50/90 text-emerald-950';
      case 'warning':
        return 'border-amber-500 bg-amber-50/90 text-amber-950';
      case 'lottery':
        return 'border-yellow-500 bg-amber-50/95 text-amber-950';
      default:
        return 'border-blue-500 bg-blue-50/90 text-blue-950';
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* FLOATING TOAST POPUP (Top Center) */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-[92%] animate-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl border-2 shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 ${getBorderColor(activeToast.type)}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {getIcon(activeToast.type)}
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm">{activeToast.title}</h4>
                <p className="text-xs text-slate-700 mt-0.5 leading-relaxed font-medium">
                  {activeToast.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onDismissToast}
              className="text-slate-400 hover:text-slate-700 p-1 cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATION CENTER MODAL / DRAWER */}
      {isOpenDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
          <div 
            className="fixed inset-0" 
            onClick={onCloseDrawer} 
          />

          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 animate-in zoom-in-95 duration-200 my-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
                  <Bell className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm">اعلان‌ها و اطلاعیه‌ها</h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-rose-500 text-white font-black px-2 py-0.5 rounded-full">
                        {toPersianDigits(unreadCount)} جدید
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">پیام‌های سیستمی، وضعیت سفارش‌ها و جوایز</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseDrawer}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={onMarkAllAsRead}
                disabled={unreadCount === 0}
                className={`flex items-center gap-1 font-bold ${
                  unreadCount > 0 ? 'text-indigo-600 hover:text-indigo-800 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>علامت‌گذاری همه به‌عنوان خوانده‌شده</span>
              </button>

              <button
                type="button"
                onClick={onClearNotifications}
                disabled={notifications.length === 0}
                className={`flex items-center gap-1 font-bold ${
                  notifications.length > 0 ? 'text-rose-600 hover:text-rose-800 cursor-pointer' : 'text-slate-400 cursor-not-allowed'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>پاکسازی</span>
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100 p-2">
              {notifications.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-300">
                    <Bell className="w-6 h-6" />
                  </div>
                  <p className="font-bold">هیچ اعلانی در حال حاضر وجود ندارد.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (onNotificationClick) onNotificationClick(n);
                    }}
                    className={`p-3.5 rounded-2xl transition cursor-pointer flex items-start gap-3 ${
                      !n.read ? 'bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-xs font-black ${!n.read ? 'text-indigo-950 font-black' : 'text-slate-900'}`}>
                          {n.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {toPersianDigits(new Date(n.timestamp).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }))}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">
                        {n.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

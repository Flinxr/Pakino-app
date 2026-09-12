import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Recycle, 
  Sparkles, 
  CheckCircle2, 
  Share2, 
  PlusSquare,
  Smartphone
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('pakino_pwa_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    // Also show for mobile if not dismissed
    const isMobile = /iphone|ipad|ipod|android/i.test(navigator.userAgent);
    const dismissed = sessionStorage.getItem('pakino_pwa_dismissed');
    if (isMobile && !dismissed && !window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => setShowBanner(true), 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setShowBanner(false);
      setDeferredPrompt(null);
    } else {
      setShowIosGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pakino_pwa_dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <>
      {/* PWA Floating Installation Card */}
      <aside aria-label="نصب اپلیکیشن" className="fixed bottom-3 left-3 right-3 sm:bottom-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900/95 text-white p-3.5 sm:p-4 rounded-3xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-3">
            {/* Header Matched Green Recycle Logo */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0 border border-emerald-400/30">
              <Recycle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                <span>نصب وب‌اپلیکیشن پاکینو</span>
                <span className="text-[9px] bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 font-bold px-1.5 py-0.5 rounded-full">
                  PWA
                </span>
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-300 mt-0.5 leading-tight">
                اجرای تمام‌صفحه و سریع‌تر روی صفحه اصلی گوشی شما
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-xl transition cursor-pointer"
            title="بستن"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleInstallClick}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            <span>نصب و افزودن به صفحه اصلی</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            بعداً
          </button>
        </div>
      </aside>

      {/* iOS & Manual Installation Step-by-Step Guide Modal */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4 animate-in zoom-in-95 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-xs">
                  <Recycle className="w-4 h-4" />
                </div>
                <h3 className="font-black text-sm text-slate-900">
                  افزودن پاکینو به صفحه اصلی گوشی
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosGuide(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer p-1"
              >
                ✕
              </button>
            </div>

            <div className="text-center py-1">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-700 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mx-auto mb-2 border-2 border-emerald-300">
                <Recycle className="w-9 h-9" />
              </div>
              <h4 className="font-black text-sm text-slate-900">وب‌اپلیکیشن هوشمند پاکینو</h4>
              <p className="text-xs text-slate-500 mt-0.5">سبک، پرسرعت و بدون نیاز به دانلود از بازار</p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
              <div className="flex items-start gap-2.5 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۱
                </div>
                <div>
                  در مرورگر، دکمه <strong className="text-slate-900 font-black">اشتراک‌گذاری (Share)</strong> یا منوی سه‌نقطه را لمس کنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۲
                </div>
                <div>
                  گزینه <strong className="text-slate-900 font-black">Add to Home Screen (افزودن به صفحه اصلی)</strong> را انتخاب کنید.
                </div>
              </div>

              <div className="flex items-start gap-2.5 text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                  ۳
                </div>
                <div>
                  سپس گزینه <strong className="text-slate-900 font-black">Add (افزودن)</strong> را تایید نمایید تا آیکون سبز رنگ پاکینو روی گوشی شما نصب شود.
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              متوجه شدم
            </button>
          </div>
        </div>
      )}
    </>
  );
};

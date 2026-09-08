import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Only show if not dismissed in this session
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback guide for iOS or browsers that don't support automated prompt
      alert('برای نصب وب‌اپلیکیشن در آیفون: دکمه Share را در سافاری بزنید و گزینه "Add to Home Screen" را انتخاب کنید.');
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setShowBanner(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem('pakino_pwa_dismissed', 'true');
  };

  if (isInstalled || !showBanner) return null;

  return (
    <div className="fixed top-14 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-50 bg-slate-900/95 text-white p-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-white flex items-center gap-1.5">
              <span>نصب اپلیکیشن پاکینو</span>
              <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full">
                نسخه PWA
              </span>
            </h4>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-tight">
              دسترسی سریع‌تر، فول‌اسکرین و بدون نیاز به دانلود از مارکت‌ها
            </p>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleInstallClick}
          className="flex-1 py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
        >
          <Download className="w-3.5 h-3.5" />
          <span>افزودن به صفحه اصلی</span>
        </button>

        <button
          onClick={handleDismiss}
          className="py-1.5 px-3 bg-white/10 hover:bg-white/20 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          بعداً
        </button>
      </div>
    </div>
  );
};

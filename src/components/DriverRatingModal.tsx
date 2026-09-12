import React, { useState } from 'react';
import { 
  X, 
  Star, 
  Truck, 
  MessageSquare, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck,
  Send
} from 'lucide-react';
import { PickupRequest } from '../types';
import { toPersianDigits } from '../utils/persian';

interface DriverRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PickupRequest | null;
  onSubmitRating: (requestId: string, rating: number, comment: string, isAnonymous: boolean) => void;
}

export const DriverRatingModal: React.FC<DriverRatingModalProps> = ({
  isOpen,
  onClose,
  request,
  onSubmitRating
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !request) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRating(request.id, rating, comment, isAnonymous);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5: return 'عالی و بسیار خوش‌برخورد';
      case 4: return 'خوب و سر وقت';
      case 3: return 'متوسط و معمولی';
      case 2: return 'ضعیف / تاخیر در مراجعه';
      case 1: return 'بسیار ناراضی';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Star className="w-5 h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base">
                ثبت نظر و امتیاز به سفیر پاکینو
              </h3>
              <p className="text-[11px] text-emerald-200">
                سفارش: {request.trackingCode}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-black text-slate-900 text-base">با تشکر از همراهی شما!</h4>
            <p className="text-xs text-slate-500">
              امتیاز شما به صورت محرمانه ثبت شد و در ارتقای کیفیت خدمت‌رسانی پاکیاران موثر است.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            
            {/* Driver & Vehicle Badge */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-base shrink-0">
                🚗
              </div>
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-black text-slate-900">
                  {request.driverName || 'سفیر پاکینو'}
                </div>
                <div className="text-slate-500 text-[11px] mt-0.5">
                  خودرو: {request.vehicleModel || 'وانت پراید مجهز به ترازوی دیجیتال'}
                </div>
                {request.vehiclePlate && (
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    پلاک: {request.vehiclePlate}
                  </div>
                )}
              </div>
            </div>

            {/* Stars Rating Selector */}
            <div className="text-center py-2 space-y-2">
              <div className="text-xs font-bold text-slate-700">میزان رضایت شما از خدمات و برخورد سفیر:</div>
              <div className="flex justify-center items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-200 fill-slate-100'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-black text-amber-800 h-5">
                {getRatingLabel(hoverRating || rating)}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                توضیحات و پیشنهاد شما (اختیاری):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="مثال: بسیار سر وقت تشریف آوردند و وزن‌کشی دقیق انجام شد..."
                rows={3}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
              <input
                type="checkbox"
                id="anonCheck"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="accent-emerald-600 rounded-sm"
              />
              <label htmlFor="anonCheck" className="cursor-pointer font-bold select-none">
                ارسال به صورت محرمانه (عدم نمایش نام شهروند به راننده)
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>ثبت امتیاز و نظر</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  DollarSign, 
  Info, 
  Tag, 
  Sparkles,
  Layers,
  ArrowDownCircle
} from 'lucide-react';
import { WasteCategory } from '../types';
import { WASTE_CATEGORIES } from '../data/cities';
import { toPersianDigits } from '../utils/persian';

interface WastePriceAccordionProps {
  cityName: string;
  wasteCategories?: WasteCategory[];
}

export const WastePriceAccordion: React.FC<WastePriceAccordionProps> = ({ 
  cityName,
  wasteCategories = WASTE_CATEGORIES 
}) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);

  const toggleCategory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategoryId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all">
      {/* Master Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsMainOpen(!isMainOpen)}
        className="w-full p-4 sm:p-5 flex items-center justify-between gap-3 text-right hover:bg-slate-50/80 transition cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">
                تعرفه و نرخ مصوب بازیافت ({cityName})
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                به‌روزرسانی رسمی
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isMainOpen ? 'جهت بستن لیست کلیک کنید' : 'جهت مشاهده نرخ هر کیلوگرم کلیک فرمایید'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-bold text-emerald-700">
            {isMainOpen ? 'بستن' : 'مشاهده نرخ‌ها'}
          </span>
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            {isMainOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {/* Accordion Content */}
      {isMainOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-2 animate-in fade-in duration-300">
          <p className="text-xs text-slate-600 mb-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>تسویه آنی بر اساس توزین دیجیتال هنگام مراجعه سفیر پاکینو یا واریز مستقیم به کیف پول</span>
          </p>

          <div className="space-y-2">
            {wasteCategories.map((item) => {
              const isExpanded = expandedCategoryId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 overflow-hidden bg-slate-50/60 transition"
                >
                  <button
                    type="button"
                    onClick={(e) => toggleCategory(item.id, e)}
                    className="w-full p-3 sm:p-3.5 flex items-center justify-between gap-2 text-right hover:bg-emerald-50/30 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl shrink-0">{item.icon}</span>
                      <div className="min-w-0">
                        <div className="font-black text-xs sm:text-sm text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isExpanded ? 'بستن جزئیات' : 'مشاهده اقلام مجاز'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                        <span className="font-mono font-black text-emerald-700 text-xs sm:text-sm">
                          {toPersianDigits(item.ratePerKgTomans.toLocaleString())}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 mr-1">تومان/کیلو</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                    </div>
                  </button>

                  {/* Child Item Details */}
                  {isExpanded && (
                    <div className="p-3 bg-white border-t border-slate-200/80 text-xs space-y-1.5 animate-in fade-in">
                      {item.description && (
                        <p className="text-slate-700 leading-relaxed">
                          <strong>توضیحات:</strong> {item.description}
                        </p>
                      )}
                      {item.examples && (
                        <p className="text-slate-500 text-[11px] leading-relaxed">
                          <strong>نمونه اقلام:</strong> {item.examples}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

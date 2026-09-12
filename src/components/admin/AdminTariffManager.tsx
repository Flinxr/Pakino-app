import React, { useState } from 'react';
import { 
  Coins, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Sparkles, 
  X, 
  Search,
  CheckCircle2,
  TrendingUp,
  Tag
} from 'lucide-react';
import { WasteCategory } from '../../types';
import { WASTE_CATEGORIES as DEFAULT_CATEGORIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminTariffManagerProps {
  wasteCategories: WasteCategory[];
  onUpdateWasteCategories: (categories: WasteCategory[]) => void;
}

const EMOJI_PRESETS = ['🧴', '📦', '🥫', '🍾', '🍞', '🔌', '🔋', '🗞️', '🗑️', '🛢️', '💻', '👕', '🚲', '🪵'];

export const AdminTariffManager: React.FC<AdminTariffManagerProps> = ({
  wasteCategories,
  onUpdateWasteCategories
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<WasteCategory | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    icon: string;
    ratePerKgTomans: number;
    description: string;
    examples: string;
  }>({
    id: '',
    name: '',
    icon: '🧴',
    ratePerKgTomans: 15000,
    description: '',
    examples: ''
  });

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  const filteredCategories = wasteCategories.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.examples || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Open Add Modal
  const handleOpenAdd = () => {
    setFormData({
      id: `waste-${Date.now().toString().slice(-4)}`,
      name: '',
      icon: '🧴',
      ratePerKgTomans: 10000,
      description: '',
      examples: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (cat: WasteCategory) => {
    setEditingCategory(cat);
    setFormData({
      id: cat.id,
      name: cat.name,
      icon: cat.icon || '🧴',
      ratePerKgTomans: cat.ratePerKgTomans,
      description: cat.description || '',
      examples: cat.examples || ''
    });
  };

  // Save (Add or Edit)
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showFeedback('لطفاً نام قلم بازیافتی را وارد فرمایید.', 'error');
      return;
    }
    if (formData.ratePerKgTomans <= 0) {
      showFeedback('نرخ هر کیلوگرم باید مقداری بزرگتر از صفر باشد.', 'error');
      return;
    }

    if (editingCategory) {
      // Update existing
      const updated = wasteCategories.map((c) =>
        c.id === editingCategory.id
          ? {
              ...c,
              name: formData.name.trim(),
              icon: formData.icon || '🧴',
              ratePerKgTomans: Number(formData.ratePerKgTomans),
              description: formData.description.trim(),
              examples: formData.examples.trim()
            }
          : c
      );
      onUpdateWasteCategories(updated);
      setEditingCategory(null);
      showFeedback(`قلم بازیافتی «${formData.name}» با موفقیت به‌روزرسانی شد.`);
    } else {
      // Add new
      const newCat: WasteCategory = {
        id: formData.id || `waste-${Date.now().toString().slice(-4)}`,
        name: formData.name.trim(),
        icon: formData.icon || '🧴',
        ratePerKgTomans: Number(formData.ratePerKgTomans),
        description: formData.description.trim(),
        examples: formData.examples.trim()
      };
      const updated = [...wasteCategories, newCat];
      onUpdateWasteCategories(updated);
      setIsAddModalOpen(false);
      showFeedback(`قلم جدید «${formData.name}» با موفقیت به فهرست نرخ‌های مصوب افزوده شد.`);
    }
  };

  // Quick price change (+1000 / -1000)
  const handleQuickPriceAdjust = (catId: string, deltaTomans: number) => {
    const updated = wasteCategories.map((c) => {
      if (c.id === catId) {
        const newRate = Math.max(500, c.ratePerKgTomans + deltaTomans);
        return { ...c, ratePerKgTomans: newRate };
      }
      return c;
    });
    onUpdateWasteCategories(updated);
    showFeedback('نرخ با موفقیت تغییر یافت.');
  };

  // Delete category
  const handleDeleteCategory = (catId: string) => {
    const target = wasteCategories.find((c) => c.id === catId);
    const updated = wasteCategories.filter((c) => c.id !== catId);
    onUpdateWasteCategories(updated);
    setDeleteConfirmId(null);
    showFeedback(`قلم «${target?.name || ''}» از فهرست مصوب حذف شد.`);
  };

  // Reset to default
  const handleResetToDefaults = () => {
    if (window.confirm('آیا از بازنشانی کامل نرخ‌ها و اقلام به مقادیر اولیه سامانه اطمینان دارید؟')) {
      onUpdateWasteCategories(DEFAULT_CATEGORIES);
      showFeedback('فهرست تعرفه‌ها به تنظیمات اولیه کارخانه بازنشانی شد.');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Top Controls Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                مدیریت نرخ و تعرفه مصوب خرید پسماند بازیافتی
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                تنظیم، ویرایش، حذف و افزودن اقلام و بهای خرید هر کیلوگرم در سراسر سامانه
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              title="بازگرداندن به حالت پیش‌فرض"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی پیش‌فرض</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAdd}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-black rounded-xl transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>افزودن قلم بازیافتی جدید</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className={`p-3 rounded-2xl text-xs font-bold flex items-center justify-between transition animate-in fade-in ${
            feedbackMessage.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search bar & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در اقلام، توضیحات و مثال‌ها..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
          </div>

          <div className="text-xs text-slate-500 font-bold self-end sm:self-center">
            تعداد اقلام مصوب: <span className="font-mono text-slate-900 font-black">{toPersianDigits(wasteCategories.length)}</span> قلم
          </div>
        </div>
      </div>

      {/* Categories Cards / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
        {filteredCategories.map((cat) => (
          <div
            key={cat.id}
            className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-amber-300 transition-all shadow-2xs space-y-3.5 relative overflow-hidden group"
          >
            {/* Header: Icon, Name, Price badge */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  {cat.icon || '📦'}
                </div>
                <div>
                  <h4 className="font-black text-xs sm:text-sm text-slate-900">{cat.name}</h4>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">کد شناسایی: {cat.id}</div>
                </div>
              </div>

              {/* Price Tag */}
              <div className="text-left bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-200/80 px-3 py-1.5 rounded-2xl shrink-0">
                <div className="text-[10px] text-emerald-700 font-semibold">نرخ مصوب هر کیلو</div>
                <div className="font-mono font-black text-sm text-emerald-900">
                  {formatTomans(cat.ratePerKgTomans)} <span className="text-[10px] font-sans">تومان</span>
                </div>
              </div>
            </div>

            {/* Description & Examples */}
            {(cat.description || cat.examples) && (
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                {cat.description && (
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    <strong className="text-slate-900">توضیحات: </strong>{cat.description}
                  </p>
                )}
                {cat.examples && (
                  <p className="text-slate-500 text-[10px]">
                    <strong className="text-slate-700">اقلام مشمول: </strong>{cat.examples}
                  </p>
                )}
              </div>
            )}

            {/* Quick Price Adjust and Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
              {/* Quick Adjust Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold ml-1">تغییر سریع:</span>
                <button
                  type="button"
                  onClick={() => handleQuickPriceAdjust(cat.id, 1000)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                  title="افزایش ۱,۰۰۰ تومان"
                >
                  +۱,۰۰۰
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPriceAdjust(cat.id, 5000)}
                  className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded-lg border border-emerald-200 transition cursor-pointer"
                  title="افزایش ۵,۰۰۰ تومان"
                >
                  +۵,۰۰۰
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPriceAdjust(cat.id, -1000)}
                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-mono font-bold rounded-lg border border-rose-200 transition cursor-pointer"
                  title="کاهش ۱,۰۰۰ تومان"
                >
                  -۱,۰۰۰
                </button>
              </div>

              {/* Edit & Delete Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-2 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition border border-slate-200 hover:border-amber-300 cursor-pointer flex items-center gap-1 text-xs font-bold"
                  title="ویرایش کامل قلم و قیمت"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">ویرایش</span>
                </button>

                {deleteConfirmId === cat.id ? (
                  <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-xl border border-rose-200 animate-in fade-in">
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold rounded-lg transition cursor-pointer"
                    >
                      تایید حذف
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(null)}
                      className="p-1 text-slate-500 hover:text-slate-800 rounded-lg cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmId(cat.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition border border-transparent hover:border-rose-200 cursor-pointer"
                    title="حذف قلم بازیافتی"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
          موردی متناسب با عبارت جستجو یافت نشد.
        </div>
      )}

      {/* Modal: Add or Edit Category */}
      {(isAddModalOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 to-yellow-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                  <Coins className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm sm:text-base">
                    {editingCategory ? `ویرایش قلم بازیافتی: ${editingCategory.name}` : 'افزودن قلم بازیافتی مصوب جدید'}
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    اطلاعات قلم و بهای هر کیلوگرم در سراسر برنامه اعمال خواهد شد
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingCategory(null);
                }}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveCategory} className="p-5 sm:p-6 space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نام قلم بازیافتی <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: نایلون و سلفون بسته‌بندی، ظروف یکبار مصرف، باتری کهنه..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                  required
                />
              </div>

              {/* Rate per kg */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  نرخ مصوب خرید هر کیلوگرم (تومان) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={formData.ratePerKgTomans}
                    onChange={(e) => setFormData({ ...formData, ratePerKgTomans: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white pr-4 pl-16"
                    required
                  />
                  <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">تومان</span>
                </div>
                <p className="text-[11px] text-emerald-700 font-medium mt-1">
                  معادل: {formatTomans(formData.ratePerKgTomans)} تومان به ازای هر ۱ کیلوگرم تحویلی
                </p>
              </div>

              {/* Icon Emoji Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  آیکون / نماد تصویری قلم:
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition cursor-pointer ${
                        formData.icon === emoji 
                          ? 'bg-amber-100 border-2 border-amber-500 shadow-xs scale-110' 
                          : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">یا نماد دلخواه:</span>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    maxLength={4}
                    className="w-16 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-center text-sm font-bold"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  توضیحات و شرایط تفکیک (اختیاری):
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="شرایط تمیزی، نوع تفکیک و نکات لازم برای تحویل به سفیران..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-none"
                />
              </div>

              {/* Examples */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مثال‌های رایج خانگی (جهت راهنمایی شهروندان):
                </label>
                <input
                  type="text"
                  value={formData.examples}
                  onChange={(e) => setFormData({ ...formData, examples: e.target.value })}
                  placeholder="مثال: کیسه فریزر، نایلکس میوه، قوطی شامپو..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-black rounded-xl transition shadow-md shadow-amber-600/25 flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingCategory ? 'ثبت و اعمال تغییرات' : 'افزودن به تعرفه‌ها'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Sliders, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Palette, 
  Layers,
  Recycle,
  Trophy,
  HeartHandshake,
  Gift,
  TreePine,
  Banknote,
  ShieldCheck,
  Coins,
  Truck,
  RotateCcw
} from 'lucide-react';
import { HeroSlide, CityId } from '../../types';
import { INITIAL_HERO_SLIDES } from '../../data/cities';
import { toPersianDigits } from '../../utils/persian';

interface AdminHeroSlidesManagerProps {
  currentCity: CityId;
  slides: HeroSlide[];
  onUpdateSlides: (slides: HeroSlide[]) => void;
}

const AVAILABLE_ICONS = [
  { name: 'Recycle', label: 'بازیافت', icon: Recycle },
  { name: 'Trophy', label: 'جام جوایز', icon: Trophy },
  { name: 'HeartHandshake', label: 'نیکوکاری', icon: HeartHandshake },
  { name: 'Gift', label: 'هدیه و پاداش', icon: Gift },
  { name: 'Sparkles', label: 'ستاره و امتیاز', icon: Sparkles },
  { name: 'TreePine', label: 'درخت و محیط‌زیست', icon: TreePine },
  { name: 'Banknote', label: 'اسکناس و نقدینگی', icon: Banknote },
  { name: 'ShieldCheck', label: 'امنیت و تضمین', icon: ShieldCheck },
  { name: 'Coins', label: 'سکه و طلا', icon: Coins },
  { name: 'Truck', label: 'ناوگان جمع‌آوری', icon: Truck }
];

const GRADIENT_PRESETS = [
  {
    id: 'emerald',
    label: 'سبز زمردی و محیط‌زیست (پیش‌فرض)',
    gradient: 'from-emerald-900 via-emerald-800 to-teal-900',
    tagColor: 'bg-emerald-500/30 text-emerald-100 border border-emerald-400/30',
    previewColor: 'bg-emerald-700'
  },
  {
    id: 'amber',
    label: 'طلایی و کهربایی جشنواره قرعه‌کشی',
    gradient: 'from-amber-900 via-amber-800 to-yellow-950',
    tagColor: 'bg-amber-500/30 text-amber-100 border border-amber-400/30',
    previewColor: 'bg-amber-600'
  },
  {
    id: 'teal',
    label: 'فیروزه‌ای تیره و مسئولیت اجتماعی',
    gradient: 'from-teal-950 via-slate-900 to-emerald-950',
    tagColor: 'bg-teal-500/30 text-teal-100 border border-teal-400/30',
    previewColor: 'bg-teal-700'
  },
  {
    id: 'blue',
    label: 'آبی نفتی و لاجوردی مدرن',
    gradient: 'from-blue-900 via-indigo-900 to-slate-950',
    tagColor: 'bg-blue-500/30 text-blue-100 border border-blue-400/30',
    previewColor: 'bg-blue-700'
  },
  {
    id: 'rose',
    label: 'زرشکی و یاقوتی نیکوکاری',
    gradient: 'from-rose-900 via-rose-800 to-purple-950',
    tagColor: 'bg-rose-500/30 text-rose-100 border border-rose-400/30',
    previewColor: 'bg-rose-700'
  },
  {
    id: 'purple',
    label: 'بنفش رویال و لاکچری',
    gradient: 'from-purple-950 via-violet-900 to-indigo-950',
    tagColor: 'bg-purple-500/30 text-purple-100 border border-purple-400/30',
    previewColor: 'bg-purple-700'
  },
  {
    id: 'slate',
    label: 'مشکی کربنی و طوسی تیتانیوم',
    gradient: 'from-slate-950 via-slate-900 to-zinc-900',
    tagColor: 'bg-slate-500/30 text-slate-100 border border-slate-400/30',
    previewColor: 'bg-slate-800'
  }
];

const ACTION_TARGETS = [
  { id: 'pickup', label: 'باز کردن فرم ثبت سفارش جمع‌آوری' },
  { id: 'lottery', label: 'انتقال به بخش گردونه و قرعه‌کشی' },
  { id: 'wallet', label: 'باز کردن کیف پول و موجودی' },
  { id: 'share', label: 'باز کردن پنجره دعوت از دوستان' },
  { id: 'feedback', label: 'ثبت نظر و پیام به مدیریت' }
];

export const AdminHeroSlidesManager: React.FC<AdminHeroSlidesManagerProps> = ({
  currentCity,
  slides = [],
  onUpdateSlides
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);

  // Form State
  const [formTag, setFormTag] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formSubtitle, setFormSubtitle] = useState('');
  const [formHighlightText, setFormHighlightText] = useState('');
  const [formGradient, setFormGradient] = useState(GRADIENT_PRESETS[0].gradient);
  const [formTagColor, setFormTagColor] = useState(GRADIENT_PRESETS[0].tagColor);
  const [formIconName, setFormIconName] = useState('Recycle');
  const [formActionText, setFormActionText] = useState('ثبت فوری جمع‌آوری');
  const [formActionType, setFormActionType] = useState<HeroSlide['actionType']>('pickup');
  const [formIsActive, setFormIsActive] = useState(true);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingSlide(null);
    setFormTag('جشنواره ویژه نوروز و بهار پاکیاران');
    setFormTitle('طرح تفکیک بهاره با جوایز ۲ برابر نقدی');
    setFormSubtitle('با هر بار تحویل پسماند خشک در این ماه، دو برابر امتیاز شانس طلایی دریافت کنید.');
    setFormHighlightText('اعزام سریع ناوگان در تمام مناطق شهر');
    setFormGradient(GRADIENT_PRESETS[0].gradient);
    setFormTagColor(GRADIENT_PRESETS[0].tagColor);
    setFormIconName('Sparkles');
    setFormActionText('ثبت سفارش جمع‌آوری');
    setFormActionType('pickup');
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormTag(slide.tag);
    setFormTitle(slide.title);
    setFormSubtitle(slide.subtitle);
    setFormHighlightText(slide.highlightText);
    setFormGradient(slide.bgGradient);
    setFormTagColor(slide.tagColor || GRADIENT_PRESETS[0].tagColor);
    setFormIconName(slide.iconName || 'Recycle');
    setFormActionText(slide.actionText || 'ثبت فوری جمع‌آوری');
    setFormActionType(slide.actionType || 'pickup');
    setFormIsActive(slide.isActive ?? true);
    setIsModalOpen(true);
  };

  // Save Slide
  const handleSaveSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSlide) {
      const updated = slides.map((s) =>
        s.id === editingSlide.id
          ? {
              ...s,
              tag: formTag,
              title: formTitle,
              subtitle: formSubtitle,
              highlightText: formHighlightText,
              bgGradient: formGradient,
              tagColor: formTagColor,
              iconName: formIconName,
              actionText: formActionText,
              actionType: formActionType,
              isActive: formIsActive
            }
          : s
      );
      onUpdateSlides(updated);
    } else {
      const newSlide: HeroSlide = {
        id: `slide-${Date.now().toString().slice(-4)}`,
        tag: formTag,
        title: formTitle,
        subtitle: formSubtitle,
        highlightText: formHighlightText,
        bgGradient: formGradient,
        tagColor: formTagColor,
        iconName: formIconName,
        actionText: formActionText,
        actionType: formActionType,
        isActive: formIsActive,
        order: slides.length + 1
      };
      onUpdateSlides([...slides, newSlide]);
    }
    setIsModalOpen(false);
  };

  // Delete Slide
  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert('حداقل وجود یک اسلاید برای صفحه اصلی ضروری است.');
      return;
    }
    if (confirm('آیا از حذف این اسلاید اطمینان دارید؟')) {
      onUpdateSlides(slides.filter((s) => s.id !== id));
    }
  };

  // Toggle Active
  const handleToggleActive = (id: string) => {
    const updated = slides.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    onUpdateSlides(updated);
  };

  // Move Up / Down
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[targetIndex];
    newSlides[targetIndex] = temp;
    onUpdateSlides(newSlides);
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (confirm('آیا مایلید اسلایدهای صفحه اصلی به حالت پیش‌فرض بازگردانی شوند؟')) {
      onUpdateSlides(INITIAL_HERO_SLIDES);
    }
  };

  const getIconComponent = (iconName: string) => {
    const found = AVAILABLE_ICONS.find((i) => i.name === iconName);
    return found ? found.icon : Recycle;
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                مدیریت اسلایدها و بنرهای اسلایدر صفحه اصلی شهروند
              </h3>
              <span className="text-[10px] bg-teal-100 text-teal-800 font-black px-2 py-0.5 rounded-full">
                شخصی‌سازی زنده
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              افزودن و حذف اسلایدها، تغییر تم رنگی و پس‌زمینه گرادیانت، ویرایش متن‌ها و دکمه‌های اقدام شهروند
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="بازنشانی به اسلایدهای اولیه"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">بازنشانی پیش‌فرض</span>
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن اسلاید جدید</span>
          </button>
        </div>
      </div>

      {/* Slide Cards List */}
      <div className="space-y-3.5">
        {slides.map((slide, index) => {
          const IconComp = getIconComponent(slide.iconName);
          return (
            <div
              key={slide.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-2xs hover:border-teal-300 transition space-y-3.5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center font-mono">
                    {toPersianDigits(index + 1)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-slate-900">{slide.title}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${slide.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                        {slide.isActive ? 'فعال در اپ' : 'غیرفعال'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      برچسب: {slide.tag} • دکمه: {slide.actionText || 'بدون دکمه'}
                    </span>
                  </div>
                </div>

                {/* Reorder and Action Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition cursor-pointer"
                    title="انتقال به بالا"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-xl text-slate-700 transition cursor-pointer"
                    title="انتقال به پایین"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleActive(slide.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      slide.isActive ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {slide.isActive ? 'فعال' : 'غیرفعال'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(slide)}
                    className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                    title="ویرایش اسلاید و پس‌زمینه"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                    title="حذف اسلاید"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Real Mobile Slide Preview Render */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs">
                <div className={`p-4 sm:p-5 bg-gradient-to-r ${slide.bgGradient} text-white relative overflow-hidden`}>
                  {/* Decorative ambient lights */}
                  <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                  
                  <div className="relative z-10 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full ${slide.tagColor || 'bg-white/20 text-white'}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{slide.tag}</span>
                      </span>

                      <div className="w-8 h-8 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                        <IconComp className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="font-black text-sm sm:text-base text-white leading-snug">
                      {slide.title}
                    </h4>

                    <p className="text-xs text-slate-100/90 leading-relaxed">
                      {slide.subtitle}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/15">
                      <span className="text-[11px] text-emerald-200 font-bold">
                        {slide.highlightText}
                      </span>
                      {slide.actionText && (
                        <span className="px-3 py-1 bg-white text-slate-900 font-black text-xs rounded-xl shadow-xs">
                          {slide.actionText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE & EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-teal-600" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingSlide ? 'ویرایش اسلاید و تغییر رنگ پس‌زمینه' : 'افزودن اسلاید و بنر جدید'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-3.5">
              {/* Live Preview Inside Modal */}
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1.5">
                  پیش‌نمایش زنده ظاهر اسلاید:
                </label>
                <div className={`p-4 rounded-2xl bg-gradient-to-r ${formGradient} text-white relative overflow-hidden shadow-inner`}>
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full ${formTagColor}`}>
                        <Sparkles className="w-3 h-3" />
                        <span>{formTag || 'برچسب عنوان'}</span>
                      </span>
                    </div>
                    <div className="font-black text-sm text-white">
                      {formTitle || 'عنوان اسلاید در صفحه اصلی'}
                    </div>
                    <div className="text-xs text-white/90">
                      {formSubtitle || 'توضیحات فرعی و راهنمای شهروند'}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/20 text-xs">
                      <span className="text-[11px] text-emerald-200 font-bold">{formHighlightText || 'نکته برجسته'}</span>
                      <span className="px-3 py-1 bg-white text-slate-900 font-black text-[11px] rounded-xl">
                        {formActionText || 'دکمه اقدام'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Gradient Palette Picker */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1.5">
                  انتخاب تم رنگی و پس‌زمینه اسلاید:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GRADIENT_PRESETS.map((preset) => {
                    const isSelected = formGradient === preset.gradient;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setFormGradient(preset.gradient);
                          setFormTagColor(preset.tagColor);
                        }}
                        className={`p-2.5 rounded-xl border text-right transition flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'border-teal-600 bg-teal-50 ring-2 ring-teal-500/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-lg ${preset.previewColor} shrink-0 shadow-xs`} />
                        <span className="text-[11px] font-bold text-slate-800 truncate">{preset.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    عنوان اصلی اسلاید:
                  </label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="مثال: جشنواره جوایز طلایی ماهانه"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-teal-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    برچسب بالای اسلاید:
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    placeholder="مثال: پوشش فعال"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-teal-500"
                    required
                  />
                </div>
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  توضیحات فرعی و پیام ترغیب‌کننده:
                </label>
                <textarea
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  placeholder="متن تشویقی یا اطلاع‌رسانی برای شهروندان..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white focus:border-teal-500"
                  required
                />
              </div>

              {/* Highlight Text & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    متن هایلایت و نکته پایین اسلاید:
                  </label>
                  <input
                    type="text"
                    value={formHighlightText}
                    onChange={(e) => setFormHighlightText(e.target.value)}
                    placeholder="مثال: ۲ برابر شانس بیشتر در حالت نیکوکاری"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    آیکون نشان اسلاید:
                  </label>
                  <select
                    value={formIconName}
                    onChange={(e) => setFormIconName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  >
                    {AVAILABLE_ICONS.map((i) => (
                      <option key={i.name} value={i.name}>{i.label} ({i.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Button & Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    متن دکمه اقدام اسلاید:
                  </label>
                  <input
                    type="text"
                    value={formActionText}
                    onChange={(e) => setFormActionText(e.target.value)}
                    placeholder="مثال: ثبت فوری جمع‌آوری"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    عملکرد پس از لمس دکمه:
                  </label>
                  <select
                    value={formActionType}
                    onChange={(e) => setFormActionType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  >
                    {ACTION_TARGETS.map((t) => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slide-active-toggle"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500 cursor-pointer"
                />
                <label htmlFor="slide-active-toggle" className="text-xs font-black text-slate-800 cursor-pointer">
                  این اسلاید در حال حاضر فعال باشد و در صفحه اصلی نمایش داده شود
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ذخیره اسلاید و پس‌زمینه</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

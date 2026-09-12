import React, { useState } from 'react';
import { 
  HeartHandshake, 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Users, 
  Target, 
  Coins, 
  Building2, 
  Trees, 
  GraduationCap, 
  Gamepad2, 
  Stethoscope, 
  TrendingUp,
  MapPin,
  Flame,
  Award
} from 'lucide-react';
import { CharityProject, CityId } from '../../types';
import { CITIES } from '../../data/cities';
import { toPersianDigits, formatTomans } from '../../utils/persian';

interface AdminCharityManagerProps {
  currentCity: CityId;
  projects: CharityProject[];
  onUpdateProjects: (projects: CharityProject[]) => void;
}

const CATEGORY_OPTIONS: { id: CharityProject['category']; label: string; icon: any; color: string }[] = [
  { id: 'playground', label: 'پارک و بازی کودکان', icon: Gamepad2, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { id: 'school', label: 'مدارس و دانش‌آموزان', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { id: 'greenery', label: 'طبیعت، بلوط و محیط زیست', icon: Trees, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { id: 'health', label: 'بهداشت، سلامت و درمان', icon: Stethoscope, color: 'text-rose-600 bg-rose-50 border-rose-200' }
];

export const AdminCharityManager: React.FC<AdminCharityManagerProps> = ({
  currentCity,
  projects = [],
  onUpdateProjects
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<CharityProject | null>(null);
  const [selectedCityFilter, setSelectedCityFilter] = useState<string>('all');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formCityId, setFormCityId] = useState<CityId>(currentCity);
  const [formCategory, setFormCategory] = useState<CharityProject['category']>('playground');
  const [formDescription, setFormDescription] = useState('');
  const [formTargetAmountTomans, setFormTargetAmountTomans] = useState<number>(40000000);
  const [formRaisedAmountTomans, setFormRaisedAmountTomans] = useState<number>(15000000);
  const [formTotalContributors, setFormTotalContributors] = useState<number>(85);
  const [formBadge, setFormBadge] = useState('پروژه شاخص شهروندی');

  // Open modal for new project
  const handleOpenCreateNew = () => {
    setEditingProject(null);
    setFormTitle('تجهیز و نوسازی امکانات آموزشی مدارس روستایی');
    setFormCityId(currentCity);
    setFormCategory('school');
    setFormDescription('تأمین لوازم‌التحریر، بسته‌های آموزشی و تجهیز کلاس‌های درس با عواید تفکیک بازیافت شهروندان.');
    setFormTargetAmountTomans(35000000);
    setFormRaisedAmountTomans(12000000);
    setFormTotalContributors(64);
    setFormBadge('آموزش و توانمندسازی');
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (project: CharityProject) => {
    setEditingProject(project);
    setFormTitle(project.title);
    setFormCityId(project.cityId);
    setFormCategory(project.category);
    setFormDescription(project.description);
    setFormTargetAmountTomans(project.targetAmountTomans);
    setFormRaisedAmountTomans(project.raisedAmountTomans);
    setFormTotalContributors(project.totalContributors);
    setFormBadge(project.badge);
    setIsModalOpen(true);
  };

  // Save Project (Create or Update)
  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAmt = Math.max(1000000, Number(formTargetAmountTomans));
    const raisedAmt = Math.max(0, Number(formRaisedAmountTomans));
    const progress = Math.min(100, Math.round((raisedAmt / targetAmt) * 100));
    const cityName = CITIES[formCityId]?.name || 'نورآباد ممسنی';

    if (editingProject) {
      const updated = projects.map((p) =>
        p.id === editingProject.id
          ? {
              ...p,
              title: formTitle,
              cityId: formCityId,
              cityName,
              category: formCategory,
              description: formDescription,
              targetAmountTomans: targetAmt,
              raisedAmountTomans: raisedAmt,
              totalContributors: Number(formTotalContributors),
              progressPercent: progress,
              badge: formBadge
            }
          : p
      );
      onUpdateProjects(updated);
    } else {
      const newProject: CharityProject = {
        id: `proj-${Date.now().toString().slice(-4)}`,
        title: formTitle,
        cityId: formCityId,
        cityName,
        category: formCategory,
        description: formDescription,
        targetAmountTomans: targetAmt,
        raisedAmountTomans: raisedAmt,
        totalContributors: Number(formTotalContributors),
        progressPercent: progress,
        badge: formBadge
      };
      onUpdateProjects([newProject, ...projects]);
    }
    setIsModalOpen(false);
  };

  // Delete Project
  const handleDeleteProject = (id: string) => {
    if (confirm('آیا از حذف این پروژه نیکوکاری اطمینان دارید؟')) {
      onUpdateProjects(projects.filter((p) => p.id !== id));
    }
  };

  // Filter projects by city
  const filteredProjects = projects.filter((p) => {
    if (selectedCityFilter === 'all') return true;
    return p.cityId === selectedCityFilter;
  });

  // KPI Calculations
  const totalTargetFunds = projects.reduce((sum, p) => sum + p.targetAmountTomans, 0);
  const totalRaisedFunds = projects.reduce((sum, p) => sum + p.raisedAmountTomans, 0);
  const totalContributorsCount = projects.reduce((sum, p) => sum + p.totalContributors, 0);
  const overallProgress = totalTargetFunds > 0 ? Math.round((totalRaisedFunds / totalTargetFunds) * 100) : 0;

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-sm sm:text-base text-slate-900">
                مدیریت پروژه‌های مسئولیت اجتماعی و نیکوکاری
              </h3>
              <span className="text-[10px] bg-rose-100 text-rose-800 font-black px-2 py-0.5 rounded-full">
                طرح اهدا به جای پول نقد
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              تعریف اهداف عمرانی و زیست‌محیطی شهری، تنظیم مبلغ هدف پروژه، ویرایش میزان پیشرفت و مدیریت مشارکت‌ها
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateNew}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>تعریف پروژه نیکوکاری جدید</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">مجموع مبلغ هدف پروژه‌ها</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-2 font-mono">
            {toPersianDigits(formatTomans(totalTargetFunds))}
          </div>
          <div className="text-[10px] text-slate-400 mt-1 font-bold">
            مجموع بودجه مصوب شهرها
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold">مبالغ جمع‌آوری شده (بازیافت)</span>
            <Coins className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-emerald-700 mt-2 font-mono">
            {toPersianDigits(formatTomans(totalRaisedFunds))}
          </div>
          <div className="text-[10px] text-emerald-600 mt-1 font-bold">
            {toPersianDigits(overallProgress)}٪ تحقق بودجه تا امروز
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600">
            <span className="text-xs font-bold">کل مشارکت‌های شهروندی</span>
            <Users className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-rose-700 mt-2 font-mono">
            {toPersianDigits(totalContributorsCount)} <span className="text-xs font-sans font-bold">حامی</span>
          </div>
          <div className="text-[10px] text-rose-500 mt-1 font-bold">
            اهدای عواید با ضریب ۲ شانس
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold">تعداد طرح‌های فعال</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-black text-amber-800 mt-2 font-mono">
            {toPersianDigits(projects.length)} <span className="text-xs font-sans font-bold">پروژه</span>
          </div>
          <div className="text-[10px] text-amber-600 mt-1 font-bold">
            در تمام مناطق تحت پوشش
          </div>
        </div>
      </div>

      {/* City Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-black text-slate-700 shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-slate-500" />
          <span>فیلتر شهر:</span>
        </span>
        <button
          type="button"
          onClick={() => setSelectedCityFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
            selectedCityFilter === 'all'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          تمام شهرها ({toPersianDigits(projects.length)})
        </button>
        {Object.entries(CITIES).map(([cityKey, cityData]) => {
          const count = projects.filter((p) => p.cityId === cityKey).length;
          return (
            <button
              key={cityKey}
              type="button"
              onClick={() => setSelectedCityFilter(cityKey)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer whitespace-nowrap ${
                selectedCityFilter === cityKey
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cityData.name} ({toPersianDigits(count)})
            </button>
          );
        })}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const categoryMeta = CATEGORY_OPTIONS.find((c) => c.id === project.category) || CATEGORY_OPTIONS[0];
          const CategoryIcon = categoryMeta.icon;

          return (
            <div
              key={project.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs hover:border-rose-300 transition flex flex-col justify-between space-y-4"
            >
              {/* Card Header */}
              <div>
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${categoryMeta.color}`}>
                      <CategoryIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 block">
                        {project.cityName} • {categoryMeta.label}
                      </span>
                      <span className="text-[10px] font-black bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full border border-rose-200 mt-0.5 inline-block">
                        {project.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(project)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
                      title="ویرایش پروژه و تغییر مبلغ هدف"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProject(project.id)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition cursor-pointer"
                      title="حذف پروژه"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Title and Purpose / Description */}
                <div className="mt-3 space-y-1.5">
                  <h4 className="font-black text-sm text-slate-900 leading-snug">
                    {project.title}
                  </h4>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                    <strong className="text-slate-800 font-bold block mb-0.5">هدف و دستاورد پروژه:</strong>
                    {project.description}
                  </div>
                </div>
              </div>

              {/* Financial & Progress Statistics */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">مبلغ هدف تعیین‌شده:</span>
                  <span className="font-mono font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {toPersianDigits(formatTomans(project.targetAmountTomans))}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-bold">مبلغ جمع‌آوری شده:</span>
                  <span className="font-mono font-black text-emerald-800">
                    {toPersianDigits(formatTomans(project.raisedAmountTomans))}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{toPersianDigits(project.totalContributors)} حامی شهروند</span>
                    </span>
                    <span className="text-rose-700 font-black">
                      {toPersianDigits(project.progressPercent)}٪ تکمیل شده
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className="h-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${project.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE / EDIT PROJECT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-600" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingProject ? 'ویرایش پروژه مسئولیت اجتماعی' : 'تعریف پروژه جدید مسئولیت اجتماعی و نیکوکاری'}
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

            <form onSubmit={handleSaveProject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  عنوان پروژه نیکوکاری:
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="مثال: تجهیز و نصب تاب و سرسره استاندارد پارک کودک"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    شهر / منطقه هدف:
                  </label>
                  <select
                    value={formCityId}
                    onChange={(e) => setFormCityId(e.target.value as CityId)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  >
                    {Object.entries(CITIES).map(([k, c]) => (
                      <option key={k} value={k}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    دسته‌بندی موضوعی:
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold focus:bg-white"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-800 mb-1">
                  هدف پروژه و جزئیات اجرایی (توضیح شفاف برای شهروندان):
                </label>
                <textarea
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="توضیح دهید که درآمد حاصل از تفکیک بازیافت شهروندان دقیقاً صرف چه اقدامی در این پروژه خواهد شد..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs leading-relaxed focus:bg-white focus:border-rose-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-200">
                  <label className="block text-xs font-black text-indigo-950 mb-1">
                    مبلغ هدف کل پروژه (تومان):
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    value={formTargetAmountTomans}
                    onChange={(e) => setFormTargetAmountTomans(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-xl text-xs font-mono font-black text-center text-indigo-900"
                    required
                  />
                  <div className="text-[10px] text-indigo-700 mt-1 text-center font-bold font-mono">
                    {formatTomans(formTargetAmountTomans)}
                  </div>
                </div>

                <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200">
                  <label className="block text-xs font-black text-emerald-950 mb-1">
                    مبلغ محقق‌شده تاکنون (تومان):
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={formRaisedAmountTomans}
                    onChange={(e) => setFormRaisedAmountTomans(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono font-black text-center text-emerald-900"
                    required
                  />
                  <div className="text-[10px] text-emerald-700 mt-1 text-center font-bold font-mono">
                    {formatTomans(formRaisedAmountTomans)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    تعداد حامیان و مشارکت‌کنندگان:
                  </label>
                  <input
                    type="number"
                    value={formTotalContributors}
                    onChange={(e) => setFormTotalContributors(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-800 mb-1">
                    برچسب / نشان افتخار:
                  </label>
                  <input
                    type="text"
                    value={formBadge}
                    onChange={(e) => setFormBadge(e.target.value)}
                    placeholder="مثال: پروژه شاخص شهروندی"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                    required
                  />
                </div>
              </div>

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
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ذخیره مشخصات و مبلغ هدف</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

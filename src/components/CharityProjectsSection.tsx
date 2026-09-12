import React from 'react';
import { HeartHandshake, CheckCircle2, Sparkles, Trophy, Users, ArrowLeft } from 'lucide-react';
import { CharityProject } from '../types';
import { CHARITY_PROJECTS } from '../data/cities';
import { toPersianDigits, formatTomans } from '../utils/persian';

interface CharityProjectsSectionProps {
  projects?: CharityProject[];
  onSelectProjectForRecycle?: (projectId: string) => void;
}

export const CharityProjectsSection: React.FC<CharityProjectsSectionProps> = ({
  projects = CHARITY_PROJECTS,
  onSelectProjectForRecycle
}) => {
  const displayProjects = projects && projects.length > 0 ? projects : CHARITY_PROJECTS;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900">
              پروژه‌های نیکوکاری و مسئولیت اجتماعی
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              تبدیل مستقیم پسماند خشک به امکانات شهری (تجهیز پارک‌ها، مدارس و محیط زیست)
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-extrabold bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" />
          <span>۲ برابر شانس قرعه‌کشی</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {displayProjects.map((project) => (
          <div
            key={project.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-rose-300 p-4 transition flex flex-col justify-between group shadow-2xs"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] bg-white text-rose-700 border border-rose-200 font-extrabold px-2 py-0.5 rounded-full">
                  {project.badge}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  {project.cityName}
                </span>
              </div>

              <h4 className="font-black text-xs text-slate-900 leading-snug group-hover:text-rose-700 transition">
                {project.title}
              </h4>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed line-clamp-2">
                {project.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 space-y-2">
              {/* Progress bar */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1">
                  <span>پیشرفت پروژه</span>
                  <span className="text-rose-700 font-black">{toPersianDigits(project.progressPercent)}٪</span>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{toPersianDigits(project.totalContributors)} مشارکت‌کننده</span>
                </span>
                <span className="font-bold text-slate-700">
                  {formatTomans(project.raisedAmountTomans)}
                </span>
              </div>

              {onSelectProjectForRecycle && (
                <button
                  type="button"
                  onClick={() => onSelectProjectForRecycle(project.id)}
                  className="w-full mt-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 text-[11px] font-extrabold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>اهدا به این طرح</span>
                  <ArrowLeft className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

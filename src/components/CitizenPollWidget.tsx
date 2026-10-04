import React, { useState, useEffect } from 'react';
import { 
  Vote, 
  CheckCircle2, 
  BarChart2, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Layers,
  Headphones,
  Check
} from 'lucide-react';
import { CitizenPoll, CityId } from '../types';
import { INITIAL_POLLS } from '../data/cities';
import { toPersianDigits } from '../utils/persian';
import { logAppEvent } from '../utils/eventLogger';

interface CitizenPollWidgetProps {
  currentCity: CityId;
  polls?: CitizenPoll[];
  userId?: string;
  userName?: string;
  onVoteSuccess?: () => void;
  onOpenFeedbackModal?: () => void;
}

export const CitizenPollWidget: React.FC<CitizenPollWidgetProps> = ({
  currentCity,
  polls = INITIAL_POLLS,
  userId = 'guest-user',
  userName = 'شهروند پاکینو',
  onVoteSuccess,
  onOpenFeedbackModal
}) => {
  const [allPolls, setAllPolls] = useState<CitizenPoll[]>(() => {
    const saved = localStorage.getItem('pakino_citizen_polls');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return polls;
  });

  const [activePollIndex, setActivePollIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentPoll = allPolls[activePollIndex] || allPolls[0];
  const nextPollIndex = (activePollIndex + 1) % allPolls.length;
  const nextPoll = allPolls[nextPollIndex];

  useEffect(() => {
    if (!currentPoll) return;
    const votedKey = `pakino_voted_poll_${currentPoll.id}_${userId}`;
    const alreadyVoted = localStorage.getItem(votedKey) === 'true';
    setHasVoted(alreadyVoted || (currentPoll.votedUserIds || []).includes(userId));
    setSelectedOptionId(null);
  }, [currentPoll, userId]);

  if (!currentPoll) return null;

  const handleVote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOptionId || hasVoted) return;

    setIsSubmitting(true);

    const updatedOptions = currentPoll.options.map((opt) =>
      opt.id === selectedOptionId ? { ...opt, votesCount: opt.votesCount + 1 } : opt
    );
    const updatedPoll: CitizenPoll = {
      ...currentPoll,
      options: updatedOptions,
      totalVotes: currentPoll.totalVotes + 1,
      votedUserIds: [...(currentPoll.votedUserIds || []), userId]
    };

    const updatedPollsList = allPolls.map((p) => (p.id === updatedPoll.id ? updatedPoll : p));
    setAllPolls(updatedPollsList);
    localStorage.setItem('pakino_citizen_polls', JSON.stringify(updatedPollsList));
    localStorage.setItem(`pakino_voted_poll_${currentPoll.id}_${userId}`, 'true');

    logAppEvent({
      eventType: 'citizen_feedback_submitted',
      actorId: userId,
      actorRole: 'citizen',
      actorName: userName,
      entityId: currentPoll.id,
      entityType: 'feedback',
      cityId: currentCity,
      cityName: currentCity === 'noorabad' ? 'نورآباد ممسنی' : 'کازرون',
      details: {
        pollTitle: currentPoll.title,
        chosenOption: currentPoll.options.find(o => o.id === selectedOptionId)?.text,
        totalVotesNow: updatedPoll.totalVotes
      }
    });

    setIsSubmitting(false);
    setHasVoted(true);
    if (onVoteSuccess) onVoteSuccess();
  };

  const isPollVoted = (pollId: string) => {
    const votedKey = `pakino_voted_poll_${pollId}_${userId}`;
    return localStorage.getItem(votedKey) === 'true' || (allPolls.find(p => p.id === pollId)?.votedUserIds || []).includes(userId);
  };

  return (
    <div className="relative pt-3 pb-2 select-none">
      {/* Visual Stacked Deck Layer 2 (Bottommost card layer behind) */}
      {allPolls.length > 2 && (
        <div className="absolute inset-x-4 top-0 h-16 bg-violet-900/10 rounded-3xl border border-violet-300/30 transform -translate-y-1.5 scale-[0.94] -z-20 shadow-xs" />
      )}

      {/* Visual Stacked Deck Layer 1 (Direct card layer behind with title peek) */}
      {allPolls.length > 1 && (
        <div 
          onClick={() => setActivePollIndex(nextPollIndex)}
          className="absolute inset-x-2 top-1.5 h-16 bg-gradient-to-r from-violet-100 to-indigo-100 rounded-3xl border border-violet-200/90 transform -translate-y-1 scale-[0.97] -z-10 shadow-xs cursor-pointer flex items-start justify-between px-5 pt-1.5 text-[10px] font-bold text-violet-900 hover:brightness-95 transition"
          title="مشاهده نظرسنجی بعدی"
        >
          <span className="flex items-center gap-1.5 opacity-90 truncate max-w-[75%]">
            <Layers className="w-3 h-3 text-violet-600 shrink-0" />
            <span className="font-extrabold text-violet-950">نظرسنجی بعدی:</span>
            <span className="truncate">{nextPoll?.title}</span>
          </span>
          <span className="text-violet-600 font-black shrink-0 flex items-center gap-0.5">
            <span>ورق زدن</span>
            <ChevronLeft className="w-3 h-3" />
          </span>
        </div>
      )}

      {/* Main Front Poll Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-violet-200 shadow-md space-y-3.5 relative z-10">
        
        {/* Header with Poll Badge & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-violet-500/30">
              <Vote className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-slate-900 block">
                  نظرسنجی و مشارکت شهروندی
                </span>
                {allPolls.length > 1 && (
                  <span className="text-[10px] bg-violet-100 text-violet-800 font-extrabold px-2 py-0.5 rounded-full border border-violet-200">
                    مورد {toPersianDigits(activePollIndex + 1)} از {toPersianDigits(allPolls.length)}
                  </span>
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium">
                صدای شما در ارتقای کیفیت خدمات مدیریت شهری پاکینو
              </span>
            </div>
          </div>

          {/* Quick Tab Selector for All Polls */}
          {allPolls.length > 1 && (
            <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl self-start sm:self-auto overflow-x-auto">
              {allPolls.map((poll, i) => {
                const isSelected = activePollIndex === i;
                const voted = isPollVoted(poll.id);
                return (
                  <button
                    key={poll.id}
                    type="button"
                    onClick={() => setActivePollIndex(i)}
                    className={`py-1 px-2.5 rounded-xl text-[11px] font-black transition flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <span>نظرسنجی {toPersianDigits(i + 1)}</span>
                    {voted && (
                      <Check className={`w-3 h-3 ${isSelected ? 'text-violet-200' : 'text-emerald-600'}`} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Poll Title & Description */}
        <div className="bg-violet-50/50 p-3 rounded-2xl border border-violet-100/80">
          <h4 className="font-black text-xs sm:text-sm text-slate-900 leading-snug">
            {currentPoll.title}
          </h4>
          {currentPoll.description && (
            <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
              {currentPoll.description}
            </p>
          )}
        </div>

        {/* Poll Options Form / Results */}
        {!hasVoted ? (
          <form onSubmit={handleVote} className="space-y-2">
            {currentPoll.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <label
                  key={opt.id}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between text-xs cursor-pointer ${
                    isSelected
                      ? 'bg-violet-50 border-violet-500 text-violet-950 font-black ring-2 ring-violet-200 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100/80 font-bold'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name={`poll-${currentPoll.id}`}
                      value={opt.id}
                      checked={isSelected}
                      onChange={() => setSelectedOptionId(opt.id)}
                      className="w-4 h-4 text-violet-600 focus:ring-violet-500 cursor-pointer"
                    />
                    <span>{opt.text}</span>
                  </div>
                </label>
              );
            })}

            <button
              type="submit"
              disabled={!selectedOptionId || isSubmitting}
              className="w-full mt-2 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Vote className="w-3.5 h-3.5" />
              <span>ثبت رای در این نظرسنجی</span>
            </button>
          </form>
        ) : (
          <div className="space-y-2.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-bold text-violet-700 bg-violet-50 p-2.5 rounded-xl border border-violet-100">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>رای شما در این نظرسنجی ثبت شد. نتایج زنده آرا:</span>
              </span>
              <span className="font-mono font-black">{toPersianDigits(currentPoll.totalVotes)} رای ثبت‌شده</span>
            </div>

            <div className="space-y-2">
              {currentPoll.options.map((opt) => {
                const percent = currentPoll.totalVotes > 0 
                  ? Math.round((opt.votesCount / currentPoll.totalVotes) * 100) 
                  : 0;
                return (
                  <div key={opt.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-800 text-[11px]">{opt.text}</span>
                      <span className="text-violet-900 font-mono font-black text-[11px]">
                        {toPersianDigits(percent)}٪ ({toPersianDigits(opt.votesCount)} رای)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Multi-Poll Navigation Footer & Support Shortcut */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          {/* Previous / Next Poll Buttons */}
          {allPolls.length > 1 ? (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setActivePollIndex((prev) => (prev - 1 + allPolls.length) % allPolls.length)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
                <span>نظرسنجی قبلی</span>
              </button>

              <button
                type="button"
                onClick={() => setActivePollIndex((prev) => (prev + 1) % allPolls.length)}
                className="flex-1 sm:flex-none px-3 py-1.5 rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-900 font-black text-[11px] transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>نظرسنجی بعدی ({toPersianDigits(nextPollIndex + 1)})</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 font-bold">
              مشارکت شما در بهبود شهر سپاسگزاریم
            </div>
          )}

          {/* Ticket / Feedback Modal Link */}
          {onOpenFeedbackModal && (
            <button
              type="button"
              onClick={onOpenFeedbackModal}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-extrabold flex items-center gap-1 self-end sm:self-auto cursor-pointer hover:underline"
            >
              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
              <span>ثبت تیکت، انتقاد و پیشنهاد به پشتیبانی</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

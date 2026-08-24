import React, { useState } from 'react';
import { 
  Sparkles, 
  Youtube, 
  Instagram, 
  CheckCircle2, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Target, 
  Zap,
  TrendingUp,
  Layers
} from 'lucide-react';
import { SeoScoreResult } from '../utils/seoScorer';

interface SeoScoreCardProps {
  scoreData: SeoScoreResult;
  compact?: boolean;
  onOpenBasket?: () => void;
}

export const SeoScoreCard: React.FC<SeoScoreCardProps> = ({
  scoreData,
  compact = false,
  onOpenBasket,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);

  const {
    totalScore,
    youtubeScore,
    instagramScore,
    grade,
    gradeLabel,
    layerStatus,
    strengths,
    recommendations,
    youtubeCharCount,
    instagramTagCount
  } = scoreData;

  // Determine progress stroke color based on score
  const getScoreColorClass = (score: number) => {
    if (score >= 80) return 'text-emerald-500 stroke-emerald-500';
    if (score >= 60) return 'text-indigo-500 stroke-indigo-500';
    if (score >= 40) return 'text-amber-500 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const getScoreBgClass = (score: number) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-indigo-600 dark:bg-indigo-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  // Compact inline badge view
  if (compact) {
    return (
      <button
        onClick={onOpenBasket}
        className="group inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 shadow-2xs transition-all text-left"
        title="Voir l'analyse détaillée du score SEO"
      >
        <div className="relative flex items-center justify-center">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-white ${getScoreBgClass(totalScore)} shadow-2xs`}>
            {totalScore}
          </div>
        </div>

        <div className="leading-tight">
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-100">
              Score SEO
            </span>
            <span className={`text-[10px] font-extrabold px-1 rounded ${totalScore >= 80 ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
              {grade}
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            YT: {youtubeScore}/100 • IG: {instagramScore}/100
          </p>
        </div>
      </button>
    );
  }

  // Full detailed card
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3 transition-colors">
      
      {/* Header with Circular Score and Summary */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Circular Progress Gauge */}
          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
            <svg className="w-12 h-12 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`transition-all duration-500 ${getScoreColorClass(totalScore)}`}
                strokeDasharray={`${totalScore}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-black text-slate-900 dark:text-white leading-none">
                {totalScore}
              </span>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                /100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Score SEO Global</span>
              </h3>
              <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                totalScore >= 80 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
                  : totalScore >= 60 
                  ? 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' 
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
              }`}>
                Rang {grade}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
              {gradeLabel}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(prev => !prev)}
          className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isExpanded ? "Réduire les détails" : "Développer les détails"}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Dual Platform Sub-Scores */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        {/* YouTube Sub-Score */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Youtube className="w-3.5 h-3.5 text-rose-500" />
              <span>YouTube</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
              {youtubeScore}/100
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${youtubeScore >= 80 ? 'bg-emerald-500' : youtubeScore >= 60 ? 'bg-indigo-600' : 'bg-amber-500'}`}
              style={{ width: `${youtubeScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {youtubeCharCount}/500 car. utilisés
          </p>
        </div>

        {/* Instagram Sub-Score */}
        <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-pink-500" />
              <span>Instagram</span>
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
              {instagramScore}/100
            </span>
          </div>
          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${instagramScore >= 80 ? 'bg-emerald-500' : instagramScore >= 60 ? 'bg-pink-600' : 'bg-amber-500'}`}
              style={{ width: `${instagramScore}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            {instagramTagCount}/30 hashtags ciblés
          </p>
        </div>
      </div>

      {/* Expanded Analysis Details */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          
          {/* The 4 Architectural Layers Check */}
          <div>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1.5">
              Structure des 4 Piliers SEO :
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <div className={`p-1.5 rounded-md flex items-center gap-1.5 text-[11px] border ${
                layerStatus.hasIdentity 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {layerStatus.hasIdentity ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />}
                <span className="truncate">1. Identité Artiste / Titre</span>
              </div>

              <div className={`p-1.5 rounded-md flex items-center gap-1.5 text-[11px] border ${
                layerStatus.hasGenre 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {layerStatus.hasGenre ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />}
                <span className="truncate">2. Sous-Genre & Niche</span>
              </div>

              <div className={`p-1.5 rounded-md flex items-center gap-1.5 text-[11px] border ${
                layerStatus.hasMood 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {layerStatus.hasMood ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />}
                <span className="truncate">3. Ambiance & Prod 808</span>
              </div>

              <div className={`p-1.5 rounded-md flex items-center gap-1.5 text-[11px] border ${
                layerStatus.hasFormat 
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-medium'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}>
                {layerStatus.hasFormat ? <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" /> : <AlertCircle className="w-3 h-3 text-slate-400 shrink-0" />}
                <span className="truncate">4. Format (Clip / Audio)</span>
              </div>
            </div>
          </div>

          {/* Recommendations to reach 100/100 */}
          {recommendations.length > 0 && (
            <div className="p-2.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 space-y-1.5">
              <span className="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                Conseils pour atteindre 100/100 :
              </span>
              <ul className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                {recommendations.slice(0, 3).map((rec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Strengths identified */}
          {strengths.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Points forts de votre sélection :
              </span>
              <div className="flex flex-wrap gap-1">
                {strengths.map((str, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                  >
                    ✓ {str}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

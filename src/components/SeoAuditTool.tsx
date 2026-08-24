import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Youtube, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Copy, 
  Plus, 
  Check, 
  ArrowRight, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Target,
  RefreshCw,
  Eye,
  FileText,
  Tag as TagIcon
} from 'lucide-react';
import { SeoAuditResult } from '../types';

interface SeoAuditToolProps {
  onAddTags: (tags: string[]) => void;
  onCopySuccess: (text: string, title: string) => void;
  onOpenBasket: () => void;
  currentBasketTags?: string[];
  initialArtist?: string;
  initialTrack?: string;
}

export const SeoAuditTool: React.FC<SeoAuditToolProps> = ({
  onAddTags,
  onCopySuccess,
  onOpenBasket,
  currentBasketTags = [],
  initialArtist = '',
  initialTrack = '',
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [customTags, setCustomTags] = useState<string>('');
  const [useBasketTags, setUseBasketTags] = useState<boolean>(true);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<SeoAuditResult | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, key: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onCopySuccess(text, label);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunAudit = async () => {
    if (!youtubeUrl.trim() && !customTitle.trim() && currentBasketTags.length === 0 && !customTags.trim()) {
      alert("Veuillez saisir une URL YouTube ou au moins un titre / des tags pour lancer l'audit.");
      return;
    }

    setIsLoading(true);
    try {
      const tagsToSend = useBasketTags && currentBasketTags.length > 0
        ? currentBasketTags
        : customTags.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);

      const res = await fetch('/api/audit-seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: youtubeUrl.trim() || undefined,
          title: customTitle.trim() || undefined,
          description: customDescription.trim() || undefined,
          tags: tagsToSend,
          artistName: initialArtist || undefined,
          trackName: initialTrack || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur (${res.status})`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        setAuditResult(json.data);
      } else {
        throw new Error(json.error || "Impossible d'effectuer l'audit");
      }
    } catch (err: any) {
      console.error("Erreur audit SEO:", err);
      alert("Erreur lors de l'audit SEO : " + (err?.message || "Veuillez réessayer."));
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    if (score >= 70) return 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800';
    return 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
  };

  return (
    <div id="seo-audit-tool-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Auditeur SEO Vidéo & Son IA</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
                Gemini 2026 Engine
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Collez un lien YouTube ou testez votre configuration pour obtenir une note sur 100 et des recommandations sur mesure.
            </p>
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Youtube className="w-4 h-4 text-red-600" />
            <span>Lien de la Vidéo YouTube (Clip, Visualizer, Son, Type Beat)</span>
          </label>
          <div className="relative">
            <input
              id="seo-audit-youtube-url-input"
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
              className="w-full pl-9 pr-28 py-2.5 rounded-lg text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            
            <button
              onClick={handleRunAudit}
              disabled={isLoading}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Auditer</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Toggle Advanced Inputs */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>{isAdvancedOpen ? '− Masquer les paramètres manuels' : '+ Renseigner ou modifier manuellement Titre, Description & Tags'}</span>
          </button>
        </div>

        {isAdvancedOpen && (
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Titre de la vidéo (ou prévision)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Ex: Artiste - Morceau (Clip Officiel)"
                className="w-full px-3 py-2 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Description de la vidéo
              </label>
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                rows={3}
                placeholder="Collez le texte de description, liens streaming, crédits..."
                className="w-full px-3 py-2 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                  Tags à tester
                </label>
                {currentBasketTags.length > 0 && (
                  <label className="flex items-center gap-1.5 text-[11px] text-indigo-600 dark:text-indigo-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={useBasketTags}
                      onChange={(e) => setUseBasketTags(e.target.checked)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Utiliser les {currentBasketTags.length} tags du panier</span>
                  </label>
                )}
              </div>

              {(!useBasketTags || currentBasketTags.length === 0) && (
                <textarea
                  value={customTags}
                  onChange={(e) => setCustomTags(e.target.value)}
                  rows={2}
                  placeholder="Collez vos tags séparés par des virgules..."
                  className="w-full px-3 py-2 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results View */}
      {auditResult && (
        <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
          {/* Main Score Hero */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white border border-indigo-900/50 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 border border-white/20 flex flex-col items-center justify-center shrink-0">
                  <span className="text-2xl sm:text-3xl font-black text-emerald-400 leading-none">
                    {auditResult.overallScore}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300 mt-0.5">/100</span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      Grade {auditResult.grade}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">Audit Terminé</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-white leading-tight">
                    {auditResult.verdict}
                  </h4>
                  {auditResult.analyzedVideoInfo && (
                    <p className="text-xs text-slate-300 truncate max-w-md">
                      📺 {auditResult.analyzedVideoInfo.title}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => onAddTags(auditResult.optimizedSuggestions.recommendedTags)}
                  className="px-3.5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Injecter les Tags 100/100 au Panier</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Sub-Scores Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {(Object.entries(auditResult.subScores) as [string, { score: number; maxScore: number; label: string; feedback: string }][]).map(([key, sub]) => (
              <div key={key} className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{sub.label}</span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {sub.score}/{sub.maxScore}
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 dark:bg-indigo-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${(sub.score / sub.maxScore) * 100}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3">
                  {sub.feedback}
                </p>
              </div>
            ))}
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
              <h5 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Points Forts Détectés</span>
              </h5>
              <ul className="space-y-1.5">
                {auditResult.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                    <span className="text-emerald-500 mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Weaknesses */}
            <div className="p-4 rounded-lg bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-2">
              <h5 className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Points d&apos;Amélioration Prioritaires</span>
              </h5>
              <ul className="space-y-1.5">
                {auditResult.criticalWeaknesses.map((weak, idx) => (
                  <li key={idx} className="text-xs text-rose-800 dark:text-rose-300 flex items-start gap-1.5">
                    <span className="text-rose-500 mt-0.5">•</span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Missing Keywords & Suggestions */}
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 space-y-3">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Mots-clés Manquants à Fort Volume de Recherche (Cliquez pour ajouter)</span>
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {auditResult.missingKeywords.map((kw, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onAddTags([kw]);
                    onCopySuccess(kw, 'Mot-clé ajouté');
                  }}
                  className="px-2.5 py-1 rounded-md text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>{kw}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Optimized Output Kit */}
          <div className="p-4 sm:p-5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/60 space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Kit Prêt-à-Coller 100% Optimisé par l&apos;IA</span>
              </h5>
            </div>

            <div className="space-y-3">
              {/* Title */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Titre Recommandé (CTR Max)</span>
                  <button
                    onClick={() => handleCopy(auditResult.optimizedSuggestions.recommendedTitle, 'opt-title', 'Titre copié')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'opt-title' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copier</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {auditResult.optimizedSuggestions.recommendedTitle}
                </p>
              </div>

              {/* Description */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">Description Optimisée (avec liens & crédits)</span>
                  <button
                    onClick={() => handleCopy(auditResult.optimizedSuggestions.recommendedDescription, 'opt-desc', 'Description copiée')}
                    className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                  >
                    {copiedKey === 'opt-desc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>Copier</span>
                  </button>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line font-mono text-[11px] leading-relaxed max-h-28 overflow-y-auto">
                  {auditResult.optimizedSuggestions.recommendedDescription}
                </p>
              </div>

              {/* Tags */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold">
                    Set de Tags 100/100 ({auditResult.optimizedSuggestions.recommendedTags.length} tags • {auditResult.optimizedSuggestions.recommendedTags.join(', ').length} car.)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddTags(auditResult.optimizedSuggestions.recommendedTags)}
                      className="px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold flex items-center gap-1 hover:bg-indigo-200"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Ajouter au Panier</span>
                    </button>
                    <button
                      onClick={() => handleCopy(auditResult.optimizedSuggestions.recommendedTags.join(', '), 'opt-tags', 'Tags copiés')}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      {copiedKey === 'opt-tags' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copier</span>
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-mono">
                  {auditResult.optimizedSuggestions.recommendedTags.join(', ')}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

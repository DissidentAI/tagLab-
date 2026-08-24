import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp,
  Sparkles,
  Search,
  BookOpen,
  Award,
  BarChart3
} from 'lucide-react';
import { SEO_GUIDELINES } from '../data/masterTags';
import { SeoScoreEvolutionChart } from './SeoScoreEvolutionChart';
import { SeoAuditTool } from './SeoAuditTool';
import { calculateSeoScore } from '../utils/seoScorer';

interface SeoGuideViewProps {
  onGoToLibrary: () => void;
  onGoToPacks: () => void;
  selectedTags?: string[];
  artistName?: string;
  trackName?: string;
  onAddTags?: (tags: string[]) => void;
  onCopySuccess?: (text: string, title: string) => void;
  onOpenBasket?: () => void;
}

export const SeoGuideView: React.FC<SeoGuideViewProps> = ({
  onGoToLibrary,
  onGoToPacks,
  selectedTags = [],
  artistName = '',
  trackName = '',
  onAddTags = () => {},
  onCopySuccess = () => {},
  onOpenBasket = () => {},
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'audit' | 'rules'>('analytics');

  // Calculate current score metrics for the Recharts graph
  const currentSeo = calculateSeoScore(selectedTags, artistName, trackName);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Centre SEO & Algorithmes YouTube 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Analyse SEO, Graphique d&apos;Évolution & Auditeur IA
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Surveillez la progression de votre score SEO global avec le graphique Recharts interactif, auditez n&apos;importe quelle vidéo YouTube par IA et appliquez la stratégie des 3 couches.
            </p>
          </div>

          {/* Quick Sub-Tabs Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700/80 shrink-0 self-start md:self-center">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'analytics'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Graphique Recharts</span>
            </button>

            <button
              onClick={() => setActiveSubTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'audit'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Audit Vidéo IA</span>
            </button>

            <button
              onClick={() => setActiveSubTab('rules')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeSubTab === 'rules'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guide & 3 Couches</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: RECHARTS EVOLUTION GRAPH */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SeoScoreEvolutionChart
            currentScore={currentSeo.totalScore}
            currentTagCount={selectedTags.length}
            currentCharCount={currentSeo.youtubeCharCount}
            artistName={artistName}
            trackName={trackName}
            layer1Count={currentSeo.layerStatus.hasIdentity ? 4 : 0}
            layer2Count={currentSeo.layerStatus.hasGenre ? 8 : 0}
            layer3Count={currentSeo.layerStatus.hasMood ? 6 : 0}
          />

          {/* Quick Shortcuts to other actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveSubTab('audit')}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Search className="w-4 h-4" />
                </span>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Tester <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Auditer une Vidéo YouTube Existante
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Collez l&apos;URL d&apos;un clip ou d&apos;un type beat pour obtenir son score SEO /100 et des conseils IA.
              </p>
            </div>

            <div 
              onClick={() => setActiveSubTab('rules')}
              className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-800 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Consulter <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                Maîtriser la Règle d&apos;Or des 3 Couches
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Apprenez à équilibrer Identité Artiste, Sous-genres Niche et Ambiance/Format.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AI VIDEO & AUDIO SEO AUDIT TOOL */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <SeoAuditTool
            onAddTags={onAddTags}
            onCopySuccess={onCopySuccess}
            onOpenBasket={onOpenBasket}
            currentBasketTags={selectedTags}
            initialArtist={artistName}
            initialTrack={trackName}
          />
        </div>
      )}

      {/* VIEW 3: STRATEGIC 3-LAYER RULES & CHECKLIST */}
      {activeSubTab === 'rules' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* The 3-Layers Strategy Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 sm:p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center gap-2.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                  La Règle d&apos;Or des 3 Couches (Structure 100/100)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Pour chaque sortie, composez votre sélection en mixant impérativement ces 3 niveaux :
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Couche 1 : Identité</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Nom d&apos;artiste, titre exact, nom d&apos;artiste + rap, officiel, visualizer. Permet à YouTube d&apos;associer vos clips entre eux.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">2</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Couche 2 : Genre Précis</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sous-genre exact : Plug français, Pluggnb 2026, Dark Trap, Rage New Wave, Cloud Rap. Oriente vers l&apos;audience niche exacte.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5">
                <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">3</span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Couche 3 : Ambiance / Format</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Ambiance nocturne, night drive, 808 basse, autotune, rap mélancolique, nouveau son 2026, clip officiel, lyrics.
                </p>
              </div>
            </div>
          </div>

          {/* Core Rules Checklist */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {SEO_GUIDELINES.map((guide, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-start gap-3 shadow-sm transition-colors"
              >
                <div className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">{guide.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{guide.text}</p>
                </div>
              </div>
            ))}

            {/* Anti-Spam Warning */}
            <div className="bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200 mb-1">
                  Piège à éviter : Spam d&apos;artistes majeurs
                </h4>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  Ne mettez pas &quot;Gazo, Ninho, Jul, Travis Scott&quot; sur un son pluggnb. Les auditeurs quittent en 5 secondes, la rétention s&apos;effondre et l&apos;algorithme coupe les recommandations.
                </p>
              </div>
            </div>

            {/* Thumbnail & Title Truth */}
            <div className="bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
              <div className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400">
                <Eye className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-200 mb-1">
                  Hiérarchie de la Viralité
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  1. <strong>Miniature & Titre</strong> (génèrent le clic) &gt; 2. <strong>Qualité du son & Rétention</strong> (génèrent la recommandation) &gt; 3. <strong>Tags SEO</strong> (aident la catégorisation initiale).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Navigation Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onGoToPacks}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <span>Découvrir les 6 Packs Clés en Main</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onGoToLibrary}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs cursor-pointer"
            >
              <span>Explorer les 549 Tags de la Bibliothèque</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

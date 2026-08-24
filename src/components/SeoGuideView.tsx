import React from 'react';
import { 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  Flame, 
  Eye, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { SEO_GUIDELINES } from '../data/masterTags';

interface SeoGuideViewProps {
  onGoToLibrary: () => void;
  onGoToPacks: () => void;
}

export const SeoGuideView: React.FC<SeoGuideViewProps> = ({
  onGoToLibrary,
  onGoToPacks,
}) => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative rounded-xl bg-white p-6 border border-slate-200 shadow-sm overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Guide Officiel SEO YouTube & Algorithmes 2026</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Conseils d'Utilisation & Stratégie Algorithmique
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Ce fichier est une <strong>BIBLIOTHÈQUE</strong>. Ne collez pas 549 tags d'un coup dans une seule vidéo. Apprenez à composer la sélection idéale en 3 couches.
          </p>
        </div>
      </div>

      {/* The 3-Layers Strategy Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
          <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              La Règle d'Or des 3 Couches
            </h3>
            <p className="text-xs text-slate-500">
              Pour chaque sortie, composez votre liste de tags en mixant impérativement ces 3 niveaux :
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="text-sm font-bold text-slate-900">Couche 1 : Identité</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Nom d'artiste, titre exact du morceau, nom d'artiste + rap, officiel, visualizer. Permet à YouTube de lier vos morceaux entre eux.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="text-sm font-bold text-slate-900">Couche 2 : Genre Précis</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sous-genre exact : Plug français, Pluggnb 2026, Dark Trap, Rage New Wave, Cloud Rap. Oriente l'algorithme vers l'audience niche exacte.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-cyan-600 text-white font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="text-sm font-bold text-slate-900">Couche 3 : Ambiance / Format</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
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
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 shadow-sm"
          >
            <div className="mt-0.5 shrink-0 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{guide.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{guide.text}</p>
            </div>
          </div>
        ))}

        {/* Anti-Spam Warning */}
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
          <div className="mt-0.5 shrink-0 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-rose-900 mb-1">
              Piège à éviter : Spam d'artistes majeurs
            </h4>
            <p className="text-xs text-rose-700 leading-relaxed">
              Ne mettez pas "Gazo, Ninho, Jul, Travis Scott" sur un son pluggnb. Les auditeurs quittent la vidéo en 5 secondes, votre taux de rétention s'effondre et YouTube arrête de recommander le son.
            </p>
          </div>
        </div>

        {/* Thumbnail & Title Truth */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex items-start gap-3 shadow-2xs">
          <div className="mt-0.5 shrink-0 text-amber-600">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-amber-900 mb-1">
              Hiérarchie de la Viralité
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              1. <strong>Miniature & Titre</strong> (génèrent le clic) &gt; 2. <strong>Qualité du son & Rétention</strong> (génèrent la recommandation) &gt; 3. <strong>Tags SEO</strong> (aident la catégorisation initiale).
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <button
          onClick={onGoToPacks}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <span>Découvrir les 6 Packs Clés en Main</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          onClick={onGoToLibrary}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 shadow-2xs"
        >
          <span>Explorer les 549 Tags de la Bibliothèque</span>
        </button>
      </div>
    </div>
  );
};
